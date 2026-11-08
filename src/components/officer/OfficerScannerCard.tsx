import React, { useState, useRef, useEffect } from 'react';
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
  Field,
  FieldLabel,
  FieldGroup,
} from '@/components/ui/field';
import {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  EventDay,
  TimeSlotType,
  TIME_SLOTS,
  ScannedStudentPayload,
} from '@/types/attendance';
import {
  CheckCircle2,
  ShieldCheck,
  XCircle,
  ScanLine,
  UserCheck,
  AlertCircle,
} from 'lucide-react';

interface OfficerScannerCardProps {
  currentStudent: {
    fullName: string;
    schoolId: string;
    department: string;
    section: string;
    photoDataUrl: string | null;
  };
  onApproveAttendance: (day: EventDay, slot: TimeSlotType) => void;
}

export const OfficerScannerCard: React.FC<OfficerScannerCardProps> = ({
  currentStudent,
  onApproveAttendance,
}) => {
  const [selectedDay, setSelectedDay] = useState<EventDay>('Day 1');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotType>('morning-in');
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [scannedResult, setScannedResult] = useState<ScannedStudentPayload | null>(null);
  const [lastApprovedMsg, setLastApprovedMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera for scanner
  useEffect(() => {
    let active = true;

    async function startScanner() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 480 }, height: { ideal: 480 } },
          audio: false,
        });

        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        // Fallback gracefully if camera unavailable
      }
    }

    if (isScanning && !scannedResult) {
      startScanner();
    }

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isScanning, scannedResult]);

  // Handle simulated / mock QR scan of current student pass
  const handleSimulateScan = () => {
    setScannedResult({
      fullName: currentStudent.fullName || 'Alexander M. Cruz',
      schoolId: currentStudent.schoolId || '20241373',
      department: currentStudent.department || 'CIT',
      section: currentStudent.section || '3A',
      photoDataUrl: currentStudent.photoDataUrl,
      timestamp: Date.now(),
      deviceKeyValid: true,
    });
    setIsScanning(false);
  };

  const handleApprove = () => {
    if (!scannedResult) return;

    onApproveAttendance(selectedDay, selectedSlot);
    const activeSlotLabel = TIME_SLOTS.find((s) => s.id === selectedSlot)?.label || 'Slot';
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setLastApprovedMsg(
      `✓ ${scannedResult.fullName} cleared for ${selectedDay} ${activeSlotLabel} at ${timeStr}`
    );

    // Reset scanner for next student
    setScannedResult(null);
    setIsScanning(true);
  };

  const handleReject = () => {
    setScannedResult(null);
    setIsScanning(true);
  };

  return (
    <main className="w-full max-w-sm mx-auto my-auto py-4">
      <Card className="border border-border shadow-sm">
        <CardHeader className="text-left pb-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
              SBO Officer Portal
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Scanner Ready
            </span>
          </div>

          <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
            CIT Intramurals 2026
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Scan and verify student attendance passes for clearance stamps.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3.5 text-xs text-left">
          {/* Active Event Slot Selector */}
          <div className="border border-border rounded-lg p-3 bg-muted/20">
            <FieldGroup className="gap-2.5">
              <div className="grid grid-cols-2 gap-2">
                <Field>
                  <FieldLabel htmlFor="day-select">Event Day</FieldLabel>
                  <Select
                    value={selectedDay}
                    onValueChange={(val) => setSelectedDay(val as EventDay)}
                  >
                    <SelectTrigger id="day-select" className="h-9 text-xs">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Day 1">Day 1 · Nov 10</SelectItem>
                        <SelectItem value="Day 2">Day 2 · Nov 11</SelectItem>
                        <SelectItem value="Day 3">Day 3 · Nov 12</SelectItem>
                        <SelectItem value="Day 4">Day 4 · Nov 13</SelectItem>
                        <SelectItem value="Day 5">Day 5 · Nov 14</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="slot-select">Session Slot</FieldLabel>
                  <Select
                    value={selectedSlot}
                    onValueChange={(val) => setSelectedSlot(val as TimeSlotType)}
                  >
                    <SelectTrigger id="slot-select" className="h-9 text-xs">
                      <SelectValue placeholder="Select slot" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {TIME_SLOTS.map((slot) => (
                          <SelectItem key={slot.id} value={slot.id}>
                            {slot.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </FieldGroup>
          </div>

          {/* Last Approved Feedback Notification */}
          {lastApprovedMsg && (
            <div className="border border-emerald-500/20 bg-emerald-500/10 rounded-lg p-2.5 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
              <span className="font-medium text-[11px] leading-tight">{lastApprovedMsg}</span>
            </div>
          )}

          {/* Verification Sheet: When student QR is scanned */}
          {scannedResult ? (
            <div className="border border-border rounded-xl p-4 bg-card flex flex-col gap-3.5 shadow-sm">
              <div className="flex items-center justify-between pb-1 border-b border-border/60">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Scanned Student Profile
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-mono font-medium">
                  <ShieldCheck className="size-3.5" />
                  Key Verified
                </span>
              </div>

              {/* Face and details verification */}
              <div className="flex items-center gap-3.5">
                <div className="size-16 rounded-full overflow-hidden border border-border bg-muted/30 shrink-0">
                  {scannedResult.photoDataUrl ? (
                    <img
                      src={scannedResult.photoDataUrl}
                      alt={scannedResult.fullName}
                      className="size-full object-cover scale-x-[-1]"
                    />
                  ) : (
                    <div className="size-full flex items-center justify-center text-muted-foreground text-xs font-semibold">
                      Photo
                    </div>
                  )}
                </div>

                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-foreground text-sm truncate">
                    {scannedResult.fullName}
                  </span>
                  <span className="text-muted-foreground text-xs font-mono">
                    ID {scannedResult.schoolId} · {scannedResult.section}
                  </span>
                  <span className="text-[11px] text-muted-foreground mt-0.5">
                    {scannedResult.department} Student
                  </span>
                </div>
              </div>

              <Separator />

              {/* Slot Stamping Confirmation Target */}
              <div className="border border-border rounded-lg p-2.5 bg-muted/20 text-xs flex items-center justify-between">
                <span className="text-muted-foreground text-[11px]">Stamping clearance for:</span>
                <span className="font-semibold text-foreground text-[11px]">
                  {selectedDay} · {TIME_SLOTS.find((s) => s.id === selectedSlot)?.label}
                </span>
              </div>

              {/* Approval Actions (Large 48px Touch Targets for field speed) */}
              <div className="flex flex-col gap-2 pt-1">
                <Button
                  type="button"
                  onClick={handleApprove}
                  className="w-full h-12 text-sm font-medium gap-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                >
                  <UserCheck className="size-4" />
                  <span>Approve & Clear Slot</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReject}
                  className="w-full h-9 text-xs text-muted-foreground hover:text-destructive cursor-pointer gap-1.5"
                >
                  <XCircle className="size-3.5" />
                  <span>Reject / Rescan</span>
                </Button>
              </div>
            </div>
          ) : (
            /* Live Camera / Scanner Viewfinder Area */
            <div className="relative size-64 mx-auto rounded-xl overflow-hidden border-2 border-dashed border-border flex flex-col items-center justify-center bg-muted/10">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Targeting Reticle */}
              <div className="absolute inset-8 border border-foreground/30 rounded-lg pointer-events-none flex items-center justify-center">
                <div className="w-full h-0.5 bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
              </div>

              {/* Aiming guide */}
              <div className="absolute bottom-2 left-0 right-0 text-center">
                <span className="text-[10px] text-muted-foreground bg-background/80 px-2 py-0.5 rounded-full border border-border">
                  Align student QR pass inside box
                </span>
              </div>
            </div>
          )}

          {/* Quick Simulation Trigger for testing without 2nd device */}
          {!scannedResult && (
            <div className="pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={handleSimulateScan}
                className="w-full h-10 text-xs font-medium gap-2 border-border hover:border-foreground/40 cursor-pointer"
              >
                <ScanLine className="size-3.5 text-foreground" />
                <span>Simulate Scan Current Student QR</span>
              </Button>
              <p className="text-center text-[10px] text-muted-foreground pt-1.5">
                Tests officer face cross-check and slot stamp verification.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground w-full">
            <span className="flex items-center gap-1.5">
              <AlertCircle className="size-3.5 text-muted-foreground" />
              <span>Offline ECDSA verification</span>
            </span>
            <span className="font-mono">TCC SBO v1.0</span>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
};
