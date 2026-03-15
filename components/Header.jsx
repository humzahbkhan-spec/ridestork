"use client";

import { useAuth } from "./AuthProvider";

export default function Header() {
  const { user, showAuthGate, signOut } = useAuth();

  return (
    <div className="header">
      <div className="header-left">
        <span className="header-title">RideStork</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSdELR8bYWpsdZwg3jUEDd9pExjprrj6KJCgZkd1AVIKesUInw/viewform"
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 13, color: "var(--ink-faint)", textDecoration: "none", fontWeight: 500 }}
        >
          Feedback
        </a>
      {user ? (
        <div
          className="header-avatar"
          onClick={signOut}
          title="Sign out"
        >
          {user.user_metadata?.full_name
            ? user.user_metadata.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
            : user.email?.slice(0, 2).toUpperCase()}
        </div>
      ) : (
        <button
          className="header-login-btn"
          onClick={() => showAuthGate()}
        >
          Log in
        </button>
      )}
      </div>
    </div>
  );
}
