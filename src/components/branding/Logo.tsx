import { useThemeContext } from '@/providers/ThemeProvider';
import logoMicro from '@/assets/branding/logo-micro.svg';
import logoMicroDark from '@/assets/branding/logo-micro-dark-mode.svg';

/**
 * Canonical brand mark (TIS-BRAND-001).
 * Uses theme-aware micro vector marks for crisp, high-contrast display
 * in both Light and Dark modes without bundling oversized tracing assets.
 */
export const SystemLogo = ({ size = 40, className = '' }: { size?: number; className?: string }) => {
  const { resolvedMode } = useThemeContext();
  const src = resolvedMode === 'dark' ? logoMicroDark : logoMicro;

  return (
    <img
      src={src}
      alt="The Improvement System"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
};
