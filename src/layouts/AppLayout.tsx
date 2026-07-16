import { useAuth } from "@/hooks/useAuth";
import { useDashboardData } from "@/hooks/useDashboardData";
import { getRankForLevel } from "@/lib/identity";
import SystemBar from "@/components/system-bar/SystemBar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, profile } = useAuth();
  const { state } = useDashboardData(user?.id);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <SystemBar
        username={profile?.username ?? "Hunter"}
        level={state.level}
        rank={getRankForLevel(state.level)}
      />

      {/* ── Content area ─────────────────────────────────────────────── */}
      <main className="flex-1 min-w-0 overflow-y-auto pb-[60px] md:pb-0">
        {children}
      </main>
    </div>
  );
}
