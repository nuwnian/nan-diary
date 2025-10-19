interface CloverIconProps {
  className?: string;
  size?: number;
}

export default function CloverIcon({ className = "", size = 24 }: CloverIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Four-leaf clover design */}
      {/* Top leaf */}
      <path
        d="M12 2C10.5 2 9.5 3 9.5 4.5C9.5 6 10.5 7 12 7C13.5 7 14.5 6 14.5 4.5C14.5 3 13.5 2 12 2Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Right leaf */}
      <path
        d="M22 12C22 10.5 21 9.5 19.5 9.5C18 9.5 17 10.5 17 12C17 13.5 18 14.5 19.5 14.5C21 14.5 22 13.5 22 12Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Bottom leaf */}
      <path
        d="M12 22C13.5 22 14.5 21 14.5 19.5C14.5 18 13.5 17 12 17C10.5 17 9.5 18 9.5 19.5C9.5 21 10.5 22 12 22Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Left leaf */}
      <path
        d="M2 12C2 13.5 3 14.5 4.5 14.5C6 14.5 7 13.5 7 12C7 10.5 6 9.5 4.5 9.5C3 9.5 2 10.5 2 12Z"
        fill="currentColor"
        opacity="0.9"
      />
      {/* Center circle */}
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      {/* Stem */}
      <path
        d="M12 14L12 20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
