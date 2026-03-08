"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthGate({ onClose }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, sent, verifying, error, google-error
  const [errorMsg, setErrorMsg] = useState("");
  const supabase = createClient();

  const isAllowed = email.endsWith("@stanford.edu");

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        queryParams: {
          hd: "stanford.edu", // restricts Google picker to Stanford accounts
        },
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setErrorMsg(error.message);
    }
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!isAllowed) return;

    setStatus("loading");
    setErrorMsg("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
    } else {
      setStatus("sent");
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return;

    setStatus("verifying");
    setErrorMsg("");

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp.trim(),
      type: "email",
    });

    if (error) {
      setStatus("sent");
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="auth-gate-overlay" onClick={onClose}>
      <div className="auth-gate-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="auth-gate-title">Sign in to continue</h2>

        {status === "sent" || status === "verifying" ? (
          <>
            <p className="auth-gate-subtitle">
              Enter the 6-digit code sent to <strong>{email}</strong>
            </p>
            <form onSubmit={handleVerifyCode}>
              <input
                className="auth-gate-input"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                autoFocus
                style={{ letterSpacing: "8px", fontSize: 24, fontWeight: 700 }}
              />
              <button
                className="auth-gate-btn"
                type="submit"
                disabled={otp.length < 6 || status === "verifying"}
              >
                {status === "verifying" ? "Verifying..." : "Verify Code"}
              </button>
              {errorMsg && <div className="auth-gate-error">{errorMsg}</div>}
            </form>
            <button
              className="auth-gate-dismiss"
              onClick={() => { setStatus("idle"); setOtp(""); setErrorMsg(""); }}
            >
              Use a different email
            </button>
          </>
        ) : (
          <>
            <p className="auth-gate-subtitle">
              Sign in with your Stanford account.
            </p>

            <button
              className="auth-gate-btn auth-gate-google"
              onClick={handleGoogleLogin}
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Sign in with Stanford
            </button>

            <div className="auth-gate-divider">
              <span>or</span>
            </div>

            <form onSubmit={handleSendCode}>
              <input
                className="auth-gate-input"
                type="email"
                placeholder="you@stanford.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                className="auth-gate-btn"
                type="submit"
                disabled={!isAllowed || status === "loading"}
                style={{ background: "var(--surface-alt)", color: "var(--ink)" }}
              >
                {status === "loading" ? "Sending..." : "Send Email Code"}
              </button>
              {errorMsg && <div className="auth-gate-error">{errorMsg}</div>}
            </form>
          </>
        )}

        <button className="auth-gate-dismiss" onClick={onClose}>
          Maybe later
        </button>
      </div>
    </div>
  );
}
