import React, { useState, useEffect } from 'react';
import { StudentScreen, LoginScenario } from '@/types/student';
import { SignInCard } from '@/components/student/SignInCard';
import { OtpVerificationCard } from '@/components/student/OtpVerificationCard';
import { ConsentCard } from '@/components/student/ConsentCard';
import { StudentDetailsCard } from '@/components/student/StudentDetailsCard';
import { PhotoCaptureCard } from '@/components/student/PhotoCaptureCard';
import { WaitingApprovalCard } from '@/components/student/WaitingApprovalCard';
import { StudentPassCard } from '@/components/student/StudentPassCard';
import { ClearanceMatrixCard } from '@/components/student/ClearanceMatrixCard';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<StudentScreen>('signin');
  const [loginScenario, setLoginScenario] = useState<LoginScenario>('new');

  // Student Profile State
  const [fullName, setFullName] = useState<string>('Alexander M. Cruz');
  const [schoolId, setSchoolId] = useState<string>('2023-01842');
  const [department, setDepartment] = useState<string>('CIT');
  const [yearLevel, setYearLevel] = useState<string>('3');
  const [section, setSection] = useState<string>('3-A');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  // Dynamic Pass countdown (30s)
  const [passCountdown, setPassCountdown] = useState<number>(24);

  useEffect(() => {
    if (currentScreen === 'pass') {
      const interval = setInterval(() => {
        setPassCountdown((prev) => (prev <= 1 ? 30 : prev - 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentScreen]);

  const handleGoogleSignInContinue = () => {
    if (loginScenario === 'new') {
      setCurrentScreen('consent');
    } else if (loginScenario === 'same-device') {
      setCurrentScreen('pass');
    } else {
      setCurrentScreen('otp');
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-6 sm:p-10 selection:bg-primary selection:text-primary-foreground font-sans">
      {/* Top Header */}
      <header className="max-w-sm mx-auto w-full flex items-center justify-between pb-4">
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

      {/* Screen Sequence */}
      {currentScreen === 'signin' && (
        <SignInCard
          loginScenario={loginScenario}
          onScenarioChange={setLoginScenario}
          onContinue={handleGoogleSignInContinue}
        />
      )}

      {currentScreen === 'otp' && (
        <OtpVerificationCard
          userEmail="alexander.cruz@gmail.com"
          onVerified={() => setCurrentScreen('pass')}
          onCancel={() => setCurrentScreen('signin')}
        />
      )}

      {currentScreen === 'consent' && (
        <ConsentCard
          onAgree={() => setCurrentScreen('details')}
          onCancel={() => setCurrentScreen('signin')}
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
          onNext={() => setCurrentScreen('waiting')}
          onBack={() => setCurrentScreen('details')}
        />
      )}

      {currentScreen === 'waiting' && (
        <WaitingApprovalCard
          fullName={fullName}
          schoolId={schoolId}
          department={department}
          section={section}
          photoDataUrl={photoDataUrl}
          onApprove={() => setCurrentScreen('pass')}
          onBackToSignIn={() => {
            setPhotoDataUrl(null);
            setCurrentScreen('signin');
          }}
        />
      )}

      {currentScreen === 'pass' && (
        <StudentPassCard
          fullName={fullName}
          schoolId={schoolId}
          department={department}
          section={section}
          passCountdown={passCountdown}
          onViewActivityCard={() => setCurrentScreen('activity-card')}
          onSignOut={() => setCurrentScreen('signin')}
        />
      )}

      {currentScreen === 'activity-card' && (
        <ClearanceMatrixCard
          fullName={fullName}
          schoolId={schoolId}
          section={section}
          onBackToPass={() => setCurrentScreen('pass')}
        />
      )}

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

