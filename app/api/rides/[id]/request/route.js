import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_DOMAIN = "stanford.edu";

// POST /api/rides/[id]/request — request to join, returns contact phone
export async function POST(request, { params }) {
  const { id: rideId } = await params;
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

  // Ensure profile exists
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

  // Call the RPC function — handles rate limiting, overbooking, and logging
  const { data, error } = await supabase.rpc("request_to_join", {
    p_ride_id: rideId,
    p_requester_id: user.id,
  });

  if (error) {
    // Unique constraint violation = already requested
    if (error.code === "23505") {
      // Already requested — return the existing contact phone only
      const { data: ride } = await supabase
        .from("rides")
        .select("contact_phone, poster_id")
        .eq("id", rideId)
        .single();

      if (ride) {
        const { data: poster } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", ride.poster_id)
          .single();

        return NextResponse.json({
          already_requested: true,
          contact: {
            phone: ride.contact_phone,
            name: poster?.display_name,
          },
        });
      }
    }

    // Surface RPC exceptions (rate limit, full, own ride, etc.)
    const msg = error.message || "Request failed";
    const status = msg.includes("Rate limit") ? 429 : 400;
    return NextResponse.json({ error: msg }, { status });
  }

  return NextResponse.json(data);
}

// PATCH /api/rides/[id]/request — approve or decline a request (poster only)
export async function PATCH(request, { params }) {
  const { id: rideId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { request_id, action } = body;

  if (!request_id || !["approved", "declined"].includes(action)) {
    return NextResponse.json({ error: "Invalid request_id or action" }, { status: 400 });
  }

  // Verify the caller is the ride poster
  const { data: ride } = await supabase
    .from("rides")
    .select("id, poster_id, seats_total, status")
    .eq("id", rideId)
    .single();

  if (!ride || ride.poster_id !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // If approving, check seat availability
  if (action === "approved") {
    const { count } = await supabase
      .from("ride_requests")
      .select("*", { count: "exact", head: true })
      .eq("ride_id", rideId)
      .eq("status", "approved");

    if (count >= ride.seats_total) {
      // Auto-mark ride as full
      await supabase.from("rides").update({ status: "full" }).eq("id", rideId);
      return NextResponse.json({ error: "No seats available" }, { status: 400 });
    }
  }

  // Update the request status
  const { error } = await supabase
    .from("ride_requests")
    .update({ status: action })
    .eq("id", request_id)
    .eq("ride_id", rideId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // If approving, check if ride is now full
  if (action === "approved") {
    const { count } = await supabase
      .from("ride_requests")
      .select("*", { count: "exact", head: true })
      .eq("ride_id", rideId)
      .eq("status", "approved");

    if (count >= ride.seats_total) {
      await supabase.from("rides").update({ status: "full" }).eq("id", rideId);
    }
  }

  return NextResponse.json({ success: true });
}
