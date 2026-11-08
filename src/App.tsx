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
import { ClearanceMatrixCard } from '@/components/student/ClearanceMatrixCard';
import {
  getSupabase,
  signOutUser,
  fetchStudentProfile,
  saveStudentProfileToSupabase,
  uploadStudentPhoto,
  checkDeviceAuthorization,
  rebindStudentDevice,
  User,
} from '@/lib/supabase';

export const App: React.FC = () => {
  // Current active screen in student flow
  const [currentScreen, setCurrentScreen] = useState<StudentScreen>('signin');
  const [authUser, setAuthUser] = useState<User | null>(null);

  // Student Profile State
  const [studentDbId, setStudentDbId] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string>('');
  const [schoolId, setSchoolId] = useState<string>('');
  const [department, setDepartment] = useState<string>('CIT');
  const [yearLevel, setYearLevel] = useState<string>('3');
  const [section, setSection] = useState<string>('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  // Dynamic Pass countdown (30s window - AC6)
  const [passCountdown, setPassCountdown] = useState<number>(30);

  useEffect(() => {
    if (currentScreen === 'pass') {
      const interval = setInterval(() => {
        setPassCountdown((prev) => (prev <= 1 ? 30 : prev - 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentScreen]);

  // Intramurals Attendance Records for Clearance Card Matrix
  const [attendanceRecords] = useState<DayAttendance[]>([
    {
      day: 'Day 1',
      date: 'Nov 10',
      slots: {
        'morning-in': '07:54 AM',
        'morning-out': '11:45 AM',
        'afternoon-in': '01:10 PM',
        'afternoon-out': '05:02 PM',
      },
      cleared: true,
    },
    {
      day: 'Day 2',
      date: 'Nov 11',
      slots: {
        'morning-in': '08:02 AM',
        'morning-out': '11:50 AM',
      },
      cleared: false,
    },
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
    // Check if the student has already registered in Supabase
    const profile = await fetchStudentProfile(user.id);

    if (profile) {
      // Existing registered student
      setStudentDbId(profile.id);
      setFullName(profile.full_name || '');
      setSchoolId(profile.school_id_no || '');
      setDepartment(profile.department_id || 'CIT');
      setSection(profile.section_id || '');
      setPhotoDataUrl(profile.photo_path || null);

      // Verify One Account, One Device policy (AC5)
      const { isAuthorized } = await checkDeviceAuthorization(profile.id);
      if (!isAuthorized) {
        // Different / new device detected -> require OTP authorization
        setCurrentScreen('otp');
      } else {
        setCurrentScreen('dashboard');
      }
    } else {
      // First-time Google user -> proceed to Onboarding Step 1 (Consent)
      const googleFullName =
        (user.user_metadata?.full_name as string) ||
        (user.user_metadata?.name as string) ||
        '';
      if (googleFullName) {
        setFullName(googleFullName);
      }
      setCurrentScreen('consent');
    }
  };

  const handleOtpVerified = async () => {
    if (studentDbId) {
      await rebindStudentDevice(studentDbId);
    }
    setCurrentScreen('dashboard');
  };

  const handleSignOut = async () => {
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
      // Optional photo upload to Supabase storage bucket
      let finalPhotoPath = photoDataUrl;
      if (photoDataUrl && photoDataUrl.startsWith('data:')) {
        finalPhotoPath = await uploadStudentPhoto(authUser.id, photoDataUrl);
      }

      // Persist student profile in Supabase students table
      const saved = await saveStudentProfileToSupabase({
        profile_id: authUser.id,
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
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-6 sm:p-10 selection:bg-primary selection:text-primary-foreground font-sans">
      {/* Clean Top Header */}
      <header className="max-w-sm mx-auto w-full flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-md border border-foreground/20 flex items-center justify-center text-[11px] font-bold tracking-wider text-foreground">
            TCC
          </div>
          <span className="text-xs font-semibold tracking-tight text-foreground">
            Clearance System
          </span>
        </div>
        <span className="text-[11px] text-muted-foreground font-normal">
          Tagoloan Community College
        </span>
      </header>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col justify-center">
        {/* Sign In Screen */}
        {currentScreen === 'signin' && <SignInCard />}

        {/* Device Transfer OTP Screen */}
        {currentScreen === 'otp' && (
          <OtpVerificationCard
            userEmail={authUser?.email || 'your Google account'}
            onVerified={handleOtpVerified}
            onCancel={handleSignOut}
          />
        )}

        {/* Onboarding Step 1: Privacy Consent */}
        {currentScreen === 'consent' && (
          <ConsentCard
            onAgree={() => setCurrentScreen('details')}
            onCancel={handleSignOut}
          />
        )}

        {/* Onboarding Step 2: Student Details Form */}
        {currentScreen === 'details' && (
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
        )}

        {/* Onboarding Step 3: Face Photo Capture */}
        {currentScreen === 'photo' && (
          <PhotoCaptureCard
            photoDataUrl={photoDataUrl}
            onPhotoCaptured={setPhotoDataUrl}
            onRetake={() => setPhotoDataUrl(null)}
            onNext={handleCompleteRegistration}
            onBack={() => setCurrentScreen('details')}
          />
        )}

        {/* Student Dashboard: Activities, Clearance Cards & QR Generator */}
        {currentScreen === 'dashboard' && (
          <StudentDashboard
            fullName={fullName || 'Alexander M. Cruz'}
            schoolId={schoolId || '20241373'}
            department={department || 'CIT'}
            section={section || '3A'}
            photoDataUrl={photoDataUrl}
            userEmail={authUser?.email || 'student@tcc.edu.ph'}
            onOpenQrPass={() => setCurrentScreen('pass')}
            onViewActivityCard={(_id) => setCurrentScreen('activity-card')}
            onSignOut={handleSignOut}
          />
        )}

        {/* Dynamic Rotating QR Pass Modal/Screen */}
        {currentScreen === 'pass' && (
          <StudentPassCard
            fullName={fullName || 'Alexander M. Cruz'}
            schoolId={schoolId || '20241373'}
            department={department || 'CIT'}
            section={section || '3A'}
            passCountdown={passCountdown}
            onViewActivityCard={() => setCurrentScreen('activity-card')}
            onBackToDashboard={() => setCurrentScreen('dashboard')}
          />
        )}

        {/* 5-Day Event Clearance Matrix Card */}
        {currentScreen === 'activity-card' && (
          <ClearanceMatrixCard
            fullName={fullName || 'Alexander M. Cruz'}
            schoolId={schoolId || '20241373'}
            section={section || '3A'}
            attendanceRecords={attendanceRecords}
            onBack={() => setCurrentScreen('dashboard')}
          />
        )}
      </div>

      {/* Minimal Footer */}
      <footer className="max-w-sm mx-auto w-full text-center pt-4">
        <p className="text-[11px] text-muted-foreground font-normal">
          Tagoloan Community College · CIT Event Attendance & Clearance
        </p>
      </footer>
    </div>
  );
};

export default App;
