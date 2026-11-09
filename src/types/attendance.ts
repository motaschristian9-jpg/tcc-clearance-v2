export type EventDay = 'Day 1' | 'Day 2' | 'Day 3' | 'Day 4' | 'Day 5';

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

