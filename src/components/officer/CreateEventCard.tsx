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
  Check,
  Plus,
  Minus,
  Trash2,
} from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
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
function generateDays(totalDays: number, startDateStr: string, existingDays?: EventDayConfig[]): EventDayConfig[] {
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
          { day: 'Day 1', date: 'Feb 18', theme: 'Hackathon' },
          { day: 'Day 2', date: 'Feb 19', theme: 'Workshops' },
          { day: 'Day 3', date: 'Feb 20', theme: 'Awarding' },
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
    toast.success(`"${newEvent.title}" Activated (${newEvent.totalDays} Days)`);
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
    toast.success(`"${targetEvent.title}" Activated`);
  };

  const handleDeleteEvent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (id === activeEvent.id) {
      toast.error('Cannot delete the active event');
      return;
    }
    const updated = eventsList.filter((ev) => ev.id !== id);
    setEventsList(updated);
    try {
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    toast.info('Event removed');
  };

  return (
    <div className="w-full flex flex-col gap-4 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Main Form Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <Card className="border border-border/80 shadow-xs bg-card rounded-xl">
            <CardHeader className="py-3 px-5 border-b border-border/40 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
                <CalendarPlus className="size-4 text-primary" />
                <span>Create Event</span>
              </CardTitle>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium text-foreground truncate max-w-[200px]">
                  {activeEvent.title}
                </span>
                <span className="font-mono">({activeEvent.totalDays}d)</span>
              </div>
            </CardHeader>

            <form onSubmit={handleCreateAndActivateEvent}>
              <CardContent className="p-5 space-y-4">
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

                  {/* Department & Start Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  </div>

                  {/* Duration Days Selector */}
                  <Field className="gap-1.5">
                    <div className="flex items-center justify-between">
                      <FieldLabel className="text-xs font-medium text-foreground">
                        Duration
                      </FieldLabel>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setNumDays((prev) => Math.max(1, prev - 1))}
                          className="size-6 rounded border border-border hover:bg-muted flex items-center justify-center cursor-pointer transition-colors text-foreground disabled:opacity-40"
                          disabled={numDays <= 1}
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="text-xs font-bold font-mono px-2 text-primary">
                          {numDays} {numDays === 1 ? 'Day' : 'Days'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setNumDays((prev) => Math.min(14, prev + 1))}
                          className="size-6 rounded border border-border hover:bg-muted flex items-center justify-center cursor-pointer transition-colors text-foreground disabled:opacity-40"
                          disabled={numDays >= 14}
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[1, 2, 3, 4, 5, 7].map((daysCount) => (
                        <button
                          key={daysCount}
                          type="button"
                          onClick={() => setNumDays(daysCount)}
                          className={`px-2.5 py-1 text-xs rounded-md border transition-all cursor-pointer ${
                            numDays === daysCount
                              ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-2xs'
                              : 'border-border bg-card hover:bg-muted text-muted-foreground'
                          }`}
                        >
                          {daysCount}d
                        </button>
                      ))}
                    </div>
                  </Field>

                  {/* Schedule Days */}
                  <Field className="gap-1.5">
                    <FieldLabel className="text-xs font-medium text-foreground">
                      Schedule ({numDays} Days)
                    </FieldLabel>

                    <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                      {daysSchedule.map((dayItem, idx) => (
                        <div
                          key={dayItem.day}
                          className="p-2 rounded-lg border border-border/80 bg-muted/20 flex items-center gap-2"
                        >
                          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono font-bold text-[11px] shrink-0 border border-primary/20 w-14 text-center">
                            {dayItem.day}
                          </span>

                          {/* shadcn Popover + Calendar DatePicker */}
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

                          <Input
                            value={dayItem.theme || ''}
                            onChange={(e) => handleDayThemeChange(idx, e.target.value)}
                            placeholder="Theme (optional)"
                            className="h-7 text-xs flex-1 bg-background"
                          />
                        </div>
                      ))}
                    </div>
                  </Field>
                </FieldGroup>
              </CardContent>

              <CardFooter className="py-3 px-5 border-t border-border/40 flex justify-end">
                <Button
                  type="submit"
                  className="h-8 px-4 text-xs font-medium gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="size-3.5" />
                  <span>Activate Event</span>
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Side Column: Events Presets (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <Card className="border border-border/80 shadow-xs bg-card rounded-xl">
            <CardHeader className="py-3 px-4 border-b border-border/40 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <CalendarDays className="size-3.5 text-primary" />
                <span>Events ({eventsList.length})</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-3 space-y-2">
              {eventsList.map((ev) => {
                const isActive = ev.id === activeEvent.id;
                return (
                  <div
                    key={ev.id}
                    className={`p-2.5 rounded-lg border transition-all text-left flex flex-col gap-1.5 ${
                      isActive
                        ? 'border-primary/60 bg-primary/5 ring-1 ring-primary/20'
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-foreground truncate block">
                            {ev.title}
                          </span>
                          {isActive && (
                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 shrink-0">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <span className="text-[10.5px] font-mono text-muted-foreground block">
                          {ev.totalDays} Days · {ev.days[0]?.date} - {ev.days[ev.days.length - 1]?.date}
                        </span>
                      </div>

                      {!isActive && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteEvent(ev.id, e)}
                          className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors cursor-pointer shrink-0"
                          title="Delete"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      )}
                    </div>

                    {!isActive && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleSetActiveExisting(ev)}
                        className="w-full h-6 text-[10px] font-medium gap-1 cursor-pointer mt-0.5"
                      >
                        <Check className="size-2.5" />
                        <span>Activate</span>
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
