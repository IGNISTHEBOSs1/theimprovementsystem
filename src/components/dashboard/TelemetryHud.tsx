import { ArrowUpRight, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";

interface TelemetryHudProps {
  velocityIndex?: string | number;
  marginDays?: string | number;
  horizonDays?: string | number;
  statusText?: string;
  completedCount?: number;
  totalHorizonCount?: number;
  className?: string;
}

export function TelemetryHud({
  velocityIndex = "1.25x",
  marginDays = "+16d",
  horizonDays = "90d",
  statusText = "SYSTEM LOCKED // ON TRACK",
  completedCount = 72,
  totalHorizonCount = 90,
  className,
}: TelemetryHudProps) {
  const formattedVelocity = typeof velocityIndex === "number" ? velocityIndex.toFixed(2) : String(velocityIndex).replace(/x$/, "");
  const formattedMargin = typeof marginDays === "number" ? `${marginDays > 0 ? "+" : ""}${marginDays}` : String(marginDays).replace(/d$/, "");
  const targetPercent = Math.min(100, Math.max(10, Math.round((completedCount / (totalHorizonCount || 90)) * 100)));

  return (
    <section
      aria-label="Telemetry HUD Status"
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[rgba(148,163,184,0.18)] bg-[#12141A]/95 p-3.5 sm:p-4 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.15),0_12px_32px_-4px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-200",
        className
      )}
    >
      {/* Background radial gradient subtle highlight */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(ellipse 600px 180px at 50% -20%, rgba(16, 185, 129, 0.12), transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Upper Telemetry Row (1:1 Stitch Obsidian Kinetic Spec) */}
      <div className="relative z-10 flex items-center justify-between border-b border-[rgba(148,163,184,0.14)] pb-2.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="text-[10px] tracking-wider font-mono text-emerald-400 font-bold uppercase">
            {statusText}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.15)]">
          <Gauge className="size-3 text-emerald-400" aria-hidden="true" />
          <span className="font-mono text-[10px] text-emerald-400 font-bold tnum">
            {formattedVelocity}x V-INDEX
          </span>
        </div>
      </div>

      {/* Telemetry Metric Triad (1:1 Stitch Grid Spec) */}
      <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-3 pt-2.5 text-center">
        {/* Metric 1: Velocity Vector */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-[#0C0E14]/75 border border-[rgba(148,163,184,0.14)] flex flex-col items-center justify-center shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.06)] hover:border-emerald-500/30 transition-colors">
          <span className="text-[10px] font-mono text-muted-foreground font-medium tracking-tight uppercase">
            VELOCITY
          </span>
          <div className="flex items-baseline gap-0.5 mt-0.5">
            <ArrowUpRight className="size-3 text-emerald-400" aria-hidden="true" />
            <span className="text-base sm:text-lg font-bold text-foreground font-mono tnum">
              {formattedVelocity}
            </span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono font-medium">
            +18% Thrust
          </span>
        </div>

        {/* Metric 2: Buffer Counter */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-[#0C0E14]/75 border border-[rgba(148,163,184,0.14)] flex flex-col items-center justify-center shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.06)] hover:border-emerald-500/30 transition-colors">
          <span className="text-[10px] font-mono text-muted-foreground font-medium tracking-tight uppercase">
            BUFFER MARGIN
          </span>
          <div className="flex items-baseline gap-0.5 mt-0.5">
            <span className="text-base sm:text-lg font-bold text-emerald-400 font-mono tnum">
              {formattedMargin}
            </span>
            <span className="text-[10px] text-emerald-400 font-mono">
              d
            </span>
          </div>
          <span className="text-[10px] text-emerald-400/80 font-mono">
            Runway Ext.
          </span>
        </div>

        {/* Metric 3: Target Trajectory */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-[#0C0E14]/75 border border-[rgba(148,163,184,0.14)] flex flex-col items-center justify-center shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.06)] hover:border-emerald-500/30 transition-colors">
          <span className="text-[10px] font-mono text-muted-foreground font-medium tracking-tight uppercase">
            90-DAY TARGET
          </span>
          <div className="flex items-baseline gap-0.5 mt-0.5">
            <span className="text-base sm:text-lg font-bold text-foreground font-mono tnum">
              {completedCount}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              /{totalHorizonCount}
            </span>
          </div>
          <div className="w-full bg-[#181B24] h-1.5 rounded-full mt-1.5 overflow-hidden border border-[rgba(148,163,184,0.1)]">
            <div
              className="bg-gradient-to-r from-emerald-500/70 to-emerald-400 h-full rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all duration-300"
              style={{ width: `${targetPercent}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
