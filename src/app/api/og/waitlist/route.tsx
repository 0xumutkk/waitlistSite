import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

import { getDb } from "@/lib/server/db";

/* eslint-disable @next/next/no-img-element */

export const runtime = "nodejs";

function absoluteUrl(path: string, origin: string) {
  return new URL(path, origin).toString();
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")?.trim();
  const origin = request.nextUrl.origin;
  const db = getDb();
  const user = code ? await db.getUserByReferralCode(code) : null;

  const username = user?.twitterUsername
    ? `@${user.twitterUsername}`
    : user?.displayName ?? "Perminal user";
  const me = user ? await db.getMe(user.id, origin) : null;
  const rank = me?.rank ?? 0;
  const avatarUrl = user?.avatarUrl
    ? absoluteUrl(`/api/avatar?url=${encodeURIComponent(user.avatarUrl)}`, origin)
    : absoluteUrl("/avatar.png", origin);

  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#f5f5f5",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          position: "relative",
          width: "100%",
        }}
      >
        <img
          alt="Perminal"
          src={absoluteUrl("/perminal_card_logo.svg", origin)}
          style={{
            height: 120,
            left: 20,
            objectFit: "contain",
            position: "absolute",
            top: 4,
            width: 448,
          }}
        />

        <div
          style={{
            color: "#000000",
            fontFamily: "Georgia, serif",
            fontSize: 116,
            letterSpacing: -1.74,
            lineHeight: 0.84,
            position: "absolute",
            top: 250,
          }}
        >
          Joined Waitlist
        </div>

        <div
          style={{
            alignItems: "center",
            bottom: 28,
            display: "flex",
            gap: 28,
            height: 184,
            left: 28,
            position: "absolute",
            width: 1144,
          }}
        >
          <div
            style={{
              alignItems: "center",
              background: "#ffffff",
              borderRadius: 160,
              display: "flex",
              flex: 1,
              gap: 28,
              height: 184,
              padding: "14px 56px 14px 14px",
            }}
          >
            <img
              alt=""
              src={avatarUrl}
              style={{
                borderRadius: 999,
                height: 158,
                objectFit: "cover",
                width: 158,
              }}
            />
            <div
              style={{
                color: "rgba(0,0,0,0.8)",
                fontFamily: "Inter, Arial, sans-serif",
                fontSize: 58,
                fontWeight: 600,
              }}
            >
              {username}
            </div>
          </div>

          <div
            style={{
              alignItems: "center",
              background: "#ffffff",
              borderRadius: 160,
              display: "flex",
              height: 184,
              justifyContent: "center",
              width: 264,
            }}
          >
            <div
              style={{
                color: "rgba(0,0,0,0.4)",
                fontFamily: "Inter, Arial, sans-serif",
                fontSize: 48,
                fontWeight: 500,
              }}
            >
              {rank ? `#${rank.toLocaleString("en-US")}` : "#---"}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      height: 675,
      width: 1200,
    },
  );
}
