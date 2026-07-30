"use client";

import Image from "next/image";
import Link from "next/link";
import { FOOTER_LINKS, IMAGES } from "../constants";

export function Footer() {
  return (
    <footer className="relative overflow-hidden">
      <Image
        src={IMAGES.footerBg}
        alt="Luxury salon footer background"
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/85 to-black/70" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 lg:px-8 lg:py-24">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-purple-600">
                <span className="text-lg font-bold text-white">S</span>
              </div>
              <span className="font-serif text-2xl font-bold text-white">Salon AI</span>
            </div>
            <p className="mt-4 max-w-sm text-gray-400 leading-relaxed">
              The luxury salon ERP platform trusted by 1,000+ salons across India. Run your entire business with intelligence.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/register"
                className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                Start Free Trial
              </Link>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald-400">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-gray-400 transition hover:text-white"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Salon AI. All rights reserved.
          </p>
          <p className="text-sm text-gray-500">
            Made with care for salon professionals everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}
