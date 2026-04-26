"use client";

import Image from "next/image";

export interface SuccessCardProps {
  username?: string;
  rank?: string;
  referralLink?: string;
  onCopyReferral?: () => void;
}

const UNDERLINE_GRADIENT =
  "linear-gradient(90deg, #FFB428 0%, #FFD600 20%, #00FF8B 40%, #0090FF 60%, #FF0080 80%, #FF4D9E 100%)";

export function SuccessCard({
  username = "@adilcreates",
  rank = "#12,234",
  referralLink,
  onCopyReferral,
}: SuccessCardProps) {
  const shareUrl = referralLink
    ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        "I joined the Perminal waitlist. Use my invite link:"
      )}&url=${encodeURIComponent(referralLink)}`
    : "https://x.com/perminal";

  return (
    <div
      className="relative flex items-start justify-end gap-[6px] rounded-[13.5px] border-[0.75px] border-black/15 bg-white p-[6px] shadow-[0_3px_3px_rgba(0,0,0,0.1)]"
      data-node-id="264:5456"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="relative h-[178.038px] w-[340.2px] shrink-0 overflow-hidden rounded-[9px] bg-[#f5f5f5]">
        <div className="absolute left-0 top-0 flex items-end gap-[1.288px] p-[12px]">
          <div className="relative h-[16.909px] w-[88.571px] shrink-0">
            <Image
              src="/perminal-wordmark.svg"
              alt="Perminal"
              fill
              priority
              className="object-fill"
            />
          </div>
          <div className="relative h-[3.294px] w-[13.645px] shrink-0">
            <div
              className="absolute inset-0"
              style={{ background: UNDERLINE_GRADIENT }}
            />
            <div
              className="absolute inset-0 blur-[0.588px]"
              style={{ background: UNDERLINE_GRADIENT }}
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

      <div className="flex h-[177.75px] w-[97.5px] shrink-0 flex-col gap-[6px]">
        <a
          href={shareUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="flex min-h-0 flex-1 items-start overflow-hidden rounded-[7.5px] bg-[#36bf5a] py-[6px] pl-[6px] pr-[12px] text-white transition-colors hover:bg-[#2fa64e]"
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
        </a>

        <button
          type="button"
          onClick={onCopyReferral}
          className="flex min-h-0 flex-1 items-start overflow-hidden rounded-[7.5px] bg-[#f5f5f5] py-[6px] pl-[9px] pr-[12px] text-left text-black transition-colors hover:bg-[#ebebeb]"
        >
          <span className="whitespace-nowrap text-[11.25px] font-medium leading-[15px]">
            Copy Link
          </span>
        </button>

        <button
          type="button"
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
