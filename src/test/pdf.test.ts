import { describe, it, expect } from 'vitest';
import { generateClearanceCardPdf } from '../lib/pdf';
import { DEFAULT_ACTIVE_EVENT } from '../types/attendance';

describe('generateClearanceCardPdf', () => {
  it('generates clearance document with expected filename and table rows', async () => {
    const filename = await generateClearanceCardPdf({
      event: DEFAULT_ACTIVE_EVENT,
      fullName: 'Christian Orlan Motas',
      schoolId: '2023-01048',
      department: 'CIT',
      section: '3A',
      attendanceRecords: [
        {
          day: 'Day 1',
          date: 'Nov 10',
          scanMode: '4-slots',
          slots: { 'morning-in': '08:00 AM', 'morning-out': '11:30 AM' },
          slotOfficers: {
            'morning-in': {
              time: '08:00 AM',
              officerName: 'CIT-SBO: Motas',
              officerPosition: 'Attendance Head',
              department: 'CIT',
              stationCode: 'CIT-SBO1',
            },
          },
          cleared: false,
        },
      ],
    });

    expect(filename).toContain('TCC_Clearance_');
    expect(filename).toContain('Christian_Orlan_Motas');
    expect(filename.endsWith('.pdf')).toBe(true);
  });
});
