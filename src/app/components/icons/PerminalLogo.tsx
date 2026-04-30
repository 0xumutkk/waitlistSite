export function PerminalLogo({ className = "" }: { className?: string }) {
  // White-fill wordmark — designed to sit on the glass header.
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/perminal-logo.svg"
      alt="Perminal"
      width={156}
      height={30}
      className={className}
    />
  );
}
