import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
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
  level: number;
  rank: string;
}

/** Detects a change in an already-supplied identity value to decide *when* to
 *  play the one-shot motion — this is Bar behavior (Motion as Consequence),
 *  not identity computation. The Bar still never derives what the rank *is*. */
function useLeveledUp(level: number) {
  const prevLevel = useRef(level);
  const [justLeveledUp, setJustLeveledUp] = useState(false);

  useEffect(() => {
    if (level > prevLevel.current) {
      setJustLeveledUp(true);
      const timeout = setTimeout(() => setJustLeveledUp(false), 900);
      prevLevel.current = level;
      return () => clearTimeout(timeout);
    }
    prevLevel.current = level;
  }, [level]);

  return justLeveledUp;
}

export default function SystemBar({ username, level, rank }: SystemBarProps) {
  const location = useLocation();
  const justLeveledUp = useLeveledUp(level);

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <>
      {/* ── Desktop rail ─────────────────────────────────────────── */}
      <aside
        className="system-surface hidden md:flex md:flex-col md:w-64 md:shrink-0 md:h-screen md:sticky md:top-0 z-40"
        aria-label="System navigation"
      >
        {/* Identity block — occupies real space; asserts who before where. */}
        <div className="px-5 pt-6 pb-5 border-b border-white/[0.06]">
          <div
            className={cn(
              "w-11 h-11 rounded-xl overflow-hidden mb-3",
              justLeveledUp && "animate-glow-pulse-once",
            )}
          >
            <SystemLogo size={44} className="w-full h-full" />
          </div>
          <div className="text-body-md font-display font-bold text-foreground truncate">
            {username}
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-caption text-muted-foreground truncate">{rank}</span>
          </div>
        </div>

        {/* Nav rail */}
        <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);
            return (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150"
              >
                {active && (
                  <motion.div
                    layoutId="system-bar-active-indicator"
                    className="absolute inset-0 rounded-lg system-nav-active"
                    transition={INDICATOR_TRANSITION}
                  />
                )}
                <Icon
                  size={17}
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

        {/* Voice slot — the Bar asserting "Pages are temporary; the System remains." */}
        <div className="px-5 py-5 border-t border-white/[0.06]">
          <p className="text-body-sm text-muted-foreground leading-relaxed italic">
            "Small, consistent actions forge extraordinary transformation."
          </p>
          <p className="text-caption text-primary mt-2">— The System</p>
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