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
export function IdentityAvatar({ username, avatarUrl, className }: IdentityAvatarProps) {
  const initials = username.trim().slice(0, 2).toUpperCase() || "?";

  return (
    <Avatar
      className={cn(
        "h-9 w-9 ring-1 ring-primary/40 ring-offset-2 ring-offset-background",
        className,
      )}
    >
      {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
      <AvatarFallback className="text-[11px] font-medium text-foreground bg-muted">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
