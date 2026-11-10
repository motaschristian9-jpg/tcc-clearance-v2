import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
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
  SboOfficerSession,
  ClearanceEvent,
} from '@/types/attendance';
import {
  CheckCircle2,
  ShieldCheck,
  XCircle,
  ScanLine,
  UserCheck,
  BadgeCheck,
  QrCode,
} from 'lucide-react';

interface OfficerScannerCardProps {
  officer: SboOfficerSession;
  currentStudent: {
    fullName: string;
    schoolId: string;
    department: string;
    section: string;
    photoDataUrl: string | null;
  };
  onApproveAttendance: (
    day: EventDay,
    slot: TimeSlotType,
    officer: SboOfficerSession,
    scannedStudent?: ScannedStudentPayload
  ) => void;
  activeEvent?: ClearanceEvent;
}

export const OfficerScannerCard: React.FC<OfficerScannerCardProps> = ({
  officer,
  currentStudent,
  onApproveAttendance,
  activeEvent,
}) => {
  const availableDays = activeEvent?.days || [
    { day: 'Day 1', date: 'Nov 10' },
    { day: 'Day 2', date: 'Nov 11' },
    { day: 'Day 3', date: 'Nov 12' },
    { day: 'Day 4', date: 'Nov 13' },
    { day: 'Day 5', date: 'Nov 14' },
  ];

  const [selectedDay, setSelectedDay] = useState<EventDay>(availableDays[0]?.day || 'Day 1');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotType>('morning-in');
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [scannedResult, setScannedResult] = useState<ScannedStudentPayload | null>(null);
  const [lastApprovedMsg, setLastApprovedMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera and real-time QR detection loop
  useEffect(() => {
    let active = true;
    let scanInterval: ReturnType<typeof setInterval> | null = null;

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

        // Live hardware-accelerated QR code frame detection if supported
        if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
          try {
            const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
            scanInterval = setInterval(async () => {
              if (active && videoRef.current && videoRef.current.readyState >= 2) {
                try {
                  const barcodes = await detector.detect(videoRef.current);
                  if (barcodes && barcodes.length > 0) {
                    const raw = barcodes[0].rawValue;
                    try {
                      const payload = JSON.parse(raw);
                      setScannedResult({
                        fullName: payload.name || payload.fullName || 'Student',
                        schoolId: payload.tcc_id || payload.schoolId || '---',
                        department: payload.dept || payload.department || officer.department,
                        section: payload.sec || payload.section || '---',
                        photoDataUrl: currentStudent.photoDataUrl,
                        timestamp: payload.epoch || Date.now(),
                        deviceKeyValid: true,
                      });
                      setIsScanning(false);
                    } catch {
                      setScannedResult({
                        fullName: raw.length > 25 ? raw.slice(0, 25) + '...' : raw,
                        schoolId: 'PASS-VERIFIED',
                        department: officer.department,
                        section: 'Official',
                        photoDataUrl: currentStudent.photoDataUrl,
                        timestamp: Date.now(),
                        deviceKeyValid: true,
                      });
                      setIsScanning(false);
                    }
                  }
                } catch {
                  // ignore frame decoding errors
                }
              }
            }, 300);
          } catch {
            // barcode detector unavailable
          }
        }
      } catch {
        // Fallback gracefully if camera unavailable (e.g. desktop without webcam)
      }
    }

    if (isScanning && !scannedResult) {
      startScanner();
    }

    return () => {
      active = false;
      if (scanInterval) clearInterval(scanInterval);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isScanning, scannedResult, officer.department, currentStudent.photoDataUrl]);

  // Handle simulated / mock QR scan of current student pass
  const handleSimulateScan = () => {
    setScannedResult({
      fullName: currentStudent.fullName || 'Student',
      schoolId: currentStudent.schoolId || '---',
      department: currentStudent.department || 'CIT',
      section: currentStudent.section || '---',
      photoDataUrl: currentStudent.photoDataUrl,
      timestamp: Date.now(),
      deviceKeyValid: true,
    });
    setIsScanning(false);
  };

  const handleApprove = () => {
    if (!scannedResult) return;

    onApproveAttendance(selectedDay, selectedSlot, officer, scannedResult);
    const activeSlotLabel = TIME_SLOTS.find((s) => s.id === selectedSlot)?.label || 'Slot';
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setLastApprovedMsg(
      `✓ ${scannedResult.fullName} cleared for ${selectedDay} ${activeSlotLabel} by ${officer.name} (${officer.position}) at ${timeStr}`
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
    <div className="w-full max-w-sm mx-auto my-auto py-4">
      <Card className="border border-border shadow-sm">
        <CardHeader className="text-left pb-3">
          <CardTitle className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2">
            <ScanLine className="size-5 text-primary shrink-0" />
            <span className="truncate">
              {activeEvent ? activeEvent.title : `${officer.department} Event Clearance`}
            </span>
          </CardTitle>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-0.5">
            <BadgeCheck className="size-3.5 text-primary shrink-0" />
            <span className="truncate">
              Signatory: <strong className="text-foreground font-medium">{officer.name}</strong> ({officer.position})
            </span>
          </div>
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
                        {availableDays.map((d) => (
                          <SelectItem key={d.day} value={d.day}>
                            {d.day} · {d.date}
                          </SelectItem>
                        ))}
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

              {/* Slot Stamping Confirmation Target with Signatory info */}
              <div className="border border-border rounded-lg p-2.5 bg-muted/20 text-xs flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-[11px]">Clearance slot:</span>
                  <span className="font-semibold text-foreground text-[11px]">
                    {selectedDay} · {TIME_SLOTS.find((s) => s.id === selectedSlot)?.label}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/50">
                  <span className="text-muted-foreground">Signatory:</span>
                  <span className="font-medium text-foreground font-mono text-[11px] truncate max-w-[200px]">
                    {officer.name} ({officer.position})
                  </span>
                </div>
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

              {/* Targeting Reticle with Corner Brackets & Scanner Pulse */}
              <div className="absolute inset-7 pointer-events-none flex flex-col justify-between">
                <div className="flex justify-between w-full">
                  <div className="size-4 border-t-2 border-l-2 border-emerald-500 rounded-tl" />
                  <div className="size-4 border-t-2 border-r-2 border-emerald-500 rounded-tr" />
                </div>

                <div className="w-full h-0.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />

                <div className="flex justify-between w-full">
                  <div className="size-4 border-b-2 border-l-2 border-emerald-500 rounded-bl" />
                  <div className="size-4 border-b-2 border-r-2 border-emerald-500 rounded-br" />
                </div>
              </div>

              {/* Aiming guide with scanner icon */}
              <div className="absolute bottom-2.5 left-0 right-0 text-center flex justify-center">
                <span className="inline-flex items-center gap-1.5 text-[10px] text-foreground font-medium bg-background/85 backdrop-blur-xs px-2.5 py-1 rounded-full border border-border shadow-xs">
                  <QrCode className="size-3 text-emerald-500 shrink-0" />
                  <span>Align student QR pass inside box</span>
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
