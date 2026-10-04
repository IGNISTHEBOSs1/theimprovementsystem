import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useAuth } from "@/hooks/useAuth";

interface FirstLaunchStateProps {
  name: string;
}

// Phase 1 — Milestone 1 — First Launch. Per Founder Decision (P0 Chunk 1
// rollback), First Launch is purely an entry experience:
//   First Launch → Begin/Enter → Dashboard
// It creates or collects nothing — no Quest, no commitment, no goal, no
// trajectory change, no progression/reward. The single action here calls
// completeFirstLaunch() and nothing else. On success,
// profile.has_completed_first_launch flips and Dashboard swaps to the
// normal view on its own — no navigation call needed here.
export function FirstLaunchState({ name }: FirstLaunchStateProps) {
  const { completeFirstLaunch } = useAuth();

  const [entering, setEntering] = useState(false);
  const [error, setError] = useState(false);

  const handleEnter = async () => {
    setError(false);
    setEntering(true);
    const { error: completeError } = await completeFirstLaunch();
    setEntering(false);
    if (completeError) setError(true);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
      <PageHeader
        eyebrow="Your system"
        title={`Welcome, ${name}.`}
        description="This is where your progress will live."
      />
      <div className="mt-9">
        <section
          className="rounded-[28px] border border-[rgba(148,163,184,0.16)] bg-[#12141A] p-7 sm:p-9 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl specular-top"
          aria-labelledby="first-launch-heading"
        >
          <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-white">Begin</p>
          <h2 id="first-launch-heading" className="mt-2 text-xl font-bold text-foreground">
            Ready to start.
          </h2>
          <Button size="lg" disabled={entering} onClick={handleEnter} className="mt-6 min-h-12 rounded-xl px-7 bg-white text-black hover:bg-zinc-200 font-bold active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] text-sm flex items-center gap-2">
            {entering ? <Loader2 className="size-4 animate-spin text-black" /> : null}
            <span>Begin Your Journey</span>
            {!entering && <ArrowRight className="size-4 text-black" aria-hidden="true" />}
          </Button>
          {error && (
            <p className="mt-3 text-sm text-rose-400" role="alert">
              That didn't go through. You can try again.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
