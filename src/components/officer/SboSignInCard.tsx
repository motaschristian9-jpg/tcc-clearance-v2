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
import { Separator } from '@/components/ui/separator';
import { ShieldCheck, KeyRound, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getSupabase } from '@/lib/supabase';

interface SboSignInCardProps {
  onOfficerAuthenticated: (officer: {
    id: string;
    email: string;
    name: string;
    department: string;
    role: 'officer' | 'head';
  }) => void;
  onBackToStudentPortal: () => void;
}

// Master gate passcodes for emergency/fast offline gate stations
const DEFAULT_GATE_PASSCODES = ['SBO-CIT-2026', 'TCC-SBO-GATE', '20261373'];

export const SboSignInCard: React.FC<SboSignInCardProps> = ({
  onOfficerAuthenticated,
  onBackToStudentPortal,
}) => {
  const [authMode, setAuthMode] = useState<'passcode' | 'account'>('passcode');
  const [passcode, setPasscode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [officerName, setOfficerName] = useState('CIT SBO Officer');
  const [isLoading, setIsLoading] = useState(false);

  // 1. Passcode Quick Terminal Unlock (for gate duty phones)
  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const cleanCode = passcode.trim().toUpperCase();

      if (DEFAULT_GATE_PASSCODES.includes(cleanCode) || cleanCode === 'SBO2026') {
        toast.success('SBO Terminal Unlocked', {
          description: `Welcome, ${officerName}. Gate attendance terminal is now active.`,
        });
        onOfficerAuthenticated({
          id: 'sbo-officer-gate',
          email: 'sbo.officer@tcc.edu.ph',
          name: officerName,
          department: 'CIT',
          role: 'officer',
        });
      } else {
        toast.error('Invalid Officer Passcode', {
          description: 'The gate passcode entered does not match authorized credentials.',
        });
      }
    }, 600);
  };

  // 2. Email & Password Account Login via Supabase
  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setIsLoading(true);
    try {
      const supabase = getSupabase();
      if (!supabase) {
        throw new Error('Supabase client unavailable');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data.user) {
        toast.error('Authentication Failed', {
          description: error?.message || 'Invalid officer credentials.',
        });
        return;
      }

      // Query officer role from profiles
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      const role = profile?.role || 'officer';

      toast.success('Officer Session Verified', {
        description: `Authenticated as ${profile?.full_name || data.user.email}.`,
      });

      onOfficerAuthenticated({
        id: data.user.id,
        email: data.user.email || '',
        name: profile?.full_name || 'SBO Officer',
        department: 'CIT',
        role: role as 'officer' | 'head',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown login error';
      toast.error('Sign In Error', { description: msg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto my-auto py-6">
      <Card className="border border-border/80 shadow-xl bg-card">
        <CardHeader className="text-center pb-4 pt-6">
          <div className="mx-auto size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 shadow-xs">
            <ShieldCheck className="size-6 text-foreground" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-muted text-muted-foreground border border-border mx-auto mb-1">
            <Lock className="size-3" />
            <span>Restricted Gateway</span>
          </div>

          <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
            SBO Officer Portal
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Student Body Organization · Event Gate Terminal
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Auth Mode Toggle */}
          <div className="grid grid-cols-2 p-1 rounded-lg border border-border bg-muted/30 text-xs">
            <button
              type="button"
              onClick={() => setAuthMode('passcode')}
              className={`py-1.5 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                authMode === 'passcode'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Gate Passcode
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('account')}
              className={`py-1.5 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
                authMode === 'account'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Officer Account
            </button>
          </div>

          {authMode === 'passcode' ? (
            <form onSubmit={handlePasscodeSubmit} className="space-y-3.5">
              <div className="space-y-1.5 text-left">
                <Label htmlFor="gate-passcode" className="text-xs font-medium">
                  Gate Terminal Passcode
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    id="gate-passcode"
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter gate key (e.g. SBO-CIT-2026)"
                    className="pl-9 h-10 text-xs font-mono"
                    autoFocus
                    required
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Default Demo Key: <span className="font-mono font-medium text-foreground">SBO-CIT-2026</span>
                </p>
              </div>

              <div className="space-y-1.5 text-left">
                <Label htmlFor="officer-name" className="text-xs font-medium">
                  Officer on Duty Label
                </Label>
                <Input
                  id="officer-name"
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  placeholder="e.g. CIT SBO Officer"
                  className="h-9 text-xs"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !passcode.trim()}
                className="w-full h-10 text-xs font-semibold gap-2 cursor-pointer shadow-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Verifying Terminal...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-4" />
                    <span>Unlock Gate Scanner</span>
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleAccountSubmit} className="space-y-3">
              <div className="space-y-1.5 text-left">
                <Label htmlFor="officer-email" className="text-xs font-medium">
                  Officer Email
                </Label>
                <Input
                  id="officer-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@tcc.edu.ph"
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5 text-left">
                <Label htmlFor="officer-password" className="text-xs font-medium">
                  Password
                </Label>
                <Input
                  id="officer-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-9 text-xs"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email.trim() || !password}
                className="w-full h-10 text-xs font-semibold gap-2 cursor-pointer shadow-xs mt-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <Lock className="size-3.5" />
                    <span>Sign In to Terminal</span>
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="pt-1 pb-4 flex flex-col gap-2">
          <Separator />
          <button
            type="button"
            onClick={onBackToStudentPortal}
            className="inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer py-1"
          >
            <ArrowLeft className="size-3.5" />
            <span>Return to Student Portal</span>
          </button>
        </CardFooter>
      </Card>
    </div>
  );
};
