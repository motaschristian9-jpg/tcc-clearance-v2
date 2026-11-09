import React, { useState } from 'react';
import { OfficerScannerCard } from './OfficerScannerCard';
import { Button } from '@/components/ui/button';
import { ShieldCheck, LogOut, ArrowLeft, Users } from 'lucide-react';
import { EventDay, TimeSlotType } from '@/types/attendance';
import { toast } from 'sonner';

interface SboTerminalScreenProps {
  officer: {
    id: string;
    email: string;
    name: string;
    department: string;
    role: 'officer' | 'head';
  };
  currentStudent: {
    fullName: string;
    schoolId: string;
    department: string;
    section: string;
    photoDataUrl: string | null;
  };
  onApproveAttendance: (day: EventDay, slot: TimeSlotType) => void;
  onLockTerminal: () => void;
  onExitToStudentPortal: () => void;
}

export const SboTerminalScreen: React.FC<SboTerminalScreenProps> = ({
  officer,
  currentStudent,
  onApproveAttendance,
  onLockTerminal,
  onExitToStudentPortal,
}) => {
  const [stampedCount, setStampedCount] = useState<number>(0);

  const handleApproveWithCount = (day: EventDay, slot: TimeSlotType) => {
    onApproveAttendance(day, slot);
    setStampedCount((prev) => prev + 1);
    toast.success('Clearance Stamp Recorded', {
      description: `${currentStudent.fullName || 'Student'} stamped for ${day} (${slot}).`,
    });
  };

  return (
    <div className="w-full flex flex-col flex-1">
      {/* Officer Terminal Top Status Bar */}
      <div className="w-full border-b border-border bg-card/40 backdrop-blur-md mb-6 py-2.5 px-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-foreground shrink-0">
            <ShieldCheck className="size-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-foreground">SBO Gate Terminal</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                Active Duty
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground">
              Officer: <span className="font-medium text-foreground">{officer.name}</span> ({officer.department})
            </span>
          </div>
        </div>

        {/* Live Gate Counter & Actions */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-muted/30 text-xs">
            <Users className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground text-[11px]">Stamped:</span>
            <span className="font-mono font-semibold text-foreground text-[11px]">{stampedCount}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onLockTerminal}
            className="h-8 text-xs gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
            title="Lock terminal screen"
          >
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">Lock Terminal</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onExitToStudentPortal}
            className="h-8 text-xs gap-1 cursor-pointer text-muted-foreground hover:text-foreground"
            title="Return to Student Portal"
          >
            <ArrowLeft className="size-3.5" />
            <span className="hidden sm:inline">Student View</span>
          </Button>
        </div>
      </div>

      {/* Main Scanner Card Component */}
      <div className="flex-1 flex items-center justify-center">
        <OfficerScannerCard
          currentStudent={currentStudent}
          onApproveAttendance={handleApproveWithCount}
        />
      </div>
    </div>
  );
};
