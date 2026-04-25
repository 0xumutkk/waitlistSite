import { NextRequest, NextResponse } from "next/server";

import {
  REFERRAL_COOKIE_MAX_AGE,
  REFERRAL_COOKIE_NAME,
  createReferralCookieValue,
} from "@/lib/referrals/cookie";
import { hashAbuseSignal } from "@/lib/referrals/hash";
import { getDb } from "@/lib/server/db";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ code: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { code } = await context.params;
  const referralCode = decodeURIComponent(code).trim();
  const url = new URL("/", request.url);
  const response = NextResponse.redirect(url);

  if (!referralCode) {
    return response;
  }

  const db = getDb();
  const referrer = await db.getUserByReferralCode(referralCode);

  if (!referrer) {
    return response;
  }

  await db.recordReferralVisit({
    referralCode,
    visitorFingerprintHash: hashAbuseSignal(request.cookies.get("perminal_visitor")?.value ?? null),
    ipHash: hashAbuseSignal(request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null),
    userAgentHash: hashAbuseSignal(request.headers.get("user-agent")),
  });

  response.cookies.set(REFERRAL_COOKIE_NAME, createReferralCookieValue(referralCode), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: REFERRAL_COOKIE_MAX_AGE,
    path: "/",
  });

  return response;
}
