import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  QrCode,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  ArrowRight,
  Download,
  ScanLine,
  ShieldCheck,
  Award,
  FileCheck2,
  RefreshCw,
} from 'lucide-react';
import { DayAttendance } from '@/types/attendance';
import { fetchPublishedEvents } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export interface ClearanceActivity {
  id: string;
  title: string;
  category: string;
  dateRange: string;
  venue: string;
  totalSlots: number;
  clearedSlots: number;
  status: 'ongoing' | 'upcoming' | 'completed';
  isDownloadedOffline: boolean;
}

interface StudentDashboardProps {
  fullName: string;
  schoolId: string;
  department: string;
  section: string;
  photoDataUrl: string | null;
  userEmail: string;
  attendanceRecords: DayAttendance[];
  onOpenQrPass: () => void;
  onViewActivityCard: (activityId: string) => void;
  onSignOut: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  fullName,
  schoolId,
  department,
  section,
  photoDataUrl,
  userEmail,
  attendanceRecords,
  onOpenQrPass,
  onViewActivityCard,
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'ongoing' | 'upcoming'>('all');
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Real activities loaded from database (zero mock items by default)
  const [activities, setActivities] = useState<ClearanceActivity[]>([]);

  const loadEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const liveEvents = await fetchPublishedEvents(department);
      setActivities(liveEvents);
    } catch (err) {
      console.warn('Failed to load events:', err);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [department]);

  // Real calculation of cleared slots directly from attendanceRecords
  const totalClearedSlots = attendanceRecords.reduce((acc, curr) => {
    let count = 0;
    if (curr.slots['morning-in']) count++;
    if (curr.slots['morning-out']) count++;
    if (curr.slots['afternoon-in']) count++;
    if (curr.slots['afternoon-out']) count++;
    return acc + count;
  }, 0);

  // Extract actual recorded stamps
  const recentStamps: { day: string; slotLabel: string; time: string; date: string }[] = [];
  attendanceRecords.forEach((rec) => {
    if (rec.slots['afternoon-out']) recentStamps.push({ day: rec.day, slotLabel: 'Afternoon Out', time: rec.slots['afternoon-out'], date: rec.date });
    if (rec.slots['afternoon-in']) recentStamps.push({ day: rec.day, slotLabel: 'Afternoon In', time: rec.slots['afternoon-in'], date: rec.date });
    if (rec.slots['morning-out']) recentStamps.push({ day: rec.day, slotLabel: 'Morning Out', time: rec.slots['morning-out'], date: rec.date });
    if (rec.slots['morning-in']) recentStamps.push({ day: rec.day, slotLabel: 'Morning In', time: rec.slots['morning-in'], date: rec.date });
  });

  const handleDownloadPack = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDownloadingId(id);
    setTimeout(() => {
      setActivities((prev) =>
        prev.map((act) => (act.id === id ? { ...act, isDownloadedOffline: true } : act))
      );
      setDownloadingId(null);
    }, 600);
  };

  const filteredActivities = activities.filter((act) => {
    if (filter === 'all') return true;
    return act.status === filter;
  });

  const overallCleared = totalClearedSlots;
  const overallTotal = activities.reduce((acc, a) => acc + a.totalSlots, 0);
  const overallPercent = overallTotal > 0 ? Math.round((overallCleared / overallTotal) * 100) : 0;

  return (
    <div className="w-full space-y-6">
      {/* Top Welcome Hero Banner - Spans Full Width */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Student Overview */}
          <div className="flex items-center gap-4">
            <div className="relative size-16 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center shrink-0 shadow-xs">
              {photoDataUrl ? (
                <img
                  src={photoDataUrl}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-xl font-bold text-foreground">
                  {fullName ? fullName.charAt(0) : 'T'}
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                  {fullName || 'Student Name'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="size-3" />
                  Verified Student
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-mono">
                <span>ID: {schoolId || '20241373'}</span>
                <span>•</span>
                <span>Section: {section || '3A'}</span>
                <span>•</span>
                <span className="font-sans text-muted-foreground">{department}</span>
                <span>•</span>
                <span className="font-sans">{userEmail}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t lg:border-t-0 lg:border-l border-border pt-4 lg:pt-0 lg:pl-6">
            <div className="p-3 rounded-lg bg-muted/30 border border-border/60">
              <span className="text-[11px] text-muted-foreground block">Clearance Progress</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                {overallTotal > 0 ? (
                  <>
                    <span className="text-lg font-bold text-foreground">{overallPercent}%</span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      ({overallCleared}/{overallTotal})
                    </span>
                  </>
                ) : (
                  <span className="text-xs font-medium text-muted-foreground pt-1">
                    No active events
                  </span>
                )}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/30 border border-border/60">
              <span className="text-[11px] text-muted-foreground block">Active Cards</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg font-bold text-foreground">{activities.length}</span>
                <span className="text-[11px] text-muted-foreground">Events</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/30 border border-border/60 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-muted-foreground block">Device Status</span>
              <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="size-4 shrink-0" />
                <span>Device Linked</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-Only: Attendance Pass directly below User Card */}
      <div className="block lg:hidden">
        <Card className="border border-border bg-card shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
              <ScanLine className="size-4" />
              <span>Attendance Pass</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Present your QR pass to SBO officers for attendance verification.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              size="lg"
              onClick={onOpenQrPass}
              className="w-full h-11 text-xs font-semibold gap-2.5 shadow-sm cursor-pointer"
            >
              <QrCode className="size-4" />
              <span>Show My QR Pass</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Responsive Grid: 8 Cols (Activities) + 4 Cols (QR Pass & Side Hub) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Upcoming Activities & Clearance Cards */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-semibold tracking-tight text-foreground">
                    Clearance Activities
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Required events and attendance cards for semester clearance.
                  </CardDescription>
                </div>

                {activities.length > 0 && (
                  <div className="flex items-center gap-1 p-0.5 rounded-lg border border-border bg-muted/30 text-xs">
                    <button
                      type="button"
                      onClick={() => setFilter('all')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        filter === 'all'
                          ? 'bg-background text-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      All ({activities.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilter('ongoing')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        filter === 'ongoing'
                          ? 'bg-background text-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Ongoing
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilter('upcoming')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                        filter === 'upcoming'
                          ? 'bg-background text-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Upcoming
                    </button>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {filteredActivities.length > 0 ? (
                /* Responsive Cards Grid when real events exist */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredActivities.map((activity) => {
                    const currentCleared = activity.clearedSlots;
                    const percent =
                      activity.totalSlots > 0
                        ? Math.round((currentCleared / activity.totalSlots) * 100)
                        : 0;

                    return (
                      <div
                        key={activity.id}
                        className="group p-4 rounded-xl border border-border bg-card hover:border-foreground/30 hover:shadow-sm transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${
                                activity.status === 'ongoing'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : 'bg-muted text-muted-foreground border border-border'
                              }`}
                            >
                              {activity.status}
                            </span>
                            {activity.isDownloadedOffline ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium font-mono">
                                <CheckCircle2 className="size-3" />
                                Offline Ready
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={downloadingId === activity.id}
                                onClick={(e) => handleDownloadPack(e, activity.id)}
                                className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground underline underline-offset-2 cursor-pointer"
                              >
                                <Download className="size-3" />
                                <span>{downloadingId === activity.id ? 'Saving...' : 'Save Pack'}</span>
                              </button>
                            )}
                          </div>

                          <div>
                            <span className="text-[11px] text-muted-foreground">
                              {activity.category}
                            </span>
                            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
                              {activity.title}
                            </h3>
                          </div>

                          <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="size-3.5 shrink-0 text-muted-foreground" />
                              <span>{activity.dateRange}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="size-3.5 shrink-0 text-muted-foreground" />
                              <span className="truncate">{activity.venue}</span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 pt-2 border-t border-border/60">
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Clock className="size-3 text-muted-foreground" />
                                Required Stamps
                              </span>
                              <span className="font-medium text-foreground font-mono">
                                {currentCleared}/{activity.totalSlots} Slots ({percent}%)
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-foreground transition-all duration-300"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewActivityCard(activity.id)}
                            className="w-full h-9 text-xs font-medium justify-between group-hover:border-foreground/40 cursor-pointer"
                          >
                            <span>Open Clearance Card</span>
                            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Clean Empty State when no events exist in database */
                <div className="py-12 px-4 text-center border border-dashed border-border rounded-xl bg-muted/10 space-y-3">
                  <Calendar className="size-8 mx-auto text-muted-foreground/40" />
                  <div>
                    <h3 className="font-medium text-sm text-foreground">
                      No Clearance Activities Scheduled
                    </h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadEvents}
                    disabled={isLoadingEvents}
                    className="h-8 text-xs cursor-pointer gap-1.5"
                  >
                    <RefreshCw className={cn("size-3.5", isLoadingEvents && "animate-spin")} />
                    <span>{isLoadingEvents ? 'Checking...' : 'Check for Updates'}</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attendance Stamp History Record */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                <FileCheck2 className="size-4" />
                <span>Attendance Stamp History</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Time In and Time Out stamps recorded by SBO officers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentStamps.length > 0 ? (
                <div className="divide-y divide-border/60 text-xs">
                  {recentStamps.map((stamp, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="font-medium text-foreground block">
                          {stamp.day} · {stamp.slotLabel}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {stamp.date}, 2026 · SBO Scanner
                        </span>
                      </div>
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-emerald-600 dark:text-emerald-400">
                        {stamp.time}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  <Clock className="size-5 mx-auto text-muted-foreground/40 mb-1.5" />
                  <p className="font-medium text-muted-foreground">No attendance stamps yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Attendance QR Pass Generator & Academic Summary */}
        <div className="lg:col-span-4 space-y-6">
          {/* Desktop-Only: Prominent Attendance QR Pass Card */}
          <div className="hidden lg:block">
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
                  <ScanLine className="size-4" />
                  <span>Attendance Pass</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Present your QR pass to SBO officers for attendance verification.
                </CardDescription>
              </CardHeader>

              <CardContent>
                {/* QR Action Button - Task-Oriented & Action First */}
                <Button
                  type="button"
                  size="lg"
                  onClick={onOpenQrPass}
                  className="w-full h-11 text-xs font-semibold gap-2.5 shadow-sm cursor-pointer"
                >
                  <QrCode className="size-4" />
                  <span>Show My QR Pass</span>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Student Academic Record Card */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Award className="size-3.5" />
                <span>Academic Record</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Department</span>
                <span className="font-medium text-foreground">{department}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Class Section</span>
                <span className="font-medium text-foreground font-mono">{section || '---'}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Student ID</span>
                <span className="font-mono font-medium text-foreground">{schoolId || '---'}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Academic Year</span>
                <span className="font-mono font-medium text-foreground">2025-2026</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
