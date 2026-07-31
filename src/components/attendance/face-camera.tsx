"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, CameraOff } from "lucide-react";
import { loadFaceModels } from "@/lib/face-api-client";

type Props = {
  onCapture?: (video: HTMLVideoElement) => void;
  autoCapture?: boolean;
  captureIntervalMs?: number;
  mirrored?: boolean;
  className?: string;
  showControls?: boolean;
};

export function FaceCamera({
  onCapture,
  autoCapture = false,
  captureIntervalMs = 2000,
  mirrored = true,
  className = "",
  showControls = true,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [modelsReady, setModelsReady] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const startCamera = useCallback(async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      }
    } catch {
      setError(
        "Camera access denied. Please allow camera permission in your browser settings."
      );
      setCameraReady(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      setLoading(true);
      try {
        await loadFaceModels();
        if (!cancelled) setModelsReady(true);
      } catch {
        if (!cancelled) {
          setError("Failed to load face recognition models. Check /public/models.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    startCamera();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [startCamera]);

  useEffect(() => {
    if (!autoCapture || !onCapture || !cameraReady || !modelsReady) return;

    const interval = setInterval(() => {
      if (videoRef.current && videoRef.current.readyState >= 2) {
        onCapture(videoRef.current);
      }
    }, captureIntervalMs);

    return () => clearInterval(interval);
  }, [autoCapture, onCapture, cameraReady, modelsReady, captureIntervalMs]);

  const isReady = modelsReady && cameraReady;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-stone-200 bg-stone-900">
        <video
          ref={videoRef}
          playsInline
          muted
          className={`h-full w-full object-cover ${mirrored ? "-scale-x-100" : ""}`}
        />
        {(loading || !isReady) && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-stone-900/80 text-white">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">
              {loading ? "Loading face models..." : "Starting camera..."}
            </p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-stone-900/90 p-6 text-center text-white">
            <CameraOff className="h-10 w-10 text-red-400" />
            <p className="text-sm">{error}</p>
            {showControls && (
              <Button variant="outline" size="sm" onClick={startCamera}>
                Retry camera
              </Button>
            )}
          </div>
        )}
        {isReady && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-xs text-white">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            Live
          </div>
        )}
      </div>

      {showControls && isReady && onCapture && !autoCapture && (
        <Button
          type="button"
          className="w-full"
          onClick={() => videoRef.current && onCapture(videoRef.current)}
        >
          <Camera className="h-4 w-4" />
          Capture face
        </Button>
      )}
    </div>
  );
}

export function useFaceCameraRef() {
  return useRef<HTMLVideoElement>(null);
}
