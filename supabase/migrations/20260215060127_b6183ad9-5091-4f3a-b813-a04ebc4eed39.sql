
-- Add permissive SELECT policies so all authenticated users can see other players for leaderboards
CREATE POLICY "Anyone can view profiles for leaderboard"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Anyone can view game_state for leaderboard"
ON public.game_state
FOR SELECT
TO authenticated
USING (true);

-- Create a database view for leaderboard data
CREATE OR REPLACE VIEW public.leaderboard_view AS
SELECT 
  p.user_id,
  p.username,
  p.avatar_id,
  g.level,
  g.current_xp,
  g.total_quests_completed,
  g.credits,
  g.achievements,
  g.stats,
  d.current_streak,
  d.longest_streak
FROM public.profiles p
JOIN public.game_state g ON p.user_id = g.user_id
LEFT JOIN public.daily_login_bonus d ON p.user_id = d.user_id;
