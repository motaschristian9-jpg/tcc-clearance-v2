import React, { useState, useEffect } from 'react';
import { StudentScreen } from '@/types/student';
import { DayAttendance } from '@/types/attendance';
import { SignInCard } from '@/components/student/SignInCard';
import { OtpVerificationCard } from '@/components/student/OtpVerificationCard';
import { ConsentCard } from '@/components/student/ConsentCard';
import { StudentDetailsCard } from '@/components/student/StudentDetailsCard';
import { PhotoCaptureCard } from '@/components/student/PhotoCaptureCard';
import { StudentDashboard } from '@/components/student/StudentDashboard';
import { StudentPassCard } from '@/components/student/StudentPassCard';
import { StudentPassResponsiveModal } from '@/components/student/StudentPassResponsiveModal';
import { ClearanceMatrixCard } from '@/components/student/ClearanceMatrixCard';
import { EditProfileDialog } from '@/components/student/EditProfileDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
  getSupabase,
  signOutUser,
  fetchStudentProfile,
  saveStudentProfileToSupabase,
  uploadStudentPhoto,
  checkDeviceAuthorization,
  rebindStudentDevice,
  getOrCreateDeviceId,
  logAccountLogin,
  User,
} from '@/lib/supabase';
import { ShieldCheck, LogOut, User as UserIcon, QrCode, FileText, Lock } from 'lucide-react';
import { SboSignInCard } from '@/components/officer/SboSignInCard';
import { SboTerminalScreen } from '@/components/officer/SboTerminalScreen';
import {
  EventDay,
  TimeSlotType,
  SboOfficerSession,
  ScannedStudentPayload,
} from '@/types/attendance';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

// Helper to detect hidden SBO portal route from hash, query param, or pathname
const checkIsSboRoute = () => {
  if (typeof window === 'undefined') return false;
  const hash = window.location.hash.toLowerCase();
  const search = window.location.search.toLowerCase();
  const pathname = window.location.pathname.toLowerCase();
  return (
    hash === '#sbo' ||
    hash === '#officer' ||
    hash === '#terminal' ||
    search.includes('portal=sbo') ||
    search.includes('role=officer') ||
    pathname.endsWith('/sbo')
  );
};

export const App: React.FC = () => {
  // Current active screen in student flow
  const [currentScreen, setCurrentScreen] = useState<StudentScreen>('signin');
  const [authUser, setAuthUser] = useState<User | null>(null);

  // Hidden SBO Officer Portal state
  const [isSboPortal, setIsSboPortal] = useState<boolean>(() => checkIsSboRoute());
  const [sboOfficer, setSboOfficer] = useState<SboOfficerSession | null>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('TCC_SBO_OFFICER');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  // Secret Easter Egg Click Counter (3 quick clicks on TCC logo activates SBO portal)
  const [secretClicks, setSecretClicks] = useState<number>(0);
  const handleSecretTrigger = () => {
    const next = secretClicks + 1;
    if (next >= 3) {
      window.location.hash = '#sbo';
      setIsSboPortal(true);
      setSecretClicks(0);
      toast.success('SBO Officer Portal Gateway Detected');
    } else {
      setSecretClicks(next);
      setTimeout(() => setSecretClicks(0), 1200);
    }
  };

  // Listen to hash changes & officer hotkey (Ctrl + Shift + O)
  useEffect(() => {
    const handleHash = () => setIsSboPortal(checkIsSboRoute());
    window.addEventListener('hashchange', handleHash);

    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'O' || e.key === 'o')) {
        e.preventDefault();
        if (isSboPortal) {
          window.location.hash = '';
          setIsSboPortal(false);
          toast.info('Switched to Student Portal');
        } else {
          window.location.hash = '#sbo';
          setIsSboPortal(true);
          toast.success('SBO Officer Portal Unlocked');
        }
      }
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('hashchange', handleHash);
      window.removeEventListener('keydown', handleKey);
    };
  }, [isSboPortal]);

  // Sign out confirmation dialog state
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  // Responsive QR Pass Dialog/Drawer state
  const [showPassModal, setShowPassModal] = useState(false);

  // Edit Profile Dialog state
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  // Student Profile State
  const [studentDbId, setStudentDbId] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>('');
  const [schoolId, setSchoolId] = useState<string>('');
  const [department, setDepartment] = useState<string>('CIT');
  const [yearLevel, setYearLevel] = useState<string>('3');
  const [section, setSection] = useState<string>('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  // Dynamic Pass countdown (accurate 30s synchronized rollover)
  const [passCountdown, setPassCountdown] = useState<number>(() => {
    return 30 - (Math.floor(Date.now() / 1000) % 30);
  });

  useEffect(() => {
    const updateCountdown = () => {
      const remaining = 30 - (Math.floor(Date.now() / 1000) % 30);
      setPassCountdown(remaining);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Intramurals Attendance Records for Clearance Card Matrix (persisted across sessions)
  const [attendanceRecords, setAttendanceRecords] = useState<DayAttendance[]>(() => {
    try {
      const saved = localStorage.getItem('TCC_ATTENDANCE_RECORDS');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      { day: 'Day 1', date: 'Nov 10', slots: {}, cleared: false },
      { day: 'Day 2', date: 'Nov 11', slots: {}, cleared: false },
      { day: 'Day 3', date: 'Nov 12', slots: {}, cleared: false },
      { day: 'Day 4', date: 'Nov 13', slots: {}, cleared: false },
      { day: 'Day 5', date: 'Nov 14', slots: {}, cleared: false },
    ];
  });

  // SBO Officer attendance stamping handler with officer signatory audit
  const handleOfficerApproveAttendance = async (
    day: EventDay,
    slot: TimeSlotType,
    officer: SboOfficerSession,
    _scannedStudent?: ScannedStudentPayload
  ) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setAttendanceRecords((prev) => {
      const updated = prev.map((rec) => {
        if (rec.day === day) {
          const newSlots = { ...rec.slots, [slot]: timeStr };
          const newOfficers = {
            ...(rec.slotOfficers || {}),
            [slot]: {
              time: timeStr,
              officerName: officer.name,
              officerPosition: officer.position,
              department: officer.department,
              stationCode: officer.stationCode,
            },
          };
          const allFour =
            newSlots['morning-in'] &&
            newSlots['morning-out'] &&
            newSlots['afternoon-in'] &&
            newSlots['afternoon-out'];
          return {
            ...rec,
            slots: newSlots,
            slotOfficers: newOfficers,
            cleared: !!allFour,
          };
        }
        return rec;
      });
      try {
        localStorage.setItem('TCC_ATTENDANCE_RECORDS', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Save attendance stamp to Supabase with officer audit
    const supabase = getSupabase();
    if (supabase && studentDbId) {
      try {
        await supabase.from('attendance').insert({
          student_id: studentDbId,
          method: 'qr',
          status: 'valid',
          scanned_at: new Date().toISOString(),
          serial_no: `${officer.department}-${officer.stationCode}-${Date.now().toString(36).toUpperCase()}`,
        });
      } catch (err) {
        console.warn('Attendance sync note:', err);
      }
    }
  };

  // Listen to Supabase Authentication & Session
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    // Check existing authenticated session on load / redirect back from Google OAuth
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthUser(session.user);
        handleUserAuthenticated(session.user);
      }
    });

    // Real-time listener for Auth changes (OAuth redirect callback, Sign in, Sign out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setAuthUser(session.user);
        await handleUserAuthenticated(session.user);
      } else if (event === 'SIGNED_OUT') {
        setAuthUser(null);
        setCurrentScreen('signin');
        resetFormState();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleUserAuthenticated = async (user: User) => {
    const profile = await fetchStudentProfile(user.id);

    if (profile) {
      setStudentDbId(profile.id);
      setFullName(profile.full_name || '');
      setSchoolId(profile.school_id_no || '');
      setDepartment(profile.department_id || 'CIT');
      setSection(profile.section_id || '');
      setPhotoDataUrl(profile.photo_path || null);

      const { isAuthorized } = await checkDeviceAuthorization(profile.id);
      if (!isAuthorized) {
        logAccountLogin({
          profileId: user.id,
          email: user.email || '',
          deviceId: getOrCreateDeviceId(),
          status: 'device_mismatch',
        });
        setCurrentScreen('otp');
      } else {
        logAccountLogin({
          profileId: user.id,
          email: user.email || '',
          deviceId: getOrCreateDeviceId(),
          status: 'success',
        });
        setCurrentScreen('dashboard');
      }
    } else {
      const googleFullName =
        (user.user_metadata?.full_name as string) ||
        (user.user_metadata?.name as string) ||
        '';
      if (googleFullName) {
        setFullName(googleFullName);
      }
      logAccountLogin({
        profileId: user.id,
        email: user.email || '',
        deviceId: getOrCreateDeviceId(),
        status: 'success',
      });
      setCurrentScreen('consent');
    }
  };

  const handleOtpVerified = async () => {
    if (studentDbId) {
      await rebindStudentDevice(studentDbId);
    }
    if (authUser) {
      logAccountLogin({
        profileId: authUser.id,
        email: authUser.email || '',
        deviceId: getOrCreateDeviceId(),
        loginType: 'otp_verified',
        status: 'success',
      });
    }
    setCurrentScreen('dashboard');
  };

  const handleConfirmSignOut = async () => {
    setShowSignOutDialog(false);
    await signOutUser();
    setAuthUser(null);
    resetFormState();
    setCurrentScreen('signin');
    toast.info('Signed out', {
      description: 'You have been signed out of your clearance session.',
    });
  };

  const resetFormState = () => {
    setStudentDbId(null);
    setFullName('');
    setSchoolId('');
    setDepartment('CIT');
    setYearLevel('3');
    setSection('');
    setPhotoDataUrl(null);
  };

  const handleCompleteRegistration = async () => {
    if (authUser) {
      let finalPhotoPath = photoDataUrl;
      if (photoDataUrl && photoDataUrl.startsWith('data:')) {
        finalPhotoPath = await uploadStudentPhoto(authUser.id, photoDataUrl);
      }

      const saved = await saveStudentProfileToSupabase({
        profile_id: authUser.id,
        email: authUser.email || '',
        school_id_no: schoolId,
        full_name: fullName,
        department_id: department,
        section_id: section,
        photo_path: finalPhotoPath || '',
      });

      if (saved?.id) {
        setStudentDbId(saved.id);
      }
    }
    setCurrentScreen('dashboard');
  };

  const handleSaveProfile = async (updated: {
    fullName: string;
    schoolId: string;
    department: string;
    yearLevel: string;
    section: string;
    photoDataUrl: string | null;
  }) => {
    setFullName(updated.fullName);
    setSchoolId(updated.schoolId);
    setDepartment(updated.department);
    setYearLevel(updated.yearLevel);
    setSection(updated.section);
    if (updated.photoDataUrl) {
      setPhotoDataUrl(updated.photoDataUrl);
    }

    if (authUser) {
      let finalPhotoPath = '';
      if (updated.photoDataUrl && updated.photoDataUrl.startsWith('data:')) {
        const uploaded = await uploadStudentPhoto(authUser.id, updated.photoDataUrl);
        if (uploaded) finalPhotoPath = uploaded;
      }

      await saveStudentProfileToSupabase({
        profile_id: authUser.id,
        email: authUser.email || '',
        school_id_no: updated.schoolId,
        full_name: updated.fullName,
        department_id: updated.department,
        section_id: updated.section,
        photo_path: finalPhotoPath || undefined,
      });

      toast.success('Profile updated successfully', {
        description: 'Your student details have been saved to your clearance record.',
      });
    }
  };

  return (
    <div
      data-vaul-drawer-wrapper=""
      className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-primary-foreground"
    >
      {/* Full-Width Global Header */}
      <header className="w-full border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSecretTrigger}
              className="size-9 rounded-lg border border-foreground/20 flex items-center justify-center text-xs font-bold tracking-wider text-foreground bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer select-none"
              title="Tagoloan Community College"
              aria-label="TCC Logo"
            >
              TCC
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight text-foreground">
                  {isSboPortal ? 'SBO Officer Gate Terminal' : 'Event Clearance System'}
                </span>
                {isSboPortal ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                    <Lock className="size-2.5" />
                    Restricted
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                    <ShieldCheck className="size-3 text-emerald-600" />
                    Official
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                {isSboPortal
                  ? 'Authorized Personnel Only · Gate Clearance Terminal'
                  : 'Tagoloan Community College · Student Portal'}
              </p>
            </div>
          </div>

          {/* SBO Terminal Active Station Badge or Student Profile Dropdown */}
          {isSboPortal ? (
            sboOfficer ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-muted border border-border text-foreground">
                  {sboOfficer.stationCode}
                </span>
              </div>
            ) : null
          ) : (
            /* Student Status & User Avatar Dropdown Menu */
            authUser && currentScreen !== 'signin' && (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-medium text-foreground truncate max-w-[180px]">
                    {fullName || 'Student'}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {department} · {section || '3A'}
                  </span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="relative rounded-full ring-offset-background transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:opacity-90 active:scale-95 cursor-pointer"
                      aria-label="Student profile menu"
                    >
                      <Avatar className="size-9 border border-border shadow-xs">
                        <AvatarImage
                          src={photoDataUrl || authUser.user_metadata?.avatar_url || ''}
                          alt={fullName || 'Student'}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                          {fullName ? fullName.charAt(0).toUpperCase() : 'T'}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-1.5">
                    <DropdownMenuLabel className="font-normal p-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-xs font-semibold leading-none text-foreground truncate">
                          {fullName || 'Student'}
                        </p>
                        <p className="text-[11px] leading-none text-muted-foreground truncate">
                          {authUser.email}
                        </p>
                        <p className="text-[10px] font-mono text-muted-foreground pt-0.5">
                          {department} · ID: {schoolId || '---'}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setShowEditProfileModal(true)}>
                      <UserIcon className="size-4 mr-2" />
                      <span>Edit Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowPassModal(true)}>
                      <QrCode className="size-4 mr-2" />
                      <span>My Attendance Pass</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentScreen('activity-card')}>
                      <FileText className="size-4 mr-2" />
                      <span>Clearance Cards</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowSignOutDialog(true)}
                      className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                      <LogOut className="size-4 mr-2" />
                      <span>Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )
          )}
        </div>
      </header>

      {/* Main Full-Width Responsive Workspace */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col justify-start">
        {isSboPortal ? (
          sboOfficer ? (
            <SboTerminalScreen
              officer={sboOfficer}
              currentStudent={{
                fullName: fullName || 'Christian Orlan Motas',
                schoolId: schoolId || '2023-01048',
                department: department || 'CIT',
                section: section || '3A',
                photoDataUrl,
              }}
              onApproveAttendance={handleOfficerApproveAttendance}
              onLockTerminal={() => {
                setSboOfficer(null);
                localStorage.removeItem('TCC_SBO_OFFICER');
                toast.info('Terminal Locked', {
                  description: 'SBO session locked for security.',
                });
              }}
              onReleaseTerminal={() => {
                if (sboOfficer) {
                  try {
                    const raw = localStorage.getItem('TCC_SBO_ACTIVE_ACCOUNTS');
                    if (raw) {
                      const accs = JSON.parse(raw);
                      delete accs[sboOfficer.stationCode];
                      localStorage.setItem('TCC_SBO_ACTIVE_ACCOUNTS', JSON.stringify(accs));
                    }
                  } catch {}
                }
                setSboOfficer(null);
                localStorage.removeItem('TCC_SBO_OFFICER');
                toast.info('Shift Ended', {
                  description: `${sboOfficer?.stationCode || 'Station'} has been released and marked Available.`,
                });
              }}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center py-6">
              <SboSignInCard
                onOfficerAuthenticated={(officer) => {
                  setSboOfficer(officer);
                  localStorage.setItem('TCC_SBO_OFFICER', JSON.stringify(officer));
                }}
              />
            </div>
          )
        ) : (
          <>
            {/* Sign In Screen */}
            {currentScreen === 'signin' && (
              <div className="flex-1 flex items-center justify-center py-6">
                <SignInCard />
              </div>
            )}

            {/* Device Transfer OTP Screen */}
            {currentScreen === 'otp' && (
              <div className="flex-1 flex items-center justify-center py-6">
                <OtpVerificationCard
                  userEmail={authUser?.email || 'your Google account'}
                  onVerified={handleOtpVerified}
                  onCancel={() => setShowSignOutDialog(true)}
                />
              </div>
            )}

            {/* Onboarding Step 1: Privacy Consent */}
            {currentScreen === 'consent' && (
              <div className="flex-1 flex items-center justify-center py-6">
                <ConsentCard
                  onAgree={() => setCurrentScreen('details')}
                  onCancel={() => setShowSignOutDialog(true)}
                />
              </div>
            )}

            {/* Onboarding Step 2: Student Details Form */}
            {currentScreen === 'details' && (
              <div className="flex-1 flex items-center justify-center py-6">
                <StudentDetailsCard
                  fullName={fullName}
                  setFullName={setFullName}
                  schoolId={schoolId}
                  setSchoolId={setSchoolId}
                  department={department}
                  setDepartment={setDepartment}
                  yearLevel={yearLevel}
                  setYearLevel={setYearLevel}
                  section={section}
                  setSection={setSection}
                  onNext={() => setCurrentScreen('photo')}
                  onBack={() => setCurrentScreen('consent')}
                />
              </div>
            )}

            {/* Onboarding Step 3: Face Photo Capture */}
            {currentScreen === 'photo' && (
              <div className="flex-1 flex items-center justify-center py-6">
                <PhotoCaptureCard
                  photoDataUrl={photoDataUrl}
                  onPhotoCaptured={setPhotoDataUrl}
                  onRetake={() => setPhotoDataUrl(null)}
                  onNext={handleCompleteRegistration}
                  onBack={() => setCurrentScreen('details')}
                />
              </div>
            )}

            {/* Student Dashboard: Takes Advantage of the Whole Screen! */}
            {currentScreen === 'dashboard' && (
              <StudentDashboard
                fullName={fullName || 'Student'}
                schoolId={schoolId || '---'}
                department={department || 'CIT'}
                section={section || '---'}
                photoDataUrl={photoDataUrl}
                userEmail={authUser?.email || 'student@tcc.edu.ph'}
                attendanceRecords={attendanceRecords}
                onOpenQrPass={() => setShowPassModal(true)}
                onViewActivityCard={(_id) => setCurrentScreen('activity-card')}
                onSignOut={() => setShowSignOutDialog(true)}
                onEditProfile={() => setShowEditProfileModal(true)}
              />
            )}

            {/* Dynamic Rotating QR Pass Modal/Screen */}
            {currentScreen === 'pass' && (
              <div className="flex-1 flex items-center justify-center py-4">
                <StudentPassCard
                  fullName={fullName || 'Student'}
                  schoolId={schoolId || '---'}
                  department={department || 'CIT'}
                  section={section || '---'}
                  passCountdown={passCountdown}
                  onViewActivityCard={() => setCurrentScreen('activity-card')}
                  onBackToDashboard={() => setCurrentScreen('dashboard')}
                />
              </div>
            )}

            {/* 5-Day Event Clearance Matrix Card (Full Screen Responsive Matrix) */}
            {currentScreen === 'activity-card' && (
              <ClearanceMatrixCard
                fullName={fullName || 'Student'}
                schoolId={schoolId || '---'}
                section={section || '---'}
                attendanceRecords={attendanceRecords}
                onBack={() => setCurrentScreen('dashboard')}
              />
            )}
          </>
        )}
      </main>

      {/* Responsive QR Pass: Dialog on Desktop, Drawer on Mobile */}
      <StudentPassResponsiveModal
        open={showPassModal}
        onOpenChange={setShowPassModal}
        fullName={fullName || 'Student'}
        schoolId={schoolId || '---'}
        department={department || 'CIT'}
        section={section || '---'}
        passCountdown={passCountdown}
        onViewActivityCard={() => {
          setShowPassModal(false);
          setCurrentScreen('activity-card');
        }}
      />

      {/* Edit Student Profile Dialog */}
      <EditProfileDialog
        open={showEditProfileModal}
        onOpenChange={setShowEditProfileModal}
        fullName={fullName}
        schoolId={schoolId}
        department={department}
        yearLevel={yearLevel}
        section={section}
        photoDataUrl={photoDataUrl}
        onSave={handleSaveProfile}
      />

      {/* Global Sign Out Confirmation Alert Dialog */}
      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out of your account?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be signed out of your TCC Clearance session on this device. You can sign back in anytime with your Google account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSignOut}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Global Full-Width Footer */}
      <footer className="w-full border-t border-border bg-card/30 mt-auto">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <span>Tagoloan Community College · Baluarte, Tagoloan, Misamis Oriental</span>
          <span
            onDoubleClick={() => {
              window.location.hash = '#sbo';
              setIsSboPortal(true);
              toast.success('SBO Gateway Opened');
            }}
            className="cursor-default select-none hover:text-foreground/70 transition-colors"
            title="CIT Clearance Management"
          >
            CIT Event Attendance & Clearance Management Platform
          </span>
        </div>
      </footer>

      {/* Modern Sonner Toast Notification Center */}
      <Toaster position="top-center" richColors closeButton />
    </div>
  );
};

export default App;
