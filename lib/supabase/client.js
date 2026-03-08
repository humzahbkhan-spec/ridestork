import { createBrowserClient } from "@supabase/ssr";

let client;

export function createClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Return a stub during build/SSR when env vars aren't available
    return {
      auth: {
        getUser: async () => ({ data: { user: null } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithOtp: async () => ({ error: new Error("Supabase not configured") }),
        signOut: async () => {},
      },
      from: () => ({ select: () => ({ eq: () => ({ order: () => ({ data: [], error: null }) }) }) }),
      rpc: async () => ({ data: null, error: new Error("Supabase not configured") }),
    };
  }

  client = createBrowserClient(url, key);
  return client;
}
