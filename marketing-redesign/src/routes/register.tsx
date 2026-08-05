import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Reveal } from "@/components/site/Reveal";

const TITLE = "Start Your Free Trial — Gotix";
const DESC =
  "Create your Gotix workspace and get 14 days of full access to all 22 modules. No credit card required.";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const [sent, setSent] = useState(false);

  return (
    <section className="mx-auto w-full max-w-md px-5 py-32 sm:px-8">
      <Reveal>
        <p className="eyebrow">14-day free trial</p>
        <h1 className="mt-4 text-3xl">Create your workspace</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          All 22 modules, onboarding included, no credit card.
        </p>
        <form
          className="surface-card mt-8 p-7"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
        >
          {[
            { label: "Your name", type: "text" },
            { label: "Salon name", type: "text" },
            { label: "Email", type: "email" },
            { label: "Phone", type: "tel" },
          ].map((f) => (
            <label key={f.label} className="mt-5 block text-sm first:mt-0">
              <span className="text-muted-foreground">{f.label}</span>
              <input
                required
                type={f.type}
                className="mt-2 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-hidden focus:border-primary"
              />
            </label>
          ))}
          <button type="submit" className="btn-base btn-primary mt-7 w-full">
            {sent ? "Trial requested" : "Start Free Trial"}
          </button>
          {sent && (
            <p className="mt-3 text-center text-sm text-secondary">
              Thanks — check your inbox for workspace setup details.
            </p>
          )}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary">
              Log in
            </Link>
          </p>
        </form>
      </Reveal>
    </section>
  );
}
