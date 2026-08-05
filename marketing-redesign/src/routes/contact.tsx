import contactImg from "@/assets/contact-office.jpg";
import { Reveal } from "@/components/site/Reveal";
import { PageHero } from "@/components/site/Sections";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";

const TITLE = "Contact Gotix — Talk to Our Team";
const DESC =
  "Get in touch with the Gotix team for demos, migration help, pricing questions or partnership enquiries.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: ContactPage,
});

const FIELDS = [
  { name: "name", label: "Your name", type: "text" },
  { name: "salon", label: "Salon name", type: "text" },
  { name: "email", label: "Email", type: "email" },
  { name: "phone", label: "Phone", type: "tel" },
] as const;

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title={
          <>
            Let's talk about your <em className="italic text-primary">salon.</em>
          </>
        }
        subtitle="Tell us how you work today and we'll show you exactly what changes on day one."
        image={contactImg}
        imageAlt="Boutique beauty salon storefront at golden hour"
      />

      <section className="w-full pb-24">
        <div className="mx-auto grid w-full max-w-[1500px] gap-12 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <form
              className="surface-card p-7"
              onSubmit={(e) => {
                e.preventDefault();
                setSent(true);
              }}
            >
              <h2 className="font-display text-2xl">Send us a message</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {FIELDS.map((f) => (
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
                <label className="block text-sm sm:col-span-2">
                  <span className="text-muted-foreground">Message</span>
                  <textarea
                    required
                    name="message"
                    rows={5}
                    className="mt-2 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-hidden focus:border-primary"
                  />
                </label>
              </div>
              <button type="submit" className="btn-base btn-primary mt-6">
                {sent ? "Message sent" : "Submit"}
              </button>
              {sent && (
                <p className="mt-3 text-sm text-secondary">
                  Thanks — we'll be in touch within one business day.
                </p>
              )}
            </form>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="surface-card p-7">
              <h2 className="font-display text-2xl">Reach us directly</h2>
              <ul className="mt-6 space-y-5 text-sm">
                <li className="flex gap-3">
                  <Mail className="h-4 w-4 shrink-0 text-primary" />
                  hello@gotix.example
                </li>
                <li className="flex gap-3">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  +91 90000 10050
                </li>
                <li className="flex gap-3">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  4th Floor, Beauty Tech House, Indiranagar, Bengaluru 560038
                </li>
                <li className="flex gap-3">
                  <Clock className="h-4 w-4 shrink-0 text-primary" />
                  Mon–Sat · 9:30 AM – 7:00 PM IST
                </li>
              </ul>
              <div
                role="img"
                aria-label="Map showing the Gotix office location"
                className="slot-placeholder mt-7 flex aspect-[16/10] items-center justify-center rounded-2xl text-xs text-muted-foreground"
              >
                map-embed placeholder
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
