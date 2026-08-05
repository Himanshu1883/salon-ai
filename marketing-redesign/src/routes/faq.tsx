import { createFileRoute } from "@tanstack/react-router";
import { FAQS } from "@/lib/site-data";
import { PageHero } from "@/components/site/Sections";
import { Reveal } from "@/components/site/Reveal";
import { Accordion, CtaBanner } from "@/components/site/Cta";

const TITLE = "FAQ — Setup, Migration & Billing | Gotix";
const DESC =
  "Answers on setup time, multi-branch support, data migration, WhatsApp integration, free trials and POS payment methods.";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title={
          <>
            Questions, <em className="italic text-primary">Answered.</em>
          </>
        }
        subtitle="Everything owners ask us before switching. Still stuck? Our team replies within a few hours."
      />

      <section className="w-full pb-24">
        <div className="mx-auto w-full max-w-3xl px-5 sm:px-8">
          <Reveal>
            <Accordion items={FAQS} />
          </Reveal>
        </div>
      </section>

      <CtaBanner title="Still have questions?" copy="Talk to a product specialist — no sales script, just answers." />
    </>
  );
}
