import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Camera, RefreshCw, Check, Clock, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  // Screen sequence: 'signin' -> 'consent' -> 'details' -> 'photo' -> 'waiting'
  const [currentScreen, setCurrentScreen] = useState<'signin' | 'consent' | 'details' | 'photo' | 'waiting'>('signin');

  // Form State
  const [fullName, setFullName] = useState<string>('Alexander M. Cruz');
  const [schoolId, setSchoolId] = useState<string>('2023-01842');
  const [department, setDepartment] = useState<string>('CIT');
  const [yearLevel, setYearLevel] = useState<string>('3');
  const [section, setSection] = useState<string>('3-A');

  // Photo State
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const departments = [
    { code: 'CIT', name: 'College of Information Technology' },
    { code: 'CBA', name: 'College of Business Administration' },
    { code: 'CED', name: 'College of Education' },
    { code: 'CCJPS', name: 'College of Criminal Justice & Public Safety' },
    { code: 'CHM', name: 'College of Hospitality Management' },
    { code: 'CAS', name: 'College of Arts and Sciences' },
    { code: 'COM', name: 'College of Maritime' },
    { code: 'CLIS', name: 'College of Library & Information Science' },
  ];

  // Camera initializer for Step 4
  useEffect(() => {
    let active = true;

    if (currentScreen === 'photo' && !photoDataUrl) {
      async function startCamera() {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user', // Front camera only per PRD AC1
              width: { ideal: 480 },
              height: { ideal: 480 },
            },
            audio: false,
          });

          if (!active) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }

          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setHasCameraPermission(true);
        } catch {
          setHasCameraPermission(false);
        }
      }

      startCamera();
    }

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [currentScreen, photoDataUrl]);

  // Capture frame from video to canvas
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const minDim = Math.min(video.videoWidth, video.videoHeight);
    const startX = (video.videoWidth - minDim) / 2;
    const startY = (video.videoHeight - minDim) / 2;

    ctx.translate(400, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, startX, startY, minDim, minDim, 0, 0, 400, 400);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPhotoDataUrl(dataUrl);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
  };

  // Development fallback snapshot if camera is unavailable
  const handleSimulatePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, 400, 400);
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(200, 160, 70, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(200, 340, 120, 0, Math.PI, true);
    ctx.fill();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPhotoDataUrl(dataUrl);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-6 sm:p-10 selection:bg-primary selection:text-primary-foreground">
      {/* Top Header - Understated branding */}
      <header className="max-w-md mx-auto w-full flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-md border border-foreground/20 flex items-center justify-center text-xs font-bold tracking-wider text-foreground">
            TCC
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Clearance System
          </span>
        </div>
        <span className="text-xs text-muted-foreground font-normal">
          Tagoloan Community College
        </span>
      </header>

      {/* SCREEN 1: SIGN IN WITH GMAIL */}
      {currentScreen === 'signin' && (
        <main className="max-w-md mx-auto w-full my-auto py-8">
          <Card className="border border-border shadow-sm">
            <CardHeader className="text-center pb-6">
              <span className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
                Student Registration · Step 1
              </span>
              <CardTitle className="text-2xl sm:text-3xl font-light tracking-tight mt-1 text-foreground">
                Sign in with Gmail
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground pt-1 max-w-xs mx-auto leading-relaxed">
                Register your device to access your TCC event attendance passes and digital clearance card.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentScreen('consent')}
                className="w-full h-12 text-sm font-medium border-border hover:border-foreground/40 gap-3"
              >
                <svg className="size-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </Button>

              <p className="text-[11px] text-center text-muted-foreground font-normal">
                Use your personal or institutional Gmail address.
              </p>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-2">
              <Separator />
              <p className="text-xs text-center text-muted-foreground font-normal">
                Baluarte, Tagoloan, Misamis Oriental
              </p>
            </CardFooter>
          </Card>
        </main>
      )}

      {/* SCREEN 2: DATA PRIVACY & CONSENT */}
      {currentScreen === 'consent' && (
        <main className="max-w-md mx-auto w-full my-auto py-8">
          <Card className="border border-border shadow-sm">
            <CardHeader className="text-center pb-5">
              <span className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
                Student Registration · Step 2
              </span>
              <CardTitle className="text-2xl sm:text-3xl font-light tracking-tight mt-1 text-foreground">
                Data Privacy & Consent
              </CardTitle>
              <CardDescription className="text-xs uppercase tracking-wider text-muted-foreground pt-0.5">
                Republic Act No. 10173
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              <div className="border border-border rounded-lg p-4 bg-muted/20 flex flex-col gap-3.5 text-left">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-foreground">
                    What we collect
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Your full name, school ID number, department, year level, section, and a live front-camera verification photo.
                  </p>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-foreground">
                    Why it is collected
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Exclusively for verifying event attendance, issuing digital clearance stamps, and preventing card forgery.
                  </p>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-foreground">
                    Data retention
                  </span>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Records are retained solely for the official academic semester clearance cycle and purged upon clearance archiving.
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 pt-2">
              <Button
                onClick={() => setCurrentScreen('details')}
                className="w-full h-11 text-sm font-medium"
              >
                I Agree & Continue
              </Button>

              <Button
                variant="ghost"
                onClick={() => setCurrentScreen('signin')}
                className="w-full h-9 text-xs text-muted-foreground hover:text-foreground"
              >
                Back to Sign In
              </Button>
            </CardFooter>
          </Card>
        </main>
      )}

      {/* SCREEN 3: STUDENT DETAILS */}
      {currentScreen === 'details' && (
        <main className="max-w-md mx-auto w-full my-auto py-8">
          <Card className="border border-border shadow-sm">
            <CardHeader className="text-center pb-5">
              <span className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
                Student Registration · Step 3
              </span>
              <CardTitle className="text-2xl sm:text-3xl font-light tracking-tight mt-1 text-foreground">
                Student Information
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground pt-0.5">
                A school ID can be registered to one device only.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Full Name (First, Middle, Last)
                </label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alexander M. Cruz"
                  className="h-10 text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  School ID Number
                </label>
                <Input
                  value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)}
                  placeholder="2023-01842"
                  className="h-10 text-sm font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  College / Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
                >
                  {departments.map((dept) => (
                    <option key={dept.code} value={dept.code}>
                      {dept.code} · {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Year Level
                  </label>
                  <select
                    value={yearLevel}
                    onChange={(e) => setYearLevel(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Section
                  </label>
                  <Input
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="3-A"
                    className="h-10 text-sm font-mono"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 pt-2">
              <Button
                onClick={() => setCurrentScreen('photo')}
                className="w-full h-11 text-sm font-medium"
              >
                Continue to Face Verification
              </Button>

              <Button
                variant="ghost"
                onClick={() => setCurrentScreen('consent')}
                className="w-full h-9 text-xs text-muted-foreground hover:text-foreground"
              >
                Back to Consent
              </Button>
            </CardFooter>
          </Card>
        </main>
      )}

      {/* SCREEN 4: LIVE PHOTO VERIFICATION */}
      {currentScreen === 'photo' && (
        <main className="max-w-md mx-auto w-full my-auto py-8">
          <Card className="border border-border shadow-sm">
            <CardHeader className="text-center pb-4">
              <span className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
                Student Registration · Step 4
              </span>
              <CardTitle className="text-2xl sm:text-3xl font-light tracking-tight mt-1 text-foreground">
                Live Face Check
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground pt-0.5">
                Center your face in the oval. Front camera stream only.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col items-center gap-6">
              {/* Circular / Oval Camera Frame */}
              <div className="relative size-56 sm:size-64 rounded-full overflow-hidden border-2 border-dashed border-border bg-muted/20 flex items-center justify-center">
                {photoDataUrl ? (
                  <img
                    src={photoDataUrl}
                    alt="Captured portrait"
                    className="w-full h-full object-cover"
                  />
                ) : hasCameraPermission ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    <div className="absolute inset-4 rounded-full border border-dashed border-white/60 pointer-events-none" />
                  </>
                ) : (
                  <div className="flex flex-col items-center text-center p-4 gap-2 text-muted-foreground">
                    <Camera className="size-8 text-muted-foreground/60" />
                    <span className="text-xs">Camera preview ready</span>
                    <button
                      type="button"
                      onClick={handleSimulatePhoto}
                      className="text-[11px] text-foreground underline underline-offset-4 mt-1 font-medium"
                    >
                      Use Demo Snapshot
                    </button>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-center text-muted-foreground max-w-xs">
                {photoDataUrl
                  ? 'Confirm that your face is centered and clearly recognizable.'
                  : 'Ensure you are in good lighting with no glare.'}
              </p>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 pt-2">
              {photoDataUrl ? (
                <>
                  <Button
                    onClick={() => setCurrentScreen('waiting')}
                    className="w-full h-11 text-sm font-medium gap-2"
                  >
                    <Check className="size-4" />
                    <span>Confirm & Submit Registration</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPhotoDataUrl(null)}
                    className="w-full h-9 text-xs gap-1.5"
                  >
                    <RefreshCw className="size-3.5" />
                    <span>Retake Photo</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={hasCameraPermission ? handleCapturePhoto : handleSimulatePhoto}
                    className="w-full h-11 text-sm font-medium gap-2"
                  >
                    <Camera className="size-4" />
                    <span>Capture Photo</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentScreen('details')}
                    className="w-full h-9 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Back to Student Details
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        </main>
      )}

      {/* SCREEN 5: WAITING FOR SBO APPROVAL */}
      {currentScreen === 'waiting' && (
        <main className="max-w-md mx-auto w-full my-auto py-8">
          <Card className="border border-border shadow-sm">
            <CardHeader className="text-center pb-4">
              <span className="text-[11px] font-medium tracking-widest uppercase text-amber-600 dark:text-amber-500">
                Pending Verification
              </span>
              <CardTitle className="text-2xl sm:text-3xl font-light tracking-tight mt-1 text-foreground">
                Waiting for Approval
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground pt-0.5">
                Submitted to {department} Student Body Organization
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col items-center gap-6">
              {/* Photo Thumbnail */}
              <div className="relative">
                <div className="size-24 rounded-full overflow-hidden border border-border bg-muted/40 flex items-center justify-center">
                  {photoDataUrl ? (
                    <img
                      src={photoDataUrl}
                      alt={fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-light text-muted-foreground">
                      {fullName.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1 rounded-full border-2 border-background">
                  <Clock className="size-3.5" />
                </div>
              </div>

              {/* Student Metadata */}
              <div className="text-center space-y-1">
                <h3 className="text-lg font-semibold text-foreground">
                  {fullName}
                </h3>
                <p className="text-xs font-mono text-muted-foreground">
                  {department} {yearLevel} · Section {section} · ID {schoolId}
                </p>
              </div>

              {/* Status Note Box */}
              <div className="border border-border rounded-lg p-4 bg-muted/20 text-left text-xs text-muted-foreground flex flex-col gap-2">
                <div className="flex items-center gap-2 text-foreground font-medium">
                  <ShieldCheck className="size-4 shrink-0" />
                  <span>On-Device Security Key Bound</span>
                </div>
                <p className="leading-relaxed pl-6">
                  Once an SBO officer verifies your face photo against the college enrollment roster, your rotating attendance pass will activate immediately.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setPhotoDataUrl(null);
                  setCurrentScreen('signin');
                }}
                className="w-full h-10 text-xs text-muted-foreground hover:text-foreground"
              >
                Back to Start / Register Another Device
              </Button>
            </CardFooter>
          </Card>
        </main>
      )}

      {/* Quiet Footer */}
      <footer className="max-w-md mx-auto w-full text-center pt-4">
        <p className="text-[11px] text-muted-foreground font-normal">
          Compliant with RA 10173 (Data Privacy Act of 2012)
        </p>
      </footer>
    </div>
  );
};

export default App;
