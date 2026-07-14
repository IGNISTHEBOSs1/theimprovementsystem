import { Compass } from "lucide-react";

interface DirectionCardProps {
  name: string;
}

export function DirectionCard({ name }: DirectionCardProps) {
  return (
    <section className="rounded-2xl border border-border bg-card px-5 py-6 sm:px-7" aria-labelledby="direction-heading">
      <div className="flex items-start gap-3">
        <Compass className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
        <div>
          <p className="text-label text-muted-foreground">Your direction</p>
          <h2 id="direction-heading" className="mt-1 text-xl font-semibold tracking-tight text-foreground">
            Build a life you can direct with confidence.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {name}, each deliberate action is evidence of the person you are becoming.
          </p>
        </div>
      </div>
    </section>
  );
}
