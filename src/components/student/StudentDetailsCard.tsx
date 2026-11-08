import React from 'react';
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
  return (
    <main className="w-full max-w-sm mx-auto my-auto py-6">
      <Card className="border border-border shadow-sm">
        <CardHeader className="text-center pb-4">
          <span className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
            Onboarding · Step 2 of 3
          </span>
          <CardTitle className="text-xl font-semibold tracking-tight text-foreground mt-0.5">
            Student Information
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Enter your official college records.
          </CardDescription>
        </CardHeader>

        <CardContent className="text-left text-xs">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="fullname">Full Name (First, Middle, Last)</FieldLabel>
              <Input
                id="fullname"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alexander M. Cruz"
                className="h-10 text-xs"
              />
              <FieldDescription>Must match your official college enrollment record.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="schoolid">School ID Number</FieldLabel>
              <Input
                id="schoolid"
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
                placeholder="2023-01842"
                className="h-10 text-xs font-mono"
              />
              <FieldDescription>Issued by TCC Registrar.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="department">College / Department</FieldLabel>
              <select
                id="department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground font-sans"
              >
                {TCC_DEPARTMENTS.map((dept) => (
                  <option key={dept.code} value={dept.code}>
                    {dept.code} · {dept.name}
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="yearlevel">Year Level</FieldLabel>
                <select
                  id="yearlevel"
                  value={yearLevel}
                  onChange={(e) => setYearLevel(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-foreground font-sans"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year</option>
                </select>
              </Field>

              <Field>
                <FieldLabel htmlFor="section">Section</FieldLabel>
                <Input
                  id="section"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="3-A"
                  className="h-10 text-xs font-mono"
                />
              </Field>
            </div>
          </FieldGroup>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-2">
          <Button
            type="button"
            onClick={onNext}
            className="w-full h-10 text-xs font-medium"
          >
            Continue to Face Check
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            Back
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
};
