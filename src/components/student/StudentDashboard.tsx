import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
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
  Wifi,
  Sparkles,
  ShieldCheck,
  Award,
  Layers,
  FileCheck2,
} from 'lucide-react';

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
  onOpenQrPass,
  onViewActivityCard,
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'ongoing' | 'upcoming'>('all');

  const [activities, setActivities] = useState<ClearanceActivity[]>([
    {
      id: 'cit-intramurals-2026',
      title: `${department} Intramurals 2026`,
      category: 'Major College Event',
      dateRange: 'Nov 10 – Nov 14, 2026',
      venue: 'TCC Gymnasium & Sports Complex',
      totalSlots: 20,
      clearedSlots: 6,
      status: 'ongoing',
      isDownloadedOffline: true,
    },
    {
      id: 'cit-general-assembly',
      title: `${department} General Assembly & Symposium`,
      category: 'Department Assembly',
      dateRange: 'Dec 05, 2026 · 08:00 AM',
      venue: 'TCC Audio-Visual Room (AVR)',
      totalSlots: 2,
      clearedSlots: 0,
      status: 'upcoming',
      isDownloadedOffline: false,
    },
    {
      id: 'academic-clearance-2026',
      title: '2nd Sem Academic Clearance 2025-2026',
      category: 'Institutional Clearance',
      dateRange: 'March 18 – March 22, 2026',
      venue: 'Registrar & Department Offices',
      totalSlots: 4,
      clearedSlots: 0,
      status: 'upcoming',
      isDownloadedOffline: false,
    },
  ]);

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

  const overallCleared = activities.reduce((acc, a) => acc + a.clearedSlots, 0);
  const overallTotal = activities.reduce((acc, a) => acc + a.totalSlots, 0);
  const overallPercent = Math.round((overallCleared / overallTotal) * 100);

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
                <span className="text-lg font-bold text-foreground">{overallPercent}%</span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  ({overallCleared}/{overallTotal})
                </span>
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
              <span className="text-[11px] text-muted-foreground block">Device Binding</span>
              <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="size-4 shrink-0" />
                <span>ECDSA Bound</span>
              </div>
            </div>
          </div>
        </div>
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
                    Upcoming Activity & Clearance Cards
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Official event cards requiring attendance stamps for semester clearance.
                  </CardDescription>
                </div>

                {/* Filter Tabs */}
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
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Responsive Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredActivities.map((activity) => {
                  const percent = Math.round(
                    (activity.clearedSlots / activity.totalSlots) * 100
                  );

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

                        {/* Schedule & Venue */}
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
                        {/* Slots Progress Bar */}
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Clock className="size-3 text-muted-foreground" />
                              Clearance Slots
                            </span>
                            <span className="font-medium text-foreground font-mono">
                              {activity.clearedSlots}/{activity.totalSlots} Signed ({percent}%)
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full bg-foreground transition-all duration-300"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>

                        {/* Open Action */}
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
            </CardContent>
          </Card>

          {/* Recent Stamping Activity Log */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                <FileCheck2 className="size-4" />
                <span>Recent Attendance Stamp Records</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Official time in and time out stamps recorded by SBO gate scanners.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border/60 text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-medium text-foreground block">
                      Day 2 · Morning In (Gym Gate 1)
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Nov 11, 2026 · SBO Officer Scanner #3
                    </span>
                  </div>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted">
                    08:02 AM
                  </span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-medium text-foreground block">
                      Day 1 · Afternoon Out (Grandstand Gate)
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Nov 10, 2026 · SBO Auditor
                    </span>
                  </div>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted">
                    05:02 PM
                  </span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-medium text-foreground block">
                      Day 1 · Afternoon In (Grandstand Gate)
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Nov 10, 2026 · SBO Auditor
                    </span>
                  </div>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted">
                    01:10 PM
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Attendance QR Pass Generator & Device Hub */}
        <div className="lg:col-span-4 space-y-6">
          {/* Prominent Attendance QR Pass Card */}
          <Card className="border-2 border-foreground/30 bg-muted/10 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground">
                  <Sparkles className="size-3.5" />
                  <span>Check-In Pass</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 font-medium">
                  <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Active
                </span>
              </div>
              <CardTitle className="text-lg font-semibold tracking-tight text-foreground pt-1">
                Generate Attendance QR
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                Present your rotating cryptographic QR pass to SBO officers at event entrance and exit gates.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* QR Action Button */}
              <Button
                type="button"
                size="lg"
                onClick={onOpenQrPass}
                className="w-full h-12 text-xs font-semibold gap-2.5 shadow-sm cursor-pointer"
              >
                <QrCode className="size-4" />
                <span>Show Active QR Pass</span>
              </Button>

              <div className="p-3 rounded-lg border border-border bg-card space-y-2 text-xs">
                <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                  <span className="flex items-center gap-1">
                    <Wifi className="size-3" /> Offline Mode
                  </span>
                  <span className="font-medium text-foreground">Supported</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                  <span>Pass Refresh Rate</span>
                  <span className="font-mono font-medium text-foreground">Every 30s</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                  <span>Security Signature</span>
                  <span className="font-mono text-emerald-600 font-medium">ECDSA P-256</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-0 text-[11px] text-muted-foreground leading-relaxed">
              No internet connection required at venue gates. Passes are verified cryptographically offline.
            </CardFooter>
          </Card>

          {/* Student Profile Card */}
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
                <span className="font-medium text-foreground font-mono">{section || '3A'}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Student ID</span>
                <span className="font-mono font-medium text-foreground">{schoolId || '20241373'}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Academic Year</span>
                <span className="font-mono font-medium text-foreground">2025-2026</span>
              </div>
            </CardContent>
          </Card>

          {/* Security & Anti-Cheating Notice */}
          <Card className="border border-border bg-muted/20 shadow-xs">
            <CardContent className="p-4 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-foreground text-xs">
                <Layers className="size-3.5" />
                <span>One Account, One Device</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Your clearance pass is cryptographically bound to this physical phone. Taking screenshots or transferring accounts is automatically flagged by SBO scanners.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
