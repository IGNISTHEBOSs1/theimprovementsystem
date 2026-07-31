-- Milestone 2.1 — First Launch Experience
-- Adds a persistent, one-time flag distinguishing a Hunter who has never
-- completed the first-launch experience's primary action from one who has.
-- Defaults to false so every existing row (and every future row created by
-- handle_new_user) starts as "has not completed first launch" without
-- requiring the trigger function to be modified.
ALTER TABLE public.profiles
  ADD COLUMN has_completed_first_launch BOOLEAN NOT NULL DEFAULT false;
