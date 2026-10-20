-- Add target date for the primary 90-day North Star goal
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS primary_goal_target_date timestamptz;
