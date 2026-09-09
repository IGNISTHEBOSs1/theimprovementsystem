import { useLocation, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, Compass, CheckSquare, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { SystemLogo } from "@/components/branding/Logo";
import { IdentityAvatar } from "@/components/system-bar/IdentityAvatar";

const NAV_ITEMS = [
  // Founder Decision (Mobile nav pill chunk): mobileLabel is a
  // mobile-only override — desktop rail keeps the original label
  // unchanged (explicitly requested to stay mobile-only). Falls back to
  // `label` where no override is given (Quests, Mentor).
  { to: "/",        label: "Dashboard", mobileLabel: "Home", icon: LayoutDashboard },
  { to: "/journey", label: "Journey",   mobileLabel: "Path", icon: Compass },
  { to: "/quests",  label: "Quests",    mobileLabel: undefined as string | undefined, icon: CheckSquare },
  { to: "/mentor",  label: "Mentor",    mobileLabel: undefined as string | undefined, icon: MessageSquare },
  { to: "/profile", label: "Profile",   mobileLabel: "Me",   icon: User },
] as const;

// Route-change acknowledgment — one continuous motion between states, not a snap.
const INDICATOR_TRANSITION = { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const };

interface SystemBarProps {
  username: string;
}

export default function SystemBar({ username }: SystemBarProps) {
  const location = useLocation();

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <>
      {/* ── Desktop rail ─────────────────────────────────────────── */}
      <aside
        className="material-surface material-structural hidden md:flex md:flex-col md:justify-between md:w-64 md:shrink-0 md:h-screen md:sticky md:top-0 z-40"
        aria-label="Primary navigation"
      >
        {/* Identity block — anchors the top. Logo is the anchor point; name/rank
            are set tight against it rather than stacked as equal-weight lines.
            No local glow here — brightness comes from the Structural elevation
            responding to the shared environmental light, not a bespoke effect. */}
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
                aria-current={active ? "page" : undefined}
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
      {/* Founder Decision (Mobile nav principles review chunk): height
          fixed to match main content's own reserved space exactly
          (AppLayout.tsx: `pb-[calc(60px+env(safe-area-inset-bottom))]`).
          Previously this was `h-[60px]` with the safe-area inset applied
          as internal bottom padding — since Tailwind's preflight sets
          border-box sizing, that padding was eaten OUT of the fixed 60px
          rather than added beyond it, so on any device with a non-zero
          home-indicator inset (most current iPhones), icons/labels were
          squeezed into a shorter-than-intended content area, AND main's
          reserved space (60px + inset) no longer matched the bar's
          actual total height (60px), leaving an unexplained blank gap
          between scrollable content and the dock. Correct mobile
          safe-area handling: the bar's total height now equals what main
          already reserves for it — the 60px content area stays full
          height, and the inset is genuinely additional space below it. */}
      {/* Founder Decision (Mobile nav pill chunk): floating pill instead
          of an edge-to-edge flush bar. Position math changed from
          "flush at bottom-0, height includes the safe-area inset" to
          "floats a fixed 12px clear of the safe area, fixed 60px
          content height" — the pb-[env(...)]-eats-into-height problem
          fixed in the reliability chunk doesn't apply here since the
          pill no longer touches the true bottom edge at all; the inset
          is handled entirely by the `bottom` offset instead. AppLayout's
          reserved main-content padding and the scroll-edge fade were
          both updated to match this exactly (see AppLayout.tsx) — same
          calc() value, kept in sync deliberately, not by coincidence.
          Border glow: static (no pulsing/looping animation — matches
          "no unnecessary animation"), using only the existing --primary
          token, same restrained treatment already used on today's focus
          panel. Slider: the existing layoutId-based active-indicator
          already animates/slides between positions automatically via
          Framer Motion layout animation — this was functionally already
          a "slider," just squared; only its shape changed to
          rounded-full to match the pill. */}
      <nav
        className="material-surface material-structural md:hidden fixed left-3 right-3 z-40 flex items-stretch h-[60px] rounded-full shadow-[0_0_0_1px_hsl(var(--primary)/0.16),0_10px_30px_-10px_hsl(var(--primary)/0.4)]"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
        aria-label="Primary navigation, mobile"
      >
        {NAV_ITEMS.map(({ to, label, mobileLabel, icon: Icon }) => {
          const active = isActive(to);
          const isProfile = to === "/profile";
          return (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              aria-current={active ? "page" : undefined}
              className="relative flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors duration-150 active:scale-95 active:transition-none touch-manipulation"
            >
              {active && (
                <motion.div
                  layoutId="system-bar-active-indicator-mobile"
                  className="absolute inset-x-1.5 inset-y-1.5 rounded-full system-nav-active"
                  transition={INDICATOR_TRANSITION}
                />
              )}
              {/* Founder Decision (Mobile nav device-range chunk): icon/
                  avatar size is fluid via clamp(), the same technique
                  already used elsewhere in this file (text-display-lg
                  etc.) for width-proportional sizing without hard
                  breakpoint jumps — not a new pattern invented here.
                  Range chosen from real device CSS viewport widths, not
                  guessed: 20px floor covers the smallest phones still in
                  real use (iPhone SE 1st-gen, 320px, and similar budget
                  Android down to ~360px); 24px ceiling matches the
                  stated icon-size standard and is never exceeded, even
                  on the largest phones (Pro Max class, ~430px) — the 5.8vw
                  factor crosses 24px at ~414px width, so anything at or
                  above that width sits flat at the 24px ceiling. Applied
                  identically to the avatar so all 5 destinations stay
                  visually matched in size at every width, not just the
                  4 icon items. */}
              {isProfile ? (
                <IdentityAvatar
                  username={username}
                  className="relative w-[clamp(20px,5.8vw,24px)] h-[clamp(20px,5.8vw,24px)] ring-1"
                />
              ) : (
                <Icon
                  size={24}
                  strokeWidth={active ? 2 : 1.5}
                  className={cn(
                    "relative w-[clamp(20px,5.8vw,24px)] h-[clamp(20px,5.8vw,24px)]",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                />
              )}
              <span
                className={cn(
                  "relative text-[10px] font-medium leading-none",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {mobileLabel ?? label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
