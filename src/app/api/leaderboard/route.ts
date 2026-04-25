import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { getDb } from "@/lib/server/db";
import { getBearerToken, verifyPrivyRequest } from "@/lib/server/privy";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const limitParam = Number(request.nextUrl.searchParams.get("limit") ?? "10");
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 50) : 10;
  const requestHeaders = await headers();
  const authToken = getBearerToken(requestHeaders);
  let currentUserId: string | null = null;

  if (authToken) {
    try {
      const privyUserId = await verifyPrivyRequest(authToken);
      const user = await getDb().getUserByPrivyId(privyUserId);
      currentUserId = user?.id ?? null;
    } catch {
      currentUserId = null;
    }
  }

  const entries = await getDb().getLeaderboard({ limit, currentUserId });
  return NextResponse.json({ entries });
}
