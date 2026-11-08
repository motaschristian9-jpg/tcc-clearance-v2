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
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, LogOut, ShieldCheck, User } from 'lucide-react';

interface RegisteredStudentCardProps {
  userEmail: string;
  fullName: string;
  schoolId: string;
  department: string;
  section: string;
  photoDataUrl: string | null;
  onSignOut: () => void;
}

export const RegisteredStudentCard: React.FC<RegisteredStudentCardProps> = ({
  userEmail,
  fullName,
  schoolId,
  department,
  section,
  photoDataUrl,
  onSignOut,
}) => {
  return (
    <main className="w-full max-w-sm mx-auto my-auto py-6">
      <Card className="border border-border shadow-sm">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="size-3" />
              Google Account Connected
            </span>
          </div>
          <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
            Student Registered
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Your profile is active and synced with the TCC Clearance Database.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-xs">
          {/* Student Photo & Identity Overview */}
          <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
            <div className="relative size-14 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center shrink-0">
              {photoDataUrl ? (
                <img
                  src={photoDataUrl}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="size-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm truncate">
                {fullName || 'Student Name'}
              </h3>
              <p className="text-[11px] text-muted-foreground font-mono truncate">
                ID: {schoolId || 'N/A'}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {userEmail}
              </p>
            </div>
          </div>

          <Separator />

          {/* Record Breakdown */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">College / Department</span>
              <span className="font-medium text-foreground">{department}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Class Section</span>
              <span className="font-medium text-foreground font-mono">{section}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Clearance Status</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="size-3.5" />
                Active Student
              </span>
            </div>
          </div>

          <div className="p-3 bg-muted/40 rounded-lg border border-border text-[11px] text-muted-foreground leading-relaxed">
            Your details are authenticated via Google OAuth and locked to your student record. Attendance will be recorded during official college events.
          </div>
        </CardContent>

        <CardFooter className="pt-2">
          <Button
            variant="outline"
            type="button"
            onClick={onSignOut}
            className="w-full h-10 text-xs font-medium border-border hover:border-foreground/40 gap-2 cursor-pointer"
          >
            <LogOut className="size-3.5" />
            <span>Sign Out</span>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
};

