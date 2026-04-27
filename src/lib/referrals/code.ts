import { randomBytes } from "node:crypto";

export function createReferralCode(): string {
  return randomBytes(5).toString("base64url").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);
}

export function usernameToReferralCode(username: string): string | null {
  const sanitized = username.replace(/^@/, "").toLowerCase().replace(/[^a-z0-9_]/g, "");
  return sanitized.length >= 3 ? sanitized : null;
}

