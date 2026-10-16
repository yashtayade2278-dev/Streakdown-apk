import React from 'react';

/**
 * Single source of truth for the Kairo logo inside the web UI.
 * Geometry, colours and corner radius match public/icon.svg and the native
 * Android drawables (kairo_orbit_logo.xml / kairo_logo_tile*.xml).
 */
export const KairoLogo: React.FC<{ size?: number; className?: string }> = ({ size = 44, className = '' }) => (
  <div
    aria-hidden="true"
    className={`shrink-0 flex items-center justify-center ${className}`}
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.258,
      background: 'linear-gradient(135deg, #FFD99A 0%, #FFB8A3 52%, #F4B8D9 100%)',
    }}
  >
    <svg viewBox="0 0 48 48" width={size} height={size} fill="none" stroke="#FFFDF8" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M30 7C20 3 9 10 7 20c-2 7 1 12 5 16M18 41c10 4 21-3 23-13 2-7-1-12-5-16" />
      <circle cx="24" cy="24" r="7" />
      <circle cx="35" cy="5" r="3.5" fill="#FFFDF8" stroke="none" />
      <circle cx="12" cy="39" r="3.5" fill="#FFFDF8" stroke="none" />
    </svg>
  </div>
);
