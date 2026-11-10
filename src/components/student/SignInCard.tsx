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
import {
  isSupabaseConfigured,
  signInWithGoogle,
} from '@/lib/supabase';
import { AlertCircle, Loader2 } from 'lucide-react';

interface SignInCardProps {
  onSignInSuccess?: () => void;
}

export const SignInCard: React.FC<SignInCardProps> = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const configured = isSupabaseConfigured();

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    if (!configured) {
      setErrorMsg('Clearance authentication service is temporarily unavailable. Please contact the administrator.');
      return;
    }

    try {
      setIsLoading(true);
      await signInWithGoogle();
      // Supabase redirects to Google OAuth
    } catch (err: unknown) {
      console.error('Google Sign-in failed:', err);
      let message = err instanceof Error ? err.message : 'Failed to connect to Google via Supabase.';
      if (message.toLowerCase().includes('provider') || message.toLowerCase().includes('unsupported')) {
        message = 'Google provider is not enabled in your Supabase project. Enable it at: Supabase Dashboard → Authentication → Providers → Google.';
      }
      setErrorMsg(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto py-6">
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
          {errorMsg && (
            <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-md flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {/* Focused: Continue with Google Button */}
          <Button
            variant="outline"
            size="lg"
            type="button"
            disabled={isLoading}
            onClick={handleGoogleSignIn}
            className="w-full h-11 text-xs font-medium border-border hover:border-foreground/40 gap-3 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
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
              </>
            )}
          </Button>

          <p className="text-center text-[11px] text-muted-foreground leading-normal">
            Use your institutional or personal Gmail address.
          </p>
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
    </div>
  );
};
