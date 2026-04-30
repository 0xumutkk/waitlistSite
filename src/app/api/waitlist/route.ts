import { NextResponse } from "next/server";
import type { WaitlistRequest, WaitlistResponse } from "@/lib/types";

// TODO(backend): persist signups (Postgres, Supabase, etc.), validate
// twitter handle / email format, rate-limit by IP, and return real position.
//
// Frontend calls this from <Hero /> -> "Join Waitlist" button (currently
// a Twitter OAuth flow lives there, replace with real handler when ready).

export async function POST(req: Request): Promise<NextResponse<WaitlistResponse>> {
  let body: WaitlistRequest;
  try {
    body = (await req.json()) as WaitlistRequest;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!body.twitterHandle && !body.email) {
    return NextResponse.json(
      { ok: false, error: "twitter_handle_or_email_required" },
      { status: 400 },
    );
  }

  const position = 12_124;
  return NextResponse.json({ ok: true, position });
}
