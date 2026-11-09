import React, { useEffect, useState } from 'react';
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
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  // Compute 30-second epoch token
  const currentEpoch = Math.floor(Date.now() / 30000) * 30000;

  useEffect(() => {
    const passPayload = JSON.stringify({
      tcc_id: schoolId || '---',
      name: fullName || 'Student',
      dept: department || 'CIT',
      sec: section || '---',
      epoch: currentEpoch,
      v: 1,
    });

    QRCode.toString(passPayload, {
      type: 'svg',
      margin: 1,
      color: {
        dark: '#0a0a0a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((svg) => {
        setQrSvg(svg);
      })
      .catch((err) => {
        console.warn('Failed to render pass QR SVG:', err);
      });

    QRCode.toDataURL(passPayload, {
      width: 256,
      margin: 1,
      color: {
        dark: '#0a0a0a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.warn('Failed to render pass QR data URL:', err);
      });
  }, [schoolId, fullName, department, section, currentEpoch]);

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
            {fullName || 'Student'}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground font-mono">
            {department} · ID {schoolId || '---'} · {section || '---'}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-4 text-center">
          {/* Dynamic 30s Real Scannable QR Display */}
          <div className="w-full max-w-[280px] p-4 rounded-2xl border border-border bg-white shadow-sm flex flex-col items-center gap-3">
            <div className="w-56 h-56 min-h-[224px] bg-white flex items-center justify-center relative p-1 rounded-xl">
              {qrSvg ? (
                <div
                  className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:shape-rendering-crispEdges"
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                />
              ) : qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Student Pass QR Code"
                  className="w-full h-full object-contain rounded-sm"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <QrCode className="size-16 text-muted-foreground/30 animate-pulse" />
                </div>
              )}

              {/* Holographic Watermark Scan Animation */}
              <div className="absolute inset-x-2 top-2 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-bounce opacity-40 pointer-events-none" />
            </div>

            {/* Countdown Progress & Label */}
            <div className="w-full pt-2.5 flex items-center justify-between gap-3 text-[11px] border-t border-border/60">
              <span className="flex items-center gap-1.5 font-medium text-muted-foreground shrink-0">
                <QrCode className="size-3.5 text-foreground shrink-0" />
                <span>Official Pass</span>
              </span>
              <span className="font-mono font-semibold text-foreground shrink-0 bg-muted/60 px-2 py-0.5 rounded text-[11px]">
                Refreshes in {passCountdown}s
              </span>
            </div>
          </div>

          {/* Device Verification Badge */}
          <div className="w-full max-w-[280px] p-2.5 rounded-xl border border-border bg-muted/30 flex items-center justify-between text-left">
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-foreground flex items-center gap-1">
                <ShieldCheck className="size-3.5 text-foreground" />
                Verified Device
              </span>
              <span className="text-[10px] text-muted-foreground">
                Present this to the SBO officer for scanning
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-2 max-w-[280px] mx-auto w-full">
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
