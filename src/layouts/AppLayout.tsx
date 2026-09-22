import { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import SystemBar from "@/components/system-bar/SystemBar";
import { DashboardDataProvider } from "@/providers/DashboardDataProvider";
import { ViewportNavDiagnostic } from "@/components/diagnostics/ViewportNavDiagnostic";
import { CommandPalette } from "@/components/shared/CommandPalette";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";
import { deriveGuidance } from "@/lib/guidance";
import { deriveInsights } from "@/lib/insights";
import { triggerHaptic } from "@/lib/haptics";

const NAV_ROUTES = ["/", "/journey", "/quests", "/mentor", "/profile"] as const;

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, profile } = useAuth();
  return (
    <DashboardDataProvider userId={user?.id} timezone={profile?.timezone}>
      <AppLayoutContent profile={profile}>{children}</AppLayoutContent>
    </DashboardDataProvider>
  );
}

function AppLayoutContent({ children, profile }: AppLayoutProps & { profile: ReturnType<typeof useAuth>['profile'] }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, activeQuests } = useDashboardDataContext();
  const guidance = deriveGuidance(state?.quests || [], profile?.timezone || "UTC");
  const insights = deriveInsights(state?.quests || []);
  const activeQuestCount = activeQuests?.length ?? 0;
  const hasMentorInsight = guidance.length > 0 || insights.length > 0;

  const touchStartRef = useRef<{ x: number; y: number; time: number; valid: boolean } | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    if (e.touches.length !== 1) {
      touchStartRef.current = null;
      return;
    }
    const touch = e.touches[0];
    const target = e.target as HTMLElement | null;

    // ATTENTIVE CHECK: strictly ignore touch if originating inside:
    // - Sliders or swipe-to-confirm tracks
    // - Form controls: input, textarea, select, button, slider
    // - Any element marked data-prevent-swipe
    if (
      target?.closest(
        '[data-prevent-swipe], .swipe-to-complete, button, input, textarea, select, [role="slider"], [role="scrollbar"]'
      )
    ) {
      touchStartRef.current = null;
      return;
    }

    // Check if any parent element is horizontally scrollable
    let el: HTMLElement | null = target;
    let isScrollableX = false;
    while (el && el !== e.currentTarget) {
      const style = window.getComputedStyle(el);
      if (
        (style.overflowX === "auto" || style.overflowX === "scroll") &&
        el.scrollWidth > el.clientWidth
      ) {
        isScrollableX = true;
        break;
      }
      el = el.parentElement;
    }

    if (isScrollableX) {
      touchStartRef.current = null;
      return;
    }

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
      valid: true,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLElement>) => {
    if (!touchStartRef.current || !touchStartRef.current.valid) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const elapsed = Date.now() - touchStartRef.current.time;
    touchStartRef.current = null;

    // Attentive constraints:
    // Fast (< 500ms), sufficient distance (> 65px), and strictly horizontal (|deltaX| > |deltaY| * 2)
    if (elapsed > 500 || Math.abs(deltaX) < 65 || Math.abs(deltaX) < Math.abs(deltaY) * 2) {
      return;
    }

    const currentPath = location.pathname;
    const currentIndex = NAV_ROUTES.findIndex((r) =>
      r === "/" ? currentPath === "/" : currentPath.startsWith(r)
    );
    if (currentIndex === -1) return;

    if (deltaX < -65) {
      // Swiped Left -> go to Next tab
      if (currentIndex < NAV_ROUTES.length - 1) {
        triggerHaptic("selection");
        navigate(NAV_ROUTES[currentIndex + 1]);
      }
    } else if (deltaX > 65) {
      // Swiped Right -> go to Previous tab
      if (currentIndex > 0) {
        triggerHaptic("selection");
        navigate(NAV_ROUTES[currentIndex - 1]);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <div className="env-light-layer" aria-hidden="true" />
      <ViewportNavDiagnostic />
      <CommandPalette />

      <SystemBar
        username={profile?.username ?? "Member"}
        activeQuestCount={activeQuestCount}
        hasMentorInsight={hasMentorInsight}
      />

      {/* ── Content area with attentive swipe-to-navigate ─────────── */}
      <main
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="flex-1 min-w-0 overflow-y-auto pb-[calc(108px+env(safe-area-inset-bottom,0px))] md:pb-0 material-surface material-workspace"
      >
        {children}
      </main>
    </div>
  );
}
