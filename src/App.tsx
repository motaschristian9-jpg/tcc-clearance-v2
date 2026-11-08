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
import { Label } from '@/components/ui/label';
import { Camera, RefreshCw, Check, Clock, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  // Screen sequence:
  // 1. 'signin' (Gmail Login)
  // 2. 'consent' (Data Privacy RA 10173)
  // 3. 'details' (Student Info Form)
  // 4. 'photo' (Live Face Check)
  // 5. 'waiting' (Pending SBO Approval)
  const [currentScreen, setCurrentScreen] = useState<'signin' | 'consent' | 'details' | 'photo' | 'waiting'>('signin');

  // Form State
  const [email, setEmail] = useState<string>('alexander.cruz@gmail.com');
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

  // Camera stream handler for Step 4
  useEffect(() => {
    let active = true;

    if (currentScreen === 'photo' && !photoDataUrl) {
      async function startCamera() {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user',
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

      {/* SCREEN 1: SIGN IN WITH GMAIL */}
      {currentScreen === 'signin' && (
        <main className="w-full max-w-sm mx-auto my-auto py-6">
          <Card className="border border-border shadow-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
                Student Registration
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground pt-1">
                Enter your Gmail account below to register your device for event clearance passes.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4">
              {/* 1-Click Google Sign In */}
              <Button
                variant="outline"
                size="default"
                type="button"
                onClick={() => setCurrentScreen('consent')}
                className="w-full h-10 text-xs font-medium border-border hover:border-foreground/40 gap-2.5"
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

              {/* Subtle Divider */}
              <div className="relative text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border my-1">
                <span className="relative z-10 bg-card px-2 text-[11px] text-muted-foreground uppercase font-medium">
                  Or enter Gmail
                </span>
              </div>

              {/* Email Field */}
              <div className="grid gap-2 text-left">
                <Label htmlFor="email" className="text-xs font-medium text-foreground">
                  Gmail Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 text-xs"
                />
              </div>

              {/* Submit Action */}
              <Button
                type="button"
                onClick={() => setCurrentScreen('consent')}
                className="w-full h-10 text-xs font-medium mt-1"
              >
                Continue to Student Details
              </Button>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 pt-2">
              <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
                By continuing, you agree to Tagoloan Community College's{' '}
                <a href="#" className="underline underline-offset-4 hover:text-foreground">
                  Data Privacy Policy
                </a>{' '}
                (RA 10173).
              </p>
            </CardFooter>
          </Card>
        </main>
      )}

      {/* SCREEN 2: DATA PRIVACY & CONSENT */}
      {currentScreen === 'consent' && (
        <main className="w-full max-w-sm mx-auto my-auto py-6">
          <Card className="border border-border shadow-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
                Data Privacy & Consent
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Republic Act No. 10173
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-3.5 text-left text-xs">
              <div className="border border-border rounded-lg p-3.5 bg-muted/20 flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-foreground">
                    What we collect
                  </span>
                  <p className="text-muted-foreground leading-relaxed">
                    Full name, school ID number, department, year level, section, and live verification photo.
                  </p>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-foreground">
                    Why it is collected
                  </span>
                  <p className="text-muted-foreground leading-relaxed">
                    Exclusively for event attendance verification and digital clearance stamp issuance.
                  </p>
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-foreground">
                    Data retention
                  </span>
                  <p className="text-muted-foreground leading-relaxed">
                    Records are retained strictly for the semester clearance cycle and purged upon clearance archiving.
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 pt-2">
              <Button
                type="button"
                onClick={() => setCurrentScreen('details')}
                className="w-full h-10 text-xs font-medium"
              >
                I Agree & Continue
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentScreen('signin')}
                className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                Back to Sign In
              </Button>
            </CardFooter>
          </Card>
        </main>
      )}

      {/* SCREEN 3: STUDENT DETAILS */}
      {currentScreen === 'details' && (
        <main className="w-full max-w-sm mx-auto my-auto py-6">
          <Card className="border border-border shadow-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
                Student Information
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                A school ID can be registered to one device only.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-3.5 text-left text-xs">
              <div className="grid gap-1.5">
                <Label htmlFor="fullname" className="text-xs font-medium text-foreground">
                  Full Name (First, Middle, Last)
                </Label>
                <Input
                  id="fullname"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alexander M. Cruz"
                  className="h-10 text-xs"
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="schoolid" className="text-xs font-medium text-foreground">
                  School ID Number
                </Label>
                <Input
                  id="schoolid"
                  value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)}
                  placeholder="2023-01842"
                  className="h-10 text-xs font-mono"
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="department" className="text-xs font-medium text-foreground">
                  College / Department
                </Label>
                <select
                  id="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground font-sans"
                >
                  {departments.map((dept) => (
                    <option key={dept.code} value={dept.code}>
                      {dept.code} · {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="yearlevel" className="text-xs font-medium text-foreground">
                    Year Level
                  </Label>
                  <select
                    id="yearlevel"
                    value={yearLevel}
                    onChange={(e) => setYearLevel(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground font-sans"
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="section" className="text-xs font-medium text-foreground">
                    Section
                  </Label>
                  <Input
                    id="section"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    placeholder="3-A"
                    className="h-10 text-xs font-mono"
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 pt-2">
              <Button
                type="button"
                onClick={() => setCurrentScreen('photo')}
                className="w-full h-10 text-xs font-medium"
              >
                Continue to Face Verification
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentScreen('consent')}
                className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                Back to Consent
              </Button>
            </CardFooter>
          </Card>
        </main>
      )}

      {/* SCREEN 4: LIVE FACE CHECK */}
      {currentScreen === 'photo' && (
        <main className="w-full max-w-sm mx-auto my-auto py-6">
          <Card className="border border-border shadow-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
                Face Verification
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Center your face in the guide. Front camera only.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col items-center gap-4 text-center">
              <div className="relative size-48 sm:size-52 rounded-full overflow-hidden border-2 border-dashed border-border bg-muted/20 flex items-center justify-center">
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
                    <div className="absolute inset-3 rounded-full border border-dashed border-white/60 pointer-events-none" />
                  </>
                ) : (
                  <div className="flex flex-col items-center text-center p-4 gap-2 text-muted-foreground">
                    <Camera className="size-8 text-muted-foreground/60" />
                    <span className="text-[11px]">Camera stream ready</span>
                    <button
                      type="button"
                      onClick={handleSimulatePhoto}
                      className="text-[11px] text-foreground underline underline-offset-4 mt-1 font-medium"
                    >
                      Use Demo Photo
                    </button>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-muted-foreground max-w-xs leading-normal">
                {photoDataUrl
                  ? 'Confirm that your face is centered and clearly recognizable.'
                  : 'Ensure you are in a well-lit area with no heavy shadows.'}
              </p>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 pt-2">
              {photoDataUrl ? (
                <>
                  <Button
                    type="button"
                    onClick={() => setCurrentScreen('waiting')}
                    className="w-full h-10 text-xs font-medium gap-2"
                  >
                    <Check className="size-3.5" />
                    <span>Confirm & Submit</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPhotoDataUrl(null)}
                    className="w-full h-8 text-xs gap-1.5"
                  >
                    <RefreshCw className="size-3" />
                    <span>Retake Photo</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    onClick={hasCameraPermission ? handleCapturePhoto : handleSimulatePhoto}
                    className="w-full h-10 text-xs font-medium gap-2"
                  >
                    <Camera className="size-3.5" />
                    <span>Capture Photo</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setCurrentScreen('details')}
                    className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Back to Student Details
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        </main>
      )}

      {/* SCREEN 5: PENDING SBO APPROVAL */}
      {currentScreen === 'waiting' && (
        <main className="w-full max-w-sm mx-auto my-auto py-6">
          <Card className="border border-border shadow-sm">
            <CardHeader className="text-center pb-4">
              <span className="text-[11px] font-medium tracking-widest uppercase text-amber-600 dark:text-amber-500">
                Pending SBO Review
              </span>
              <CardTitle className="text-xl font-semibold tracking-tight text-foreground mt-0.5">
                Waiting for Approval
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Submitted to {department} Student Body Organization
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col items-center gap-4 text-center">
              <div className="relative">
                <div className="size-20 rounded-full overflow-hidden border border-border bg-muted/40 flex items-center justify-center">
                  {photoDataUrl ? (
                    <img
                      src={photoDataUrl}
                      alt={fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-light text-muted-foreground">
                      {fullName.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1 rounded-full border-2 border-background">
                  <Clock className="size-3" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {fullName}
                </h3>
                <p className="text-xs font-mono text-muted-foreground">
                  {department} {yearLevel} · Section {section} · ID {schoolId}
                </p>
              </div>

              <div className="border border-border rounded-lg p-3 bg-muted/20 text-left text-xs text-muted-foreground flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-foreground font-medium text-xs">
                  <ShieldCheck className="size-3.5 text-emerald-600 shrink-0" />
                  <span>Device Key Generated</span>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground pl-5">
                  Once your SBO officer verifies your face against the official college roster, your attendance pass will activate immediately.
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setPhotoDataUrl(null);
                  setCurrentScreen('signin');
                }}
                className="w-full h-9 text-xs text-muted-foreground hover:text-foreground"
              >
                Back to Sign In
              </Button>
            </CardFooter>
          </Card>
        </main>
      )}

      {/* Quiet Footer */}
      <footer className="max-w-sm mx-auto w-full text-center pt-4">
        <p className="text-[11px] text-muted-foreground font-normal">
          Baluarte, Tagoloan, Misamis Oriental
        </p>
      </footer>
    </div>
  );
};

export default App;
