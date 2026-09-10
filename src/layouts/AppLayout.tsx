import { useAuth } from "@/hooks/useAuth";
import SystemBar from "@/components/system-bar/SystemBar";
import { DashboardDataProvider } from "@/providers/DashboardDataProvider";
import { ViewportNavDiagnostic } from "@/components/diagnostics/ViewportNavDiagnostic";

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
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <div className="env-light-layer" aria-hidden="true" />
      <ViewportNavDiagnostic />

      <SystemBar
        username={profile?.username ?? "Hunter"}
      />

      {/* ── Content area ─────────────────────────────────────────────── */}
      {/* Founder Decision (Bottom-nav polish chunk): reserved bottom
          space recalculated after the nav bar's own height changed from
          60px to 56px — this is exactly the class of bug that caused
          "shadow above the nav bar": the two files' floating-pill math
          drifted out of sync when only one side was edited. Pill height
          (56px) + floating clearance above the safe area (12px, see
          SystemBar.tsx) + 8px breathing room so content doesn't sit
          flush against the pill = 76px, plus the safe-area inset itself. */}
      <main className="flex-1 min-w-0 overflow-y-auto pb-[calc(76px+env(safe-area-inset-bottom))] md:pb-0 material-surface material-workspace">
        {children}
      </main>

      {/* Founder Decision (Mobile shadow-direction chunk): the scroll-
          edge gradient fade that used to sit here has been removed
          entirely, not just repositioned. It was a dark, top-to-bottom
          gradient placed directly above the pill — visually
          indistinguishable from "a shadow sitting above the bar," which
          is the exact confusion reported twice now. Removing it, and
          letting the pill's own box-shadow (bottom-weighted, see
          SystemBar.tsx) be the only shadow-like element near the nav,
          resolves the ambiguity by construction rather than by further
          tuning two competing effects against each other. */}
    </div>
  );
}
