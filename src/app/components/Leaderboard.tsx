"use client";

import { useState, useCallback } from "react";
import { CopyIcon } from "./icons/CopyIcon";
import { InviteIcon } from "./icons/InviteIcon";
import type { CurrentUser, LeaderboardEntry } from "@/lib/types";

type Props = {
  entries: LeaderboardEntry[];
  currentUser: CurrentUser | null;
};

export function Leaderboard({ entries, currentUser }: Props) {
  const [copied, setCopied] = useState(false);
  const isCurrentUserInEntries = entries.some((entry) => entry.isUser);

  const handleCopy = useCallback(async () => {
    if (!currentUser) return;
    try {
      await navigator.clipboard.writeText(currentUser.referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback — silently fail if clipboard is unavailable
    }
  }, [currentUser]);

  return (
    <aside className="glass-soft flex w-full shrink-0 flex-col items-center justify-between gap-4 p-2 lg:w-[384px]">
      <div className="w-full overflow-hidden rounded-[24px] border border-ink-15 bg-white">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr>
              <Th className="w-[72px]">Rank</Th>
              <Th className="w-[157px]">Username</Th>
              <Th>Invites</Th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              e.isUser ? (
                <YouRow
                  key={`${e.rank}-${e.username}`}
                  user={{
                    rank: e.rank,
                    username: e.username,
                    avatarUrl: e.avatarUrl,
                    invites: e.invites,
                    referralUrl: currentUser?.referralUrl ?? "",
                  }}
                />
              ) : (
                <Row key={`${e.rank}-${e.username}`} entry={e} />
              )
            ))}
            {currentUser && !isCurrentUserInEntries && <YouRow user={currentUser} />}
          </tbody>
        </table>
      </div>

      {currentUser && (
        <div className="flex w-full flex-col gap-2 px-1">
          <div className="text-sm font-medium leading-[14px] text-Black">
            Climb the Leaderboard
          </div>
          <p className="w-[356px] text-xs font-medium text-black">
            Share your Perminal referral link with friends and climb higher on
            the leaderboard. Being early pays off.
          </p>
          <button
            type="button"
            onClick={handleCopy}
            className="mt-2 flex h-10 w-full items-center justify-center rounded-[24px] bg-black/5 p-0.5 font-sans transition active:scale-[0.98]"
          >
            <span className="mr-1.5 text-sm font-medium text-black">
              {copied ? "Copied!" : currentUser.referralUrl}
            </span>
            <CopyIcon />
          </button>
        </div>
      )}
    </aside>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`h-[38px] border-b border-r border-ink-15 text-center text-base font-medium leading-[35px] tracking-[-0.48px] text-ink-50 last:border-r-0 ${className}`}
    >
      {children}
    </th>
  );
}

function Row({ entry }: { entry: LeaderboardEntry }) {
  return (
    <tr>
      <td className="h-14 border-b border-r border-ink-15 text-center text-base font-medium tracking-[-0.48px] text-ink-50">
        {entry.rank}
      </td>
      <td className="h-14 border-b border-r border-ink-15 text-center">
        <span className="inline-flex items-center gap-1 text-sm font-medium text-black/80">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={entry.avatarUrl}
            alt=""
            width={20}
            height={20}
            className="rounded-full bg-black/5"
          />
          {entry.username}
        </span>
      </td>
      <td className="h-14 border-b border-ink-15 text-center">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-black/80">
          <InviteIcon />
          {entry.invites}
        </span>
      </td>
    </tr>
  );
}

function YouRow({ user }: { user: CurrentUser }) {
  return (
    <tr className="bg-perminal-greenBright">
      <td className="h-14 border-r border-ink-15 text-center text-base font-medium tracking-[-0.48px] text-white last:rounded-bl-[24px] first:rounded-bl-[24px]">
        {user.rank.toLocaleString("en-US")}
      </td>
      <td className="h-14 border-r border-ink-15 text-center">
        <span className="inline-flex items-center gap-1 text-sm font-medium text-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.avatarUrl}
            alt=""
            width={20}
            height={20}
            className="rounded-full bg-black/5"
          />
          {user.username}
        </span>
      </td>
      <td className="h-14 rounded-br-[24px] text-center">
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white">
          <InviteIcon stroke="#ffffff" />
          {user.invites}
        </span>
      </td>
    </tr>
  );
}
