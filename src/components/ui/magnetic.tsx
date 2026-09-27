import * as React from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { TIS_SPRINGS } from "@/lib/motion-tokens";

interface MagneticProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

/**
 * Magnetic CTA Component
 * Tactile micro-interaction: attracts element toward cursor smoothly without layout thrashing.
 * Caches bounding rect on pointer enter to avoid forced reflows on high-polling mice.
 */
export function Magnetic({ children, strength = 0.25, className }: MagneticProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const rectRef = React.useRef<DOMRect | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const smoothX = useSpring(x, {
    stiffness: TIS_SPRINGS.gesture.stiffness,
    damping: TIS_SPRINGS.gesture.damping,
    mass: 0.1,
  });
  const smoothY = useSpring(y, {
    stiffness: TIS_SPRINGS.gesture.stiffness,
    damping: TIS_SPRINGS.gesture.damping,
    mass: 0.1,
  });

  const handlePointerEnter = () => {
    if (ref.current) {
      rectRef.current = ref.current.getBoundingClientRect();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    if (!rectRef.current && ref.current) {
      rectRef.current = ref.current.getBoundingClientRect();
    }
    if (!rectRef.current) return;

    const { clientX, clientY } = e;
    const { left, top, width, height } = rectRef.current;
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);

    x.set(middleX * strength);
    y.set(middleY * strength);
  };

  const handlePointerLeave = () => {
    rectRef.current = null;
    x.set(0);
    y.set(0);
  };

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ x: smoothX, y: smoothY }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default Magnetic;
