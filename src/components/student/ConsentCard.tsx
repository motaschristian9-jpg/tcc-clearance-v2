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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface ConsentCardProps {
  onAgree: () => void;
  onCancel: () => void;
}

export const ConsentCard: React.FC<ConsentCardProps> = ({ onAgree, onCancel }) => {
  const [agreed, setAgreed] = useState<boolean>(false);

  return (
    <main className="w-full max-w-sm mx-auto my-auto py-6">
      <Card className="border border-border shadow-sm">
        <CardHeader className="text-left pb-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
              Onboarding · Step 1 of 3
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              RA 10173
            </span>
          </div>

          <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
            Data Privacy & Consent
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Philippine Data Privacy Act compliance for event clearance.
          </CardDescription>
        </CardHeader>

        <CardContent className="text-left">
          {/* Separator as requested */}
          <Separator className="mb-4" />

          {/* Typeset container for clean typography */}
          <div className="typeset typeset-docs space-y-3 text-xs text-muted-foreground">
            <div>
              <h4 className="text-xs font-semibold text-foreground tracking-tight">
                1. Information We Collect
              </h4>
              <p className="text-[12px] leading-relaxed text-muted-foreground mt-1">
                Your full name, school ID number, academic department, year level, section, and live face verification snapshot.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-foreground tracking-tight">
                2. Purpose of Processing
              </h4>
              <p className="text-[12px] leading-relaxed text-muted-foreground mt-1">
                Data is collected solely to verify campus event attendance, prevent pass transfers, and issue official semester clearance.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-foreground tracking-tight">
                3. Device Binding & Retention
              </h4>
              <p className="text-[12px] leading-relaxed text-muted-foreground mt-1">
                Your pass is cryptographically bound to one physical device. Attendance logs are securely purged after semester clearance archiving.
              </p>
            </div>
          </div>

          {/* Separator as requested */}
          <Separator className="my-4" />

          {/* Checkbox with Label component from shadcn */}
          <div className="flex items-start space-x-2.5 pt-0.5">
            <Checkbox
              id="terms"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked)}
              className="mt-0.5"
            />
            <Label
              htmlFor="terms"
              className="text-xs font-normal leading-snug text-foreground cursor-pointer select-none"
            >
              I have read, understood, and accept the terms and conditions under RA 10173
            </Label>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-2">
          <Button
            type="button"
            disabled={!agreed}
            onClick={onAgree}
            className="w-full h-10 text-xs font-medium"
          >
            Continue
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
};
