"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";

const AIRPORT_NAMES = { SFO: "SFO Airport", SJC: "SJC Airport", OAK: "OAK Airport" };

function formatFlex(minutes) {
  if (!minutes || minutes === 0) return "Exact";
  if (minutes < 60) return `±${minutes}min`;
  return `±${minutes / 60}hr`;
}

function formatDeparture(iso) {
  const dt = new Date(iso);
  const date = dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const time = dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${date} · ${time}`;
}

function RequestCard({ req, rideId, onAction }) {
  const [loading, setLoading] = useState(false);
  const profile = req.profiles;

  const handleAction = async (action) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rides/${rideId}/request`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id: req.id, action }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error);
      } else {
        onAction();
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "12px 0", borderBottom: "1px solid var(--surface-alt)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div className="ride-avatar" style={{ width: 36, height: 36, fontSize: 12 }}>
          {profile?.avatar_initials || "??"}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{profile?.display_name || "Unknown"}</div>
          <div style={{ fontSize: 12, color: "var(--ink-faint)" }}>{profile?.email}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        {req.status === "pending" ? (
          <>
            <button
              onClick={() => handleAction("approved")}
              disabled={loading}
              style={{
                padding: "6px 14px", borderRadius: 100, border: "none",
                background: "var(--green)", color: "white", fontSize: 12,
                fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Approve
            </button>
            <button
              onClick={() => handleAction("declined")}
              disabled={loading}
              style={{
                padding: "6px 14px", borderRadius: 100, border: "1.5px solid var(--surface-alt)",
                background: "var(--surface)", color: "var(--ink-soft)", fontSize: 12,
                fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Decline
            </button>
          </>
        ) : (
          <span style={{
            padding: "6px 14px", borderRadius: 100, fontSize: 12, fontWeight: 600,
            background: req.status === "approved" ? "var(--green-soft)" : "var(--surface-alt)",
            color: req.status === "approved" ? "var(--green)" : "var(--ink-faint)",
          }}>
            {req.status === "approved" ? "Approved" : "Declined"}
          </span>
        )}
      </div>
    </div>
  );
}

function PostedRideCard({ ride, onUpdate }) {
  const [expanded, setExpanded] = useState(false);
  const requests = ride.ride_requests || [];
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const seatsLeft = ride.seats_total - approvedCount;

  return (
    <div className="ride-card" style={{ cursor: "default" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>
            {AIRPORT_NAMES[ride.airport_code] || ride.airport_code}
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-faint)" }}>
            from {ride.pickup_area}
          </div>
        </div>
        <span style={{
          padding: "4px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600,
          background: ride.status === "open" ? "var(--green-soft)" : "var(--surface-alt)",
          color: ride.status === "open" ? "var(--green)" : "var(--ink-faint)",
          textTransform: "uppercase", letterSpacing: "0.5px",
        }}>
          {ride.status}
        </span>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <span className="ride-tag">{formatDeparture(ride.departure_at)}</span>
        <span className="ride-tag">{formatFlex(ride.flex_window_minutes)}</span>
        <span className="ride-tag seats">{seatsLeft} seat{seatsLeft !== 1 ? "s" : ""} left</span>
      </div>

      {requests.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
            color: pendingCount > 0 ? "var(--accent)" : "var(--ink-soft)",
            padding: 0,
          }}
        >
          {expanded ? "Hide" : "Show"} {requests.length} request{requests.length !== 1 ? "s" : ""}
          {pendingCount > 0 && ` (${pendingCount} new)`}
        </button>
      )}

      {expanded && (
        <div style={{ marginTop: 8 }}>
          {requests.map((req) => (
            <RequestCard key={req.id} req={req} rideId={ride.id} onAction={onUpdate} />
          ))}
        </div>
      )}
    </div>
  );
}

function RequestedRideCard({ req }) {
  const ride = req.rides;
  if (!ride) return null;

  return (
    <div className="ride-card" style={{ cursor: "default" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>
            {AIRPORT_NAMES[ride.airport_code] || ride.airport_code}
          </div>
          <div style={{ fontSize: 13, color: "var(--ink-faint)" }}>
            from {ride.pickup_area}
          </div>
        </div>
        <span style={{
          padding: "4px 10px", borderRadius: 100, fontSize: 11, fontWeight: 600,
          background: req.status === "approved" ? "var(--green-soft)"
            : req.status === "pending" ? "var(--accent-soft)" : "var(--surface-alt)",
          color: req.status === "approved" ? "var(--green)"
            : req.status === "pending" ? "var(--accent)" : "var(--ink-faint)",
          textTransform: "uppercase", letterSpacing: "0.5px",
        }}>
          {req.status}
        </span>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span className="ride-tag">{formatDeparture(ride.departure_at)}</span>
        <span className="ride-tag">{formatFlex(ride.flex_window_minutes)}</span>
      </div>

      {req.status === "approved" && ride.contact_phone && (
        <div className="contact-info" style={{ marginTop: 12 }}>
          <div className="contact-row">
            <span className="contact-label">Phone</span>
            <a className="contact-value" href={`tel:${ride.contact_phone}`}>{ride.contact_phone}</a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyRidesScreen() {
  const { user, showAuthGate } = useAuth();
  const [data, setData] = useState({ posted: [], requested: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("posted"); // posted, requested

  const fetchMyRides = async () => {
    try {
      const res = await fetch("/api/rides/mine");
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyRides();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="empty-state" style={{ paddingTop: 100 }}>
        <div className="emoji">🤠</div>
        <h3>My Rides</h3>
        <p style={{ marginBottom: 16 }}>Sign in to see your rides</p>
        <button
          className="auth-gate-btn"
          style={{ maxWidth: 200, margin: "0 auto" }}
          onClick={() => showAuthGate()}
        >
          Sign in
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-state" style={{ paddingTop: 100 }}>
        <div className="loading-spinner" />
        <p style={{ color: "var(--ink-faint)", fontSize: 14 }}>Loading your rides...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "56px 20px 120px" }}>
      <h1 className="post-title" style={{ marginBottom: 16 }}>My Rides</h1>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button
          className={`filter-chip ${tab === "posted" ? "active" : ""}`}
          onClick={() => setTab("posted")}
        >
          Posted ({data.posted.length})
        </button>
        <button
          className={`filter-chip ${tab === "requested" ? "active" : ""}`}
          onClick={() => setTab("requested")}
        >
          Requested ({data.requested.length})
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {tab === "posted" ? (
          data.posted.length > 0 ? (
            data.posted.map((ride) => (
              <PostedRideCard key={ride.id} ride={ride} onUpdate={fetchMyRides} />
            ))
          ) : (
            <div className="empty-state">
              <div className="emoji">📭</div>
              <h3>No rides posted</h3>
              <p>Tap + to post your first ride</p>
            </div>
          )
        ) : data.requested.length > 0 ? (
          data.requested.map((req) => (
            <RequestedRideCard key={req.id} req={req} />
          ))
        ) : (
          <div className="empty-state">
            <div className="emoji">🔍</div>
            <h3>No requests yet</h3>
            <p>Browse the feed and request to join a ride</p>
          </div>
        )}
      </div>
    </div>
  );
}
