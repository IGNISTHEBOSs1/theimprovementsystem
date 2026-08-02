-- Infrastructure: canonical new-user initialization flow.
-- No new tables, no behavior change for the normal (single-fire) case.
-- Adds ON CONFLICT DO NOTHING to each insert so the function is safe to
-- ever run more than once for the same user (e.g. manual re-invocation,
-- a future backfill, or the trigger somehow firing twice) without
-- throwing a unique-violation. Every currently-required per-user record
-- (profiles, game_state, daily_login_bonus) is created together, in the
-- same transaction as the auth.users insert, exactly as before.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'username', 'Hunter'))
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.game_state (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.daily_login_bonus (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;
