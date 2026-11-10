import React, { useState } from 'react';
import { OfficerScannerCard } from './OfficerScannerCard';
import { GateScanLogsCard } from './GateScanLogsCard';
import { CreateEventCard } from './CreateEventCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  ScanLine,
  CalendarDays,
} from 'lucide-react';
import {
  EventDay,
  TimeSlotType,
  TIME_SLOTS,
  SboOfficerSession,
  ScannedStudentPayload,
  GateScanLogEntry,
  ClearanceEvent,
} from '@/types/attendance';
import { toast } from 'sonner';

interface SboTerminalScreenProps {
  officer: SboOfficerSession;
  currentStudent: {
    fullName: string;
    schoolId: string;
    department: string;
    section: string;
    photoDataUrl: string | null;
  };
  onApproveAttendance: (
    day: EventDay,
    slot: TimeSlotType,
    officer: SboOfficerSession,
    scannedStudent?: ScannedStudentPayload
  ) => void;
  activeEvent: ClearanceEvent;
  onUpdateActiveEvent: (event: ClearanceEvent) => void;
  onLockTerminal?: () => void;
  onReleaseTerminal?: () => void;
}

export const SboTerminalScreen: React.FC<SboTerminalScreenProps> = ({
  officer,
  currentStudent,
  onApproveAttendance,
  activeEvent,
  onUpdateActiveEvent,
}) => {
  const storageKey = `TCC_SBO_SCAN_LOGS_${officer.department}_${officer.stationCode}`;

  // Initialize logs from local storage or empty list
  const [scanLogs, setScanLogs] = useState<GateScanLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.warn('Failed to parse scan logs from storage:', err);
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState<string>('clearance');

  const handleApproveWithCount = (
    day: EventDay,
    slot: TimeSlotType,
    currentOfficer: SboOfficerSession,
    scannedStudent?: ScannedStudentPayload
  ) => {
    onApproveAttendance(day, slot, currentOfficer, scannedStudent);

    const studentName = scannedStudent?.fullName || currentStudent.fullName || 'Student';
    const schoolId = scannedStudent?.schoolId || currentStudent.schoolId || '---';
    const department = scannedStudent?.department || currentStudent.department || currentOfficer.department;
    const section = scannedStudent?.section || currentStudent.section || '---';
    const photo = scannedStudent?.photoDataUrl || currentStudent.photoDataUrl || null;
    const slotLabel = TIME_SLOTS.find((s) => s.id === slot)?.label || slot;

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateFormatted = now.toLocaleDateString([], { month: 'short', day: 'numeric' });

    const newEntry: GateScanLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      studentName,
      schoolId,
      department,
      section,
      photoDataUrl: photo,
      day,
      slot,
      slotLabel,
      timestamp: Date.now(),
      timeFormatted,
      dateFormatted,
      stampedBy: {
        officerName: currentOfficer.name,
        position: currentOfficer.position,
        department: currentOfficer.department,
        stationCode: currentOfficer.stationCode,
      },
    };

    setScanLogs((prev) => {
      const updated = [newEntry, ...prev];
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    toast.success('Clearance Stamp Stored', {
      description: `${studentName} cleared for ${day} (${slotLabel}) by ${currentOfficer.name}.`,
    });
  };

  const handleClearLogs = () => {
    setScanLogs([]);
    try {
      localStorage.removeItem(storageKey);
    } catch {}
    toast.info('Scan logs cleared for this station.');
  };

  return (
    <div className="w-full flex flex-col flex-1 max-w-6xl mx-auto px-2 sm:px-4">
      {/* Top Left Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-6 border-b border-border/60 pb-3">
          {/* Upper Left Tabs List */}
          <TabsList className="bg-muted/80 p-1 rounded-xl border border-border/60 h-10 shadow-2xs">
            <TabsTrigger
              value="clearance"
              className="gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer"
            >
              <ScanLine className="size-3.5 text-primary" />
              <span>Gate Clearance</span>
            </TabsTrigger>

            <TabsTrigger
              value="events"
              className="gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg cursor-pointer"
            >
              <CalendarDays className="size-3.5 text-primary" />
              <span>Events</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Gate Clearance (Live Scanner & Live Feed) */}
        <TabsContent value="clearance" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-6">
            {/* Left Column: Officer QR Scanner */}
            <div className="lg:col-span-5 w-full flex justify-center">
              <OfficerScannerCard
                officer={officer}
                currentStudent={currentStudent}
                onApproveAttendance={handleApproveWithCount}
                activeEvent={activeEvent}
              />
            </div>

            {/* Right Column: Gate Scan Logs */}
            <div className="lg:col-span-7 w-full">
              <GateScanLogsCard
                logs={scanLogs}
                stationCode={officer.stationCode}
                department={officer.department}
                onClearLogs={handleClearLogs}
              />
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Events Management Page (Table + Add Event Dialog) */}
        <TabsContent value="events" className="mt-0 pb-6">
          <CreateEventCard
            officer={officer}
            activeEvent={activeEvent}
            onUpdateActiveEvent={(evt) => {
              onUpdateActiveEvent(evt);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SboTerminalScreen;
