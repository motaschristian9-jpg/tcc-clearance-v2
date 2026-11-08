import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Field,
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
import { Smartphone, ShieldAlert, RefreshCw } from 'lucide-react';

interface OtpVerificationCardProps {
  userEmail?: string;
  onVerified: () => void;
  onCancel: () => void;
}

export const OtpVerificationCard: React.FC<OtpVerificationCardProps> = ({
  userEmail = 'al••••••z@gmail.com',
  onVerified,
  onCancel,
}) => {
  const [otpCode, setOtpCode] = useState<string>('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState<number>(45);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [resendTimer]);

  const handleVerifyOtp = () => {
    if (otpCode.length !== 6) {
      setOtpError('Please enter the full 6-digit verification code.');
      return;
    }
    setIsVerifyingOtp(true);
    setTimeout(() => {
      setIsVerifyingOtp(false);
      onVerified();
    }, 650);
  };

  return (
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
            A 6-digit one-time code was sent to{' '}
            <span className="font-medium text-foreground">{userEmail}</span> to authorize this device.
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
                  setOtpCode('839102'); // demo test code
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
            onClick={onCancel}
            className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            Cancel & Return
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
};
