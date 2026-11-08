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
import { QrCode, FileText, ShieldCheck, LogOut } from 'lucide-react';

interface StudentPassCardProps {
  fullName: string;
  schoolId: string;
  department: string;
  section: string;
  passCountdown: number;
  onViewActivityCard: () => void;
  onSignOut: () => void;
}

export const StudentPassCard: React.FC<StudentPassCardProps> = ({
  fullName,
  schoolId,
  department,
  section,
  passCountdown,
  onViewActivityCard,
  onSignOut,
}) => {
  return (
    <main className="w-full max-w-sm mx-auto my-auto py-6">
      <Card className="border border-border shadow-sm">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
              TCC Active Pass
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 font-medium">
              <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Live
            </span>
          </div>

          <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
            {fullName}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground font-mono">
            {department} · ID {schoolId} · {section}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-4 text-center">
          {/* Dynamic 30s QR Display */}
          <div className="relative p-4 rounded-xl border border-border bg-white shadow-sm flex flex-col items-center">
            {/* Visual SVG QR representation */}
            <div className="size-52 bg-white flex items-center justify-center relative p-2">
              <svg viewBox="0 0 100 100" className="size-full">
                <rect width="100" height="100" fill="white" />
                {/* Outer positioning markers */}
                <rect x="5" y="5" width="28" height="28" fill="black" />
                <rect x="9" y="9" width="20" height="20" fill="white" />
                <rect x="13" y="13" width="12" height="12" fill="black" />

                <rect x="67" y="5" width="28" height="28" fill="black" />
                <rect x="71" y="9" width="20" height="20" fill="white" />
                <rect x="75" y="13" width="12" height="12" fill="black" />

                <rect x="5" y="67" width="28" height="28" fill="black" />
                <rect x="9" y="71" width="20" height="20" fill="white" />
                <rect x="13" y="75" width="12" height="12" fill="black" />

                {/* Simulated dynamic bit matrix blocks based on countdown */}
                <rect x="38" y="10" width="8" height="8" fill="black" />
                <rect x="48" y="18" width="6" height="6" fill="black" />
                <rect x="40" y="28" width="12" height="6" fill="black" />
                <rect x="56" y="28" width="6" height="8" fill="black" />

                <rect x="12" y="38" width="8" height="12" fill="black" />
                <rect x="24" y="44" width="12" height="6" fill="black" />
                <rect x="42" y="42" width="16" height="16" fill="black" />
                <rect x="46" y="46" width="8" height="8" fill="white" />
                <rect x="64" y="40" width="10" height="8" fill="black" />
                <rect x="78" y="44" width="14" height="6" fill="black" />

                <rect x="38" y="64" width="8" height="10" fill="black" />
                <rect x="50" y="68" width="12" height="6" fill="black" />
                <rect x="68" y="64" width="8" height="14" fill="black" />
                <rect x="80" y="72" width="12" height="8" fill="black" />
                <rect x="42" y="82" width="20" height="8" fill="black" />
                <rect x="68" y="84" width="8" height="8" fill="black" />
              </svg>

              {/* Center watermark logo badge */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="size-9 rounded-md bg-white border border-border shadow-sm flex items-center justify-center font-bold text-[10px] text-foreground tracking-wider">
                  TCC
                </div>
              </div>
            </div>

            {/* Countdown indicator */}
            <div className="w-full pt-2 flex items-center justify-between text-[11px] font-mono text-muted-foreground border-t border-border/60 mt-2">
              <span className="flex items-center gap-1.5">
                <QrCode className="size-3.5 text-foreground" />
                <span>ECDSA Signed</span>
              </span>
              <span className="font-semibold text-foreground">
                Refreshes in {passCountdown}s
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden mt-1.5">
              <div
                className="h-full bg-foreground transition-all duration-1000 ease-linear"
                style={{ width: `${(passCountdown / 30) * 100}%` }}
              />
            </div>
          </div>

          {/* Security Device Binding Info */}
          <div className="border border-border rounded-lg p-3 bg-muted/20 text-xs w-full flex items-center gap-2.5">
            <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
            <div className="flex flex-col text-left">
              <span className="font-semibold text-foreground text-[11px]">
                Bound to this Device
              </span>
              <span className="text-[10px] text-muted-foreground leading-normal font-mono">
                Hardware WebCrypto Key: P-256 Validated
              </span>
            </div>
          </div>

          {/* SBO Scanner Approval Notice */}
          <div className="border border-border rounded-lg p-2.5 bg-muted/10 text-xs w-full flex items-center justify-between text-left">
            <div className="flex flex-col">
              <span className="font-semibold text-foreground text-[11px]">
                Clearance Verification
              </span>
              <span className="text-[10px] text-muted-foreground">
                Approved when SBO officer scans your Time In/Out
              </span>
            </div>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 shrink-0">
              Ready to Scan
            </span>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-2">
          <Button
            type="button"
            onClick={onViewActivityCard}
            className="w-full h-10 text-xs font-medium gap-2"
          >
            <FileText className="size-3.5" />
            <span>View Clearance Activity Card</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={onSignOut}
            className="w-full h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5"
          >
            <LogOut className="size-3.5" />
            <span>Sign Out</span>
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
};

