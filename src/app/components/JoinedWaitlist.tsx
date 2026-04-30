"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { XLogo } from "./icons/XLogo";

type Props = {
  username: string;
  position: number;
  avatarUrl: string;
  referralLink?: string;
  onLogout?: () => void;
};

type RenderedCardImage = {
  blob: Blob;
  dataUrl: string;
};

const FIGMA_RAINBOW_GRADIENT =
  "conic-gradient(from 90deg, rgb(255, 77, 158) -10%, rgb(255, 111, 119) -6.5385%, rgb(255, 146, 79) -3.0769%, rgb(255, 180, 40) 0.38462%, rgb(255, 197, 20) 2.1154%, rgb(255, 205, 10) 2.9808%, rgb(255, 214, 0) 3.8462%, rgb(255, 176, 0) 12.923%, rgb(255, 138, 0) 22%, rgb(255, 121, 16) 24.25%, rgb(255, 104, 32) 26.5%, rgb(255, 69, 64) 31%, rgb(255, 35, 96) 35.5%, rgb(255, 17, 112) 37.75%, rgb(255, 0, 128) 40%, rgb(223, 18, 144) 41.875%, rgb(191, 36, 160) 43.75%, rgb(159, 54, 176) 45.625%, rgb(128, 72, 192) 47.5%, rgb(96, 90, 207) 49.375%, rgb(64, 108, 223) 51.25%, rgb(32, 126, 239) 53.125%, rgb(16, 135, 247) 54.063%, rgb(0, 144, 255) 55%, rgb(0, 200, 197) 63.5%, rgb(0, 255, 139) 72%, rgb(16, 244, 140) 73.125%, rgb(32, 233, 141) 74.25%, rgb(64, 211, 144) 76.5%, rgb(96, 188, 146) 78.75%, rgb(128, 166, 148) 81%, rgb(191, 122, 153) 85.5%, rgb(255, 77, 158) 90%, rgb(255, 111, 119) 93.462%, rgb(255, 146, 79) 96.923%, rgb(255, 180, 40) 100.38%, rgb(255, 197, 20) 102.12%, rgb(255, 205, 10) 102.98%, rgb(255, 214, 0) 103.85%)";

function dataUrlToBlob(dataUrl: string) {
  const [header, payload] = dataUrl.split(",");
  const mime = header.match(/^data:(.*?);base64$/)?.[1] ?? "image/png";
  const binary = window.atob(payload);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Blob([bytes], { type: mime });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function canvasSafeImageUrl(src: string) {
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return `/api/avatar?url=${encodeURIComponent(src)}`;
  }

  return src || "/avatar.png";
}

function normalizeShareUrlForX(url: string) {
  return url.replace(/^https:\/\/perminal\.com(?=\/|$)/, "https://www.perminal.com");
}

async function exportCanvas(canvas: HTMLCanvasElement): Promise<RenderedCardImage> {
  const dataUrl = canvas.toDataURL("image/png");
  const blob = dataUrlToBlob(dataUrl);

  return { blob, dataUrl };
}

async function renderCanvasCard(
  username: string,
  position: number,
  avatarUrl: string,
): Promise<RenderedCardImage> {
  await document.fonts?.ready;

  const scale = 4;
  const width = 299;
  const height = 168;
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas rendering is unavailable.");
  }

  const drawCard = async (includeAvatar: boolean) => {
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f5f5f5";
    roundRect(ctx, 0, 0, width, height, 24);
    ctx.fill();

    ctx.fillStyle = "#000000";
    ctx.font = "700 15px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("Perminal", 11, 20);

    const dashX = 93;
    const dashY = 18.4;
    const dashWidth = 24.6;
    const dashHeight = 5.7;
    const centerX = dashX + dashWidth / 2;
    const centerY = dashY + dashHeight / 2;
    const gradient = ctx.createConicGradient(Math.PI / 2, centerX, centerY);
    gradient.addColorStop(0, "rgb(255, 180, 40)");
    gradient.addColorStop(0.038462, "rgb(255, 214, 0)");
    gradient.addColorStop(0.22, "rgb(255, 138, 0)");
    gradient.addColorStop(0.4, "rgb(255, 0, 128)");
    gradient.addColorStop(0.475, "rgb(128, 72, 192)");
    gradient.addColorStop(0.55, "rgb(0, 144, 255)");
    gradient.addColorStop(0.72, "rgb(0, 255, 139)");
    gradient.addColorStop(0.81, "rgb(128, 166, 148)");
    gradient.addColorStop(0.9, "rgb(255, 77, 158)");
    gradient.addColorStop(1, "rgb(255, 180, 40)");
    
    ctx.fillStyle = gradient;
    
    // Blurred layer
    ctx.save();
    ctx.filter = "blur(0.52px)";
    ctx.fillRect(dashX, dashY, dashWidth, dashHeight);
    ctx.fill();
    ctx.restore();

    // Base layer
    ctx.fillRect(dashX, dashY, dashWidth, dashHeight);

    ctx.fillStyle = "#000000";
    ctx.font = "29px Garamond, Times New Roman, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Joined Waitlist", width / 2 + 0.73, 75);

    const rowY = 115;
    roundRect(ctx, 5.5, rowY, 215, 46, 23);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    roundRect(ctx, 228, rowY, 66, 46, 23);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    if (includeAvatar) {
      try {
        const avatar = await loadImage(canvasSafeImageUrl(avatarUrl));
        ctx.save();
        roundRect(ctx, 9, rowY + 3.5, 39, 39, 19.5);
        ctx.clip();
        ctx.drawImage(avatar, 9, rowY + 3.5, 39, 39);
        ctx.restore();
      } catch {
        ctx.fillStyle = "#e6e6e6";
        roundRect(ctx, 9, rowY + 3.5, 39, 39, 19.5);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = "#e6e6e6";
      roundRect(ctx, 9, rowY + 3.5, 39, 39, 19.5);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.font = "600 14.5px system-ui, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(username, 55, rowY + 23, 155);

    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.font = "500 12px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`#${position.toLocaleString("en-US")}`, 261, rowY + 23);
  };

  await drawCard(true);

  try {
    return await exportCanvas(canvas);
  } catch (err) {
    if (!(err instanceof DOMException) || err.name !== "SecurityError") {
      throw err;
    }

    await drawCard(false);
    return exportCanvas(canvas);
  }
}

function HeaderRainbowDash() {
  return (
    <svg
      width="48.132"
      height="11.619"
      viewBox="0 0 48.132 11.619"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="mb-[-0.6px] ml-[0.3px] block h-[2.9px] w-[12.03px] shrink-0"
    >
      <g clipPath="url(#joinedRainbowClip)">
        <g transform="matrix(-2.4066 7.1145e-17 -2.9472e-16 -0.58094 24.066 5.8094)">
          <foreignObject x="-190" y="-190" width="380" height="380">
            <div
              style={{
                backgroundImage: FIGMA_RAINBOW_GRADIENT,
                height: "100%",
                opacity: 1,
                width: "100%",
              }}
            />
          </foreignObject>
        </g>
      </g>
      <g filter="url(#joinedRainbowBlur)">
        <g clipPath="url(#joinedRainbowClip2)">
          <g transform="matrix(-2.4066 7.1145e-17 -2.9472e-16 -0.58094 24.066 5.8094)">
            <foreignObject x="-190" y="-190" width="380" height="380">
              <div
                style={{
                  backgroundImage: FIGMA_RAINBOW_GRADIENT,
                  height: "100%",
                  opacity: 1,
                  width: "100%",
                }}
              />
            </foreignObject>
          </g>
        </g>
      </g>
      <defs>
        <clipPath id="joinedRainbowClip">
          <rect width="48.132" height="11.619" />
        </clipPath>
        <clipPath id="joinedRainbowClip2">
          <rect width="48.132" height="11.619" />
        </clipPath>
        <filter
          id="joinedRainbowBlur"
          x="-2.073"
          y="-2.073"
          width="52.278"
          height="15.765"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="2.073" result="effect1_foregroundBlur" />
        </filter>
      </defs>
    </svg>
  );
}

/**
 * "Joined Waitlist" confirmation card — shown after a successful signup.
 * Figma node 2920:316015.
 *
 * Layout: preview card (left) + 3 action buttons stacked vertically (right).
 * The preview card doubles as the shareable image.
 */
export function JoinedWaitlist({
  username,
  position,
  avatarUrl,
  referralLink,
  onLogout,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const shareUrl = referralLink ?? `https://perminal.com/${username.replace("@", "")}`;
  const canonicalShareUrl = normalizeShareUrlForX(shareUrl);
  const xShareUrl = `${canonicalShareUrl}${canonicalShareUrl.includes("?") ? "&" : "?"}card=waitlist4`;
  const shareText = "I joined the Perminal waitlist. Use my invite link:";
  const fileName = `perminal-waitlist-${username.replace("@", "")}.png`;

  const renderCardImage = useCallback(async () => {
    if (cardRef.current) {
      try {
        const { toPng } = await import("html-to-image");
        const dataUrl = await toPng(cardRef.current, {
          pixelRatio: 4 / scale,
          cacheBust: true,
          backgroundColor: "#f5f5f5",
        });
        const blob = dataUrlToBlob(dataUrl);

        return { blob, dataUrl };
      } catch {
        // Fall back to canvas rendering below.
      }
    }

    return renderCanvasCard(username, position, avatarUrl);
  }, [avatarUrl, position, scale, username]);

  const downloadDataUrl = useCallback(
    (dataUrl: string) => {
      const link = document.createElement("a");
      link.download = fileName;
      link.href = dataUrl;
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
    [fileName],
  );

  const getXComposerUrl = useCallback(
    () =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(xShareUrl)}`,
    [shareText, xShareUrl],
  );

  const openXComposer = useCallback(() => {
    window.open(getXComposerUrl(), "_blank", "noopener,noreferrer");
  }, [getXComposerUrl]);

  const handleShareX = useCallback(() => {
    openXComposer();
  }, [openXComposer]);

  const [copied, setCopied] = useState(false);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers that don't support navigator.clipboard
      try {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy link", err);
      }
    }
  }, [shareUrl]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setScale(entry.contentRect.width / 299);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleDownload = useCallback(async () => {
    try {
      const rendered = await renderCardImage();
      if (!rendered) return;
      downloadDataUrl(rendered.dataUrl);
    } catch (err) {
      console.error("Failed to generate image", err);
    }
  }, [downloadDataUrl, renderCardImage]);

  return (
    <motion.div
      layout
      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      className="flex w-full flex-col items-center gap-2 md:w-auto md:flex-row md:rounded-[16px] md:bg-white md:p-2"
    >
      {/* ---- Responsive Preview card Wrapper ---- */}
      <motion.div 
        layout
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-[24px] bg-[#f5f5f5] aspect-[299/168] md:rounded-[14px] md:h-[168px] md:w-[299px]"
      >
        {/* Inner fixed-size card that scales up/down */}
        <div
          ref={cardRef}
          className="absolute left-0 top-0 flex flex-col origin-top-left"
          style={{
            width: 299,
            height: 168,
            transform: `scale(${scale})`,
          }}
        >
          {/* Top-left logo + rainbow */}
          <div className="absolute left-[10.5px] top-[9px] flex items-end gap-[1.2px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/perminal-wordmark.svg"
              alt="Perminal"
              className="pointer-events-none h-[17px] w-[89px] max-w-none"
            />
            <HeaderRainbowDash />
          </div>

          {/* Center text */}
          <div className="absolute left-[calc(50%+0.73px)] top-[75px] -translate-x-1/2 -translate-y-1/2 text-center">
            <span className="font-serif text-[29px] font-normal leading-[0.84] tracking-[-0.43px] text-black [-webkit-text-stroke:0.5px_black]">
              Joined Waitlist
            </span>
          </div>

          {/* Bottom row: avatar + username | position */}
          <div className="absolute bottom-0 left-0 flex w-full items-center justify-center p-[7px]">
            <div className="flex w-[288px] items-center gap-[7px]">
              <div className="flex h-[46px] flex-1 items-center gap-[7px] rounded-[40px] bg-white pl-[3.5px] pr-[14px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarUrl}
                  alt=""
                  className="size-[39px] rounded-full bg-[#e6e6e6] object-cover"
                />
                <span className="text-[14.5px] font-semibold tracking-[-0.46px] text-black/80">
                  {username}
                </span>
              </div>
              <div className="flex h-[46px] w-[66px] items-center justify-center rounded-[40px] bg-white">
                <span className="text-[12px] font-medium tracking-[-0.46px] text-black/80 opacity-40">
                  #{position.toLocaleString("en-US")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div layout className="flex w-full flex-row gap-1.5 md:w-auto md:flex-col">
        {/* Share */}
        <motion.button layout onClick={handleShareX} className="flex h-[38px] flex-1 items-center justify-center gap-1 rounded-full bg-[#36bf5a] px-1 transition active:scale-95 md:h-auto md:w-[130px] md:flex-none md:gap-[4px] md:px-[14px] md:py-[9px]">
          <XLogo size={12} className="shrink-0 md:h-[14px] md:w-[14px]" />
          <span className="text-[11px] font-medium text-white md:text-[13px] md:leading-4">
            Share
          </span>
        </motion.button>

        {/* Copy Link */}
        <motion.button 
          layout 
          onClick={handleCopyLink} 
          className={`flex h-[38px] flex-1 items-center justify-center gap-[4px] rounded-full px-1 transition active:scale-95 md:h-auto md:w-[130px] md:flex-none md:px-[14px] md:py-[9px] ${
            copied ? "bg-[#36bf5a] text-white" : "bg-[#f5f5f5] text-black"
          }`}
        >
          <span className="text-[11px] font-medium md:text-[13px] md:leading-4">
            {copied ? "Copied!" : "Copy Link"}
          </span>
        </motion.button>

        {/* Download */}
        <motion.button
          layout
          onClick={handleDownload}
          className="flex h-[38px] flex-1 items-center justify-center gap-[4px] rounded-full bg-[#f5f5f5] px-1 transition active:scale-95 md:h-auto md:w-[130px] md:flex-none md:px-[14px] md:py-[9px]"
        >
          <span className="text-[11px] font-medium text-black md:text-[13px] md:leading-4">
            Download
          </span>
        </motion.button>

        {/* Log Out */}
        <motion.button
          layout
          onClick={onLogout}
          className="flex h-[38px] flex-1 items-center justify-center gap-[4px] rounded-full bg-[#ff453a] px-1 transition active:scale-95 md:h-auto md:w-[130px] md:flex-none md:px-[14px] md:py-[9px]"
        >
          <span className="text-[11px] font-medium text-white md:text-[13px] md:leading-4">
            Log Out
          </span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
