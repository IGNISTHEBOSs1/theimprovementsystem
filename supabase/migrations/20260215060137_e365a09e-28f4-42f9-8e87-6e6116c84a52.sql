
-- Fix the view to use security invoker instead of security definer
DROP VIEW IF EXISTS public.leaderboard_view;

CREATE VIEW public.leaderboard_view
WITH (security_invoker=on) AS
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
