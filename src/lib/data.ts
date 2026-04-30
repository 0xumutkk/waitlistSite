import type { CurrentUser, FeatureCard, LeaderboardEntry } from "./types";

// TODO(backend): replace getLeaderboard / getCurrentUser with real DB queries.
// The shapes here are the contract — keep them stable or update lib/types.ts.

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  return Array.from({ length: 10 }, (_, i) => ({
    rank: i + 1,
    username: "User",
    avatarUrl: "/avatar.png",
    invites: 54,
  }));
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  return {
    rank: 12_123,
    username: "You",
    avatarUrl: "/avatar.png",
    invites: 54,
    referralUrl: "perminal.com/adilcreates",
  };
}

export const FEATURE_CARDS: FeatureCard[] = [
  {
    id: "social-feed",
    title: "Social Feed",
    description:
      "See what people think. See what they're trading. Follow the ones who are right. Your feed isn't noise. It's signal.",
    imageUrl: "/card1.png",
  },
  {
    id: "browse-markets",
    title: "Browse Markets Easily",
    description:
      "Politics. Crypto. Stocks. RWA. World events. Pick your market and take a side. Every market. One app.",
    imageUrl: "/card2.png",
  },
  {
    id: "copy-trades",
    title: "Get Paid on Copy Trades",
    description:
      "Post a call. Get paid when people follow. Refer a friend and earn on every trade they make. Forever.",
    imageUrl: "/card3.png",
  },
  {
    id: "follow-people",
    title: "Follow People",
    description:
      "Follow the best predictors. See every trade they make. Copy them in one tap.",
    imageUrl: "/card4.png",
  },
  {
    id: "never-miss",
    title: "Never Miss a Move",
    description:
      "When someone trades, posts, or copies you, you know instantly. Your reputation builds in real time.",
    imageUrl: "/card5.png",
  },
  {
    id: "easy-onboarding",
    title: "Easy Onboarding",
    description:
      "Sign in with Apple, Google, email, or phone. No crypto experience needed. Anyone can get in.",
    imageUrl: "/card6.png",
  },
  {
    id: "money-flow",
    title: "Money In, Money Out",
    description:
      "Apple Pay, card, or crypto. Deposit instantly. Withdraw whenever you want. Always yours.",
    imageUrl: "/card7.png",
  },
];
