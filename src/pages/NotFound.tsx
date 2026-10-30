import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Compass, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 bg-background text-foreground">
      <main className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xs text-center space-y-6 relative overflow-hidden" aria-labelledby="not-found-heading">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/80 bg-muted/60 text-xs font-medium text-muted-foreground">
          <span className="size-2 rounded-full bg-warning" aria-hidden="true" />
          <span>Status 404 · Vector Diverged</span>
        </div>

        <div className="size-14 mx-auto rounded-2xl border border-border bg-muted/40 flex items-center justify-center text-primary shadow-xs">
          <Compass className="size-7" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h1 id="not-found-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Coordinate Unavailable
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            The requested route <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-foreground text-xs">{location.pathname}</code> does not correspond to an active system vector.
          </p>
        </div>

        <Button asChild size="default" variant="default" className="w-full h-11 rounded-xl font-semibold text-xs sm:text-sm gap-2">
          <Link to="/">
            <span>Return to Dashboard</span>
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </main>
    </div>
  );
};

export default NotFound;
