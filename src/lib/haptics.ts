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

export function triggerHaptic(pattern: HapticPattern = "light") {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;

  // Intercept before navigator.vibrate() is called to prevent Chrome's
  // [Intervention] "Blocked call to navigator.vibrate because user hasn't tapped on the frame yet".
  if (!hasUserActivation()) return;

  try {
    const patternValue = PATTERNS[pattern] ?? PATTERNS.light;
    navigator.vibrate(patternValue);
  } catch {
    // Some browsers throw if called outside a user gesture — never let
    // a haptic failure break the actual action it's confirming.
  }
}
