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
const TOUR_STORAGE_KEY = "tis-tour-seen";

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
    if (localStorage.getItem(TOUR_STORAGE_KEY)) return;
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
      className="fixed inset-x-4 bottom-[calc(88px+env(safe-area-inset-bottom))] z-50 mx-auto max-w-sm rounded-2xl border border-border bg-card p-4 shadow-[0_14px_28px_-4px_rgba(0,0,0,0.45)] sm:bottom-6"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Skip tour"
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
      <p className="text-label text-primary">{current.title}</p>
      <p className="mt-1.5 max-w-[85%] text-body-sm text-foreground">{current.body}</p>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 w-1.5 rounded-full ${i === step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
        <Button
          size="sm"
          className="min-h-9"
          onClick={() => (isLast ? dismiss() : setStep((s) => (s ?? 0) + 1))}
        >
          {isLast ? "Got it" : "Next"}
        </Button>
      </div>
    </div>
  );
}
