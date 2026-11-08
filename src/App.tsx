import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export const App: React.FC = () => {
  // Screen sequence: 'signin' -> 'consent'
  const [currentScreen, setCurrentScreen] = useState<'signin' | 'consent'>('signin');

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

      {/* SCREEN 1: SIGN IN WITH GMAIL (SHADCN CARD) */}
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
              {/* Primary Action: Continue with Google Button */}
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentScreen('consent')}
                className="w-full h-12 text-sm font-medium border-border hover:border-foreground/40 gap-3"
              >
                {/* Google SVG Icon */}
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

      {/* SCREEN 2: DATA PRIVACY & CONSENT (SHADCN CARD) */}
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
              {/* Simple Bordered Box for Disclosures */}
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
