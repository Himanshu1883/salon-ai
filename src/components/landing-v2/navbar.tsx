"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { NAV_LINKS } from "./constants";
import { BrandMark } from "./ui/brand-logo";
import { primaryGradientButtonClass } from "./ui/landing-primitives";
import { cn } from "@/lib/utils";

type NavbarProps = {
  isAuthenticated?: boolean;
};

const navLinkClass =
  "group relative px-3 py-2 text-sm text-[#1B1714]/70 transition-colors duration-200 hover:text-[#5B21B6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B21B6]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

function NavLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  const className = navLinkClass;
  const underline = (
    <span
      aria-hidden
      className="absolute bottom-0.5 left-1/2 h-[1.5px] w-0 -translate-x-1/2 bg-[#5B21B6] transition-all duration-200 ease-out group-hover:w-[calc(100%-1.5rem)]"
    />
  );

  if (href.startsWith("/") && !href.includes("#")) {
    return (
      <Link href={href} onClick={onClick} className={cn(className, "group")}>
        {label}
        {underline}
      </Link>
    );
  }

  return (
    <a href={href} onClick={onClick} className={cn(className, "group")}>
      {label}
      {underline}
    </a>
  );
}

export function Navbar({ isAuthenticated = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-300 ease-out",
        "border-b border-white/40",
        "bg-white/45 backdrop-blur-2xl backdrop-saturate-150",
        "supports-[backdrop-filter]:bg-white/35",
        scrolled
          ? "bg-white/55 shadow-[0_8px_32px_-12px_rgba(91,33,182,0.12),0_1px_0_rgba(255,255,255,0.7)_inset] supports-[backdrop-filter]:bg-white/40"
          : "shadow-[0_1px_0_rgba(255,255,255,0.75)_inset,0_8px_28px_-16px_rgba(27,23,20,0.08)]"
      )}
    >
      {/* Glass sheen + purple tint */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.55)_0%,rgba(245,243,255,0.2)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#5B21B6]/25 to-transparent"
      />

      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 lg:px-8 lg:py-4">
        {/* Logo */}
        <Link
          href="/"
          aria-label="Gotix home"
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B21B6]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          onClick={() => setMobileOpen(false)}
        >
          <BrandMark size="nav" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-5 lg:flex">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className={primaryGradientButtonClass("px-5 py-2.5 text-sm focus-visible:ring-offset-transparent")}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={primaryGradientButtonClass("px-5 py-2.5 text-sm focus-visible:ring-offset-transparent")}
              >
                Login
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link
                href="/register"
                className={cn(
                  "rounded-full border border-white/50 bg-white/40 px-5 py-2.5 text-sm font-semibold text-[#1B1714]",
                  "backdrop-blur-md transition-[transform,background-color,border-color] duration-200",
                  "hover:-translate-y-px hover:border-[#5B21B6]/30 hover:bg-white/70",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B21B6]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                )}
              >
                Start Free Trial
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          className={cn(
            "rounded-lg p-2 transition-colors duration-200 lg:hidden",
            "bg-white/30 backdrop-blur-md ring-1 ring-white/50",
            mobileOpen ? "text-[#5B21B6]" : "text-[#1B1714]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B21B6]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
          )}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu — glass panel */}
      <div
        className={cn(
          "relative overflow-hidden border-t transition-[max-height,opacity,border-color] duration-[220ms] ease-out lg:hidden",
          mobileOpen
            ? "max-h-[calc(100dvh-4rem)] border-white/40 opacity-100"
            : "max-h-0 border-transparent opacity-0"
        )}
        aria-hidden={!mobileOpen}
      >
        <div className="bg-white/50 px-4 pb-6 pt-2 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/40">
          <div className="space-y-1">
            {NAV_LINKS.map((link) =>
              link.href.startsWith("/") && !link.href.includes("#") ? (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block rounded-lg px-3 py-3.5 text-base text-[#1B1714]/75",
                    "transition-colors duration-200 hover:bg-white/50 hover:text-[#5B21B6]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B21B6]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                  )}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block rounded-lg px-3 py-3.5 text-base text-[#1B1714]/75",
                    "transition-colors duration-200 hover:bg-white/50 hover:text-[#5B21B6]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B21B6]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                  )}
                >
                  {link.label}
                </a>
              )
            )}
          </div>

          <div className="mt-4 space-y-3 border-t border-white/50 pt-5">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className={primaryGradientButtonClass(
                  "w-full py-3.5 text-center text-sm focus-visible:ring-offset-transparent"
                )}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className={primaryGradientButtonClass(
                    "w-full py-3.5 text-center text-sm focus-visible:ring-offset-transparent"
                  )}
                >
                  Login
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block w-full rounded-full border border-white/50 bg-white/40 py-3.5 text-center text-sm font-semibold text-[#1B1714] backdrop-blur-md",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B21B6]/40 focus-visible:ring-offset-2"
                  )}
                >
                  Start Free Trial
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
