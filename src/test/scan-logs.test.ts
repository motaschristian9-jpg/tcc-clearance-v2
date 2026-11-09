import { describe, it, expect } from 'vitest';
import { GateScanLogEntry } from '../types/attendance';

describe('Gate Scan Logs Model and Filtering', () => {
  const sampleLogs: GateScanLogEntry[] = [
    {
      id: 'log-1',
      studentName: 'Christian Orlan Motas',
      schoolId: '2023-01048',
      department: 'CIT',
      section: '3A',
      day: 'Day 1',
      slot: 'morning-in',
      slotLabel: 'Morning In',
      timestamp: 1731224000000,
      timeFormatted: '08:14 AM',
      dateFormatted: 'Nov 10',
      stampedBy: {
        officerName: 'Maria Santos',
        position: 'Attendance Committee Head',
        department: 'CIT',
        stationCode: 'SBO 1',
      },
    },
    {
      id: 'log-2',
      studentName: 'Juan Dela Cruz',
      schoolId: '2023-00512',
      department: 'CIT',
      section: '2B',
      day: 'Day 1',
      slot: 'morning-out',
      slotLabel: 'Morning Out',
      timestamp: 1731238000000,
      timeFormatted: '11:45 AM',
      dateFormatted: 'Nov 10',
      stampedBy: {
        officerName: 'Maria Santos',
        position: 'Attendance Committee Head',
        department: 'CIT',
        stationCode: 'SBO 1',
      },
    },
    {
      id: 'log-3',
      studentName: 'Alyssa Valdez',
      schoolId: '2024-03219',
      department: 'CIT',
      section: '1A',
      day: 'Day 2',
      slot: 'afternoon-in',
      slotLabel: 'Afternoon In',
      timestamp: 1731310000000,
      timeFormatted: '01:15 PM',
      dateFormatted: 'Nov 11',
      stampedBy: {
        officerName: 'Mark Reyes',
        position: 'Gate Inspector',
        department: 'CIT',
        stationCode: 'SBO 2',
      },
    },
  ];

  it('filters scan logs by search query (student name or ID)', () => {
    const query = 'Motas';
    const filtered = sampleLogs.filter(
      (l) =>
        l.studentName.toLowerCase().includes(query.toLowerCase()) ||
        l.schoolId.toLowerCase().includes(query.toLowerCase())
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].schoolId).toBe('2023-01048');
  });

  it('filters scan logs by event day', () => {
    const day1Logs = sampleLogs.filter((l) => l.day === 'Day 1');
    expect(day1Logs).toHaveLength(2);

    const day2Logs = sampleLogs.filter((l) => l.day === 'Day 2');
    expect(day2Logs).toHaveLength(1);
    expect(day2Logs[0].studentName).toBe('Alyssa Valdez');
  });

  it('filters scan logs by time slot', () => {
    const morningInLogs = sampleLogs.filter((l) => l.slot === 'morning-in');
    expect(morningInLogs).toHaveLength(1);
    expect(morningInLogs[0].studentName).toBe('Christian Orlan Motas');
  });

  it('preserves officer signatory audit in each log entry', () => {
    const log = sampleLogs[0];
    expect(log.stampedBy.officerName).toBe('Maria Santos');
    expect(log.stampedBy.stationCode).toBe('SBO 1');
    expect(log.stampedBy.position).toBe('Attendance Committee Head');
  });

  it('serializes and deserializes scan logs correctly for localStorage persistence', () => {
    const serialized = JSON.stringify(sampleLogs);
    const parsed: GateScanLogEntry[] = JSON.parse(serialized);

    expect(parsed).toHaveLength(3);
    expect(parsed[0].studentName).toBe('Christian Orlan Motas');
    expect(parsed[0].stampedBy.stationCode).toBe('SBO 1');
  });
});
