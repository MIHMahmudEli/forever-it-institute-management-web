'use client';

import React from 'react';

interface SectionPillProps {
  icon?: React.ReactNode;
  title: string;
  className?: string;
}

export default function SectionPill({ icon, title, className = '' }: SectionPillProps) {
  return (
    <div className={`inline-flex items-center gap-2 mb-2.5 print:mb-1 ${className}`}>
      {/* Green Pill Badge */}
      <div className="inline-flex items-center gap-1.5 bg-[#006838] text-white px-3.5 py-1.5 print:py-0.5 print:px-3 rounded-full shadow-sm">
        {icon && <span className="w-3.5 h-3.5 print:w-3 print:h-3 shrink-0 flex items-center justify-center">{icon}</span>}
        <span className="font-extrabold text-xs sm:text-sm print:text-[11px] tracking-wide uppercase">
          {title}
        </span>
      </div>

      {/* Signature Angled Red Slash Accent Stripe */}
      <div className="flex items-center gap-0.5 pl-0.5">
        <span className="w-1.5 h-5 print:h-4 bg-[#D81A22] transform -skew-x-25 rounded-xs" />
        <span className="w-1 h-5 print:h-4 bg-[#D81A22] transform -skew-x-25 rounded-xs opacity-75" />
      </div>
    </div>
  );
}
