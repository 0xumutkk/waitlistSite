"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

export interface SuccessCardProps {
  username?: string;
  rank?: string;
  referralLink?: string;
  onCopyReferral?: () => void;
}

const UNDERLINE_BACKGROUND_IMAGE =
  "url('data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 13.645 3.2939\\' preserveAspectRatio=\\'none\\'><g transform=\\'matrix(-0.68227 2.0169e-17 -8.3553e-17 -0.1647 6.8227 1.647)\\'><foreignObject x=\\'-190\\' y=\\'-190\\' width=\\'380\\' height=\\'380\\'><div xmlns=\\'http://www.w3.org/1999/xhtml\\' style=\\'background-image: conic-gradient(from 90deg, rgb(255, 77, 158) -10%, rgb(255, 111, 119) -6.5385%, rgb(255, 146, 79) -3.0769%, rgb(255, 180, 40) 0.38462%, rgb(255, 197, 20) 2.1154%, rgb(255, 205, 10) 2.9808%, rgb(255, 214, 0) 3.8462%, rgb(255, 176, 0) 12.923%, rgb(255, 138, 0) 22%, rgb(255, 121, 16) 24.25%, rgb(255, 104, 32) 26.5%, rgb(255, 69, 64) 31%, rgb(255, 35, 96) 35.5%, rgb(255, 17, 112) 37.75%, rgb(255, 0, 128) 40%, rgb(223, 18, 144) 41.875%, rgb(191, 36, 160) 43.75%, rgb(159, 54, 176) 45.625%, rgb(128, 72, 192) 47.5%, rgb(96, 90, 207) 49.375%, rgb(64, 108, 223) 51.25%, rgb(32, 126, 239) 53.125%, rgb(16, 135, 247) 54.063%, rgb(0, 144, 255) 55%, rgb(0, 200, 197) 63.5%, rgb(0, 255, 139) 72%, rgb(16, 244, 140) 73.125%, rgb(32, 233, 141) 74.25%, rgb(64, 211, 144) 76.5%, rgb(96, 188, 146) 78.75%, rgb(128, 166, 148) 81%, rgb(191, 122, 153) 85.5%, rgb(255, 77, 158) 90%, rgb(255, 111, 119) 93.462%, rgb(255, 146, 79) 96.923%, rgb(255, 180, 40) 100.38%, rgb(255, 197, 20) 102.12%, rgb(255, 205, 10) 102.98%, rgb(255, 214, 0) 103.85%); opacity:1; height: 100%; width: 100%;\\'></div></foreignObject></g></svg>')";

const GRADIENT_STOPS: [number, string][] = [
  [0, "#FFB428"],
  [0.2, "#FFD600"],
  [0.4, "#00FF8B"],
  [0.6, "#0090FF"],
  [0.8, "#FF0080"],
  [1, "#FF4D9E"],
];

function getXShareUrl(referralLink: string): string {
  const text = "I joined the Perminal waitlist. Use my invite link:";
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`;
}

async function copyTextToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  textArea.style.top = "0";
  document.body.appendChild(textArea);
  textArea.select();

  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(textArea);
  }
}

/* ── Canvas-based card renderer ─────────────────────────────────── */

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

async function renderCardToBlob(
  username: string,
  rank: string,
): Promise<Blob | null> {
  const S = 2; // retina scale
  const W = 340;
  const H = 178;
  const canvas = document.createElement("canvas");
  canvas.width = W * S;
  canvas.height = H * S;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.scale(S, S);

  // Background
  ctx.fillStyle = "#f5f5f5";
  roundRect(ctx, 0, 0, W, H, 9);
  ctx.fill();

  // Logo
  try {
    const logo = await loadImg("/perminal-wordmark.svg");
    ctx.drawImage(logo, 12, 12, 88.57, 16.91);
  } catch {
    // silently skip logo
  }

  // Rainbow underline
  const grad = ctx.createLinearGradient(12, 0, 12 + 13.6, 0);
  for (const [stop, color] of GRADIENT_STOPS) {
    grad.addColorStop(stop, color);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(12, 29.3, 13.6, 3.3);

  // "Joined Waitlist" text
  ctx.fillStyle = "#000000";
  ctx.font = "300 33px 'Inter', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Joined", W / 2, 55);
  ctx.fillText("Waitlist", W / 2, 88);

  // Bottom white pill - username
  const pillY = 118.5;
  const pillH = 52.6;
  const pillR = 15.7;

  // User pill background
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, 6.8, pillY, 244, pillH, pillR);
  ctx.fill();

  // Avatar
  try {
    const avatar = await loadImg("/waitlist-avatar.png");
    ctx.save();
    roundRect(ctx, 10.7, pillY + 3.9, 44.7, 44.7, 11.8);
    ctx.clip();
    ctx.drawImage(avatar, 10.7, pillY + 3.9, 44.7, 44.7);
    ctx.restore();
  } catch {
    // grey placeholder
    ctx.fillStyle = "#e6e6e6";
    roundRect(ctx, 10.7, pillY + 3.9, 44.7, 44.7, 11.8);
    ctx.fill();
  }

  // Username text
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.font = "600 16.5px 'Inter', sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(username, 63, pillY + pillH / 2);

  // Rank pill background
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, 258.6, pillY, 74.8, pillH, pillR);
  ctx.fill();

  // Rank text
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.font = "500 13.6px 'Inter', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(rank, 258.6 + 74.8 / 2, pillY + pillH / 2);

  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/png"),
  );
}

/* ── Component ──────────────────────────────────────────────────── */

export function SuccessCard({
  username = "@adilcreates",
  rank = "#12,234",
  referralLink,
}: SuccessCardProps) {
  const busyRef = useRef(false);
  const copyResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copyLabel, setCopyLabel] = useState("Copy Link");
  const hasReferralLink = Boolean(referralLink);

  const getBlob = useCallback(
    () => renderCardToBlob(username, rank),
    [username, rank],
  );

  const handleShareOnX = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (!referralLink) return;

      window.open(getXShareUrl(referralLink), "_blank", "noopener,noreferrer");
    },
    [referralLink],
  );

  const handleCopyReferral = useCallback(async () => {
    if (!referralLink) return;

    try {
      await copyTextToClipboard(referralLink);
      setCopyLabel("Copied");

      if (copyResetRef.current) {
        clearTimeout(copyResetRef.current);
      }
      copyResetRef.current = setTimeout(() => setCopyLabel("Copy Link"), 1600);
    } catch (error) {
      console.error("Failed to copy referral link", error);
      setCopyLabel("Copy Failed");

      if (copyResetRef.current) {
        clearTimeout(copyResetRef.current);
      }
      copyResetRef.current = setTimeout(() => setCopyLabel("Copy Link"), 1600);
    }
  }, [referralLink]);

  const handleDownload = useCallback(async () => {
    if (busyRef.current) return;
    busyRef.current = true;

    try {
      const blob = await getBlob();
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "perminal-waitlist.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download image", err);
    } finally {
      busyRef.current = false;
    }
  }, [getBlob]);

  return (
    <div
      className="relative flex items-start justify-end gap-[6px] rounded-[13.5px] border-[0.75px] border-black/15 bg-white p-[6px] shadow-[0_3px_3px_rgba(0,0,0,0.1)]"
      data-node-id="264:5456"
      onClick={(event) => event.stopPropagation()}
    >
      {/* Visual card (display only) */}
      <div className="relative h-[178.038px] w-[340.2px] shrink-0 overflow-hidden rounded-[9px] bg-[#f5f5f5]">
        <div className="absolute left-0 top-0 flex items-end gap-[1.288px] p-[12px]">
          <div className="relative h-[16.909px] w-[88.571px] shrink-0">
            <Image
              src="/perminal-wordmark.svg"
              alt="Perminal"
              fill
              className="object-fill"
            />
          </div>
          <div className="relative h-[3.294px] w-[13.645px] shrink-0">
            <div
              className="absolute inset-0"
              data-node-id="264:5482"
              style={{ backgroundImage: UNDERLINE_BACKGROUND_IMAGE }}
            />
            <div
              className="absolute inset-0 blur-[0.588px]"
              data-node-id="264:5483"
              style={{ backgroundImage: UNDERLINE_BACKGROUND_IMAGE }}
            />
          </div>
        </div>

        <div className="absolute left-1/2 top-[74.17px] flex h-[66.79px] w-[153.617px] -translate-x-1/2 -translate-y-1/2 flex-col justify-center text-center font-display text-[32.881px] font-light leading-[0] tracking-[-0.4932px] text-black">
          <p className="leading-[83.59%]">Joined Waitlist</p>
        </div>

        <div className="absolute left-0 top-[111.7px] p-[6.804px]">
          <div className="flex w-[326.592px] gap-[7.849px]">
            <div className="flex h-[52.591px] min-w-0 flex-1 items-center overflow-hidden rounded-[15.699px] bg-white py-[12.559px] pl-[3.925px] pr-[15.699px]">
              <div className="flex items-center gap-[7.849px]">
                <div className="relative size-[44.741px] shrink-0 overflow-hidden rounded-[11.774px] bg-[#e6e6e6]">
                  <Image
                    src="/waitlist-avatar.png"
                    alt=""
                    fill
                    className="object-cover object-[50%_54%]"
                  />
                </div>
                <p className="whitespace-nowrap text-center text-[16.484px] font-semibold leading-normal tracking-[-0.5233px] text-black/80">
                  {username}
                </p>
              </div>
            </div>

            <div className="flex h-[52.731px] w-[74.844px] shrink-0 items-center justify-center overflow-hidden rounded-[15.699px] bg-white px-[6.804px] py-[12.559px]">
              <p className="whitespace-nowrap text-center text-[13.608px] font-medium leading-normal tracking-[-0.5233px] text-black/40">
                {rank}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex h-[177.75px] w-[97.5px] shrink-0 flex-col gap-[6px]">
        <button
          type="button"
          onClick={handleShareOnX}
          disabled={!hasReferralLink}
          aria-label="Share referral link on X"
          className="flex min-h-0 flex-1 items-start overflow-hidden rounded-[7.5px] bg-[#36bf5a] py-[6px] pl-[6px] pr-[12px] text-white transition-colors hover:bg-[#2fa64e] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="flex items-center gap-[3px]">
            <span className="relative size-[14.603px] shrink-0">
              <Image
                src="/x-share-icon.svg"
                alt=""
                fill
                className="object-contain"
              />
            </span>
            <span className="whitespace-nowrap text-[11.25px] font-medium leading-[15px]">
              Share on X
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={handleCopyReferral}
          disabled={!hasReferralLink}
          aria-live="polite"
          className="flex min-h-0 flex-1 items-start overflow-hidden rounded-[7.5px] bg-[#f5f5f5] py-[6px] pl-[9px] pr-[12px] text-left text-black transition-colors hover:bg-[#ebebeb] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="whitespace-nowrap text-[11.25px] font-medium leading-[15px]">
            {copyLabel}
          </span>
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="flex min-h-0 flex-1 items-start overflow-hidden rounded-[7.5px] bg-[#f5f5f5] py-[6px] pl-[9px] pr-[12px] text-left text-black transition-colors hover:bg-[#ebebeb]"
        >
          <span className="whitespace-nowrap text-[11.25px] font-medium leading-[15px]">
            Download
          </span>
        </button>
      </div>
    </div>
  );
}
