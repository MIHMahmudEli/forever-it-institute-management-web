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
  const subtextColor = isDark ? '#E5E7EB' : '#1F2937';

  // 1. Icon only variant (using public/logo-mark.svg)
  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-mark.svg"
          alt="Forever IT Mark"
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  // 2. Horizontal layout for Navigation bar and Sidebar
  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="w-10 h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.svg" alt="Forever IT Mark" className="w-full h-full object-contain" />
        </div>
        <div className="flex flex-col leading-none">
          <div className="flex items-center text-sm font-black tracking-tight">
            <span className={isDark ? 'text-white' : 'text-slate-900'}>FOREVER</span>
            <span className="text-[#25A84A] font-extrabold ml-1">IT</span>
          </div>
          <span className="text-[10px] tracking-[0.25em] font-extrabold uppercase mt-1 text-emerald-300">
            INSTITUTE
          </span>
        </div>
      </div>
    );
  }

  // 3. Form Header & Full Variants (matches the printable registration form exactly using /logo.svg)
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {/* Official Core Vector Logo */}
      <div className="relative inline-block px-2 py-1 max-w-[360px] w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.svg"
          alt="Forever IT Institute"
          className="w-full h-auto object-contain drop-shadow-xs"
        />
      </div>

      {/* INSTITUTE Text */}
      <div
        style={{ color: subtextColor }}
        className="font-extrabold text-xs sm:text-sm uppercase tracking-[0.35em] mt-1 text-center"
      >
        INSTITUTE
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
