'use client';

import React from 'react';
import { MapPin, Globe, Phone } from 'lucide-react';

interface CorporateFooterBannerProps {
  className?: string;
  variant?: 'print' | 'web';
}

export default function CorporateFooterBanner({
  className = '',
  variant = 'print',
}: CorporateFooterBannerProps) {
  const isPrint = variant === 'print';

  return (
    <footer
      className={`relative w-full bg-[#006838] text-white rounded-xl overflow-hidden shadow-md ${
        isPrint ? 'py-3 px-6' : 'py-5 px-6 sm:px-8'
      } ${className}`}
    >
      {/* Decorative Red End Corner Accents */}
      <div className="absolute top-0 right-0 w-12 h-12 bg-[#D81A22] transform rotate-45 translate-x-6 -translate-y-6 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-12 h-12 bg-[#D81A22] transform rotate-45 -translate-x-6 translate-y-6 pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 print:grid-cols-3 gap-4 items-center text-xs">
        {/* 1. Corporate Address */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-white text-[#006838] flex items-center justify-center shrink-0 shadow-xs">
            <MapPin className="w-4 h-4 fill-current stroke-none" />
          </div>
          <div className="leading-tight min-w-0">
            <span className="font-bold text-[11px] block text-white">
              Corporate Address:
            </span>
            <span className="text-[10px] sm:text-[10.5px] text-white/90 block leading-tight">
              House # 14, Road # 14, Block # L, South Banasree, Dhaka-1219
            </span>
          </div>
        </div>

        {/* 2. Website */}
        <div className="flex items-center gap-3 min-w-0 sm:border-l sm:border-white/25 print:border-l print:border-white/25 sm:pl-4 print:pl-4">
          <div className="w-8 h-8 rounded-full bg-white text-[#006838] flex items-center justify-center shrink-0 shadow-xs">
            <Globe className="w-4 h-4" />
          </div>
          <div className="leading-tight min-w-0">
            <span className="font-bold text-[11px] block text-white">
              Website:
            </span>
            <a
              href="https://www.foreveritbd.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10.5px] text-white font-medium hover:underline block truncate"
            >
              www.foreveritbd.com
            </a>
          </div>
        </div>

        {/* 3. Mobile */}
        <div className="flex items-center gap-3 min-w-0 sm:border-l sm:border-white/25 print:border-l print:border-white/25 sm:pl-4 print:pl-4">
          <div className="w-8 h-8 rounded-full bg-white text-[#006838] flex items-center justify-center shrink-0 shadow-xs">
            <Phone className="w-4 h-4 fill-current stroke-none" />
          </div>
          <div className="leading-tight min-w-0">
            <span className="font-bold text-[11px] block text-white">
              Mobile:
            </span>
            <a
              href="tel:+8801762367001"
              className="text-[10.5px] text-white font-medium hover:underline block"
            >
              +8801762367001
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
