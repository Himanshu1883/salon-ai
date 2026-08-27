import { Suspense } from "react";
import { AdminLoginBrandPanel } from "./admin-login-brand-panel";
import { AdminLoginFormFields } from "./admin-login-form-fields";

export const metadata = {
  title: "Platform Admin Login",
};

function LoginFormFallback() {
  return (
    <div className="flex w-full max-w-[440px] flex-col items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-dashboard-primary border-t-transparent" />
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="admin-login flex min-h-screen bg-white">
      <AdminLoginBrandPanel />
      <main className="admin-login-main flex min-h-screen flex-1 flex-col items-center justify-center px-6 py-10 sm:px-10">
        <Suspense fallback={<LoginFormFallback />}>
          <AdminLoginFormFields />
        </Suspense>
      </main>
    </div>
  );
}
