import { useLocation, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Compass,
  CheckSquare,
  MessageSquare,
  User,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SystemLogo } from "@/components/branding/Logo";
import { IdentityAvatar } from "@/components/system-bar/IdentityAvatar";

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
  duration: 0.4,
  ease: [0.16, 1, 0.3, 1] as const,
};

interface SystemBarProps {
  username: string;
}

export default function SystemBar({ username }: SystemBarProps) {
  const location = useLocation();

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
        className="material-surface material-structural hidden md:flex md:flex-col md:w-64 md:shrink-0 md:h-screen md:sticky md:top-0 z-40"
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
                      : "text-muted-foreground",
                  )}
                />

                <span
                  className={cn(
                    "relative transition-colors duration-150",
                    active
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground font-medium",
                  )}
                >
                  {label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Command Palette trigger */}
        <div className="mt-auto px-4 pb-6">
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
          material-surface
          material-structural
          md:hidden
          fixed
          left-3
          right-3
          z-40
          flex
          items-stretch
          h-[56px]
          rounded-full
          border border-border/60
          shadow-[0_14px_28px_-4px_rgba(0,0,0,0.45)]
        "
        style={{
          bottom: "calc(env(safe-area-inset-bottom) + 12px)",
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
                  transition-transform
                  duration-150
                  active:scale-[0.96]
                  active:transition-none
                "
              >
                {/* Active inner slider — layoutId already gives the
                    "pill slides from the previously-active icon to the
                    newly-clicked one" motion for free: framer-motion
                    animates any element sharing a layoutId between its
                    old and new position/size automatically (FLIP), no
                    manual coordinate math needed. */}
                {active && (
                  <motion.div
                    layoutId="system-bar-active-indicator-mobile"
                    className="
                      absolute
                      inset-y-1.5
                      inset-x-1
                      rounded-[60px]
                      bg-foreground/[0.06]
                    "
                    transition={INDICATOR_TRANSITION}
                  />
                )}

                {/* Icon + label scale together as one unit: active tab
                    pops slightly larger, every other tab recedes
                    slightly smaller — matches the "selected gets bold
                    and enlarged while every other icon and text
                    minimizes" behavior. The active tab's own scale-up
                    is delayed ~80ms so the pill visibly arrives at its
                    new position first, then the icon/label grow into
                    it, rather than everything happening in one
                    simultaneous jump. Inactive tabs shrink immediately
                    — no reason to wait on those. */}
                <motion.div
                  className="relative flex flex-col items-center justify-center gap-1"
                  animate={{ scale: active ? 1.12 : 0.94 }}
                  transition={{
                    type: "spring",
                    stiffness: 420,
                    damping: 26,
                    delay: active ? 0.08 : 0,
                  }}
                >
                  {/* Profile avatar */}
                  {isProfile ? (
                    <IdentityAvatar
                      username={username}
                      active={active}
                      className="
                        w-[clamp(20px,5.8vw,24px)]
                        h-[clamp(20px,5.8vw,24px)]
                      "
                    />
                  ) : (
                    <Icon
                      size={24}
                      strokeWidth={active ? 2 : 1.5}
                      className={cn(
                        "w-[clamp(20px,5.8vw,24px)] h-[clamp(20px,5.8vw,24px)] transition-colors duration-150",
                        active
                          ? "text-primary"
                          : "text-muted-foreground",
                      )}
                    />
                  )}

                  {/* Label */}
                  <span
                    className={cn(
                      "text-[10px] leading-none transition-colors duration-150",
                      active
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground font-medium",
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