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

export default LoadingScreen;
