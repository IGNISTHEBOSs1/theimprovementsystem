import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { soundEngine } from "@/hooks/useSoundEffects";
import { triggerHaptic } from "@/lib/haptics";

interface UseGlobalShortcutsOptions {
  onOpenCommandPalette?: () => void;
}

export function useGlobalShortcuts({ onOpenCommandPalette }: UseGlobalShortcutsOptions = {}) {
  const navigate = useNavigate();
  const pendingGRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Never intercept when user is typing in forms or editable elements
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable ||
          Boolean(target.closest('[role="dialog"]')) ||
          Boolean(target.closest('[role="menu"]')) ||
          Boolean(target.closest('[role="listbox"]')) ||
          Boolean(target.closest('[role="combobox"]')))
      ) {
        return;
      }

      // Handle Escape to cancel any pending chord sequence
      if (e.key === "Escape") {
        if (pendingGRef.current) {
          pendingGRef.current = false;
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
          return;
        }
      }

      // 2. Modifiers: Cmd+K / Ctrl+K is handled by CommandPalette itself or here
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenCommandPalette?.();
        window.dispatchEvent(new CustomEvent("tis:toggle-command-palette"));
        return;
      }

      // Ignore other modified keypresses (Alt, Ctrl, Meta)
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      // 3. Two-key sequence starting with 'g' (Go to...)
      if (pendingGRef.current) {
        pendingGRef.current = false;
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }

        const key = e.key.toLowerCase();
        switch (key) {
          case "d":
            e.preventDefault();
            soundEngine.playNavigation();
            triggerHaptic("selection");
            navigate("/");
            return;
          case "q":
            e.preventDefault();
            soundEngine.playNavigation();
            triggerHaptic("selection");
            navigate("/quests");
            return;
          case "j":
            e.preventDefault();
            soundEngine.playNavigation();
            triggerHaptic("selection");
            navigate("/journey");
            return;
          case "m":
            e.preventDefault();
            soundEngine.playNavigation();
            triggerHaptic("selection");
            navigate("/mentor");
            return;
          case "p":
            e.preventDefault();
            soundEngine.playNavigation();
            triggerHaptic("selection");
            navigate("/profile");
            return;
          case "h":
            e.preventDefault();
            soundEngine.playNavigation();
            triggerHaptic("selection");
            navigate("/profile/history");
            return;
          case "s":
            e.preventDefault();
            soundEngine.playNavigation();
            triggerHaptic("selection");
            navigate("/profile/settings");
            return;
          default:
            // Non-matching second key
            break;
        }
      }

      // 4. Initiating 'g' sequence
      if (e.key.toLowerCase() === "g") {
        pendingGRef.current = true;
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          pendingGRef.current = false;
        }, 1200);
        return;
      }

      // 5. Single key shortcuts
      if (e.key.toLowerCase() === "c") {
        e.preventDefault();
        soundEngine.playTap();
        triggerHaptic("light");
        window.dispatchEvent(new CustomEvent("tis:open-commitment"));
        if (window.location.pathname !== "/quests") {
          navigate("/quests", { state: { openNewCommitment: true } });
        }
        return;
      }

      if (e.key === "?") {
        e.preventDefault();
        onOpenCommandPalette?.();
        window.dispatchEvent(new CustomEvent("tis:toggle-command-palette"));
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [navigate, onOpenCommandPalette]);
}
