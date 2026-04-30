"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XLogo } from "./icons/XLogo";
import { JoinedWaitlist } from "./JoinedWaitlist";

type JoinedState = {
  position: number;
  username: string;
  avatarUrl: string;
  referralLink?: string;
} | null;

type HeroProps = {
  joined?: JoinedState;
  onJoin?: () => void;
  onLogout?: () => void;
};

export function Hero({ joined: externalJoined, onJoin, onLogout }: HeroProps) {
  const [localJoined, setLocalJoined] = useState<JoinedState>(null);
  const joined = externalJoined ?? localJoined;

  // TODO(backend): replace this stub with the real auth/waitlist flow.
  // Currently posts a fake handle to /api/waitlist so the dev can verify
  // the contract end-to-end before swapping in Twitter OAuth.
  async function handleJoin() {
    if (onJoin) {
      onJoin();
      return;
    }

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ twitterHandle: "adilcreates" }),
      });
      const data = await res.json();
      console.log("[waitlist] response:", data);
      if (data.ok) {
        setLocalJoined({
          position: data.position,
          username: "@adilcreates",
          avatarUrl: "/avatar.png",
        });
      }
    } catch (err) {
      console.error("[waitlist] error:", err);
    }
  }

  return (
    <motion.section
      layout
      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      className={`glass-soft flex flex-1 flex-col items-center justify-center text-center ${
        joined ? "gap-2 p-2 md:gap-4 md:py-6" : "gap-4 py-6"
      }`}
    >
      <AnimatePresence mode="popLayout">
        {!joined && (
          <motion.h1
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="font-serif text-[36px] font-normal leading-[0.85] tracking-[-1.92px] text-black lg:text-[48px] [-webkit-text-stroke:0.6px_black] lg:[-webkit-text-stroke:0.8px_black] md:block"
          >
            Trade What Happens.
            <br />
            Together.
          </motion.h1>
        )}
      </AnimatePresence>

      <AnimatePresence mode="popLayout">
        {joined ? (
          <motion.div
            key="joined"
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            className="w-full md:w-auto"
          >
            <JoinedWaitlist
              username={joined.username}
              position={joined.position}
              avatarUrl={joined.avatarUrl}
              referralLink={joined.referralLink}
              onLogout={onLogout}
            />
          </motion.div>
        ) : (
          <motion.div
            key="join-btn"
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="inline-block rounded-[14px] border border-ink-15 bg-white p-1"
          >
            <button
              type="button"
              onClick={handleJoin}
              className="flex w-[234px] items-center justify-center gap-2 rounded-[10px] bg-perminal-green py-2 pl-3 pr-4 transition active:scale-[0.98]"
            >
              <XLogo size={20} />
              <span className="text-[15px] font-medium leading-5 text-white">
                Join Waitlist
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
