import React, { useState } from 'react';
import { UserRole, ScanStatus } from '@/types';
import { Header } from '@/components/common/Header';
import { StatusStrip } from '@/components/common/StatusStrip';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { 
  Camera, 
  QrCode, 
  CheckCircle, 
  X, 
  FileText, 
  Download, 
  Search, 
  Clock, 
  UserCheck,
  CheckCircle2
} from 'lucide-react';

export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('officer');
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(3);
  const [currentVenue] = useState<string>('Gymnasium Court 1');
  const [currentSlot, setCurrentSlot] = useState<string>('Day 1 · Morning In');

  // Scanner Simulator State
  const [scannerSimulationState, setScannerSimulationState] = useState<ScanStatus>('accepted');
  const countdown = 24;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Header */}
      <Header currentRole={currentRole} onRoleChange={setCurrentRole} />

      {/* Persistent Status & Venue Strip (SBO Officer Mode) */}
      {currentRole === 'officer' && (
        <StatusStrip
          isOnline={isOnline}
          isReadyForOffline={true}
          pendingSyncCount={pendingSyncCount}
          currentVenue={currentVenue}
          currentSlot={currentSlot}
          onChangeVenueOrSlot={() => {
            const newSlot = currentSlot.includes('Morning In') ? 'Day 1 · Morning Out' : 'Day 1 · Morning In';
            setCurrentSlot(newSlot);
          }}
          onSyncClick={() => {
            setPendingSyncCount(0);
          }}
        />
      )}

      {/* Main Content Area: Action-First Layout */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">

        {/* ROLE 1: SBO FIELD OFFICER SCANNER EXPERIENCE */}
        {currentRole === 'officer' && (
          <div className="flex flex-col gap-6">
            {/* Context & Quick Mode Controls */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Event Scanner
                </h2>
                <p className="text-sm text-slate-600 font-medium">
                  Optimized for outdoor sunlight & rapid one-handed line check-in
                </p>
              </div>

              {/* State Tester for Developer/User Review */}
              <div className="hidden sm:flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold">
                <span className="px-2 text-slate-500">Preview State:</span>
                <button
                  onClick={() => setScannerSimulationState('accepted')}
                  className={`px-2 py-1 rounded transition-colors ${
                    scannerSimulationState === 'accepted'
                      ? 'bg-emerald-700 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  🟢 Accepted
                </button>
                <button
                  onClick={() => setScannerSimulationState('flagged')}
                  className={`px-2 py-1 rounded transition-colors ${
                    scannerSimulationState === 'flagged'
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  🟡 Flagged
                </button>
                <button
                  onClick={() => setScannerSimulationState('invalid')}
                  className={`px-2 py-1 rounded transition-colors ${
                    scannerSimulationState === 'invalid'
                      ? 'bg-red-700 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  🔴 Invalid
                </button>
              </div>
            </div>

            {/* Layout: Top Camera / QR Viewport + Result Card */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Camera Aim Viewport (Half screen or Left col) */}
              <div className="md:col-span-5 bg-slate-950 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[280px] sm:min-h-[340px] relative overflow-hidden border border-slate-800 shadow-md">
                <div className="absolute inset-4 border-2 border-dashed border-white/40 rounded-xl pointer-events-none flex items-center justify-center">
                  <div className="w-12 h-12 border-t-2 border-l-2 border-white absolute top-0 left-0"></div>
                  <div className="w-12 h-12 border-t-2 border-r-2 border-white absolute top-0 right-0"></div>
                  <div className="w-12 h-12 border-b-2 border-l-2 border-white absolute bottom-0 left-0"></div>
                  <div className="w-12 h-12 border-b-2 border-r-2 border-white absolute bottom-0 right-0"></div>
                </div>

                <div className="flex flex-col items-center text-center z-10 p-4">
                  <Camera className="w-12 h-12 text-white/70 mb-2" />
                  <p className="text-white text-sm font-semibold tracking-wide">
                    Aim camera at Student QR
                  </p>
                  <p className="text-white/60 text-xs mt-1">
                    Continuous offline cryptographic scan
                  </p>
                </div>

                {/* Bottom Viewport Overlay */}
                <div className="absolute bottom-3 left-3 right-3 bg-black/75 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center justify-between text-xs text-white">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Scanner Active
                  </span>
                  <span className="font-mono text-slate-300">ECDSA P-256</span>
                </div>
              </div>

              {/* Student Result Card (Takes at least 40% screen width, large type) */}
              <div className="md:col-span-7 bg-white border border-slate-300 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
                <div>
                  {/* Status Dual-Encoding Badge */}
                  <div className="mb-4">
                    <Badge variant={scannerSimulationState} />
                  </div>

                  {/* Student Details Grid (Sunlight-optimized high contrast) */}
                  <div className="flex gap-4 sm:gap-6 items-start">
                    {/* Student Photo (At least 40% width on mobile) */}
                    <div className="w-28 h-36 sm:w-36 sm:h-44 bg-slate-100 rounded-xl border-2 border-slate-300 overflow-hidden shrink-0 flex items-center justify-center relative">
                      <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                        <UserCheck className="w-12 h-12 text-slate-500 mb-1" />
                        <span className="text-[10px] font-mono font-bold text-slate-600 uppercase">
                          Live Verified
                        </span>
                      </div>
                      <div className="absolute bottom-1 right-1 bg-brand-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        CIT
                      </div>
                    </div>

                    {/* Information Hierarchy */}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono font-semibold text-slate-500 tracking-wider">
                        ID: 2023-01842
                      </div>
                      {/* Name in Large Type (>=24px) */}
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight mt-0.5 truncate">
                        ALEXANDER M. CRUZ
                      </h3>

                      <div className="mt-2 space-y-1 text-sm font-medium text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500">Program:</span>
                          <span className="font-bold text-slate-900">BS Information Technology</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-500">Section:</span>
                          <span className="font-semibold text-slate-800">BSIT 3-A</span>
                        </div>
                      </div>

                      {/* Flag Details (when state is flagged) */}
                      {scannerSimulationState === 'flagged' && (
                        <div className="mt-3 p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900 font-medium">
                          ⚠️ <span className="font-bold">Location Drift:</span> Student scanned outside designated gym perimeter (approx. 45m away).
                        </div>
                      )}

                      {/* Invalid Details (when state is invalid) */}
                      {scannerSimulationState === 'invalid' && (
                        <div className="mt-3 p-2.5 bg-red-50 border border-red-300 rounded-lg text-xs text-red-900 font-medium">
                          ❌ <span className="font-bold">Signature Mismatch:</span> QR timestamp expired (&gt;30s) or device key unregistered.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons (Thumb-reachable, >=48px touch target) */}
                <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3">
                  {scannerSimulationState === 'accepted' ? (
                    <>
                      <Button
                        variant="accept"
                        size="scanner"
                        className="flex-1"
                        leftIcon={<CheckCircle2 className="w-6 h-6" />}
                        onClick={() => {
                          setPendingSyncCount((prev) => prev + 1);
                        }}
                      >
                        Accept & Commit Check-In
                      </Button>
                      <Button
                        variant="secondary"
                        size="lg"
                        className="text-red-700 border-red-200 hover:bg-red-50"
                        onClick={() => setScannerSimulationState('invalid')}
                      >
                        Reject
                      </Button>
                    </>
                  ) : scannerSimulationState === 'flagged' ? (
                    <>
                      <Button
                        variant="amber"
                        size="scanner"
                        className="flex-1"
                        leftIcon={<CheckCircle className="w-5 h-5" />}
                        onClick={() => setScannerSimulationState('accepted')}
                      >
                        Override & Accept
                      </Button>
                      <Button
                        variant="reject"
                        size="lg"
                        leftIcon={<X className="w-5 h-5" />}
                        onClick={() => setScannerSimulationState('invalid')}
                      >
                        Reject Flag
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="primary"
                      size="scanner"
                      leftIcon={<QrCode className="w-5 h-5" />}
                      onClick={() => setScannerSimulationState('accepted')}
                    >
                      Scan Next Student
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Footer Bar */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Search className="w-4 h-4 text-slate-600" />}
                className="w-full text-xs sm:text-sm font-semibold truncate"
                onClick={() => alert('Manual Check-in Modal: Search student by ID or Name')}
              >
                Manual Entry
              </Button>
              <Button
                variant="secondary"
                size="md"
                leftIcon={<FileText className="w-4 h-4 text-slate-600" />}
                className="w-full text-xs sm:text-sm font-semibold truncate"
                onClick={() => alert('Check Card: Validate full student clearance matrix')}
              >
                Check Card
              </Button>
              <Button
                variant="secondary"
                size="md"
                leftIcon={<Download className="w-4 h-4 text-slate-600" />}
                className="w-full text-xs sm:text-sm font-semibold truncate"
                onClick={() => setIsOnline(!isOnline)}
              >
                Toggle {isOnline ? 'Offline' : 'Online'}
              </Button>
            </div>
          </div>
        )}

        {/* ROLE 2: STUDENT PORTAL EXPERIENCE */}
        {currentRole === 'student' && (
          <div className="flex flex-col gap-6 max-w-md mx-auto w-full">
            <div className="text-center">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                My Attendance Pass
              </h2>
              <p className="text-sm text-slate-600 font-medium">
                CIT Intramurals 2026 · Tagoloan Community College
              </p>
            </div>

            {/* Student Pass Card with Rotating 30s QR Code */}
            <div className="bg-white border-2 border-slate-300 rounded-3xl p-6 shadow-sm flex flex-col items-center">
              {/* Rotating dynamic QR box */}
              <div className="w-64 h-64 bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white relative shadow-inner p-4">
                <QrCode className="w-48 h-48 text-white" />
                <div className="absolute top-2 right-2 bg-emerald-500 text-slate-950 font-mono text-[11px] font-bold px-2 py-0.5 rounded-full">
                  LIVE
                </div>
              </div>

              {/* 30s Security Countdown Bar */}
              <div className="w-full mt-4 flex items-center justify-between text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1 text-slate-800">
                  <Clock className="w-3.5 h-3.5 text-brand-700" />
                  Rotates every 30s
                </span>
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-brand-800 font-bold">
                  {countdown}s remaining
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                <div
                  className="bg-brand-700 h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${(countdown / 30) * 100}%` }}
                ></div>
              </div>

              {/* Student Identification */}
              <div className="w-full mt-5 pt-4 border-t border-slate-200 text-center">
                <div className="text-xs uppercase tracking-wider font-bold text-slate-500">
                  BSIT 3-A · ID 2023-01842
                </div>
                <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                  ALEXANDER M. CRUZ
                </div>
                <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-semibold">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Device Cryptographically Bound
                </div>
              </div>
            </div>

            {/* Quick Action: Open Digital Activity Card */}
            <Button
              variant="secondary"
              size="lg"
              leftIcon={<FileText className="w-5 h-5 text-slate-700" />}
              className="w-full"
              onClick={() => alert('View Activity Card: Displaying 5-Day CIT Intramurals clearance matrix')}
            >
              View My Digital Activity Card
            </Button>
          </div>
        )}

        {/* ROLE 3: HEAD OFFICER / ADMIN DASHBOARD PREVIEW */}
        {currentRole === 'head_officer' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  Department Attendance & Clearance Matrix
                </h2>
                <p className="text-sm text-slate-600 font-medium">
                  CIT Intramurals 2026 · College of Information Technology
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={() => alert('Exporting Department Workbook to ExcelJS format...')}
              >
                Export Excel (XLSX)
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Enrolled</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">482</div>
                <div className="text-xs text-slate-500 mt-0.5">CIT Students</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Day 1 Morning In</div>
                <div className="text-2xl font-extrabold text-emerald-700 mt-1">461</div>
                <div className="text-xs text-emerald-600 font-medium mt-0.5">95.6% Cleared</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Flagged Scans</div>
                <div className="text-2xl font-extrabold text-amber-700 mt-1">12</div>
                <div className="text-xs text-amber-700 font-medium mt-0.5">Requires Head Audit</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Signed Digital Cards</div>
                <div className="text-2xl font-extrabold text-brand-800 mt-1">458</div>
                <div className="text-xs text-slate-500 mt-0.5">ECDSA Verified</div>
              </div>
            </div>

            {/* Table Mockup */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-800">CIT Section 3-A Roster (Sample)</span>
                <span className="text-xs text-slate-500">Sorted by Surname</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">School ID</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Day 1 In</th>
                      <th className="py-3 px-4">Day 1 Out</th>
                      <th className="py-3 px-4">Day 2 In</th>
                      <th className="py-3 px-4">Day 2 Out</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                    <tr>
                      <td className="py-3 px-4 font-mono text-xs">2023-01842</td>
                      <td className="py-3 px-4 font-bold text-slate-900">Cruz, Alexander M.</td>
                      <td className="py-3 px-4 text-emerald-700 font-semibold">07:54 AM ✓</td>
                      <td className="py-3 px-4 text-emerald-700 font-semibold">11:45 AM ✓</td>
                      <td className="py-3 px-4 text-emerald-700 font-semibold">08:02 AM ✓</td>
                      <td className="py-3 px-4 text-slate-400">Pending</td>
                      <td className="py-3 px-4">
                        <Badge variant="accepted" label="On Track" />
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-mono text-xs">2023-01905</td>
                      <td className="py-3 px-4 font-bold text-slate-900">Dela Cruz, Juan P.</td>
                      <td className="py-3 px-4 text-emerald-700 font-semibold">08:12 AM ✓</td>
                      <td className="py-3 px-4 text-amber-700 font-semibold">Flagged (Late)</td>
                      <td className="py-3 px-4 text-emerald-700 font-semibold">07:50 AM ✓</td>
                      <td className="py-3 px-4 text-slate-400">Pending</td>
                      <td className="py-3 px-4">
                        <Badge variant="flagged" label="Review Req." />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Utilitarian Footer */}
      <footer className="border-t border-slate-200 bg-white py-3 px-4 text-center text-xs text-slate-500 font-medium">
        Tagoloan Community College · Event Clearance & Cryptographic Attendance PWA · Minimalist SaaS
      </footer>
    </div>
  );
};

export default App;
