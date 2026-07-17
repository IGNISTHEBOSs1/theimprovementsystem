import { useLocation, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, Compass, CheckSquare, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { SystemLogo } from "@/components/branding/Logo";

const NAV_ITEMS = [
  { to: "/",        label: "Dashboard", icon: LayoutDashboard },
  { to: "/journey", label: "Journey",   icon: Compass },
  { to: "/quests",  label: "Quests",    icon: CheckSquare },
  { to: "/mentor",  label: "Mentor",    icon: MessageSquare },
  { to: "/profile", label: "Profile",   icon: User },
] as const;

// Route-change acknowledgment — one continuous motion between states, not a snap.
const INDICATOR_TRANSITION = { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const };

interface SystemBarProps {
  username: string;
  rank: string;
  /** Finished signal, computed upstream. The Bar renders this — it never infers it. */
  justLeveledUp: boolean;
}

export default function SystemBar({ username, rank, justLeveledUp }: SystemBarProps) {
  const location = useLocation();

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <>
      {/* ── Desktop rail ─────────────────────────────────────────── */}
      <aside
        className="system-surface hidden md:flex md:flex-col md:justify-between md:w-64 md:shrink-0 md:h-screen md:sticky md:top-0 z-40"
        aria-label="System navigation"
      >
        {/* Identity block — anchors the top. Logo is the anchor point; name/rank
            are set tight against it rather than stacked as equal-weight lines. */}
        <div className="system-identity-glow px-6 pt-8 pb-6">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-lg overflow-hidden shrink-0",
                justLeveledUp && "animate-glow-pulse-once",
              )}
            >
              <SystemLogo size={40} className="w-full h-full" />
            </div>
            <div className="min-w-0">
              <div className="text-body-md font-display font-bold text-foreground leading-tight truncate">
                {username}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1 h-1 rounded-full bg-primary shrink-0" />
                <span className="text-[11px] tracking-wide text-muted-foreground truncate">
                  {rank}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav cluster — sits at its own natural height, not stretched to fill
            the rail. The surrounding space is left empty on purpose. */}
        <nav className="relative flex flex-col gap-1 px-4">
          <div className="absolute left-4 top-1 bottom-1 w-px bg-white/[0.06]" aria-hidden />
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);
            return (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className="relative flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-md text-sm transition-colors duration-150"
              >
                {active && (
                  <motion.div
                    layoutId="system-bar-active-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-4 bg-primary"
                    transition={INDICATOR_TRANSITION}
                  />
                )}
                {active && (
                  <motion.div
                    layoutId="system-bar-active-fill"
                    className="absolute inset-y-0.5 left-2 right-0 rounded-md system-nav-active"
                    transition={INDICATOR_TRANSITION}
                  />
                )}
                <Icon
                  size={16}
                  strokeWidth={active ? 2 : 1.5}
                  className={cn(
                    "relative shrink-0 transition-colors duration-150",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <span
                  className={cn(
                    "relative font-medium transition-colors duration-150",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Voice slot — anchors the bottom. Quieter and smaller than the identity
            block above; a closing mark, not a footer. */}
        <div className="px-6 pb-7 pt-6">
          <p className="text-[12px] leading-relaxed text-muted-foreground/70 italic tracking-wide">
            "Small, consistent actions forge extraordinary transformation."
          </p>
          <p className="text-[10px] tracking-[0.08em] uppercase text-primary/70 mt-2">
            — The System
          </p>
        </div>
      </aside>

      {/* ── Mobile dock ──────────────────────────────────────────── */}
      <nav
        className="system-surface md:hidden fixed bottom-0 left-0 right-0 z-40 h-[60px] flex items-stretch"
        aria-label="System navigation"
      >
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const active = isActive(to);
          return (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className="relative flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors duration-150"
            >
              {active && (
                <motion.div
                  layoutId="system-bar-active-indicator-mobile"
                  className="absolute inset-x-2 inset-y-1.5 rounded-lg system-nav-active"
                  transition={INDICATOR_TRANSITION}
                />
              )}
              <Icon
                size={19}
                strokeWidth={active ? 2 : 1.5}
                className={cn("relative", active ? "text-primary" : "text-muted-foreground")}
              />
              <span
                className={cn(
                  "relative text-[10px] font-medium leading-none",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
