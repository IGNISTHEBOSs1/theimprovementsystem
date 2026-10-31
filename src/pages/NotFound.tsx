import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Compass, ArrowRight, LayoutDashboard, CheckSquare, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const NotFound = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    console.error("404 Error: Non-existent route requested:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 sm:p-6 bg-background text-foreground relative overflow-hidden">
      <main
        className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-[var(--shadow-card)] text-center space-y-6 relative overflow-hidden"
        aria-labelledby="not-found-heading"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/80 bg-muted/60 text-xs font-medium text-muted-foreground">
          <span className="size-2 rounded-full bg-amber-500" aria-hidden="true" />
          <span>404 · Page Not Found</span>
        </div>

        <div className="size-14 mx-auto rounded-2xl border border-border bg-muted/40 flex items-center justify-center text-primary shadow-xs">
          <Compass className="size-7" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <h1 id="not-found-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Destination unavailable.
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            The link you followed doesn't exist or may have been moved. Let's get you back to your personal progress.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <Button asChild size="default" className="w-full h-11 rounded-xl font-semibold text-xs sm:text-sm gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[var(--shadow-button)] active:scale-[0.98]">
            <Link to="/">
              <span>{user ? "Return to Dashboard" : "Return to Home"}</span>
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>

          {user ? (
            <div className="pt-2 border-t border-border/60">
              <span className="text-[11px] font-medium text-muted-foreground block mb-2">
                Quick Shortcuts
              </span>
              <div className="flex items-center justify-center gap-2 text-xs">
                <Button variant="ghost" size="sm" asChild className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground">
                  <Link to="/quests">
                    <CheckSquare className="size-3.5 mr-1 text-primary" />
                    Quests
                  </Link>
                </Button>
                <span className="text-border">•</span>
                <Button variant="ghost" size="sm" asChild className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground">
                  <Link to="/journey">
                    <Compass className="size-3.5 mr-1 text-primary" />
                    Journey
                  </Link>
                </Button>
                <span className="text-border">•</span>
                <Button variant="ghost" size="sm" asChild className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground">
                  <Link to="/profile">
                    <User className="size-3.5 mr-1 text-primary" />
                    Profile
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-border/60">
              <Button variant="ghost" size="sm" asChild className="h-9 px-4 text-xs text-muted-foreground hover:text-foreground">
                <Link to="/auth">
                  <LogIn className="size-3.5 mr-1.5 text-primary" />
                  Sign In to Your Account
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default NotFound;
