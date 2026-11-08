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
import { QrCode, FileText, ShieldCheck, ArrowLeft } from 'lucide-react';

interface StudentPassCardProps {
  fullName: string;
  schoolId: string;
  department: string;
  section: string;
  passCountdown: number;
  onViewActivityCard: () => void;
  onBackToDashboard: () => void;
}

export const StudentPassCard: React.FC<StudentPassCardProps> = ({
  fullName,
  schoolId,
  department,
  section,
  passCountdown,
  onViewActivityCard,
  onBackToDashboard,
}) => {
  return (
    <div className="w-full max-w-md mx-auto py-4">
      <Card className="border border-border shadow-sm">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-between pb-1">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              <span>Dashboard</span>
            </button>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-600 font-medium">
              <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Live QR
            </span>
          </div>

          <span className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground block pt-1">
            Attendance Check-In Pass
          </span>
          <CardTitle className="text-xl font-semibold tracking-tight text-foreground mt-0.5">
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
                <rect x="24" y="42" width="6" height="6" fill="black" />
                <rect x="38" y="40" width="24" height="20" fill="black" />
                <rect x="68" y="38" width="10" height="14" fill="black" />
                <rect x="82" y="44" width="8" height="10" fill="black" />

                <rect x="38" y="66" width="10" height="10" fill="black" />
                <rect x="54" y="68" width="8" height="8" fill="black" />
                <rect x="46" y="80" width="18" height="12" fill="black" />
                <rect x="70" y="76" width="16" height="10" fill="black" />

                {/* Center logo badge */}
                <rect x="44" y="44" width="12" height="12" fill="white" />
                <text
                  x="50"
                  y="52"
                  fontSize="6"
                  fontWeight="bold"
                  textAnchor="middle"
                  fill="black"
                  fontFamily="sans-serif"
                >
                  TCC
                </text>
              </svg>

              {/* Holographic Watermark Scan Animation */}
              <div className="absolute inset-x-2 top-2 h-0.5 bg-gradient-to-r from-transparent via-foreground/30 to-transparent animate-bounce opacity-60" />
            </div>

            {/* Countdown Progress */}
            <div className="w-full pt-3 flex items-center justify-between text-[11px] font-mono text-muted-foreground border-t border-border/60">
              <span className="flex items-center gap-1 font-sans">
                <QrCode className="size-3 text-foreground" />
                Official Student Pass
              </span>
              <span className="font-semibold text-foreground">
                Refreshes in {passCountdown}s
              </span>
            </div>
          </div>

          {/* Device Verification Badge */}
          <div className="w-full p-2.5 rounded-lg border border-border bg-muted/30 flex items-center justify-between text-left">
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-foreground flex items-center gap-1">
                <ShieldCheck className="size-3.5 text-foreground" />
                Verified Device
              </span>
              <span className="text-[10px] text-muted-foreground">
                Present this to the SBO officer at the gate
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
            className="w-full h-10 text-xs font-medium gap-2 cursor-pointer"
          >
            <FileText className="size-3.5" />
            <span>View My Clearance Card</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onBackToDashboard}
            className="w-full h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Back to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
