"use client";

import { useState, useCallback, useEffect } from "react";
import AuthProvider, { useAuth } from "@/components/AuthProvider";
import Header from "@/components/Header";
import RideFeed from "@/components/RideFeed";
import BottomNav from "@/components/BottomNav";
import PostRideScreen from "@/components/PostRideScreen";
import MyRidesScreen from "@/components/MyRidesScreen";

function AppContent() {
  const { user } = useAuth();
  const [screen, setScreen] = useState("feed");
  const [toast, setToast] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  // Fetch pending request count for the badge
  useEffect(() => {
    if (!user) {
      setPendingCount(0);
      return;
    }

    const fetchPending = async () => {
      try {
        const res = await fetch("/api/rides/mine");
        if (res.ok) {
          const data = await res.json();
          const count = (data.posted || []).reduce((sum, ride) => {
            const pending = (ride.ride_requests || []).filter((r) => r.status === "pending").length;
            return sum + pending;
          }, 0);
          setPendingCount(count);
        }
      } catch {
        // silently fail
      }
    };

    fetchPending();
    // Poll every 30 seconds for new requests
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, [user]);

  return (
    <div className="app-container">
      {toast && <div className="toast">{toast}</div>}

      {screen === "post" ? (
        <PostRideScreen
          onBack={() => setScreen("feed")}
          onPost={() => {
            setScreen("feed");
            showToast("Your ride is live!");
          }}
        />
      ) : screen === "rides" ? (
        <>
          <Header />
          <MyRidesScreen />
        </>
      ) : (
        <>
          <Header />
          <RideFeed />
        </>
      )}

      <BottomNav
        screen={screen}
        onNavigate={setScreen}
        onPost={() => setScreen("post")}
        pendingCount={pendingCount}
      />
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
