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
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '@/components/ui/field';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from '@/components/ui/input-otp';
import { 
  Camera, 
  RefreshCw, 
  Check, 
  Clock, 
  ShieldCheck, 
  QrCode, 
  FileText, 
  ArrowLeft,
  Download,
  CheckCircle2,
  LogOut,
  UserCheck,
  Smartphone,
  ShieldAlert
} from 'lucide-react';

export const App: React.FC = () => {
  // Screen sequence:
  // - 'signin': Neutral Google sign in entry
  // - 'otp': Device transfer verification (when logging in on another device)
  // - Onboarding (for new accounts): 'consent' -> 'details' -> 'photo' -> 'waiting'
  // - Authenticated Dashboard (for existing accounts): 'pass' -> 'activity-card'
  const [currentScreen, setCurrentScreen] = useState<
    'signin' | 'otp' | 'consent' | 'details' | 'photo' | 'waiting' | 'pass' | 'activity-card'
  >('signin');

  // Simulation state: whether Google sign-in detects:
  // - 'new': First-time user -> onboarding flow
  // - 'same-device': Existing user on same authorized device -> direct pass
  // - 'new-device': Existing user on a different device -> OTP device verification required
  type LoginScenario = 'new' | 'same-device' | 'new-device';
  const [loginScenario, setLoginScenario] = useState<LoginScenario>('new-device');

  // OTP Verification State (Device Transfer)
  const [otpCode, setOtpCode] = useState<string>('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState<number>(45);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);

  // Student Profile State
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

  // Pass timer simulation (30-second window)
  const [passCountdown, setPassCountdown] = useState<number>(24);

  useEffect(() => {
    if (currentScreen === 'pass') {
      const interval = setInterval(() => {
        setPassCountdown((prev) => (prev <= 1 ? 30 : prev - 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentScreen]);

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

  // Camera stream handler for Photo Step
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

  // OTP resend countdown effect
  useEffect(() => {
    if (currentScreen === 'otp' && resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentScreen, resendTimer]);

  // Google Sign-In Handler
  const handleGoogleSignIn = () => {
    if (loginScenario === 'new') {
      // New user -> starts the one-time registration & onboarding process
      setCurrentScreen('consent');
    } else if (loginScenario === 'same-device') {
      // Returning user on same authorized device -> direct to pass
      setCurrentScreen('pass');
    } else {
      // Returning user logging in on another/new device -> OTP device transfer verification
      setOtpCode('');
      setOtpError(null);
      setResendTimer(45);
      setCurrentScreen('otp');
    }
  };

  // OTP Verification Handler
  const handleVerifyOtp = () => {
    if (otpCode.length !== 6) {
      setOtpError('Please enter the full 6-digit verification code.');
      return;
    }
    setIsVerifyingOtp(true);
    setTimeout(() => {
      setIsVerifyingOtp(false);
      // Device successfully authorized and bound
      setCurrentScreen('pass');
    }, 650);
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

      {/* SCREEN 1: NEUTRAL SIGN IN SCREEN (CONTINUE WITH GOOGLE ONLY) */}
      {currentScreen === 'signin' && (
        <main className="w-full max-w-sm mx-auto my-auto py-6">
          <Card className="border border-border shadow-sm">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-semibold tracking-tight text-foreground">
                Sign in
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground pt-1 leading-relaxed">
                Continue with your Google account to access your event attendance passes and digital clearance card.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4">
              {/* Focused: Continue with Google Button Only */}
              <Button
                variant="outline"
                size="lg"
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full h-11 text-xs font-medium border-border hover:border-foreground/40 gap-3"
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

              <p className="text-center text-[11px] text-muted-foreground leading-normal">
                Use your institutional or personal Gmail address.
              </p>

              {/* Demo Account State Switcher */}
              <div className="pt-2 border-t border-border/60 flex flex-col gap-1.5 text-[11px] text-muted-foreground">
                <span className="font-medium text-foreground">Test login scenario:</span>
                <div className="grid grid-cols-3 gap-1 pt-0.5">
                  <button
                    type="button"
                    onClick={() => setLoginScenario('new')}
                    className={`px-2 py-1 rounded text-[10px] font-medium border transition-colors cursor-pointer text-center ${
                      loginScenario === 'new'
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-muted/30 border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    New User
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginScenario('same-device')}
                    className={`px-2 py-1 rounded text-[10px] font-medium border transition-colors cursor-pointer text-center ${
                      loginScenario === 'same-device'
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-muted/30 border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Same Device
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginScenario('new-device')}
                    className={`px-2 py-1 rounded text-[10px] font-medium border transition-colors cursor-pointer text-center ${
                      loginScenario === 'new-device'
                        ? 'bg-foreground text-background border-foreground'
                        : 'bg-muted/30 border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Other Device
                  </button>
                </div>
              </div>
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

      {/* SCREEN: OTP DEVICE VERIFICATION (LOGIN FROM ANOTHER DEVICE) */}
      {currentScreen === 'otp' && (
        <main className="w-full max-w-sm mx-auto my-auto py-6">
          <Card className="border border-border shadow-sm">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto size-10 rounded-full border border-border bg-muted/20 flex items-center justify-center mb-2">
                <Smartphone className="size-5 text-foreground" />
              </div>
              <span className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
                Security Check · Device Transfer
              </span>
              <CardTitle className="text-xl font-semibold tracking-tight text-foreground mt-0.5">
                Verify your device
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
                A 6-digit one-time code was sent to <span className="font-medium text-foreground">al••••••z@gmail.com</span> to authorize this device.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-4 text-xs">
              {/* OTP Input using shadcn Field and InputOTP */}
              <Field className="items-center text-center">
                <FieldLabel htmlFor="otp-input" className="text-xs font-medium text-foreground">
                  Enter 6-digit verification code
                </FieldLabel>
                <div className="pt-2 pb-1 flex justify-center w-full">
                  <InputOTP
                    id="otp-input"
                    maxLength={6}
                    value={otpCode}
                    onChange={(val) => {
                      setOtpCode(val);
                      if (otpError) setOtpError(null);
                    }}
                    autoFocus
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {otpError ? (
                  <FieldError className="text-center">{otpError}</FieldError>
                ) : (
                  <FieldDescription className="text-center text-[11px]">
                    Input the code from your email to bind your pass.
                  </FieldDescription>
                )}
              </Field>

              {/* Security Policy Information */}
              <div className="border border-border rounded-lg p-3 bg-muted/20 text-xs flex gap-2.5 items-start">
                <ShieldAlert className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="font-semibold text-foreground text-[11px]">
                    Single Active Device Policy
                  </span>
                  <p className="text-muted-foreground text-[11px] leading-relaxed">
                    Authorizing this device will invalidate your active clearance pass on your previous phone or browser.
                  </p>
                </div>
              </div>

              {/* Resend Code Section */}
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                <span>Didn't receive the email?</span>
                {resendTimer > 0 ? (
                  <span className="font-mono text-[11px]">Resend in {resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setResendTimer(45);
                      setOtpCode('839102'); // demo filler code
                      setOtpError(null);
                    }}
                    className="font-medium text-foreground underline underline-offset-4 hover:text-primary cursor-pointer"
                  >
                    Resend code
                  </button>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 pt-2">
              <Button
                type="button"
                onClick={handleVerifyOtp}
                disabled={otpCode.length < 6 || isVerifyingOtp}
                className="w-full h-10 text-xs font-medium"
              >
                {isVerifyingOtp ? (
                  <span className="inline-flex items-center gap-2">
                    <RefreshCw className="size-3.5 animate-spin" />
                    Authorizing Device...
                  </span>
                ) : (
                  'Verify & Authorize Device'
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentScreen('signin')}
                className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel & Return
              </Button>
            </CardFooter>
          </Card>
        </main>
      )}

      {/* SCREEN 2: ONBOARDING STEP 1 - DATA PRIVACY & CONSENT */}
      {currentScreen === 'consent' && (
        <main className="w-full max-w-sm mx-auto my-auto py-6">
          <Card className="border border-border shadow-sm">
            <CardHeader className="text-center pb-4">
              <span className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
                Onboarding · Step 1 of 3
              </span>
              <CardTitle className="text-xl font-semibold tracking-tight text-foreground mt-0.5">
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
                Cancel
              </Button>
            </CardFooter>
          </Card>
        </main>
      )}

      {/* SCREEN 3: ONBOARDING STEP 2 - STUDENT DETAILS FORM */}
      {currentScreen === 'details' && (
        <main className="w-full max-w-sm mx-auto my-auto py-6">
          <Card className="border border-border shadow-sm">
            <CardHeader className="text-center pb-4">
              <span className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
                Onboarding · Step 2 of 3
              </span>
              <CardTitle className="text-xl font-semibold tracking-tight text-foreground mt-0.5">
                Student Information
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Enter your official college records.
              </CardDescription>
            </CardHeader>

            <CardContent className="text-left text-xs">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="fullname">Full Name (First, Middle, Last)</FieldLabel>
                  <Input
                    id="fullname"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alexander M. Cruz"
                    className="h-10 text-xs"
                  />
                  <FieldDescription>Must match your official college enrollment record.</FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="schoolid">School ID Number</FieldLabel>
                  <Input
                    id="schoolid"
                    value={schoolId}
                    onChange={(e) => setSchoolId(e.target.value)}
                    placeholder="2023-01842"
                    className="h-10 text-xs font-mono"
                  />
                  <FieldDescription>Issued by TCC Registrar.</FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="department">College / Department</FieldLabel>
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
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field>
                    <FieldLabel htmlFor="yearlevel">Year Level</FieldLabel>
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
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="section">Section</FieldLabel>
                    <Input
                      id="section"
                      value={section}
                      onChange={(e) => setSection(e.target.value)}
                      placeholder="3-A"
                      className="h-10 text-xs font-mono"
                    />
                  </Field>
                </div>
              </FieldGroup>
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

      {/* SCREEN 4: ONBOARDING STEP 3 - LIVE FACE CHECK */}
      {currentScreen === 'photo' && (
        <main className="w-full max-w-sm mx-auto my-auto py-6">
          <Card className="border border-border shadow-sm">
            <CardHeader className="text-center pb-4">
              <span className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
                Onboarding · Step 3 of 3
              </span>
              <CardTitle className="text-xl font-semibold tracking-tight text-foreground mt-0.5">
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
                  : 'Ensure you are in a well-lit area with no glare.'}
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
                    <span>Confirm & Complete Registration</span>
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
                onClick={() => {
                  setLoginScenario('same-device');
                  setCurrentScreen('pass');
                }}
                className="w-full h-10 text-xs font-medium gap-2"
              >
                <UserCheck className="size-3.5" />
                <span>Simulate SBO Approval & Open Pass</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setPhotoDataUrl(null);
                  setCurrentScreen('signin');
                }}
                className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                Back to Sign In
              </Button>
            </CardFooter>
          </Card>
        </main>
      )}

      {/* SCREEN 6: ACTIVE ROTATING QR CLEARANCE PASS (DASHBOARD FOR APPROVED USERS) */}
      {currentScreen === 'pass' && (
        <main className="w-full max-w-sm mx-auto my-auto py-6">
          <Card className="border border-border shadow-sm">
            <CardHeader className="text-center pb-4">
              <span className="text-[11px] font-medium tracking-widest uppercase text-emerald-600 dark:text-emerald-500">
                Active Clearance Pass
              </span>
              <CardTitle className="text-xl font-semibold tracking-tight text-foreground mt-0.5">
                CIT Intramurals 2026
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Tagoloan Community College
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col items-center gap-5 text-center">
              {/* Dynamic QR Pass */}
              <div className="p-4 border border-border rounded-xl bg-card flex flex-col items-center shadow-xs">
                <div className="size-48 rounded-lg bg-foreground text-background flex items-center justify-center p-3 relative">
                  <QrCode className="size-36 text-background" />
                  <div className="absolute top-2 right-2 bg-emerald-500 text-slate-950 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                    LIVE
                  </div>
                </div>

                <div className="w-full mt-3 flex items-center justify-between text-xs font-mono text-muted-foreground">
                  <span className="flex items-center gap-1.5 text-foreground font-sans text-xs">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Auto-rotates</span>
                  </span>
                  <span>{passCountdown}s</span>
                </div>
                <div className="w-full bg-muted h-1 rounded-full overflow-hidden mt-1">
                  <div
                    className="bg-foreground h-full transition-all duration-1000 ease-linear"
                    style={{ width: `${(passCountdown / 30) * 100}%` }}
                  />
                </div>
              </div>

              {/* Student Metadata */}
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {fullName}
                </h3>
                <p className="text-xs font-mono text-muted-foreground">
                  {department} {yearLevel} · Section {section} · ID {schoolId}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                <span>ECDSA Cryptographically Bound</span>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-2 pt-2">
              <Button
                type="button"
                onClick={() => setCurrentScreen('activity-card')}
                className="w-full h-10 text-xs font-medium gap-2"
              >
                <FileText className="size-3.5" />
                <span>View Clearance Activity Card</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentScreen('signin')}
                className="w-full h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5"
              >
                <LogOut className="size-3" />
                <span>Sign Out</span>
              </Button>
            </CardFooter>
          </Card>
        </main>
      )}

      {/* SCREEN 7: 5-DAY CLEARANCE MATRIX CARD */}
      {currentScreen === 'activity-card' && (
        <main className="w-full max-w-sm mx-auto my-auto py-6">
          <Card className="border border-border shadow-sm">
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-between pb-1">
                <button
                  type="button"
                  onClick={() => setCurrentScreen('pass')}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <ArrowLeft className="size-3.5" />
                  <span>Pass</span>
                </button>
                <span className="text-[11px] font-mono text-muted-foreground">
                  CIT-2026-0081
                </span>
              </div>

              <span className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground block">
                Official Clearance Card
              </span>
              <CardTitle className="text-xl font-semibold tracking-tight text-foreground mt-0.5">
                CIT Intramurals 2026
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {fullName} · {section} · ID {schoolId}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-3">
              {[
                { day: 'Day 1', date: 'Nov 10', slots: ['In: 07:54 AM ✓', 'Out: 11:45 AM ✓', 'In: 01:10 PM ✓', 'Out: 05:02 PM ✓'], cleared: true },
                { day: 'Day 2', date: 'Nov 11', slots: ['In: 08:02 AM ✓', 'Out: 11:50 AM ✓', 'In: Pending', 'Out: Pending'], cleared: false },
                { day: 'Day 3', date: 'Nov 12', slots: ['In: Pending', 'Out: Pending', 'In: Pending', 'Out: Pending'], cleared: false },
                { day: 'Day 4', date: 'Nov 13', slots: ['In: Pending', 'Out: Pending', 'In: Pending', 'Out: Pending'], cleared: false },
                { day: 'Day 5', date: 'Nov 14', slots: ['In: Pending', 'Out: Pending', 'In: Pending', 'Out: Pending'], cleared: false },
              ].map((item, index) => (
                <div
                  key={item.day}
                  className={`border border-border rounded-lg p-2.5 text-xs flex flex-col gap-1.5 ${
                    item.cleared ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-muted/10'
                  }`}
                >
                  <div className="flex items-center justify-between font-medium">
                    <span className="font-semibold text-foreground text-xs">
                      {item.day} · {item.date}
                    </span>
                    {item.cleared ? (
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="size-3" />
                        <span>Cleared</span>
                      </span>
                    ) : index === 1 ? (
                      <span className="text-[10px] text-amber-600 font-medium">In Progress</span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground font-normal">Upcoming</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-1 font-mono text-[10px] text-muted-foreground">
                    {item.slots.map((s, idx) => (
                      <div
                        key={idx}
                        className={`px-2 py-0.5 rounded ${
                          s.includes('✓') ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-medium' : 'bg-muted/30'
                        }`}
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>

            <CardFooter className="flex flex-col gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => alert('Exporting card as PDF/PNG...')}
                className="w-full h-10 text-xs font-medium gap-2"
              >
                <Download className="size-3.5" />
                <span>Export Activity Card (PDF)</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setCurrentScreen('pass')}
                className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                Back to QR Pass
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
