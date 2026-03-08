"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";

const AIRPORT_NAMES = { SFO: "SFO Airport", SJC: "SJC Airport", OAK: "OAK Airport" };

function formatFlex(minutes) {
  if (!minutes || minutes === 0) return "Exact";
  if (minutes < 60) return `±${minutes}min`;
  return `±${minutes / 60}hr`;
}

export default function RideDetailModal({ ride, onClose }) {
  const { showAuthGate } = useAuth();
  const [requestStatus, setRequestStatus] = useState("idle"); // idle, loading, done, error
  const [contact, setContact] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const dt = new Date(ride.departure_at);
  const dateStr = dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const timeStr = dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  const avatar = ride.avatar_initials || "??";
  const name = ride.display_name || "Anonymous";
  const university = ride.university || "stanford.edu";
  const destination = AIRPORT_NAMES[ride.airport_code] || ride.airport_code;
  const from = ride.pickup_area || "";
  const seatsAvail = (ride.seats_total || 1) - (ride.seats_taken || 0);
  const bags = ride.bags || 1;
  const flex = formatFlex(ride.flex_window_minutes);

  const handleRequest = () => {
    showAuthGate(async () => {
      setRequestStatus("loading");
      setErrorMsg("");
      try {
        const res = await fetch(`/api/rides/${ride.id}/request`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        setContact(data.contact || data);
        setRequestStatus("done");
      } catch (err) {
        setErrorMsg(err.message);
        setRequestStatus("error");
      }
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />

        <div className="modal-header">
          <div className="modal-avatar">{avatar}</div>
          <div className="modal-user-info">
            <div className="name">{name}</div>
            <div className="school">{university}</div>
          </div>
        </div>

        <div className="modal-route-block">
          <div className="modal-route-line">
            <div className="route-dot" />
            <div className="route-text">
              <div className="label">Pickup</div>
              <div className="value">{from}</div>
            </div>
          </div>
          <div className="modal-route-line">
            <div className="route-dot dest" />
            <div className="route-text">
              <div className="label">Destination</div>
              <div className="value">{destination}</div>
            </div>
          </div>
        </div>

        <div className="modal-details">
          <div className="detail-card">
            <div className="label">Date</div>
            <div className="value">{dateStr}</div>
          </div>
          <div className="detail-card">
            <div className="label">Time</div>
            <div className="value">{timeStr}</div>
          </div>
          <div className="detail-card">
            <div className="label">Flexibility</div>
            <div className="value">{flex}</div>
          </div>
          <div className="detail-card">
            <div className="label">Seats Left</div>
            <div className="value">{seatsAvail}</div>
          </div>
          <div className="detail-card">
            <div className="label">Bags</div>
            <div className="value">{bags}</div>
          </div>
        </div>

        {ride.notes && (
          <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 16 }}>
            {ride.notes}
          </p>
        )}

        {contact ? (
          <div className="contact-info">
            <h4>Contact {contact.name}</h4>
            <div className="contact-row">
              <span className="contact-label">Phone</span>
              <a className="contact-value" href={`tel:${contact.phone}`}>{contact.phone}</a>
            </div>
          </div>
        ) : (
          <button
            className={`modal-action-btn ${requestStatus === "done" ? "joined" : ""}`}
            onClick={handleRequest}
            disabled={requestStatus === "loading" || seatsAvail <= 0}
          >
            {seatsAvail <= 0
              ? "Ride is full"
              : requestStatus === "loading"
                ? "Requesting..."
                : `Request to Join · Split ~$${Math.round(45 / (seatsAvail + 1))}/person`}
          </button>
        )}

        {errorMsg && (
          <p style={{ color: "#D44", fontSize: 13, marginTop: 8, textAlign: "center" }}>
            {errorMsg}
          </p>
        )}

        <button className="modal-action-btn secondary" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
