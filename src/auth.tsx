import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type AppRole = 'trainee' | 'coach' | 'admin';
export type Gender = 'male' | 'female';
export type Profile = {
  id: string; role: AppRole; name: string; gender: Gender | null;
  birth_year: number | null; height_cm: number | null; weight_kg: number | null;
};
export type ProfilePatch = Partial<Omit<Profile, 'id' | 'role'>>;

type AuthCtx = {
  ready: boolean;
  session: Session | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  /** Returns an error text, or null. `confirm` is true when the user must confirm the email first. */
  signUp: (email: string, password: string) => Promise<{ error: string | null; confirm: boolean }>;
  signOut: () => Promise<void>;
  /** Saves the user's own details. Returns an error text, or null. */
  updateProfile: (patch: ProfilePatch) => Promise<string | null>;
};

const Ctx = createContext<AuthCtx>(null as unknown as AuthCtx);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  // Load the profile outside the auth callback, because calls inside it can deadlock.
  const userId = session?.user.id ?? null;
  useEffect(() => {
    if (!userId) { setProfile(null); return; }
    let live = true;
    supabase.from('profiles').select('id, role, name, gender, birth_year, height_cm, weight_kg').eq('id', userId).maybeSingle()
      .then(({ data }) => { if (live) setProfile((data as Profile | null) ?? null); });
    return () => { live = false; };
  }, [userId]);

  const value: AuthCtx = {
    ready, session, profile,
    signIn: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      return error ? error.message : null;
    },
    signUp: async (email, password) => {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
      return { error: error ? error.message : null, confirm: !error && !data.session };
    },
    signOut: async () => { await supabase.auth.signOut(); },
    updateProfile: async patch => {
      if (!userId) return 'Not signed in';
      const { error } = await supabase.from('profiles').update(patch).eq('id', userId);
      if (error) return error.message;
      setProfile(cur => (cur ? { ...cur, ...patch } : cur));
      return null;
    },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
