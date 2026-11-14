/**
 * haptics.ts
 * ─────────────────────────────────────────────────────────────────────────
 * This is a **web app** (Vite/React, no Capacitor/Cordova/native bridge in
 * package.json) — there is no true native haptics API available to it.
 * `navigator.vibrate()` (the Web Vibration API) is the actual ceiling here:
 * it works on Android Chrome/Firefox, does nothing on iOS Safari (Apple has
 * never implemented it, in any browser engine, by policy), and does nothing
 * on desktop. Calls are safe no-ops everywhere it's unsupported.
 *
 * If "physical confirmation before the UI updates" on iOS specifically is a
 * hard requirement, that needs the app wrapped in Capacitor (or similar)
 * to reach the real Haptics/Taptic Engine API — a build/deploy change, not
 * a component change. Flagging that rather than silently shipping something
 * that quietly does nothing on iOS.
 */

import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { Capacitor } from "@capacitor/core";

export type HapticPattern = "light" | "medium" | "success" | "selection";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  selection: 8,
  light: 10,
  medium: 20,
  success: [10, 40, 10],
};

// Tracks whether the user has performed at least one user activation (tap/click/key)
// as a fallback for browser environments that do not implement navigator.userActivation.
let hasUserInteracted = false;

if (typeof window !== "undefined") {
  const onInteraction = () => {
    hasUserInteracted = true;
    window.removeEventListener("pointerdown", onInteraction, true);
    window.removeEventListener("touchstart", onInteraction, true);
    window.removeEventListener("keydown", onInteraction, true);
    window.removeEventListener("click", onInteraction, true);
  };
  window.addEventListener("pointerdown", onInteraction, { capture: true, passive: true });
  window.addEventListener("touchstart", onInteraction, { capture: true, passive: true });
  window.addEventListener("keydown", onInteraction, { capture: true, passive: true });
  window.addEventListener("click", onInteraction, { capture: true, passive: true });
}

/**
 * Returns true only if the user has performed a user gesture on the frame,
 * satisfying Chrome's User Activation requirement (feature 5644273861001216).
 */
export function hasUserActivation(): boolean {
  if (typeof navigator !== "undefined" && "userActivation" in navigator && navigator.userActivation) {
    return Boolean(navigator.userActivation.hasBeenActive);
  }
  return hasUserInteracted;
}

export async function triggerHaptic(pattern: HapticPattern = "light") {
  // 1. Native Capacitor Haptics Engine (Android / iOS)
  if (Capacitor.isNativePlatform()) {
    try {
      switch (pattern) {
        case "selection":
          await Haptics.selectionStart();
          await Haptics.selectionChanged();
          break;
        case "light":
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case "medium":
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case "success":
          await Haptics.notification({ type: NotificationType.Success });
          break;
      }
      return;
    } catch {
      // Fall through to web vibration if native call encounters error
    }
  }

  // 2. Web Vibration API Fallback (Mobile Web / PWA)
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;

  if (!hasUserActivation()) return;

  try {
    const patternValue = PATTERNS[pattern] ?? PATTERNS.light;
    navigator.vibrate(patternValue);
  } catch {
    // Some browsers throw if called outside a user gesture — never let
    // a haptic failure break the actual action it's confirming.
  }
}
