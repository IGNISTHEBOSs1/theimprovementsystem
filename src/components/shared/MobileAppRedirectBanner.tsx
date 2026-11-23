// src/components/shared/MobileAppRedirectBanner.tsx
import React, { useState, useEffect } from "react";
import { Smartphone, X, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { isMobileDevice, redirectToNativeApp } from "@/lib/mobileAppRedirect";
import { triggerHaptic } from "@/lib/haptics";

export function MobileAppRedirectBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
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
    }
    if (isMobileDevice()) {
      const dismissed = sessionStorage.getItem("kinetic_mobile_banner_dismissed");
      if (!dismissed) {
        setVisible(true);
      }
    }
  }, []);

  const handleOpenApp = () => {
    triggerHaptic.medium();
    redirectToNativeApp();
  };

  const handleDismiss = () => {
    triggerHaptic.light();
    setVisible(false);
    sessionStorage.setItem("kinetic_mobile_banner_dismissed", "true");
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed top-0 left-0 right-0 z-50 p-2 sm:p-3 pointer-events-auto"
      >
        <div className="max-w-md mx-auto rounded-2xl border border-emerald-500/40 bg-slate-900/95 dark:bg-[#090D16]/95 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.5),inset_0_1px_1px_0_rgba(16,185,129,0.3)] p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Smartphone className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                Kinetic for Mobile
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                Open in the native app for the best experience
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleOpenApp}
              className="h-8 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors active:scale-[0.96] shadow-[0_0_12px_rgba(16,185,129,0.4)] flex items-center gap-1 cursor-pointer"
            >
              <span>Open</span>
              <ArrowUpRight className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="size-8 rounded-xl text-muted-foreground hover:text-foreground flex items-center justify-center active:scale-[0.95] cursor-pointer"
              aria-label="Dismiss app banner"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
