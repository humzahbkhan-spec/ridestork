import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/rides/mine — rides I posted (with incoming requests) + rides I requested
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rides I posted — include incoming requests with requester profile info
  const { data: posted, error: postedErr } = await supabase
    .from("rides")
    .select(`
      id, airport_code, pickup_area, departure_at, flex_window_minutes,
      seats_total, bags, status, contact_phone, created_at,
      ride_requests (
        id, status, created_at,
        profiles:requester_id ( id, display_name, avatar_initials, email )
      )
    `)
    .eq("poster_id", user.id)
    .order("departure_at", { ascending: true });

  // Rides I requested
  const { data: requested, error: requestedErr } = await supabase
    .from("ride_requests")
    .select(`
      id, status, created_at,
      rides:ride_id (
        id, airport_code, pickup_area, departure_at, flex_window_minutes,
        seats_total, bags, status, contact_phone
      )
    `)
    .eq("requester_id", user.id)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });

  if (postedErr || requestedErr) {
    return NextResponse.json(
      { error: postedErr?.message || requestedErr?.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ posted: posted || [], requested: requested || [] });
}
