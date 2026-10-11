'use client';

import React from 'react';

export interface BrandLogoProps {
  variant?: 'full' | 'compact' | 'horizontal' | 'icon' | 'form-header';
  theme?: 'light' | 'dark';
  className?: string;
  showTagline?: boolean;
}

export default function BrandLogo({
  variant = 'compact',
  theme = 'light',
  className = '',
  showTagline = true,
}: BrandLogoProps) {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const subtextColor = isDark ? '#E5E7EB' : '#1F2937';
  const greenStem = isDark ? '#10B981' : '#006838';
  const redColor = '#D81A22';

  // 1. Icon only variant
  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 128 128"
        className={`shrink-0 ${className}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="128" height="128" rx="28" fill="#015333" />
        <rect x="3" y="3" width="122" height="122" rx="25" stroke="#006838" strokeWidth="2" />
        <path d="M 32 28 L 18 28 L 18 100 L 32 100" stroke="#D81A22" strokeWidth="8" strokeLinecap="round" />
        <path d="M 96 28 L 110 28 L 110 100 L 96 100" stroke="#D81A22" strokeWidth="8" strokeLinecap="round" />
        <text x="24" y="86" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="54">
          F
        </text>
        <rect x="58" y="44" width="12" height="42" rx="3" fill="#22C55E" />
        <circle cx="64" cy="33" r="7.5" fill="#D81A22" stroke="#FFFFFF" strokeWidth="1.5" />
        <text x="76" y="86" fill="#FFFFFF" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="54">
          T
        </text>
      </svg>
    );
  }

  // 2. Horizontal layout for Navigation bar and Sidebar
  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {/* Emblem */}
        <div className="w-10 h-10 rounded-xl bg-[#015333] border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-md">
          <svg viewBox="0 0 100 100" className="w-7 h-7" fill="none">
            <path d="M 24 22 L 14 22 L 14 78 L 24 78" stroke="#D81A22" strokeWidth="6" strokeLinecap="round" />
            <path d="M 76 22 L 86 22 L 86 78 L 76 78" stroke="#D81A22" strokeWidth="6" strokeLinecap="round" />
            <text x="20" y="68" fill="#FFFFFF" fontWeight="900" fontSize="42">F</text>
            <rect x="47" y="35" width="9" height="33" rx="2" fill="#22C55E" />
            <circle cx="51.5" cy="26" r="6" fill="#D81A22" />
            <text x="61" y="68" fill="#FFFFFF" fontWeight="900" fontSize="42">T</text>
          </svg>
        </div>
        {/* Words */}
        <div className="flex flex-col leading-none">
          <div className="flex items-center text-base font-black tracking-tight">
            <span style={{ color: textColor }}>FOREVER</span>
            <span className="text-[#006838] dark:text-emerald-400 font-extrabold ml-0.5">I</span>
            <span style={{ color: textColor }}>T</span>
          </div>
          <span className="text-[10px] tracking-[0.25em] font-extrabold uppercase mt-0.5 text-emerald-600 dark:text-emerald-400">
            INSTITUTE
          </span>
        </div>
      </div>
    );
  }

  // 3. Form Header & Full Variants (matches the printable registration form exactly)
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {/* The Core Bracket Logo */}
      <div className="relative inline-block px-4 py-1">
        <svg
          viewBox="0 0 520 160"
          className="w-full max-w-[380px] h-auto drop-shadow-xs"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Red Brackets */}
          <path d="M 80 20 L 16 20 L 16 120 L 80 120" stroke={redColor} strokeWidth="12" fill="none" strokeLinecap="square" />
          <path d="M 440 20 L 504 20 L 504 120 L 440 120" stroke={redColor} strokeWidth="12" fill="none" strokeLinecap="square" />

          {/* Top Bar with gap for dot */}
          <line x1="16" y1="20" x2="390" y2="20" stroke={redColor} strokeWidth="12" strokeLinecap="square" />
          <line x1="435" y1="20" x2="504" y2="20" stroke={redColor} strokeWidth="12" strokeLinecap="square" />

          {/* Bottom Bar */}
          <line x1="16" y1="120" x2="504" y2="120" stroke={redColor} strokeWidth="12" strokeLinecap="square" />

          {/* "FOREVER" Text */}
          <text
            x="38"
            y="98"
            fill={textColor}
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="74"
            letterSpacing="-1px"
          >
            FOREVER
          </text>

          {/* Stylized "I" (Green stem + Red dot) */}
          <rect x="402" y="44" width="18" height="54" rx="2" fill={greenStem} />
          <circle cx="411" cy="22" r="11" fill={redColor} stroke="#FFFFFF" strokeWidth="2" />

          {/* "T" Text */}
          <text
            x="428"
            y="98"
            fill={textColor}
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="900"
            fontSize="74"
          >
            T
          </text>

          {/* "INSTITUTE" Underneath */}
          <text
            x="260"
            y="152"
            textAnchor="middle"
            fill={subtextColor}
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="800"
            fontSize="26"
            letterSpacing="15px"
          >
            INSTITUTE
          </text>
        </svg>
      </div>

      {/* Red Pill Banner */}
      {(variant === 'full' || variant === 'form-header') && (
        <div className="mt-2.5">
          <div className="inline-block bg-[#D81A22] text-white px-5 py-1 rounded-full text-xs sm:text-sm font-bold tracking-wide shadow-sm">
            Professional IT &amp; Business Development Training
          </div>
        </div>
      )}

      {/* Bengali Tagline */}
      {showTagline && (variant === 'full' || variant === 'form-header') && (
        <p className="mt-1.5 text-base sm:text-lg font-black text-[#006838] dark:text-emerald-400 font-bangla tracking-wide">
          দক্ষতা গড়ুন, গড়ুন সফল ভবিষ্যৎ
        </p>
      )}
    </div>
  );
}
