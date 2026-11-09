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
  UserMinus,
  CheckCircle2,
  Users,
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

const STORAGE_KEY = 'TCC_SBO_ACTIVE_ACCOUNTS';

// Initial active accounts state per department
const getInitialAccounts = (): Record<string, StationAccountState> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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

export const SboSignInCard: React.FC<SboSignInCardProps> = ({
  onOfficerAuthenticated,
  onBackToStudentPortal,
}) => {
  const [department, setDepartment] = useState<string>('CIT');
  const [selectedStation, setSelectedStation] = useState<StationId>('SBO 1');
  const [accounts, setAccounts] = useState<Record<string, StationAccountState>>(() =>
    getInitialAccounts()
  );

  // Initialize with current user of CIT-SBO1 if present
  const currentKey = `${department}-${selectedStation.replace(/\s+/g, '')}`;
  const initialOccupant = accounts[currentKey];

  const [officerName, setOfficerName] = useState<string>(initialOccupant?.officerName || '');
  const [selectedPosition, setSelectedPosition] = useState<string>(
    initialOccupant?.position || 'Attendance Committee Head'
  );
  const [customPosition, setCustomPosition] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const effectivePosition =
    selectedPosition === 'Custom / Other'
      ? customPosition.trim() || 'SBO Officer'
      : selectedPosition;

  // Handle station selection
  const handleSelectStation = (stId: StationId) => {
    setSelectedStation(stId);
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
      // Station is available - if officer had previously prefilled an old occupant, clear it
      const prevKey = `${department}-${selectedStation.replace(/\s+/g, '')}`;
      if (accounts[prevKey]?.officerName === officerName) {
        setOfficerName('');
      }
    }
  };

  // Vacate / release account back to available status
  const handleReleaseStation = (stId: StationId) => {
    const key = `${department}-${stId.replace(/\s+/g, '')}`;
    setAccounts((prev) => {
      const copy = { ...prev };
      delete copy[key];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(copy));
      } catch {}
      return copy;
    });

    if (selectedStation === stId) {
      setOfficerName('');
    }

    toast.info(`${stId} Account Vacated`, {
      description: `Station ${stId} is now marked Available for ${department}.`,
    });
  };

  const currentOccupant = accounts[currentKey];
  const isOccupiedByAnother =
    currentOccupant &&
    currentOccupant.status === 'active' &&
    currentOccupant.officerName.toLowerCase() !== officerName.trim().toLowerCase();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!officerName.trim()) {
      toast.error('Officer Name Required', {
        description: 'Please enter your full name for the attendance stamping signature.',
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const key = `${department}-${selectedStation.replace(/\s+/g, '')}`;

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
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedAccounts));
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
    }, 400);
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
            <span>Restricted Gateway · SBO Personnel</span>
          </div>

          <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
            SBO Gate Terminal
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Select your department station account to begin clearance stamping.
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

            {/* Department SBO Accounts (4 per Department) */}
            <div className="space-y-2 pt-1 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Department SBO Accounts</Label>
                <span className="text-[10px] font-mono text-muted-foreground">
                  4 Accounts per Department
                </span>
              </div>

              {/* Grid of 4 accounts showing who is currently using each account */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STATIONS.map((stId) => {
                  const isSelected = selectedStation === stId;
                  const key = `${department}-${stId.replace(/\s+/g, '')}`;
                  const accountInfo = accounts[key];
                  const isOccupied = accountInfo && accountInfo.status === 'active';

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
                        <span
                          className={`size-2 rounded-full ${
                            isOccupied
                              ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)] animate-pulse'
                              : 'bg-muted-foreground/30'
                          }`}
                          title={
                            isOccupied
                              ? `Used by ${accountInfo.officerName}`
                              : 'Account Available'
                          }
                        />
                      </div>

                      <div className="pt-1.5 w-full">
                        {isOccupied ? (
                          <div className="truncate">
                            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 block truncate leading-tight">
                              {accountInfo.officerName}
                            </span>
                            <span className="text-[9px] text-muted-foreground block truncate">
                              {accountInfo.position}
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

              {/* Status Banner for Currently Selected Account */}
              {currentOccupant && currentOccupant.status === 'active' ? (
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-[11px] text-emerald-900 dark:text-emerald-300 truncate">
                      {selectedStation} is used by{' '}
                      <strong>{currentOccupant.officerName}</strong> ({currentOccupant.position})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleReleaseStation(selectedStation)}
                    className="text-[10px] text-muted-foreground hover:text-destructive underline shrink-0 ml-2 cursor-pointer flex items-center gap-1"
                    title="Vacate this account so another officer can use it"
                  >
                    <UserMinus className="size-3" />
                    <span>Vacate</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2 rounded-lg border border-border bg-muted/20 text-xs text-muted-foreground">
                  <span className="size-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
                  <span className="text-[11px]">
                    <strong className="text-foreground">{selectedStation}</strong> is available.
                    Enter your name and position to begin duty.
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
              <Select value={selectedPosition} onValueChange={setSelectedPosition}>
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
                  className="h-8 text-xs mt-2"
                  autoFocus
                />
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-2.5 pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 text-xs font-medium gap-2 cursor-pointer shadow-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  <span>Connecting to Terminal...</span>
                </>
              ) : isOccupiedByAnother ? (
                <>
                  <Users className="size-4" />
                  <span>Take Over Duty as {selectedStation}</span>
                </>
              ) : currentOccupant && currentOccupant.status === 'active' ? (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>Resume Duty as {selectedStation}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="size-4" />
                  <span>Start Duty as {selectedStation}</span>
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
