import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH /api/rides/[id] — update ride status (poster only)
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
  const { status } = body;

  if (!["cancelled", "completed"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Verify the caller is the ride poster
  const { data: ride } = await supabase
    .from("rides")
    .select("poster_id")
    .eq("id", rideId)
    .single();

  if (!ride || ride.poster_id !== user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { error } = await supabase
    .from("rides")
    .update({ status })
    .eq("id", rideId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
