import React, { useRef, useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, RefreshCw } from 'lucide-react';

interface PhotoCaptureCardProps {
  photoDataUrl: string | null;
  onPhotoCaptured: (dataUrl: string) => void;
  onRetake: () => void;
  onNext: () => void;
  onBack: () => void;
}

export const PhotoCaptureCard: React.FC<PhotoCaptureCardProps> = ({
  photoDataUrl,
  onPhotoCaptured,
  onRetake,
  onNext,
  onBack,
}) => {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let active = true;

    if (!photoDataUrl) {
      async function startCamera() {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: 'user',
              width: { ideal: 480 },
              height: { ideal: 480 },
            },
            audio: false,
          });

          if (!active) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }

          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setHasCameraPermission(true);
        } catch {
          setHasCameraPermission(false);
        }
      }

      startCamera();
    }

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [photoDataUrl]);

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const minDim = Math.min(video.videoWidth, video.videoHeight);
    const startX = (video.videoWidth - minDim) / 2;
    const startY = (video.videoHeight - minDim) / 2;

    ctx.translate(400, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, startX, startY, minDim, minDim, 0, 0, 400, 400);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    onPhotoCaptured(dataUrl);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
  };

  const handleSimulatePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, 400, 400);
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(200, 160, 70, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(200, 340, 120, 0, Math.PI, true);
    ctx.fill();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    onPhotoCaptured(dataUrl);
  };

  return (
    <main className="w-full max-w-sm mx-auto my-auto py-6">
      <Card className="border border-border shadow-sm">
        <CardHeader className="text-center pb-4">
          <span className="text-[11px] font-medium tracking-widest uppercase text-muted-foreground">
            Onboarding · Step 3 of 3
          </span>
          <CardTitle className="text-xl font-semibold tracking-tight text-foreground mt-0.5">
            Face Verification Check
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Position your face inside the circle for SBO officer verification.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-3">
          {/* Viewfinder / Captured Photo Area */}
          <div className="relative size-60 rounded-full overflow-hidden border-2 border-dashed border-border flex items-center justify-center bg-muted/20">
            {photoDataUrl ? (
              <img
                src={photoDataUrl}
                alt="Captured Face"
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : hasCameraPermission === false ? (
              <div className="p-4 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
                <Camera className="size-8 stroke-[1.2] text-muted-foreground" />
                <span>Camera access unavailable. Use simulation below.</span>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                {/* Oval guideline for face position */}
                <div className="absolute inset-4 rounded-full border border-foreground/30 pointer-events-none" />
              </>
            )}
          </div>

          <div className="flex gap-2 w-full pt-1">
            {!photoDataUrl ? (
              <>
                <Button
                  type="button"
                  onClick={handleCapturePhoto}
                  className="flex-1 h-10 text-xs font-medium gap-1.5"
                >
                  <Camera className="size-3.5" />
                  <span>Take Photo</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSimulatePhoto}
                  className="h-10 text-xs font-medium px-3"
                  title="Simulate sample ID photo"
                >
                  Simulate
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={onRetake}
                className="w-full h-10 text-xs font-medium gap-1.5"
              >
                <RefreshCw className="size-3.5" />
                <span>Retake Photo</span>
              </Button>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 pt-2">
          <Button
            type="button"
            disabled={!photoDataUrl}
            onClick={onNext}
            className="w-full h-10 text-xs font-medium"
          >
            Submit for SBO Approval
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
