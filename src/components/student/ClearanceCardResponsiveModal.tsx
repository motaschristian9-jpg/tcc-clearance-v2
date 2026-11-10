import * as React from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Download,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { ClearanceEvent, DayAttendance } from '@/types/attendance';
import { generateClearanceCardPdf } from '@/lib/pdf';
import { toast } from 'sonner';

interface ClearanceCardResponsiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: ClearanceEvent;
  fullName: string;
  schoolId: string;
  department: string;
  section: string;
  attendanceRecords: DayAttendance[];
}

export const ClearanceCardResponsiveModal: React.FC<ClearanceCardResponsiveModalProps> = ({
  open,
  onOpenChange,
  event,
  fullName,
  schoolId,
  department,
  section,
  attendanceRecords,
}) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [isExporting, setIsExporting] = React.useState(false);

  // Compute total slots and cleared slots
  const totalSlots = attendanceRecords.reduce((acc, curr) => {
    return acc + (curr.scanMode === '2-slots' ? 2 : 4);
  }, 0);

  const clearedSlotsCount = attendanceRecords.reduce((acc, curr) => {
    let count = 0;
    if (curr.slots['morning-in']) count++;
    if (curr.scanMode !== '2-slots' && curr.slots['morning-out']) count++;
    if (curr.scanMode !== '2-slots' && curr.slots['afternoon-in']) count++;
    if (curr.slots['afternoon-out']) count++;
    return acc + count;
  }, 0);

  const percent = totalSlots > 0 ? Math.round((clearedSlotsCount / totalSlots) * 100) : 0;

  const handleExportPdf = async () => {
    setIsExporting(true);
    const toastId = toast.loading(`Preparing official ${event.title} PDF certificate...`);

    try {
      const filename = await generateClearanceCardPdf({
        event,
        fullName,
        schoolId,
        department,
        section,
        attendanceRecords,
      });
      toast.success('Clearance PDF Downloaded', {
        id: toastId,
        description: `Successfully exported ${filename}`,
      });
    } catch (err) {
      console.error('Failed to export PDF:', err);
      toast.error('Export Failed', {
        id: toastId,
        description: 'An error occurred while compiling the PDF document.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Reusable Clearance Card Content
  const modalContent = (
    <div className="flex flex-col h-full max-h-[80vh] overflow-hidden">
      {/* Top Details & Progress Ribbon */}
      <div className="p-4 sm:p-5 border-b border-border/80 bg-muted/20 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="size-3" />
                <span>{event.department || department} Clearance</span>
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                {event.semester || '1st Semester'} · {event.schoolYear || '2025-2026'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground pt-0.5">
              <span>
                Student: <strong className="text-foreground">{fullName || 'Student'}</strong>
              </span>
              <span>•</span>
              <span className="font-mono">ID: {schoolId || '---'}</span>
              <span>•</span>
              <span>Sec: {section || '---'}</span>
            </div>
          </div>

          {/* Quick Metrics & Export Button */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <div className="px-3 py-1.5 rounded-lg border border-border bg-card text-right shadow-2xs">
              <span className="text-[10px] text-muted-foreground block font-medium uppercase tracking-wider">
                Progress
              </span>
              <span className="font-mono text-xs font-bold text-foreground">
                {clearedSlotsCount}/{totalSlots} ({percent}%)
              </span>
            </div>

            <Button
              type="button"
              onClick={handleExportPdf}
              disabled={isExporting}
              size="sm"
              className="h-8 sm:h-9 text-xs font-semibold gap-2 cursor-pointer shadow-xs"
            >
              <Download className="size-3.5" />
              <span>{isExporting ? 'Generating...' : 'Export PDF'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable Matrix Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {/* Attendance Days Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {attendanceRecords.map((item) => {
            const dayTotalSlots = item.scanMode === '2-slots' ? 2 : 4;
            const slotsFilled =
              (item.slots['morning-in'] ? 1 : 0) +
              (item.scanMode !== '2-slots' && item.slots['morning-out'] ? 1 : 0) +
              (item.scanMode !== '2-slots' && item.slots['afternoon-in'] ? 1 : 0) +
              (item.slots['afternoon-out'] ? 1 : 0);

            const slotDefinitions =
              item.scanMode === '2-slots'
                ? [
                    { label: 'Morning In', key: 'morning-in' as const },
                    { label: 'Afternoon Out', key: 'afternoon-out' as const },
                  ]
                : [
                    { label: 'Morning In', key: 'morning-in' as const },
                    { label: 'Morning Out', key: 'morning-out' as const },
                    { label: 'Afternoon In', key: 'afternoon-in' as const },
                    { label: 'Afternoon Out', key: 'afternoon-out' as const },
                  ];

            return (
              <Card
                key={item.day}
                className={`border transition-all flex flex-col justify-between ${
                  item.cleared
                    ? 'border-emerald-500/40 bg-emerald-500/[0.03] shadow-2xs'
                    : 'border-border shadow-2xs'
                }`}
              >
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-foreground">{item.day}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{item.date}</span>
                  </div>
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {slotsFilled}/{dayTotalSlots} Slots
                    </span>
                    {item.cleared ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="size-3" />
                        Cleared
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground font-medium">Pending</span>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-3 pt-1 space-y-1.5 flex-1">
                  {slotDefinitions.map((slot) => {
                    const timeStamp = item.slots[slot.key];
                    const isStamped = !!timeStamp;
                    const stampInfo = item.slotOfficers?.[slot.key];
                    const officerName =
                      typeof stampInfo === 'object' && stampInfo !== null
                        ? stampInfo.officerName
                        : typeof stampInfo === 'string'
                        ? stampInfo
                        : 'CIT-SBO Officer';

                    return (
                      <div
                        key={slot.key}
                        className={`p-2 rounded-md border text-[11px] transition-colors ${
                          isStamped
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-950 dark:text-emerald-100'
                            : 'border-border/60 bg-muted/20 text-muted-foreground'
                        }`}
                      >
                        <div className="flex items-center justify-between font-medium">
                          <span>{slot.label}</span>
                          {isStamped ? (
                            <span className="font-bold flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="size-3" />
                              Stamped
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground font-normal">
                              Pending
                            </span>
                          )}
                        </div>
                        {isStamped && (
                          <div className="mt-1 pt-1 border-t border-emerald-500/20 text-[10px] font-mono flex flex-col">
                            <span className="text-emerald-700 dark:text-emerald-300 font-semibold truncate">
                              {officerName}
                            </span>
                            <span className="text-muted-foreground">{timeStamp}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Desktop: shadcn Dialog
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-4 sm:p-5 pb-3 border-b border-border bg-card">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                {event.title}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground font-mono">
              Official Student Clearance Card · Department of {department || 'CIT'}
            </DialogDescription>
          </DialogHeader>
          {modalContent}
        </DialogContent>
      </Dialog>
    );
  }

  // Mobile: shadcn Drawer (Vaul)
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[92vh] flex flex-col p-0 focus:outline-none">
        <DrawerHeader className="p-4 pb-2 border-b border-border bg-card text-left">
          <DrawerTitle className="text-base font-bold tracking-tight text-foreground">
            {event.title}
          </DrawerTitle>
          <DrawerDescription className="text-xs text-muted-foreground font-mono">
            Official Student Clearance Card · {department || 'CIT'}
          </DrawerDescription>
        </DrawerHeader>

        {modalContent}

        <DrawerFooter className="p-3 border-t border-border bg-card">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full h-8 text-xs cursor-pointer">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
