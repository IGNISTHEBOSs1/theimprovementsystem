/**
 * Kinetic Motion Standard
 * Standardized spring physics, easing curves, and transition presets.
 * Based on Apple WWDC 2018 Fluid Interfaces & Compositor-Only 120fps Rendering.
 */

import type { Transition } from "framer-motion";

export const KINETIC_SPRINGS = {
  /**
   * Critically Damped (ζ = 1.0)
   * Decisive, instantaneous, zero oscillation or overshoot.
   * Ideal for modals, route switches, accordion disclosures, and dialogs.
   */
  settle: {
    type: "spring" as const,
    stiffness: 380,
    damping: 38,
    mass: 1,
  },

  /**
   * Tactile Micro-Snap (ζ ≈ 0.78)
   * Crisp mechanical detent with subtle physical weight.
   * Ideal for checkbox toggles, quest completions, segmented controls, and button clicks.
   */
  snap: {
    type: "spring" as const,
    stiffness: 420,
    damping: 26,
    mass: 0.8,
  },

  /**
   * Fluid Gesture / Drag (ζ ≈ 0.82)
   * Follows pointer 1:1, settles with inherited release velocity.
   * Ideal for swipe-to-complete, bottom-sheet drags, and interactive scrubbers.
   */
  gesture: {
    type: "spring" as const,
    stiffness: 320,
    damping: 30,
    mass: 1,
  },

  /**
   * Heavy Glass Card Float
   * Solid slab of crystal obsidian moving under fingertip.
   * Ideal for card hover elevation, neoskeuomorphic press compression.
   */
  cardFloat: {
    type: "spring" as const,
    stiffness: 260,
    damping: 24,
    mass: 1.2,
  },
} as const;

export const TIS_SPRINGS = KINETIC_SPRINGS;

export const TIS_EASINGS = {
  /**
   * Ease-Out-Expo: Decisive deceleration into rest.
   */
  exitDecel: [0.16, 1, 0.3, 1] as const,

  /**
   * Ease-Out-Quint: Velvety entrance curve.
   */
  subtleEntrance: [0.22, 1, 0.36, 1] as const,

  /**
   * Precision Smooth-Pursuit: Telemetry visualizers and progress rings.
   */
  precisionInOut: [0.65, 0, 0.35, 1] as const,
} as const;

export const TIS_TRANSITIONS = {
  cardHover: {
    ...TIS_SPRINGS.cardFloat,
  } satisfies Transition,

  elementEntrance: {
    duration: 0.42,
    ease: TIS_EASINGS.subtleEntrance,
  } satisfies Transition,

  modalSheet: {
    ...TIS_SPRINGS.settle,
  } satisfies Transition,

  navPill: {
    ...TIS_SPRINGS.settle,
  } satisfies Transition,

  questCompleteExit: {
    duration: 0.32,
    ease: TIS_EASINGS.exitDecel,
  } satisfies Transition,
} as const;

export const MOTION_PRESETS = {
  // Snappy: Direct manipulation, card select, button tap
  snappySpring: {
    type: "spring" as const,
    stiffness: 500,
    damping: 32,
    mass: 1.0,
  },

  // Smooth: Sliding pill indicators, layoutId transitions
  smoothSpring: {
    type: "spring" as const,
    stiffness: 400,
    damping: 35,
    mass: 1.0,
  },

  // Heavy Press: Tactile button depression
  holdDepression: {
    type: "spring" as const,
    stiffness: 520,
    damping: 30,
    mass: 1.0,
  },

  // Commit Pop: Celebration overshoot on long-press lock
  commitOvershoot: {
    type: "spring" as const,
    stiffness: 700,
    damping: 14,
    mass: 0.8,
  },

  // Easing Curves
  curves: {
    velocityTrace: [0.16, 1.0, 0.3, 1.0] as const, // Dynamic trajectory draw
    stepTransition: [0.25, 1.0, 0.5, 1.0] as const, // Directional slide
    asymmetricRewind: [0.22, 1.0, 0.36, 1.0] as const, // Release hold before 92%
  },

  // Durations (ms)
  durations: {
    micro: 150,
    standard: 250,
    modal: 350,
    holdCommit: 1200,
    calibration: 3500,
  },
} as const;

// Direction-aware screen slide variants (compositor-only, 120fps optimized)
export const pageTransitionVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 18 : -18,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      x: { type: "spring", stiffness: 450, damping: 36, restDelta: 0.001 },
      opacity: { duration: 0.18, ease: "easeOut" },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 18 : -18,
    opacity: 0,
    transition: {
      x: { type: "spring", stiffness: 450, damping: 36, restDelta: 0.001 },
      opacity: { duration: 0.14, ease: "easeIn" },
    },
  }),
};

