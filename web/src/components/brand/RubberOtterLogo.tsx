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
        <linearGradient id="otterLogoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1f1f23" />
          <stop offset="100%" stopColor="#0e0e11" />
        </linearGradient>
        <linearGradient id="otterLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2dd4bf" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#818cf8" />
        </linearGradient>
        <radialGradient id="otterGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Squircle Base with Contrasting Border */}
      <rect
        x="16"
        y="16"
        width="480"
        height="480"
        rx="112"
        fill="url(#otterLogoBgGrad)"
        stroke="#3f3f46"
        strokeWidth="14"
      />

      {/* Radial Center Glow */}
      <circle cx="256" cy="256" r="200" fill="url(#otterGlow)" />

      {/* Left & Right Ears */}
      <path d="M140 180 C115 155 105 200 130 220 Z" fill="url(#otterLogoGrad)" />
      <path d="M372 180 C397 155 407 200 382 220 Z" fill="url(#otterLogoGrad)" />

      {/* Otter Head Contour */}
      <path
        d="M150 220 C150 145, 362 145, 362 220 C370 280, 360 340, 256 360 C152 340, 142 280, 150 220 Z"
        stroke="url(#otterLogoGrad)"
        strokeWidth="22"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Eyes with Bright Catchlights */}
      <circle cx="206" cy="225" r="17" fill="url(#otterLogoGrad)" />
      <circle cx="306" cy="225" r="17" fill="url(#otterLogoGrad)" />
      <circle cx="211" cy="220" r="6" fill="#ffffff" />
      <circle cx="311" cy="220" r="6" fill="#ffffff" />

      {/* Nose & Snout */}
      <path
        d="M234 260 L278 260 C284 260 288 266 284 272 L263 301 C260 305 252 305 249 301 L228 272 C224 266 228 260 234 260 Z"
        fill="url(#otterLogoGrad)"
      />
      <path
        d="M256 302 L256 326 M256 326 C238 336 218 326 218 314 M256 326 C274 336 294 326 294 314"
        stroke="url(#otterLogoGrad)"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      {/* Whiskers */}
      <path
        d="M190 285 L115 275 M190 302 L110 307 M190 318 L120 334"
        stroke="#2dd4bf"
        strokeWidth="12"
        strokeLinecap="round"
      />
      <path
        d="M322 285 L397 275 M322 302 L402 307 M322 318 L392 334"
        stroke="#2dd4bf"
        strokeWidth="12"
        strokeLinecap="round"
      />

      {/* Wireless Signal Waves (Top Right) */}
      <path
        d="M375 125 C410 155 410 205 375 235"
        stroke="#38bdf8"
        strokeWidth="16"
        strokeLinecap="round"
      />
      <path
        d="M415 85 C470 140 470 220 415 275"
        stroke="#818cf8"
        strokeWidth="16"
        strokeLinecap="round"
      />
    </svg>
  );
};
