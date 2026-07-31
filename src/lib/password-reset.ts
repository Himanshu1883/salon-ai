import { createHash, randomBytes } from "crypto";

export const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000;

export function generatePasswordResetToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashPasswordResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function getPasswordResetExpiry(): Date {
  return new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);
}
