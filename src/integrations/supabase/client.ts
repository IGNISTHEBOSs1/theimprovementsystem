import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://xbrzrxfntixkiykfczjf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhicnpyeGZudGl4a2l5a2ZjempmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MzgxODQsImV4cCI6MjA4OTQxNDE4NH0.pnPti3O2u14daEWAen3Y2LvZHXeFYMFg7bWLJmXr-ZA";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
