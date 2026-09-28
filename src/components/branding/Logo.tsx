import { useThemeContext } from '@/providers/ThemeProvider';
import logoMicro from '@/assets/branding/logo-micro.svg';
import logoMicroDark from '@/assets/branding/logo-micro-dark-mode.svg';


/**
 * Kinetic Canonical brand mark.
 * Uses theme-aware micro vector marks for crisp, high-contrast display
 * in both Light and Dark modes.
 */
export const KineticLogo = ({ size = 40, className = '' }: { size?: number; className?: string }) => {
  const { resolvedMode } = useThemeContext();
  const src = resolvedMode === 'dark' ? logoMicroDark : logoMicro;

  return (
    <img
      src={src}
      alt="Kinetic"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
};

export const SystemLogo = KineticLogo;

