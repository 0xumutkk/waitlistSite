"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LiquidGlassDefs } from "./components/LiquidGlassDefs";
import { Header } from "./components/Header";
import { Leaderboard } from "./components/Leaderboard";
import { Hero } from "./components/Hero";
import { FeatureCards } from "./components/FeatureCards";
import { HyperliquidLogo } from "./components/icons/HyperliquidLogo";
import { FEATURE_CARDS } from "@/lib/data";
import type {
  CurrentUser,
  LeaderboardEntry as UiLeaderboardEntry,
} from "@/lib/types";
import type {
  LeaderboardEntry as ApiLeaderboardEntry,
  MeResponse,
} from "@/lib/referrals/types";
import { usePerminalAuth } from "./providers";

const PENDING_WAITLIST_JOIN_KEY = "perminal:pending-waitlist-join";

function avatarSrc(src?: string | null) {
  if (!src) return "/avatar.png";
  if (src.startsWith("http://") || src.startsWith("https://")) {
    return `/api/avatar?url=${encodeURIComponent(src)}`;
  }
  return src;
}

export default function Page() {
  const [didRequestJoin, setDidRequestJoin] = useState(false);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [entries, setEntries] = useState<ApiLeaderboardEntry[]>([]);
  const syncInFlightRef = useRef<Promise<MeResponse | null> | null>(null);
  const { authenticated, getAccessToken, login, logout, ready } = usePerminalAuth();

  const authHeaders = useCallback(async (): Promise<HeadersInit> => {
    if (!authenticated) return {};

    const token = await getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [authenticated, getAccessToken]);

  const refreshLeaderboard = useCallback(async () => {
    const response = await fetch("/api/leaderboard?limit=10", {
      headers: await authHeaders(),
    });

    if (!response.ok) return;

    const data = (await response.json()) as { entries: ApiLeaderboardEntry[] };
    setEntries(data.entries);
  }, [authHeaders]);

  const syncUser = useCallback(async () => {
    if (syncInFlightRef.current) return syncInFlightRef.current;

    const syncTask = (async () => {
      const response = await fetch("/api/auth/sync", {
        method: "POST",
        headers: {
          ...(await authHeaders()),
          "Content-Type": "application/json",
        },
      });

      if (response.status === 429) {
        await refreshLeaderboard();
        return null;
      }

      if (!response.ok) {
        throw new Error("Failed to sync Privy user");
      }

      const synced = (await response.json()) as MeResponse;
      setMe(synced);
      await refreshLeaderboard();
      return synced;
    })();

    syncInFlightRef.current = syncTask;

    try {
      return await syncTask;
    } finally {
      syncInFlightRef.current = null;
    }
  }, [authHeaders, refreshLeaderboard]);

  useEffect(() => {
    queueMicrotask(() => {
      void refreshLeaderboard();
    });
  }, [refreshLeaderboard]);

  useEffect(() => {
    if (!ready || authenticated) return;

    queueMicrotask(() => {
      setMe(null);
      setDidRequestJoin(false);
      window.sessionStorage.removeItem(PENDING_WAITLIST_JOIN_KEY);
    });
  }, [authenticated, ready]);

  useEffect(() => {
    if (!ready || !authenticated) return;

    queueMicrotask(() => {
      const hasPendingJoin =
        didRequestJoin ||
        window.sessionStorage.getItem(PENDING_WAITLIST_JOIN_KEY) === "1";

      void syncUser()
        .then(() => {
          if (!hasPendingJoin) return;
          window.sessionStorage.removeItem(PENDING_WAITLIST_JOIN_KEY);
          setDidRequestJoin(false);
        })
        .catch(() => {
          window.sessionStorage.removeItem(PENDING_WAITLIST_JOIN_KEY);
          setDidRequestJoin(false);
        });
    });
  }, [authenticated, didRequestJoin, ready, syncUser]);

  const handleJoin = useCallback(() => {
    setDidRequestJoin(true);
    window.sessionStorage.setItem(PENDING_WAITLIST_JOIN_KEY, "1");

    if (authenticated) {
      void syncUser()
        .catch(() => null)
        .finally(() => {
          window.sessionStorage.removeItem(PENDING_WAITLIST_JOIN_KEY);
          setDidRequestJoin(false);
        });
      return;
    }

    login();
  }, [authenticated, login, syncUser]);

  const handleLogout = useCallback(() => {
    setMe(null);
    setDidRequestJoin(false);
    window.sessionStorage.removeItem(PENDING_WAITLIST_JOIN_KEY);
    void logout().finally(() => {
      void refreshLeaderboard();
    });
  }, [logout, refreshLeaderboard]);

  const uiEntries: UiLeaderboardEntry[] = useMemo(
    () =>
      entries.map((entry) => ({
          rank: entry.rank,
          username: entry.username,
          avatarUrl: avatarSrc(entry.avatarUrl),
          invites: entry.invites,
          isUser: entry.isUser,
        })),
    [entries],
  );

  const currentUser: CurrentUser | null = useMemo(() => {
    if (!me) return null;

    return {
      rank: me.rank,
      username: me.user.twitterUsername
        ? `@${me.user.twitterUsername}`
        : me.user.displayName,
      avatarUrl: avatarSrc(me.user.avatarUrl),
      invites: me.invites,
      referralUrl: me.referralLink,
    };
  }, [me]);

  const heroUser = useMemo(() => {
    if (!me) return null;

    return {
      position: me.rank,
      username: me.user.twitterUsername
        ? `@${me.user.twitterUsername}`
        : me.user.displayName,
      avatarUrl: avatarSrc(me.user.avatarUrl),
      referralLink: me.referralLink,
    };
  }, [me]);

  return (
    <>
      <LiquidGlassDefs />

      <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/bg.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      <main className="mx-auto flex min-h-[calc(100dvh-2rem)] w-[1258px] max-w-[calc(100%-32px)] flex-col gap-2 py-4 pb-12 lg:justify-center lg:pb-4">
        <Header />

        <section className="glass p-2">
          <div className="hidden h-[817px] items-stretch gap-2 lg:flex">
            <Leaderboard entries={uiEntries} currentUser={currentUser} />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Hero
                joined={authenticated ? heroUser : null}
                onJoin={handleJoin}
                onLogout={handleLogout}
              />
              <FeatureCards cards={FEATURE_CARDS} />
            </div>
          </div>

          <div className="flex flex-col gap-2 lg:hidden">
            <Hero
              joined={authenticated ? heroUser : null}
              onJoin={handleJoin}
              onLogout={handleLogout}
            />
            <FeatureCards cards={FEATURE_CARDS} />
            <Leaderboard entries={uiEntries} currentUser={currentUser} />
          </div>
        </section>

        <div className="flex items-center justify-center gap-1.5 pt-2">
          <span className="relative -translate-y-0.5 font-serif text-2xl font-normal tracking-[-0.48px] text-black [-webkit-text-stroke:0.4px_black]">
            Built on
          </span>
          <HyperliquidLogo className="h-[21px] w-[134px]" />
        </div>
      </main>
    </>
  );
}
