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
import { ShieldCheck, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const App: React.FC = () => {
  // Current active screen in student flow
  const [currentScreen, setCurrentScreen] = useState<StudentScreen>('signin');
  const [authUser, setAuthUser] = useState<User | null>(null);

  // Sign out confirmation dialog state
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  // Responsive QR Pass Dialog/Drawer state
  const [showPassModal, setShowPassModal] = useState(false);

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

  // Intramurals Attendance Records for Clearance Card Matrix (starts fresh)
  const [attendanceRecords] = useState<DayAttendance[]>([
    { day: 'Day 1', date: 'Nov 10', slots: {}, cleared: false },
    { day: 'Day 2', date: 'Nov 11', slots: {}, cleared: false },
    { day: 'Day 3', date: 'Nov 12', slots: {}, cleared: false },
    { day: 'Day 4', date: 'Nov 13', slots: {}, cleared: false },
    { day: 'Day 5', date: 'Nov 14', slots: {}, cleared: false },
  ]);

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

  return (
    <div
      data-vaul-drawer-wrapper=""
      className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-primary-foreground"
    >
      {/* Full-Width Global Header */}
      <header className="w-full border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg border border-foreground/20 flex items-center justify-center text-xs font-bold tracking-wider text-foreground bg-muted/30">
              TCC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight text-foreground">
                  Event Clearance System
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                  <ShieldCheck className="size-3 text-emerald-600" />
                  Official
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                Tagoloan Community College · Student Portal
              </p>
            </div>
          </div>

          {/* Student Status & Quick Actions */}
          {authUser && currentScreen !== 'signin' && (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-medium text-foreground truncate max-w-[180px]">
                  {fullName || 'Student'}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {department} · {section || '3A'}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSignOutDialog(true)}
                className="h-8 text-xs gap-1.5 cursor-pointer"
              >
                <LogOut className="size-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Full-Width Responsive Workspace */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col justify-start">
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
          <span>CIT Event Attendance & Clearance Management Platform</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
