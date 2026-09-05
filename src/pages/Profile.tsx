import { FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useAuth } from "@/hooks/useAuth";

// Founder Decision (Profile/Settings separation chunk): Profile's job is
// identity, primary goal, personal context, and Quest history — nothing
// about timezone, session, or account-data controls belongs here
// anymore (moved to Settings, reached via the link below). This keeps
// Profile answering "who am I / what am I working toward" and Settings
// answering "what does the system control."
export default function Profile() {
  const { profile, updateProfile } = useAuth();
  const [goal, setGoal] = useState(profile?.primary_goal ?? "");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
      setGoal(profile?.primary_goal ?? "");
      setSaveError(true);
      return;
    }
    setGoal(saved.primary_goal ?? "");
    setSaveSuccess(true);
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
      <PageHeader
        eyebrow="Your system"
        title="Your system."
        description="Who you are, and what you're working toward."
      />
      <div className="mt-9 space-y-8">
        <section className="rounded-2xl border border-border bg-card p-6" aria-labelledby="primary-goal-heading">
          <h2 id="primary-goal-heading" className="text-label text-muted-foreground">Primary goal</h2>
          <p className="mt-1 text-body-sm text-muted-foreground">
            The one direction your commitments can be measured against. Optional — quests work fine without it.
          </p>
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
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

          <div className="mt-6 flex flex-wrap gap-2">
            <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
              <Link to="/profile/history">
                Quest history
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
              <Link to="/profile/settings">
                <SettingsIcon className="size-4" aria-hidden="true" />
                Settings
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
