"use client";

import { useState } from "react";

const PREVIEW_RIDES = [
  { id: 1, name: "Sarah K.", avatar: "SK", destination: "SFO Airport", from: "Wilbur Hall", date: "Mar 14", time: "2:00 PM", flexWindow: "±1hr", seats: 2, bags: 1, distance: "0.3 mi", posted: "2m ago", emoji: "✈️", matched: 3 },
  { id: 2, name: "James L.", avatar: "JL", destination: "SJC Airport", from: "Stern Hall", date: "Mar 15", time: "10:00 AM", flexWindow: "±2hr", seats: 3, bags: 2, distance: "0.1 mi", posted: "5m ago", emoji: "✈️", matched: 1 },
  { id: 3, name: "Priya M.", avatar: "PM", destination: "OAK Airport", from: "The Row", date: "Mar 14", time: "6:00 AM", flexWindow: "±30min", seats: 1, bags: 3, distance: "0.5 mi", posted: "12m ago", emoji: "✈️", matched: 0 },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700&family=Fraunces:opsz,wght@9..144,600;9..144,800&display=swap');

  :root {
    --bg: #FAFAF7;
    --surface: #FFFFFF;
    --surface-alt: #F2F0EB;
    --ink: #1A1A17;
    --ink-soft: #6B6960;
    --ink-faint: #A8A49B;
    --accent: #E07B3C;
    --accent-soft: #FFF3EB;
    --accent-hover: #CC6A2E;
    --green: #2D8A56;
    --green-soft: #E8F5ED;
    --blue: #3B6FD4;
    --blue-soft: #EBF0FA;
    --radius: 16px;
    --radius-sm: 10px;
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
    --shadow-lg: 0 12px 40px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04);
    --transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  * { box-sizing: border-box; }

  .landing {
    min-height: 100vh;
    background: linear-gradient(180deg, #FFF8F2 0%, var(--bg) 40%);
    font-family: 'DM Sans', sans-serif;
    color: var(--ink);
    overflow-x: hidden;
  }

  /* ── Hero ── */
  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 64px 24px 48px;
    text-align: center;
  }

  .hero-logo {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    margin-bottom: 24px;
  }

  .hero-logo img {
    width: 135%;
    height: 135%;
    object-fit: cover;
    object-position: center;
    margin: -17.5% 0 0 -17.5%;
  }

  .hero h1 {
    font-family: 'Fraunces', serif;
    font-weight: 800;
    font-size: 48px;
    margin: 0 0 12px;
    color: var(--ink);
    letter-spacing: -1px;
  }

  .hero .tagline {
    font-size: 18px;
    color: var(--ink-soft);
    max-width: 380px;
    line-height: 1.5;
    margin: 0;
    font-weight: 300;
  }

  .hero .explainer {
    font-size: 15px;
    color: var(--ink-faint);
    max-width: 340px;
    line-height: 1.5;
    margin: 16px 0 0;
    font-weight: 400;
  }

  /* ── Phone Previews ── */
  .previews-section {
    padding: 0 24px 48px;
  }

  .previews-stack {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
    max-width: 380px;
    margin: 0 auto;
  }

  .preview-card {
    width: 100%;
    text-align: center;
  }

  .phone-frame {
    width: 100%;
    height: 540px;
    border-radius: 28px;
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    border: 4px solid #E8E5DE;
    background: var(--bg);
    position: relative;
  }

  .phone-frame-inner {
    width: 100%;
    height: 100%;
    overflow: hidden;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    position: relative;
  }

  .preview-card p.caption {
    margin: 16px 0 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--ink-soft);
  }

  /* ── Mini components inside phone frames ── */
  .mini-header {
    padding: 16px 16px 12px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--bg);
  }

  .mini-header-title {
    font-family: 'Fraunces', serif;
    font-size: 19px;
    font-weight: 800;
    letter-spacing: -0.3px;
  }

  .mini-header-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--surface-alt);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    color: var(--ink-soft);
  }

  .mini-banner {
    margin: 0 12px 10px;
    padding: 12px 14px;
    background: linear-gradient(135deg, var(--ink) 0%, #2A2A25 100%);
    border-radius: 12px;
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .mini-banner h3 {
    font-family: 'Fraunces', serif;
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 2px;
  }

  .mini-banner p {
    font-size: 10px;
    color: rgba(255,255,255,0.5);
    margin: 0;
    font-weight: 300;
  }

  .mini-banner .number {
    font-family: 'Fraunces', serif;
    font-size: 24px;
    font-weight: 800;
    color: var(--accent);
    line-height: 1;
  }

  .mini-banner .label {
    font-size: 9px;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-align: right;
  }

  .mini-filters {
    padding: 0 12px 8px;
    display: flex;
    gap: 5px;
    overflow: hidden;
  }

  .mini-chip {
    padding: 5px 10px;
    border-radius: 100px;
    border: 1px solid var(--surface-alt);
    background: var(--surface);
    font-size: 10px;
    font-weight: 500;
    color: var(--ink-soft);
    white-space: nowrap;
    font-family: 'DM Sans', sans-serif;
  }

  .mini-chip.active {
    background: var(--ink);
    color: white;
    border-color: var(--ink);
  }

  .mini-ride-card {
    margin: 0 12px 8px;
    background: var(--surface);
    border-radius: 12px;
    padding: 12px;
    box-shadow: var(--shadow-sm);
  }

  .mini-ride-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .mini-ride-user {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .mini-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: var(--surface-alt);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    color: var(--ink-soft);
    flex-shrink: 0;
  }

  .mini-name { font-weight: 700; font-size: 12px; }
  .mini-meta { font-size: 10px; color: var(--ink-faint); }

  .mini-distance {
    font-size: 10px;
    color: var(--blue);
    background: var(--blue-soft);
    padding: 3px 8px;
    border-radius: 100px;
    font-weight: 500;
  }

  .mini-route {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 10px;
    background: var(--bg);
    border-radius: 8px;
    margin-bottom: 10px;
  }

  .mini-route-emoji { font-size: 18px; }
  .mini-route-dest { font-weight: 700; font-size: 13px; }
  .mini-route-from { font-size: 10px; color: var(--ink-faint); }

  .mini-tags {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
  }

  .mini-tag {
    padding: 3px 8px;
    border-radius: 100px;
    font-size: 10px;
    font-weight: 500;
    background: var(--surface-alt);
    color: var(--ink-soft);
  }

  .mini-tag.seats { background: var(--green-soft); color: var(--green); }
  .mini-tag.matched { background: var(--accent-soft); color: var(--accent); }

  /* ── Detail preview ── */
  .mini-detail-sheet {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--surface);
    border-radius: 20px 20px 0 0;
    padding: 10px 18px 18px;
    box-shadow: 0 -4px 20px rgba(0,0,0,0.1);
  }

  .mini-handle {
    width: 28px;
    height: 3px;
    border-radius: 2px;
    background: var(--surface-alt);
    margin: 0 auto 12px;
  }

  .mini-detail-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }

  .mini-detail-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: var(--surface-alt);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: var(--ink-soft);
  }

  .mini-detail-name { font-weight: 700; font-size: 15px; }
  .mini-detail-school { font-size: 11px; color: var(--ink-faint); }

  .mini-route-block {
    background: var(--bg);
    border-radius: 12px;
    padding: 14px 16px;
    margin-bottom: 12px;
  }

  .mini-route-line {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }

  .mini-route-line + .mini-route-line { margin-top: 12px; }

  .mini-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2.5px solid var(--accent);
    background: white;
    flex-shrink: 0;
    margin-top: 3px;
  }

  .mini-dot.dest { background: var(--accent); }

  .mini-route-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.6px; color: var(--ink-faint); }
  .mini-route-value { font-weight: 700; font-size: 14px; }

  .mini-details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 14px;
  }

  .mini-detail-cell {
    background: var(--bg);
    border-radius: 8px;
    padding: 10px;
  }

  .mini-detail-cell .label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.6px; color: var(--ink-faint); margin-bottom: 2px; }
  .mini-detail-cell .value { font-weight: 700; font-size: 14px; }

  .mini-action-btn {
    width: 100%;
    padding: 12px;
    border-radius: 12px;
    border: none;
    background: var(--accent);
    color: white;
    font-size: 13px;
    font-weight: 700;
    font-family: 'DM Sans', sans-serif;
    text-align: center;
  }

  /* ── Post preview ── */
  .mini-post-screen {
    padding: 18px;
    height: 100%;
    overflow: hidden;
  }

  .mini-post-back {
    font-size: 12px;
    color: var(--ink-soft);
    margin-bottom: 14px;
    font-weight: 500;
  }

  .mini-post-title {
    font-family: 'Fraunces', serif;
    font-size: 24px;
    font-weight: 800;
    margin-bottom: 3px;
    letter-spacing: -0.3px;
  }

  .mini-post-subtitle {
    font-size: 12px;
    color: var(--ink-faint);
    margin-bottom: 20px;
    font-weight: 300;
  }

  .mini-form-group { margin-bottom: 12px; }

  .mini-form-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    color: var(--ink-soft);
    margin-bottom: 5px;
    display: block;
  }

  .mini-form-input {
    width: 100%;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid var(--surface-alt);
    background: var(--surface);
    font-size: 13px;
    color: var(--ink);
    font-family: 'DM Sans', sans-serif;
  }

  .mini-form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .mini-post-btn {
    width: 100%;
    padding: 12px;
    border-radius: 12px;
    border: none;
    background: var(--accent);
    color: white;
    font-size: 13px;
    font-weight: 700;
    font-family: 'DM Sans', sans-serif;
    margin-top: 8px;
  }

  /* ── Bottom nav (preview) ── */
  .mini-nav {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--surface);
    border-top: 1px solid var(--surface-alt);
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 6px 0 10px;
  }

  .mini-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
  }

  .mini-nav-icon { font-size: 18px; opacity: 0.35; }
  .mini-nav-label { font-size: 8px; color: var(--ink-faint); text-transform: uppercase; letter-spacing: 0.3px; font-weight: 500; }
  .mini-nav-item.active .mini-nav-icon { opacity: 1; }
  .mini-nav-item.active .mini-nav-label { color: var(--accent); font-weight: 700; }

  .mini-nav-fab {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: -18px;
    box-shadow: 0 2px 8px rgba(232,85,61,0.35);
  }

  /* ── Signup ── */
  .signup-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 24px 56px;
    text-align: center;
  }

  .signup-section h2 {
    font-family: 'Fraunces', serif;
    font-weight: 600;
    font-size: 26px;
    margin: 0 0 8px;
  }

  .signup-section .subtitle {
    font-size: 15px;
    color: var(--ink-soft);
    margin: 0 0 24px;
    font-weight: 300;
  }

  .signup-form {
    display: flex;
    gap: 10px;
    width: 100%;
    max-width: 420px;
  }

  .signup-form input {
    flex: 1;
    padding: 14px 16px;
    border: 1.5px solid var(--surface-alt);
    border-radius: var(--radius-sm);
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    background: var(--surface);
    color: var(--ink);
    outline: none;
    transition: border-color var(--transition);
  }

  .signup-form input:focus { border-color: var(--accent); }
  .signup-form input::placeholder { color: var(--ink-faint); }

  .signup-form button {
    padding: 14px 22px;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: var(--radius-sm);
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: background var(--transition);
    white-space: nowrap;
  }

  .signup-form button:hover { background: var(--accent-hover); }
  .signup-form button:disabled { opacity: 0.6; cursor: not-allowed; }

  .signup-error {
    color: #c0392b;
    font-size: 13px;
    margin-top: 10px;
  }

  .signup-success {
    margin-top: 10px;
    padding: 14px 24px;
    background: var(--green-soft);
    color: var(--green);
    border-radius: var(--radius-sm);
    font-weight: 500;
    font-size: 15px;
  }

  .waitlist-count {
    margin-top: 16px;
    font-size: 14px;
    color: var(--ink-faint);
    font-weight: 400;
  }

  .waitlist-count strong {
    color: var(--ink-soft);
    font-weight: 700;
  }

  /* ── Footer ── */
  .landing-footer {
    text-align: center;
    padding: 0 24px 48px;
    font-size: 14px;
    color: var(--ink-faint);
  }

  .landing-footer a {
    color: var(--accent);
    text-decoration: none;
    font-weight: 500;
  }

  .landing-footer a:hover { text-decoration: underline; }

  /* ── Responsive ── */
  @media (min-width: 640px) {
    .hero { padding-top: 96px; }
    .previews-scroll { justify-content: center; }
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .animate-in {
    animation: fadeUp 0.5s ease-out both;
  }
`;

/* ── Mini-preview components ── */

function MiniNav({ active = "feed" }) {
  return (
    <div className="mini-nav">
      <div className={`mini-nav-item ${active === "feed" ? "active" : ""}`}>
        <span className="mini-nav-icon">🏠</span>
        <span className="mini-nav-label">Feed</span>
      </div>
      <div className={`mini-nav-item ${active === "nearby" ? "active" : ""}`}>
        <span className="mini-nav-icon">📡</span>
        <span className="mini-nav-label">Nearby</span>
      </div>
      <div className="mini-nav-fab">
        <svg width="14" height="14" viewBox="0 0 22 22" fill="none">
          <path d="M11 3V19M3 11H19" stroke="white" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </div>
      <div className="mini-nav-item">
        <span className="mini-nav-icon">🎫</span>
        <span className="mini-nav-label">My Rides</span>
      </div>
      <div className="mini-nav-item">
        <span className="mini-nav-icon">💬</span>
        <span className="mini-nav-label">Chat</span>
      </div>
    </div>
  );
}

function FeedPreview() {
  return (
    <div className="phone-frame-inner">
      <div className="mini-header">
        <span className="mini-header-title">RideStork</span>
        <div className="mini-header-avatar">ME</div>
      </div>

      <div className="mini-banner">
        <div>
          <h3>Spring Break 🌴</h3>
          <p>Mar 14 – 30 · High demand</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="number">47</div>
          <div className="label">Active</div>
        </div>
      </div>

      <div className="mini-filters">
        <span className="mini-chip active">All</span>
        <span className="mini-chip">SFO</span>
        <span className="mini-chip">SJC</span>
        <span className="mini-chip">OAK</span>
        <span className="mini-chip">All Dates</span>
      </div>

      {PREVIEW_RIDES.map((ride) => (
        <div className="mini-ride-card" key={ride.id}>
          <div className="mini-ride-top">
            <div className="mini-ride-user">
              <div className="mini-avatar">{ride.avatar}</div>
              <div>
                <div className="mini-name">{ride.name}</div>
                <div className="mini-meta">{ride.posted}</div>
              </div>
            </div>
            <div className="mini-distance">📍 {ride.distance}</div>
          </div>
          <div className="mini-route">
            <span className="mini-route-emoji">{ride.emoji}</span>
            <div>
              <div className="mini-route-dest">{ride.destination}</div>
              <div className="mini-route-from">from {ride.from}</div>
            </div>
          </div>
          <div className="mini-tags">
            <span className="mini-tag">📅 {ride.date}</span>
            <span className="mini-tag">🕐 {ride.time}</span>
            <span className="mini-tag seats">🪑 {ride.seats}</span>
            {ride.matched > 0 && <span className="mini-tag matched">👋 {ride.matched}</span>}
          </div>
        </div>
      ))}

      <MiniNav active="feed" />
    </div>
  );
}

function DetailPreview() {
  const ride = PREVIEW_RIDES[0];
  return (
    <div className="phone-frame-inner">
      {/* Dimmed feed behind */}
      <div style={{ opacity: 0.3, filter: "blur(1px)" }}>
        <div className="mini-header">
          <span className="mini-header-title">RideStork</span>
          <div className="mini-header-avatar">ME</div>
        </div>
        <div className="mini-banner">
          <div>
            <h3>Spring Break 🌴</h3>
            <p>Mar 14 – 30 · High demand</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="number">47</div>
            <div className="label">Active</div>
          </div>
        </div>
      </div>

      {/* Bottom sheet */}
      <div className="mini-detail-sheet">
        <div className="mini-handle" />
        <div className="mini-detail-header">
          <div className="mini-detail-avatar">{ride.avatar}</div>
          <div>
            <div className="mini-detail-name">{ride.name}</div>
            <div className="mini-detail-school">Stanford University · Verified .edu</div>
          </div>
        </div>

        <div className="mini-route-block">
          <div className="mini-route-line">
            <div className="mini-dot" />
            <div>
              <div className="mini-route-label">Pickup</div>
              <div className="mini-route-value">{ride.from}</div>
            </div>
          </div>
          <div className="mini-route-line">
            <div className="mini-dot dest" />
            <div>
              <div className="mini-route-label">Destination</div>
              <div className="mini-route-value">{ride.destination}</div>
            </div>
          </div>
        </div>

        <div className="mini-details-grid">
          <div className="mini-detail-cell">
            <div className="label">Date</div>
            <div className="value">{ride.date}</div>
          </div>
          <div className="mini-detail-cell">
            <div className="label">Time</div>
            <div className="value">{ride.time}</div>
          </div>
          <div className="mini-detail-cell">
            <div className="label">Flexibility</div>
            <div className="value">{ride.flexWindow}</div>
          </div>
          <div className="mini-detail-cell">
            <div className="label">Open Seats</div>
            <div className="value">{ride.seats}</div>
          </div>
        </div>

        <div className="mini-action-btn">
          Request to Join · Split ~${Math.round(45 / (ride.seats + 1))}/person
        </div>
      </div>
    </div>
  );
}

function PostPreview() {
  return (
    <div className="phone-frame-inner">
      <div className="mini-post-screen">
        <div className="mini-post-back">← Back</div>
        <div className="mini-post-title">Post a Ride</div>
        <div className="mini-post-subtitle">Find students heading your way</div>

        <div className="mini-form-group">
          <span className="mini-form-label">Where are you going?</span>
          <div className="mini-form-input" style={{ color: "var(--ink)" }}>SFO Airport</div>
        </div>

        <div className="mini-form-group">
          <span className="mini-form-label">Pickup area</span>
          <div className="mini-form-input" style={{ color: "var(--ink)" }}>FloMo</div>
        </div>

        <div className="mini-form-row">
          <div className="mini-form-group">
            <span className="mini-form-label">Date</span>
            <div className="mini-form-input">Mar 16</div>
          </div>
          <div className="mini-form-group">
            <span className="mini-form-label">Time</span>
            <div className="mini-form-input">4:00 PM</div>
          </div>
        </div>

        <div className="mini-form-row">
          <div className="mini-form-group">
            <span className="mini-form-label">Flexibility</span>
            <div className="mini-form-input">±1hr</div>
          </div>
          <div className="mini-form-group">
            <span className="mini-form-label">Open seats</span>
            <div className="mini-form-input">2</div>
          </div>
        </div>

        <div className="mini-form-group">
          <span className="mini-form-label">Bags 🧳</span>
          <div className="mini-form-input">1 bag (carry-on only)</div>
        </div>

        <div className="mini-post-btn">Post Your Ride</div>
      </div>
    </div>
  );
}

/* ── Landing Page ── */

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("loading");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className="landing">
        {/* Hero */}
        <section className="hero animate-in">
          <div className="hero-logo">
            <img src="/logo.png" alt="RideStork" />
          </div>
          <h1>RideStork</h1>
          <p className="tagline">
            Find students heading your way.
            <br />
            Split rides, save money, travel together.
          </p>
        </section>

        {/* Signup */}
        <section className="signup-section animate-in" style={{ animationDelay: "0.1s" }}>
          <h2>Get Access Before Spring Break</h2>
          <p className="subtitle">Join the waitlist with your .edu email</p>

          {status !== "success" ? (
            <>
              <form className="signup-form" onSubmit={handleSubmit}>
                <input
                  type="email"
                  placeholder="you@stanford.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" disabled={status === "loading"}>
                  {status === "loading" ? "Joining..." : "Join the Waitlist"}
                </button>
              </form>
              {error && <p className="signup-error">{error}</p>}
            </>
          ) : (
            <div className="signup-success">
              You&apos;re on the list! We&apos;ll reach out soon.
            </div>
          )}

        </section>

        {/* Live Previews */}
        <section className="previews-section animate-in" style={{ animationDelay: "0.2s" }}>
          <div className="previews-stack">
            <div className="preview-card">
              <div className="phone-frame"><FeedPreview /></div>
              <p className="caption">Browse rides near you</p>
            </div>
            <div className="preview-card">
              <div className="phone-frame"><DetailPreview /></div>
              <p className="caption">View details &amp; request to join</p>
            </div>
            <div className="preview-card">
              <div className="phone-frame"><PostPreview /></div>
              <p className="caption">Post your own ride</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="landing-footer">
          Built for Stanford students &middot;{" "}
          <a href="/demo">Try the demo</a>
        </footer>
      </div>
    </>
  );
}
