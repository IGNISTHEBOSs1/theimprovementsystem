import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { App } from "@capacitor/app";
import { isCapacitorNative } from "@/services/otaUpdateService";

export function useAndroidBackNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isCapacitorNative()) return;

    const backListener = App.addListener("backButton", ({ canGoBack }) => {
      // 1. Check if any open modal/dialog or command palette is visible
      const openDialogCloseBtn = document.querySelector<HTMLButtonElement>(
        '[role="dialog"] button[aria-label="Close"], [role="dialog"] [data-dialog-close]'
      );
      if (openDialogCloseBtn) {
        openDialogCloseBtn.click();
        return;
      }

      // 2. Check if onboarding is active and can step back
      const onboardingBackBtn = document.querySelector<HTMLButtonElement>(
        '[data-onboarding-back="true"]'
      );
      if (onboardingBackBtn && !onboardingBackBtn.disabled) {
        onboardingBackBtn.click();
        return;
      }

      // 3. Sub-route navigation
      if (location.pathname === "/profile/settings" || location.pathname === "/profile/history") {
        navigate("/profile");
        return;
      }

      // 3. Primary navigation tabs: return to Dashboard
      if (location.pathname !== "/") {
        navigate("/");
        return;
      }

      // 4. On root Dashboard: exit/minimize app cleanly
      App.minimizeApp();
    });

    return () => {
      backListener.then((handle) => handle.remove()).catch(() => {});
    };
  }, [location.pathname, navigate]);
}
