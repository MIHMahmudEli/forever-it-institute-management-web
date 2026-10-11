'use client';

import React from 'react';

interface CornerRibbonsProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'all-top' | 'all';
  className?: string;
}

/**
 * Shared SVG corner ribbon paths:
 * Base coordinate system: 140x140 box with page corner at (24, 24).
 * Coordinates from 0 to 24 extend outside the page boundary (bleed).
 * Stripes run diagonally at 45 degrees:
 * 1. Outer Crimson Red band: #D81A22 (c = 0 to 78)
 * 2. White spacer: #FFFFFF (c = 78 to 84)
 * 3. Broad Dark Green band: #006838 (c = 84 to 116)
 * 4. White spacer: #FFFFFF (c = 116 to 122)
 * 5. Inner Accent Crimson Red stripe: #D81A22 (c = 122 to 128)
 */
function RibbonPaths() {
  return (
    <>
      {/* 1. Outer Crimson Red Band (extends beyond canvas tip) */}
      <polygon points="0,0 78,0 0,78" fill="#D81A22" />

      {/* 2. White Gap Stripe */}
      <polygon points="0,78 78,0 84,0 0,84" fill="#FFFFFF" />

      {/* 3. Main Broad Dark Green Band */}
      <polygon points="0,84 84,0 116,0 0,116" fill="#006838" />

      {/* 4. White Gap Stripe */}
      <polygon points="0,116 116,0 122,0 0,122" fill="#FFFFFF" />

      {/* 5. Inner Accent Crimson Red Stripe */}
      <polygon points="0,122 122,0 128,0 0,128" fill="#D81A22" />
    </>
  );
}

function TopLeftRibbon() {
  return (
    <svg
      className="absolute -top-6 -left-6 w-[140px] h-[140px] pointer-events-none z-0"
      viewBox="0 0 140 140"
      aria-hidden="true"
    >
      <RibbonPaths />
    </svg>
  );
}

function TopRightRibbon() {
  return (
    <svg
      className="absolute -top-6 -right-6 w-[140px] h-[140px] pointer-events-none z-0"
      viewBox="0 0 140 140"
      aria-hidden="true"
    >
      <g transform="translate(140, 0) scale(-1, 1)">
        <RibbonPaths />
      </g>
    </svg>
  );
}

function BottomLeftRibbon() {
  return (
    <svg
      className="absolute -bottom-6 -left-6 w-[140px] h-[140px] pointer-events-none z-0"
      viewBox="0 0 140 140"
      aria-hidden="true"
    >
      <g transform="translate(0, 140) scale(1, -1)">
        <RibbonPaths />
      </g>
    </svg>
  );
}

function BottomRightRibbon() {
  return (
    <svg
      className="absolute -bottom-6 -right-6 w-[140px] h-[140px] pointer-events-none z-0"
      viewBox="0 0 140 140"
      aria-hidden="true"
    >
      <g transform="translate(140, 140) scale(-1, -1)">
        <RibbonPaths />
      </g>
    </svg>
  );
}

export default function CornerRibbons({
  position = 'all',
  className = '',
}: CornerRibbonsProps) {
  const showTopRight = position === 'top-right' || position === 'all-top' || position === 'all';
  const showTopLeft = position === 'top-left' || position === 'all-top' || position === 'all';
  const showBottomRight = position === 'bottom-right' || position === 'all';
  const showBottomLeft = position === 'bottom-left' || position === 'all';

  return (
    <div className={`contents ${className}`}>
      {showTopLeft && <TopLeftRibbon />}
      {showTopRight && <TopRightRibbon />}
      {showBottomLeft && <BottomLeftRibbon />}
      {showBottomRight && <BottomRightRibbon />}
    </div>
  );
}
