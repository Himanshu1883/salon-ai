"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Leaf } from "lucide-react";
import { RESERVED_SALON_SLUGS, salonLoginPath } from "@/lib/salon-paths";
import { cn } from "@/lib/utils";

function normalizeWorkspaceInput(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let candidate = trimmed;

  try {
    if (candidate.includes("://") || candidate.startsWith("localhost")) {
      const url = new URL(
        candidate.includes("://") ? candidate : `http://${candidate}`
      );
      const segments = url.pathname.split("/").filter(Boolean);
      if (segments[0]) candidate = segments[0];
    }
  } catch {
    // treat as plain slug
  }

  candidate = candidate
    .replace(/^\/+|\/+$/g, "")
    .split("/")[0]
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");

  if (!candidate || RESERVED_SALON_SLUGS.has(candidate)) return null;
  return candidate;
}

export default function LoginWorkspaceGate() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const slug = normalizeWorkspaceInput(value);
    if (!slug) {
      setError("Enter your salon workspace name (for example: luxe-hair-studio).");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/salons/lookup?slug=${encodeURIComponent(slug)}`);
      if (res.ok) {
        router.push(salonLoginPath(slug));
        return;
      }
      if (res.status === 404) {
        setError("No salon found with that workspace. Check the name and try again.");
        setLoading(false);
        return;
      }
      setError(
        "Sign-in is temporarily unavailable. Check that the database is running, then try again."
      );
      setLoading(false);
    } catch {
      setError(
        "Sign-in is temporarily unavailable. Check that the database is running, then try again."
      );
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F3EC] px-6 py-12">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#5B21B6]/10">
            <Leaf className="h-6 w-6 text-[#5B21B6]" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1B1714]">
            Sign in to your salon
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#1B1714]/65">
            Enter your salon workspace to continue to the login page.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-[#E4DDD1] bg-white p-6 shadow-sm sm:p-8"
        >
          <label
            htmlFor="workspace"
            className="block text-sm font-medium text-[#1B1714]"
          >
            Salon workspace
          </label>
          <div className="mt-2 flex overflow-hidden rounded-xl border border-[#E4DDD1] bg-[#F7F3EC]/60 focus-within:border-[#5B21B6] focus-within:ring-2 focus-within:ring-[#5B21B6]/20">
            <span className="flex items-center border-r border-[#E4DDD1] px-3 text-sm text-[#1B1714]/45">
              /
            </span>
            <input
              id="workspace"
              name="workspace"
              type="text"
              autoComplete="organization"
              placeholder="your-salon-name"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError("");
              }}
              className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-[#1B1714] outline-none placeholder:text-[#1B1714]/35"
            />
          </div>
          <p className="mt-2 text-xs text-[#1B1714]/45">
            You can also paste your full salon login URL.
          </p>

          {error ? (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white",
              "bg-gradient-to-r from-[#6D28D9] to-[#4F46E5]",
              "transition-[transform,opacity] hover:-translate-y-px disabled:opacity-60"
            )}
          >
            {loading ? "Checking…" : "Continue"}
            {!loading ? <ArrowRight className="h-4 w-4" aria-hidden /> : null}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#1B1714]/60">
          New salon?{" "}
          <Link
            href="/signup"
            className="font-semibold text-[#5B21B6] underline-offset-2 hover:underline"
          >
            Start free trial
          </Link>
        </p>
      </div>
    </div>
  );
}
