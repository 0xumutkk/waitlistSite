import { NextRequest, NextResponse } from "next/server";

import {
  REFERRAL_COOKIE_MAX_AGE,
  REFERRAL_COOKIE_NAME,
  createReferralCookieValue,
} from "@/lib/referrals/cookie";
import { hashAbuseSignal } from "@/lib/referrals/hash";
import { getDb } from "@/lib/server/db";
import { getClientIp, rateLimiter } from "@/lib/server/ratelimit";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ code: string }>;
};

function isSocialPreviewBot(userAgent: string | null) {
  if (!userAgent) return false;
  return /twitterbot|facebookexternalhit|slackbot|discordbot|linkedinbot|telegrambot|whatsapp|pinterest/i.test(
    userAgent,
  );
}

function createPreviewHtml(input: {
  code: string;
  title: string;
  description: string;
  imageUrl: string;
  pageUrl: string;
  redirectUrl?: string;
}) {
  const redirectHead = input.redirectUrl
    ? `<meta http-equiv="refresh" content="0; url=${input.redirectUrl}" />`
    : "";
  const redirectScript = input.redirectUrl
    ? `<script>window.location.replace(${JSON.stringify(input.redirectUrl)});</script>`
    : "";
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${input.title}</title>
  <meta name="description" content="${input.description}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${input.title}" />
  <meta property="og:description" content="${input.description}" />
  <meta property="og:url" content="${input.pageUrl}" />
  <meta property="og:image" content="${input.imageUrl}" />
  <meta property="og:image:secure_url" content="${input.imageUrl}" />
  <meta property="og:image:type" content="image/png" />
  <meta property="og:image:width" content="1196" />
  <meta property="og:image:height" content="672" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@useperminal" />
  <meta name="twitter:title" content="${input.title}" />
  <meta name="twitter:description" content="${input.description}" />
  <meta name="twitter:image" content="${input.imageUrl}" />
  <meta name="twitter:image:alt" content="Perminal joined waitlist card" />
  ${redirectHead}
</head>
<body>
  ${redirectScript}
  <a href="/r/${encodeURIComponent(input.code)}">${input.title}</a>
</body>
</html>`;
}

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

  const cardParam = request.nextUrl.searchParams.get("card");
  const isBot = isSocialPreviewBot(request.headers.get("user-agent"));

  // Serve OG HTML when card param is present (for both bots and humans)
  // or when the request looks like a social preview bot.
  if (cardParam || isBot) {
    const appUrl = request.nextUrl.origin.replace(/\/$/, "");
    const pageUrl = `${appUrl}${request.nextUrl.pathname}${request.nextUrl.search}`;
    const imageVersion = cardParam?.startsWith("waitlist") ? cardParam : "waitlist6";
    const imageUrl = `${appUrl}/api/og/waitlist/${encodeURIComponent(referralCode)}/${encodeURIComponent(imageVersion)}.png`;

    if (!isBot) {
      const clientIp = getClientIp(request.headers);
      const rl = await rateLimiter.referralVisit(clientIp, referralCode);
      if (rl.success) {
        await db.recordReferralVisit({
          referralCode,
          visitorFingerprintHash: hashAbuseSignal(request.cookies.get("perminal_visitor")?.value ?? null),
          ipHash: hashAbuseSignal(clientIp),
          userAgentHash: hashAbuseSignal(request.headers.get("user-agent")),
        });
      }
    }

    const htmlResponse = new NextResponse(
      createPreviewHtml({
        code: referralCode,
        title: "Perminal - Joined Waitlist",
        description: "I joined the Perminal waitlist. Use my invite link.",
        imageUrl,
        pageUrl,
        redirectUrl: !isBot ? `${appUrl}/` : undefined,
      }),
      {
        headers: {
          "Cache-Control": isBot ? "public, max-age=300" : "no-store",
          "Content-Type": "text/html; charset=utf-8",
        },
      },
    );

    if (!isBot) {
      htmlResponse.cookies.set(REFERRAL_COOKIE_NAME, createReferralCookieValue(referralCode), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: REFERRAL_COOKIE_MAX_AGE,
        path: "/",
      });
    }

    return htmlResponse;
  }

  const clientIp = getClientIp(request.headers);
  const rl = await rateLimiter.referralVisit(clientIp, referralCode);
  if (rl.success) {
    await db.recordReferralVisit({
      referralCode,
      visitorFingerprintHash: hashAbuseSignal(request.cookies.get("perminal_visitor")?.value ?? null),
      ipHash: hashAbuseSignal(clientIp),
      userAgentHash: hashAbuseSignal(request.headers.get("user-agent")),
    });
  }

  response.cookies.set(REFERRAL_COOKIE_NAME, createReferralCookieValue(referralCode), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: REFERRAL_COOKIE_MAX_AGE,
    path: "/",
  });

  return response;
}
