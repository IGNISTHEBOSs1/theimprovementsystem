import { useLocation, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Compass,
  CheckSquare,
  MessageSquare,
  User,
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
        className="material-surface material-structural hidden md:flex md:flex-col md:justify-between md:w-64 md:shrink-0 md:h-screen md:sticky md:top-0 z-40"
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

        {/* Voice / system message */}
        <div className="px-6 pb-7 pt-6">
          <p className="text-[12px] leading-relaxed text-muted-foreground/70 italic tracking-wide">
            "Small, consistent actions forge extraordinary transformation."
          </p>

          <p className="text-[10px] tracking-[0.08em] uppercase text-primary/70 mt-2">
            — The System
          </p>
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
          shadow-[0_4px_12px_rgba(0,0,0,0.25)]
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
                  flex-col
                  items-center
                  justify-center
                  gap-1
                  min-w-[44px]
                  min-h-[44px]
                  touch-manipulation
                  transition-transform
                  duration-150
                  active:scale-[0.96]
                  active:transition-none
                "
              >
                {/* Active inner slider */}
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

                {/* Profile avatar */}
                {isProfile ? (
                  <IdentityAvatar
                    username={username}
                    className="
                      relative
                      w-[clamp(20px,5.8vw,24px)]
                      h-[clamp(20px,5.8vw,24px)]
                      ring-1
                    "
                  />
                ) : (
                  <Icon
                    size={24}
                    strokeWidth={active ? 2 : 1.5}
                    className={cn(
                      "relative w-[clamp(20px,5.8vw,24px)] h-[clamp(20px,5.8vw,24px)] transition-colors duration-150",
                      active
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  />
                )}

                {/* Label */}
                <span
                  className={cn(
                    "relative text-[10px] leading-none transition-colors duration-150",
                    active
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground font-medium",
                  )}
                >
                  {mobileLabel ?? label}
                </span>
              </NavLink>
            );
          },
        )}
      </nav>
    </>
  );
}