/**
 * Visual shell only — login/signup forms keep their NextAuth + server-action logic.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="gotix-site min-h-screen antialiased">{children}</div>;
}
