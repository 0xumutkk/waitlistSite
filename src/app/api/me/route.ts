import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { getDb } from "@/lib/server/db";
import { getBearerToken, verifyPrivyRequest } from "@/lib/server/privy";
import { getAppUrl } from "@/lib/server/env";
import { rateLimiter } from "@/lib/server/ratelimit";

export const runtime = "nodejs";

export async function GET() {
  const requestHeaders = await headers();
  const authToken = getBearerToken(requestHeaders);

  if (!authToken) {
    return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });
  }

  const privyUserId = await verifyPrivyRequest(authToken);

  const rl = await rateLimiter.me(privyUserId);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const user = await getDb().getUserByPrivyId(privyUserId);

  if (!user) {
    return NextResponse.json({ error: "User has not been synced" }, { status: 404 });
  }

  return NextResponse.json(await getDb().getMe(user.id, getAppUrl()));
}
