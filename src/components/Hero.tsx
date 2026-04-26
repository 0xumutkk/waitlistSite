"use client";

import { SuccessCard } from "./SuccessCard";

interface HeroProps {
  isJoined?: boolean;
  onJoin?: () => void;
  variant?: "desktop" | "mobile";
  username?: string;
  avatarUrl?: string | null;
  rank?: string;
  referralLink?: string;
  onCopyReferral?: () => void;
}

function CtaIcon({ isJoined }: { isJoined: boolean }) {
  if (isJoined) {
    return (
      <svg
        aria-hidden="true"
        className="h-full w-full"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M16.25 5.75L8.25 13.75L4.25 9.75"
          stroke="white"
          strokeWidth="2.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/x-logo-white.svg" alt="" className="absolute inset-0 h-full w-full" />
  );
}

export function Hero({ 
  isJoined = false, 
  onJoin, 
  variant = "desktop",
  username,
  avatarUrl,
  rank,
  referralLink,
  onCopyReferral
}: HeroProps) {
  const ctaText = "Join Waitlist";

  if (variant === "mobile") {
    return (
      <section
        className="relative h-[364px] w-full overflow-hidden rounded-[12px] bg-white/30 backdrop-blur-[24px]"
        data-node-id="265:8196"
        data-name="Heading 1"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hero-hands-transparent.png"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        <div className="absolute left-1/2 top-[110px] z-10 flex h-[100px] w-[291px] -translate-x-1/2 flex-col items-center">
          <h1 className="w-full text-center font-display text-[44px] font-light leading-[0.73] tracking-[-0.64px] text-black">
            Trade What Happens. Together.
          </h1>

          <div className="mt-[24px] flex h-[15.547px] items-center gap-[4.5px]" data-node-id="265:8185">
            <p className="h-[15.547px] w-[46.687px] font-display text-[18px] font-light leading-[15.5px] tracking-[-0.36px] text-black">
              Built on
            </p>
            <div className="relative h-[15.547px] w-[100.7px] shrink-0" data-name="HL logo_dark green 2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hyperliquid-logo-figma.svg"
                alt="Hyperliquid"
                className="absolute inset-0 h-full w-full max-w-none"
              />
            </div>
          </div>
        </div>

        <div
          className={`absolute left-1/2 z-10 flex -translate-x-1/2 flex-col items-center justify-center ${
            isJoined ? "top-[206px]" : "top-[226px]"
          }`}
        >
          {isJoined ? (
            <div className="origin-top scale-[0.72] min-[430px]:scale-[0.78] sm:scale-90">
              <SuccessCard 
                username={username}
                avatarUrl={avatarUrl}
                rank={rank}
                referralLink={referralLink}
                onCopyReferral={onCopyReferral}
              />
            </div>
          ) : (
            <div className="h-[52px] rounded-[18px] border border-[rgba(0,0,0,0.15)] bg-white p-2">
              <button
                onClick={onJoin}
                className="flex h-[36px] cursor-pointer items-center gap-[8px] rounded-[10px] border-none bg-[#36bf5a] py-[8px] pl-[12px] pr-[16px] no-underline transition-all hover:bg-[#2fa64e] active:scale-95"
              >
                <div className="relative size-[19.47px] shrink-0">
                  <CtaIcon isJoined={isJoined} />
                </div>
                <span className="whitespace-nowrap text-[15px] font-medium leading-[20px] text-white">
                  {ctaText}
                </span>
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative flex h-[391.405px] w-full flex-col items-center justify-center gap-[16px] overflow-hidden rounded-[12px] bg-white/30 py-[24px] backdrop-blur-[24px]"
      data-node-id="260:4577"
      data-name="Heading 1"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-hands-transparent.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-[24px]">
        <div className="relative h-[60.835px] w-[656.945px]">
          <div className="absolute inset-[-1.68%_-0.16%]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/trade-title.svg" alt="Trade What Happens. Together." className="block w-full h-full" />
          </div>
        </div>
        <div className="flex h-[23px] items-center gap-[6px]" data-node-id="260:4619">
          <p
            className="h-[23px] w-[62.25px] font-display text-[24px] font-light leading-[23px] tracking-[-0.48px] text-black"
            data-node-id="260:4620"
          >
            Built on
          </p>
          <div
            className="relative h-[20.729px] w-[134.267px] shrink-0"
            data-node-id="260:4621"
            data-name="HL logo_dark green 2"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/hyperliquid-logo-figma.svg"
              alt="Hyperliquid"
              className="absolute inset-0 h-full w-full max-w-none"
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 flex justify-center w-full">
        {isJoined ? (
          <div className="scale-[0.85] sm:scale-100 origin-top">
            <SuccessCard 
              username={username}
              avatarUrl={avatarUrl}
              rank={rank}
              referralLink={referralLink}
              onCopyReferral={onCopyReferral}
            />
          </div>
        ) : (
          <div className="bg-white p-2 rounded-[18px] border border-[rgba(0,0,0,0.15)]">
            <button
              onClick={onJoin}
              className="bg-[#36bf5a] hover:bg-[#2fa64e] active:scale-95 transition-all pl-[12px] pr-[16px] py-[8px] rounded-[10px] flex items-center gap-[8px] no-underline border-none cursor-pointer"
            >
              <div className="relative size-[19.47px] shrink-0">
                <CtaIcon isJoined={isJoined} />
              </div>
              <span className="text-white font-medium text-[15px] leading-[20px] whitespace-nowrap">
                {ctaText}
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
