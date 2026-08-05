import { createFileRoute, Link } from "@tanstack/react-router";
import { Reveal } from "@/components/site/Reveal";

const TITLE = "Log in — Gotix";
const DESC = "Sign in to your Gotix workspace to manage bookings, billing and clients.";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <section className="mx-auto w-full max-w-md px-5 py-32 sm:px-8">
      <Reveal>
        <p className="eyebrow">Welcome back</p>
        <h1 className="mt-4 text-3xl">Log in to Gotix</h1>
        <form
          className="surface-card mt-8 p-7"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className="block text-sm">
            <span className="text-muted-foreground">Email</span>
            <input
              type="email"
              className="mt-2 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-hidden focus:border-primary"
            />
          </label>
          <label className="mt-5 block text-sm">
            <span className="text-muted-foreground">Password</span>
            <input
              type="password"
              className="mt-2 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm outline-hidden focus:border-primary"
            />
          </label>
          <button type="submit" className="btn-base btn-primary mt-7 w-full">
            Log in
          </button>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            No account yet?{" "}
            <Link to="/register" className="text-primary">
              Start a free trial
            </Link>
          </p>
        </form>
      </Reveal>
    </section>
  );
}
