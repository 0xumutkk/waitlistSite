"use client";

interface HeroProps {
  onJoin?: () => void;
}

export function Hero({ onJoin }: HeroProps) {
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

      <div className="relative z-10 bg-white p-2 rounded-[18px] border border-[rgba(0,0,0,0.15)]">
        <button
          onClick={onJoin}
          className="bg-[#36bf5a] hover:bg-[#2fa64e] active:scale-95 transition-all pl-[12px] pr-[16px] py-[8px] rounded-[10px] flex items-center gap-[8px] no-underline border-none cursor-pointer"
        >
          <div className="size-[19.47px] relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/x-logo-white.svg" alt="" className="absolute inset-0 w-full h-full" />
          </div>
          <span className="text-white font-medium text-[15px] leading-[20px] whitespace-nowrap">
            Join Waitlist
          </span>
        </button>
      </div>
    </section>
  );
}
