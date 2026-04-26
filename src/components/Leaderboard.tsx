interface LeaderboardEntry {
  rank: number;
  username: string;
  invites: number;
  avatarUrl?: string | null;
  isUser?: boolean;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  isLoading?: boolean;
  referralLink?: string;
  onCopyReferral?: () => void;
}

const FALLBACK_ENTRIES: LeaderboardEntry[] = [
  { rank: 1, username: "Join to rank", invites: 0 },
  { rank: 2, username: "Invite friends", invites: 0 },
  { rank: 3, username: "Climb soon", invites: 0 },
];

export function Leaderboard({ entries, isLoading, referralLink, onCopyReferral }: LeaderboardProps) {
  const displayEntries = entries.length > 0 ? entries : FALLBACK_ENTRIES;
  const referralText = referralLink ?? "Sign in to claim your link";

  return (
    <div className="flex h-[817px] w-full flex-col justify-between overflow-hidden rounded-[12px] bg-white/60 p-[12px] md:h-full md:w-[370px]">
      <div className="flex w-full flex-col overflow-hidden rounded-[8px] border border-black/15 bg-transparent md:w-[346px]">
        {/* Header */}
        <div className="flex items-center w-full border-b border-black/15">
          <div className="w-[72px] h-[38px] flex items-center justify-center border-r border-black/15 px-2">
            <span className="text-[16px] font-medium text-black/50 tracking-[-0.48px]">Rank</span>
          </div>
          <div className="w-[157px] h-[38px] flex items-center justify-center border-r border-black/15 px-2">
            <span className="text-[16px] font-medium text-black/50 tracking-[-0.48px]">Username</span>
          </div>
          <div className="h-[38px] flex-1 flex items-center justify-center px-2 md:w-[117px] md:flex-none">
            <span className="text-[16px] font-medium text-black/50 tracking-[-0.48px]">Invites</span>
          </div>
        </div>
        
        {/* Scrollable list (or just rows) */}
        <div className="flex flex-col w-full">
          {displayEntries.map((entry, i) => {
            const isLast = i === displayEntries.length - 1;
            const bgClass = entry.isUser ? "bg-[#34c759]" : "bg-transparent";
            const textRankClass = entry.isUser ? "text-white" : "text-black/50";
            const textNameClass = entry.isUser ? "text-white" : "text-black/80";
            
            return (
              <div 
                key={i} 
                className={`flex items-center w-full border-b border-black/15 ${isLast ? 'border-b-0' : ''} ${bgClass}`}
              >
                <div className="w-[72px] h-[56px] flex items-center justify-center border-r border-black/15 px-2">
                  <span className={`text-[16px] font-medium tracking-[-0.48px] ${textRankClass}`}>
                    #{entry.rank.toLocaleString()}
                  </span>
                </div>
                
                <div className="w-[157px] h-[56px] flex items-center px-[8px] border-r border-black/15">
                  <div className="flex items-center gap-[4px] pl-2 w-full justify-center">
                    <div className="w-[20px] h-[20px] rounded-[41px] bg-black/5 relative overflow-hidden flex-shrink-0">
                      {entry.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={entry.avatarUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 bg-black/10" />
                      )}
                    </div>
                    <span className={`truncate text-[14px] font-medium leading-normal ${textNameClass}`}>
                      {entry.username}
                    </span>
                  </div>
                </div>
                
                <div className="h-[56px] flex-1 flex items-center justify-center px-[8px] md:w-[117px] md:flex-none">
                  <div className="flex items-center gap-[6px]">
                    <svg width="14" height="13" viewBox="0 0 14 13" fill="none" className={entry.isUser ? "text-white" : "text-[#4F84F6]"}>
                      <path d="M11.6667 1.625H2.33333C1.36683 1.625 0.583334 2.4085 0.583334 3.375V9.79167C0.583334 10.7582 1.36683 11.5417 2.33333 11.5417H11.6667C12.6332 11.5417 13.4167 10.7582 13.4167 9.79167V3.375C13.4167 2.4085 12.6332 1.625 11.6667 1.625Z" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M13.4167 3.375L7 7.75L0.583334 3.375" stroke="currentColor" strokeWidth="1.16667" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className={`text-[14px] font-medium leading-normal ${textNameClass}`}>
                      {entry.invites}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Referral Section */}
      <div className="flex flex-col gap-[16px] w-full pt-1">
        <div className="flex flex-col gap-[8px] w-full">
          <h3 className="text-[14px] font-medium text-[#34c759] leading-[14px]">Climb the Leaderboard</h3>
          <p className="text-[12px] font-medium text-[#898a8d] leading-normal w-[259px]">
            {isLoading
              ? "Loading leaderboard..."
              : "Share your Perminal referral link with friends and climb higher on the leaderboard"}
          </p>
        </div>
        
        <div className="w-full flex items-center">
          <div className="flex-1 h-[40px] bg-black/5 rounded-[8px] flex items-center justify-between px-[15px]">
            <span className="truncate pr-2 text-[14px] font-medium text-black leading-[22px]">{referralText}</span>
            <button
              onClick={onCopyReferral}
              disabled={!referralLink}
              aria-label="Copy referral link"
              className="text-black/60 hover:text-black disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4.5" y="4.5" width="8" height="8" rx="1.5" ry="1.5"/>
                <path d="M4.5 9.5H3C2.17157 9.5 1.5 8.82843 1.5 8V3C1.5 2.17157 2.17157 1.5 3 1.5H8C8.82843 1.5 9.5 2.17157 9.5 3V4.5"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
