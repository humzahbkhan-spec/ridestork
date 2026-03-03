import { useState, useEffect, useCallback } from "react";

const MOCK_RIDES = [
  { id: 1, name: "Sarah K.", avatar: "SK", destination: "SFO Airport", from: "Wilbur Hall", date: "Mar 14", time: "2:00 PM", flexWindow: "±1hr", seats: 2, bags: 1, distance: "0.3 mi", posted: "2m ago", emoji: "✈️", matched: 3 },
  { id: 2, name: "James L.", avatar: "JL", destination: "SJC Airport", from: "Stern Hall", date: "Mar 15", time: "10:00 AM", flexWindow: "±2hr", seats: 3, bags: 2, distance: "0.1 mi", posted: "5m ago", emoji: "✈️", matched: 1 },
  { id: 3, name: "Priya M.", avatar: "PM", destination: "OAK Airport", from: "The Row", date: "Mar 14", time: "6:00 AM", flexWindow: "±30min", seats: 1, bags: 3, distance: "0.5 mi", posted: "12m ago", emoji: "✈️", matched: 0 },
  { id: 4, name: "Chris W.", avatar: "CW", destination: "SJC Airport", from: "FloMo", date: "Mar 16", time: "4:00 PM", flexWindow: "±1hr", seats: 2, bags: 1, distance: "0.2 mi", posted: "18m ago", emoji: "✈️", matched: 2 },
  { id: 5, name: "Amy Z.", avatar: "AZ", destination: "SFO Airport", from: "EVGR", date: "Mar 14", time: "1:30 PM", flexWindow: "±1hr", seats: 1, bags: 2, distance: "0.4 mi", posted: "25m ago", emoji: "✈️", matched: 4 },
  { id: 6, name: "Devon R.", avatar: "DR", destination: "OAK Airport", from: "Roble Hall", date: "Mar 15", time: "8:00 AM", flexWindow: "±2hr", seats: 3, bags: 1, distance: "0.6 mi", posted: "31m ago", emoji: "✈️", matched: 1 },
];

const DESTINATIONS = ["All", "SFO", "SJC", "OAK"];
const DATES = ["All Dates", "Mar 14", "Mar 15", "Mar 16"];

// ── Styles ──────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700&family=Fraunces:opsz,wght@9..144,600;9..144,800&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --bg: #FAFAF7;
    --surface: #FFFFFF;
    --surface-alt: #F2F0EB;
    --ink: #1A1A17;
    --ink-soft: #6B6960;
    --ink-faint: #A8A49B;
    --accent: #E8553D;
    --accent-soft: #FFF0ED;
    --accent-hover: #D4432C;
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

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--ink);
    -webkit-font-smoothing: antialiased;
  }

  .app-container {
    max-width: 430px;
    margin: 0 auto;
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
    background: var(--bg);
  }

  /* ── Auth Screen ── */
  .auth-screen {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 60px 28px 40px;
    background: var(--ink);
    position: relative;
    overflow: hidden;
  }

  .auth-screen::before {
    content: '';
    position: absolute;
    top: -30%;
    right: -40%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(232,85,61,0.25) 0%, transparent 65%);
    pointer-events: none;
  }

  .auth-screen::after {
    content: '';
    position: absolute;
    bottom: -20%;
    left: -30%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(232,85,61,0.12) 0%, transparent 65%);
    pointer-events: none;
  }

  .auth-brand {
    position: relative;
    z-index: 1;
  }

  .auth-brand-icon {
    width: 96px;
    height: 96px;
    margin-bottom: 32px;
  }

  .auth-brand-icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  @keyframes pulse-ring {
    0%, 100% { box-shadow: 0 0 0 8px rgba(232,85,61,0.15), 0 0 0 20px rgba(232,85,61,0.07); }
    50% { box-shadow: 0 0 0 12px rgba(232,85,61,0.2), 0 0 0 28px rgba(232,85,61,0.05); }
  }

  .auth-title {
    font-family: 'Fraunces', serif;
    font-size: 48px;
    font-weight: 800;
    color: #FFFFFF;
    line-height: 1.05;
    margin-bottom: 16px;
    letter-spacing: -1px;
  }

  .auth-subtitle {
    font-size: 17px;
    color: rgba(255,255,255,0.5);
    line-height: 1.5;
    max-width: 300px;
    font-weight: 300;
  }

  .auth-form {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .auth-input-wrap {
    position: relative;
  }

  .auth-input {
    width: 100%;
    padding: 18px 20px;
    border-radius: var(--radius);
    border: 1.5px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.06);
    color: #fff;
    font-size: 16px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: var(--transition);
    backdrop-filter: blur(10px);
  }

  .auth-input::placeholder { color: rgba(255,255,255,0.3); }
  .auth-input:focus { border-color: var(--accent); background: rgba(255,255,255,0.1); }

  .auth-btn {
    width: 100%;
    padding: 18px;
    border-radius: var(--radius);
    border: none;
    background: var(--accent);
    color: white;
    font-size: 16px;
    font-weight: 700;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: var(--transition);
    letter-spacing: 0.3px;
  }

  .auth-btn:hover { background: var(--accent-hover); transform: translateY(-1px); }
  .auth-btn:active { transform: translateY(0); }

  .auth-terms {
    text-align: center;
    font-size: 12px;
    color: rgba(255,255,255,0.3);
    margin-top: 4px;
  }

  /* ── Header ── */
  .header {
    padding: 56px 20px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 100;
    background: var(--bg);
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .header-logo {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 0 4px var(--accent-soft);
  }

  .header-title {
    font-family: 'Fraunces', serif;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.5px;
  }

  .header-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--surface-alt);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: var(--ink-soft);
    cursor: pointer;
    transition: var(--transition);
    border: 2px solid transparent;
  }

  .header-avatar:hover { border-color: var(--accent); }

  /* ── Break Banner ── */
  .break-banner {
    margin: 0 20px 16px;
    padding: 16px 20px;
    background: linear-gradient(135deg, var(--ink) 0%, #2A2A25 100%);
    border-radius: var(--radius);
    color: white;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .break-banner-text h3 {
    font-family: 'Fraunces', serif;
    font-size: 17px;
    font-weight: 600;
    margin-bottom: 2px;
  }

  .break-banner-text p {
    font-size: 13px;
    color: rgba(255,255,255,0.5);
    font-weight: 300;
  }

  .break-banner-count {
    text-align: right;
  }

  .break-banner-count .number {
    font-family: 'Fraunces', serif;
    font-size: 32px;
    font-weight: 800;
    color: var(--accent);
  }

  .break-banner-count .label {
    font-size: 11px;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  /* ── Filters ── */
  .filters {
    padding: 0 20px 12px;
    display: flex;
    gap: 8px;
    overflow-x: auto;
    scrollbar-width: none;
  }

  .filters::-webkit-scrollbar { display: none; }

  .filter-chip {
    padding: 8px 16px;
    border-radius: 100px;
    border: 1.5px solid var(--surface-alt);
    background: var(--surface);
    font-size: 13px;
    font-weight: 500;
    color: var(--ink-soft);
    cursor: pointer;
    white-space: nowrap;
    transition: var(--transition);
    font-family: 'DM Sans', sans-serif;
  }

  .filter-chip:hover { border-color: var(--ink-faint); }
  .filter-chip.active {
    background: var(--ink);
    color: white;
    border-color: var(--ink);
  }

  /* ── Ride Cards ── */
  .rides-list {
    padding: 4px 20px 120px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .ride-card {
    background: var(--surface);
    border-radius: var(--radius);
    padding: 18px;
    box-shadow: var(--shadow-sm);
    cursor: pointer;
    transition: var(--transition);
    border: 1.5px solid transparent;
    position: relative;
    overflow: hidden;
  }

  .ride-card:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--surface-alt);
    transform: translateY(-1px);
  }

  .ride-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 14px;
  }

  .ride-card-user {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .ride-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--surface-alt);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    color: var(--ink-soft);
    flex-shrink: 0;
  }

  .ride-user-info .name {
    font-weight: 700;
    font-size: 15px;
    margin-bottom: 1px;
  }

  .ride-user-info .meta {
    font-size: 12px;
    color: var(--ink-faint);
  }

  .ride-distance {
    font-size: 12px;
    color: var(--blue);
    background: var(--blue-soft);
    padding: 4px 10px;
    border-radius: 100px;
    font-weight: 500;
    white-space: nowrap;
  }

  .ride-route {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
    padding: 12px 14px;
    background: var(--bg);
    border-radius: var(--radius-sm);
  }

  .ride-route-emoji {
    font-size: 22px;
    flex-shrink: 0;
  }

  .ride-route-details {
    flex: 1;
    min-width: 0;
  }

  .ride-route-dest {
    font-weight: 700;
    font-size: 15px;
    margin-bottom: 2px;
  }

  .ride-route-from {
    font-size: 12px;
    color: var(--ink-faint);
  }

  .ride-card-bottom {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .ride-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 10px;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 500;
    background: var(--surface-alt);
    color: var(--ink-soft);
  }

  .ride-tag.seats {
    background: var(--green-soft);
    color: var(--green);
  }

  .ride-tag.bags {
    background: #FFF8EC;
    color: #B8860B;
  }

  .ride-tag.matched {
    background: var(--accent-soft);
    color: var(--accent);
  }

  /* ── Ride Detail Modal ── */
  .modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .modal-sheet {
    width: 100%;
    max-width: 430px;
    background: var(--surface);
    border-radius: 24px 24px 0 0;
    padding: 12px 24px 36px;
    max-height: 85vh;
    overflow-y: auto;
    animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  .modal-handle {
    width: 36px;
    height: 4px;
    border-radius: 2px;
    background: var(--surface-alt);
    margin: 0 auto 20px;
  }

  .modal-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 24px;
  }

  .modal-avatar {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: var(--surface-alt);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 700;
    color: var(--ink-soft);
  }

  .modal-user-info .name {
    font-weight: 700;
    font-size: 19px;
  }

  .modal-user-info .school {
    font-size: 13px;
    color: var(--ink-faint);
  }

  .modal-route-block {
    background: var(--bg);
    border-radius: var(--radius);
    padding: 20px;
    margin-bottom: 20px;
  }

  .modal-route-line {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    position: relative;
  }

  .modal-route-line + .modal-route-line { margin-top: 20px; }

  .route-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    border: 3px solid var(--accent);
    background: white;
    flex-shrink: 0;
    margin-top: 4px;
    position: relative;
    z-index: 1;
  }

  .route-dot.dest {
    background: var(--accent);
  }

  .modal-route-line:first-child .route-dot::after {
    content: '';
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: 26px;
    background: var(--surface-alt);
  }

  .route-text .label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--ink-faint);
    margin-bottom: 2px;
  }

  .route-text .value {
    font-weight: 700;
    font-size: 16px;
  }

  .modal-details {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 24px;
  }

  .detail-card {
    background: var(--bg);
    border-radius: var(--radius-sm);
    padding: 14px;
  }

  .detail-card .label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--ink-faint);
    margin-bottom: 4px;
  }

  .detail-card .value {
    font-weight: 700;
    font-size: 16px;
  }

  .modal-action-btn {
    width: 100%;
    padding: 18px;
    border-radius: var(--radius);
    border: none;
    background: var(--accent);
    color: white;
    font-size: 16px;
    font-weight: 700;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .modal-action-btn:hover { background: var(--accent-hover); }

  .modal-action-btn.secondary {
    background: var(--surface-alt);
    color: var(--ink);
    margin-top: 10px;
  }

  .modal-action-btn.secondary:hover { background: #E8E5DE; }

  .modal-action-btn.joined {
    background: var(--green);
  }

  /* ── Post Ride Screen ── */
  .post-screen {
    padding: 56px 20px 120px;
    min-height: 100vh;
  }

  .post-back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    color: var(--ink-soft);
    cursor: pointer;
    margin-bottom: 24px;
    font-weight: 500;
    background: none;
    border: none;
    font-family: 'DM Sans', sans-serif;
    padding: 0;
  }

  .post-back:hover { color: var(--ink); }

  .post-title {
    font-family: 'Fraunces', serif;
    font-size: 30px;
    font-weight: 800;
    margin-bottom: 4px;
    letter-spacing: -0.5px;
  }

  .post-subtitle {
    font-size: 15px;
    color: var(--ink-faint);
    margin-bottom: 28px;
    font-weight: 300;
  }

  .form-group {
    margin-bottom: 18px;
  }

  .form-label {
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: var(--ink-soft);
    margin-bottom: 8px;
    display: block;
  }

  .form-input {
    width: 100%;
    padding: 16px 18px;
    border-radius: var(--radius-sm);
    border: 1.5px solid var(--surface-alt);
    background: var(--surface);
    color: var(--ink);
    font-size: 16px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: var(--transition);
  }

  .form-input:focus { border-color: var(--accent); }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .form-select {
    width: 100%;
    padding: 16px 18px;
    border-radius: var(--radius-sm);
    border: 1.5px solid var(--surface-alt);
    background: var(--surface);
    color: var(--ink);
    font-size: 16px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    appearance: none;
    cursor: pointer;
    transition: var(--transition);
    background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%23A8A49B' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 16px center;
  }

  .form-select:focus { border-color: var(--accent); }

  .post-btn {
    width: 100%;
    padding: 18px;
    border-radius: var(--radius);
    border: none;
    background: var(--accent);
    color: white;
    font-size: 16px;
    font-weight: 700;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    transition: var(--transition);
    margin-top: 8px;
  }

  .post-btn:hover { background: var(--accent-hover); }

  /* ── Bottom Nav ── */
  .bottom-nav {
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    max-width: 430px;
    background: var(--surface);
    border-top: 1px solid var(--surface-alt);
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 10px 0 28px;
    z-index: 150;
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
    cursor: pointer;
    padding: 6px 16px;
    border: none;
    background: none;
    font-family: 'DM Sans', sans-serif;
    transition: var(--transition);
  }

  .nav-item .nav-icon {
    font-size: 22px;
    opacity: 0.35;
    transition: var(--transition);
  }

  .nav-item .nav-label {
    font-size: 10px;
    font-weight: 500;
    color: var(--ink-faint);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: var(--transition);
  }

  .nav-item.active .nav-icon { opacity: 1; }
  .nav-item.active .nav-label { color: var(--accent); font-weight: 700; }

  .nav-fab {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background: var(--accent);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: -30px;
    box-shadow: 0 4px 16px rgba(232,85,61,0.35);
    transition: var(--transition);
  }

  .nav-fab:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(232,85,61,0.4); }

  /* ── Success Toast ── */
  .toast {
    position: fixed;
    top: 60px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--ink);
    color: white;
    padding: 14px 24px;
    border-radius: var(--radius);
    font-size: 14px;
    font-weight: 500;
    z-index: 300;
    animation: toastIn 0.3s ease, toastOut 0.3s ease 2.2s forwards;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(-20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
  @keyframes toastOut { from { opacity: 1; } to { opacity: 0; } }

  /* ── Animations ── */
  .stagger-in { animation: staggerIn 0.4s ease both; }
  @keyframes staggerIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ── Empty State ── */
  .empty-state {
    text-align: center;
    padding: 60px 20px;
  }

  .empty-state .emoji { font-size: 48px; margin-bottom: 16px; }
  .empty-state h3 { font-family: 'Fraunces', serif; font-size: 20px; font-weight: 600; margin-bottom: 6px; }
  .empty-state p { font-size: 14px; color: var(--ink-faint); }
`;

// ── Components ──────────────────────────────────────────

function AuthScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const valid = email.endsWith(".edu");

  return (
    <div className="auth-screen">
      <div className="auth-brand">
        <div className="auth-brand-icon">
          <img src="/logo.png" alt="RideStork" />
        </div>
        <h1 className="auth-title">RideStork</h1>
        <p className="auth-subtitle">
          Find students heading your way. Split rides, save money, travel together.
        </p>
      </div>

      <div className="auth-form">
        <div className="auth-input-wrap">
          <input
            className="auth-input"
            type="email"
            placeholder="you@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button
          className="auth-btn"
          style={{ opacity: valid ? 1 : 0.4 }}
          onClick={() => valid && onLogin()}
        >
          Get Started
        </button>
        <p className="auth-terms">.edu email required — your campus, your rides</p>
      </div>
    </div>
  );
}

function RideCard({ ride, onClick, delay }) {
  return (
    <div
      className="ride-card stagger-in"
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
    >
      <div className="ride-card-top">
        <div className="ride-card-user">
          <div className="ride-avatar">{ride.avatar}</div>
          <div className="ride-user-info">
            <div className="name">{ride.name}</div>
            <div className="meta">{ride.posted}</div>
          </div>
        </div>
        <div className="ride-distance">📍 {ride.distance}</div>
      </div>

      <div className="ride-route">
        <div className="ride-route-emoji">{ride.emoji}</div>
        <div className="ride-route-details">
          <div className="ride-route-dest">{ride.destination}</div>
          <div className="ride-route-from">from {ride.from}</div>
        </div>
      </div>

      <div className="ride-card-bottom">
        <span className="ride-tag">📅 {ride.date}</span>
        <span className="ride-tag">🕐 {ride.time} {ride.flexWindow}</span>
        <span className="ride-tag seats">🪑 {ride.seats} seat{ride.seats > 1 ? 's' : ''}</span>
        <span className="ride-tag bags">🧳 {ride.bags} bag{ride.bags > 1 ? 's' : ''}</span>
        {ride.matched > 0 && (
          <span className="ride-tag matched">👋 {ride.matched} interested</span>
        )}
      </div>
    </div>
  );
}

function RideDetailModal({ ride, onClose }) {
  const [joined, setJoined] = useState(false);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-handle" />

        <div className="modal-header">
          <div className="modal-avatar">{ride.avatar}</div>
          <div className="modal-user-info">
            <div className="name">{ride.name}</div>
            <div className="school">Stanford University · Verified .edu</div>
          </div>
        </div>

        <div className="modal-route-block">
          <div className="modal-route-line">
            <div className="route-dot" />
            <div className="route-text">
              <div className="label">Pickup</div>
              <div className="value">{ride.from}</div>
            </div>
          </div>
          <div className="modal-route-line">
            <div className="route-dot dest" />
            <div className="route-text">
              <div className="label">Destination</div>
              <div className="value">{ride.destination}</div>
            </div>
          </div>
        </div>

        <div className="modal-details">
          <div className="detail-card">
            <div className="label">Date</div>
            <div className="value">{ride.date}</div>
          </div>
          <div className="detail-card">
            <div className="label">Time</div>
            <div className="value">{ride.time}</div>
          </div>
          <div className="detail-card">
            <div className="label">Flexibility</div>
            <div className="value">{ride.flexWindow}</div>
          </div>
          <div className="detail-card">
            <div className="label">Open Seats</div>
            <div className="value">{ride.seats}</div>
          </div>
          <div className="detail-card">
            <div className="label">Bags</div>
            <div className="value">{ride.bags} 🧳</div>
          </div>
        </div>

        <button
          className={`modal-action-btn ${joined ? 'joined' : ''}`}
          onClick={() => setJoined(!joined)}
        >
          {joined ? '✓ Request Sent' : `Request to Join · Split ~$${Math.round(45 / (ride.seats + 1))}/person`}
        </button>
        <button className="modal-action-btn secondary" onClick={onClose}>
          Message {ride.name.split(' ')[0]}
        </button>
      </div>
    </div>
  );
}

function PostRideScreen({ onBack, onPost }) {
  const [form, setForm] = useState({
    destination: '', from: '', date: '', time: '', flex: '±1hr', seats: '1', bags: '1'
  });

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));
  const filled = form.destination && form.from && form.date && form.time;

  return (
    <div className="post-screen">
      <button className="post-back" onClick={onBack}>← Back</button>
      <h1 className="post-title">Post a Ride</h1>
      <p className="post-subtitle">Find students heading your way</p>

      <div className="form-group">
        <label className="form-label">Where are you going?</label>
        <select className="form-select" value={form.destination} onChange={e => update('destination', e.target.value)}>
          <option value="">Select destination</option>
          <option>SFO Airport</option>
          <option>SJC Airport</option>
          <option>OAK Airport</option>
          <option>Other</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Pickup area</label>
        <input className="form-input" placeholder="e.g. Wilbur, FloMo, Stern, The Row" value={form.from} onChange={e => update('from', e.target.value)} />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Date</label>
          <input className="form-input" type="date" value={form.date} onChange={e => update('date', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Time</label>
          <input className="form-input" type="time" value={form.time} onChange={e => update('time', e.target.value)} />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Flexibility</label>
          <select className="form-select" value={form.flex} onChange={e => update('flex', e.target.value)}>
            <option>±30min</option>
            <option>±1hr</option>
            <option>±2hr</option>
            <option>Exact time</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Open seats</label>
          <select className="form-select" value={form.seats} onChange={e => update('seats', e.target.value)}>
            <option>1</option>
            <option>2</option>
            <option>3</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Bags 🧳</label>
        <select className="form-select" value={form.bags} onChange={e => update('bags', e.target.value)}>
          <option value="1">1 bag (carry-on only)</option>
          <option value="2">2 bags (carry-on + checked)</option>
          <option value="3">3+ bags (heavy packer)</option>
        </select>
      </div>

      <button
        className="post-btn"
        style={{ opacity: filled ? 1 : 0.4 }}
        onClick={() => filled && onPost(form)}
      >
        Post Your Ride
      </button>
    </div>
  );
}

function BottomNav({ screen, onNavigate, onPost }) {
  return (
    <div className="bottom-nav">
      <button className={`nav-item ${screen === 'feed' ? 'active' : ''}`} onClick={() => onNavigate('feed')}>
        <span className="nav-icon">🏠</span>
        <span className="nav-label">Feed</span>
      </button>
      <button className={`nav-item ${screen === 'nearby' ? 'active' : ''}`} onClick={() => onNavigate('nearby')}>
        <span className="nav-icon">📡</span>
        <span className="nav-label">Nearby</span>
      </button>
      <button className="nav-fab" onClick={onPost}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M11 3V19M3 11H19" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>
      <button className={`nav-item ${screen === 'rides' ? 'active' : ''}`} onClick={() => onNavigate('rides')}>
        <span className="nav-icon">🎫</span>
        <span className="nav-label">My Rides</span>
      </button>
      <button className={`nav-item ${screen === 'chat' ? 'active' : ''}`} onClick={() => onNavigate('chat')}>
        <span className="nav-icon">💬</span>
        <span className="nav-label">Chat</span>
      </button>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────

export default function RideStorkApp() {
  const [authed, setAuthed] = useState(false);
  const [screen, setScreen] = useState("feed");
  const [selectedRide, setSelectedRide] = useState(null);
  const [filterDest, setFilterDest] = useState("All");
  const [filterDate, setFilterDate] = useState("All Dates");
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  if (!authed) {
    return (
      <>
        <style>{css}</style>
        <div className="app-container">
          <AuthScreen onLogin={() => setAuthed(true)} />
        </div>
      </>
    );
  }

  if (screen === "post") {
    return (
      <>
        <style>{css}</style>
        <div className="app-container">
          <PostRideScreen
            onBack={() => setScreen("feed")}
            onPost={(form) => {
              setScreen("feed");
              showToast("Your ride is live! We'll notify matches.");
            }}
          />
        </div>
      </>
    );
  }

  const filteredRides = MOCK_RIDES.filter(r => {
    if (filterDest !== "All" && !r.destination.toLowerCase().includes(filterDest.toLowerCase())) return false;
    if (filterDate !== "All Dates" && r.date !== filterDate) return false;
    return true;
  });

  return (
    <>
      <style>{css}</style>
      <div className="app-container">
        {toast && <div className="toast">✨ {toast}</div>}

        <div className="header">
          <div className="header-left">
            <span className="header-title">RideStork</span>
          </div>
          <div className="header-avatar">ME</div>
        </div>

        <div className="break-banner">
          <div className="break-banner-text">
            <h3>Spring Break 🌴</h3>
            <p>Mar 14 – 30 · High demand</p>
          </div>
          <div className="break-banner-count">
            <div className="number">47</div>
            <div className="label">Active</div>
          </div>
        </div>

        <div className="filters">
          {DESTINATIONS.map(d => (
            <button
              key={d}
              className={`filter-chip ${filterDest === d ? 'active' : ''}`}
              onClick={() => setFilterDest(d)}
            >
              {d}
            </button>
          ))}
          {DATES.map(d => (
            <button
              key={d}
              className={`filter-chip ${filterDate === d ? 'active' : ''}`}
              onClick={() => setFilterDate(d)}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="rides-list">
          {filteredRides.length > 0 ? (
            filteredRides.map((ride, i) => (
              <RideCard
                key={ride.id}
                ride={ride}
                delay={i * 60}
                onClick={() => setSelectedRide(ride)}
              />
            ))
          ) : (
            <div className="empty-state">
              <div className="emoji">🔍</div>
              <h3>No rides yet</h3>
              <p>Be the first to post for this route!</p>
            </div>
          )}
        </div>

        {selectedRide && (
          <RideDetailModal
            ride={selectedRide}
            onClose={() => setSelectedRide(null)}
          />
        )}

        <BottomNav
          screen={screen}
          onNavigate={setScreen}
          onPost={() => setScreen("post")}
        />
      </div>
    </>
  );
}
