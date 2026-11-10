import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  CalendarDays,
  CalendarPlus,
  Check,
  Trash2,
  Plus,
  Eye,
  Calendar,
} from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { toast } from 'sonner';
import { TCC_DEPARTMENTS } from '@/types/student';
import {
  ClearanceEvent,
  EventDayConfig,
  EventScanMode,
  DEFAULT_ACTIVE_EVENT,
  SboOfficerSession,
} from '@/types/attendance';

interface CreateEventCardProps {
  officer: SboOfficerSession;
  activeEvent: ClearanceEvent;
  onUpdateActiveEvent: (event: ClearanceEvent) => void;
}

export const EVENTS_STORAGE_KEY = 'TCC_ALL_EVENTS_LIST';

// Convert a date string into YYYY-MM-DD for native date picker
function toIsoDate(dateStr: string, baseDateStr?: string, dayOffset: number = 0): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

  const currentYear = baseDateStr ? new Date(baseDateStr).getFullYear() : new Date().getFullYear();
  const parsed = new Date(`${dateStr}, ${currentYear}`);
  if (!isNaN(parsed.getTime())) {
    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const dd = String(parsed.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  if (baseDateStr) {
    const b = new Date(baseDateStr);
    if (!isNaN(b.getTime())) {
      b.setDate(b.getDate() + dayOffset);
      const yyyy = b.getFullYear();
      const mm = String(b.getMonth() + 1).padStart(2, '0');
      const dd = String(b.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }
  }

  return new Date().toISOString().split('T')[0];
}

function formatIsoToBadge(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return isoStr;
  }
}

// Generate consecutive day configurations starting from a date
function generateDays(
  totalDays: number,
  startDateStr: string,
  existingDays?: EventDayConfig[],
  defaultScanMode: EventScanMode = '4-slots'
): EventDayConfig[] {
  const result: EventDayConfig[] = [];
  const baseDate = new Date(startDateStr);

  const defaultThemes = [
    'Opening & Parade',
    'Ball Games',
    'Athletics & Esports',
    'Semifinals & Cultural Night',
    'Championship & Awarding',
    'Department Socials',
    'Culmination',
  ];

  for (let i = 0; i < totalDays; i++) {
    const dayLabel = `Day ${i + 1}`;
    const nextDate = new Date(baseDate);
    if (!isNaN(baseDate.getTime())) {
      nextDate.setDate(baseDate.getDate() + i);
    }
    const yyyy = nextDate.getFullYear();
    const mm = String(nextDate.getMonth() + 1).padStart(2, '0');
    const dd = String(nextDate.getDate()).padStart(2, '0');
    const isoString = isNaN(nextDate.getTime()) ? '' : `${yyyy}-${mm}-${dd}`;
    const dateFormatted = isNaN(nextDate.getTime())
      ? `Day ${i + 1}`
      : nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const existing = existingDays?.[i];

    result.push({
      day: dayLabel,
      date: existing?.date || dateFormatted,
      isoDate: existing?.isoDate || isoString,
      theme: existing?.theme || defaultThemes[i % defaultThemes.length],
      scanMode: existing?.scanMode || defaultScanMode,
    });
  }

  return result;
}

export const CreateEventCard: React.FC<CreateEventCardProps> = ({
  officer,
  activeEvent,
  onUpdateActiveEvent,
}) => {
  // Saved events list
  const [eventsList, setEventsList] = useState<ClearanceEvent[]>(() => {
    try {
      const saved = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      DEFAULT_ACTIVE_EVENT,
      {
        id: 'tcc-tech-week-2026',
        title: 'CIT Tech Week 2026',
        department: 'CIT',
        schoolYear: '2025-2026',
        semester: '2nd Semester',
        totalDays: 3,
        scanMode: '4-slots',
        days: [
          { day: 'Day 1', date: 'Feb 18', theme: 'Hackathon', scanMode: '4-slots' },
          { day: 'Day 2', date: 'Feb 19', theme: 'Workshops', scanMode: '4-slots' },
          { day: 'Day 3', date: 'Feb 20', theme: 'Awarding', scanMode: '2-slots' },
        ],
        status: 'upcoming',
        createdAt: '2026-02-01',
        createdByOfficer: 'Christian Motas',
      },
    ];
  });

  // Dialog controls
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [viewingEvent, setViewingEvent] = useState<ClearanceEvent | null>(null);

  // Form states for creating event
  const [eventTitle, setEventTitle] = useState('');
  const [departmentScope, setDepartmentScope] = useState('All Departments');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [numDays, setNumDays] = useState<number>(5);
  const [scanMode, setScanMode] = useState<EventScanMode>('4-slots');
  const [daysSchedule, setDaysSchedule] = useState<EventDayConfig[]>(() =>
    generateDays(5, new Date().toISOString().split('T')[0], undefined, '4-slots')
  );

  // Sync days schedule when numDays or startDate changes
  useEffect(() => {
    setDaysSchedule((prev) => generateDays(numDays, startDate, prev, scanMode));
  }, [numDays, startDate]);

  const handleScanModeChange = (newMode: EventScanMode) => {
    setScanMode(newMode);
    setDaysSchedule((prev) =>
      prev.map((d) => ({
        ...d,
        scanMode: newMode,
      }))
    );
  };

  const handleDayScanModeChange = (index: number, newMode: EventScanMode) => {
    setDaysSchedule((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], scanMode: newMode };
      }
      return copy;
    });
  };

  const handleDayThemeChange = (index: number, newTheme: string) => {
    setDaysSchedule((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], theme: newTheme };
      }
      return copy;
    });
  };

  const handleDayIsoDateChange = (index: number, newIsoDate: string) => {
    if (!newIsoDate) return;
    const formatted = formatIsoToBadge(newIsoDate);
    setDaysSchedule((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], isoDate: newIsoDate, date: formatted };
      }
      return copy;
    });
  };

  const handleCreateAndActivateEvent = (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventTitle.trim()) {
      toast.error('Event Title Required');
      return;
    }

    if (numDays < 1 || numDays > 14) {
      toast.error('Duration must be between 1 and 14 days');
      return;
    }

    const newEvent: ClearanceEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: eventTitle.trim(),
      department: departmentScope,
      schoolYear: '2025-2026',
      semester: '1st Semester',
      totalDays: numDays,
      scanMode: scanMode,
      days: daysSchedule,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      createdByOfficer: officer.name,
    };

    const updatedList = [
      newEvent,
      ...eventsList.map((ev) => (ev.id === newEvent.id ? newEvent : { ...ev, status: 'upcoming' as const })),
    ];
    setEventsList(updatedList);
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updatedList));
    } catch {}

    onUpdateActiveEvent(newEvent);
    const scanLabel = scanMode === '2-slots' ? '2 Scans/Day' : '4 Scans/Day';
    toast.success(`"${newEvent.title}" Activated (${newEvent.totalDays} Days · ${scanLabel})`);

    // Reset and close dialog
    setEventTitle('');
    setIsCreateDialogOpen(false);
  };

  const handleSetActiveExisting = (targetEvent: ClearanceEvent) => {
    const updated = eventsList.map((ev) => ({
      ...ev,
      status: (ev.id === targetEvent.id ? 'active' : 'upcoming') as 'active' | 'upcoming',
    }));
    setEventsList(updated);
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    onUpdateActiveEvent({ ...targetEvent, status: 'active' });
    toast.success(`"${targetEvent.title}" is now the active gate event`);
  };

  const handleDeleteEvent = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (id === activeEvent.id) {
      toast.error('Cannot delete the active event');
      return;
    }
    const updated = eventsList.filter((ev) => ev.id !== id);
    setEventsList(updated);
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    toast.success('Event removed');
  };

  return (
    <div className="w-full space-y-4">
      {/* Events Table Card */}
      <Card className="border border-border/80 shadow-xs bg-card rounded-xl">
        <CardHeader className="py-4 px-6 border-b border-border/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-0.5">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" />
              <span>Clearance Events</span>
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {eventsList.length}
              </span>
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Configure campus events, duty schedules, and active gate clearance requirements.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => setIsCreateDialogOpen(true)}
            className="h-8 px-3.5 text-xs font-medium gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <Plus className="size-3.5" />
            <span>Add Event</span>
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/20 hover:bg-muted/20">
                <TableHead className="w-[300px] pl-6 text-xs font-semibold text-foreground">
                  Event & Scope
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground">
                  Schedule & Dates
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground">
                  Daily Requirement
                </TableHead>
                <TableHead className="text-xs font-semibold text-foreground">
                  Status
                </TableHead>
                <TableHead className="text-right pr-6 text-xs font-semibold text-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventsList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-xs text-muted-foreground">
                    No clearance events found. Click "Add Event" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                eventsList.map((ev) => {
                  const isActive = ev.id === activeEvent.id;
                  const firstDate = ev.days[0]?.date || 'Day 1';
                  const lastDate = ev.days[ev.days.length - 1]?.date || `Day ${ev.totalDays}`;

                  return (
                    <TableRow
                      key={ev.id}
                      className={isActive ? 'bg-primary/[0.03] hover:bg-primary/[0.06]' : undefined}
                    >
                      {/* Event Title & Department Scope */}
                      <TableCell className="pl-6 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                            {ev.title}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            {ev.department} · {ev.schoolYear || '2025-2026'}
                          </span>
                        </div>
                      </TableCell>

                      {/* Schedule & Dates */}
                      <TableCell className="py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-medium font-mono text-foreground">
                            {ev.totalDays} {ev.totalDays === 1 ? 'Day' : 'Days'}
                          </span>
                          <span className="text-[11px] text-muted-foreground font-mono">
                            {firstDate} – {lastDate}
                          </span>
                        </div>
                      </TableCell>

                      {/* Daily Scan Requirement */}
                      <TableCell className="py-3.5">
                        {ev.scanMode === '2-slots' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                            2 Scans (AM In, PM Out)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                            4 Scans (In/Out AM & PM)
                          </span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3.5">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Active Duty</span>
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground font-medium">
                            Upcoming
                          </span>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right pr-6 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isActive ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleSetActiveExisting(ev)}
                              className="h-7 px-2.5 text-xs font-medium cursor-pointer"
                            >
                              Activate
                            </Button>
                          ) : (
                            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 px-2">
                              <Check className="size-3.5" />
                              <span>Active</span>
                            </span>
                          )}

                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => setViewingEvent(ev)}
                            title="View Daily Schedule"
                            className="h-7 w-7 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
                          >
                            <Eye className="size-3.5" />
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={(e) => handleDeleteEvent(ev.id, e)}
                            disabled={isActive}
                            title={isActive ? 'Active event cannot be deleted' : 'Delete event'}
                            className="h-7 w-7 p-0 cursor-pointer text-muted-foreground hover:text-destructive disabled:opacity-30 disabled:pointer-events-none"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Event Dialog (Preserves the exact create event field design) */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      >
        <DialogContent
          className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl"
          onPointerDownOutside={(e) => {
            // Prevent accidental close when clicking on portaled popovers
            const target = e.target as HTMLElement | null;
            if (target?.closest('[role="dialog"]') || target?.closest('.calendar-popover')) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader className="p-5 border-b border-border/40 text-left">
            <DialogTitle className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
              <CalendarPlus className="size-4 text-primary" />
              <span>Create New Event</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Configure event details, duration schedule, and daily scan requirements.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAndActivateEvent} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-5 overflow-y-auto space-y-4 max-h-[calc(90vh-140px)]">
              <FieldGroup className="gap-3.5">
                {/* Event Title */}
                <Field className="gap-1">
                  <FieldLabel htmlFor="event-title" className="text-xs font-medium text-foreground">
                    Title
                  </FieldLabel>
                  <Input
                    id="event-title"
                    placeholder="e.g. TCC Intramurals 2026"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </Field>

                {/* Department, Start Date & Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Field className="gap-1">
                    <FieldLabel htmlFor="dept-scope" className="text-xs font-medium text-foreground">
                      Department
                    </FieldLabel>
                    <Select value={departmentScope} onValueChange={setDepartmentScope}>
                      <SelectTrigger id="dept-scope" className="h-9 text-xs">
                        <SelectValue placeholder="Scope" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All Departments">All Departments</SelectItem>
                        {TCC_DEPARTMENTS.map((dept) => (
                          <SelectItem key={dept.code} value={dept.code}>
                            {dept.code} · {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field className="gap-1">
                    <FieldLabel className="text-xs font-medium text-foreground">
                      Start Date
                    </FieldLabel>
                    <DatePicker
                      date={new Date(startDate + 'T00:00:00')}
                      onSelect={(d) => {
                        if (d) {
                          const yyyy = d.getFullYear();
                          const mm = String(d.getMonth() + 1).padStart(2, '0');
                          const dd = String(d.getDate()).padStart(2, '0');
                          setStartDate(`${yyyy}-${mm}-${dd}`);
                        }
                      }}
                      buttonClassName="h-9 w-full"
                    />
                  </Field>

                  <Field className="gap-1">
                    <FieldLabel htmlFor="event-duration" className="text-xs font-medium text-foreground">
                      Duration
                    </FieldLabel>
                    <Select
                      value={numDays.toString()}
                      onValueChange={(val) => setNumDays(Number(val))}
                    >
                      <SelectTrigger id="event-duration" className="h-9 text-xs">
                        <SelectValue placeholder="Duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 14 }, (_, i) => i + 1).map((d) => (
                          <SelectItem key={d} value={d.toString()}>
                            {d} {d === 1 ? 'Day' : 'Days'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                {/* Daily Scan Requirement */}
                <Field className="gap-1">
                  <FieldLabel htmlFor="scan-mode" className="text-xs font-medium text-foreground">
                    Daily Scan Requirement
                  </FieldLabel>
                  <Select
                    value={scanMode}
                    onValueChange={(val) => handleScanModeChange(val as EventScanMode)}
                  >
                    <SelectTrigger id="scan-mode" className="h-9 text-xs">
                      <SelectValue placeholder="Select requirement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4-slots">
                        Morning & Afternoon (Time In & Time Out) · 4 scans/day
                      </SelectItem>
                      <SelectItem value="2-slots">
                        Morning Time In & Afternoon Time Out only · 2 scans/day
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                {/* Schedule Days */}
                <Field className="gap-1.5">
                  <FieldLabel className="text-xs font-medium text-foreground">
                    Schedule ({numDays} Days)
                  </FieldLabel>

                  <div className="space-y-1.5">
                    {daysSchedule.map((dayItem, idx) => (
                      <div
                        key={dayItem.day}
                        className="p-2 rounded-lg border border-border/80 bg-muted/20 flex flex-col sm:flex-row sm:items-center gap-2"
                      >
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono font-bold text-[11px] shrink-0 border border-primary/20 w-14 text-center">
                            {dayItem.day}
                          </span>

                          <DatePicker
                            date={
                              new Date(
                                (dayItem.isoDate || toIsoDate(dayItem.date, startDate, idx)) +
                                  'T00:00:00'
                              )
                            }
                            onSelect={(d) => {
                              if (d) {
                                const yyyy = d.getFullYear();
                                const mm = String(d.getMonth() + 1).padStart(2, '0');
                                const dd = String(d.getDate()).padStart(2, '0');
                                handleDayIsoDateChange(idx, `${yyyy}-${mm}-${dd}`);
                              }
                            }}
                            buttonClassName="w-[105px]"
                          />
                        </div>

                        <Input
                          value={dayItem.theme || ''}
                          onChange={(e) => handleDayThemeChange(idx, e.target.value)}
                          placeholder="Theme (optional)"
                          className="h-7 text-xs flex-1 bg-background"
                        />

                        <Select
                          value={dayItem.scanMode || scanMode}
                          onValueChange={(val) => handleDayScanModeChange(idx, val as EventScanMode)}
                        >
                          <SelectTrigger className="h-7 w-full sm:w-[130px] text-[11px] shrink-0 bg-background font-medium">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="4-slots" className="text-xs">
                              4 Scans (In/Out AM & PM)
                            </SelectItem>
                            <SelectItem value="2-slots" className="text-xs">
                              2 Scans (AM In, PM Out)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </Field>
              </FieldGroup>
            </div>

            <DialogFooter className="p-4 border-t border-border/40 bg-muted/20 flex flex-row items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateDialogOpen(false)}
                className="h-8 px-3 text-xs cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-8 px-4 text-xs font-medium gap-1.5 cursor-pointer shadow-xs"
              >
                <Check className="size-3.5" />
                <span>Create & Activate Event</span>
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Event Schedule Details Dialog */}
      <Dialog
        open={!!viewingEvent}
        onOpenChange={(open) => !open && setViewingEvent(null)}
      >
        {viewingEvent && (
          <DialogContent className="max-w-md p-5 rounded-2xl">
            <DialogHeader className="text-left pb-2 border-b border-border/40">
              <DialogTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="size-4 text-primary" />
                <span>{viewingEvent.title}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {viewingEvent.department} · {viewingEvent.totalDays} Days Schedule
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2 py-3 max-h-[60vh] overflow-y-auto">
              {viewingEvent.days.map((d, i) => (
                <div
                  key={d.day || i}
                  className="p-2.5 rounded-lg border border-border/70 bg-muted/20 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono font-bold text-[11px]">
                      {d.day}
                    </span>
                    <div>
                      <span className="font-semibold block text-foreground">{d.theme || 'General Attendance'}</span>
                      <span className="text-[11px] text-muted-foreground font-mono">{d.date}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-border bg-card">
                    {d.scanMode === '2-slots' ? '2 Scans' : '4 Scans'}
                  </span>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setViewingEvent(null)}
                className="w-full text-xs h-8 cursor-pointer"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default CreateEventCard;
