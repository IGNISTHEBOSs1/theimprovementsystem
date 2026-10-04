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
import { triggerHaptic } from "@/lib/haptics";
import { soundEngine } from "@/hooks/useSoundEffects";
import { TIS_SPRINGS } from "@/lib/motion-tokens";

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

// Critically-damped Apple-grade route indicator transition
const INDICATOR_TRANSITION = {
  ...TIS_SPRINGS.settle,
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
        className="hidden md:flex md:flex-col md:w-64 md:shrink-0 md:h-screen md:sticky md:top-0 z-40 bg-[#090A0F]/95 backdrop-blur-[24px] border-r border-[rgba(148,163,184,0.12)] shadow-[inset_-1px_0_0_0_rgba(255,255,255,0.06)]"
        aria-label="Primary navigation"
      >
        {/* Identity */}
        <div className="px-6 pt-8 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-[rgba(148,163,184,0.14)] bg-[#12141A] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.12)] flex items-center justify-center">
              <SystemLogo size={36} className="w-full h-full" />
            </div>

            <div className="min-w-0">
              <div className="text-body-md font-sans font-bold text-foreground leading-tight truncate">
                {username}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav
          className="relative flex flex-col gap-1.5 px-4"
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
                onClick={() => {
                  if (!active) soundEngine.playNavigation();
                }}
                className={cn(
                  "relative flex items-center gap-3 pl-4 pr-3 py-2.5 rounded-xl text-sm transition-all duration-150 active:scale-[0.98]",
                  active
                    ? "bg-[#181B24] border border-[rgba(148,163,184,0.15)] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.12),0_4px_12px_rgba(0,0,0,0.3)] text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-[#12141A]/60"
                )}
              >
                {/* Active indicator */}
                {active && (
                  <motion.div
                    layoutId="system-bar-active-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                    transition={INDICATOR_TRANSITION}
                  />
                )}

                <Icon
                  size={16}
                  strokeWidth={active ? 2.2 : 1.7}
                  className={cn(
                    "relative shrink-0 transition-colors duration-150",
                    active
                      ? "text-white"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />

                <span
                  className={cn(
                    "relative flex-1 transition-colors duration-150 truncate font-sans",
                    active
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground font-medium group-hover:text-foreground",
                  )}
                >
                  {label}
                </span>

                {to === "/quests" && activeQuestCount > 0 && (
                  <span className="relative ml-auto px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-white/10 text-white border border-white/20 tnum">
                    {activeQuestCount}
                  </span>
                )}
                {to === "/mentor" && hasMentorInsight && (
                  <span className="relative ml-auto size-2 rounded-full bg-white animate-pulse" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer controls: Settings & Command Palette */}
        <div className="mt-auto px-4 pb-6 space-y-2">
          <NavLink
            to="/profile/settings"
            onClick={() => soundEngine.playNavigation()}
            className={({ isActive: active }) =>
              cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-[0.98]",
                active
                  ? "bg-[#181B24] border border-[rgba(148,163,184,0.15)] text-foreground font-semibold shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.1)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-[#12141A]/60"
              )
            }
          >
            <Settings className="size-3.5 shrink-0" />
            <span>Settings</span>
          </NavLink>

          <button
            type="button"
            onClick={() => {
              soundEngine.playTap();
              window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-[rgba(148,163,184,0.12)] bg-[#12141A]/80 hover:bg-[#181B24] hover:text-foreground text-xs text-muted-foreground transition-all group cursor-pointer shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.06)] active:scale-[0.98]"
            title="Open Command Palette (⌘K / Ctrl+K)"
          >
            <span className="flex items-center gap-2">
              <Search className="size-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span>Commands...</span>
            </span>
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-[rgba(148,163,184,0.15)] bg-[#181B24] px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────
          Mobile dock (Obsidian Kinetic Floating Frosted Tab Dock)
      ───────────────────────────────────────────────────────── */}
      <nav
        className="
          obsidian-dock
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
          h-[60px]
          rounded-full
          isolate
          select-none
          border
          border-[rgba(148,163,184,0.16)]
          shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.22),inset_0_-1px_1px_0_rgba(0,0,0,0.35),0_16px_40px_-4px_rgba(0,0,0,0.75)]
          backdrop-blur-[24px]
          saturate-[200%]
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
                onClick={() => {
                  if (!active) soundEngine.playNavigation();
                  triggerHaptic("selection");
                }}
                className="
                  relative
                  flex-1
                  flex
                  items-center
                  justify-center
                  min-w-[48px]
                  min-h-[48px]
                  touch-manipulation
                  group
                  active:scale-[0.96]
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
                      size-[46px]
                      rounded-full
                      bg-white/10
                      pointer-events-none
                      z-0
                      border
                      border-white/25
                      shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.2),0_0_12px_rgba(255,255,255,0.1)]
                      backdrop-blur-md
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
                            ? "border-white/40 text-white bg-white/10 shadow-[0_0_8px_rgba(255,255,255,0.2)]"
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
                        active ? "bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" : "bg-zinc-400"
                      )} />
                    )}

                    {/* Clean static notification pip for Mentor guidance */}
                    {to === "/mentor" && hasMentorInsight && (
                      <span className={cn(
                        "absolute -top-0.5 -right-1 size-1.5 rounded-full pointer-events-none",
                        active ? "bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" : "bg-zinc-400"
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