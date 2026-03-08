"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import AuthGate from "./AuthGate";

const AuthContext = createContext({
  user: null,
  loading: true,
  showAuthGate: () => {},
  signOut: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authGateVisible, setAuthGateVisible] = useState(false);
  const [authGateCallback, setAuthGateCallback] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user && authGateVisible) {
        setAuthGateVisible(false);
        authGateCallback?.();
        setAuthGateCallback(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const showAuthGate = useCallback((onSuccess) => {
    if (user) {
      onSuccess?.();
      return;
    }
    setAuthGateCallback(() => onSuccess);
    setAuthGateVisible(true);
  }, [user]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, showAuthGate, signOut }}>
      {children}
      {authGateVisible && (
        <AuthGate onClose={() => {
          setAuthGateVisible(false);
          setAuthGateCallback(null);
        }} />
      )}
    </AuthContext.Provider>
  );
}
