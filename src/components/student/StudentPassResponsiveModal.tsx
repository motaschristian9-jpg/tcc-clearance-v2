import * as React from "react";
import QRCode from "qrcode";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { QrCode, FileText, ShieldCheck } from "lucide-react";

interface StudentPassResponsiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fullName: string;
  schoolId: string;
  department: string;
  section: string;
  passCountdown: number;
  onViewActivityCard: () => void;
}

export function StudentPassResponsiveModal({
  open,
  onOpenChange,
  fullName,
  schoolId,
  department,
  section,
  passCountdown,
  onViewActivityCard,
}: StudentPassResponsiveModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    if (!open || !canvasRef.current) return;

    const timeBucket = Math.floor(Date.now() / 30000) * 30000;
    const passPayload = JSON.stringify({
      tcc_id: schoolId,
      name: fullName,
      dept: department,
      sec: section,
      epoch: timeBucket,
      v: 1,
    });

    QRCode.toCanvas(canvasRef.current, passPayload, {
      width: 220,
      margin: 1,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    }).catch((err) => {
      console.warn("Failed to render pass QR code canvas:", err);
    });
  }, [open, schoolId, fullName, department, section, passCountdown]);

  const PassBody = (
    <div className="flex flex-col items-center gap-4 py-2">
      {/* Dynamic 30s Real Scannable QR Display */}
      <div className="p-3.5 rounded-2xl border border-border bg-white shadow-sm flex flex-col items-center">
        <div className="size-52 bg-white flex items-center justify-center relative p-1">
          <canvas ref={canvasRef} className="size-full rounded-sm" />
          {/* Subtle scanning beam indicator */}
          <div className="absolute inset-x-2 top-2 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-bounce opacity-50 pointer-events-none" />
        </div>

        {/* Countdown */}
        <div className="w-full pt-3 flex items-center justify-between text-[11px] font-mono text-muted-foreground border-t border-border/60">
          <span className="flex items-center gap-1 font-sans">
            <QrCode className="size-3 text-foreground" />
            Official Student Pass
          </span>
          <span className="font-semibold text-foreground">
            Refreshes in {passCountdown}s
          </span>
        </div>
      </div>

      {/* Verified Device Badge */}
      <div className="w-full p-2.5 rounded-xl border border-border bg-muted/30 flex items-center justify-between text-left">
        <div className="flex flex-col">
          <span className="text-[11px] font-medium text-foreground flex items-center gap-1">
            <ShieldCheck className="size-3.5 text-foreground" />
            Verified Device
          </span>
          <span className="text-[10px] text-muted-foreground">
            Present this to the SBO officer for scanning
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full space-y-2 pt-1">
        <Button
          type="button"
          onClick={() => {
            onOpenChange(false);
            onViewActivityCard();
          }}
          className="w-full h-10 text-xs font-medium gap-2 cursor-pointer"
        >
          <FileText className="size-3.5" />
          <span>View My Clearance Card</span>
        </Button>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center sm:text-center pb-1">
            <DialogTitle className="text-lg font-semibold tracking-tight text-foreground">
              {fullName || "Student Pass"}
            </DialogTitle>
            <DialogDescription className="text-xs font-mono text-muted-foreground">
              {department} · ID: {schoolId || "---"} · Section: {section || "---"}
            </DialogDescription>
          </DialogHeader>
          {PassBody}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="px-4 pb-6">
        <DrawerHeader className="text-center sm:text-center pb-1 pt-2">
          <DrawerTitle className="text-lg font-semibold tracking-tight text-foreground">
            {fullName || "Student Pass"}
          </DrawerTitle>
          <DrawerDescription className="text-xs font-mono text-muted-foreground">
            {department} · ID: {schoolId || "---"} · Section: {section || "---"}
          </DrawerDescription>
        </DrawerHeader>
        {PassBody}
        <DrawerFooter className="pt-2 px-0">
          <DrawerClose asChild>
            <Button variant="outline" className="w-full h-9 text-xs">
              Close
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
