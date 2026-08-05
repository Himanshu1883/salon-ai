import { Footer } from "@/components/site/Footer";
import { Navbar } from "@/components/site/Navbar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="gotix-site antialiased">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
