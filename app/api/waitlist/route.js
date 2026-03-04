import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

let redis = null;
try {
  redis = Redis.fromEnv();
} catch {
  // Redis not configured — fallback gracefully
}

const KEY = "waitlist:emails";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const trimmed = email.trim().toLowerCase();

    if (!trimmed.endsWith(".edu")) {
      return NextResponse.json(
        { error: "Please use a .edu email address" },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.edu$/i.test(trimmed)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    let count = 0;

    if (redis) {
      await redis.sadd(KEY, trimmed);
      count = await redis.scard(KEY);
    }

    return NextResponse.json({ success: true, count });
  } catch (err) {
    console.error("Waitlist POST error:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    let count = 0;

    if (redis) {
      count = await redis.scard(KEY);
    }

    return NextResponse.json({ count });
  } catch (err) {
    console.error("Waitlist GET error:", err);
    return NextResponse.json({ count: 0 });
  }
}
