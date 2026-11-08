import React, { useState } from 'react';
import { UserRole, ScanStatus } from '@/types';
import { Header } from '@/components/common/Header';
import { StatusStrip } from '@/components/common/StatusStrip';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { 
  Camera, 
  QrCode, 
  Check, 
  ArrowRight,
  FileDown
} from 'lucide-react';

export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('officer');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(3);
  const [currentVenue] = useState<string>('Gymnasium Court 1');
  const [currentSlot, setCurrentSlot] = useState<string>('Day 1 · Morning In');

  // Scanner Simulator State
  const [scanState, setScanState] = useState<ScanStatus>('accepted');
  const countdown = 24;

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 selection:bg-neutral-950 selection:text-white">
      {/* Super Minimalist Header */}
      <Header currentRole={currentRole} onRoleChange={setCurrentRole} />

      {/* Subtle Station & Connectivity Strip (Officer Mode) */}
      {currentRole === 'officer' && (
        <StatusStrip
          isOnline={isOnline}
          pendingSyncCount={pendingSyncCount}
          currentVenue={currentVenue}
          currentSlot={currentSlot}
          onChangeVenueOrSlot={() => {
            setCurrentSlot((prev) => 
              prev.includes('Morning In') ? 'Day 1 · Morning Out' : 'Day 1 · Morning In'
            );
          }}
          onSyncClick={() => setPendingSyncCount(0)}
        />
      )}

      {/* Main Workspace with Generous White Spaces */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 sm:px-12 py-12 sm:py-20 flex flex-col justify-start">
        
        {/* ========================================================= */}
        {/* VIEW 1: FIELD SCANNER (SUPER MINIMALIST & ACTION-FIRST)   */}
        {/* ========================================================= */}
        {currentRole === 'officer' && (
          <div className="flex flex-col gap-16">
            
            {/* Minimal Title & Sim Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-6 pb-6 border-b border-neutral-100">
              <div>
                <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400">
                  Tagoloan Community College
                </span>
                <h2 className="text-2xl sm:text-3xl font-light text-neutral-950 tracking-tight mt-1">
                  Scanner
                </h2>
              </div>

              {/* Minimal state toggle for review */}
              <div className="flex items-center gap-4 text-xs">
                <span className="text-neutral-400">State:</span>
                <button
                  onClick={() => setScanState('accepted')}
                  className={`transition-colors ${scanState === 'accepted' ? 'font-semibold text-neutral-950 underline underline-offset-4' : 'text-neutral-400 hover:text-neutral-700'}`}
                >
                  Accepted
                </button>
                <button
                  onClick={() => setScanState('flagged')}
                  className={`transition-colors ${scanState === 'flagged' ? 'font-semibold text-amber-700 underline underline-offset-4' : 'text-neutral-400 hover:text-neutral-700'}`}
                >
                  Flagged
                </button>
                <button
                  onClick={() => setScanState('invalid')}
                  className={`transition-colors ${scanState === 'invalid' ? 'font-semibold text-red-700 underline underline-offset-4' : 'text-neutral-400 hover:text-neutral-700'}`}
                >
                  Invalid
                </button>
              </div>
            </div>

            {/* Action-First Core: Viewfinder + Student Detail Card */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 sm:gap-16 items-start">
              
              {/* Camera Aim Viewport (Ultra-clean, thin brackets, white negative space) */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className="w-full aspect-square max-w-[280px] sm:max-w-none border border-neutral-200 rounded-lg relative flex flex-col items-center justify-center p-8 bg-neutral-50/50">
                  {/* Subtle Corner Brackets */}
                  <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-neutral-900 pointer-events-none" />
                  <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-neutral-900 pointer-events-none" />
                  <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-neutral-900 pointer-events-none" />
                  <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-neutral-900 pointer-events-none" />

                  <Camera className="w-8 h-8 text-neutral-400 mb-3" />
                  <p className="text-xs text-neutral-500 font-normal tracking-wide text-center">
                    Point camera at Student Pass
                  </p>
                </div>

                <div className="w-full mt-4 flex items-center justify-between text-[11px] text-neutral-400">
                  <span>ECDSA Offline Engine</span>
                  <span className="flex items-center gap-1.5 text-neutral-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    Live Viewfinder
                  </span>
                </div>
              </div>

              {/* Student Result (Generous White Spaces, Clean Hierarchy) */}
              <div className="md:col-span-7 flex flex-col justify-between min-h-[300px]">
                <div className="space-y-6">
                  {/* Status Indicator */}
                  <div>
                    <Badge variant={scanState} />
                  </div>

                  {/* Student Details */}
                  <div className="space-y-4">
                    <div className="text-xs tracking-wider text-neutral-400 font-mono">
                      ID 2023-01842 · CIT
                    </div>

                    <h3 className="text-3xl sm:text-4xl font-light text-neutral-950 tracking-tight leading-none">
                      Alexander M. Cruz
                    </h3>

                    <div className="pt-2 text-sm text-neutral-500 font-normal space-y-1">
                      <p>Bachelor of Science in Information Technology</p>
                      <p className="text-neutral-400">Section 3-A · Tagoloan Community College</p>
                    </div>

                    {/* Diagnostic notes if flagged or invalid */}
                    {scanState === 'flagged' && (
                      <div className="py-3 px-4 border border-amber-200 bg-amber-50/50 rounded text-xs text-amber-900 leading-relaxed">
                        Location notice: Student registered 40m outside main perimeter. Manual officer approval required.
                      </div>
                    )}

                    {scanState === 'invalid' && (
                      <div className="py-3 px-4 border border-red-200 bg-red-50/50 rounded text-xs text-red-900 leading-relaxed">
                        Signature verification failed. The QR code has expired or was not signed by this student’s bound device.
                      </div>
                    )}
                  </div>
                </div>

                {/* Primary Action Button (Generous white space separation, min 48px touch target) */}
                <div className="pt-10 flex flex-col sm:flex-row gap-4">
                  {scanState === 'accepted' ? (
                    <>
                      <Button
                        variant="primary"
                        size="lg"
                        className="flex-1"
                        rightIcon={<ArrowRight className="w-4 h-4" />}
                        onClick={() => setPendingSyncCount((prev) => prev + 1)}
                      >
                        Accept & Check-in
                      </Button>
                      <Button
                        variant="danger"
                        size="lg"
                        onClick={() => setScanState('invalid')}
                      >
                        Reject
                      </Button>
                    </>
                  ) : scanState === 'flagged' ? (
                    <>
                      <Button
                        variant="primary"
                        size="lg"
                        className="flex-1"
                        onClick={() => setScanState('accepted')}
                      >
                        Approve Exception
                      </Button>
                      <Button
                        variant="danger"
                        size="lg"
                        onClick={() => setScanState('invalid')}
                      >
                        Reject Scan
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full"
                      onClick={() => setScanState('accepted')}
                    >
                      Scan Next Student
                    </Button>
                  )}
                </div>

              </div>
            </div>

            {/* Quiet Footer Links */}
            <div className="pt-12 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-6 text-xs text-neutral-400">
              <button 
                onClick={() => alert('Search student roster manually')}
                className="hover:text-neutral-900 transition-colors"
              >
                Manual Search & Entry
              </button>
              <button 
                onClick={() => alert('Check student digital activity card matrix')}
                className="hover:text-neutral-900 transition-colors"
              >
                Inspect Activity Card
              </button>
              <button 
                onClick={() => setIsOnline(!isOnline)}
                className="hover:text-neutral-900 transition-colors"
              >
                Switch to {isOnline ? 'Offline' : 'Online'} Mode
              </button>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: STUDENT PASS (PURE WHITE SPACES & ROTATING PASS)  */}
        {/* ========================================================= */}
        {currentRole === 'student' && (
          <div className="max-w-md mx-auto w-full py-8 flex flex-col items-center text-center gap-12">
            
            {/* Header */}
            <div>
              <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400">
                CIT Intramurals 2026
              </span>
              <h2 className="text-3xl font-light text-neutral-950 tracking-tight mt-1">
                Alexander M. Cruz
              </h2>
              <p className="text-xs text-neutral-500 font-mono mt-1">
                BSIT 3-A · ID 2023-01842
              </p>
            </div>

            {/* QR Code Container with High Breathing Room */}
            <div className="flex flex-col items-center">
              <div className="p-8 border border-neutral-200 rounded-2xl bg-white shadow-sm flex flex-col items-center">
                <QrCode className="w-56 h-56 text-neutral-950" />
              </div>

              {/* Quiet, Minimalist 30s Countdown Indicator */}
              <div className="mt-6 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  <span>Pass refreshes in {countdown}s</span>
                </div>
                <div className="w-48 bg-neutral-100 h-0.5 rounded-full overflow-hidden">
                  <div
                    className="bg-neutral-900 h-full transition-all duration-1000 ease-linear"
                    style={{ width: `${(countdown / 30) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Cryptographic Device Status */}
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Check className="w-3.5 h-3.5 text-neutral-900" />
              <span>ECDSA key bound to this device</span>
            </div>

            {/* Minimal Action */}
            <div className="w-full pt-4">
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                onClick={() => alert('Opening Digital Activity Card with 5-Day attendance slots...')}
              >
                View Activity Card
              </Button>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: HEAD / ADMIN CLEARANCE RECORDS (AIRY TABLE)       */}
        {/* ========================================================= */}
        {currentRole === 'head_officer' && (
          <div className="flex flex-col gap-12">
            
            {/* Header with High Breathing Room */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 pb-6 border-b border-neutral-100">
              <div>
                <span className="text-[11px] font-medium tracking-widest uppercase text-neutral-400">
                  College of Information Technology
                </span>
                <h2 className="text-2xl sm:text-3xl font-light text-neutral-950 tracking-tight mt-1">
                  Clearance Records
                </h2>
              </div>

              <button
                onClick={() => alert('Exporting attendance records to Excel...')}
                className="inline-flex items-center gap-2 text-xs text-neutral-600 hover:text-neutral-950 transition-colors uppercase tracking-wider font-medium"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Export (XLSX)</span>
              </button>
            </div>

            {/* Quiet Metrics (Airy Numbers, No Heavy Boxes) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-4">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-neutral-400">Enrolled</span>
                <p className="text-3xl font-light text-neutral-950 mt-1">482</p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-neutral-400">Cleared Day 1</span>
                <p className="text-3xl font-light text-neutral-950 mt-1">461</p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-neutral-400">Flagged</span>
                <p className="text-3xl font-light text-neutral-950 mt-1">12</p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-neutral-400">Verified Stamps</span>
                <p className="text-3xl font-light text-neutral-950 mt-1">458</p>
              </div>
            </div>

            {/* Minimalist Airy Attendance Table */}
            <div className="pt-6 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-400 font-normal uppercase tracking-wider">
                    <th className="py-4 pr-6">School ID</th>
                    <th className="py-4 pr-6">Student Name</th>
                    <th className="py-4 pr-6">Day 1 In</th>
                    <th className="py-4 pr-6">Day 1 Out</th>
                    <th className="py-4 pr-6">Day 2 In</th>
                    <th className="py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  <tr className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-5 pr-6 font-mono text-neutral-400">2023-01842</td>
                    <td className="py-5 pr-6 font-medium text-neutral-950">Alexander M. Cruz</td>
                    <td className="py-5 pr-6">07:54 AM</td>
                    <td className="py-5 pr-6">11:45 AM</td>
                    <td className="py-5 pr-6">08:02 AM</td>
                    <td className="py-5">
                      <Badge variant="accepted" label="Cleared" />
                    </td>
                  </tr>
                  <tr className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-5 pr-6 font-mono text-neutral-400">2023-01905</td>
                    <td className="py-5 pr-6 font-medium text-neutral-950">Juan P. Dela Cruz</td>
                    <td className="py-5 pr-6">08:12 AM</td>
                    <td className="py-5 pr-6 text-amber-700">Late Out</td>
                    <td className="py-5 pr-6">07:50 AM</td>
                    <td className="py-5">
                      <Badge variant="flagged" label="Review" />
                    </td>
                  </tr>
                  <tr className="hover:bg-neutral-50/50 transition-colors">
                    <td className="py-5 pr-6 font-mono text-neutral-400">2023-02011</td>
                    <td className="py-5 pr-6 font-medium text-neutral-950">Maria Elena S. Santos</td>
                    <td className="py-5 pr-6">07:48 AM</td>
                    <td className="py-5 pr-6">11:50 AM</td>
                    <td className="py-5 pr-6">07:58 AM</td>
                    <td className="py-5">
                      <Badge variant="accepted" label="Cleared" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        )}

      </main>

      {/* Clean, quiet footer */}
      <footer className="border-t border-neutral-100 py-8 px-6 sm:px-12 text-center text-[11px] text-neutral-400">
        Tagoloan Community College · Minimalist Clearance System
      </footer>
    </div>
  );
};

export default App;
