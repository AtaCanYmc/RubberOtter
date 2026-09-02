import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const RubberOtterLogo: React.FC<LogoProps> = ({ className = '', size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="otterLogoBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#18181b" />
          <stop offset="100%" stopColor="#09090b" />
        </linearGradient>
        <linearGradient id="otterLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="50%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>

      {/* Squircle Base with Border */}
      <rect
        x="16"
        y="16"
        width="480"
        height="480"
        rx="112"
        fill="url(#otterLogoBg)"
        stroke="currentColor"
        className="text-zinc-800 dark:text-zinc-700"
        strokeWidth="12"
      />

      {/* Left & Right Ears */}
      <path d="M140 180 C120 160 110 200 130 220 Z" fill="url(#otterLogoGrad)" opacity="0.9" />
      <path d="M372 180 C392 160 402 200 382 220 Z" fill="url(#otterLogoGrad)" opacity="0.9" />

      {/* Otter Head Contour */}
      <path
        d="M150 220 C150 150, 362 150, 362 220 C370 280, 360 340, 256 360 C152 340, 142 280, 150 220 Z"
        stroke="url(#otterLogoGrad)"
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Eyes */}
      <circle cx="206" cy="225" r="16" fill="url(#otterLogoGrad)" />
      <circle cx="306" cy="225" r="16" fill="url(#otterLogoGrad)" />
      <circle cx="211" cy="220" r="5" fill="#ffffff" />
      <circle cx="311" cy="220" r="5" fill="#ffffff" />

      {/* Nose & Snout */}
      <path
        d="M236 260 L276 260 C282 260 286 266 282 272 L262 300 C259 304 253 304 250 300 L230 272 C226 266 230 260 236 260 Z"
        fill="url(#otterLogoGrad)"
      />
      <path
        d="M256 302 L256 324 M256 324 C240 334 220 324 220 314 M256 324 C272 334 292 324 292 314"
        stroke="url(#otterLogoGrad)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Whiskers */}
      <path
        d="M190 285 L120 275 M190 300 L115 305 M190 315 L125 330"
        stroke="url(#otterLogoGrad)"
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M322 285 L392 275 M322 300 L397 305 M322 315 L387 330"
        stroke="url(#otterLogoGrad)"
        strokeWidth="10"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Wireless Signal Waves */}
      <path
        d="M375 125 C405 155 405 200 375 230"
        stroke="#06b6d4"
        strokeWidth="14"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M410 90 C460 140 460 215 410 265"
        stroke="#3b82f6"
        strokeWidth="14"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
};
