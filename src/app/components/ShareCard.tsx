type Props = {
  username: string;
  position: number;
  avatarUrl: string;
};

/**
 * High-resolution 1200x675 share card.
 * Mathematically 4x scaled version of the JoinedWaitlist preview card.
 * Can be used for html-to-image export or as an OpenGraph template.
 */
export function ShareCard({ username, position, avatarUrl }: Props) {
  return (
    <div
      className="relative flex flex-col overflow-hidden bg-[#f5f5f5]"
      style={{
        width: 1200,
        height: 675,
      }}
    >
      {/* Top-left logo + rainbow */}
      <div className="absolute left-[42px] top-[42px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/perminal_card_logo.svg"
          alt="Perminal"
          className="pointer-events-none w-[448px] max-w-none -translate-x-[9.3%] -translate-y-[29.6%]"
        />
      </div>

      {/* Center text */}
      <div className="absolute left-[calc(50%+2.9px)] top-[301px] -translate-x-1/2 -translate-y-1/2 text-center">
        <span className="font-serif text-[116px] font-normal leading-[0.84] tracking-[-1.74px] text-black [-webkit-text-stroke:2px_black]">
          Joined Waitlist
        </span>
      </div>

      {/* Bottom row: avatar + username | position */}
      <div className="absolute bottom-0 left-0 flex w-full items-center justify-center p-[28px]">
        <div className="flex w-[1152px] items-center gap-[28px]">
          <div className="flex h-[184px] flex-1 items-center gap-[28px] rounded-[160px] bg-white pl-[14px] pr-[56px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt=""
              className="size-[158px] rounded-full bg-[#e6e6e6] object-cover"
            />
            <span className="text-[58px] font-semibold tracking-[-1.84px] text-black/80">
              {username}
            </span>
          </div>
          <div className="flex h-[184px] w-[264px] items-center justify-center rounded-[160px] bg-white">
            <span className="text-[48px] font-medium tracking-[-1.84px] text-black/80 opacity-40">
              #{position.toLocaleString("en-US")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
