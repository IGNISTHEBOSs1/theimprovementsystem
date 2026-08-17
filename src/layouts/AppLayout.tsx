import { useAuth } from "@/hooks/useAuth";
import SystemBar from "@/components/system-bar/SystemBar";
import { DashboardDataProvider } from "@/providers/DashboardDataProvider";

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

      <SystemBar
        username={profile?.username ?? "Hunter"}
      />

      {/* ── Content area ─────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 overflow-y-auto pb-[calc(60px+env(safe-area-inset-bottom))] md:pb-0 material-surface material-workspace">
        {children}
      </main>
    </div>
  );
}
