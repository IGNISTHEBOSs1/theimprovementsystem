import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { TIS_EASINGS } from '@/lib/motion-tokens';

interface MysteriousClipRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'horizontal' | 'vertical' | 'center-out';
  className?: string;
  showLaserGlint?: boolean;
}

export function MysteriousClipReveal({
  children,
  delay = 0,
  duration = 0.85,
  direction = 'horizontal',
  className = '',
  showLaserGlint = true,
}: MysteriousClipRevealProps) {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) {
    return <div className={className}>{children}</div>;
  }

  const isHorizontal = direction === 'horizontal';
  const isCenterOut = direction === 'center-out';

  const initialClip = isCenterOut
    ? 'inset(0 50% 0 50%)'
    : isHorizontal
    ? 'inset(0 100% 0 0)'
    : 'inset(100% 0 0 0)';

  const animateClip = 'inset(0 0% 0 0)';

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Masked Content Layer */}
      <motion.div
        initial={{
          clipPath: initialClip,
          opacity: 0.12,
        }}
        whileInView={{
          clipPath: animateClip,
          opacity: 1,
        }}
        viewport={{ once: true, margin: '-6% 0px' }}
        transition={{
          duration,
          delay,
          ease: TIS_EASINGS.exitDecel,
        }}
      >
        {children}
      </motion.div>

      {/* Traveling Specular Laser Glint (The Mysterious Scanning Line) */}
      {showLaserGlint && !isCenterOut && (
        <motion.div
          aria-hidden="true"
          initial={{
            [isHorizontal ? 'left' : 'top']: '0%',
            opacity: 0,
          }}
          whileInView={{
            [isHorizontal ? 'left' : 'top']: '100%',
            opacity: [0, 1, 1, 0],
          }}
          viewport={{ once: true, margin: '-6% 0px' }}
          transition={{
            duration,
            delay,
            ease: TIS_EASINGS.exitDecel,
            times: [0, 0.12, 0.88, 1],
          }}
          className={
            isHorizontal
              ? "absolute top-0 bottom-0 w-[1.5px] bg-gradient-to-b from-transparent via-white dark:via-zinc-200 to-transparent shadow-[0_0_12px_rgba(255,255,255,0.75)] pointer-events-none z-30"
              : "absolute left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white dark:via-zinc-200 to-transparent shadow-[0_0_12px_rgba(255,255,255,0.75)] pointer-events-none z-30"
          }
        />
      )}

      {/* Bilateral Specular Glints for Center-Out Direction */}
      {showLaserGlint && isCenterOut && (
        <>
          <motion.div
            aria-hidden="true"
            initial={{ left: '50%', opacity: 0 }}
            whileInView={{ left: '0%', opacity: [0, 1, 1, 0] }}
            viewport={{ once: true, margin: '-6% 0px' }}
            transition={{
              duration,
              delay,
              ease: TIS_EASINGS.exitDecel,
              times: [0, 0.12, 0.88, 1],
            }}
            className="absolute top-0 bottom-0 w-[1.5px] bg-gradient-to-b from-transparent via-white dark:via-zinc-200 to-transparent shadow-[0_0_12px_rgba(255,255,255,0.75)] pointer-events-none z-30"
          />
          <motion.div
            aria-hidden="true"
            initial={{ right: '50%', opacity: 0 }}
            whileInView={{ right: '0%', opacity: [0, 1, 1, 0] }}
            viewport={{ once: true, margin: '-6% 0px' }}
            transition={{
              duration,
              delay,
              ease: TIS_EASINGS.exitDecel,
              times: [0, 0.12, 0.88, 1],
            }}
            className="absolute top-0 bottom-0 w-[1.5px] bg-gradient-to-b from-transparent via-white dark:via-zinc-200 to-transparent shadow-[0_0_12px_rgba(255,255,255,0.75)] pointer-events-none z-30"
          />
        </>
      )}
    </div>
  );
}
