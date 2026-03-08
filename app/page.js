"use client";

import { useState, useCallback } from "react";
import AuthProvider from "@/components/AuthProvider";
import Header from "@/components/Header";
import RideFeed from "@/components/RideFeed";
import BottomNav from "@/components/BottomNav";
import PostRideScreen from "@/components/PostRideScreen";
import MyRidesScreen from "@/components/MyRidesScreen";

export default function Home() {
  const [screen, setScreen] = useState("feed");
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  return (
    <AuthProvider>
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
        />
      </div>
    </AuthProvider>
  );
}
