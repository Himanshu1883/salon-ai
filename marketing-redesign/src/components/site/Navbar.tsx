import logo from "@/assets/logo_gotix.jpeg";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Menu, Shield, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";

const LINKS = [
  { to: "/modules", label: "Modules" },
  { to: "/platform", label: "Platform" },
  { to: "/solutions", label: "Solutions" },
  { to: "/features", label: "Features" },
  { to: "/ai", label: "AI" },
  { to: "/pricing", label: "Pricing" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <div className="relative">
        <img
          src={logo}
          alt="Gotix logo"
          width={32}
          height={32}
          className={`h-8 w-8 rounded-md object-cover transition-transform duration-300 group-hover:scale-105 ${
            light ? "mix-blend-screen" : ""
          }`}
        />
        <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/20 to-purple-500/20 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <span
        className={`font-display text-lg tracking-tight transition-colors ${
          light ? "text-ink-foreground" : "text-foreground"
        }`}
      >
        Gotix
        <span className="ml-1 text-xs font-normal text-primary">™</span>
      </span>
    </Link>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-border/50 bg-background/95 backdrop-blur-xl shadow-[var(--shadow-soft)]"
          : "bg-background/5 backdrop-blur-md"
      }`}
    >
      {/* Full-width container with inner padding */}
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
        <nav className="flex h-16 w-full items-center justify-between lg:h-20">
          <Brand />

          {/* Desktop Navigation - Centered */}
          <div className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="nav-link rounded-full px-3 py-1.5 text-sm transition-all hover:bg-primary/5"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to="/login"
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-foreground"
            >
              Log in
            </Link>
            <Link to="/register" className="group btn-base btn-primary relative overflow-hidden">
              <span className="relative z-10 flex items-center gap-2">
                Start Free Trial
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary to-purple-600 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="btn-base btn-outline !px-3 !py-2 lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="border-t border-border/50 bg-background/98 backdrop-blur-xl lg:hidden"
          >
            <div className="px-4 pb-6 pt-4 sm:px-6">
              <ul className="flex flex-col gap-0.5">
                {LINKS.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-all hover:bg-primary/5 hover:text-primary"
                    >
                      <span className="h-1 w-1 rounded-full bg-primary/20" />
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Divider */}
              <div className="my-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

              {/* Mobile Actions */}
              <div className="flex flex-col gap-3">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center rounded-full border border-border/50 bg-background/50 px-4 py-3 text-sm font-medium transition-all hover:border-primary hover:bg-primary/5"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="btn-base btn-primary w-full"
                >
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Trust Badge - Mobile */}
              <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Shield className="h-3 w-3 text-primary" />
                  <span>Enterprise</span>
                </div>
                <div className="h-3 w-px bg-border" />
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-yellow-500" />
                  <span>99.9% uptime</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar indicator on scroll */}
      {scrolled && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-primary to-purple-600"
          style={{
            width: "100%",
            transformOrigin: "left",
            scaleX: Math.min(window.scrollY / 1000, 1),
          }}
        />
      )}
    </header>
  );
}
