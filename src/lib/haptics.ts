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

type HapticPattern = "light" | "medium" | "success";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  success: [10, 40, 10],
};

export function triggerHaptic(pattern: HapticPattern = "light") {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate(PATTERNS[pattern]);
  } catch {
    // Some browsers throw if called outside a user gesture — never let
    // a haptic failure break the actual action it's confirming.
  }
}
