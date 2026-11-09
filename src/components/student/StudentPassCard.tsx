import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
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
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Time-bucketed token refreshing every 30 seconds
    const timeBucket = Math.floor(Date.now() / 30000) * 30000;
    const passPayload = JSON.stringify({
      tcc_id: schoolId,
      name: fullName,
      dept: department,
      sec: section,
      epoch: timeBucket,
      v: 1,
    });

    QRCode.toCanvas(canvasRef.current, passPayload, {
      width: 208,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    }).catch((err) => {
      console.warn('Failed to render pass QR code canvas:', err);
    });
  }, [schoolId, fullName, department, section, passCountdown]);

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
          {/* Dynamic 30s Real Scannable QR Display */}
          <div className="relative p-4 rounded-xl border border-border bg-white shadow-sm flex flex-col items-center">
            <div className="size-52 bg-white flex items-center justify-center relative p-1">
              <canvas ref={canvasRef} className="size-full rounded-sm" />

              {/* Holographic Watermark Scan Animation */}
              <div className="absolute inset-x-2 top-2 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-bounce opacity-60 pointer-events-none" />
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
                Present this to the SBO officer for scanning
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
