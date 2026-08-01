import { Suspense } from "react";
import AdminLoginForm from "./admin-login-form";

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="admin-login-main flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-dashboard-primary border-t-transparent" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
