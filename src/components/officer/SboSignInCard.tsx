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
    <div className="w-full max-w-md mx-auto my-auto px-2">
      <Card className="border border-border/80 shadow-xl bg-card rounded-2xl overflow-hidden">
        <CardHeader className="text-center pb-4 pt-6 px-6 sm:px-8 border-b border-border/40 bg-muted/20">
          <div className="mx-auto size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 shadow-xs">
            <ShieldCheck className="size-6 text-primary" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            SBO Gate Terminal
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
            Select your department station and authenticate to start duty
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 sm:p-8 space-y-4">
            <FieldGroup className="gap-4">
              {/* Department */}
              <Field className="gap-1.5">
                <FieldLabel htmlFor="sbo-dept" className="text-xs font-semibold text-foreground">
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
                  <SelectTrigger id="sbo-dept" className="h-10 text-sm">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {TCC_DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept.code} value={dept.code} className="text-sm">
                        <span className="font-semibold">{dept.code}</span> · {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {/* SBO Station Accounts */}
              <Field className="gap-1.5">
                <div className="flex items-center justify-between">
                  <FieldLabel className="text-xs font-semibold text-foreground">
                    Station Account
                  </FieldLabel>
                  <span className="text-[11px] text-muted-foreground font-mono">4 Stations</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
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
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[58px] ${
                          isSelected
                            ? 'border-primary bg-primary/10 shadow-xs ring-2 ring-primary/40'
                            : 'border-border bg-card hover:bg-muted/40'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-mono font-bold text-xs text-foreground">
                            {stId}
                          </span>
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
                              title="Available"
                            />
                          )}
                        </div>

                        <div className="pt-1.5 w-full truncate">
                          {occupied ? (
                            <span className="text-[10px] font-semibold text-foreground block truncate leading-tight">
                              {accountInfo.officerName.split(' ')[0]}
                            </span>
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

                {isOccupied && (
                  <div className="p-2.5 rounded-xl border border-amber-500/25 bg-amber-500/10 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2 mt-1">
                    <Lock className="size-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">
                      Station occupied by <strong>{currentOccupant.officerName}</strong>. Name locked while on duty.
                    </span>
                  </div>
                )}
              </Field>

              {/* Officer Full Name */}
              <Field className="gap-1.5">
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="officer-name" className="text-xs font-semibold text-foreground">
                    Officer Name
                  </FieldLabel>
                  {isOccupied && (
                    <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 flex items-center gap-1 font-mono">
                      <Lock className="size-3" />
                      Locked (In Duty)
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="officer-name"
                    placeholder="Enter your full name"
                    value={officerName}
                    onChange={(e) => setOfficerName(e.target.value)}
                    disabled={isOccupied}
                    readOnly={isOccupied}
                    className={`h-10 text-sm pr-9 ${
                      isOccupied
                        ? 'bg-muted/50 cursor-not-allowed opacity-90 select-none text-foreground font-medium'
                        : ''
                    }`}
                    required
                  />
                  {isOccupied ? (
                    <Lock className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-amber-600 dark:text-amber-400 pointer-events-none" />
                  ) : (
                    <UserCheck className="size-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  )}
                </div>
              </Field>

              {/* SBO Position */}
              <Field className="gap-1.5">
                <FieldLabel htmlFor="officer-pos" className="text-xs font-semibold text-foreground">
                  SBO Position / Role
                </FieldLabel>
                <Select
                  value={selectedPosition}
                  onValueChange={setSelectedPosition}
                  disabled={isOccupied}
                >
                  <SelectTrigger
                    id="officer-pos"
                    className={`h-10 text-sm ${
                      isOccupied ? 'bg-muted/50 cursor-not-allowed opacity-90' : ''
                    }`}
                  >
                    <SelectValue placeholder="Select Position" />
                  </SelectTrigger>
                  <SelectContent>
                    {OFFICER_POSITIONS.map((pos) => (
                      <SelectItem key={pos} value={pos} className="text-sm">
                        {pos}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedPosition === 'Custom / Other' && (
                  <Input
                    placeholder="Specify your SBO position"
                    value={customPosition}
                    onChange={(e) => setCustomPosition(e.target.value)}
                    disabled={isOccupied}
                    readOnly={isOccupied}
                    className="h-9 text-sm mt-1"
                    autoFocus
                  />
                )}
              </Field>

              {/* Station Passcode */}
              <Field className="gap-1.5">
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="station-passcode" className="text-xs font-semibold text-foreground">
                    Station Passcode
                  </FieldLabel>
                  <span className="text-[11px] text-muted-foreground font-mono">Required</span>
                </div>
                <div className="relative">
                  <Input
                    id="station-passcode"
                    type={showPasscode ? 'text' : 'password'}
                    placeholder="Enter station passcode"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    disabled={isLoading}
                    className="h-10 text-sm font-mono pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-md transition-colors"
                    title={showPasscode ? 'Hide passcode' : 'Show passcode'}
                  >
                    {showPasscode ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </Field>
            </FieldGroup>
          </CardContent>

          <CardFooter className="px-6 sm:px-8 pb-6 pt-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 text-sm font-semibold gap-2 cursor-pointer shadow-sm rounded-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  <span>Verifying Credentials...</span>
                </>
              ) : isOccupied ? (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>Resume Duty at {selectedStation}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="size-4" />
                  <span>Start Duty at {selectedStation}</span>
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
