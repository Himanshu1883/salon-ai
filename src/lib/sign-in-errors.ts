type SignInResult = {
  ok?: boolean;
  error?: string | null;
  code?: string | null;
};

export function getSignInErrorMessage(
  result: SignInResult,
  invalidCredentialsMessage = "Invalid email or password"
): string {
  if (
    result.error === "Configuration" ||
    result.error === "DatabaseUnavailable" ||
    result.code === "DatabaseUnavailable" ||
    result.code === "database_unavailable"
  ) {
    return "Cannot connect to the database. For Railway, set DATABASE_PUBLIC_URL in .env (public *.proxy.rlwy.net URL), then run npm run db:check, npm run db:migrate, and npm run db:seed.";
  }

  return invalidCredentialsMessage;
}
