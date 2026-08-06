import { CtaBanner } from "@/components/site/Cta";
import { Reveal } from "@/components/site/Reveal";
import { ImageSlot, PageHero } from "@/components/site/Sections";
import { FEATURES } from "@/lib/site-data";
import Link from "next/link";

const bannerAppointments = "/gotix/banner-appointments.jpg";

const TITLE = "Features — Five-Star Salon Operations | Gotix";
const DESC =
  "Reception, POS, inventory, stylist workflow, treatment tracking, spa management and AI consultations — every Gotix feature explained.";


function FeaturesPage() {
  return (
    <>
      <PageHero
        eyebrow="Features"
        title={
          <>
            Everything Your Team Needs to Deliver a{" "}
            <em className="italic text-primary">Five-Star Experience.</em>
          </>
        }
        image={bannerAppointments}
        imageAlt="Salon reception desk with a receptionist welcoming a client"
      />

      {FEATURES.map((f, i) => (
        <section
          key={f.title}
          className={`w-full py-16 ${i % 2 === 1 ? "bg-card" : "bg-background"}`}
        >
          <div className="mx-auto w-full max-w-[1500px] px-5 sm:px-8">
            <Reveal>
              <div
                className={`grid items-center gap-10 lg:grid-cols-2 ${
                  i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <ImageSlot
                  name={`feature-${i + 1}`}
                  alt={f.imageAlt}
                  src={f.image}
                  ratio="aspect-[5/4]"
                />
                <div>
                  <p className="eyebrow">Feature {i + 1}</p>
                  <h2 className="mt-3 text-3xl sm:text-4xl">{f.title}</h2>
                  <p className="mt-4 max-w-lg text-muted-foreground">{f.desc}</p>
                  <ul className="mt-6 space-y-2.5 text-sm">
                    {f.points.map((p) => (
                      <li key={p} className="flex items-center gap-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      ))}

      <CtaBanner />
    </>
  );
}

export default FeaturesPage;
