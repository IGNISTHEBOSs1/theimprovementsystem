import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Compass, CheckSquare, MessageSquare, User } from "lucide-react";

const NAV_ITEMS = [
  { to: "/",         label: "Dashboard", icon: LayoutDashboard },
  { to: "/journey",  label: "Journey",   icon: Compass         },
  { to: "/quests",   label: "Quests",    icon: CheckSquare     },
  { to: "/mentor",   label: "Mentor",    icon: MessageSquare   },
  { to: "/profile",  label: "Profile",   icon: User            },
] as const;

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* ── Desktop top navbar (md+) ─────────────────────────────────── */}
      <header className="hidden md:flex items-center justify-between h-14 px-6 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40">
        {/* Brand */}
        <span className="font-semibold text-sm tracking-widest text-foreground/80 select-none">
          TIS
        </span>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={[
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
                isActive(to)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              ].join(" ")}
            >
              <Icon size={15} strokeWidth={isActive(to) ? 2 : 1.5} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Right slot — reserved for auth/avatar, no widgets */}
        <div className="w-16" />
      </header>

      {/* ── Content area ─────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-[60px] md:pb-0">
        {children}
      </main>

      {/* ── Mobile bottom navigation (below md) ──────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-[60px] border-t border-border bg-background/95 backdrop-blur-sm flex items-stretch"
        aria-label="Mobile navigation"
      >
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = isActive(to);
          return (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors"
            >
              <Icon
                size={20}
                strokeWidth={active ? 2 : 1.5}
                className={active ? "text-primary" : "text-muted-foreground"}
              />
              <span
                className={[
                  "text-[10px] font-medium leading-none",
                  active ? "text-primary" : "text-muted-foreground",
                ].join(" ")}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
