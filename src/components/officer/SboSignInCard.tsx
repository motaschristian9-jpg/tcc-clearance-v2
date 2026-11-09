import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  Loader2,
  UserCheck,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { TCC_DEPARTMENTS } from '@/types/student';
import { SboOfficerSession } from '@/types/attendance';

interface SboSignInCardProps {
  onOfficerAuthenticated: (officer: SboOfficerSession) => void;
  onBackToStudentPortal: () => void;
}

export type StationId = 'SBO 1' | 'SBO 2' | 'SBO 3' | 'SBO 4';
const STATIONS: StationId[] = ['SBO 1', 'SBO 2', 'SBO 3', 'SBO 4'];

export interface StationAccountState {
  officerName: string;
  position: string;
  department: string;
  stationId: StationId;
  status: 'active' | 'available';
  lastActive: string;
}

export const SBO_ACCOUNTS_STORAGE_KEY = 'TCC_SBO_ACTIVE_ACCOUNTS';

// Initial active accounts state per department
const getInitialAccounts = (): Record<string, StationAccountState> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(SBO_ACCOUNTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  // Initial default so SBO 1 shows an active officer sample for CIT
  return {
    'CIT-SBO1': {
      officerName: 'Christian Motas',
      position: 'Attendance Committee Head',
      department: 'CIT',
      stationId: 'SBO 1',
      status: 'active',
      lastActive: '12:00 PM',
    },
  };
};

// Preset officer positions for fast selection
const OFFICER_POSITIONS = [
  'Attendance Committee Head',
  'Gate Marshal',
  'SBO President',
  'SBO Vice President',
  'SBO Secretary',
  'SBO Auditor',
  'Year Level Representative',
  'Custom / Other',
];

// Validate station passcode
export const validateStationPasscode = (
  enteredPasscode: string,
  stationId: StationId,
  department: string
): boolean => {
  const clean = enteredPasscode.trim().toLowerCase();
  if (!clean) return false;

  // Master bypass codes
  if (['sbo2026', 'tcc-sbo-gate', '20261373'].includes(clean)) return true;

  const num = stationId.replace(/\D/g, ''); // '1' | '2' | '3' | '4'
  const deptCode = department.toLowerCase();

  const validVariants = [
    `sbo${num}`,
    `${deptCode}-sbo${num}`,
    `${deptCode}sbo${num}`,
  ];

  return validVariants.includes(clean);
};

export const SboSignInCard: React.FC<SboSignInCardProps> = ({
  onOfficerAuthenticated,
  onBackToStudentPortal,
}) => {
  const [department, setDepartment] = useState<string>('CIT');
  const [selectedStation, setSelectedStation] = useState<StationId>('SBO 1');
  const [accounts, setAccounts] = useState<Record<string, StationAccountState>>(() =>
    getInitialAccounts()
  );

  // Current occupant of the selected station (if populated)
  const currentKey = `${department}-${selectedStation.replace(/\s+/g, '')}`;
  const currentOccupant = accounts[currentKey];

  const [officerName, setOfficerName] = useState<string>(currentOccupant?.officerName || '');
  const [selectedPosition, setSelectedPosition] = useState<string>(
    currentOccupant?.position || 'Attendance Committee Head'
  );
  const [customPosition, setCustomPosition] = useState<string>('');
  const [passcode, setPasscode] = useState<string>('');
  const [showPasscode, setShowPasscode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const effectivePosition =
    selectedPosition === 'Custom / Other'
      ? customPosition.trim() || 'SBO Officer'
      : selectedPosition;

  // Check if account is populated and locked to another user
  const isOccupied = currentOccupant && currentOccupant.status === 'active';
  const isOccupiedByAnother =
    isOccupied &&
    currentOccupant.officerName.trim().toLowerCase() !== officerName.trim().toLowerCase();
  const isReturningOccupant =
    isOccupied &&
    currentOccupant.officerName.trim().toLowerCase() === officerName.trim().toLowerCase();

  // Handle station button selection
  const handleSelectStation = (stId: StationId) => {
    setSelectedStation(stId);
    setPasscode('');
    const key = `${department}-${stId.replace(/\s+/g, '')}`;
    const existing = accounts[key];

    if (existing && existing.status === 'active') {
      setOfficerName(existing.officerName);
      if (OFFICER_POSITIONS.includes(existing.position)) {
        setSelectedPosition(existing.position);
        setCustomPosition('');
      } else {
        setSelectedPosition('Custom / Other');
        setCustomPosition(existing.position);
      }
    } else {
      // If previously viewing an occupied station and moving to a vacant one, clear occupant name
      const prevKey = `${department}-${selectedStation.replace(/\s+/g, '')}`;
      if (accounts[prevKey]?.officerName === officerName) {
        setOfficerName('');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Security Gate 1: Check if populated and locked to another user
    if (isOccupiedByAnother) {
      toast.error('Station Account Locked', {
        description: `This station is currently assigned to ${currentOccupant.officerName}. It cannot be overwritten or removed unless that officer logs out.`,
      });
      return;
    }

    // Security Gate 2: Full Name Required
    if (!officerName.trim()) {
      toast.error('Officer Name Required', {
        description: 'Please enter your full name for the attendance stamping signature.',
      });
      return;
    }

    // Security Gate 3: Station Passcode Required (protection if someone finds the route)
    if (!passcode.trim()) {
      toast.error('Passcode Required', {
        description: `Please enter the authorized passcode for ${selectedStation} (e.g. sbo${selectedStation.replace(/\D/g, '')}).`,
      });
      return;
    }

    // Security Gate 4: Validate Passcode against department station
    const isValidPasscode = validateStationPasscode(passcode, selectedStation, department);
    if (!isValidPasscode) {
      toast.error('Invalid Station Passcode', {
        description: `The passcode entered is incorrect for ${selectedStation} in ${department}. Contact your SBO Lead.`,
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const key = `${department}-${selectedStation.replace(/\s+/g, '')}`;

      // Mark this account as populated and locked to this officer
      const updatedAccounts: Record<string, StationAccountState> = {
        ...accounts,
        [key]: {
          officerName: officerName.trim(),
          position: effectivePosition,
          department,
          stationId: selectedStation,
          status: 'active',
          lastActive: nowTime,
        },
      };

      setAccounts(updatedAccounts);
      try {
        localStorage.setItem(SBO_ACCOUNTS_STORAGE_KEY, JSON.stringify(updatedAccounts));
      } catch {}

      const officerSession: SboOfficerSession = {
        name: officerName.trim(),
        position: effectivePosition,
        department,
        stationCode: `${department}-${selectedStation.replace(/\s+/g, '')}`,
        loginTime: nowTime,
      };

      toast.success('Gate Terminal Unlocked', {
        description: `Duty active on ${selectedStation} as ${officerSession.name} (${officerSession.position}).`,
      });

      onOfficerAuthenticated(officerSession);
    }, 450);
  };

  return (
    <div className="w-full max-w-md mx-auto my-auto py-6">
      <Card className="border border-border/80 shadow-xl bg-card">
        <CardHeader className="text-center pb-4 pt-6">
          <div className="mx-auto size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 shadow-xs">
            <ShieldCheck className="size-6 text-foreground" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-muted text-muted-foreground border border-border mx-auto mb-1">
            <Lock className="size-3" />
            <span>Restricted Gateway · SBO Personnel Only</span>
          </div>

          <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
            SBO Gate Terminal
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Select an account and enter station passcode to access attendance terminal.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Department Selection */}
            <div className="space-y-1.5">
              <Label htmlFor="sbo-dept" className="text-xs font-medium">
                Department / College
              </Label>
              <Select
                value={department}
                onValueChange={(val) => {
                  setDepartment(val);
                  setPasscode('');
                  const newKey = `${val}-${selectedStation.replace(/\s+/g, '')}`;
                  const occupant = accounts[newKey];
                  setOfficerName(occupant?.officerName || '');
                }}
              >
                <SelectTrigger id="sbo-dept" className="h-9 text-xs">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {TCC_DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept.code} value={dept.code}>
                      <span className="font-semibold">{dept.code}</span> · {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Department SBO Accounts Grid (4 Accounts per Department) */}
            <div className="space-y-2 pt-1 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Department SBO Accounts</Label>
                <span className="text-[10px] font-mono text-muted-foreground">
                  4 Protected Stations
                </span>
              </div>

              {/* 4 Discrete Account Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STATIONS.map((stId) => {
                  const isSelected = selectedStation === stId;
                  const key = `${department}-${stId.replace(/\s+/g, '')}`;
                  const accountInfo = accounts[key];
                  const occupied = accountInfo && accountInfo.status === 'active';

                  return (
                    <button
                      key={stId}
                      type="button"
                      onClick={() => handleSelectStation(stId)}
                      className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[66px] ${
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary'
                          : 'border-border bg-card hover:bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-mono font-bold text-xs text-foreground">{stId}</span>
                        {occupied ? (
                          <div className="flex items-center gap-1">
                            <Lock className="size-2.5 text-amber-600 dark:text-amber-400" />
                            <span
                              className="size-1.5 rounded-full bg-emerald-500 animate-pulse"
                              title={`In Duty: ${accountInfo.officerName}`}
                            />
                          </div>
                        ) : (
                          <span
                            className="size-1.5 rounded-full bg-muted-foreground/30"
                            title="Account Available"
                          />
                        )}
                      </div>

                      <div className="pt-1.5 w-full">
                        {occupied ? (
                          <div className="truncate">
                            <span className="text-[10px] font-semibold text-foreground block truncate leading-tight">
                              {accountInfo.officerName}
                            </span>
                            <span className="text-[9px] text-amber-700 dark:text-amber-400 font-mono block truncate">
                              ● In Duty
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            Available
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Status Banner explaining state and locking policy */}
              {isOccupiedByAnother ? (
                <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold text-amber-900 dark:text-amber-200 text-[11px]">
                      {selectedStation} is Locked to {currentOccupant.officerName}
                    </p>
                    <p className="text-[10.5px] text-amber-800 dark:text-amber-300 leading-relaxed">
                      This station is in active duty by <strong>{currentOccupant.officerName}</strong> ({currentOccupant.position}).
                      Once populated, no one can remove or overwrite this user unless they log out from their terminal.
                    </p>
                    <p className="text-[10px] text-muted-foreground pt-0.5">
                      Please select an <strong>Available</strong> station account to begin your shift.
                    </p>
                  </div>
                </div>
              ) : isReturningOccupant ? (
                <div className="p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-xs flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  <span className="text-[11px] text-emerald-900 dark:text-emerald-300">
                    Welcome back, <strong>{currentOccupant.officerName}</strong>. Enter your passcode to resume duty on {selectedStation}.
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-muted/20 text-xs text-muted-foreground">
                  <span className="size-2 rounded-full bg-emerald-500/60 shrink-0" />
                  <span className="text-[11px]">
                    <strong className="text-foreground">{selectedStation}</strong> is vacant.
                    Enter your name, position, and station passcode to begin.
                  </span>
                </div>
              )}
            </div>

            {/* Officer Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="officer-name" className="text-xs font-medium">
                Officer Full Name
              </Label>
              <div className="relative">
                <Input
                  id="officer-name"
                  placeholder="e.g. Maria Santos or Christian Motas"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  disabled={isOccupiedByAnother}
                  className="h-9 text-xs pr-8"
                  required
                />
                <UserCheck className="size-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Your name will appear as the signatory on cleared student passes.
              </p>
            </div>

            {/* Officer Position / Role */}
            <div className="space-y-1.5">
              <Label htmlFor="officer-pos" className="text-xs font-medium">
                SBO Position / Role
              </Label>
              <Select
                value={selectedPosition}
                onValueChange={setSelectedPosition}
                disabled={isOccupiedByAnother}
              >
                <SelectTrigger id="officer-pos" className="h-9 text-xs">
                  <SelectValue placeholder="Select Position" />
                </SelectTrigger>
                <SelectContent>
                  {OFFICER_POSITIONS.map((pos) => (
                    <SelectItem key={pos} value={pos}>
                      {pos}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedPosition === 'Custom / Other' && (
                <Input
                  placeholder="Specify position (e.g. 3rd Year Representative)"
                  value={customPosition}
                  onChange={(e) => setCustomPosition(e.target.value)}
                  disabled={isOccupiedByAnother}
                  className="h-8 text-xs mt-2"
                  autoFocus
                />
              )}
            </div>

            {/* Station Passcode Input (Security against unauthorized student access) */}
            <div className="space-y-1.5 pt-1 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label htmlFor="station-passcode" className="text-xs font-medium flex items-center gap-1.5">
                  <KeyRound className="size-3.5 text-muted-foreground" />
                  <span>{selectedStation} Station Passcode</span>
                </Label>
                <span className="text-[10px] font-mono text-muted-foreground">
                  Security Passcode
                </span>
              </div>
              <div className="relative">
                <Input
                  id="station-passcode"
                  type={showPasscode ? 'text' : 'password'}
                  placeholder={`Enter passcode for ${selectedStation}`}
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  disabled={isOccupiedByAnother}
                  className="h-9 text-xs font-mono pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  title={showPasscode ? 'Hide passcode' : 'Show passcode'}
                >
                  {showPasscode ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Prevents unauthorized access if students discover this route (<code className="font-mono text-foreground font-semibold">sbo1</code>, <code className="font-mono text-foreground font-semibold">sbo2</code>, <code className="font-mono text-foreground font-semibold">sbo3</code>, <code className="font-mono text-foreground font-semibold">sbo4</code>).
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2.5 pt-2">
            <Button
              type="submit"
              disabled={isLoading || isOccupiedByAnother}
              className={`w-full h-10 text-xs font-medium gap-2 cursor-pointer shadow-xs ${
                isOccupiedByAnother ? 'opacity-60 cursor-not-allowed bg-muted text-muted-foreground border border-border' : ''
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  <span>Verifying Credentials...</span>
                </>
              ) : isOccupiedByAnother ? (
                <>
                  <Lock className="size-4 text-amber-500" />
                  <span>Station Locked to {currentOccupant.officerName}</span>
                </>
              ) : isReturningOccupant ? (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>Resume Duty as {selectedStation}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="size-4" />
                  <span>Unlock & Start Duty as {selectedStation}</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onBackToStudentPortal}
              className="w-full h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer gap-1.5"
            >
              <ArrowLeft className="size-3.5" />
              <span>Return to Student View</span>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SboSignInCard;
