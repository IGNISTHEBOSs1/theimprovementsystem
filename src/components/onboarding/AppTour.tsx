import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Founder Decision (First-time tutorial chunk): a short, skippable
// sequence of floating cards shown once, the first time a returning
// user lands on the Dashboard after completing First Launch. Gated on
// localStorage, not a new database column — this is a device-local "has
// this browser seen the tour" flag, not meaningful user data worth a
// migration or cross-device sync (per "prefer existing data structures
// before migrations"; the honest alternative to a new column here is no
// persistence at all, which would show the tour every load — worse).
// Four steps, one concept each, no arrows/anchoring to specific DOM
// elements — that would need fragile position-tracking code for a
// one-time, low-stakes UI. A simple bottom-anchored card sequence is the
// smallest reliable implementation of "small floating cards telling the
// info." Never blocks interaction — the rest of the page stays fully
// usable underneath, and Skip is available on every step.
const TOUR_STORAGE_KEY = "kinetic-tour-seen";

const STEPS = [
  { title: "Dashboard", body: "This is where you see what matters today — nothing more." },
  { title: "One focus", body: "Commit to one meaningful action at a time. That's the whole idea." },
  { title: "Journey", body: "Shows how your actions are actually moving you toward your goal." },
  { title: "Mentor", body: "Reflects real patterns back to you — never a score, never a guess." },
];

export function AppTour() {
  const [step, setStep] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(TOUR_STORAGE_KEY) || new URLSearchParams(window.location.search).has('dev_preview')) return;
    setStep(0);
  }, []);

  const dismiss = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, "1");
    setStep(null);
  };

  if (step === null) return null;
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      role="dialog"
      aria-label="Quick tour"
      className="fixed inset-x-4 bottom-[calc(88px+env(safe-area-inset-bottom))] z-50 mx-auto max-w-sm rounded-2xl border border-[rgba(148,163,184,0.18)] bg-[#12141A] p-4 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_16px_36px_-4px_rgba(0,0,0,0.65)] backdrop-blur-xl sm:bottom-6"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Skip tour"
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5 active:scale-[0.96] transition-all"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
      <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-400">{current.title}</p>
      <p className="mt-1.5 max-w-[88%] text-sm text-foreground/90 font-sans">{current.body}</p>
      <div className="mt-3.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === step ? "w-4 bg-white" : "w-1.5 bg-white/20"}`}
            />
          ))}
        </div>
        <Button
          size="sm"
          className="min-h-9 rounded-xl px-4 bg-white text-black hover:bg-zinc-200 font-bold active:scale-[0.98] transition-all shadow-[0_0_12px_rgba(255,255,255,0.15)]"
          onClick={() => (isLast ? dismiss() : setStep((s) => (s ?? 0) + 1))}
        >
          {isLast ? "Got it" : "Next"}
        </Button>
      </div>
    </div>
  );
}
