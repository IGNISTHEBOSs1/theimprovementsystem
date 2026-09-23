import { useLocation, NavLink } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  LayoutDashboard,
  Compass,
  CheckSquare,
  MessageSquare,
  User,
  Search,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SystemLogo } from "@/components/branding/Logo";

const NAV_ITEMS = [
  {
    to: "/",
    label: "Dashboard",
    mobileLabel: "Home",
    icon: LayoutDashboard,
  },
  {
    to: "/journey",
    label: "Journey",
    mobileLabel: "Path",
    icon: Compass,
  },
  {
    to: "/quests",
    label: "Quests",
    mobileLabel: undefined,
    icon: CheckSquare,
  },
  {
    to: "/mentor",
    label: "Mentor",
    mobileLabel: undefined,
    icon: MessageSquare,
  },
  {
    to: "/profile",
    label: "Profile",
    mobileLabel: "Me",
    icon: User,
  },
] as const;

// Smooth route-change animation.
const INDICATOR_TRANSITION = {
  duration: 0.35,
  ease: [0.16, 1, 0.3, 1] as const,
};

interface SystemBarProps {
  username: string;
  activeQuestCount?: number;
  hasMentorInsight?: boolean;
}

export default function SystemBar({
  username,
  activeQuestCount = 0,
  hasMentorInsight = false,
}: SystemBarProps) {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const indicatorTransition = shouldReduceMotion ? { duration: 0 } : INDICATOR_TRANSITION;

  const isActive = (to: string) =>
    to === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(to);

  return (
    <>
      {/* ─────────────────────────────────────────────────────────
          Desktop rail
      ───────────────────────────────────────────────────────── */}
      <aside
        className="glass-rail hidden md:flex md:flex-col md:w-64 md:shrink-0 md:h-screen md:sticky md:top-0 z-40"
        aria-label="Primary navigation"
      >
        {/* Identity */}
        <div className="px-6 pt-8 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
              <SystemLogo size={40} className="w-full h-full" />
            </div>

            <div className="min-w-0">
              <div className="text-body-md font-display font-bold text-foreground leading-tight truncate">
                {username}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav
          className="relative flex flex-col gap-1 px-4"
          aria-label="Primary navigation"
        >
          <div
            className="absolute left-4 top-1 bottom-1 w-px bg-white/[0.06]"
            aria-hidden="true"
          />

          {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
            const active = isActive(to);

            return (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                aria-current={active ? "page" : undefined}
                className="relative flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-md text-sm transition-colors duration-150"
              >
                {/* Active indicator */}
                {active && (
                  <motion.div
                    layoutId="system-bar-active-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-4 bg-primary"
                    transition={INDICATOR_TRANSITION}
                  />
                )}

                {/* Active background */}
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
                    active
                      ? "text-primary"
                      : "text-foreground/70 group-hover:text-foreground",
                  )}
                />

                <span
                  className={cn(
                    "relative flex-1 transition-colors duration-150 truncate",
                    active
                      ? "text-foreground font-semibold"
                      : "text-foreground/80 font-medium group-hover:text-foreground",
                  )}
                >
                  {label}
                </span>

                {to === "/quests" && activeQuestCount > 0 && (
                  <span className="relative ml-auto px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-primary/20 text-primary">
                    {activeQuestCount}
                  </span>
                )}
                {to === "/mentor" && hasMentorInsight && (
                  <span className="relative ml-auto size-2 rounded-full bg-primary" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer controls: Settings & Command Palette */}
        <div className="mt-auto px-4 pb-6 space-y-2">
          <NavLink
            to="/profile/settings"
            className={({ isActive: active }) =>
              cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )
            }
          >
            <Settings className="size-3.5 shrink-0" />
            <span>Settings</span>
          </NavLink>

          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border/70 bg-card/60 hover:bg-accent hover:text-accent-foreground text-xs text-muted-foreground transition-colors group cursor-pointer"
            title="Open Command Palette (⌘K / Ctrl+K)"
          >
            <span className="flex items-center gap-2">
              <Search className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span>Commands...</span>
            </span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────
          Mobile dock
      ───────────────────────────────────────────────────────── */}
      <nav
        className="
          glass-dock
          md:hidden
          fixed
          left-3
          right-3
          sm:left-1/2
          sm:-translate-x-1/2
          sm:w-full
          sm:max-w-md
          z-40
          flex
          items-stretch
          h-[56px]
          rounded-full
          isolate
          select-none
        "
        style={{
          bottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
        }}
        aria-label="Primary navigation, mobile"
      >
        {NAV_ITEMS.map(
          ({ to, label, mobileLabel, icon: Icon }) => {
            const active = isActive(to);
            const isProfile = to === "/profile";

            return (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                aria-current={active ? "page" : undefined}
                className="
                  relative
                  flex-1
                  flex
                  items-center
                  justify-center
                  min-w-[44px]
                  min-h-[44px]
                  touch-manipulation
                  group
                "
              >
                {/* 1. Circular sliding active pill indicator with concentric radius & real glassmorphism */}
                {active && (
                  <motion.div
                    layoutId="system-bar-active-indicator-mobile"
                    className="
                      absolute
                      inset-0
                      m-auto
                      w-[50px]
                      h-[42px]
                      rounded-full
                      glass-nav-pill
                      pointer-events-none
                      z-0
                    "
                    transition={indicatorTransition}
                  />
                )}

                {/* 2. Icon + text subtle enlargement, bold, and understated time pop */}
                <motion.div
                  className="relative z-10 flex flex-col items-center justify-center gap-0.5 pointer-events-none"
                  animate={shouldReduceMotion ? { scale: 1 } : { scale: active ? 1.03 : 1 }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : {
                          type: "spring",
                          stiffness: 380,
                          damping: 25,
                        }
                  }
                >
                  {/* Profile avatar or Icon with static notification pip */}
                  <div className="relative">
                    {isProfile ? (
                      <div
                        className={cn(
                          "size-[19px] rounded-full border flex items-center justify-center text-[9px] font-bold tracking-tight transition-colors duration-150",
                          active
                            ? "border-white/80 text-white"
                            : "border-muted-foreground/60 text-muted-foreground group-hover:text-foreground group-hover:border-foreground",
                        )}
                      >
                        {username.trim().slice(0, 2).toUpperCase() || "ME"}
                      </div>
                    ) : (
                      <Icon
                        size={19}
                        strokeWidth={active ? 2.2 : 1.7}
                        className={cn(
                          "size-[19px] transition-colors duration-150",
                          active
                            ? "text-white"
                            : "text-muted-foreground group-hover:text-foreground",
                        )}
                      />
                    )}

                    {/* Clean static notification pip for active Quests (no chaotic ping) */}
                    {to === "/quests" && activeQuestCount > 0 && (
                      <span className={cn(
                        "absolute -top-0.5 -right-1 size-1.5 rounded-full pointer-events-none",
                        active ? "bg-white" : "bg-emerald-500"
                      )} />
                    )}

                    {/* Clean static notification pip for Mentor guidance */}
                    {to === "/mentor" && hasMentorInsight && (
                      <span className={cn(
                        "absolute -top-0.5 -right-1 size-1.5 rounded-full pointer-events-none",
                        active ? "bg-white" : "bg-emerald-500"
                      )} />
                    )}
                  </div>

                  {/* Label with crisp contrast and bold active weight */}
                  <span
                    className={cn(
                      "text-[10px] leading-none transition-colors duration-150 tracking-tight",
                      active
                        ? "text-white font-bold"
                        : "text-muted-foreground font-medium group-hover:text-foreground",
                    )}
                  >
                    {mobileLabel ?? label}
                  </span>
                </motion.div>
              </NavLink>
            );
          },
        )}
      </nav>
    </>
  );
}