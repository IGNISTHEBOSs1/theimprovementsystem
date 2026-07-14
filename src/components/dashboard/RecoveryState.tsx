import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecoveryStateProps {
  onChooseQuest: () => void;
}

export function RecoveryState({ onChooseQuest }: RecoveryStateProps) {
  return (
    <section className="rounded-2xl border border-border bg-muted/30 p-5 sm:p-6" aria-labelledby="recovery-heading">
      <p className="text-label text-muted-foreground">A clear return</p>
      <h2 id="recovery-heading" className="mt-2 text-lg font-semibold text-foreground">You can begin again from here.</h2>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
        There is no need to catch up all at once. Choose one action that matters, then let the next step reveal itself.
      </p>
      <Button variant="ghost" className="mt-3 min-h-11 px-0 text-primary hover:bg-transparent hover:text-primary" onClick={onChooseQuest}>
        Choose one action <ArrowRight className="size-4" aria-hidden="true" />
      </Button>
    </section>
  );
}
