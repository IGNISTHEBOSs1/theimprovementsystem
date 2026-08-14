import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useAuth } from "@/hooks/useAuth";

// Minimum surface for Chunk 3: the one field the goal/trajectory model
// actually needs a place to be set. Not a general profile-editing page —
// username/avatar/bio/etc. are untouched and not exposed here.
export default function Profile() {
  const { profile, updateProfile } = useAuth();
  const [goal, setGoal] = useState(profile?.primary_goal ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  // Distinct from `saving`/`saveError` — this is the third state the
  // sync fix needs to be visible: "the save that just happened worked."
  // Cleared as soon as the user edits again, so it never lingers as a
  // stale confirmation for a different draft.
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Covers the case where `profile` is still loading (or changes for any
  // other reason, e.g. a retry elsewhere) after this page has already
  // mounted — not the save path itself, which is handled directly below.
  useEffect(() => {
    setGoal(profile?.primary_goal ?? "");
  }, [profile?.primary_goal]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setSaveError(false);
    setSaveSuccess(false);
    const trimmed = goal.trim();
    const { error, profile: saved } = await updateProfile({ primary_goal: trimmed || null });
    setSaving(false);
    if (error || !saved) {
      // Keep the previously saved goal intact — revert the draft to what
      // is actually persisted rather than leaving an unsaved edit
      // displayed as if it were current.
      setGoal(profile?.primary_goal ?? "");
      setSaveError(true);
      return;
    }
    // Sync directly from the response this same request produced, rather
    // than waiting on the effect above to notice the Context update — this
    // is what makes /profile itself reflect the save immediately, not just
    // other pages reading `profile` fresh on their next render.
    setGoal(saved.primary_goal ?? "");
    setSaveSuccess(true);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
      <PageHeader
        eyebrow="Your system"
        title="Primary goal."
        description="The one direction your commitments can be measured against. Optional — quests work fine without it."
      />
      <div className="mt-9">
        <section className="rounded-2xl border border-border bg-card p-6" aria-labelledby="primary-goal-heading">
          <h2 id="primary-goal-heading" className="sr-only">Primary goal</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
            <Input
              value={goal}
              onChange={(event) => {
                setGoal(event.target.value);
                setSaveSuccess(false);
              }}
              placeholder="What are you working toward?"
              aria-label="Primary goal"
              disabled={saving}
              className="min-h-11"
            />
            <Button type="submit" className="min-h-11 shrink-0" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </form>
          {saveError && (
            <p className="mt-3 text-body-sm text-muted-foreground" role="alert">
              That didn't go through. You can try again.
            </p>
          )}
          {saveSuccess && !saveError && (
            <p className="mt-3 text-body-sm text-muted-foreground" role="status">
              Saved.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
