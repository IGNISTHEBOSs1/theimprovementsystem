import logoFull from '@/assets/branding/logo-full.svg';
import logoMicro from '@/assets/branding/logo-micro.svg';

/**
 * Canonical brand mark (TIS-BRAND-001).
 *
 * Source of truth: Logo_Vector.svg (full mark) and
 * Micro_Icon-BG_Removed_Vector.svg (micro icon), approved as the single
 * canonical brand identity. Do not redesign, recolor, stretch, or add
 * effects/outlines to these assets — see TIS-BRAND-001 usage rules.
 *
 * Below ~32px the full mark loses legibility, so the micro icon is used
 * instead, per the approved usage rules.
 */
const MICRO_THRESHOLD = 32;

export const SystemLogo = ({ size = 40, className = '' }: { size?: number; className?: string }) => {
  const useMicro = size < MICRO_THRESHOLD;

  return (
    <img
      src={useMicro ? logoMicro : logoFull}
      alt="The System"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: 'contain' }}
    />
  );
};
