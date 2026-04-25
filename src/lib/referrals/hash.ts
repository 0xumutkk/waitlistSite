import { createHash } from "node:crypto";

import { getOptionalEnv } from "@/lib/server/env";

export function hashAbuseSignal(value: string | null): string | null {
  if (!value) return null;

  const salt = getOptionalEnv("REFERRAL_COOKIE_SECRET") ?? "perminal-local-referral-secret";
  return createHash("sha256").update(`${salt}:${value}`).digest("hex");
}

