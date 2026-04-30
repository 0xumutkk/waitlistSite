export function XLogo({
  className = "",
  size = 20,
  fill = "#171717",
}: {
  className?: string;
  size?: number;
  fill?: string;
}) {
  return (
    <svg
      viewBox="0 0 19.4701 19.4701"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect width="19.4701" height="19.4701" rx="4.05628" fill={fill} />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.2672 15.7926H15.7286L11.1403 9.03086L15.7286 3.67783H14.505L10.5916 8.22223L7.50786 3.67783H3.91158L8.62275 10.5085L4.07232 15.7926H5.34451L9.18054 11.3172L12.2672 15.7926ZM5.97162 4.7595L12.8352 14.7109H13.6874L6.93466 4.7595H5.97162Z"
        fill="white"
      />
    </svg>
  );
}
