import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CapacityMeterProps {
  committedCount: number;
  maxSlots?: number;
  onAddPressed?: () => void;
  className?: string;
}

export function CapacityMeter({
  committedCount,
  maxSlots = 3,
  onAddPressed,
  className,
}: CapacityMeterProps) {
  const remaining = Math.max(0, maxSlots - committedCount);
  const isFull = committedCount >= maxSlots;

  return (
    <section
      aria-label="Capacity Status Meter"
      className={cn(
        "relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[rgba(148,163,184,0.14)] bg-[#12141A] p-4 sm:p-5 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_12px_32px_-4px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-all duration-200",
        className
      )}
    >
      {/* Background radial gradient subtle highlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          background: "radial-gradient(ellipse 500px 140px at 50% 0%, rgba(16, 185, 129, 0.1), transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col gap-3.5">
        {/* Header Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[rgba(148,163,184,0.15)] bg-[#181B24] text-[10px] font-mono font-bold tracking-wider text-emerald-400 uppercase">
              <span className="size-1.5 rounded-full bg-emerald-400" />
              <span>CAPACITY STATUS</span>
            </div>
            <span className="text-sm font-sans font-bold text-foreground tnum">
              {committedCount} of {maxSlots} Commitments
            </span>
          </div>

          {/* 48x48 Quick Add Button */}
          {!isFull && onAddPressed && (
            <button
              type="button"
              onClick={onAddPressed}
              aria-label="Add new commitment"
              className="size-10 sm:size-11 rounded-xl border border-[rgba(148,163,184,0.14)] bg-[#181B24] text-emerald-400 hover:text-emerald-300 hover:bg-[#202430] flex items-center justify-center shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.1)] active:scale-[0.92] transition-all cursor-pointer"
              title="Add commitment"
            >
              <Plus className="size-5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* 3-Segmented Pill Gauges */}
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: maxSlots }).map((_, index) => {
            const isFilled = index < committedCount;
            const isFocusSlot = index === 0;

            return (
              <div key={index} className="flex flex-col gap-1.5">
                <div
                  className={cn(
                    "h-2 sm:h-2.5 rounded-full transition-all duration-300",
                    isFilled
                      ? "bg-emerald-500 border border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.45)]"
                      : "bg-[#181B24] border border-[rgba(148,163,184,0.14)]"
                  )}
                />
                <span className="text-[10px] font-mono font-semibold text-muted-foreground uppercase text-center tnum">
                  {isFocusSlot ? "Primary" : `Routine ${index}`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Guidance Sub-Line */}
        <p className="text-xs text-muted-foreground font-sans">
          {isFull ? (
            <span className="text-amber-400/90 font-medium">
              Focus locked · Complete an active commitment before adding another
            </span>
          ) : (
            <span>
              <strong className="text-foreground font-semibold tnum">{remaining}</strong> {remaining === 1 ? "slot" : "slots"} available · 1 Primary Focus + 2 Companion Routines
            </span>
          )}
        </p>
      </div>
    </section>
  );
}
