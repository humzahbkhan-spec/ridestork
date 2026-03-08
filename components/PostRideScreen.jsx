"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";

const FLEX_OPTIONS = [
  { label: "±30min", value: 30 },
  { label: "±1hr", value: 60 },
  { label: "±2hr", value: 120 },
  { label: "Exact time", value: 0 },
];

export default function PostRideScreen({ onBack, onPost }) {
  const { showAuthGate } = useAuth();
  const [form, setForm] = useState({
    airport_code: "",
    pickup_area: "",
    notes: "",
    date: "",
    time: "",
    flex_window_minutes: "60",
    seats_total: "1",
    bags: "1",
    contact_phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const update = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));
  const filled = form.airport_code && form.pickup_area && form.date && form.time && form.contact_phone;

  const handleSubmit = () => {
    if (!filled) return;

    setErrorMsg("");
    showAuthGate(async () => {
      setSubmitting(true);
      try {
        // Combine date + time into single ISO timestamp
        const departure_at = new Date(`${form.date}T${form.time}`).toISOString();

        const res = await fetch("/api/rides", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            airport_code: form.airport_code,
            pickup_area: form.pickup_area,
            notes: form.notes || undefined,
            departure_at,
            flex_window_minutes: parseInt(form.flex_window_minutes),
            seats_total: form.seats_total,
            bags: form.bags,
            contact_phone: form.contact_phone,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error);
        }

        onPost();
      } catch (err) {
        setErrorMsg(err.message);
      } finally {
        setSubmitting(false);
      }
    });
  };

  return (
    <div className="post-screen">
      <button className="post-back" onClick={onBack}>
        ← Back
      </button>
      <h1 className="post-title">Post a Ride</h1>
      <p className="post-subtitle">Find students heading your way</p>

      <div className="form-group">
        <label className="form-label">Airport</label>
        <select
          className="form-select"
          value={form.airport_code}
          onChange={(e) => update("airport_code", e.target.value)}
        >
          <option value="">Select airport</option>
          <option value="SFO">SFO Airport</option>
          <option value="SJC">SJC Airport</option>
          <option value="OAK">OAK Airport</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Pickup area</label>
        <input
          className="form-input"
          placeholder="e.g. Wilbur, FloMo, Stern, The Row"
          value={form.pickup_area}
          onChange={(e) => update("pickup_area", e.target.value)}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Date</label>
          <input
            className="form-input"
            type="date"
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Time</label>
          <input
            className="form-input"
            type="time"
            value={form.time}
            onChange={(e) => update("time", e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Flexibility</label>
          <select
            className="form-select"
            value={form.flex_window_minutes}
            onChange={(e) => update("flex_window_minutes", e.target.value)}
          >
            {FLEX_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Seats available</label>
          <select
            className="form-select"
            value={form.seats_total}
            onChange={(e) => update("seats_total", e.target.value)}
          >
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
            <option>6</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Bags</label>
        <select
          className="form-select"
          value={form.bags}
          onChange={(e) => update("bags", e.target.value)}
        >
          <option value="1">1 bag (carry-on only)</option>
          <option value="2">2 bags (carry-on + checked)</option>
          <option value="3">3+ bags (heavy packer)</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Notes (optional)</label>
        <input
          className="form-input"
          placeholder="e.g. Leaving right after finals"
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Your phone number</label>
        <input
          className="form-input"
          type="tel"
          placeholder="(555) 123-4567"
          value={form.contact_phone}
          onChange={(e) => update("contact_phone", e.target.value)}
        />
      </div>

      {errorMsg && (
        <p style={{ color: "#D44", fontSize: 13, marginBottom: 8 }}>{errorMsg}</p>
      )}

      <button
        className="post-btn"
        style={{ opacity: filled && !submitting ? 1 : 0.4 }}
        onClick={handleSubmit}
        disabled={submitting || !filled}
      >
        {submitting ? "Posting..." : "Post Your Ride"}
      </button>
    </div>
  );
}
