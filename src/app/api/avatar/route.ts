import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

async function fallbackAvatar() {
  const bytes = await readFile(join(process.cwd(), "public", "avatar.png"));
  return new NextResponse(bytes, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
      "Content-Type": "image/png",
    },
  });
}

export async function GET(request: NextRequest) {
  const rawUrl = request.nextUrl.searchParams.get("url");
  if (!rawUrl) return fallbackAvatar();

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return fallbackAvatar();
  }

  if (url.protocol !== "https:") return fallbackAvatar();

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Perminal/1.0",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) return fallbackAvatar();

    const contentType = response.headers.get("content-type") ?? "image/jpeg";
    if (!contentType.startsWith("image/")) return fallbackAvatar();

    return new NextResponse(await response.arrayBuffer(), {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
        "Content-Type": contentType,
      },
    });
  } catch {
    return fallbackAvatar();
  }
}
