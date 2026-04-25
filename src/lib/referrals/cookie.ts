import { createHmac, timingSafeEqual } from "node:crypto";

import { getOptionalEnv } from "@/lib/server/env";

export const REFERRAL_COOKIE_NAME = "perminal_ref";
export const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

type ReferralCookiePayload = {
  code: string;
  createdAt: number;
};

function getSecret(): string {
  return getOptionalEnv("REFERRAL_COOKIE_SECRET") ?? "perminal-local-referral-secret";
}

function encode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createReferralCookieValue(code: string): string {
  const payload = encode(JSON.stringify({ code, createdAt: Date.now() } satisfies ReferralCookiePayload));
  return `${payload}.${sign(payload)}`;
}

export function readReferralCookieValue(value?: string): string | null {
  if (!value) return null;

  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;

  const expectedSignature = sign(payload);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const parsed = JSON.parse(decode(payload)) as ReferralCookiePayload;
    if (!parsed.code || Date.now() - parsed.createdAt > REFERRAL_COOKIE_MAX_AGE * 1000) {
      return null;
    }

    return parsed.code;
  } catch {
    return null;
  }
}

