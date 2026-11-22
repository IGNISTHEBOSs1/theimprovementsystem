// src/hooks/useGoogleOneTap.ts
import { useEffect, useRef } from "react";
import { isCapacitorNative } from "@/services/otaUpdateService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface GoogleCredentialResponse {
  credential?: string;
  select_by?: string;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void | Promise<void>;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
            context?: "signin" | "signup" | "use";
          }) => void;
          prompt: (momentListener?: (notification: {
            isNotDisplayed: () => boolean;
            isSkippedMoment: () => boolean;
            isDismissedMoment: () => boolean;
            getNotDisplayedReason: () => string;
            getSkippedReason: () => string;
            getDismissedReason: () => string;
          }) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}

/**
 * useGoogleOneTap
 * ─────────────────────────────────────────────────────────────────────────────
 * Enables the ambient Google One-Tap account chooser on Web browsers.
 * Skipped entirely on Capacitor Native (which uses Android Credential Manager).
 */
export function useGoogleOneTap(enabled: boolean = true) {
  const initializedRef = useRef(false);

  useEffect(() => {
    // Only run on Web
    if (isCapacitorNative() || !enabled) return;

    const webClientId = import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID;
    if (!webClientId) {
      console.warn("[OneTap] VITE_GOOGLE_WEB_CLIENT_ID not set. Ambient One Tap disabled.");
      return;
    }

    let isMounted = true;

    const initOneTap = () => {
      if (!isMounted || !window.google?.accounts?.id || initializedRef.current) return;

      try {
        window.google.accounts.id.initialize({
          client_id: webClientId,
          auto_select: false,
          cancel_on_tap_outside: true,
          context: "signin",
          callback: async (response: GoogleCredentialResponse) => {
            if (!response.credential) return;

            console.log("[OneTap] Exchanging Google One-Tap credential with Supabase...");
            const { error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: response.credential,
            });

            if (error) {
              console.error("[OneTap] Supabase sign-in error:", error.message);
              toast({
                title: "Google sign-in failed",
                description: error.message,
                variant: "destructive",
              });
            } else {
              toast({ title: "Welcome back!" });
            }
          },
        });

        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed()) {
            console.log("[OneTap] Prompt not displayed:", notification.getNotDisplayedReason());
          }
        });

        initializedRef.current = true;
      } catch (err) {
        console.warn("[OneTap] Could not initialize Google One-Tap:", err);
      }
    };

    // Check if script already exists
    if (window.google?.accounts?.id) {
      initOneTap();
    } else {
      const existingScript = document.getElementById("google-gsi-script");
      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "google-gsi-script";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          initOneTap();
        };
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener("load", initOneTap);
      }
    }

    return () => {
      isMounted = false;
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [enabled]);
}
