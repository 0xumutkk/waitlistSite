import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";

import { REFERRAL_COOKIE_NAME, readReferralCookieValue } from "@/lib/referrals/cookie";
import { getDb } from "@/lib/server/db";
import { getBearerToken, getPrivyProfile, verifyPrivyRequest } from "@/lib/server/privy";
import { getAppUrl } from "@/lib/server/env";
import { getClientIp, globalRateLimiter, rateLimiter } from "@/lib/server/ratelimit";

export const runtime = "nodejs";

export async function POST() {
  const requestHeaders = await headers();

  // 1. Rate Limiting
  const ip = getClientIp(requestHeaders);
  const { success } = await globalRateLimiter.limit(ip);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const authToken = getBearerToken(requestHeaders);

  if (!authToken) {
    return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });
  }

  const privyUserId = await verifyPrivyRequest(authToken);

  const rl = await rateLimiter.authSync(privyUserId);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const profile = await getPrivyProfile(privyUserId);

  if (!profile.twitterUsername) {
    return NextResponse.json(
      { error: "X account is required to join the waitlist" },
      { status: 403 },
    );
  }

  const db = getDb();
  const { user, isNew } = await db.upsertUser(profile);

  const cookieStore = await cookies();
  const referralCode = readReferralCookieValue(cookieStore.get(REFERRAL_COOKIE_NAME)?.value);

  if (isNew && referralCode) {
    const referrer = await db.getUserByReferralCode(referralCode);

    if (referrer && referrer.id !== user.id) {
      await db.createVerifiedReferral({
        referrerUserId: referrer.id,
        referredUserId: user.id,
        referralCode: referrer.referralCode,
      });
    }

    cookieStore.delete(REFERRAL_COOKIE_NAME);
  }

  const me = await db.getMe(user.id, getAppUrl());
  return NextResponse.json(me);
}
