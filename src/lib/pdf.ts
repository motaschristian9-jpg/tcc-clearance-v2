import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { ClearanceEvent, DayAttendance, TimeSlotType } from '@/types/attendance';

export interface GenerateClearancePdfParams {
  event: ClearanceEvent;
  fullName: string;
  schoolId: string;
  department: string;
  section: string;
  attendanceRecords: DayAttendance[];
}

export async function generateClearanceCardPdf(params: GenerateClearancePdfParams): Promise<string> {
  const { event, fullName, schoolId, department, section, attendanceRecords } = params;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2;

  // Calculate stats
  const totalSlots = attendanceRecords.reduce((acc, curr) => {
    return acc + (curr.scanMode === '2-slots' ? 2 : 4);
  }, 0);

  const clearedSlotsCount = attendanceRecords.reduce((acc, curr) => {
    let count = 0;
    if (curr.slots['morning-in']) count++;
    if (curr.scanMode !== '2-slots' && curr.slots['morning-out']) count++;
    if (curr.scanMode !== '2-slots' && curr.slots['afternoon-in']) count++;
    if (curr.slots['afternoon-out']) count++;
    return acc + count;
  }, 0);

  const percent = totalSlots > 0 ? Math.round((clearedSlotsCount / totalSlots) * 100) : 0;
  const isFullyCleared = totalSlots > 0 && clearedSlotsCount >= totalSlots;

  // Outer decorative border
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.4);
  doc.rect(marginX - 2, 8, contentWidth + 4, pageHeight - 16);

  // Inner subtle border
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.2);
  doc.rect(marginX, 10, contentWidth, pageHeight - 20);

  // Top Accent Bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(marginX, 10, contentWidth, 3, 'F');

  // Institution Header
  let y = 19;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('TALISAY CITY COLLEGE', pageWidth / 2, y, { align: 'center' });

  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Office of Student Affairs & Student Body Organization (SBO)', pageWidth / 2, y, { align: 'center' });

  y += 4;
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Poblacion, City of Talisay, Cebu 6045 · Tel: (032) 273-0498 · https://tcc.edu.ph', pageWidth / 2, y, { align: 'center' });

  y += 5;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(marginX + 4, y, pageWidth - marginX - 4, y);

  // Clearance Title Banner
  y += 3;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(marginX + 4, y, contentWidth - 8, 14, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(marginX + 4, y, contentWidth - 8, 14, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICIAL STUDENT CLEARANCE CARD', pageWidth / 2, y + 5.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`${event.title.toUpperCase()} · ${event.semester || '1st Semester'}, ${event.schoolYear || 'A.Y. 2025-2026'}`, pageWidth / 2, y + 10.5, { align: 'center' });

  // Student Info & Status Box
  y += 18;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(marginX + 4, y, contentWidth - 8, 26, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(marginX + 4, y, contentWidth - 8, 26, 2, 2, 'S');

  // Student details (Left side)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('STUDENT INFORMATION', marginX + 8, y + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(fullName || 'Student Name', marginX + 8, y + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Student ID: `, marginX + 8, y + 17);
  doc.setFont('helvetica', 'bold');
  doc.text(schoolId || '---', marginX + 25, y + 17);

  doc.setFont('helvetica', 'normal');
  doc.text(`Department: `, marginX + 8, y + 22);
  doc.setFont('helvetica', 'bold');
  doc.text(`${department || 'CIT'}   |   Section: ${section || '---'}`, marginX + 28, y + 22);

  // Clearance Status Badge (Right side)
  const statusBoxX = pageWidth - marginX - 68;
  if (isFullyCleared) {
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.setDrawColor(16, 185, 129); // emerald-500
    doc.roundedRect(statusBoxX, y + 4, 60, 18, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(5, 150, 105); // emerald-600
    doc.text('OFFICIALLY CLEARED', statusBoxX + 30, y + 11, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(4, 120, 87);
    doc.text(`${clearedSlotsCount}/${totalSlots} Slots Completed (100%)`, statusBoxX + 30, y + 16, { align: 'center' });
  } else {
    doc.setFillColor(254, 243, 199); // amber-50
    doc.setDrawColor(245, 158, 11); // amber-500
    doc.roundedRect(statusBoxX, y + 4, 60, 18, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(180, 83, 9); // amber-700
    doc.text('CLEARANCE IN PROGRESS', statusBoxX + 30, y + 11, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(180, 83, 9);
    doc.text(`${clearedSlotsCount}/${totalSlots} Slots Cleared (${percent}%)`, statusBoxX + 30, y + 16, { align: 'center' });
  }

  // Attendance Verification Table
  y += 31;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('GATE ATTENDANCE VERIFICATION MATRIX', marginX + 4, y);

  y += 3;
  const colX = {
    day: marginX + 4,
    date: marginX + 28,
    slot: marginX + 54,
    status: marginX + 96,
    officer: marginX + 128,
    time: marginX + 158,
  };

  // Table Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(marginX + 4, y, contentWidth - 8, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('DAY', colX.day + 2, y + 4.8);
  doc.text('DATE', colX.date + 2, y + 4.8);
  doc.text('REQUIRED SLOT', colX.slot + 2, y + 4.8);
  doc.text('STAMP STATUS', colX.status + 2, y + 4.8);
  doc.text('VERIFIED BY (OFFICER)', colX.officer + 2, y + 4.8);
  doc.text('TIME STAMP', colX.time + 2, y + 4.8);

  y += 7;

  // Flatten slots from attendance records
  let rowIndex = 0;
  for (const record of attendanceRecords) {
    const isTwoSlots = record.scanMode === '2-slots';
    const slots: { key: TimeSlotType; label: string }[] = isTwoSlots
      ? [
          { key: 'morning-in', label: 'Morning In' },
          { key: 'afternoon-out', label: 'Afternoon Out' },
        ]
      : [
          { key: 'morning-in', label: 'Morning In' },
          { key: 'morning-out', label: 'Morning Out' },
          { key: 'afternoon-in', label: 'Afternoon In' },
          { key: 'afternoon-out', label: 'Afternoon Out' },
        ];

    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const timeStamp = record.slots[slot.key];
      const isStamped = !!timeStamp;
      const officerData = record.slotOfficers?.[slot.key];
      const officer =
        typeof officerData === 'object' && officerData !== null
          ? officerData.officerName
          : typeof officerData === 'string'
          ? officerData
          : isStamped
          ? 'CIT-SBO Officer'
          : '---';

      // Alternating row background
      const rowHeight = 6.2;
      if (rowIndex % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(marginX + 4, y, contentWidth - 8, rowHeight, 'F');
      }

      // Horizontal subtle line
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.2);
      doc.line(marginX + 4, y + rowHeight, marginX + 4 + contentWidth - 8, y + rowHeight);

      // Only print Day & Date on first slot of that day
      if (i === 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(15, 23, 42);
        doc.text(record.day, colX.day + 2, y + 4.3);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        doc.text(record.date, colX.date + 2, y + 4.3);
      }

      // Slot Label
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      doc.text(slot.label, colX.slot + 2, y + 4.3);

      // Status Badge
      if (isStamped) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(5, 150, 105); // emerald-600
        doc.text('CLEARED', colX.status + 2, y + 4.3);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text('Pending Stamp', colX.status + 2, y + 4.3);
      }

      // Officer Verifier
      doc.setFont('helvetica', isStamped ? 'bold' : 'normal');
      doc.setFontSize(7);
      doc.setTextColor(isStamped ? 30 : 148, isStamped ? 41 : 163, isStamped ? 59 : 184);
      doc.text(officer, colX.officer + 2, y + 4.3);

      // Time
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(isStamped ? 15 : 148, isStamped ? 23 : 163, isStamped ? 42 : 184);
      doc.text(timeStamp || '---', colX.time + 2, y + 4.3);

      y += rowHeight;
      rowIndex++;
    }
  }

  // Draw table border
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.rect(marginX + 4, y - (rowIndex * 6.2) - 7, contentWidth - 8, (rowIndex * 6.2) + 7, 'S');

  // Digital Security QR & Auth Section
  y += 6;
  const qrSectionY = y;
  const serialNo = `TCC-${department || 'CIT'}-${(schoolId || '0000').replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString(36).toUpperCase()}`;

  try {
    const qrPayload = JSON.stringify({
      tcc_clr_v: 1,
      id: schoolId,
      name: fullName,
      dept: department,
      ev: event.title,
      stat: isFullyCleared ? 'CLEARED' : 'PENDING',
      slots: `${clearedSlotsCount}/${totalSlots}`,
      sn: serialNo,
      issued: new Date().toISOString(),
    });

    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      margin: 1,
      width: 140,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    });

    doc.addImage(qrDataUrl, 'PNG', marginX + 4, qrSectionY, 24, 24);
  } catch (err) {
    console.warn('QR code generation failed in PDF generator:', err);
  }

  // Security & Legal text beside QR code
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('OFFICIAL VERIFICATION & SECURITY AUTHENTICATION', marginX + 32, qrSectionY + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  doc.text('This document serves as the official clearance credential issued by the Student Body Organization (SBO)', marginX + 32, qrSectionY + 8.5);
  doc.text('and the Office of Student Affairs. The embedded digital token confirms attendance verified through authorized', marginX + 32, qrSectionY + 12);
  doc.text('gate scanners. Any alteration or tampering voids this clearance record.', marginX + 32, qrSectionY + 15.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text(`Digital Serial: `, marginX + 32, qrSectionY + 20);
  doc.setFont('courier', 'bold');
  doc.text(serialNo, marginX + 50, qrSectionY + 20);

  // Signatures Section
  const sigY = pageHeight - 38;

  // Signatory 1: SBO Attendance Officer
  const sigColWidth = (contentWidth - 8) / 3;
  const s1X = marginX + 4;
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.3);
  doc.line(s1X + 4, sigY, s1X + sigColWidth - 4, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('CHRISTIAN ORLAN MOTAS', s1X + sigColWidth / 2, sigY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('SBO Attendance Committee Head', s1X + sigColWidth / 2, sigY + 7.5, { align: 'center' });

  // Signatory 2: SBO President
  const s2X = s1X + sigColWidth;
  doc.line(s2X + 4, sigY, s2X + sigColWidth - 4, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('JHON ALBERT ALCANTARA', s2X + sigColWidth / 2, sigY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('SBO Executive President', s2X + sigColWidth / 2, sigY + 7.5, { align: 'center' });

  // Signatory 3: College Dean / OSA Director
  const s3X = s2X + sigColWidth;
  doc.line(s3X + 4, sigY, s3X + sigColWidth - 4, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('DR. ENGR. ROLANDO S. GECOSALA', s3X + sigColWidth / 2, sigY + 4, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Dean / Office of Student Affairs', s3X + sigColWidth / 2, sigY + 7.5, { align: 'center' });

  // Bottom Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  const nowStr = new Date().toLocaleString();
  doc.text(`Generated on ${nowStr} · TCC Gate Clearance Automation System · Page 1 of 1`, pageWidth / 2, pageHeight - 12, { align: 'center' });

  // Save PDF to trigger browser download
  const cleanStudentName = (fullName || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
  const cleanEvent = (event.title || 'Event').replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `TCC_Clearance_${cleanEvent}_${cleanStudentName}.pdf`;

  if (typeof window !== 'undefined' && typeof doc.save === 'function') {
    try {
      doc.save(filename);
    } catch (saveErr) {
      console.warn('doc.save failed, falling back to blob download:', saveErr);
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  return filename;
}
