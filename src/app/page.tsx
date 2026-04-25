"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { FeatureSection } from "@/components/FeatureSection";
import { Leaderboard } from "@/components/Leaderboard";
import { SuccessModal } from "@/components/SuccessModal";
import type { LeaderboardEntry, MeResponse } from "@/lib/referrals/types";
import { usePerminalAuth } from "./providers";

export default function Home() {
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [didRequestJoin, setDidRequestJoin] = useState(false);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(true);
  const { authenticated, getAccessToken, login, ready } = usePerminalAuth();
  const referralLink = me?.referralLink;

  const authHeaders = useCallback(async (): Promise<HeadersInit> => {
    if (!authenticated) return {};

    const token = await getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [authenticated, getAccessToken]);

  const refreshLeaderboard = useCallback(async () => {
    setIsLeaderboardLoading(true);

    try {
      const response = await fetch("/api/leaderboard?limit=10", {
        headers: await authHeaders(),
      });

      if (response.ok) {
        const data = (await response.json()) as { entries: LeaderboardEntry[] };
        setEntries(data.entries);
      }
    } finally {
      setIsLeaderboardLoading(false);
    }
  }, [authHeaders]);

  const syncUser = useCallback(async () => {
    const response = await fetch("/api/auth/sync", {
      method: "POST",
      headers: {
        ...(await authHeaders()),
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to sync Privy user");
    }

    const synced = (await response.json()) as MeResponse;
    setMe(synced);
    await refreshLeaderboard();
    return synced;
  }, [authHeaders, refreshLeaderboard]);

  useEffect(() => {
    queueMicrotask(() => void refreshLeaderboard());
  }, [refreshLeaderboard]);

  useEffect(() => {
    if (!ready || !authenticated) return;

    queueMicrotask(() => {
      void syncUser()
        .then(() => {
          if (didRequestJoin) setIsSuccessOpen(true);
        })
        .catch(() => {
          setDidRequestJoin(false);
        });
    });
  }, [authenticated, didRequestJoin, ready, syncUser]);

  const copyReferral = useCallback(() => {
    if (!referralLink) return;
    void navigator.clipboard.writeText(referralLink);
  }, [referralLink]);

  const handleJoin = useCallback(() => {
    setDidRequestJoin(true);

    if (authenticated) {
      void syncUser().then(() => setIsSuccessOpen(true));
      return;
    }

    login();
  }, [authenticated, login, syncUser]);

  const modalUsername = useMemo(() => {
    if (!me) return undefined;
    return me.user.twitterUsername ? `@${me.user.twitterUsername}` : me.user.displayName;
  }, [me]);

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#8FAAD9] px-4">
      <div aria-hidden="true" className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/thumbnail_bg.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1264px] flex-col gap-[17px] pt-[45px]">
        <div
          className="flex h-[68px] w-full flex-col justify-center overflow-hidden rounded-[12px] border border-black/10 bg-white/60 p-4 shadow-[0_24px_64px_rgba(0,0,0,0.1)] backdrop-blur-[24px]"
          data-node-id="260:4410"
          data-name="Wallet"
        >
          <Header />
        </div>

        <div
          className="flex h-[849px] w-full flex-col overflow-hidden rounded-[12px] border border-black/10 bg-white/25 p-4 shadow-[0_24px_64px_rgba(0,0,0,0.1)] backdrop-blur-[24px]"
          data-node-id="260:4428"
          data-name="Wallet"
        >
          <div className="flex h-[817px] w-full gap-[8px] overflow-hidden">
            <Leaderboard
              entries={entries}
              isLoading={isLeaderboardLoading}
              referralLink={referralLink}
              onCopyReferral={copyReferral}
            />

            <div className="flex h-full flex-1 flex-col gap-[8px] overflow-hidden">
              <Hero onJoin={handleJoin} />

              <div className="min-h-0 flex-1">
                <FeatureSection />
              </div>
            </div>
          </div>
        </div>
      </div>

      <SuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        username={modalUsername}
        rank={me ? `#${me.rank.toLocaleString()}` : undefined}
        referralLink={referralLink}
        onCopyReferral={copyReferral}
      />
    </main>
  );
}
