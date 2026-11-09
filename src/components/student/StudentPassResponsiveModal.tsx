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
  const [qrSvg, setQrSvg] = React.useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null);

  // Compute 30-second epoch token
  const currentEpoch = Math.floor(Date.now() / 30000) * 30000;

  React.useEffect(() => {
    const passPayload = JSON.stringify({
      tcc_id: schoolId || "---",
      name: fullName || "Student",
      dept: department || "CIT",
      sec: section || "---",
      epoch: currentEpoch,
      v: 1,
    });

    // 1. Generate crisp vector SVG (no canvas requirement, immune to mobile browser canvas privacy blocks)
    QRCode.toString(passPayload, {
      type: "svg",
      margin: 1,
      color: {
        dark: "#0a0a0a",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    })
      .then((svg) => {
        setQrSvg(svg);
      })
      .catch((err) => {
        console.warn("Failed to generate QR SVG:", err);
      });

    // 2. Fallback PNG Data URL
    QRCode.toDataURL(passPayload, {
      width: 256,
      margin: 1,
      color: {
        dark: "#0a0a0a",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    })
      .then((url) => {
        setQrDataUrl(url);
      })
      .catch((err) => {
        console.warn("Failed to generate QR data URL:", err);
      });
  }, [schoolId, fullName, department, section, currentEpoch]);

  const PassBody = (
    <div className="flex flex-col items-center gap-4 py-2 w-full">
      {/* Dynamic 30s Real Scannable QR Display */}
      <div className="w-full max-w-[280px] p-4 rounded-2xl border border-border bg-white shadow-sm flex flex-col items-center gap-3">
        <div className="w-56 h-56 min-h-[224px] bg-white flex items-center justify-center relative p-1 rounded-xl">
          {qrSvg ? (
            <div
              className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:shape-rendering-crispEdges"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
          ) : qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Student Pass QR Code"
              className="w-full h-full object-contain rounded-sm"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <QrCode className="size-16 text-muted-foreground/30 animate-pulse" />
            </div>
          )}
          {/* Subtle scanning beam indicator */}
          <div className="absolute inset-x-2 top-2 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-bounce opacity-40 pointer-events-none" />
        </div>

        {/* Countdown & Label with Guaranteed Spacing */}
        <div className="w-full pt-2.5 flex items-center justify-between gap-3 text-[11px] border-t border-border/60">
          <span className="flex items-center gap-1.5 font-medium text-muted-foreground shrink-0">
            <QrCode className="size-3.5 text-foreground shrink-0" />
            <span>Official Pass</span>
          </span>
          <span className="font-mono font-semibold text-foreground shrink-0 bg-muted/60 px-2 py-0.5 rounded text-[11px]">
            Refreshes in {passCountdown}s
          </span>
        </div>
      </div>

      {/* Verified Device Badge */}
      <div className="w-full max-w-[280px] p-2.5 rounded-xl border border-border bg-muted/30 flex items-center justify-between text-left">
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
      <div className="w-full max-w-[280px] space-y-2 pt-1">
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
      <DrawerContent className="px-4 pb-6 max-h-[90vh] overflow-y-auto">
        <DrawerHeader className="text-center sm:text-center pb-1 pt-2">
          <DrawerTitle className="text-lg font-semibold tracking-tight text-foreground">
            {fullName || "Student Pass"}
          </DrawerTitle>
          <DrawerDescription className="text-xs font-mono text-muted-foreground">
            {department} · ID: {schoolId || "---"} · Section: {section || "---"}
          </DrawerDescription>
        </DrawerHeader>
        {PassBody}
        <DrawerFooter className="pt-2 px-0 max-w-[280px] mx-auto w-full">
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
