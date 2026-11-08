export type StudentScreen =
  | 'signin'
  | 'otp'
  | 'consent'
  | 'details'
  | 'photo'
  | 'waiting'
  | 'pass'
  | 'activity-card';

export type LoginScenario = 'new' | 'same-device' | 'new-device';

export interface StudentProfile {
  fullName: string;
  schoolId: string;
  department: string;
  yearLevel: string;
  section: string;
  photoDataUrl: string | null;
  isApproved: boolean;
}

export interface DepartmentOption {
  code: string;
  name: string;
}

export const TCC_DEPARTMENTS: DepartmentOption[] = [
  { code: 'CIT', name: 'College of Information Technology' },
  { code: 'CBA', name: 'College of Business Administration' },
  { code: 'CED', name: 'College of Education' },
  { code: 'CCJPS', name: 'College of Criminal Justice & Public Safety' },
  { code: 'CHM', name: 'College of Hospitality Management' },
  { code: 'CAS', name: 'College of Arts and Sciences' },
  { code: 'COM', name: 'College of Maritime' },
  { code: 'CLIS', name: 'College of Library & Information Science' },
];
