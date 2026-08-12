"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  Check,
  Loader2,
  Save,
  Sparkles,
  Upload,
  ZoomIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BeforeAfterSlider } from "./before-after-slider";
import {
  analyzeConsultationFace,
  saveHairConsultation,
  selectCustomerHairstyle,
  tryHairstyleOnConsultation,
  uploadConsultationPhoto,
  overrideConsultationFaceShape,
} from "@/actions/hair-consultations";
import { getHairstyles, getHairColors } from "@/actions/hairstyles";
import {
  captureAndAnalyzePhoto,
  compositeHairstylePreview,
} from "@/lib/hair-consultation/client-face-analysis";
import { FACE_SHAPE_LABELS } from "@/lib/hair-consultation/face-shape";
import type { FaceShape } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

type ConsultationData = {
  id: string;
  status: string;
  detectedFaceShape: FaceShape | null;
  faceShapeOverride: FaceShape | null;
  faceShapeConfidence: number | null;
  aiRecommendationsJson: unknown;
  customer: { id: string; name: string };
  service: { name: string; price: number; duration: number } | null;
  employee: { name: string } | null;
  photos: { id: string; type: string; url: string }[];
  selections: {
    id: string;
    hairstyle: { id: string; name: string; thumbnailUrl?: string | null };
    previewPhoto?: { url: string } | null;
    matchScore: number | null;
    isCustomerChoice: boolean;
  }[];
  selectedHairstyle: { name: string } | null;
};

type Props = {
  consultation: ConsultationData;
  disclaimer?: string;
};

const PROCESSING_STEPS = [
  "Analyzing photo…",
  "Detecting face…",
  "Understanding hair area…",
  "Finding recommendations…",
];

export function ConsultationWorkspace({ consultation, disclaimer }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"capture" | "styles" | "compare">("capture");
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [originalUrl, setOriginalUrl] = useState<string | null>(
    consultation.photos.find((p) => p.type === "ORIGINAL")?.url ?? null
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [faceShape, setFaceShape] = useState<FaceShape | null>(
    consultation.faceShapeOverride ?? consultation.detectedFaceShape
  );
  const [hairstyles, setHairstyles] = useState<
    Awaited<ReturnType<typeof getHairstyles>>["hairstyles"]
  >([]);
  const [colors, setColors] = useState<
    Awaited<ReturnType<typeof getHairColors>>["colors"]
  >([]);
  const [search, setSearch] = useState("");
  const [selections, setSelections] = useState(consultation.selections);
  const [activeCategory, setActiveCategory] = useState("recommended");

  useEffect(() => {
    if (originalUrl) setStep("styles");
  }, [originalUrl]);

  useEffect(() => {
    void getHairstyles({ search: search || undefined }).then((r) => {
      if (r.success) setHairstyles(r.hairstyles ?? []);
    });
    void getHairColors().then((r) => {
      if (r.success) setColors(r.colors ?? []);
    });
  }, [search]);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraOn(true);
      }
    } catch {
      setError("Camera permission denied. Please upload a photo instead.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    stream?.getTracks().forEach((t) => t.stop());
    setCameraOn(false);
  }, []);

  const processPhoto = useCallback(
    async (blob: Blob, analysis?: Awaited<ReturnType<typeof captureAndAnalyzePhoto>>) => {
      setProcessing(true);
      setProcessingStep(0);
      setError(null);

      const interval = window.setInterval(() => {
        setProcessingStep((s) => Math.min(s + 1, PROCESSING_STEPS.length - 1));
      }, 600);

      try {
        const formData = new FormData();
        formData.append("consultationId", consultation.id);
        formData.append("photoType", "ORIGINAL");
        formData.append("photo", blob, "customer.jpg");
        const upload = await uploadConsultationPhoto(formData);
        if (upload.error) {
          setError(upload.error);
          return;
        }
        setOriginalUrl(upload.url ?? null);

        if (analysis?.valid && analysis.landmarks) {
          const analyzed = await analyzeConsultationFace({
            consultationId: consultation.id,
            landmarks: analysis.landmarks,
            faceBox: analysis.faceBox,
            imageWidth: analysis.width,
            imageHeight: analysis.height,
          });
          if (analyzed.error) {
            setError(analyzed.error);
            return;
          }
          if (analyzed.analysis?.faceShape) {
            setFaceShape(analyzed.analysis.faceShape);
          }
        }
        setStep("styles");
      } finally {
        clearInterval(interval);
        setProcessing(false);
      }
    },
    [consultation.id]
  );

  const handleCapture = async () => {
    if (!videoRef.current) return;
    const analysis = await captureAndAnalyzePhoto(videoRef.current);
    if (!analysis.valid) {
      setError(analysis.error ?? "Invalid photo");
      return;
    }
    stopCamera();
    const res = await fetch(analysis.imageDataUrl!);
    const blob = await res.blob();
    await processPhoto(blob, analysis);
  };

  const handleFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = async () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d")?.drawImage(img, 0, 0);
      if (videoRef.current) {
        /* use temp video path via canvas only */
      }
      canvas.toBlob(async (blob) => {
        if (blob) await processPhoto(blob);
      }, "image/jpeg", 0.92);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleTryHairstyle = async (hairstyleId: string, thumbnailUrl?: string | null) => {
    if (!originalUrl) return;
    setProcessing(true);
    setError(null);
    try {
      let previewBase64: string | undefined;
      if (thumbnailUrl) {
        const res = await fetch(originalUrl);
        const blob = await res.blob();
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        previewBase64 = await compositeHairstylePreview(
          dataUrl,
          thumbnailUrl,
          { x: 0.25, y: 0.15, width: 0.5, height: 0.55 }
        );
      }

      const result = await tryHairstyleOnConsultation({
        consultationId: consultation.id,
        hairstyleId,
        previewBase64,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      setPreviewUrl(result.previewUrl ?? originalUrl);
      if (result.selection) {
        setSelections((prev) => [
          ...prev,
          {
            id: result.selection!.id,
            hairstyle: result.selection!.hairstyle,
            previewPhoto: result.previewUrl ? { url: result.previewUrl } : null,
            matchScore: result.selection!.matchScore,
            isCustomerChoice: false,
          },
        ]);
      }
    } finally {
      setProcessing(false);
    }
  };

  const filteredStyles =
    activeCategory === "recommended"
      ? hairstyles.filter((h) => h.isRecommended || h.isTrending)
      : activeCategory === "trending"
        ? hairstyles.filter((h) => h.isTrending)
        : hairstyles.filter(
            (h) =>
              h.hairLength?.toLowerCase() === activeCategory ||
              h.category?.name.toLowerCase().includes(activeCategory)
          );

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col bg-[#FAFBFF]">
      {/* Header */}
      <header className="sticky top-0 z-20 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[#ECECF5] bg-white/95 px-4 py-3 backdrop-blur-md lg:px-6">
        <div className="flex items-center gap-3">
          <Link
            href={`/clients/${consultation.customer.id}`}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#ECECF5] text-[#64748B] hover:bg-[#F5F3FF]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#7C3AED]">
              Hair Style Consultation
            </p>
            <h1 className="text-lg font-semibold text-[#0F172A]">
              {consultation.customer.name}
            </h1>
            <p className="text-xs text-[#64748B]">
              {consultation.service?.name ?? "Hair Cut"}
              {consultation.employee ? ` · ${consultation.employee.name}` : ""}
            </p>
          </div>
        </div>
        <Button
          onClick={() => saveHairConsultation({ consultationId: consultation.id, complete: true })}
          className="bg-[#7C3AED] hover:bg-[#6D28D9]"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Consultation
        </Button>
      </header>

      {disclaimer && (
        <p className="border-b border-[#ECECF5] bg-[#F5F3FF] px-4 py-2 text-center text-xs text-[#64748B] lg:px-6">
          {disclaimer}
        </p>
      )}

      <div className="flex flex-1 flex-col lg:flex-row lg:overflow-hidden">
        {/* Photo / Preview */}
        <section className="flex flex-1 flex-col p-4 lg:min-h-0 lg:overflow-y-auto lg:p-6">
          {step === "capture" && !originalUrl && (
            <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-4">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border-2 border-dashed border-[#7C3AED]/30 bg-[#0C0A09]">
                {cameraOn ? (
                  <>
                    <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
                    <div className="pointer-events-none absolute inset-[15%] rounded-[50%] border-2 border-white/40" />
                    <p className="absolute bottom-4 left-0 right-0 text-center text-sm text-white/80">
                      Look straight — keep full head in frame
                    </p>
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-white/60">
                    <Camera className="h-12 w-12" />
                    <p className="text-sm">Capture customer photo</p>
                  </div>
                )}
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex w-full flex-col gap-2 sm:flex-row">
                {!cameraOn ? (
                  <Button onClick={startCamera} className="flex-1 bg-[#7C3AED]">
                    <Camera className="mr-2 h-4 w-4" /> Take Photo
                  </Button>
                ) : (
                  <Button onClick={handleCapture} className="flex-1 bg-[#7C3AED]">
                    Capture
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" /> Upload
                </Button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
              </div>
            </div>
          )}

          {(originalUrl || previewUrl) && step !== "capture" && (
            <div className="mx-auto w-full max-w-2xl space-y-4">
              {previewUrl && originalUrl ? (
                <BeforeAfterSlider beforeUrl={originalUrl} afterUrl={previewUrl} />
              ) : (
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#0C0A09]">
                  <img src={originalUrl!} alt="Customer" className="h-full w-full object-cover" />
                </div>
              )}
              {selections.length > 1 && (
                <Button variant="outline" className="w-full" onClick={() => setStep("compare")}>
                  Compare {selections.length} styles
                </Button>
              )}
            </div>
          )}

          {processing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="rounded-2xl bg-white p-8 text-center shadow-xl">
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#7C3AED]" />
                <p className="mt-4 font-medium text-[#0F172A]">
                  {PROCESSING_STEPS[processingStep]}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Right panel */}
        {step === "styles" && originalUrl && (
          <aside className="flex w-full flex-col border-t border-[#ECECF5] bg-white lg:w-[360px] lg:shrink-0 lg:border-l lg:border-t-0">
            <div className="border-b border-[#ECECF5] p-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-[#0F172A]">
                <Sparkles className="h-4 w-4 text-[#7C3AED]" /> AI Face Analysis
              </h2>
              {faceShape && (
                <div className="mt-3 rounded-xl bg-[#F5F3FF] p-3">
                  <p className="text-xs text-[#64748B]">Detected Face Shape</p>
                  <p className="text-lg font-semibold text-[#7C3AED]">
                    {FACE_SHAPE_LABELS[faceShape]}
                  </p>
                  {consultation.faceShapeConfidence && (
                    <p className="text-xs text-[#64748B]">
                      {Math.round(consultation.faceShapeConfidence * 100)}% confidence
                    </p>
                  )}
                </div>
              )}
              <select
                className="mt-2 w-full rounded-lg border border-[#ECECF5] px-3 py-2 text-sm"
                value={faceShape ?? ""}
                onChange={(e) => {
                  const v = e.target.value as FaceShape;
                  setFaceShape(v);
                  void overrideConsultationFaceShape(consultation.id, v);
                }}
              >
                {Object.entries(FACE_SHAPE_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="border-b border-[#ECECF5] p-4">
              <input
                type="search"
                placeholder="Search hairstyle…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-[#ECECF5] px-3 py-2.5 text-sm"
              />
              <div className="mt-2 flex flex-wrap gap-1">
                {["recommended", "trending", "short", "medium", "long"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs capitalize",
                      activeCategory === cat
                        ? "bg-[#7C3AED] text-white"
                        : "bg-[#F5F3FF] text-[#64748B]"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                Choose Hairstyle
              </h3>
              <div className="space-y-2">
                {(search ? hairstyles : filteredStyles).map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => handleTryHairstyle(style.id, style.thumbnailUrl)}
                    className="flex w-full items-center gap-3 rounded-xl border border-[#ECECF5] p-3 text-left transition-colors hover:border-[#7C3AED]/40 hover:bg-[#FAFBFF]"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#F5F3FF] text-lg">
                      ✂️
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[#0F172A]">{style.name}</p>
                      <p className="truncate text-xs text-[#64748B]">
                        {style.isRecommended ? "★ Recommended · " : ""}
                        {style.hairLength ?? "Style"}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-[#7C3AED]">Try</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        )}

        {step === "compare" && (
          <aside className="w-full border-t border-[#ECECF5] bg-white p-4 lg:w-[360px] lg:border-l">
            <h2 className="font-semibold">Compare Hairstyles</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {selections.map((sel) => (
                <button
                  key={sel.id}
                  type="button"
                  onClick={async () => {
                    await selectCustomerHairstyle(consultation.id, sel.id);
                    setPreviewUrl(sel.previewPhoto?.url ?? originalUrl);
                  }}
                  className={cn(
                    "rounded-xl border p-2 text-left",
                    sel.isCustomerChoice
                      ? "border-[#7C3AED] bg-[#F5F3FF]"
                      : "border-[#ECECF5]"
                  )}
                >
                  {sel.previewPhoto?.url ? (
                    <img
                      src={sel.previewPhoto.url}
                      alt=""
                      className="mb-2 aspect-square w-full rounded-lg object-cover"
                    />
                  ) : null}
                  <p className="text-sm font-medium">{sel.hairstyle.name}</p>
                  {sel.isCustomerChoice && (
                    <span className="text-xs text-[#7C3AED]">Customer&apos;s choice</span>
                  )}
                </button>
              ))}
            </div>
            <Button
              className="mt-4 w-full bg-[#7C3AED]"
              onClick={() => setStep("styles")}
            >
              <Check className="mr-2 h-4 w-4" /> Done comparing
            </Button>
          </aside>
        )}
      </div>
    </div>
  );
}
