"use client";

import Image from "next/image";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  username?: string;
  rank?: string;
  referralLink?: string;
  onCopyReferral?: () => void;
}

export function SuccessModal({
  isOpen,
  onClose,
  username = "Perminal user",
  rank = "#--",
  referralLink,
  onCopyReferral,
}: SuccessModalProps) {
  if (!isOpen) return null;

  const shareUrl = referralLink
    ? `https://twitter.com/intent/tweet?text=${encodeURIComponent("I joined the Perminal waitlist. Use my invite link:")}&url=${encodeURIComponent(referralLink)}`
    : "https://x.com/perminal";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/5 backdrop-blur-[2px]" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div 
        className="relative bg-white border-[0.75px] border-black/15 p-[6px] rounded-[13.5px] shadow-[0_3px_6px_rgba(0,0,0,0.1)] flex gap-[6px] animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button (Figma showed an X at the top right of the whole layout, but adding one here for usability) */}
        <button 
          onClick={onClose}
          className="absolute -top-2 -right-2 size-6 bg-white border border-black/10 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors z-10"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1 1L9 9M9 1L1 9" stroke="black" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Preview Area (Left) */}
        <div className="bg-[#f5f5f5] w-[340px] h-[178px] rounded-[9px] relative overflow-hidden flex flex-col">
          {/* Logo at top left */}
          <div className="absolute top-3 left-3 flex items-end gap-[1.3px]">
             <div className="relative w-[88.5px] h-[17px]">
                <Image 
                  src="/perminal-wordmark.svg" 
                  alt="Perminal" 
                  width={88.5} 
                  height={17}
                  className="h-[17px] w-auto"
                />
             </div>
             {/* Rainbow Underline */}
             <div className="relative h-[3.3px] w-[13.6px] mb-[0.6px]">
               {/* Base gradient layer */}
               <div 
                 className="absolute inset-0"
                 style={{ background: "linear-gradient(90deg, #FFB428 0%, #FFD600 20%, #00FF8B 40%, #0090FF 60%, #FF0080 80%, #FF4D9E 100%)" }}
               />
               {/* Blur layer for glow effect */}
               <div 
                 className="absolute inset-0 blur-[0.6px]"
                 style={{ background: "linear-gradient(90deg, #FFB428 0%, #FFD600 20%, #00FF8B 40%, #0090FF 60%, #FF0080 80%, #FF4D9E 100%)" }}
               />
             </div>
          </div>

          {/* Center Text */}
          <div className="flex-1 flex items-center justify-center pt-2">
            <h2 className="font-display text-[33px] font-light tracking-[-0.5px] text-black leading-[0.85]">
              Joined Waitlist
            </h2>
          </div>

          {/* Bottom Pills */}
          <div className="p-[7px] flex gap-2">
            {/* User Pill */}
            <div className="flex-1 h-[53px] bg-white rounded-[15.7px] flex items-center pl-[4px] pr-[16px] gap-2 shadow-sm border border-black/5">
              <div className="size-[45px] rounded-[11.8px] bg-[#e6e6e6] overflow-hidden relative">
                 <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white text-[10px]">
                    {/* Placeholder for PFP */}
                    PFP
                 </div>
              </div>
              <span className="text-[16.5px] font-semibold text-black/80 tracking-[-0.5px]">
                {username}
              </span>
            </div>

            {/* Rank Pill */}
            <div className="w-[75px] h-[53px] bg-white rounded-[15.7px] flex items-center justify-center shadow-sm border border-black/5">
              <span className="text-[13.6px] font-medium text-black/40 tracking-[-0.5px]">
                {rank}
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Actions (Right) */}
        <div className="w-[98px] flex flex-col gap-[6px]">
          {/* Share on X */}
          <a
            href={shareUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="flex-1 bg-[#36bf5a] hover:bg-[#2fa64e] transition-colors rounded-[7.5px] flex items-center gap-[3px] pl-[6px] pr-[12px] py-[6px] text-white text-left"
          >
            <div className="size-[14.6px] relative shrink-0">
               <Image src="/x-logo-white.svg" alt="X" fill className="object-contain" />
            </div>
            <span className="text-[11.2px] font-medium leading-[1] whitespace-nowrap">Share on X</span>
          </a>

          {/* Copy Link */}
          <button
            onClick={onCopyReferral}
            disabled={!referralLink}
            className="flex-1 bg-[#f5f5f5] hover:bg-[#ebebeb] disabled:cursor-not-allowed disabled:opacity-50 transition-colors rounded-[7.5px] flex items-center pl-[9px] pr-[12px] py-[6px] text-black text-left"
          >
            <span className="text-[11.2px] font-medium leading-[1]">Copy Link</span>
          </button>

          {/* Download */}
          <button className="flex-1 bg-[#f5f5f5] hover:bg-[#ebebeb] transition-colors rounded-[7.5px] flex items-center pl-[9px] pr-[12px] py-[6px] text-black text-left">
            <span className="text-[11.2px] font-medium leading-[1]">Download</span>
          </button>
        </div>
      </div>
    </div>
  );
}
