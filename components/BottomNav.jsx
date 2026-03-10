"use client";

export default function BottomNav({ screen, onNavigate, onPost, pendingCount = 0 }) {
  return (
    <div className="bottom-nav">
      <button
        className={`nav-item ${screen === "feed" ? "active" : ""}`}
        onClick={() => onNavigate("feed")}
      >
        <span className="nav-icon">🚘</span>
        <span className="nav-label">Feed</span>
      </button>
      <button className="nav-fab" onClick={onPost}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M11 3V19M3 11H19" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </button>
      <button
        className={`nav-item ${screen === "rides" ? "active" : ""}`}
        onClick={() => onNavigate("rides")}
        style={{ position: "relative" }}
      >
        <span className="nav-icon">🤠</span>
        <span className="nav-label">My Rides</span>
        {pendingCount > 0 && (
          <span className="nav-badge">{pendingCount}</span>
        )}
      </button>
    </div>
  );
}
