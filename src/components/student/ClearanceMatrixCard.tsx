import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Download, CheckCircle2, ShieldCheck } from 'lucide-react';
import { DayAttendance, ClearanceEvent, DEFAULT_ACTIVE_EVENT } from '@/types/attendance';
import { generateClearanceCardPdf } from '@/lib/pdf';
import { toast } from 'sonner';

interface ClearanceMatrixCardProps {
  title?: string;
  fullName: string;
  schoolId: string;
  department?: string;
  section: string;
  attendanceRecords: DayAttendance[];
  event?: ClearanceEvent;
  onBack: () => void;
}

export const ClearanceMatrixCard: React.FC<ClearanceMatrixCardProps> = ({
  title = 'Event Clearance Card',
  fullName,
  schoolId,
  department = 'CIT',
  section,
  attendanceRecords,
  event,
  onBack,
}) => {
  const [isExporting, setIsExporting] = useState(false);
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
    const toastId = toast.loading(`Generating official ${title} PDF for ${fullName || 'Student'}...`);

    try {
      const activeEv = event || {
        ...DEFAULT_ACTIVE_EVENT,
        title,
        department,
      };
      const filename = await generateClearanceCardPdf({
        event: activeEv,
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
        description: 'Failed to generate PDF document.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Navigation & Header - Full Width */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 rounded-xl border border-border bg-card shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onBack}
              className="h-8 px-2.5 text-xs gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              <span>Dashboard</span>
            </Button>
            <span className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
              Official Clearance Activity Card
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground pt-1">
            {title}
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            Student: <span className="font-semibold text-foreground font-sans">{fullName}</span> · ID: {schoolId} · Section: {section}
          </p>
        </div>

        {/* Progress & Export Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg border border-border bg-muted/30 text-right">
            <span className="text-[10px] text-muted-foreground block uppercase font-medium">Clearance Progress</span>
            <span className="font-mono text-xs font-semibold text-foreground">
              {clearedSlotsCount}/{totalSlots} Slots ({percent}%)
            </span>
          </div>

          <Button
            type="button"
            onClick={handleExportPdf}
            disabled={isExporting}
            className="h-9 text-xs font-medium gap-2 cursor-pointer shadow-xs"
          >
            <Download className="size-3.5" />
            <span>{isExporting ? 'Generating...' : 'Export PDF'}</span>
          </Button>
        </div>
      </div>

      {/* 5-Day Full-Screen Responsive Matrix Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
                  ? 'border-emerald-500/40 bg-emerald-500/[0.02] shadow-xs'
                  : 'border-border shadow-xs'
              }`}
            >
              <CardHeader className="p-3.5 pb-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground">{item.day}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">{item.date}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {slotsFilled}/{dayTotalSlots} Slots
                  </span>
                  {item.cleared ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3" />
                      Day Cleared
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {slotsFilled === 0 ? 'Not Started' : 'In Progress'}
                    </span>
                  )}
                </div>
              </CardHeader>

              <Separator />

              <CardContent className="p-3.5 space-y-2.5 flex-1">
                {slotDefinitions.map(({ label, key }) => {
                  const stampTime = item.slots[key];
                  const officer = item.slotOfficers?.[key];

                  return (
                    <div key={key} className="p-2 rounded-md border border-border/70 bg-card space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">{label}</span>
                        {stampTime ? (
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="size-3" />
                            {stampTime}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/60 font-mono text-[10px]">Pending</span>
                        )}
                      </div>

                      {/* Stamped By Officer Signature */}
                      {officer && (
                        <div className="text-[9px] text-muted-foreground pt-1 border-t border-border/40 flex items-center justify-between gap-1">
                          <span className="truncate">
                            By: <strong className="text-foreground font-medium">{officer.officerName}</strong>
                          </span>
                          <span className="font-mono text-[8.5px] opacity-75 shrink-0">
                            {officer.officerPosition}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </CardContent>

              <CardFooter className="p-3 pt-0 text-[10px] text-muted-foreground border-t border-border/40 mt-auto flex items-center justify-between">
                <span>Official Stamp</span>
                <span className="font-mono">{item.date}, 2026</span>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Official Sign-off & Verification Status */}
      <Card className="border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-600" />
              <h3 className="text-sm font-semibold text-foreground">
                Department Clearance Verification
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Each slot is verified and stamped when an SBO officer scans your pass. Complete all required slots to obtain semester clearance.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground shrink-0">
            <div className="p-3 rounded-lg border border-border bg-muted/20 text-center min-w-[140px]">
              <span className="text-[10px] block uppercase text-muted-foreground">SBO Sign-off</span>
              <span className="font-semibold text-foreground font-sans">
                {clearedSlotsCount > 0 ? `${clearedSlotsCount} Stamped` : 'Pending Scans'}
              </span>
              <span className="text-[9px] block text-muted-foreground font-sans">Event Attendance</span>
            </div>

            <div className="p-3 rounded-lg border border-border bg-muted/20 text-center min-w-[140px]">
              <span className="text-[10px] block uppercase text-muted-foreground">Dean Approval</span>
              <span className="font-semibold text-foreground font-sans">
                {clearedSlotsCount >= totalSlots && totalSlots > 0 ? 'Approved' : 'Pending Completion'}
              </span>
              <span className="text-[9px] block text-muted-foreground font-sans">Final Clearance</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
