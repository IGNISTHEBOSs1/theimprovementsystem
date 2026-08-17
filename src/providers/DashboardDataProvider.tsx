import { createContext, useContext, type ReactNode } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';

// Ensures exactly one live instance of the canonical dashboard state exists
// per render tree. Before this, AppLayout and Dashboard each called
// useDashboardData independently — two separate Supabase reads on load and
// two separate write paths on quest completion, including two independent
// useAchievements instances persisting to the same DB row. See
// TIS-INFRA-006.
//
// This does not change useDashboardData itself, or any progression,
// attribute, achievement, or persistence logic inside it (see
// TIS-INFRA-003/004/005) — it only ensures the hook runs once and its
// result is shared.

type DashboardDataContextValue = ReturnType<typeof useDashboardData>;

const DashboardDataContext = createContext<DashboardDataContextValue | null>(null);

interface DashboardDataProviderProps {
  userId?: string;
  timezone?: string | null;
  children: ReactNode;
}

export function DashboardDataProvider({ userId, timezone, children }: DashboardDataProviderProps) {
  const value = useDashboardData(userId, timezone);
  return (
    <DashboardDataContext.Provider value={value}>
      {children}
    </DashboardDataContext.Provider>
  );
}

export function useDashboardDataContext(): DashboardDataContextValue {
  const context = useContext(DashboardDataContext);
  if (!context) {
    throw new Error('useDashboardDataContext must be used within a DashboardDataProvider');
  }
  return context;
}
