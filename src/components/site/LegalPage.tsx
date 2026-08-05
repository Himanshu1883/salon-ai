import Link from "next/link";
import { Reveal } from "./Reveal";

export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: { heading: string; body: string }[];
}) {
  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-32 sm:px-8">
      <Reveal>
        <p className="eyebrow">Legal</p>
        <h1 className="mt-4 text-3xl sm:text-4xl">{title}</h1>
        <p className="mt-4 text-muted-foreground">{intro}</p>
        <div className="hairline-gold mt-8" />
        <div className="mt-10 space-y-8">
          {sections.map((s) => (
            <div key={s.heading}>
              <h2 className="font-display text-xl">{s.heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-12 text-xs text-muted-foreground">
          This is placeholder copy for launch and does not yet constitute a
          binding legal document.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 font-medium text-primary transition-all hover:gap-3"
        >
          ← Back to home
        </Link>
      </Reveal>
    </section>
  );
}
