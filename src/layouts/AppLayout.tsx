import { useAuth } from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useJustLeveledUp } from "@/hooks/useJustLeveledUp";
import { getRankForLevel } from "@/lib/identity";
import SystemBar from "@/components/system-bar/SystemBar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, profile } = useAuth();
  const { state } = useDashboardData(user?.id);
  const justLeveledUp = useJustLeveledUp(state.level);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <div className="env-light-layer" aria-hidden="true" />

      <SystemBar
        username={profile?.username ?? "Hunter"}
        rank={getRankForLevel(state.level)}
        justLeveledUp={justLeveledUp}
      />

      {/* ── Content area ─────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 overflow-y-auto pb-[60px] md:pb-0 material-surface material-workspace">
        {children}
      </main>
    </div>
  );
}
