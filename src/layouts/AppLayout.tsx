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

      {/* Founder Decision (TIS visual toolkit chunk — USE: Gradual Blur,
          adapted): the principle borrowed is "smooth the boundary where
          content meets a fixed layer," applied to the one place TIS
          actually has that boundary — scrollable page content passing
          under the fixed mobile nav dock. Pure CSS gradient fade, no
          blur filter (a blur would cost more and add nothing a fade
          doesn't already achieve), no JS, mobile-only (md:hidden, since
          desktop has no fixed bottom bar to fade into).
          pointer-events-none and positioned below the nav's own z-40, so
          it can never intercept a tap or sit above the nav itself.
          Position matches the pill's own top edge (bottom offset 12px +
          pill height 56px = 68px) — recalculated alongside main's
          padding above for the same reason. */}
      <div
        aria-hidden="true"
        className="md:hidden pointer-events-none fixed inset-x-0 z-30 h-6"
        style={{
          bottom: "calc(68px + env(safe-area-inset-bottom))",
          // Matches .material-surface.material-workspace's exact computed
          // background (elevation 0.4 through the shared formula in
          // index.css: hsl(0 0% calc(2% + elevation * 1.3%))) rather than
          // the raw --background token, which is a slightly different
          // value — using the token here would leave a faint visible seam
          // where the fade meets main's actual rendered background.
          background: "linear-gradient(to bottom, transparent, hsl(0 0% calc(2% + 0.4 * 1.3%) / 0.9))",
        }}
      />
    </div>
  );
}
