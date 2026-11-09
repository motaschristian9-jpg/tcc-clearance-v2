import React, { useState } from 'react';
import { OfficerScannerCard } from './OfficerScannerCard';
import { GateScanLogsCard } from './GateScanLogsCard';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  LogOut,
  Users,
  UserCheck,
  UserMinus,
  ScanLine,
  ClipboardList,
} from 'lucide-react';
import {
  EventDay,
  TimeSlotType,
  TIME_SLOTS,
  SboOfficerSession,
  ScannedStudentPayload,
  GateScanLogEntry,
} from '@/types/attendance';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SboTerminalScreenProps {
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
  onLockTerminal: () => void;
  onReleaseTerminal?: () => void;
}

export const SboTerminalScreen: React.FC<SboTerminalScreenProps> = ({
  officer,
  currentStudent,
  onApproveAttendance,
  onLockTerminal,
  onReleaseTerminal,
}) => {
  const storageKey = `TCC_SBO_SCAN_LOGS_${officer.department}_${officer.stationCode}`;

  // Initialize logs from local storage or empty list
  const [scanLogs, setScanLogs] = useState<GateScanLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.warn('Failed to parse scan logs from storage:', err);
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState<'scanner' | 'logs'>('scanner');

  const handleApproveWithCount = (
    day: EventDay,
    slot: TimeSlotType,
    currentOfficer: SboOfficerSession,
    scannedStudent?: ScannedStudentPayload
  ) => {
    onApproveAttendance(day, slot, currentOfficer, scannedStudent);

    const studentName = scannedStudent?.fullName || currentStudent.fullName || 'Student';
    const schoolId = scannedStudent?.schoolId || currentStudent.schoolId || '---';
    const department = scannedStudent?.department || currentStudent.department || currentOfficer.department;
    const section = scannedStudent?.section || currentStudent.section || '---';
    const photo = scannedStudent?.photoDataUrl || currentStudent.photoDataUrl || null;
    const slotLabel = TIME_SLOTS.find((s) => s.id === slot)?.label || slot;

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = now.toLocaleDateString([], { month: 'short', day: 'numeric' });

    const newEntry: GateScanLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      studentName,
      schoolId,
      department,
      section,
      photoDataUrl: photo,
      day,
      slot,
      slotLabel,
      timestamp: Date.now(),
      timeFormatted,
      dateFormatted,
      stampedBy: {
        officerName: currentOfficer.name,
        position: currentOfficer.position,
        department: currentOfficer.department,
        stationCode: currentOfficer.stationCode,
      },
    };

    setScanLogs((prev) => {
      const updated = [newEntry, ...prev];
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    toast.success('Clearance Stamp Stored', {
      description: `${studentName} cleared for ${day} (${slotLabel}) by ${currentOfficer.name}.`,
    });
  };

  const handleClearLogs = () => {
    setScanLogs([]);
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    toast.info('Scan logs cleared for this station.');
  };

  return (
    <div className="w-full flex flex-col flex-1 max-w-6xl mx-auto px-2 sm:px-4">
      {/* Officer Terminal Top Status Bar */}
      <div className="w-full border-b border-border bg-card/40 backdrop-blur-md mb-4 py-2.5 px-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-foreground shrink-0">
            <ShieldCheck className="size-4" />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">
                {officer.department} SBO Gate Terminal
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                {officer.stationCode} Active
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <UserCheck className="size-3 text-primary" />
              <span>
                Officer: <strong className="font-medium text-foreground">{officer.name}</strong> · {officer.position}
              </span>
            </div>
          </div>
        </div>

        {/* Live Gate Counter & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-muted/30 text-xs">
            <Users className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground text-[11px]">Total Scanned:</span>
            <span className="font-mono font-semibold text-foreground text-[11px]">
              {scanLogs.length}
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onReleaseTerminal || onLockTerminal}
            className="h-8 text-xs gap-1.5 cursor-pointer text-muted-foreground hover:text-destructive"
            title="End shift and mark account as available"
          >
            <UserMinus className="size-3.5" />
            <span className="hidden sm:inline">End Shift</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onLockTerminal}
            className="h-8 text-xs gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
            title="Lock terminal screen"
          >
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">Lock</span>
          </Button>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden w-full items-center p-1 bg-muted/40 rounded-lg border border-border mb-3">
        <button
          type="button"
          onClick={() => setActiveTab('scanner')}
          className={cn(
            'flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer',
            activeTab === 'scanner'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <ScanLine className="size-3.5" />
          <span>Scanner View</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={cn(
            'flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer',
            activeTab === 'logs'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <ClipboardList className="size-3.5" />
          <span>Scan Logs</span>
          <span className="ml-1 px-1.5 py-0.2 text-[10px] font-mono rounded-full bg-primary/10 text-primary">
            {scanLogs.length}
          </span>
        </button>
      </div>

      {/* Main Terminal Area: Side-by-side on desktop, tabbed on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-6">
        {/* Left Column: Officer QR Scanner */}
        <div
          className={cn(
            'lg:col-span-5 w-full flex justify-center',
            activeTab === 'logs' && 'hidden lg:flex'
          )}
        >
          <OfficerScannerCard
            officer={officer}
            currentStudent={currentStudent}
            onApproveAttendance={handleApproveWithCount}
          />
        </div>

        {/* Right Column: Gate Scan Logs */}
        <div
          className={cn(
            'lg:col-span-7 w-full',
            activeTab === 'scanner' && 'hidden lg:block'
          )}
        >
          <GateScanLogsCard
            logs={scanLogs}
            stationCode={officer.stationCode}
            department={officer.department}
            onClearLogs={handleClearLogs}
          />
        </div>
      </div>
    </div>
  );
};

export default SboTerminalScreen;
