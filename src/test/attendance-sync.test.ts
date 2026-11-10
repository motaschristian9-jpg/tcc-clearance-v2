import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';

// Mock Supabase client to avoid real network calls in unit tests
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: null }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
    channel: () => ({
      on: () => ({
        subscribe: vi.fn(),
      }),
    }),
  }),
}));

import {
  recordAttendanceToSupabase,
  fetchStudentAttendanceFromSupabase,
  fetchStudentPhotoBySchoolId,
} from '../lib/supabase';
import { DayAttendance, SboOfficerSession } from '../types/attendance';

// Polyfill window, localStorage and CustomEvent for Node test environment
beforeAll(() => {
  const store: Record<string, string> = {};
  const mockLocalStorage = {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
  };

  const listeners: Record<string, Array<() => void>> = {};
  const mockWindow = {
    addEventListener: (event: string, fn: () => void) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(fn);
    },
    removeEventListener: (event: string, fn: () => void) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter((f) => f !== fn);
      }
    },
    dispatchEvent: (event: { type: string }) => {
      if (listeners[event.type]) {
        listeners[event.type].forEach((fn) => fn());
      }
      return true;
    },
  };

  (global as unknown as { localStorage: typeof mockLocalStorage }).localStorage = mockLocalStorage;
  (global as unknown as { window: typeof mockWindow }).window = mockWindow;
  (global as unknown as { Event: typeof CustomEvent }).Event = class {
    type: string;
    constructor(type: string) {
      this.type = type;
    }
  } as unknown as typeof CustomEvent;
});

describe('Student Attendance & Photo Synchronization', () => {
  const mockOfficer: SboOfficerSession = {
    name: 'Officer Jane Doe',
    position: 'President',
    department: 'CIT',
    stationCode: 'GATE-1',
    loginTime: '08:00 AM',
  };

  const initialRecords: DayAttendance[] = [
    { day: 'Day 1', date: 'Nov 10', slots: {}, cleared: false },
    { day: 'Day 2', date: 'Nov 11', slots: {}, cleared: false },
    { day: 'Day 3', date: 'Nov 12', slots: {}, cleared: false },
  ];

  beforeEach(() => {
    localStorage.clear();
  });

  it('records attendance locally and dispatches tcc-attendance-updated event', async () => {
    let eventDispatched = false;
    window.addEventListener('tcc-attendance-updated', () => {
      eventDispatched = true;
    });

    await recordAttendanceToSupabase({
      schoolId: '2023-01048',
      day: 'Day 1',
      slot: 'morning-in',
      officer: mockOfficer,
      eventId: 'intramurals-2026',
      timeFormatted: '08:15 AM',
    });

    expect(eventDispatched).toBe(true);

    const studentCached = localStorage.getItem('TCC_ATTENDANCE_RECORDS_2023-01048');
    expect(studentCached).not.toBeNull();
    const parsed: DayAttendance[] = JSON.parse(studentCached!);
    const day1 = parsed.find((p) => p.day === 'Day 1');
    expect(day1?.slots['morning-in']).toBe('08:15 AM');
    expect(day1?.slotOfficers?.['morning-in']?.officerName).toBe('Officer Jane Doe');
  });

  it('fetches and merges student attendance from student-specific storage', async () => {
    await recordAttendanceToSupabase({
      schoolId: '2023-01048',
      day: 'Day 1',
      slot: 'morning-in',
      officer: mockOfficer,
      eventId: 'intramurals-2026',
      timeFormatted: '08:15 AM',
    });

    const result = await fetchStudentAttendanceFromSupabase({
      schoolId: '2023-01048',
      baseRecords: initialRecords,
    });

    const day1 = result.find((p) => p.day === 'Day 1');
    expect(day1?.slots['morning-in']).toBe('08:15 AM');
  });

  it('resolves student photo from student-specific photo cache', async () => {
    localStorage.setItem('TCC_STUDENT_PHOTO_2023-01048', 'https://example.com/avatar.jpg');

    const photo = await fetchStudentPhotoBySchoolId('2023-01048');
    expect(photo).toBe('https://example.com/avatar.jpg');
  });
});
