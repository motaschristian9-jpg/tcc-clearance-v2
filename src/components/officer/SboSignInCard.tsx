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
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
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

export const validateStationPasscode = (
  enteredPasscode: string,
  stationId: StationId,
  department: string
): boolean => {
  const clean = enteredPasscode.trim().toLowerCase();
  if (!clean) return false;

  if (['sbo2026', 'tcc-sbo-gate', '20261373'].includes(clean)) return true;

  const num = stationId.replace(/\D/g, '');
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

  const isOccupied = currentOccupant && currentOccupant.status === 'active';
  const isOccupiedByAnother =
    isOccupied &&
    currentOccupant.officerName.trim().toLowerCase() !== officerName.trim().toLowerCase();
  const isReturningOccupant =
    isOccupied &&
    currentOccupant.officerName.trim().toLowerCase() === officerName.trim().toLowerCase();

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
      const prevKey = `${department}-${selectedStation.replace(/\s+/g, '')}`;
      if (accounts[prevKey]?.officerName === officerName) {
        setOfficerName('');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isOccupiedByAnother) {
      toast.error('Station Account Locked', {
        description: `This station is locked to ${currentOccupant.officerName}. It cannot be changed unless they log out.`,
      });
      return;
    }

    if (!officerName.trim()) {
      toast.error('Officer Name Required', {
        description: 'Please enter your full name.',
      });
      return;
    }

    if (!passcode.trim()) {
      toast.error('Passcode Required', {
        description: `Please enter the passcode for ${selectedStation}.`,
      });
      return;
    }

    const isValidPasscode = validateStationPasscode(passcode, selectedStation, department);
    if (!isValidPasscode) {
      toast.error('Invalid Passcode', {
        description: 'The passcode entered is incorrect.',
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
        description: `Logged in as ${officerSession.name} (${selectedStation}).`,
      });

      onOfficerAuthenticated(officerSession);
    }, 450);
  };

  return (
    <div className="w-full max-w-sm mx-auto my-auto py-6">
      <Card className="border border-border/80 shadow-xl bg-card">
        <CardHeader className="text-center pb-3 pt-5">
          <div className="mx-auto size-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-2 shadow-xs">
            <ShieldCheck className="size-5 text-foreground" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-muted text-muted-foreground border border-border mx-auto mb-1">
            <Lock className="size-2.5" />
            <span>Restricted Gateway</span>
          </div>

          <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
            SBO Gate Terminal
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Sign in to start clearance duty.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3.5 text-xs">
            <FieldGroup className="gap-3">
              {/* Department */}
              <Field>
                <FieldLabel htmlFor="sbo-dept">Department</FieldLabel>
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
              </Field>

              {/* SBO Accounts Grid */}
              <Field>
                <div className="flex items-center justify-between pb-0.5">
                  <FieldLabel>SBO Account</FieldLabel>
                  <span className="text-[10px] text-muted-foreground font-mono">4 Accounts</span>
                </div>

                <div className="grid grid-cols-4 gap-1.5">
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
                        className={`p-2 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[58px] ${
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary'
                            : 'border-border bg-card hover:bg-muted/30'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-mono font-bold text-[11px] text-foreground">
                            {stId}
                          </span>
                          {occupied ? (
                            <div className="flex items-center gap-0.5">
                              <Lock className="size-2 text-amber-600 dark:text-amber-400" />
                              <span
                                className="size-1.5 rounded-full bg-emerald-500 animate-pulse"
                                title={`In Duty: ${accountInfo.officerName}`}
                              />
                            </div>
                          ) : (
                            <span
                              className="size-1.5 rounded-full bg-muted-foreground/30"
                              title="Available"
                            />
                          )}
                        </div>

                        <div className="pt-1 w-full truncate">
                          {occupied ? (
                            <span className="text-[9.5px] font-semibold text-foreground block truncate leading-tight">
                              {accountInfo.officerName.split(' ')[0]}
                            </span>
                          ) : (
                            <span className="text-[9.5px] text-muted-foreground font-mono">
                              Free
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {isOccupiedByAnother && (
                  <div className="p-2 rounded-md border border-amber-500/20 bg-amber-500/10 text-[11px] text-amber-900 dark:text-amber-200 flex items-center gap-1.5 mt-1">
                    <Lock className="size-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">
                      Occupied by <strong>{currentOccupant.officerName}</strong>. Select a free account.
                    </span>
                  </div>
                )}
              </Field>

              {/* Officer Full Name */}
              <Field>
                <FieldLabel htmlFor="officer-name">Officer Name</FieldLabel>
                <div className="relative">
                  <Input
                    id="officer-name"
                    placeholder="Enter your name"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    disabled={isOccupiedByAnother}
                    className="h-9 text-xs pr-8"
                    required
                  />
                  <UserCheck className="size-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </Field>

              {/* SBO Position */}
              <Field>
                <FieldLabel htmlFor="officer-pos">Position</FieldLabel>
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
                    placeholder="Specify position"
                    value={customPosition}
                    onChange={(e) => setCustomPosition(e.target.value)}
                    disabled={isOccupiedByAnother}
                    className="h-8 text-xs mt-1.5"
                    autoFocus
                  />
                )}
              </Field>

              {/* Passcode (Hidden, no hints or values exposed) */}
              <Field>
                <FieldLabel htmlFor="station-passcode" className="flex items-center gap-1.5">
                  <KeyRound className="size-3.5 text-muted-foreground" />
                  <span>Passcode</span>
                </FieldLabel>
                <div className="relative">
                  <Input
                    id="station-passcode"
                    type={showPasscode ? 'text' : 'password'}
                    placeholder="••••••••"
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
              </Field>
            </FieldGroup>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 pt-2 pb-5">
            <Button
              type="submit"
              disabled={isLoading || isOccupiedByAnother}
              className={`w-full h-9 text-xs font-medium gap-2 cursor-pointer shadow-xs ${
                isOccupiedByAnother
                  ? 'opacity-60 cursor-not-allowed bg-muted text-muted-foreground border border-border'
                  : ''
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                  <span>Verifying...</span>
                </>
              ) : isOccupiedByAnother ? (
                <>
                  <Lock className="size-3.5 text-amber-500" />
                  <span>Account In Use</span>
                </>
              ) : isReturningOccupant ? (
                <>
                  <CheckCircle2 className="size-3.5" />
                  <span>Resume Duty</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="size-3.5" />
                  <span>Start Duty</span>
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
