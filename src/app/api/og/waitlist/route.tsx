import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

import { getDb } from "@/lib/server/db";

/* eslint-disable @next/next/no-img-element */

export const runtime = "nodejs";

function absoluteUrl(path: string, origin: string) {
  return new URL(path, origin).toString();
}

const CARD_SCALE = 4;
const CARD_WIDTH = 299 * CARD_SCALE;
const CARD_HEIGHT = 168 * CARD_SCALE;

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
            background: "#f5f5f5",
            display: "flex",
            height: CARD_HEIGHT,
            justifyContent: "center",
            position: "absolute",
            width: CARD_WIDTH,
          }}
        >
          <div
            style={{
              color: "#000000",
              fontFamily: "Inter, Arial, sans-serif",
              fontSize: 60,
              fontWeight: 700,
              left: 44,
              lineHeight: 1,
              position: "absolute",
              top: 24,
            }}
          >
            Perminal
          </div>

          <div
            style={{
              background:
                "linear-gradient(90deg, rgb(255, 180, 40) 0%, rgb(255, 214, 0) 4%, rgb(255, 138, 0) 22%, rgb(255, 0, 128) 40%, rgb(128, 72, 192) 47.5%, rgb(0, 144, 255) 55%, rgb(0, 255, 139) 72%, rgb(255, 77, 158) 90%, rgb(255, 214, 0) 100%)",
              filter: "blur(2px)",
              height: 22.8,
              left: 372,
              position: "absolute",
              top: 73.6,
              width: 98.4,
            }}
          />

          <div
            style={{
              background:
                "linear-gradient(90deg, rgb(255, 180, 40) 0%, rgb(255, 214, 0) 4%, rgb(255, 138, 0) 22%, rgb(255, 0, 128) 40%, rgb(128, 72, 192) 47.5%, rgb(0, 144, 255) 55%, rgb(0, 255, 139) 72%, rgb(255, 77, 158) 90%, rgb(255, 214, 0) 100%)",
              height: 22.8,
              left: 372,
              position: "absolute",
              top: 73.6,
              width: 98.4,
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
              top: 245,
            }}
          >
            Joined Waitlist
          </div>

          <div
            style={{
              alignItems: "center",
              display: "flex",
              gap: 28,
              height: 184,
              left: 22,
              position: "absolute",
              top: 460,
              width: 1152,
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
      height: CARD_HEIGHT,
      width: CARD_WIDTH,
    },
  );
}
