import { describe, it, expect } from 'vitest';
import { DEFAULT_ACTIVE_EVENT, ClearanceEvent } from '../types/attendance';

describe('Clearance Event Setup & Days Configuration', () => {
  it('has default active event with 5 days', () => {
    expect(DEFAULT_ACTIVE_EVENT.title).toBe('TCC Intramurals 2026');
    expect(DEFAULT_ACTIVE_EVENT.totalDays).toBe(5);
    expect(DEFAULT_ACTIVE_EVENT.days).toHaveLength(5);
    expect(DEFAULT_ACTIVE_EVENT.days[0].day).toBe('Day 1');
    expect(DEFAULT_ACTIVE_EVENT.days[4].day).toBe('Day 5');
  });

  it('supports custom multi-day clearance events', () => {
    const customEvent: ClearanceEvent = {
      id: 'custom-event-1',
      title: 'CIT Tech Week 2026',
      department: 'CIT',
      schoolYear: '2025-2026',
      semester: '2nd Semester',
      totalDays: 3,
      days: [
        { day: 'Day 1', date: 'Feb 18', theme: 'Hackathon' },
        { day: 'Day 2', date: 'Feb 19', theme: 'Tech Seminars' },
        { day: 'Day 3', date: 'Feb 20', theme: 'Awarding' },
      ],
      status: 'active',
      createdAt: '2026-02-01',
      createdByOfficer: 'Christian Motas',
    };

    expect(customEvent.totalDays).toBe(3);
    expect(customEvent.days).toHaveLength(3);
    // 4 attendance slots per day
    const totalSlots = customEvent.totalDays * 4;
    expect(totalSlots).toBe(12);
  });

  it('correctly maps dynamic event days into clearance attendance matrix', () => {
    const eventDays = [
      { day: 'Day 1', date: 'Nov 10' },
      { day: 'Day 2', date: 'Nov 11' },
      { day: 'Day 3', date: 'Nov 12' },
    ];

    const attendanceRecords = eventDays.map((d) => ({
      day: d.day,
      date: d.date,
      slots: {},
      cleared: false,
    }));

    expect(attendanceRecords).toHaveLength(3);
    expect(attendanceRecords[0].date).toBe('Nov 10');
    expect(attendanceRecords[2].day).toBe('Day 3');
  });
});

