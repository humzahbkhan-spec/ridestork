import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_DOMAIN = "stanford.edu";

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Server-side domain check after OAuth
      const { data: { user } } = await supabase.auth.getUser();

      if (user && !user.email?.endsWith(`@${ALLOWED_DOMAIN}`)) {
        // Non-Stanford email — sign them out and reject
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/?auth_error=domain`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error — redirect home
  return NextResponse.redirect(`${origin}/`);
}
