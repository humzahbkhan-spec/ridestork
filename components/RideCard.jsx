"use client";

const AIRPORT_NAMES = { SFO: "SFO Airport", SJC: "SJC Airport", OAK: "OAK Airport" };

function formatFlex(minutes) {
  if (!minutes || minutes === 0) return "Exact";
  if (minutes < 60) return `±${minutes}min`;
  return `±${minutes / 60}hr`;
}

export default function RideCard({ ride, onClick, delay = 0 }) {
  const dt = new Date(ride.departure_at);
  const dateStr = dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const timeStr = dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const avatar = ride.avatar_initials || "??";
  const name = ride.display_name || "Anonymous";
  const destination = AIRPORT_NAMES[ride.airport_code] || ride.airport_code;
  const from = ride.pickup_area || "";
  const seatsAvail = (ride.seats_total || 1) - (ride.seats_taken || 0);
  const bags = ride.bags || 1;
  const flex = formatFlex(ride.flex_window_minutes);
  const requestCount = ride.request_count || 0;
  const posted = getTimeAgo(ride.created_at);

  return (
    <div
      className="ride-card stagger-in"
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      <div className="ride-card-top">
        <div className="ride-card-user">
          <div className="ride-avatar">{avatar}</div>
          <div className="ride-user-info">
            <div className="name">{name}</div>
            <div className="meta">{posted}</div>
          </div>
        </div>
      </div>

      <div className="ride-route">
        <div className="ride-route-emoji">✈️</div>
        <div className="ride-route-details">
          <div className="ride-route-dest">{destination}</div>
          <div className="ride-route-from">from {from}</div>
        </div>
      </div>

      <div className="ride-card-bottom">
        <span className="ride-tag">{dateStr}</span>
        <span className="ride-tag">{timeStr} {flex}</span>
        <span className="ride-tag seats">{seatsAvail} seat{seatsAvail !== 1 ? "s" : ""} left</span>
        <span className="ride-tag bags">{bags} bag{bags !== 1 ? "s" : ""}</span>
        {requestCount > 0 && (
          <span className="ride-tag matched">{requestCount} interested</span>
        )}
      </div>
    </div>
  );
}

function getTimeAgo(dateStr) {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}
