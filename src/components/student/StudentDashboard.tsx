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
  ChevronRight,
  LogOut,
  Download,
  Wifi,
  Sparkles,
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
  onSignOut,
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Activities tailored to the student's department
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
    }, 700);
  };

  return (
    <main className="w-full max-w-sm mx-auto my-auto py-6 space-y-4">
      {/* Student Identity Card */}
      <Card className="border border-border shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Verified Student
            </span>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={onSignOut}
              className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground gap-1 cursor-pointer"
            >
              <LogOut className="size-3" />
              <span>Sign Out</span>
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative size-12 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center shrink-0">
              {photoDataUrl ? (
                <img
                  src={photoDataUrl}
                  alt={fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-xs font-semibold text-muted-foreground">
                  {fullName ? fullName.charAt(0) : 'T'}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-foreground text-sm truncate leading-tight">
                {fullName || 'Student Name'}
              </h2>
              <p className="text-[11px] text-muted-foreground font-mono truncate">
                ID: {schoolId || '20241373'} · {section || '3A'}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">
                {department} · {userEmail}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prominent Action: Generate Attendance QR Code */}
      <Card className="border-2 border-foreground/20 bg-muted/10 shadow-sm hover:border-foreground/40 transition-colors">
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-primary" />
                <span className="text-[11px] font-semibold tracking-wide uppercase text-foreground">
                  Event Pass
                </span>
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                Attendance Check-In Pass
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Generate your rotating cryptographic QR code to present to SBO officers for attendance stamping.
              </p>
            </div>
            <div className="size-9 rounded-lg bg-foreground text-background flex items-center justify-center shrink-0 shadow-xs">
              <QrCode className="size-5" />
            </div>
          </div>

          <Button
            type="button"
            size="lg"
            onClick={onOpenQrPass}
            className="w-full h-11 text-xs font-medium gap-2 shadow-xs cursor-pointer"
          >
            <QrCode className="size-4" />
            <span>Generate Attendance QR</span>
          </Button>

          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5 font-mono">
            <span className="flex items-center gap-1">
              <Wifi className="size-3" /> Works 100% Offline
            </span>
            <span>30s Refresh Window</span>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Activities & Clearance Cards */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
                Clearance Activities
              </CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground">
                Your college events and required clearance cards
              </CardDescription>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">
              {activities.length} Events
            </span>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-1 space-y-2.5">
          {activities.map((activity) => {
            const percent = Math.round((activity.clearedSlots / activity.totalSlots) * 100);

            return (
              <div
                key={activity.id}
                onClick={() => onViewActivityCard(activity.id)}
                className="group relative p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-all cursor-pointer space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-medium uppercase tracking-wider ${
                          activity.status === 'ongoing'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {activity.status}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {activity.category}
                      </span>
                    </div>
                    <h4 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors truncate">
                      {activity.title}
                    </h4>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5 shrink-0 mt-1" />
                </div>

                {/* Event Schedule & Venue */}
                <div className="space-y-1 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5 truncate">
                    <Calendar className="size-3 shrink-0" />
                    <span>{activity.dateRange}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="size-3 shrink-0" />
                    <span className="truncate">{activity.venue}</span>
                  </div>
                </div>

                <Separator />

                {/* Slots Cleared Progress & Offline Download */}
                <div className="flex items-center justify-between text-[11px] pt-0.5">
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3 text-muted-foreground" />
                    <span className="font-medium text-foreground">
                      {activity.clearedSlots}/{activity.totalSlots} Slots
                    </span>
                    <span className="text-muted-foreground text-[10px]">
                      ({percent}% signed)
                    </span>
                  </div>

                  {activity.isDownloadedOffline ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
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

                {/* Progress Bar */}
                <div className="w-full h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-foreground transition-all duration-300"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>

        <CardFooter className="p-4 pt-1 text-center">
          <p className="text-[10px] text-muted-foreground w-full">
            All clearance stamps are cryptographically verified by department SBO officers.
          </p>
        </CardFooter>
      </Card>
    </main>
  );
};

