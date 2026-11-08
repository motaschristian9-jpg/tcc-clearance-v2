import React, { useState, useEffect } from 'react';
import { StudentScreen, LoginScenario } from '@/types/student';
import { EventDay, TimeSlotType, DayAttendance } from '@/types/attendance';
import { SignInCard } from '@/components/student/SignInCard';
import { OtpVerificationCard } from '@/components/student/OtpVerificationCard';
import { ConsentCard } from '@/components/student/ConsentCard';
import { StudentDetailsCard } from '@/components/student/StudentDetailsCard';
import { PhotoCaptureCard } from '@/components/student/PhotoCaptureCard';
import { StudentPassCard } from '@/components/student/StudentPassCard';
import { ClearanceMatrixCard } from '@/components/student/ClearanceMatrixCard';
import { OfficerScannerCard } from '@/components/officer/OfficerScannerCard';

export const App: React.FC = () => {
  // Role switcher: Student vs SBO Officer Scanner
  const [activeRole, setActiveRole] = useState<'student' | 'officer'>('student');

  // Student Flow Navigation
  const [currentScreen, setCurrentScreen] = useState<StudentScreen>('signin');
  const [loginScenario, setLoginScenario] = useState<LoginScenario>('new');

  // Student Profile State (starts empty for new registration)
  const [fullName, setFullName] = useState<string>('');
  const [schoolId, setSchoolId] = useState<string>('');
  const [department, setDepartment] = useState<string>('CIT');
  const [yearLevel, setYearLevel] = useState<string>('3');
  const [section, setSection] = useState<string>('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  // Intramurals Attendance Records (Synced across Student Card & Officer Scanner)
  const [attendanceRecords, setAttendanceRecords] = useState<DayAttendance[]>([
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

  const handleScenarioChange = (scenario: LoginScenario) => {
    setLoginScenario(scenario);
    if (scenario === 'new') {
      setFullName('');
      setSchoolId('');
      setSection('');
      setPhotoDataUrl(null);
    } else {
      setFullName('Alexander M. Cruz');
      setSchoolId('20241373');
      setSection('3A');
    }
  };

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

  // SBO Officer Stamp Approval Action
  const handleApproveAttendance = (day: EventDay, slot: TimeSlotType) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setAttendanceRecords((prev) =>
      prev.map((item) => {
        if (item.day === day) {
          const updatedSlots = { ...item.slots, [slot]: timeStr };
          const allCleared =
            !!updatedSlots['morning-in'] &&
            !!updatedSlots['morning-out'] &&
            !!updatedSlots['afternoon-in'] &&
            !!updatedSlots['afternoon-out'];
          return {
            ...item,
            slots: updatedSlots,
            cleared: allCleared,
          };
        }
        return item;
      })
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-6 sm:p-10 selection:bg-primary selection:text-primary-foreground font-sans">
      {/* Top Header with Role Switcher */}
      <header className="max-w-sm mx-auto w-full flex flex-col gap-3 pb-3">
        <div className="flex items-center justify-between">
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
        </div>

        {/* Minimal Role Switcher: Student vs Officer Scanner */}
        <div className="flex items-center justify-center p-0.5 rounded-lg border border-border bg-muted/20">
          <button
            type="button"
            onClick={() => setActiveRole('student')}
            className={`flex-1 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer text-center ${
              activeRole === 'student'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Student Pass
          </button>
          <button
            type="button"
            onClick={() => setActiveRole('officer')}
            className={`flex-1 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer text-center ${
              activeRole === 'officer'
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            SBO Officer Scanner
          </button>
        </div>
      </header>

      {/* Main Viewport: Officer vs Student */}
      {activeRole === 'officer' ? (
        <OfficerScannerCard
          currentStudent={{
            fullName: fullName || 'Alexander M. Cruz',
            schoolId: schoolId || '20241373',
            department: department || 'CIT',
            section: section || '3A',
            photoDataUrl,
          }}
          onApproveAttendance={handleApproveAttendance}
        />
      ) : (
        <>
          {/* Student Screen Sequence */}
          {currentScreen === 'signin' && (
            <SignInCard
              loginScenario={loginScenario}
              onScenarioChange={handleScenarioChange}
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
              onNext={() => setCurrentScreen('pass')}
              onBack={() => setCurrentScreen('details')}
            />
          )}

          {currentScreen === 'pass' && (
            <StudentPassCard
              fullName={fullName || 'Alexander M. Cruz'}
              schoolId={schoolId || '20241373'}
              department={department || 'CIT'}
              section={section || '3A'}
              passCountdown={passCountdown}
              onViewActivityCard={() => setCurrentScreen('activity-card')}
              onSignOut={() => setCurrentScreen('signin')}
            />
          )}

          {currentScreen === 'activity-card' && (
            <ClearanceMatrixCard
              fullName={fullName || 'Alexander M. Cruz'}
              schoolId={schoolId || '20241373'}
              section={section || '3A'}
              attendanceRecords={attendanceRecords}
              onBackToPass={() => setCurrentScreen('pass')}
            />
          )}
        </>
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
