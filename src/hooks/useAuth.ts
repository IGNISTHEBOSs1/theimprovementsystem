import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  avatar_id: string;
  date_of_birth: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetches the profile row, retrying briefly to cover the short window
  // between a successful signup and the DB trigger (handle_new_user)
  // committing the corresponding profiles row. Returns once a profile is
  // found or attempts are exhausted — callers await this before treating
  // auth state as settled, so the profile is never still-null at the
  // moment `loading` flips to false on a successful sign-in/sign-up.
  const fetchProfile = async (userId: string, attempts = 3, delayMs = 300) => {
    for (let attempt = 0; attempt < attempts; attempt++) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (!error && data) {
        setProfile(data as Profile);
        return;
      }
      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) await fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) await fetchProfile(session.user.id);
      else setProfile(null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, username: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`
    });
    return { error };
  };

  const updateProfile = async (updates: Partial<Pick<Profile, 'username' | 'avatar_id' | 'date_of_birth' | 'bio'>>) => {
    if (!user) return { error: new Error('Not authenticated') };
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();
    if (!error && data) setProfile(data as Profile);
    return { error };
  };

  const resetGameProgress = async () => {
    if (!user) return;
    await supabase.from('game_state').update({
      level: 1, rank: 'E-Rank Hunter', current_xp: 0, max_xp: 1000,
      credits: 0, stats: { FIT: 0, SOC: 0, INT: 0, DIS: 0, FOC: 0, FIN: 0 },
      quests: [], habits: [], system_messages: [], total_quests_completed: 0,
    }).eq('user_id', user.id);
  };

  const deleteAccount = async () => {
    if (!user) return;
    await supabase.auth.signOut();
  };

  return {
    user, profile, loading,
    signIn, signUp, signOut, resetPassword,
    updateProfile, resetGameProgress, deleteAccount, fetchProfile,
  };
};
