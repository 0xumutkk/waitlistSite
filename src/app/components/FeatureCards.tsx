"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { FeatureCard } from "@/lib/types";

export function FeatureCards({ cards }: { cards: FeatureCard[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Track which card is most visible via IntersectionObserver
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const articles = Array.from(container.querySelectorAll("article"));
    const visibleSet = new Set<number>();

    const observer = new IntersectionObserver(
      (entries) => {
        let changed = false;
        for (const entry of entries) {
          const idx = articles.indexOf(entry.target as HTMLElement);
          if (idx < 0) continue;
          
          if (entry.isIntersecting) {
            visibleSet.add(idx);
            changed = true;
          } else {
            visibleSet.delete(idx);
            changed = true;
          }
        }
        
        if (changed && visibleSet.size > 0) {
          setActiveIndex(Math.min(...Array.from(visibleSet)));
        }
      },
      { root: container, threshold: 0.6 }
    );

    articles.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [cards.length]);

  const scrollTo = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const articles = container.querySelectorAll("article");
    const target = articles[index] as HTMLElement;
    if (target) {
      container.scrollTo({
        left: target.offsetLeft,
        behavior: "smooth",
      });
    }
  }, []);

  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = container;
    
    // Calculate how far we are from the left and right edges (capped at 40px)
    const leftAlpha = Math.min(1, scrollLeft / 40);
    const rightDistance = scrollWidth - clientWidth - scrollLeft;
    const rightAlpha = Math.min(1, Math.max(0, rightDistance) / 40);
    
    // When at 0, edge is fully solid (alpha 1). When scrolled past 40, edge is transparent (alpha 0).
    const mask = `linear-gradient(to right, rgba(0,0,0,${1 - leftAlpha}), black 40px, black calc(100% - 40px), rgba(0,0,0,${1 - rightAlpha}))`;
    
    container.style.maskImage = mask;
    container.style.webkitMaskImage = mask;
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, [handleScroll]);

  return (
    <section className="glass-soft relative flex flex-col items-center gap-2 overflow-hidden p-2">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="relative flex w-full snap-x snap-mandatory gap-2 overflow-x-auto"
        style={{ scrollbarWidth: "none" }}
      >
        {cards.map((c) => (
          <article
            key={c.id}
            className="flex w-[80vw] shrink-0 snap-start flex-col gap-2.5 overflow-hidden rounded-3xl bg-white p-2.5 sm:w-[411px]"
          >
            <div className="h-[284px] w-full overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.imageUrl}
                alt=""
                className="block h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-1 p-4">
              <h3 className="text-[18px] font-normal leading-[1.6] tracking-[-0.36px] text-black">
                {c.title}
              </h3>
              <p className="text-sm font-normal tracking-[-0.14px] text-ink-70">
                {c.description}
              </p>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination with Chevrons */}
      <div className="flex items-center justify-center gap-3 pb-1">
        <button
          onClick={() => scrollTo(Math.max(0, activeIndex - 1))}
          disabled={activeIndex === 0}
          className={`flex size-6 items-center justify-center rounded-full transition-all active:scale-95 ${
            activeIndex === 0
              ? "cursor-not-allowed opacity-30"
              : "opacity-60 hover:bg-black/5 hover:opacity-100"
          }`}
          aria-label="Previous card"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-black">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>

        <div className="flex items-center justify-center gap-1.5">
          {cards.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to card ${i + 1}`}
              onClick={() => scrollTo(i)}
              className={`rounded-full transition-all duration-200 ${
                i === activeIndex
                  ? "h-[6px] w-[18px] bg-black/70"
                  : "size-[6px] bg-black/20"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => scrollTo(Math.min(cards.length - 1, activeIndex + 1))}
          disabled={activeIndex === cards.length - 1}
          className={`flex size-6 items-center justify-center rounded-full transition-all active:scale-95 ${
            activeIndex === cards.length - 1
              ? "cursor-not-allowed opacity-30"
              : "opacity-60 hover:bg-black/5 hover:opacity-100"
          }`}
          aria-label="Next card"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-black">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>

      <style>{`
        .glass-soft :global(.snap-x)::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}
