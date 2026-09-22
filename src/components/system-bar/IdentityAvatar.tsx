import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface IdentityAvatarProps {
  username: string;
  /**
   * A genuine per-user avatar image URL, once that system exists. Left
   * undefined today — there is no per-user avatar image data anywhere in
   * the app (see below) — so every user correctly sees their own
   * initials rather than one shared placeholder image mislabeled as
   * personal.
   */
  avatarUrl?: string;
  className?: string;
  /**
   * When true (SystemBar's mobile dock, on the Profile tab), renders a
   * stronger ring instead of the default subtle one — the SAME active/
   * inactive contrast pattern SystemBar already uses on every other nav
   * icon via strokeWidth (1.5 → 2). Also drops ring-offset:
   * ring-offset-background assumes the ring sits directly on page
   * background, but in the nav dock it sits on the dock's own
   * material-surface elevation (a lighter computed shade) — the offset
   * gap didn't match that surface, which is what read as the ring
   * "clipping" oddly against the dock.
   */
  active?: boolean;
}

// The avatar as persistent identity artifact (TIS-NAV-001, Refinement 1,
// Option B). Reuses the existing bottom-dock Profile slot rather than
// claiming any new permanent layout space — the ring is the only addition,
// and it draws exclusively from the existing --primary token rather than
// introducing a new rank-tier color system, which is a Phase III (Color)
// decision not yet ratified and not this Specification's to make.
//
// There is currently no per-user avatar image system (no upload flow, no
// distinct preset images — `avatar_id` defaults to 'default' for every
// account and nothing renders differently based on its value). Showing the
// one static asset that exists in the repo to every user would just be a
// generic icon in image form, not a personal one — so this component omits
// AvatarImage entirely until a real `avatarUrl` is available, and relies on
// AvatarFallback's username-derived initials, which are genuinely personal
// today.
export function IdentityAvatar({ username, avatarUrl, className, active }: IdentityAvatarProps) {
  const initials = username.trim().slice(0, 2).toUpperCase() || "?";

  return (
    <Avatar
      className={cn(
        active ? "h-9 w-9 ring-2 ring-background" : "h-9 w-9 ring-1 ring-border",
        className,
      )}
    >
      {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
      <AvatarFallback
        className={cn(
          "text-[11px] font-medium transition-colors",
          active ? "bg-background text-foreground font-bold" : "text-foreground bg-muted"
        )}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
