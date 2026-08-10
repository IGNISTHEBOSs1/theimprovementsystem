import { useThemeContext } from '@/providers/ThemeProvider';
import logoFull from '@/assets/branding/logo-full.svg';
import logoMicro from '@/assets/branding/logo-micro.svg';
import logoMicroDark from '@/assets/branding/logo-micro-dark-mode.svg';

/**
 * Canonical brand mark (TIS-BRAND-001).
 *
 * Source of truth:
 * - Logo_Vector.svg → logo-full.svg (full mark)
 * - Micro_Icon-BG_Removed_Vector.svg → logo-micro.svg (micro icon)
 * - Light_mode_Micro_Icon-BG_removed.svg → logo-micro-dark-mode.svg
 *   (micro icon variant for dark-themed surfaces)
 * Approved as the single canonical brand identity. Do not redesign,
 * recolor, stretch, or add effects/outlines to these assets — see
 * TIS-BRAND-001 usage rules.
 *
 * Selection is two-axis:
 * - size: below ~32px the full mark loses legibility, so the micro icon
 *   is used instead, per the approved usage rules.
 * - theme: only the micro icon currently has a dark-surface variant. The
 *   full mark has no light/dark distinction yet, so it renders unchanged
 *   regardless of theme.
 *
 * Theme is read from the app's existing resolved theme state
 * (ThemeProvider's resolvedMode) — no independent prefers-color-scheme
 * logic is introduced here.
 */
const MICRO_THRESHOLD = 32;

export const SystemLogo = ({ size = 40, className = '' }: { size?: number; className?: string }) => {
  const { resolvedMode } = useThemeContext();
  const useMicro = size < MICRO_THRESHOLD;

  const src = useMicro
    ? (resolvedMode === 'dark' ? logoMicroDark : logoMicro)
    : logoFull;

  return (
    <img
      src={src}
      alt="The System"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
};
