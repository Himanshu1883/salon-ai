"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "./constants";
import { cn } from "@/lib/utils";

type NavbarProps = {
  isAuthenticated?: boolean;
};

const navLinkClass =
  "group relative px-3 py-2 text-sm text-[#1B1714]/70 transition-colors duration-200 hover:text-[#1B1714] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A2E2E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F3EC]";

function NavLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <a href={href} onClick={onClick} className={navLinkClass}>
      {label}
      <span
        aria-hidden
        className="absolute bottom-0.5 left-1/2 h-[1.5px] w-0 -translate-x-1/2 bg-[#7A2E2E] transition-all duration-200 ease-out group-hover:w-[calc(100%-1.5rem)]"
      />
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
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,box-shadow,backdrop-filter] duration-[220ms] ease-out",
        scrolled
          ? "border-b border-[#E4DDD1] bg-[#F7F3EC]/95 shadow-[0_4px_24px_-8px_rgba(27,23,20,0.1)] backdrop-blur-xl"
          : "border-b border-[#E4DDD1]/90 bg-white/75 shadow-[0_1px_0_rgba(255,255,255,0.65)_inset,0_8px_32px_-12px_rgba(27,23,20,0.1)] backdrop-blur-xl"
      )}
    >
      {/* Accent hairline — matches hero editorial theme */}
      <div
        aria-hidden
        className="h-px bg-gradient-to-r from-transparent via-[#C9A25D]/45 to-transparent"
      />
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 lg:px-8 lg:py-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A2E2E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F3EC]"
          onClick={() => setMobileOpen(false)}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[#7A2E2E]/25 bg-[#7A2E2E]/[0.07]">
            <span className="hero-editorial__headline text-[15px] font-medium leading-none text-[#7A2E2E]">
              S
            </span>
          </div>
          <span className="hero-editorial__headline text-xl font-medium tracking-tight text-[#1B1714]">
            Salon AI
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-0.5 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-5 lg:flex">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className={cn(
                "rounded-lg bg-[#7A2E2E] px-5 py-2.5 text-sm font-semibold text-[#F7F3EC]",
                "shadow-[0_2px_10px_-2px_rgba(122,46,46,0.35)]",
                "transition-[transform,background-color,box-shadow] duration-200",
                "hover:-translate-y-px hover:bg-[#6B2828] hover:shadow-[0_4px_16px_-4px_rgba(122,46,46,0.4)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A2E2E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F3EC]"
              )}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className={cn(
                  "text-sm font-medium text-[#1B1714]/80 underline-offset-4",
                  "transition-colors duration-200 hover:text-[#1B1714] hover:underline",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A2E2E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F3EC]"
                )}
              >
                Log in
              </Link>
              <Link
                href="/register"
                className={cn(
                  "rounded-lg bg-[#7A2E2E] px-5 py-2.5 text-sm font-semibold text-[#F7F3EC]",
                  "shadow-[0_2px_10px_-2px_rgba(122,46,46,0.35)]",
                  "transition-[transform,background-color,box-shadow] duration-200",
                  "hover:-translate-y-px hover:bg-[#6B2828] hover:shadow-[0_4px_16px_-4px_rgba(122,46,46,0.4)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A2E2E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F3EC]"
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
            "rounded-md p-2 transition-colors duration-200 lg:hidden",
            mobileOpen ? "text-[#7A2E2E]" : "text-[#1B1714]",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A2E2E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F3EC]"
          )}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t transition-[max-height,opacity,border-color] duration-[220ms] ease-out lg:hidden",
          mobileOpen
            ? "max-h-[calc(100dvh-4rem)] border-[#E4DDD1] opacity-100"
            : "max-h-0 border-transparent opacity-0"
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          className={cn(
            "px-4 pb-6 pt-2",
            scrolled ? "bg-[#F7F3EC]" : "bg-white/80 backdrop-blur-xl"
          )}
        >
          <div className="space-y-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block rounded-md px-3 py-3.5 text-base text-[#1B1714]/75",
                  "transition-colors duration-200 hover:text-[#1B1714]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A2E2E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F3EC]"
                )}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="mt-4 space-y-3 border-t border-[#E4DDD1] pt-5">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block w-full rounded-lg bg-[#7A2E2E] py-3.5 text-center text-sm font-semibold text-[#F7F3EC]",
                  "shadow-[0_2px_10px_-2px_rgba(122,46,46,0.35)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A2E2E] focus-visible:ring-offset-2"
                )}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block w-full py-2 text-center text-sm font-medium text-[#1B1714]/80",
                    "underline-offset-4 hover:text-[#1B1714] hover:underline",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A2E2E] focus-visible:ring-offset-2"
                  )}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block w-full rounded-lg bg-[#7A2E2E] py-3.5 text-center text-sm font-semibold text-[#F7F3EC]",
                    "shadow-[0_2px_10px_-2px_rgba(122,46,46,0.35)]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A2E2E] focus-visible:ring-offset-2"
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
