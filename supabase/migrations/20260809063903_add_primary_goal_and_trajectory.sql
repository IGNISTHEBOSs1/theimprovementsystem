-- Chunk 3 — Goal + Trajectory + Quest Relevance.
-- Minimum data model to support: one primary goal per user, optional
-- explicit quest->goal linkage, and a single running trajectory counter.
-- No new tables — a user has exactly one goal (a scalar field, not a
-- referenced entity), and quest->goal linkage is a boolean on the
-- already-schemaless quests JSONB (no migration needed for that part).

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS primary_goal text;

ALTER TABLE public.game_state
  ADD COLUMN IF NOT EXISTS trajectory integer NOT NULL DEFAULT 0;
