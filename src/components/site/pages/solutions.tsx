import { CtaBanner } from "@/components/site/Cta";
import { Reveal } from "@/components/site/Reveal";
import { ImageSlot, PageHero } from "@/components/site/Sections";
import { SALON_TYPES } from "@/lib/site-data";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const bannerGrowth = "/gotix/banner-growth.jpg";

const TITLE = "Solutions by Salon Type — Gotix";
const DESC =
  "Gotix is tailored for hair salons, spas, skin clinics, barber shops, nail and makeup studios, academies, bridal and tattoo studios.";


function SolutionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Solutions"
        title={
          <>
            Built For Every Kind of <em className="italic text-primary">Beauty Business.</em>
          </>
        }
        subtitle="Ten business types, one platform — configured for the way your floor actually runs."
        image={bannerGrowth}
        imageAlt="Busy premium salon floor with stylists and clients"
      />

      <div className="w-full pb-8">
        {SALON_TYPES.map((t, i) => (
          <section key={t.name} className={`w-full py-16 ${i % 2 === 1 ? "bg-card" : ""}`}>
            <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
              <Reveal>
                <div
                  className={`grid items-center gap-10 lg:grid-cols-2 ${
                    i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  <ImageSlot
                    name={`salon-type-${t.name.toLowerCase().replace(/\s+/g, "-")}.jpg`}
                    alt={`${t.name} interior photo`}
                    ratio="aspect-[5/4]"
                  />
                  <div>
                    <p className="eyebrow">0{i + 1 > 9 ? i + 1 : i + 1}</p>
                    <h2 className="mt-3 text-3xl sm:text-4xl">{t.name}</h2>
                    <p className="mt-4 max-w-lg text-muted-foreground">{t.desc}</p>
                    <Link
                      href="/features"
                      className="mt-6 inline-flex items-center gap-2 font-medium text-primary transition-all hover:gap-3"
                    >
                      Learn more <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>
        ))}
      </div>

      <CtaBanner title="Find the right fit for your business." />
    </>
  );
}

export default SolutionsPage;
