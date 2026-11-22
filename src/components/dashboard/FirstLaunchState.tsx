// src/components/dashboard/FirstLaunchState.tsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { OnboardingState } from "@/components/onboarding/types";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardDataContext } from "@/providers/DashboardDataProvider";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface FirstLaunchStateProps {
  name: string;
}

export function FirstLaunchState({ name }: FirstLaunchStateProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateProfile, completeFirstLaunch } = useAuth();
  const { seedOnboardingRoutines, reload } = useDashboardDataContext();
  const [isFinishing, setIsFinishing] = useState(false);

  const handleComplete = async (state: OnboardingState) => {
    setIsFinishing(true);
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + (state.horizonDays || 90));
      const targetDateStr = targetDate.toISOString().split("T")[0];

      // If user is authenticated, persist to Supabase
      if (user) {
        await updateProfile({
          primary_goal: state.primaryGoal,
          primary_goal_target_date: targetDateStr,
          timezone: state.timezone,
        });

        // Seed both supporting routines cleanly in a single batch
        if (seedOnboardingRoutines && state.supportingRoutines?.length > 0) {
          try {
            await seedOnboardingRoutines(state.supportingRoutines, state.primaryGoal);
          } catch (rErr) {
            console.warn("Could not seed routine quests:", rErr);
          }
        }

        const { error: launchErr } = await completeFirstLaunch();
        if (launchErr) {
          console.warn("First launch flag update warning:", launchErr);
        }

        if (reload) {
          await reload();
        }

        toast({
          title: "Trajectory Initialized",
          description: "Your 90-day focus and routines are active in your cockpit.",
        });

        // Navigate to cockpit if on standalone /onboarding route
        if (location.pathname === "/onboarding") {
          navigate("/", { replace: true });
        }
      } else {
        // Unauthenticated visitor (e.g. preview, or completing onboarding prior to account creation)
        localStorage.setItem("kinetic_pending_onboarding", JSON.stringify({
          ...state,
          primary_goal_target_date: targetDateStr,
        }));
        localStorage.setItem("kinetic_preview_completed", "true");

        toast({
          title: "Covenant Calibrated",
          description: "Create your account or log in to seal your covenant in your personal cockpit.",
        });

        // Route to auth with signup mode to complete account initialization
        navigate("/auth?mode=signup", { replace: true });
      }
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
      // Fallback navigation so user is never trapped
      if (user) {
        await completeFirstLaunch();
        if (location.pathname === "/onboarding") navigate("/", { replace: true });
      } else {
        navigate("/auth", { replace: true });
      }
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] w-full bg-background text-foreground flex flex-col items-center justify-start overflow-y-auto overflow-x-hidden pt-[calc(env(safe-area-inset-top,0px)+12px)] pb-[calc(env(safe-area-inset-bottom,0px)+24px)] px-3.5 sm:px-6 md:px-8">
      {/* Environmental light layer matching app shell */}
      <div className="env-light-layer pointer-events-none" aria-hidden="true" />

      <div className="relative z-10 w-full max-w-2xl mx-auto min-w-0 flex-1 flex flex-col items-stretch justify-start py-1">
        {isFinishing ? (
          <div className="rounded-2xl border border-border/80 bg-card p-8 flex flex-col items-center justify-center gap-4 text-center shadow-[var(--shadow-card)] my-auto">
            <Loader2 className="h-8 w-8 motion-safe:animate-spin text-foreground" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-foreground">Initializing Cockpit Trajectory</h3>
              <p className="text-xs text-muted-foreground">
                Seeding 90-day horizon and supporting daily routines…
              </p>
            </div>
          </div>
        ) : (
          <OnboardingFlow onComplete={handleComplete} />
        )}
      </div>
    </div>
  );
}
