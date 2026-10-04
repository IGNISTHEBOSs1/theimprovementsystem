import { LucideIcon } from "lucide-react";

interface PlaceholderExperienceProps {
  icon: LucideIcon;
  title: string;
  message: string;
}

// Deliberate placeholder for a nav destination that stays visible in the
// architecture (Journey, Mentor) but isn't built yet. Communicates
// intentional unavailability rather than reading as broken or forgotten —
// per Founder decision on Kinetic-NAV-001's Refinement 2. Not a new product
// feature: no interaction, no state, just an honest, calm holding screen
// reusing existing design tokens.
export function PlaceholderExperience({ icon: Icon, title, message }: PlaceholderExperienceProps) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-5 py-24 text-center sm:py-32">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgba(148,163,184,0.16)] bg-[#12141A] shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.12)]">
        <Icon className="size-6 text-white" strokeWidth={1.5} aria-hidden="true" />
      </div>
      <h1 className="mt-6 text-xl font-semibold tracking-tight text-foreground">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{message}</p>
    </div>
  );
}
