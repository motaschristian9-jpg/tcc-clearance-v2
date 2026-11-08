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

interface ClearanceMatrixCardProps {
  fullName: string;
  schoolId: string;
  section: string;
  onBackToPass: () => void;
}

export const ClearanceMatrixCard: React.FC<ClearanceMatrixCardProps> = ({
  fullName,
  schoolId,
  section,
  onBackToPass,
}) => {
  return (
    <main className="w-full max-w-sm mx-auto my-auto py-6">
      <Card className="border border-border shadow-sm">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-between pb-1">
            <button
              type="button"
              onClick={onBackToPass}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              <span>Pass</span>
            </button>
            <span className="text-[11px] font-mono text-muted-foreground">
              CIT-2026-0081
            </span>
          </div>

          <span className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground block">
            Official Clearance Card
          </span>
          <CardTitle className="text-xl font-semibold tracking-tight text-foreground mt-0.5">
            CIT Intramurals 2026
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {fullName} · {section} · ID {schoolId}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          {[
            {
              day: 'Day 1',
              date: 'Nov 10',
              slots: ['In: 07:54 AM ✓', 'Out: 11:45 AM ✓', 'In: 01:10 PM ✓', 'Out: 05:02 PM ✓'],
              cleared: true,
            },
            {
              day: 'Day 2',
              date: 'Nov 11',
              slots: ['In: 08:02 AM ✓', 'Out: 11:50 AM ✓', 'In: Pending', 'Out: Pending'],
              cleared: false,
            },
            {
              day: 'Day 3',
              date: 'Nov 12',
              slots: ['In: Pending', 'Out: Pending', 'In: Pending', 'Out: Pending'],
              cleared: false,
            },
            {
              day: 'Day 4',
              date: 'Nov 13',
              slots: ['In: Pending', 'Out: Pending', 'In: Pending', 'Out: Pending'],
              cleared: false,
            },
            {
              day: 'Day 5',
              date: 'Nov 14',
              slots: ['In: Pending', 'Out: Pending', 'In: Pending', 'Out: Pending'],
              cleared: false,
            },
          ].map((item, index) => (
            <div
              key={item.day}
              className={`border border-border rounded-lg p-2.5 text-xs flex flex-col gap-1.5 ${
                item.cleared ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-muted/10'
              }`}
            >
              <div className="flex items-center justify-between font-medium">
                <span className="font-semibold text-foreground text-xs">
                  {item.day} · {item.date}
                </span>
                {item.cleared ? (
                  <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="size-3" />
                    <span>Cleared</span>
                  </span>
                ) : index === 1 ? (
                  <span className="text-[10px] text-amber-600 font-medium">In Progress</span>
                ) : (
                  <span className="text-[10px] text-muted-foreground font-normal">Upcoming</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-1 font-mono text-[10px] text-muted-foreground">
                {item.slots.map((s, idx) => (
                  <div
                    key={idx}
                    className={`px-2 py-0.5 rounded ${
                      s.includes('✓')
                        ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-medium'
                        : 'bg-muted/30'
                    }`}
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => alert('Exporting clearance card PDF...')}
            className="w-full h-10 text-xs font-medium gap-2"
          >
            <Download className="size-3.5" />
            <span>Export Activity Card (PDF)</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onBackToPass}
            className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            Back to QR Pass
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
};
