import { useState, useEffect } from "react";

/**
 * Safe, zero-crash reduced motion hook.
 *
 * Unlike Framer Motion's useReducedMotion, this hook defends against
 * environments (e.g. legacy Android WebViews, mock DOMs, or browsers
 * where MediaQueryList lacks addEventListener).
 */
export function useSafeReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    try {
      return Boolean(window.matchMedia("(prefers-reduced-motion: reduce)")?.matches);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;

    try {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (!mq) return;

      const onChange = (e: MediaQueryListEvent | MediaQueryList) => {
        setPrefersReduced(Boolean(e.matches));
      };

      if (typeof mq.addEventListener === "function") {
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
      } else if (typeof mq.addListener === "function") {
        mq.addListener(onChange);
        return () => mq.removeListener(onChange);
      }
    } catch {
      // Degrade gracefully
    }
  }, []);

  return prefersReduced;
}
