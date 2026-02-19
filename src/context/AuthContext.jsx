import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { profileService } from '../services/financeService';

// Auth Context for global authentication state management
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  // Load profile WITHOUT blocking auth — safe even if table doesn't exist yet
  const loadProfile = useCallback(async (userId) => {
    if (!userId) { setProfile(null); return; }
    try {
      const { data } = await profileService.get(userId);
      if (data) {
        setProfile(data);
      } else {
        // First login — try to create a default profile row
        try {
          const { data: created } = await profileService.upsert({ user_id: userId });
          setProfile(created || null);
        } catch (_) {
          // profiles table may not exist yet — fail silently
          setProfile(null);
        }
      }
    } catch (_) {
      // Network/table error — don't block the app
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        // Load profile in background — doesn't block loading state
        loadProfile(session?.user?.id ?? null);
      }
    );

    // Resolve initial session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      loadProfile(session?.user?.id ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signUp = async (email, password, username = '') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: username } },
    });
    return { data, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  // Update profile and refresh local state
  const updateProfile = async (updates) => {
    if (!user) return { error: new Error('Not authenticated') };
    try {
      const { data, error } = await profileService.upsert({ user_id: user.id, ...updates });
      if (!error && data) setProfile(data);
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const value = {
    user,
    session,
    loading,
    profile,
    signUp,
    signIn,
    signOut,
    updateProfile,
    reloadProfile: () => loadProfile(user?.id),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
