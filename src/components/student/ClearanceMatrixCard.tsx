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
import { ArrowLeft, Download, CheckCircle2 } from 'lucide-react';
import { DayAttendance } from '@/types/attendance';

interface ClearanceMatrixCardProps {
  fullName: string;
  schoolId: string;
  section: string;
  attendanceRecords: DayAttendance[];
  onBack: () => void;
}

export const ClearanceMatrixCard: React.FC<ClearanceMatrixCardProps> = ({
  fullName,
  schoolId,
  section,
  attendanceRecords,
  onBack,
}) => {
  const totalSlots = attendanceRecords.length * 4;
  const clearedSlotsCount = attendanceRecords.reduce((acc, curr) => {
    let count = 0;
    if (curr.slots['morning-in']) count++;
    if (curr.slots['morning-out']) count++;
    if (curr.slots['afternoon-in']) count++;
    if (curr.slots['afternoon-out']) count++;
    return acc + count;
  }, 0);

  return (
    <main className="w-full max-w-sm mx-auto my-auto py-6">
      <Card className="border border-border shadow-sm">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-between pb-1">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              <span>Dashboard</span>
            </button>
            <span className="text-[11px] font-mono text-muted-foreground">
              {clearedSlotsCount}/{totalSlots} Cleared
            </span>
          </div>

          <span className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground block">
            Official Clearance Card
          </span>
          <CardTitle className="text-xl font-semibold tracking-tight text-foreground mt-0.5">
            CIT Intramurals 2026
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {fullName || 'Student'} · {section || '3A'} · ID {schoolId || '20241373'}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          {attendanceRecords.map((item) => {
            const isDayCleared =
              !!item.slots['morning-in'] &&
              !!item.slots['morning-out'] &&
              !!item.slots['afternoon-in'] &&
              !!item.slots['afternoon-out'];

            const hasAnySlot =
              !!item.slots['morning-in'] ||
              !!item.slots['morning-out'] ||
              !!item.slots['afternoon-in'] ||
              !!item.slots['afternoon-out'];

            const slotItems = [
              { label: 'M-In', value: item.slots['morning-in'] },
              { label: 'M-Out', value: item.slots['morning-out'] },
              { label: 'A-In', value: item.slots['afternoon-in'] },
              { label: 'A-Out', value: item.slots['afternoon-out'] },
            ];

            return (
              <div
                key={item.day}
                className={`border border-border rounded-lg p-2.5 text-xs flex flex-col gap-1.5 ${
                  isDayCleared
                    ? 'bg-emerald-500/5 border-emerald-500/20'
                    : hasAnySlot
                    ? 'bg-muted/20 border-border/80'
                    : 'bg-muted/10'
                }`}
              >
                <div className="flex items-center justify-between font-medium">
                  <span className="font-semibold text-foreground text-xs">
                    {item.day} · {item.date}
                  </span>
                  {isDayCleared ? (
                    <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="size-3" />
                      <span>Cleared</span>
                    </span>
                  ) : hasAnySlot ? (
                    <span className="text-[10px] text-amber-600 font-medium">In Progress</span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground font-normal">Upcoming</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1 font-mono text-[10px] text-muted-foreground">
                  {slotItems.map((s, idx) => (
                    <div
                      key={idx}
                      className={`px-2 py-0.5 rounded truncate ${
                        s.value
                          ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-medium'
                          : 'bg-muted/30'
                      }`}
                    >
                      {s.label}: {s.value ? `${s.value} ✓` : 'Pending'}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => alert(`Exporting CIT Intramurals Clearance Card for ${fullName}...`)}
            className="w-full h-10 text-xs font-medium gap-2 cursor-pointer"
          >
            <Download className="size-3.5" />
            <span>Export Activity Card (PDF)</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="w-full h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Back to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
};
