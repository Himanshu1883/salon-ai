import { Counter } from "@/components/site/Counter";
import { CtaBanner } from "@/components/site/Cta";
import { Reveal, Stagger, StaggerItem } from "@/components/site/Reveal";
import { PageHero } from "@/components/site/Sections";
import { STATS } from "@/lib/site-data";
import Link from "next/link";

const teamImg = "/gotix/about-team.jpg";

const TITLE = "About Gotix — Built by People Who Understand Salons";
const DESC =
  "Our mission: give every salon, spa and beauty chain the operational intelligence of an enterprise brand.";


const TIMELINE = [
  {
    year: "2021",
    title: "A front desk problem",
    copy: "We ran salon operations ourselves and lost hours every day to spreadsheets and missed calls.",
  },
  {
    year: "2023",
    title: "One system, 22 modules",
    copy: "We rebuilt the entire salon workflow — from walk-in queue to payroll — as a single connected platform.",
  },
  {
    year: "2025",
    title: "Intelligence layer",
    copy: "AI forecasting, smart recommendations and inventory prediction shipped to every paid plan.",
  },
  {
    year: "2026",
    title: "1,000+ salons",
    copy: "Boutique studios and multi-branch chains across India now run their day on Gotix.",
  },
];

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title={
          <>
            Built by people who <em className="italic text-primary">understand salons.</em>
          </>
        }
        subtitle="We believe a stylist's time belongs to their client — not to paperwork. Gotix exists to give beauty businesses the operational intelligence of an enterprise brand, in software that feels as considered as their space."
      />

      <section className="w-full pb-20">
        <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
          <Stagger className="grid grid-cols-2 gap-6 border-y border-border py-10 sm:grid-cols-4">
            {STATS.map((s) => (
              <StaggerItem key={s.label}>
                <p className="font-display text-3xl sm:text-4xl">
                  <Counter value={s.value} suffix={s.suffix} decimals={s.decimals ?? 0} />
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {s.label}
                </p>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal className="mt-16">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <img
                src={teamImg}
                alt="The Gotix team working together in a bright studio office"
                width={1600}
                height={1000}
                loading="lazy"
                className="w-full rounded-2xl object-cover"
              />
              <div>
                <p className="eyebrow">Our mission</p>
                <h2 className="mt-3 text-3xl sm:text-4xl">Software that respects the craft.</h2>
                <p className="mt-4 text-muted-foreground">
                  Gotix is built with owners, receptionists and stylists in the room. Every screen
                  is designed for a busy floor: fewer taps, clearer numbers, and automation that
                  quietly handles the follow-ups.
                </p>
              </div>
            </div>
          </Reveal>

          <div className="mt-20">
            <Reveal>
              <p className="eyebrow">Why we built this</p>
              <div className="hairline-gold mt-4 w-40" />
            </Reveal>
            <Stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {TIMELINE.map((t) => (
                <StaggerItem key={t.year}>
                  <div className="surface-card lift h-full p-6">
                    <p className="font-display text-2xl text-primary">{t.year}</p>
                    <h3 className="mt-3 font-display text-lg">{t.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{t.copy}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      <CtaBanner title="Come build with us." />
    </>
  );
}

export default AboutPage;
