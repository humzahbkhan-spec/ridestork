import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_DOMAIN = "stanford.edu";
const MAX_ACTIVE_RIDES = 5;
const VALID_AIRPORT_CODES = ["SFO", "SJC", "OAK"];

// GET /api/rides — public feed
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ride_feed")
    .select("*")
    .eq("status", "open")
    .order("departure_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST /api/rides — create a ride (auth required)
export async function POST(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Server-side domain enforcement
  if (!user.email?.endsWith(`@${ALLOWED_DOMAIN}`)) {
    return NextResponse.json(
      { error: `Only @${ALLOWED_DOMAIN} emails are allowed` },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { airport_code, pickup_area, notes, departure_at, flex_window_minutes, seats_total, bags, contact_phone } = body;

  // Validate required fields
  if (!airport_code || !pickup_area || !departure_at || !contact_phone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Validate airport code
  if (!VALID_AIRPORT_CODES.includes(airport_code)) {
    return NextResponse.json({ error: "Invalid airport code" }, { status: 400 });
  }

  // Validate departure is in the future
  if (new Date(departure_at) <= new Date()) {
    return NextResponse.json({ error: "Departure must be in the future" }, { status: 400 });
  }

  // Ensure profile exists (handles trigger failures / OAuth edge cases)
  await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      display_name: user.email.split("@")[0],
      avatar_initials: user.email.slice(0, 2).toUpperCase(),
      university: user.email.split("@")[1],
    },
    { onConflict: "id", ignoreDuplicates: true }
  );

  // Check max active rides per user
  const { data: activeCount } = await supabase.rpc("count_active_rides", {
    p_user_id: user.id,
  });

  if (activeCount >= MAX_ACTIVE_RIDES) {
    return NextResponse.json(
      { error: `You can have at most ${MAX_ACTIVE_RIDES} active rides` },
      { status: 429 }
    );
  }

  const { data, error } = await supabase
    .from("rides")
    .insert({
      poster_id: user.id,
      airport_code,
      pickup_area,
      notes: notes || null,
      departure_at,
      flex_window_minutes: parseInt(flex_window_minutes) || 60,
      seats_total: Math.min(Math.max(parseInt(seats_total) || 1, 1), 6),
      bags: Math.min(Math.max(parseInt(bags) || 1, 0), 10),
      contact_phone,
      status: "open",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
