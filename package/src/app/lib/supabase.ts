import { createClient } from '@supabase/supabase-js';

// Fallback values for development - replace with your actual Supabase values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hlxpccffiulkaoxpotvn.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhseHBjY2ZmaXVsa2FveHBvdHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2NTkwNzQsImV4cCI6MjA1MjIzNTA3NH0.Kwn6VvQwkvq-dtsDceMBquRmRMTV_API_API_KEY';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for authentication
export const authHelpers = {
  // Sign up with email and password
  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },

  // Sign in with email and password
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Get current user
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }
};
