import React, { useId } from 'react';
import { useThemeContext } from '@/providers/ThemeProvider';

/**
 * Kinetic Canonical Brand Mark.
 * Neoskeuomorphic vector mark with titanium discipline spine and
 * electric emerald velocity trajectory blade (+10% curve).
 */
export const KineticLogo = ({
  size = 40,
  className = '',
  monochrome = false,
}: {
  size?: number;
  className?: string;
  monochrome?: boolean;
}) => {
  const { resolvedMode } = useThemeContext();
  const isDark = resolvedMode === 'dark';
  const rawId = useId();
  const id = rawId.replace(/:/g, '');

  const spineColor = monochrome
    ? 'currentColor'
    : isDark
      ? '#FFFFFF'
      : '#0F172A';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Kinetic"
      role="img"
    >
      <defs>
        <linearGradient id={`k-em-${id}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="100%" stopColor="#34D399" />
        </linearGradient>
        <linearGradient id={`k-ti-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={spineColor} />
          <stop offset="100%" stopColor={isDark ? '#CBD5E1' : '#334155'} />
        </linearGradient>
      </defs>

      {/* Vertical Anchor Spine */}
      <rect x="20" y="18" width="13" height="64" rx="6.5" fill={`url(#k-ti-${id})`} />

      {/* Upper Kinetic Trajectory Blade */}
      <path
        d="M41 47 L68 20 C70.5 17.5 75 19.2 75 22.8 L75 32.5 C75 34.6 74 36.6 72.5 38.1 L54 56.6 C51 59.6 46 57.5 46 53.2 L46 48 C46 46.5 44.5 45.5 43 46 Z"
        fill={monochrome ? 'currentColor' : `url(#k-em-${id})`}
      />

      {/* Lower Horizon Blade */}
      <path
        d="M46 51 C46 46.8 51 44.7 54 47.7 L72.5 66.2 C74 67.7 75 69.7 75 71.8 L75 79.5 C75 83.1 70.5 84.8 68 82.3 L41 55.3 C40 54.3 40 52.8 41 51.8 Z"
        fill={`url(#k-ti-${id})`}
      />
    </svg>
  );
};

export const SystemLogo = KineticLogo;
export default KineticLogo;
