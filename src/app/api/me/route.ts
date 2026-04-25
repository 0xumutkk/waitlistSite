import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { getDb } from "@/lib/server/db";
import { getBearerToken, verifyPrivyRequest } from "@/lib/server/privy";

export const runtime = "nodejs";

export async function GET() {
  const requestHeaders = await headers();
  const authToken = getBearerToken(requestHeaders);

  if (!authToken) {
    return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });
  }

  const privyUserId = await verifyPrivyRequest(authToken);
  const user = await getDb().getUserByPrivyId(privyUserId);

  if (!user) {
    return NextResponse.json({ error: "User has not been synced" }, { status: 404 });
  }

  const origin = requestHeaders.get("origin") ?? "http://localhost:3000";
  return NextResponse.json(await getDb().getMe(user.id, origin));
}
