export type LeaderboardEntry = {
  rank: number;
  username: string;
  avatarUrl: string;
  invites: number;
  isUser?: boolean;
};

export type CurrentUser = {
  rank: number;
  username: string;
  avatarUrl: string;
  invites: number;
  referralUrl: string;
};

export type FeatureCard = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
};

export type WaitlistRequest = {
  twitterHandle?: string;
  email?: string;
  referredBy?: string;
};

export type WaitlistResponse =
  | { ok: true; position: number }
  | { ok: false; error: string };
