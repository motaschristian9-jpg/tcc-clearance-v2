import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ShieldCheck, UserCheck } from 'lucide-react';

interface WaitingApprovalCardProps {
  fullName: string;
  schoolId: string;
  department: string;
  section: string;
  photoDataUrl: string | null;
  onApprove: () => void;
  onBackToSignIn: () => void;
}

export const WaitingApprovalCard: React.FC<WaitingApprovalCardProps> = ({
  fullName,
  schoolId,
  department,
  section,
  photoDataUrl,
  onApprove,
  onBackToSignIn,
}) => {
  return (
    <main className="w-full max-w-sm mx-auto my-auto py-6">
      <Card className="border border-border shadow-sm">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto size-9 rounded-full border border-border bg-muted/20 flex items-center justify-center mb-1">
            <Clock className="size-4 text-muted-foreground animate-spin [animation-duration:8s]" />
          </div>
          <span className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
            Onboarding Complete
          </span>
          <CardTitle className="text-xl font-semibold tracking-tight text-foreground mt-0.5">
            Pending SBO Approval
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Your clearance profile is queued for department validation.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3 text-xs">
          {/* Summary Box */}
          <div className="border border-border rounded-lg p-3.5 bg-muted/10 flex items-center gap-3">
            {photoDataUrl && (
              <img
                src={photoDataUrl}
                alt="Student Profile"
                className="size-12 rounded-full object-cover border border-border shrink-0 scale-x-[-1]"
              />
            )}
            <div className="flex flex-col overflow-hidden">
              <span className="font-semibold text-foreground text-xs truncate">
                {fullName}
              </span>
              <span className="text-muted-foreground text-[11px] font-mono">
                ID {schoolId} · {section}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                {department} Student
              </span>
            </div>
          </div>

          <div className="border border-border rounded-lg p-3 bg-muted/20 flex flex-col gap-1.5 text-left">
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
            onClick={onApprove}
            className="w-full h-10 text-xs font-medium gap-2"
          >
            <UserCheck className="size-3.5" />
            <span>Simulate SBO Approval & Open Pass</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onBackToSignIn}
            className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            Back to Sign In
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
};
