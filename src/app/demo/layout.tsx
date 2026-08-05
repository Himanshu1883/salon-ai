import { Brand } from "@/components/site/Navbar";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="gotix-site antialiased">
      <header className="border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1500px] items-center px-5 sm:px-8">
          <Brand />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
