"use client";

import Link from "next/link";
import { useState } from "react";
import { Reveal } from "@/components/site/Reveal";

const TITLE = "Book a Demo — Gotix";
const DESC =
  "Book a 30-minute guided walkthrough of Gotix tailored to your salon, spa or chain.";


function DemoPage() {
  const [sent, setSent] = useState(false);

  return (
    <section className="mx-auto w-full max-w-xl px-5 py-20 sm:px-8">
      <Reveal>
        <p className="eyebrow">Book a demo</p>
        <h1 className="mt-4 text-3xl sm:text-4xl">
          See Gotix on <em className="italic text-primary">your</em> numbers.
        </h1>
        <p className="mt-4 text-muted-foreground">
          30 minutes, no slides — we set up your services and show the real
          workflow.
        </p>

        <form
          className="surface-card mt-8 p-7"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          <div className="grid gap-5">
            {[
              { name: "name", label: "Your name", type: "text" },
              { name: "salon", label: "Salon name", type: "text" },
              { name: "phone", label: "Phone", type: "tel" },
            ].map((f) => (
              <label key={f.name} className="block text-sm">
                <span className="text-muted-foreground">{f.label}</span>
                <input
                  required
                  name={f.name}
                  type={f.type}
                  className="mt-2 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-hidden focus:border-primary"
                />
              </label>
            ))}
            <label className="block text-sm">
              <span className="text-muted-foreground">Number of branches</span>
              <select
                name="branches"
                className="mt-2 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-hidden focus:border-primary"
              >
                <option>1</option>
                <option>2–5</option>
                <option>6–15</option>
                <option>15+</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="text-muted-foreground">Preferred demo time</span>
              <input
                name="time"
                type="datetime-local"
                className="mt-2 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-hidden focus:border-primary"
              />
            </label>
          </div>
          <button type="submit" className="btn-base btn-primary mt-7 w-full">
            {sent ? "Demo requested" : "Book My Demo"}
          </button>
          {sent && (
            <p className="mt-3 text-center text-sm text-secondary">
              Thanks — a specialist will confirm your slot shortly.
            </p>
          )}
        </form>
      </Reveal>
    </section>
  );
}

export default DemoPage;
