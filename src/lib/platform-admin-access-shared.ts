import type { SubscriptionStatus } from "@/lib/subscription";

export const IMPERSONATION_TOKEN_EXPIRY_MS = 5 * 60 * 1000;

const SUBSCRIPTION_STATUSES_FOR_IMPERSONATION: SubscriptionStatus[] = [
  "active",
  "trial",
];

export function canPlatformAdminAccessSalon(
  status: string | null | undefined
): boolean {
  if (!status) return false;
  return SUBSCRIPTION_STATUSES_FOR_IMPERSONATION.includes(
    status as SubscriptionStatus
  );
}

export function generateTemporaryPassword(length = 12): string {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$";
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => chars[byte % chars.length]).join("");
}
