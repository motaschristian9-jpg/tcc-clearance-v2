import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Check, Loader2 } from 'lucide-react';
import { TCC_DEPARTMENTS } from '@/types/student';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fullName: string;
  schoolId: string;
  department: string;
  yearLevel: string;
  section: string;
  photoDataUrl: string | null;
  onSave: (updated: {
    fullName: string;
    schoolId: string;
    department: string;
    yearLevel: string;
    section: string;
    photoDataUrl: string | null;
  }) => Promise<void>;
}

const YEAR_LEVELS = [
  { id: '1', label: '1st Year' },
  { id: '2', label: '2nd Year' },
  { id: '3', label: '3rd Year' },
  { id: '4', label: '4th Year' },
];

export const EditProfileDialog: React.FC<EditProfileDialogProps> = ({
  open,
  onOpenChange,
  fullName: initialFullName,
  schoolId: initialSchoolId,
  department: initialDepartment,
  yearLevel: initialYearLevel,
  section: initialSection,
  photoDataUrl: initialPhotoDataUrl,
  onSave,
}) => {
  const [fullName, setFullName] = React.useState(initialFullName);
  const [schoolId, setSchoolId] = React.useState(initialSchoolId);
  const [department, setDepartment] = React.useState(initialDepartment);
  const [yearLevel, setYearLevel] = React.useState(initialYearLevel);
  const [section, setSection] = React.useState(initialSection);
  const [photoDataUrl, setPhotoDataUrl] = React.useState<string | null>(initialPhotoDataUrl);
  const [isSaving, setIsSaving] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sync state when dialog opens
  React.useEffect(() => {
    if (open) {
      setFullName(initialFullName);
      setSchoolId(initialSchoolId);
      setDepartment(initialDepartment || 'CIT');
      setYearLevel(initialYearLevel || '3');
      setSection(initialSection);
      setPhotoDataUrl(initialPhotoDataUrl);
    }
  }, [open, initialFullName, initialSchoolId, initialDepartment, initialYearLevel, initialSection, initialPhotoDataUrl]);

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setPhotoDataUrl(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !schoolId.trim() || !section.trim()) return;

    setIsSaving(true);
    try {
      await onSave({
        fullName: fullName.trim(),
        schoolId: schoolId.trim(),
        department,
        yearLevel,
        section: section.trim().toUpperCase(),
        photoDataUrl,
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
            Edit Student Profile
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Update your registered details locked to your student clearance record.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Avatar and Change Photo */}
          <div className="flex items-center gap-4 p-3 rounded-xl border border-border bg-muted/20">
            <div className="relative group">
              <Avatar className="size-16 border-2 border-border shadow-xs">
                <AvatarImage src={photoDataUrl || ''} alt={fullName} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                  {fullName ? fullName.charAt(0).toUpperCase() : 'T'}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                title="Change Photo"
              >
                <Camera className="size-5" />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-foreground">Student ID Photo</span>
              <p className="text-[11px] text-muted-foreground">
                Official face photo for event gate verification.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-7 text-[11px] px-2.5 w-fit mt-0.5 gap-1.5 cursor-pointer"
              >
                <Camera className="size-3" />
                <span>Change Photo</span>
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-name" className="text-xs font-medium">
              Full Name
            </Label>
            <Input
              id="edit-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Juan Dela Cruz"
              required
              className="h-9 text-xs"
            />
          </div>

          {/* Student ID No. */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-school-id" className="text-xs font-medium">
              Student ID Number
            </Label>
            <Input
              id="edit-school-id"
              type="text"
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              placeholder="e.g. 20241373"
              required
              className="h-9 text-xs font-mono"
            />
          </div>

          {/* Department & Year Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {TCC_DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept.code} value={dept.code} className="text-xs">
                      {dept.code} - {dept.name.replace('College of ', '')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Year Level</Label>
              <Select value={yearLevel} onValueChange={setYearLevel}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder="Select Year Level" />
                </SelectTrigger>
                <SelectContent>
                  {YEAR_LEVELS.map((yr) => (
                    <SelectItem key={yr.id} value={yr.id} className="text-xs">
                      {yr.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Section */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-section" className="text-xs font-medium">
              Class Section
            </Label>
            <Input
              id="edit-section"
              type="text"
              value={section}
              onChange={(e) => setSection(e.target.value.toUpperCase())}
              placeholder="e.g. 3A, 4B"
              required
              className="h-9 text-xs font-mono uppercase"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || !fullName.trim() || !schoolId.trim() || !section.trim()}
              className="h-9 text-xs gap-1.5 font-medium"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="size-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

