import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
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
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Sparkles,
  Check,
  Plus,
  Minus,
  Building2,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { TCC_DEPARTMENTS } from '@/types/student';
import {
  ClearanceEvent,
  EventDayConfig,
  DEFAULT_ACTIVE_EVENT,
  SboOfficerSession,
} from '@/types/attendance';

interface CreateEventCardProps {
  officer: SboOfficerSession;
  activeEvent: ClearanceEvent;
  onUpdateActiveEvent: (event: ClearanceEvent) => void;
}

export const EVENTS_STORAGE_KEY = 'TCC_ALL_EVENTS_LIST';

// Generate consecutive day configurations starting from a date
function generateDays(totalDays: number, startDateStr: string, existingDays?: EventDayConfig[]): EventDayConfig[] {
  const result: EventDayConfig[] = [];
  const baseDate = new Date(startDateStr);

  const defaultThemes = [
    'Opening Ceremony & Parade',
    'Ball Games & Sports Tournament',
    'Academic Competitions & Esports',
    'Semifinal Games & Cultural Show',
    'Championship Finals & Awarding',
    'Department Socials & Exhibits',
    'Culmination & Closing Rites',
  ];

  for (let i = 0; i < totalDays; i++) {
    const dayLabel = `Day ${i + 1}`;
    const nextDate = new Date(baseDate);
    if (!isNaN(baseDate.getTime())) {
      nextDate.setDate(baseDate.getDate() + i);
    }
    const dateFormatted = isNaN(nextDate.getTime())
      ? `Day ${i + 1}`
      : nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const existing = existingDays?.[i];

    result.push({
      day: dayLabel,
      date: existing?.date || dateFormatted,
      theme: existing?.theme || defaultThemes[i % defaultThemes.length],
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
        days: [
          { day: 'Day 1', date: 'Feb 18', theme: 'Hackathon & Opening' },
          { day: 'Day 2', date: 'Feb 19', theme: 'Tech Seminars & Workshops' },
          { day: 'Day 3', date: 'Feb 20', theme: 'Project Pitching & Awarding' },
        ],
        status: 'upcoming',
        createdAt: '2026-02-01',
        createdByOfficer: 'Christian Motas',
      },
    ];
  });

  // Event form states
  const [eventTitle, setEventTitle] = useState('');
  const [departmentScope, setDepartmentScope] = useState('All Departments');
  const [schoolYear, setSchoolYear] = useState('2025-2026');
  const [semester, setSemester] = useState('1st Semester');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [numDays, setNumDays] = useState<number>(5);
  const [daysSchedule, setDaysSchedule] = useState<EventDayConfig[]>(() =>
    generateDays(5, new Date().toISOString().split('T')[0])
  );

  // Sync days schedule when numDays or startDate changes
  useEffect(() => {
    setDaysSchedule((prev) => generateDays(numDays, startDate, prev));
  }, [numDays, startDate]);

  const handleDayThemeChange = (index: number, newTheme: string) => {
    setDaysSchedule((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], theme: newTheme };
      }
      return copy;
    });
  };

  const handleDayDateChange = (index: number, newDate: string) => {
    setDaysSchedule((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], date: newDate };
      }
      return copy;
    });
  };

  const handleCreateAndActivateEvent = (e: React.FormEvent) => {
    e.preventDefault();

    if (!eventTitle.trim()) {
      toast.error('Event Title Required', {
        description: 'Please enter a name for the clearance event.',
      });
      return;
    }

    if (numDays < 1 || numDays > 14) {
      toast.error('Invalid Duration', {
        description: 'Event duration must be between 1 and 14 days.',
      });
      return;
    }

    const newEvent: ClearanceEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: eventTitle.trim(),
      department: departmentScope,
      schoolYear,
      semester,
      totalDays: numDays,
      days: daysSchedule,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      createdByOfficer: officer.name,
    };

    // Update events list
    const updatedList = [
      newEvent,
      ...eventsList.map((ev) => (ev.id === newEvent.id ? newEvent : { ...ev, status: 'upcoming' as const })),
    ];
    setEventsList(updatedList);
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updatedList));
    } catch {}

    // Activate event globally
    onUpdateActiveEvent(newEvent);

    toast.success('Event Created & Activated!', {
      description: `"${newEvent.title}" (${newEvent.totalDays} Days) is now active for gate clearance.`,
    });

    // Reset title for next event
    setEventTitle('');
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
    toast.success('Active Event Changed', {
      description: `"${targetEvent.title}" is now the active clearance event.`,
    });
  };

  const handleDeleteEvent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id === activeEvent.id) {
      toast.error('Cannot Delete Active Event', {
        description: 'Please activate another event before deleting this one.',
      });
      return;
    }
    const updated = eventsList.filter((ev) => ev.id !== id);
    setEventsList(updated);
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    toast.info('Event removed from presets.');
  };

  return (
    <div className="w-full flex flex-col gap-6 text-left">
      {/* Top Banner: Currently Active Clearance Event */}
      <div className="p-4 sm:p-5 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="size-11 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 text-primary">
            <Sparkles className="size-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ACTIVE CLEARANCE EVENT
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                {activeEvent.schoolYear} · {activeEvent.semester}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground mt-0.5">
              {activeEvent.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
              <span>{activeEvent.department}</span>
              <span>·</span>
              <span className="font-semibold text-foreground">
                {activeEvent.totalDays} Event Days ({activeEvent.totalDays * 4} Clearance Slots)
              </span>
              <span>·</span>
              <span>
                {activeEvent.days[0]?.date || 'Day 1'} to{' '}
                {activeEvent.days[activeEvent.days.length - 1]?.date || `Day ${activeEvent.totalDays}`}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
          <div className="px-3 py-1.5 rounded-xl border border-border bg-card/80 text-xs flex items-center gap-2">
            <Building2 className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground text-[11px]">Station:</span>
            <span className="font-semibold text-foreground font-mono">{officer.stationCode}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Column: Event Creation Form (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <Card className="border border-border/80 shadow-sm bg-card rounded-2xl">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <CalendarPlus className="size-4.5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold tracking-tight text-foreground">
                    Create New Clearance Event
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Set up event name, scope, duration, and clearance days schedule
                  </p>
                </div>
              </div>
            </CardHeader>

            <form onSubmit={handleCreateAndActivateEvent}>
              <CardContent className="p-5 sm:p-6 space-y-5">
                <FieldGroup className="gap-4">
                  {/* Event Title */}
                  <Field className="gap-1.5">
                    <FieldLabel htmlFor="event-title" className="text-xs font-semibold text-foreground">
                      Event Title / Name
                    </FieldLabel>
                    <Input
                      id="event-title"
                      placeholder="e.g. TCC Intramurals 2026, Foundation Day, or Tech Week"
                      value={eventTitle}
                      onChange={(e) => setEventTitle(e.target.value)}
                      className="h-10 text-sm font-medium"
                      required
                    />
                  </Field>

                  {/* Scope & Academic Year */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Field className="gap-1.5">
                      <FieldLabel htmlFor="dept-scope" className="text-xs font-semibold text-foreground">
                        Department Scope
                      </FieldLabel>
                      <Select value={departmentScope} onValueChange={setDepartmentScope}>
                        <SelectTrigger id="dept-scope" className="h-9 text-xs">
                          <SelectValue placeholder="Scope" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All Departments">All Departments (Campus-Wide)</SelectItem>
                          {TCC_DEPARTMENTS.map((dept) => (
                            <SelectItem key={dept.code} value={dept.code}>
                              {dept.code} ({dept.name})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>

                    <Field className="gap-1.5">
                      <FieldLabel htmlFor="school-year" className="text-xs font-semibold text-foreground">
                        School Year
                      </FieldLabel>
                      <Input
                        id="school-year"
                        value={schoolYear}
                        onChange={(e) => setSchoolYear(e.target.value)}
                        className="h-9 text-xs font-mono"
                        placeholder="2025-2026"
                      />
                    </Field>

                    <Field className="gap-1.5">
                      <FieldLabel htmlFor="semester-sel" className="text-xs font-semibold text-foreground">
                        Semester
                      </FieldLabel>
                      <Select value={semester} onValueChange={setSemester}>
                        <SelectTrigger id="semester-sel" className="h-9 text-xs">
                          <SelectValue placeholder="Semester" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1st Semester">1st Semester</SelectItem>
                          <SelectItem value="2nd Semester">2nd Semester</SelectItem>
                          <SelectItem value="Summer Term">Summer Term</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  {/* Start Date & How Many Days Is It? */}
                  <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-foreground block">
                          Event Duration & Schedule
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          Specify starting date and total number of days for attendance
                        </span>
                      </div>

                      {/* Number of Days Stepper */}
                      <div className="flex items-center gap-2 bg-background border border-border rounded-xl p-1 shadow-2xs self-start sm:self-auto">
                        <span className="text-xs font-semibold px-2 text-foreground">
                          How many days:
                        </span>
                        <button
                          type="button"
                          onClick={() => setNumDays((prev) => Math.max(1, prev - 1))}
                          className="size-7 rounded-lg border border-border hover:bg-muted flex items-center justify-center cursor-pointer transition-colors text-foreground disabled:opacity-40"
                          disabled={numDays <= 1}
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="text-sm font-bold font-mono px-2 text-primary">
                          {numDays} {numDays === 1 ? 'Day' : 'Days'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setNumDays((prev) => Math.min(14, prev + 1))}
                          className="size-7 rounded-lg border border-border hover:bg-muted flex items-center justify-center cursor-pointer transition-colors text-foreground disabled:opacity-40"
                          disabled={numDays >= 14}
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <Field className="gap-1.5">
                        <FieldLabel htmlFor="start-date" className="text-xs font-semibold text-foreground">
                          Start Date
                        </FieldLabel>
                        <Input
                          id="start-date"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="h-9 text-xs"
                        />
                      </Field>

                      {/* Quick Day Duration Selector Chips */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-foreground">Quick Preset Days:</span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {[1, 2, 3, 4, 5, 7].map((daysCount) => (
                            <button
                              key={daysCount}
                              type="button"
                              onClick={() => setNumDays(daysCount)}
                              className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                                numDays === daysCount
                                  ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-2xs'
                                  : 'border-border bg-card hover:bg-muted text-muted-foreground'
                              }`}
                            >
                              {daysCount} {daysCount === 1 ? 'Day' : 'Days'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Day-by-Day Schedule Breakdown */}
                  <Field className="gap-2">
                    <div className="flex items-center justify-between">
                      <FieldLabel className="text-xs font-semibold text-foreground">
                        Day-by-Day Clearance Schedule ({numDays} {numDays === 1 ? 'Day' : 'Days'} · {numDays * 4} Total Slots)
                      </FieldLabel>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        4 Slots / Day (Morning & Afternoon)
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {daysSchedule.map((dayItem, idx) => (
                        <div
                          key={dayItem.day}
                          className="p-3 rounded-xl border border-border/70 bg-card hover:border-primary/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary font-mono font-bold text-xs shrink-0 border border-primary/20">
                              {dayItem.day}
                            </span>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <Input
                                value={dayItem.date}
                                onChange={(e) => handleDayDateChange(idx, e.target.value)}
                                placeholder="Date (e.g. Nov 10)"
                                className="h-8 text-xs font-mono w-28"
                              />
                              <Input
                                value={dayItem.theme || ''}
                                onChange={(e) => handleDayThemeChange(idx, e.target.value)}
                                placeholder="Activity or Theme (e.g. Opening & Cheerdance)"
                                className="h-8 text-xs flex-1 sm:w-64"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono shrink-0 pl-1">
                            <Clock className="size-3 text-muted-foreground" />
                            <span>M-In · M-Out · A-In · A-Out</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Field>
                </FieldGroup>
              </CardContent>

              <CardFooter className="p-5 sm:p-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/10">
                <p className="text-xs text-muted-foreground">
                  Activating this event will update the live SBO scanner and student clearance cards.
                </p>
                <Button
                  type="submit"
                  className="w-full sm:w-auto h-10 px-6 text-xs font-semibold gap-2 cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="size-4" />
                  <span>Create & Activate Event</span>
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Side Column: Saved Events & Presets (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <Card className="border border-border/80 shadow-sm bg-card rounded-2xl">
            <CardHeader className="pb-3 border-b border-border/40">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
                  <CalendarDays className="size-4 text-primary" />
                  <span>Available Events</span>
                </CardTitle>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {eventsList.length} Events
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-3">
              {eventsList.map((ev) => {
                const isActive = ev.id === activeEvent.id;
                return (
                  <div
                    key={ev.id}
                    onClick={() => !isActive && handleSetActiveExisting(ev)}
                    className={`p-3.5 rounded-xl border transition-all text-left flex flex-col gap-2 ${
                      isActive
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/30 shadow-xs'
                        : 'border-border bg-card hover:bg-muted/40 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-foreground">
                            {ev.title}
                          </span>
                          {isActive && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9.5px] font-mono font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground block mt-0.5">
                          {ev.department} · {ev.schoolYear}
                        </span>
                      </div>

                      {!isActive && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteEvent(ev.id, e)}
                          className="text-muted-foreground hover:text-destructive p-1 rounded-md transition-colors cursor-pointer"
                          title="Delete Event"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1 border-t border-border/40">
                      <span>{ev.totalDays} Event Days</span>
                      <span>
                        {ev.days[0]?.date} - {ev.days[ev.days.length - 1]?.date}
                      </span>
                    </div>

                    {!isActive && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetActiveExisting(ev);
                        }}
                        className="w-full h-7 text-[11px] font-medium gap-1.5 mt-1 cursor-pointer"
                      >
                        <Check className="size-3" />
                        <span>Switch to this Event</span>
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateEventCard;
