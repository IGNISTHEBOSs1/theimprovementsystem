-- P0 — Chunk 1: Security Convergence
-- Removes the blanket "authenticated can view all rows" SELECT policies on
-- profiles and game_state that were added for the (dormant, unrouted)
-- leaderboard feature. These policies were PERMISSIVE and therefore OR'd
-- with the existing owner-only SELECT policies on each table, meaning any
-- authenticated user could read every other user's profile (including
-- date_of_birth) and game_state (including raw quest titles — real-life
-- commitment text). No live, routed code path depends on cross-user reads
-- of these tables (verified: every live caller scopes with
-- .eq('user_id', <own id>)). The owner-only SELECT policies created in the
-- initial schema migration are left untouched and now become the sole
-- SELECT policy on each table. leaderboard_view is left in place
-- (security_invoker=on, unrouted) — it will simply return no cross-user
-- rows now, without being dropped or redesigned.

DROP POLICY IF EXISTS "Anyone can view profiles for leaderboard" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view game_state for leaderboard" ON public.game_state;
