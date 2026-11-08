export type Department = 
  | 'CBA'   // College of Business Administration
  | 'CIT'   // College of Information Technology
  | 'CED'   // College of Education
  | 'CCJPS' // College of Criminal Justice & Public Safety
  | 'CHM'   // College of Hospitality Management
  | 'CAS'   // College of Arts and Sciences
  | 'COM'   // College of Maritime
  | 'CLIS'; // College of Library & Information Science

export type UserRole = 'student' | 'officer' | 'head_officer';

export type ScanStatus = 'accepted' | 'flagged' | 'invalid';

export interface StudentProfile {
  id: string;
  schoolId: string;
  fullName: string;
  department: Department;
  yearLevel: number;
  section: string;
  photoUrl?: string;
  isRegistered: boolean;
  publicKey?: string;
}

export interface OfficerProfile {
  id: string;
  fullName: string;
  position: string; // e.g. "SBO Auditor", "SBO Governor"
  department: Department;
  isAuthorizedScanner: boolean;
  signatureUrl?: string;
}

export interface EventSlot {
  id: string;
  dayNumber: number; // 1 to 5
  slotName: string;  // "Morning In", "Morning Out", "Afternoon In", "Afternoon Out"
  startTime: string;
  endTime: string;
  assignedOfficer: string;
  assignedPosition: string;
}

export interface EventVenue {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  locationCheckMode: 'off' | 'flag' | 'block';
}

export interface EventPack {
  id: string;
  title: string;
  schoolYear: string;
  departments: Department[];
  daysCount: number;
  slots: EventSlot[];
  venues: EventVenue[];
  isPublished: boolean;
  checksum: string;
}

export interface ScanRecord {
  id: string;
  studentId: string;
  studentName: string;
  schoolId: string;
  department: Department;
  yearAndSection: string;
  photoThumbnail?: string;
  slotId: string;
  slotName: string;
  venueName: string;
  timestamp: string;
  status: ScanStatus;
  flagReason?: string;
  synced: boolean;
  officerSignature?: string;
}
