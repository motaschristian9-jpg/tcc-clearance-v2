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
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldSet,
  FieldLegend,
} from '@/components/ui/field';
import { TCC_DEPARTMENTS } from '@/types/student';

interface StudentDetailsCardProps {
  fullName: string;
  setFullName: (name: string) => void;
  schoolId: string;
  setSchoolId: (id: string) => void;
  department: string;
  setDepartment: (dept: string) => void;
  yearLevel: string;
  setYearLevel: (year: string) => void;
  section: string;
  setSection: (section: string) => void;
  onNext: () => void;
  onBack: () => void;
}

interface ValidationErrors {
  fullName?: string;
  schoolId?: string;
  section?: string;
}

export const StudentDetailsCard: React.FC<StudentDetailsCardProps> = ({
  fullName,
  setFullName,
  schoolId,
  setSchoolId,
  department,
  setDepartment,
  yearLevel,
  setYearLevel,
  section,
  setSection,
  onNext,
  onBack,
}) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validate = (values: { fullName: string; schoolId: string; section: string }) => {
    const errs: ValidationErrors = {};

    if (!values.fullName.trim()) {
      errs.fullName = 'Full name is required.';
    } else if (values.fullName.trim().length < 3) {
      errs.fullName = 'Please enter your complete name (at least 3 characters).';
    }

    if (!values.schoolId.trim()) {
      errs.schoolId = 'Student ID number is required.';
    } else if (!/^\d{8}$/.test(values.schoolId.trim())) {
      errs.schoolId = 'Student ID must be exactly 8 digits without dashes (e.g. 20241373).';
    }

    if (!values.section.trim()) {
      errs.section = 'Section is required.';
    } else if (!/^[1-4][A-Za-z]$/.test(values.section.trim())) {
      errs.section = 'Format must be Year + Section without dashes (e.g. 3A, 3B, 1A).';
    }

    return errs;
  };

  const handleFullNameChange = (val: string) => {
    setFullName(val);
    if (touched.fullName) {
      if (!val.trim()) {
        setErrors((prev) => ({ ...prev, fullName: 'Full name is required.' }));
      } else {
        setErrors((prev) => ({ ...prev, fullName: undefined }));
      }
    }
  };

  const handleSchoolIdChange = (val: string) => {
    const cleanDigits = val.replace(/\D/g, '').slice(0, 8);
    setSchoolId(cleanDigits);
    if (touched.schoolId) {
      if (!cleanDigits) {
        setErrors((prev) => ({ ...prev, schoolId: 'Student ID number is required.' }));
      } else if (cleanDigits.length < 8) {
        setErrors((prev) => ({ ...prev, schoolId: 'Student ID must be exactly 8 digits (e.g. 20241373).' }));
      } else {
        setErrors((prev) => ({ ...prev, schoolId: undefined }));
      }
    }
  };

  const handleSectionChange = (val: string) => {
    const clean = val.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 3);
    setSection(clean);
    if (touched.section) {
      if (!clean) {
        setErrors((prev) => ({ ...prev, section: 'Section is required.' }));
      } else if (!/^[1-4][A-Z]$/.test(clean)) {
        setErrors((prev) => ({ ...prev, section: 'Format must be Year + Section (e.g. 3A, 3B, 1A).' }));
      } else {
        setErrors((prev) => ({ ...prev, section: undefined }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ fullName: true, schoolId: true, section: true });
    const validationErrors = validate({ fullName, schoolId, section });
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      // STOP! Do not continue if any field is empty or invalid
      return;
    }

    onNext();
  };

  return (
    <main className="w-full max-w-sm mx-auto my-auto py-6">
      <Card className="border border-border shadow-sm">
        <form onSubmit={handleSubmit} noValidate>
          <CardHeader className="text-center pb-4">
            <span className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
              Onboarding · Step 2 of 3
            </span>
            <CardTitle className="text-xl font-semibold tracking-tight text-foreground mt-0.5">
              Student Information
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Enter your official college records. All fields are required.
            </CardDescription>
          </CardHeader>

          <CardContent className="text-left text-xs">
            <FieldSet>
              <FieldLegend className="sr-only">Student Records Form</FieldLegend>

              <FieldGroup>
                {/* Full Name Field using shadcn Field component */}
                <Field data-invalid={!!errors.fullName}>
                  <FieldLabel htmlFor="fullname">
                    Full Name (First, Middle, Last) *
                  </FieldLabel>
                  <Input
                    id="fullname"
                    value={fullName}
                    onChange={(e) => handleFullNameChange(e.target.value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
                    aria-invalid={!!errors.fullName}
                    placeholder="e.g. Alexander M. Cruz"
                    className="h-10 text-xs"
                  />
                  {errors.fullName ? (
                    <FieldError>{errors.fullName}</FieldError>
                  ) : (
                    <FieldDescription>
                      Must match your official college enrollment record.
                    </FieldDescription>
                  )}
                </Field>

                {/* School ID Field using shadcn Field component */}
                <Field data-invalid={!!errors.schoolId}>
                  <FieldLabel htmlFor="schoolid">
                    School ID Number *
                  </FieldLabel>
                  <Input
                    id="schoolid"
                    value={schoolId}
                    onChange={(e) => handleSchoolIdChange(e.target.value)}
                    onBlur={() => setTouched((prev) => ({ ...prev, schoolId: true }))}
                    aria-invalid={!!errors.schoolId}
                    placeholder="e.g. 20241373"
                    className="h-10 text-xs font-mono"
                  />
                  {errors.schoolId ? (
                    <FieldError>{errors.schoolId}</FieldError>
                  ) : (
                    <FieldDescription>
                      8-digit numeric student ID issued by TCC Registrar.
                    </FieldDescription>
                  )}
                </Field>

                {/* Department Selection Field using shadcn Field component */}
                <Field>
                  <FieldLabel htmlFor="department">
                    College / Department *
                  </FieldLabel>
                  <select
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground font-sans cursor-pointer"
                  >
                    {TCC_DEPARTMENTS.map((dept) => (
                      <option key={dept.code} value={dept.code}>
                        {dept.code} · {dept.name}
                      </option>
                    ))}
                  </select>
                  <FieldDescription>
                    Select your college program at TCC.
                  </FieldDescription>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  {/* Year Level Field using shadcn Field component */}
                  <Field>
                    <FieldLabel htmlFor="yearlevel">
                      Year Level *
                    </FieldLabel>
                    <select
                      id="yearlevel"
                      value={yearLevel}
                      onChange={(e) => setYearLevel(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground font-sans cursor-pointer"
                    >
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </Field>

                  {/* Section Field using shadcn Field component */}
                  <Field data-invalid={!!errors.section}>
                    <FieldLabel htmlFor="section">
                      Section *
                    </FieldLabel>
                    <Input
                      id="section"
                      value={section}
                      onChange={(e) => handleSectionChange(e.target.value)}
                      onBlur={() => setTouched((prev) => ({ ...prev, section: true }))}
                      aria-invalid={!!errors.section}
                      placeholder="e.g. 3A"
                      className="h-10 text-xs font-mono uppercase"
                    />
                    {errors.section ? (
                      <FieldError>{errors.section}</FieldError>
                    ) : (
                      <FieldDescription>
                        e.g. 3A or 1B
                      </FieldDescription>
                    )}
                  </Field>
                </div>
              </FieldGroup>
            </FieldSet>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 pt-2">
            <Button
              type="submit"
              className="w-full h-10 text-xs font-medium cursor-pointer"
            >
              Continue to Face Check
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onBack}
              className="w-full h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Back
            </Button>
          </CardFooter>
        </form>
      </Card>
    </main>
  );
};
