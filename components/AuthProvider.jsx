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
    // Handle OAuth callback client-side (fixes mobile browsers)
    const handleOAuthCallback = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const authError = url.searchParams.get("auth_error");

      if (authError === "domain") {
        // Non-Stanford domain was rejected by server callback
        window.history.replaceState({}, "", "/");
        return;
      }

      if (code) {
        // Exchange the code for a session client-side
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          // Check domain enforcement
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser && !authUser.email?.endsWith("@stanford.edu")) {
            await supabase.auth.signOut();
          }
        }
        // Clean URL
        window.history.replaceState({}, "", "/");
      }
    };

    handleOAuthCallback();

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
