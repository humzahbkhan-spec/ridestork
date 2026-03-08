"use client";

import { useAuth } from "./AuthProvider";

export default function Header() {
  const { user, showAuthGate, signOut } = useAuth();

  return (
    <div className="header">
      <div className="header-left">
        <span className="header-title">RideStork</span>
      </div>
      {user ? (
        <div
          className="header-avatar"
          onClick={signOut}
          title="Sign out"
        >
          {user.email?.slice(0, 2).toUpperCase() || "ME"}
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
  );
}
