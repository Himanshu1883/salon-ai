"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/i.test(navigator.userAgent);
}

type InstallAppButtonProps = {
  className?: string;
  variant?: "primary" | "secondary";
};

export function InstallAppButton({
  className,
  variant = "primary",
}: InstallAppButtonProps) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | "other">("other");

  useEffect(() => {
    if (isIos()) setPlatform("ios");
    else if (isAndroid()) setPlatform("android");

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  if (installed) {
    return (
      <p className="text-sm font-medium text-[#059669]">
        Go Tix is installed on this device.
      </p>
    );
  }

  if (platform === "ios") {
    return (
      <a
        href="#ios-install"
        className={cn(
          variant === "primary"
            ? "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#7C3AED]/25 transition-transform hover:-translate-y-px"
            : "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#7C3AED]/30 bg-white px-6 py-3 text-sm font-semibold text-[#7C3AED]",
          className
        )}
      >
        <Smartphone className="h-4 w-4" aria-hidden />
        Install on iPhone
      </a>
    );
  }

  if (deferredPrompt) {
    return (
      <button
        type="button"
        onClick={handleInstall}
        className={cn(
          "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#7C3AED]/25 transition-transform hover:-translate-y-px",
          className
        )}
      >
        <Download className="h-4 w-4" aria-hidden />
        Install App
      </button>
    );
  }

  return (
    <a
      href="/login"
      className={cn(
        variant === "primary"
          ? "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#7C3AED]/25 transition-transform hover:-translate-y-px"
          : "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#7C3AED]/30 bg-white px-6 py-3 text-sm font-semibold text-[#7C3AED]",
        className
      )}
    >
      <Smartphone className="h-4 w-4" aria-hidden />
      Open Go Tix
    </a>
  );
}
