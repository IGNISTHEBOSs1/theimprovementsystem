/**
 * The Improvement System (TIS) Kinetic Motion Standard
 * Standardized spring physics, easing curves, and transition presets.
 * Based on Apple WWDC 2018 Fluid Interfaces & Compositor-Only 120fps Rendering.
 */

import type { Transition } from "framer-motion";

export const TIS_SPRINGS = {
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

export const TIS_EASINGS = {
  /**
   * Ease-Out-Expo: Decisive deceleration into rest.
   */
  exitDecel: [0.16, 1, 0.3, 1] as const,

  /**
   * Ease-Out-Quint: Velvety entrance curve.
   */
  subtleEntrance: [0.22, 1, 0.36, 1] as const,
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
