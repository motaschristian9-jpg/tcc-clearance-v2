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
  Loader2,
  UserCheck,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { TCC_DEPARTMENTS } from '@/types/student';
import { SboOfficerSession } from '@/types/attendance';

interface SboSignInCardProps {
  onOfficerAuthenticated: (officer: SboOfficerSession) => void;
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

  const isOccupied = Boolean(currentOccupant && currentOccupant.status === 'active');

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
      setOfficerName('');
      setSelectedPosition('Attendance Committee Head');
      setCustomPosition('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isOccupied && currentOccupant.officerName.trim().toLowerCase() !== officerName.trim().toLowerCase()) {
      toast.error('Station Account Locked', {
        description: `This station is locked to ${currentOccupant.officerName}. It cannot be changed unless they end their duty.`,
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

      const finalOfficerName = isOccupied ? currentOccupant.officerName : officerName.trim();
      const finalPosition = isOccupied ? currentOccupant.position : effectivePosition;

      const updatedAccounts: Record<string, StationAccountState> = {
        ...accounts,
        [key]: {
          officerName: finalOfficerName,
          position: finalPosition,
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
        name: finalOfficerName,
        position: finalPosition,
        department,
        stationCode: `${department}-${selectedStation.replace(/\s+/g, '')}`,
        loginTime: nowTime,
      };

      toast.success(isOccupied ? 'Duty Resumed' : 'Gate Terminal Unlocked', {
        description: `Logged in as ${officerSession.name} (${selectedStation}).`,
      });

      onOfficerAuthenticated(officerSession);
    }, 450);
  };

  return (
    <div className="w-full max-w-[440px] mx-auto my-auto">
      <Card className="border border-border/80 shadow-lg bg-card">
        <CardHeader className="text-center pb-2.5 pt-4 px-5">
          <div className="flex items-center justify-center gap-2">
            <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-2xs">
              <ShieldCheck className="size-4 text-primary" />
            </div>
            <div className="text-left">
              <CardTitle className="text-sm sm:text-base font-semibold tracking-tight text-foreground leading-tight">
                SBO Gate Terminal
              </CardTitle>
              <CardDescription className="text-[11px] text-muted-foreground">
                Select station account and enter passcode
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-2.5 px-5 py-0 text-xs">
            <FieldGroup className="gap-2.5">
              {/* Row 1: Department & SBO Position */}
              <div className="grid grid-cols-2 gap-2.5">
                <Field className="gap-1">
                  <FieldLabel htmlFor="sbo-dept" className="text-[11px] font-medium">
                    Department
                  </FieldLabel>
                  <Select
                    value={department}
                    onValueChange={(val) => {
                      setDepartment(val);
                      setPasscode('');
                      const newKey = `${val}-${selectedStation.replace(/\s+/g, '')}`;
                      const occupant = accounts[newKey];
                      if (occupant && occupant.status === 'active') {
                        setOfficerName(occupant.officerName);
                        if (OFFICER_POSITIONS.includes(occupant.position)) {
                          setSelectedPosition(occupant.position);
                          setCustomPosition('');
                        } else {
                          setSelectedPosition('Custom / Other');
                          setCustomPosition(occupant.position);
                        }
                      } else {
                        setOfficerName('');
                        setSelectedPosition('Attendance Committee Head');
                        setCustomPosition('');
                      }
                    }}
                  >
                    <SelectTrigger id="sbo-dept" className="h-8 text-xs">
                      <SelectValue placeholder="Department" />
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

                <Field className="gap-1">
                  <FieldLabel htmlFor="officer-pos" className="text-[11px] font-medium">
                    Position
                  </FieldLabel>
                  <Select
                    value={selectedPosition}
                    onValueChange={setSelectedPosition}
                    disabled={isOccupied}
                  >
                    <SelectTrigger
                      id="officer-pos"
                      className={`h-8 text-xs ${
                        isOccupied ? 'bg-muted/50 cursor-not-allowed opacity-90' : ''
                      }`}
                    >
                      <SelectValue placeholder="Position" />
                    </SelectTrigger>
                    <SelectContent>
                      {OFFICER_POSITIONS.map((pos) => (
                        <SelectItem key={pos} value={pos}>
                          {pos}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              {selectedPosition === 'Custom / Other' && (
                <Field className="gap-1">
                  <Input
                    placeholder="Specify your SBO position"
                    value={customPosition}
                    onChange={(e) => setCustomPosition(e.target.value)}
                    disabled={isOccupied}
                    readOnly={isOccupied}
                    className="h-8 text-xs"
                    autoFocus
                  />
                </Field>
              )}

              {/* Row 2: SBO Accounts 4-Station Grid */}
              <Field className="gap-1">
                <div className="flex items-center justify-between">
                  <FieldLabel className="text-[11px] font-medium">Station Account</FieldLabel>
                  <span className="text-[10px] text-muted-foreground font-mono">4 Stations</span>
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
                        className={`px-2 py-1.5 rounded-md border text-left transition-all cursor-pointer flex flex-col justify-between h-[42px] ${
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary'
                            : 'border-border bg-card hover:bg-muted/40'
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

                        <div className="w-full truncate">
                          {occupied ? (
                            <span className="text-[9.5px] font-semibold text-foreground block truncate leading-tight">
                              {accountInfo.officerName.split(' ')[0]}
                            </span>
                          ) : (
                            <span className="text-[9.5px] text-muted-foreground font-mono">
                              Available
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {isOccupied && (
                  <div className="px-2.5 py-1 rounded-md border border-amber-500/25 bg-amber-500/10 text-[10.5px] text-amber-900 dark:text-amber-200 flex items-center gap-1.5 mt-0.5">
                    <Lock className="size-3 text-amber-600 shrink-0" />
                    <span className="truncate">
                      Occupied by <strong>{currentOccupant.officerName}</strong> (name locked).
                    </span>
                  </div>
                )}
              </Field>

              {/* Row 3: Officer Full Name & Passcode */}
              <div className="grid grid-cols-2 gap-2.5">
                <Field className="gap-1">
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="officer-name" className="text-[11px] font-medium">
                      Officer Name
                    </FieldLabel>
                    {isOccupied && (
                      <span className="text-[9.5px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-0.5 font-mono">
                        <Lock className="size-2" />
                        Locked
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="officer-name"
                      placeholder="e.g. Maria Santos"
                      value={officerName}
                      onChange={(e) => setOfficerName(e.target.value)}
                      disabled={isOccupied}
                      readOnly={isOccupied}
                      className={`h-8 text-xs pr-7 ${
                        isOccupied
                          ? 'bg-muted/50 cursor-not-allowed opacity-90 select-none text-foreground font-medium'
                          : ''
                      }`}
                      required
                    />
                    {isOccupied ? (
                      <Lock className="size-3 absolute right-2 top-1/2 -translate-y-1/2 text-amber-600 dark:text-amber-400 pointer-events-none" />
                    ) : (
                      <UserCheck className="size-3 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    )}
                  </div>
                </Field>

                <Field className="gap-1">
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="station-passcode" className="text-[11px] font-medium">
                      Passcode
                    </FieldLabel>
                  </div>
                  <div className="relative">
                    <Input
                      id="station-passcode"
                      type={showPasscode ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      disabled={isLoading}
                      className="h-8 text-xs font-mono pr-7"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasscode(!showPasscode)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      title={showPasscode ? 'Hide passcode' : 'Show passcode'}
                    >
                      {showPasscode ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                    </button>
                  </div>
                </Field>
              </div>
            </FieldGroup>
          </CardContent>

          <CardFooter className="pt-3 pb-4 px-5">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-8 text-xs font-medium gap-1.5 cursor-pointer shadow-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                  <span>Verifying...</span>
                </>
              ) : isOccupied ? (
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
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SboSignInCard;
