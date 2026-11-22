import React from 'react';
import { useThemeContext } from '@/providers/ThemeProvider';

/**
 * Kinetic Canonical Brand Mark.
 * Geometric stylized 'K' and dynamic human-in-motion silhouette.
 * Features grounded vertical baseline detents and 45° forward velocity beam.
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

  const markColor = monochrome
    ? 'currentColor'
    : isDark
      ? '#FAFAFA'
      : '#1F2937';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Kinetic"
      role="img"
    >
      {/* Orbital Anchor / Focal Head */}
      <circle cx="356.5" cy="291.5" r="98.5" fill={markColor} />

      {/* Dynamic Velocity Stride & Grounded Baseline Feet */}
      <path
        d="M216 817V732L709 141L812 227L601 479L812 732V817H710L514 584L319 817H216Z"
        fill={markColor}
      />
    </svg>
  );
};

export const SystemLogo = KineticLogo;
export default KineticLogo;
