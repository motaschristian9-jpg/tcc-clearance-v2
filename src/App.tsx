import React, { useState, useEffect } from 'react';
import { StudentScreen } from '@/types/student';
import { SignInCard } from '@/components/student/SignInCard';
import { ConsentCard } from '@/components/student/ConsentCard';
import { StudentDetailsCard } from '@/components/student/StudentDetailsCard';
import { PhotoCaptureCard } from '@/components/student/PhotoCaptureCard';
import { RegisteredStudentCard } from '@/components/student/RegisteredStudentCard';
import {
  getSupabase,
  signOutUser,
  fetchStudentProfile,
  saveStudentProfileToSupabase,
  User,
} from '@/lib/supabase';

export const App: React.FC = () => {
  // Current active screen in student flow
  const [currentScreen, setCurrentScreen] = useState<StudentScreen>('signin');
  const [authUser, setAuthUser] = useState<User | null>(null);

  // Student Profile State
  const [fullName, setFullName] = useState<string>('');
  const [schoolId, setSchoolId] = useState<string>('');
  const [department, setDepartment] = useState<string>('CIT');
  const [yearLevel, setYearLevel] = useState<string>('3');
  const [section, setSection] = useState<string>('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

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
      setFullName(profile.full_name || '');
      setSchoolId(profile.school_id_no || '');
      setDepartment(profile.department_id || 'CIT');
      setSection(profile.section_id || '');
      setPhotoDataUrl(profile.photo_path || null);
      setCurrentScreen('registered');
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

  const handleSignOut = async () => {
    await signOutUser();
    setAuthUser(null);
    resetFormState();
    setCurrentScreen('signin');
  };

  const resetFormState = () => {
    setFullName('');
    setSchoolId('');
    setDepartment('CIT');
    setYearLevel('3');
    setSection('');
    setPhotoDataUrl(null);
  };

  const handleCompleteRegistration = async () => {
    if (authUser) {
      // Persist student profile in Supabase students table
      await saveStudentProfileToSupabase({
        profile_id: authUser.id,
        school_id_no: schoolId,
        full_name: fullName,
        department_id: department,
        section_id: section,
        photo_path: photoDataUrl || '',
      });
    }
    setCurrentScreen('registered');
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center">
        {currentScreen === 'signin' && <SignInCard />}

        {currentScreen === 'consent' && (
          <ConsentCard
            onAgree={() => setCurrentScreen('details')}
            onCancel={handleSignOut}
          />
        )}

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

        {currentScreen === 'photo' && (
          <PhotoCaptureCard
            photoDataUrl={photoDataUrl}
            onPhotoCaptured={setPhotoDataUrl}
            onRetake={() => setPhotoDataUrl(null)}
            onNext={handleCompleteRegistration}
            onBack={() => setCurrentScreen('details')}
          />
        )}

        {currentScreen === 'registered' && (
          <RegisteredStudentCard
            userEmail={authUser?.email || 'student@tcc.edu.ph'}
            fullName={fullName}
            schoolId={schoolId}
            department={department}
            section={section}
            photoDataUrl={photoDataUrl}
            onSignOut={handleSignOut}
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
