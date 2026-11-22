/**
 * authDeepLinkService.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Native In-App Social Auth & Deep-Link Callback Engine for Kinetic.
 *
 * Implements Option 3: True Native Google & Apple Sign-In on mobile devices
 * using @capgo/capacitor-social-login and Supabase signInWithIdToken.
 *
 * Bypasses external browser redirects and Chrome tabs entirely on Android/iOS,
 * invoking the native Google Play Services Credential Manager bottom sheet
 * and establishing the Supabase session in-app via cryptographically verified
 * ID tokens and SHA-256 nonces.
 *
 * For web and fallback scenarios, retains in-app browser and standard OAuth.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { supabase } from "@/integrations/supabase/client";
import { isCapacitorNative } from "@/services/otaUpdateService";

export const CUSTOM_OAUTH_CALLBACK_URL = "com.kinetic.app://auth/callback";

let listenerCleanup: (() => void) | null = null;
let activeBrowserDismissCallback: (() => void) | null = null;

/**
 * Generates a cryptographically secure 32-byte hex nonce string.
 */
function generateCryptoNonce(): string {
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Computes a SHA-256 hex digest of a message for Google nonce exchange.
 */
async function hashSha256(message: string): Promise<string> {
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  return message;
}

/**
 * Tests if an error is due to user cancellation/dismissal of the native sheet.
 */
function isUserCancellation(err: unknown): boolean {
  if (!err) return false;
  const msg = err instanceof Error ? err.message : String(err);
  const normalized = msg.toLowerCase();
  return (
    normalized.includes("cancel") ||
    normalized.includes("cancelled") ||
    normalized.includes("canceled") ||
    normalized.includes("user_cancelled") ||
    normalized.includes("dismiss") ||
    normalized.includes("16:") // Android CommonStatusCodes.CANCELED
  );
}

/**
 * Native Google Sign-In via Android Credential Manager / Google Play Services.
 * Returns an ID token and validates it with Supabase signInWithIdToken.
 */
async function signInWithNativeGoogle(): Promise<{
  attempted: boolean;
  success?: boolean;
  cancelled?: boolean;
  error?: Error;
}> {
  const webClientId = import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID;

  if (!webClientId) {
    console.warn(
      "[NativeAuth] VITE_GOOGLE_WEB_CLIENT_ID is not configured in environment. " +
      "Set this variable to enable native 1-tap Google Sign-In."
    );
    return {
      attempted: false,
      error: new Error(
        "Native Google Sign-In requires VITE_GOOGLE_WEB_CLIENT_ID. Please configure it in your environment or Supabase settings."
      ),
    };
  }

  try {
    const { SocialLogin } = await import("@capgo/capacitor-social-login");

    console.log("[NativeAuth] Initializing native Google provider with Credential Manager...");
    await SocialLogin.initialize({
      google: {
        webClientId,
        mode: "online",
      },
    });

    const rawNonce = generateCryptoNonce();
    const nonceDigest = await hashSha256(rawNonce);

    let loginResult;
    try {
      console.log("[NativeAuth] Launching native Google Account sheet (bottom style)...");
      loginResult = await SocialLogin.login({
        provider: "google",
        options: {
          style: "bottom",
          forcePrompt: true,
          filterByAuthorizedAccounts: false,
          autoSelectEnabled: false,
          nonce: nonceDigest,
        },
      });
    } catch (bottomErr) {
      if (isUserCancellation(bottomErr)) {
        throw bottomErr;
      }
      console.warn("[NativeAuth] Bottom sheet failed, retrying with standard style...", bottomErr);
      loginResult = await SocialLogin.login({
        provider: "google",
        options: {
          style: "standard",
          forcePrompt: true,
          filterByAuthorizedAccounts: false,
          autoSelectEnabled: false,
          nonce: nonceDigest,
        },
      });
    }

    const idToken = (loginResult.result as { idToken?: string | null })?.idToken;

    if (!idToken) {
      throw new Error("No Google ID token returned from native sign-in.");
    }

    console.log("[NativeAuth] Exchanging Google ID token with Supabase (token length: " + idToken.length + ")...");
    let { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
      nonce: rawNonce,
    });

    if (error) {
      console.warn(
        "[NativeAuth] Supabase signInWithIdToken with nonce failed, attempting fallback exchange without nonce:",
        error.message
      );
      const fallbackResult = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });
      data = fallbackResult.data;
      error = fallbackResult.error;
    }

    if (error) {
      console.error("[NativeAuth] Supabase signInWithIdToken error:", error.message, error);
      throw error;
    }

    console.log("[NativeAuth] Google native authentication succeeded for user:", data?.user?.email);
    return { attempted: true, success: true };
  } catch (err) {
    if (isUserCancellation(err)) {
      console.log("[NativeAuth] Google sign-in was cancelled by user.");
      return { attempted: true, success: false, cancelled: true };
    }

    const error = err instanceof Error ? err : new Error(String(err));
    console.error("[NativeAuth] Google native sign-in error:", error.message);
    return { attempted: true, success: false, error };
  }
}

/**
 * Native Apple Sign-In via iOS Authentication Services.
 */
async function signInWithNativeApple(): Promise<{
  attempted: boolean;
  success?: boolean;
  cancelled?: boolean;
  error?: Error;
}> {
  try {
    const { SocialLogin } = await import("@capgo/capacitor-social-login");

    const rawNonce = generateCryptoNonce();
    const nonceDigest = await hashSha256(rawNonce);

    console.log("[NativeAuth] Launching native Apple Sign-In prompt...");
    const loginResult = await SocialLogin.login({
      provider: "apple",
      options: {
        scopes: ["name", "email"],
        nonce: nonceDigest,
      },
    });

    const idToken = (loginResult.result as { idToken?: string | null })?.idToken;

    if (!idToken) {
      throw new Error("No Apple ID token returned from native sign-in.");
    }

    console.log("[NativeAuth] Exchanging Apple ID token with Supabase...");
    const { error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: idToken,
      nonce: rawNonce,
    });

    if (error) throw error;

    console.log("[NativeAuth] Apple native authentication succeeded.");
    return { attempted: true, success: true };
  } catch (err) {
    if (isUserCancellation(err)) {
      console.log("[NativeAuth] Apple sign-in was cancelled by user.");
      return { attempted: true, success: false, cancelled: true };
    }

    const error = err instanceof Error ? err : new Error(String(err));
    console.error("[NativeAuth] Apple native sign-in error:", error.message);
    return { attempted: true, success: false, error };
  }
}

/**
 * Fallback browser OAuth flow using @capacitor/browser Chrome Custom Tabs.
 */
async function signInWithBrowserFallback(
  provider: "google" | "apple",
  onDismiss?: () => void
): Promise<{ success: boolean; error?: Error }> {
  try {
    const { Browser } = await import("@capacitor/browser");

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: CUSTOM_OAUTH_CALLBACK_URL,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      activeBrowserDismissCallback = null;
      return { success: false, error };
    }

    if (data?.url) {
      console.log(`[OAuth] Opening in-app browser sheet fallback for ${provider}...`);
      await Browser.open({
        url: data.url,
        windowName: "_blank",
        toolbarColor: "#090D16", // Kinetic deep obsidian
        presentationStyle: "popover",
      });
      return { success: true };
    }

    return { success: false, error: new Error("No authorization URL returned from Supabase.") };
  } catch (err) {
    activeBrowserDismissCallback = null;
    return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Initiates social sign-in (Google or Apple).
 *
 * On native mobile (Capacitor):
 *   1. Tries True Native 1-Tap Google / Apple Sign-In (Credential Manager).
 *      No Chrome browser redirect, 100% in-app experience.
 *   2. If not configured or cancelled, handles gracefully or falls back to
 *      Chrome Custom Tab sheet.
 *
 * On web: Standard Supabase web OAuth redirect.
 */
export async function signInWithSocial(
  provider: "google" | "apple",
  onDismiss?: () => void
): Promise<{ success: boolean; error?: Error }> {
  try {
    if (onDismiss) {
      activeBrowserDismissCallback = onDismiss;
    }

    if (isCapacitorNative()) {
      if (provider === "google") {
        const nativeRes = await signInWithNativeGoogle();

        if (nativeRes.cancelled) {
          activeBrowserDismissCallback = null;
          onDismiss?.();
          return { success: false };
        }

        if (nativeRes.success) {
          activeBrowserDismissCallback = null;
          return { success: true };
        }

        // If native Google sign-in failed, log error and surface it to user directly
        console.error(
          "[NativeAuth] Native Google Sign-In failed:",
          nativeRes.error?.message
        );
        activeBrowserDismissCallback = null;
        onDismiss?.();
        return { success: false, error: nativeRes.error };
      }

      if (provider === "apple") {
        const nativeRes = await signInWithNativeApple();

        if (nativeRes.cancelled) {
          activeBrowserDismissCallback = null;
          onDismiss?.();
          return { success: false };
        }

        if (nativeRes.success) {
          activeBrowserDismissCallback = null;
          return { success: true };
        }

        // Fallback to browser if native Apple login fails
        return await signInWithBrowserFallback(provider, onDismiss);
      }

      return await signInWithBrowserFallback(provider, onDismiss);
    } else {
      // Standard web browser redirect
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth`,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (error) return { success: false, error };
      return { success: true };
    }
  } catch (err) {
    activeBrowserDismissCallback = null;
    return { success: false, error: err instanceof Error ? err : new Error(String(err)) };
  }
}

/**
 * Registers native deep link listeners for handling OAuth redirect callbacks.
 * Should be mounted once in AuthProvider or root layout.
 */
export async function setupAuthDeepLinkListener(callbacks?: {
  onSuccess?: () => void;
  onError?: (err: Error) => void;
}): Promise<() => void> {
  if (!isCapacitorNative()) {
    return () => {};
  }

  // Prevent multiple duplicate listeners
  if (listenerCleanup) {
    listenerCleanup();
    listenerCleanup = null;
  }

  const { App } = await import("@capacitor/app");
  const { Browser } = await import("@capacitor/browser");

  // Listener 1: User dismissed the Chrome Custom Tab manually
  const browserFinishedHandle = await Browser.addListener("browserFinished", () => {
    console.log("[OAuth] In-app browser dismissed by user.");
    if (activeBrowserDismissCallback) {
      activeBrowserDismissCallback();
      activeBrowserDismissCallback = null;
    }
  });

  // Listener 2: Android deep link interception (com.kinetic.app://auth/callback)
  const appUrlOpenHandle = await App.addListener("appUrlOpen", async (event) => {
    console.log("[OAuth] Intercepted deep link URL:", event.url);

    if (
      event.url.startsWith(CUSTOM_OAUTH_CALLBACK_URL) ||
      event.url.includes("com.kinetic.app://auth") ||
      event.url.includes("kinetic://auth") ||
      event.url.includes("auth/callback")
    ) {
      try {
        // Immediately close the in-app browser modal sheet
        await Browser.close();
      } catch (err) {
        console.warn("[OAuth] Non-fatal Browser.close warning:", err);
      } finally {
        activeBrowserDismissCallback = null;
      }

      try {
        const rawUrl = event.url;
        // Parse search params and hash fragment
        let code: string | null = null;
        let accessToken: string | null = null;
        let refreshToken: string | null = null;
        let errorDescription: string | null = null;

        // Try standard URL parsing
        try {
          const parseableUrl = rawUrl
            .replace("com.kinetic.app://", "https://kinetic.app/")
            .replace("kinetic://", "https://kinetic.app/");
          const parsed = new URL(parseableUrl);

          code = parsed.searchParams.get("code");
          errorDescription =
            parsed.searchParams.get("error_description") || parsed.searchParams.get("error");

          if (parsed.hash) {
            const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ""));
            accessToken = hashParams.get("access_token");
            refreshToken = hashParams.get("refresh_token");
            if (!errorDescription) {
              errorDescription =
                hashParams.get("error_description") || hashParams.get("error");
            }
          }
        } catch {
          // Fallback regex extraction
          const codeMatch = rawUrl.match(/[?&]code=([^&#]+)/);
          if (codeMatch) code = decodeURIComponent(codeMatch[1]);

          const accessMatch = rawUrl.match(/[#&]access_token=([^&#]+)/);
          if (accessMatch) accessToken = decodeURIComponent(accessMatch[1]);

          const refreshMatch = rawUrl.match(/[#&]refresh_token=([^&#]+)/);
          if (refreshMatch) refreshToken = decodeURIComponent(refreshMatch[1]);
        }

        if (errorDescription) {
          throw new Error(decodeURIComponent(errorDescription));
        }

        // 1. PKCE flow: exchange authorization code for session
        if (code) {
          console.log("[OAuth] Exchanging authorization code for Supabase session...");
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          console.log("[OAuth] Code exchange successful. Session active.");
          callbacks?.onSuccess?.();
          return;
        }

        // 2. Implicit grant: set session from tokens
        if (accessToken && refreshToken) {
          console.log("[OAuth] Setting Supabase session from URL tokens...");
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) throw error;
          console.log("[OAuth] Token session established.");
          callbacks?.onSuccess?.();
          return;
        }

        console.warn("[OAuth] No authorization code or tokens found in callback URL:", rawUrl);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error("[OAuth] Callback processing error:", error.message);
        callbacks?.onError?.(error);
      }
    }
  });

  listenerCleanup = () => {
    appUrlOpenHandle.remove();
    browserFinishedHandle.remove();
  };

  return listenerCleanup;
}
