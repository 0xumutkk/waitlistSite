export type LocalUser = {
  id: string;
  privyUserId: string;
  email: string | null;
  twitterUsername: string | null;
  displayName: string;
  avatarUrl: string | null;
  referralCode: string;
  createdAt: string;
  lastLoginAt: string;
};

export type PrivyProfile = {
  privyUserId: string;
  email: string | null;
  twitterUsername: string | null;
  displayName: string;
  avatarUrl: string | null;
};

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  username: string;
  avatarUrl: string | null;
  referralCode: string;
  invites: number;
  isUser?: boolean;
};

export type MeResponse = {
  user: LocalUser;
  rank: number;
  invites: number;
  referralLink: string;
};

export type ReferralVisitInput = {
  referralCode: string;
  visitorFingerprintHash: string | null;
  ipHash: string | null;
  userAgentHash: string | null;
};

