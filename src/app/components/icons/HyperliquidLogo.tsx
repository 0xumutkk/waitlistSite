export function HyperliquidLogo({ className = "" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/hl-logo.svg"
      alt="Hyperliquid"
      width={134}
      height={21}
      className={className}
    />
  );
}
