"use client";

import type { RefObject } from "react";
import Image from "next/image";

import socialFeed from "../../public/cards/social-feed.png";
import browseMarkets from "../../public/cards/browse-markets.png";
import copyTrades from "../../public/cards/copy-trades.png";
import followPeople from "../../public/cards/follow-people.png";
import neverMiss from "../../public/cards/never-miss.png";
import easyOnboarding from "../../public/cards/easy-onboarding.png";
import moneyInOut from "../../public/cards/money-in-out.png";

type Feature = {
  title: string;
  description: string;
  image: typeof socialFeed;
  alt: string;
};

const FEATURES: Feature[] = [
  {
    title: "Social Feed",
    description: "See what people think. See what they're risking. Follow the ones who are right.",
    image: socialFeed,
    alt: "Social Feed",
  },
  {
    title: "Browse Markets Easily",
    description: "Politics. Crypto. World events. Pick your market and take a side.",
    image: browseMarkets,
    alt: "Browse Markets",
  },
  {
    title: "Get Paid on Copy Trades",
    description: "Post a Call. Get Paid When People Follow. Every copied trade earns you a cut.",
    image: copyTrades,
    alt: "Copy Trading",
  },
  {
    title: "Follow People",
    description: "Follow the best predictors. See every trade they make. Copy them in one tap.",
    image: followPeople,
    alt: "Follow People",
  },
  {
    title: "Never Miss a Move",
    description: "When someone trades, posts, or copies you — you know instantly.",
    image: neverMiss,
    alt: "Never Miss",
  },
  {
    title: "Easy Onboarding",
    description: "Sign in with Apple, Google, email, or phone. No crypto experience needed. Anyone can get in.",
    image: easyOnboarding,
    alt: "Easy Onboarding",
  },
  {
    title: "Money In, Money Out",
    description: "Apple Pay, card, or crypto. Deposit in seconds. Trade instantly. Withdraw whenever you want. It's always yours.",
    image: moneyInOut,
    alt: "Money In/Out",
  },
];

type FeatureScrollerProps = {
  scrollerRef?: RefObject<HTMLDivElement | null>;
};

export function FeatureScroller({ scrollerRef }: FeatureScrollerProps) {
  return (
    <div
      ref={scrollerRef}
      className="h-full no-scrollbar overflow-x-auto overflow-y-hidden"
    >
      <div className="flex h-full min-w-max overflow-hidden rounded-[19px] bg-white/45 backdrop-blur-[24px] border border-black/5 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        {FEATURES.map((feature, i) => (
          <div key={i} className="flex h-full">
            {/* Feature panel */}
            <div
              className="h-full flex flex-col overflow-hidden"
              style={{ width: ["331px","299px","405px","336px","386px","386px","386px"][i] }}
            >
              <div className="px-4 pt-[12px] pb-0 flex flex-col gap-[7px]">
                <h3 className="font-display text-[32px] leading-[1] font-light text-black tracking-[-0.48px]">
                  {feature.title}
                </h3>
                <p className="text-[13.4px] leading-normal text-black/40 font-medium tracking-[-0.48px] max-w-[300px]">
                  {feature.description}
                </p>
              </div>

              <div className="flex-1 relative mt-[7px]">
                <div className="relative w-full h-full overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.alt}
                    fill
                    className="object-contain object-top"
                    priority={i < 2}
                  />
                </div>
              </div>
            </div>

            {/* Vertical Divider (Ayraç) */}
            {i < FEATURES.length - 1 && (
              <div className="flex items-center justify-center shrink-0 w-[1px] h-full py-[12px]">
                <div className="w-[1px] h-full bg-black/5" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
