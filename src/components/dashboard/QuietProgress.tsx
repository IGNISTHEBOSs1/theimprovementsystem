interface QuietProgressProps {
  level: number;
  currentXp: number;
  maxXp: number;
  totalQuestsCompleted: number;
}

export function QuietProgress({ level, currentXp, maxXp, totalQuestsCompleted }: QuietProgressProps) {
  const progress = maxXp > 0 ? Math.min(100, Math.round((currentXp / maxXp) * 100)) : 0;

  return (
    <section className="border-t border-border pt-7" aria-labelledby="progress-heading">
      <p className="text-label text-muted-foreground">Evidence of progress</p>
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="progress-heading" className="text-lg font-semibold text-foreground">Level {level}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {totalQuestsCompleted === 0
              ? "Your first completed action will become proof that you can return."
              : `${totalQuestsCompleted} meaningful action${totalQuestsCompleted === 1 ? "" : "s"} completed so far.`}
          </p>
        </div>
        <p className="text-sm tabular-nums text-muted-foreground">{currentXp} / {maxXp} XP</p>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted" aria-label={`${progress}% to next level`}>
        <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${progress}%` }} />
      </div>
    </section>
  );
}
