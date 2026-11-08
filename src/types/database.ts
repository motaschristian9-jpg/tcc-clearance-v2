import { Department, UserRole, ScanStatus, EventSlot, EventVenue } from './index';

export interface StoredKeyRecord {
  id: string; // 'device_key'
  privateKey: CryptoKey;
  publicKey: CryptoKey;
  publicKeySpki: string;
  createdAt: number;
}

export interface StoredProfileRecord {
  id: string; // 'current'
  role: UserRole;
  schoolId: string;
  fullName: string;
  department: Department;
  yearLevel: number;
  section: string;
  photoThumbnail?: string;
  isApproved: boolean;
  registeredAt: number;
}

export interface StoredEventRecord {
  id: string;
  title: string;
  schoolYear: string;
  departments: Department[];
  daysCount: number;
  slots: EventSlot[];
  venues: EventVenue[];
  isPublished: boolean;
  checksum: string;
  downloadedAt: number;
}

export interface StoredRosterStudent {
  id: string;              // School ID (e.g. "2023-01842")
  schoolId: string;
  fullName: string;
  department: Department;
  yearLevel: number;
  section: string;
  publicKeySpki: string;
  photoThumbnail?: string; // 160px data URI (~12 KB)
  registeredAt: number;
}

export interface StoredScanQueueItem {
  id: string;              // Client UUID
  eventId: string;
  slotId: string;
  slotName: string;
  studentId: string;
  schoolId: string;
  studentName: string;
  department: Department;
  yearAndSection: string;
  photoThumbnail?: string;
  venueName: string;
  timestamp: string;
  status: ScanStatus;
  flagReason?: string;
  synced: number;          // 0 = pending, 1 = synced
  officerSignature?: string;
  createdAt: number;
}

export interface StoredCardStamp {
  id: string;              // `${eventId}_${slotId}`
  eventId: string;
  slotId: string;
  slotName: string;
  dayNumber: number;
  timestamp: string;
  officerName: string;
  officerPosition: string;
  officerSignatureSvg?: string;
  serialNumber: string;
}
