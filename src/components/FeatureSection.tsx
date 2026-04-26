"use client";

import { useEffect, useRef, useState } from "react";
import { FeatureScroller } from "./FeatureScroller";

const DOT_COUNT = 5;

export function FeatureSection() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const update = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      const progress = maxScroll > 0 ? el.scrollLeft / maxScroll : 0;
      setActiveDot(Math.round(progress * (DOT_COUNT - 1)));
    };

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const scrollByAmount = (direction: "left" | "right") => {
    const el = scrollerRef.current;
    if (!el) return;
    const scrollAmount = direction === "left" ? -320 : 320;
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const jumpToDot = (index: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const target = (index / (DOT_COUNT - 1)) * maxScroll;
    el.scrollTo({ left: target, behavior: "smooth" });
  };

  return (
    <div className="h-full flex flex-col bg-white/30 rounded-[12px] backdrop-blur-[24px] overflow-hidden">
      {/* Header bar with "Features" label */}
      <div className="h-[40px] flex items-center px-[16px] shrink-0">
        <h2 className="text-[14px] font-semibold text-black">Features</h2>
      </div>

      {/* Content area */}
      <div className="flex-1 min-h-0 px-[16px]">
        <FeatureScroller scrollerRef={scrollerRef} />
      </div>

      {/* Pagination bar: < ● ● ● ● ● > */}
      <div className="flex items-center justify-center gap-[8px] shrink-0 pt-[16px] pb-[16px]">
        {/* Left arrow */}
        <button
          type="button"
          onClick={() => scrollByAmount("left")}
          aria-label="Scroll left"
          className="flex items-center justify-center w-[24px] h-[16px] text-black/30 hover:text-black/60 transition-colors"
        >
          <svg width="6" height="16" viewBox="0 0 6 16" fill="none">
            <path d="M5 1L1 8L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Dots */}
        <div className="flex items-center gap-[4px]">
          {Array.from({ length: DOT_COUNT }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => jumpToDot(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === activeDot
                  ? "size-[10px] bg-black/60"
                  : "size-[10px] bg-black/10 hover:bg-black/25"
              }`}
            />
          ))}
        </div>

        {/* Right arrow */}
        <button
          type="button"
          onClick={() => scrollByAmount("right")}
          aria-label="Scroll right"
          className="flex items-center justify-center w-[24px] h-[16px] text-black/30 hover:text-black/60 transition-colors"
        >
          <svg width="6" height="16" viewBox="0 0 6 16" fill="none">
            <path d="M1 1L5 8L1 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
