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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const App: React.FC = () => {
  const [email, setEmail] = useState('');

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

      {/* Main Container - Official shadcn Card Login Pattern */}
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
