import { CtaBanner, RatingBadge } from "@/components/site/Cta";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { ImageSlot, PageHero } from "@/components/site/Sections";
import { TESTIMONIALS } from "@/lib/site-data";
import { createFileRoute } from "@tanstack/react-router";

const TITLE = "Testimonials — Loved By Salons Across India | Gotix";
const DESC =
  "4.9★ from 847 reviews. Read how salon, spa and bridal studio owners run their business on Gotix.";

export const Route = createFileRoute("/testimonials")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: TestimonialsPage,
});

const CHIPS = ["Best salon software in India", "Incredible support team", "Worth every rupee"];

function TestimonialsPage() {
  return (
    <>
      <PageHero
        eyebrow="Testimonials"
        title={
          <>
            Loved By Salons <em className="italic text-primary">Across India.</em>
          </>
        }
      >
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <RatingBadge />
          <ul className="flex flex-wrap gap-2">
            {CHIPS.map((c) => (
              <li
                key={c}
                className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs text-muted-foreground"
              >
                {c}
              </li>
            ))}
          </ul>
        </div>
      </PageHero>

      <section className="w-full pb-24">
        <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <Stagger className="grid gap-6 md:grid-cols-2">
            {TESTIMONIALS.map((t, i) => (
              <StaggerItem key={t.name}>
                <figure className="surface-card lift flex h-full flex-col gap-6 p-7 sm:flex-row">
                  <ImageSlot
                    name={`owner-${i + 1}.jpg`}
                    alt={`Portrait of ${t.name}`}
                    ratio="aspect-square"
                    className="w-24 shrink-0 rounded-full"
                  />
                  <div>
                    <span className="text-gold">★★★★★</span>
                    <blockquote className="mt-3 leading-relaxed">“{t.quote}”</blockquote>
                    <figcaption className="mt-5">
                      <span className="block font-display text-base">{t.name}</span>
                      <span className="block text-xs text-muted-foreground">{t.role}</span>
                    </figcaption>
                  </div>
                </figure>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal className="mt-12 text-center text-sm text-muted-foreground">
            <p>Reviews collected from verified Gotix customers.</p>
          </Reveal>
        </div>
      </section>

      <CtaBanner title="Join 1,000+ salons already growing." />
    </>
  );
}
