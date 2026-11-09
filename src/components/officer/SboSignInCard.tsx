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
import { ShieldCheck, Lock, ArrowLeft, Loader2, KeyRound, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { TCC_DEPARTMENTS } from '@/types/student';
import { SboOfficerSession } from '@/types/attendance';

interface SboSignInCardProps {
  onOfficerAuthenticated: (officer: SboOfficerSession) => void;
  onBackToStudentPortal: () => void;
}

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
  const [officerName, setOfficerName] = useState<string>('');
  const [selectedPosition, setSelectedPosition] = useState<string>('Attendance Committee Head');
  const [customPosition, setCustomPosition] = useState<string>('');
  const [passcode, setPasscode] = useState<string>('sbo1');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const effectivePosition = selectedPosition === 'Custom / Other'
    ? (customPosition.trim() || 'SBO Officer')
    : selectedPosition;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!officerName.trim()) {
      toast.error('Officer Name Required', {
        description: 'Please enter your full name for the attendance stamping signature.',
      });
      return;
    }

    if (!passcode.trim()) {
      toast.error('Passcode Required', {
        description: 'Please enter your department station passcode (e.g. sbo1, sbo2, sbo3, sbo4).',
      });
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      const cleanCode = passcode.trim().toLowerCase();
      const deptCode = department.toLowerCase();

      // Check valid passcodes: sbo1..sbo4, {dept}-sbo1..4, or master gate bypass
      const validCodes = [
        'sbo1',
        'sbo2',
        'sbo3',
        'sbo4',
        `${deptCode}-sbo1`,
        `${deptCode}-sbo2`,
        `${deptCode}-sbo3`,
        `${deptCode}-sbo4`,
        'sbo2026',
        'tcc-sbo-gate',
        '20261373',
      ];

      const isValid = validCodes.includes(cleanCode);

      if (!isValid) {
        toast.error('Invalid Station Passcode', {
          description: `"${passcode}" is not an authorized passcode for ${department}. Authorized accounts: sbo1, sbo2, sbo3, sbo4.`,
        });
        return;
      }

      // Determine station code label
      let stationCode = 'SBO 1';
      if (cleanCode.includes('2')) stationCode = 'SBO 2';
      else if (cleanCode.includes('3')) stationCode = 'SBO 3';
      else if (cleanCode.includes('4')) stationCode = 'SBO 4';
      else if (cleanCode.includes('1')) stationCode = 'SBO 1';

      const officerSession: SboOfficerSession = {
        name: officerName.trim(),
        position: effectivePosition,
        department,
        stationCode: `${department}-${stationCode.replace(/\s+/g, '')}`,
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      toast.success('Gate Terminal Unlocked', {
        description: `Welcome, ${officerSession.name} (${officerSession.position} - ${department}). Gate terminal is active.`,
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
            <span>Restricted Gateway · SBO Personnel</span>
          </div>

          <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
            SBO Gate Terminal
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Sign in with your department station code to stamp student clearances.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Department Selection */}
            <div className="space-y-1.5">
              <Label htmlFor="sbo-dept" className="text-xs font-medium">
                Department / College
              </Label>
              <Select value={department} onValueChange={setDepartment}>
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

            {/* Station Passcode Selection & Input */}
            <div className="space-y-2 pt-1 border-t border-border/60">
              <div className="flex items-center justify-between">
                <Label htmlFor="sbo-passcode" className="text-xs font-medium">
                  Department Station Passcode
                </Label>
                <span className="text-[10px] font-mono text-muted-foreground">
                  4 Stations Available
                </span>
              </div>

              {/* Quick Station Selection Buttons */}
              <div className="grid grid-cols-4 gap-1.5">
                {(['sbo1', 'sbo2', 'sbo3', 'sbo4'] as const).map((code, idx) => {
                  const isSelected = passcode.toLowerCase() === code;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setPasscode(code)}
                      className={`py-1.5 px-2 rounded-md border text-center text-xs font-mono font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                          : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                      }`}
                    >
                      <span className="block text-[11px]">SBO {idx + 1}</span>
                      <span className="text-[9px] opacity-75">{code}</span>
                    </button>
                  );
                })}
              </div>

              {/* Passcode manual input */}
              <div className="relative pt-1">
                <Input
                  id="sbo-passcode"
                  type="text"
                  placeholder="e.g. sbo1, sbo2, sbo3, sbo4"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="h-9 text-xs font-mono pr-8"
                  required
                />
                <KeyRound className="size-3.5 absolute right-2.5 top-[calc(50%+2px)] -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Each department has 4 authorized codes (<code className="font-mono text-foreground font-semibold">sbo1</code>, <code className="font-mono text-foreground font-semibold">sbo2</code>, <code className="font-mono text-foreground font-semibold">sbo3</code>, <code className="font-mono text-foreground font-semibold">sbo4</code>).
              </p>
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
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="size-4" />
                  <span>Unlock Gate Terminal</span>
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
