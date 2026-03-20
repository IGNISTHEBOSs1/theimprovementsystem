-- Create daily_login_bonus table to track consecutive logins
CREATE TABLE public.daily_login_bonus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  last_login_date DATE NOT NULL DEFAULT CURRENT_DATE,
  current_streak INTEGER NOT NULL DEFAULT 1,
  longest_streak INTEGER NOT NULL DEFAULT 1,
  total_logins INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.daily_login_bonus ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own login bonus"
ON public.daily_login_bonus FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own login bonus"
ON public.daily_login_bonus FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own login bonus"
ON public.daily_login_bonus FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger for timestamp updates
CREATE TRIGGER update_daily_login_bonus_updated_at
BEFORE UPDATE ON public.daily_login_bonus
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Update handle_new_user to also create login bonus record
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'username', 'Hunter'));
  
  INSERT INTO public.game_state (user_id)
  VALUES (NEW.id);
  
  INSERT INTO public.daily_login_bonus (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;