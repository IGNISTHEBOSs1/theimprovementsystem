interface QuietProgressProps {
  level: number;
  currentXp: number;
  maxXp: number;
  totalQuestsCompleted: number;
}

export function QuietProgress({ level, currentXp, maxXp, totalQuestsCompleted }: QuietProgressProps) {
  const progress = maxXp > 0 ? Math.min(100, Math.round((currentXp / maxXp) * 100)) : 0;

  return (
    <section
      className="flex flex-col justify-between rounded-2xl bg-card/30 p-5 sm:p-6"
      aria-labelledby="progress-heading"
    >
      <div>
        <p className="text-label text-muted-foreground">Evidence of progress</p>
        <div className="mt-3 flex items-baseline justify-between gap-3">
          <h2 id="progress-heading" className="text-base font-medium text-foreground">Level {level}</h2>
          <p className="text-sm tabular-nums text-muted-foreground">{currentXp} / {maxXp} XP</p>
        </div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {totalQuestsCompleted === 0
            ? "Your first completed action will become proof that you can return."
            : `${totalQuestsCompleted} meaningful action${totalQuestsCompleted === 1 ? "" : "s"} completed so far.`}
        </p>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted" aria-label={`${progress}% to next level`}>
        <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${progress}%` }} />
      </div>
    </section>
  );
}
