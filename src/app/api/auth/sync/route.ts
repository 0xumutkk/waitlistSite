import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";

import { REFERRAL_COOKIE_NAME, readReferralCookieValue } from "@/lib/referrals/cookie";
import { getDb } from "@/lib/server/db";
import { getBearerToken, getPrivyProfile, verifyPrivyRequest } from "@/lib/server/privy";

export const runtime = "nodejs";

export async function POST() {
  const requestHeaders = await headers();
  const authToken = getBearerToken(requestHeaders);

  if (!authToken) {
    return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });
  }

  const privyUserId = await verifyPrivyRequest(authToken);
  const profile = await getPrivyProfile(privyUserId);
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
        referralCode,
      });
    }

    cookieStore.delete(REFERRAL_COOKIE_NAME);
  }

  const me = await db.getMe(user.id, requestHeaders.get("origin") ?? "http://localhost:3000");
  return NextResponse.json(me);
}
