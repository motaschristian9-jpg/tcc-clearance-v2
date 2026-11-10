export type EventDay = 'Day 1' | 'Day 2' | 'Day 3' | 'Day 4' | 'Day 5' | (string & {});

export interface EventDayConfig {
  day: EventDay;
  date: string;
  isoDate?: string;
  theme?: string;
}

export interface ClearanceEvent {
  id: string;
  title: string;
  department: string;
  schoolYear: string;
  semester: string;
  totalDays: number;
  days: EventDayConfig[];
  status: 'active' | 'upcoming' | 'concluded';
  createdAt: string;
  createdByOfficer: string;
}

export const DEFAULT_ACTIVE_EVENT: ClearanceEvent = {
  id: 'tcc-intra-2026',
  title: 'TCC Intramurals 2026',
  department: 'All Departments',
  schoolYear: '2025-2026',
  semester: '1st Semester',
  totalDays: 5,
  days: [
    { day: 'Day 1', date: 'Nov 10', theme: 'Opening Ceremony & Cheerdance' },
    { day: 'Day 2', date: 'Nov 11', theme: 'Ball Games & Board Games' },
    { day: 'Day 3', date: 'Nov 12', theme: 'Athletics & Esports Tournament' },
    { day: 'Day 4', date: 'Nov 13', theme: 'Semifinals & Cultural Night' },
    { day: 'Day 5', date: 'Nov 14', theme: 'Championship Games & Awarding' },
  ],
  status: 'active',
  createdAt: '2026-11-01',
  createdByOfficer: 'Christian Motas',
};

export type TimeSlotType =
  | 'morning-in'
  | 'morning-out'
  | 'afternoon-in'
  | 'afternoon-out';

export interface TimeSlotConfig {
  id: TimeSlotType;
  label: string;
  timeWindow: string;
}

export const TIME_SLOTS: TimeSlotConfig[] = [
  { id: 'morning-in', label: 'Morning In', timeWindow: '07:30 AM - 08:30 AM' },
  { id: 'morning-out', label: 'Morning Out', timeWindow: '11:30 AM - 12:30 PM' },
  { id: 'afternoon-in', label: 'Afternoon In', timeWindow: '01:00 PM - 02:00 PM' },
  { id: 'afternoon-out', label: 'Afternoon Out', timeWindow: '04:30 PM - 05:30 PM' },
];

export interface SlotStampInfo {
  time: string;
  officerName: string;
  officerPosition: string;
  department: string;
  stationCode: string;
}

export interface DayAttendance {
  day: EventDay;
  date: string;
  slots: {
    'morning-in'?: string;
    'morning-out'?: string;
    'afternoon-in'?: string;
    'afternoon-out'?: string;
  };
  slotOfficers?: {
    'morning-in'?: SlotStampInfo;
    'morning-out'?: SlotStampInfo;
    'afternoon-in'?: SlotStampInfo;
    'afternoon-out'?: SlotStampInfo;
  };
  cleared: boolean;
}

export interface SboOfficerSession {
  name: string;
  position: string;
  department: string;
  stationCode: string;
  loginTime?: string;
}

export interface ScannedStudentPayload {
  fullName: string;
  schoolId: string;
  department: string;
  section: string;
  photoDataUrl: string | null;
  timestamp: number;
  deviceKeyValid: boolean;
}

export interface GateScanLogEntry {
  id: string;
  studentName: string;
  schoolId: string;
  department: string;
  section: string;
  photoDataUrl?: string | null;
  day: EventDay;
  slot: TimeSlotType;
  slotLabel: string;
  timestamp: number;
  timeFormatted: string;
  dateFormatted: string;
  stampedBy: {
    officerName: string;
    position: string;
    department: string;
    stationCode: string;
  };
}


