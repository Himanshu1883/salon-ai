import { auth } from "@/lib/auth";
import { Navbar } from "@/components/landing-v2/navbar";
import { Footer } from "@/components/landing-v2/footer/footer";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="landing-v2 min-h-screen antialiased">
      <Navbar isAuthenticated={!!session} />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
