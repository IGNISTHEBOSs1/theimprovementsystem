import { Atom } from "loading-dev";

export function AtomDemo() {
  return <Atom size={48} />;
}

export function LoadingScreen({ message }: { message?: string }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 select-none relative z-50">
      <div className="p-4 rounded-2xl bg-card/60 border border-white/10 backdrop-blur-xl shadow-2xl kinetic-specular-box flex items-center justify-center text-foreground">
        <AtomDemo />
      </div>
      {message && (
        <p className="text-xs font-tech-mono tracking-widest text-muted-foreground uppercase animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}

export function CockpitRouteSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-6 pb-24 sm:px-8 sm:py-10 space-y-6" aria-busy="true" aria-label="Loading workspace">
      {/* PageHeader Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-border/60">
        <div className="space-y-2">
          <div className="h-3 w-28 rounded bg-muted/60 animate-pulse" />
          <div className="h-8 w-56 rounded-lg bg-muted/60 animate-pulse" />
        </div>
        <div className="h-8 w-36 rounded-full bg-muted/60 animate-pulse" />
      </div>

      {/* Primary Card Skeleton */}
      <div className="rounded-2xl border border-border/60 bg-muted/40 p-6 animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-4 w-32 rounded bg-muted/60" />
          <div className="h-4 w-20 rounded bg-muted/60" />
        </div>
        <div className="h-7 w-3/4 rounded-lg bg-muted/60" />
        <div className="h-4 w-1/2 rounded bg-muted/60" />
      </div>

      {/* 2-Column Bento Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border/60 bg-muted/40 p-6 animate-pulse space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-24 rounded bg-muted/60" />
            <div className="h-3.5 w-16 rounded bg-muted/60" />
          </div>
          <div className="h-9 w-20 rounded-lg bg-muted/60" />
          <div className="h-2 w-full rounded-full bg-muted/60" />
          <div className="h-3 w-40 rounded bg-muted/60" />
        </div>
        <div className="rounded-2xl border border-border/60 bg-muted/40 p-6 animate-pulse space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-24 rounded bg-muted/60" />
            <div className="h-3.5 w-16 rounded bg-muted/60" />
          </div>
          <div className="h-9 w-20 rounded-lg bg-muted/60" />
          <div className="h-2 w-full rounded-full bg-muted/60" />
          <div className="h-3 w-40 rounded bg-muted/60" />
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
