// src/lib/mobileAppRedirect.ts
import { isCapacitorNative } from "@/services/otaUpdateService";

/**
 * Checks whether the current user is visiting from a mobile device (phone or tablet)
 * in an external web browser (Chrome, Safari, Firefox, etc.).
 */
export function isMobileDevice(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  // If already inside the native Capacitor app container, return false
  if (isCapacitorNative()) return false;

  const ua = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || "";
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isTouchScreen = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isNarrowScreen = window.innerWidth <= 840;

  return isMobileUA || (isTouchScreen && isNarrowScreen);
}

/**
 * Triggers an OS-level deep link redirect to open the installed Kinetic mobile app.
 */
export function redirectToNativeApp(): void {
  if (typeof window === "undefined") return;
  if (isCapacitorNative()) return; // Already in native app!

  const isAndroid = /Android/i.test(navigator.userAgent);
  const currentUrl = encodeURIComponent(window.location.href);

  if (isAndroid) {
    // Official Android intent scheme:
    // Opens com.kinetic.app directly; if not installed, gracefully retains current web location.
    const intentUrl = `intent://open#Intent;scheme=com.kinetic.app;package=com.kinetic.app;S.browser_fallback_url=${currentUrl};end`;
    window.location.href = intentUrl;
  } else {
    // Standard custom scheme for other mobile operating systems
    window.location.href = "com.kinetic.app://open";
  }
}

/**
 * Automatically prompts or attempts deep link redirect once per mobile browsing session.
 */
export function checkAndAutoRedirectMobile(): void {
  if (typeof window === "undefined") return;
  const path = window.location.pathname;
  const search = window.location.search;
  if (
    path.startsWith("/onboarding") ||
    path.startsWith("/auth") ||
    search.includes("dev_preview") ||
    search.includes("screenshot=true") ||
    localStorage.getItem("tis_dev_mock") === "true"
  ) {
    return;
  }
  if (!isMobileDevice()) return;

  const sessionKey = "kinetic_mobile_redirect_attempted";
  if (sessionStorage.getItem(sessionKey)) return;

  sessionStorage.setItem(sessionKey, "true");
  // Gentle delay to avoid blocking initial DOM render
  setTimeout(() => {
    redirectToNativeApp();
  }, 300);
}
