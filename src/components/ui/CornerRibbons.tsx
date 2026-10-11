'use client';

import React from 'react';

interface CornerRibbonsProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'all-top' | 'all';
  className?: string;
}

function TopRightRibbon() {
  return (
    <div className="absolute top-0 right-0 w-36 h-36 overflow-hidden pointer-events-none z-10">
      <div className="absolute -top-12 -right-12 w-32 h-10 bg-[#D81A22] transform rotate-45 shadow-xs" />
      <div className="absolute -top-4 -right-4 w-32 h-8 bg-[#006838] transform rotate-45 shadow-xs" />
      <div className="absolute top-4 right-4 w-28 h-1.5 bg-[#D81A22] transform rotate-45" />
    </div>
  );
}

function TopLeftRibbon() {
  return (
    <div className="absolute top-0 left-0 w-36 h-36 overflow-hidden pointer-events-none z-10">
      <div className="absolute -top-12 -left-12 w-32 h-10 bg-[#D81A22] transform -rotate-45 shadow-xs" />
      <div className="absolute -top-4 -left-4 w-32 h-8 bg-[#006838] transform -rotate-45 shadow-xs" />
      <div className="absolute top-4 left-4 w-28 h-1.5 bg-[#D81A22] transform -rotate-45" />
    </div>
  );
}

function BottomRightRibbon() {
  return (
    <div className="absolute bottom-0 right-0 w-36 h-36 overflow-hidden pointer-events-none z-10">
      <div className="absolute -bottom-4 -right-4 w-32 h-8 bg-[#006838] transform -rotate-45 shadow-xs" />
      <div className="absolute -bottom-12 -right-12 w-32 h-10 bg-[#D81A22] transform -rotate-45 shadow-xs" />
    </div>
  );
}

function BottomLeftRibbon() {
  return (
    <div className="absolute bottom-0 left-0 w-36 h-36 overflow-hidden pointer-events-none z-10">
      <div className="absolute -bottom-4 -left-4 w-32 h-8 bg-[#006838] transform rotate-45 shadow-xs" />
      <div className="absolute -bottom-12 -left-12 w-32 h-10 bg-[#D81A22] transform rotate-45 shadow-xs" />
    </div>
  );
}

export default function CornerRibbons({
  position = 'top-right',
  className = '',
}: CornerRibbonsProps) {
  return (
    <div className={`contents ${className}`}>
      {(position === 'top-right' || position === 'all-top' || position === 'all') && <TopRightRibbon />}
      {(position === 'top-left' || position === 'all-top' || position === 'all') && <TopLeftRibbon />}
      {(position === 'bottom-right' || position === 'all') && <BottomRightRibbon />}
      {(position === 'bottom-left' || position === 'all') && <BottomLeftRibbon />}
    </div>
  );
}
