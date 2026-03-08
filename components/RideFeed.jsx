"use client";

import { useState, useEffect } from "react";
import RideCard from "./RideCard";
import RideDetailModal from "./RideDetailModal";

const DESTINATIONS = ["All", "SFO", "SJC", "OAK"];

export default function RideFeed() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDest, setFilterDest] = useState("All");
  const [selectedRide, setSelectedRide] = useState(null);

  const fetchRides = async () => {
    try {
      const res = await fetch("/api/rides");
      if (res.ok) {
        const data = await res.json();
        setRides(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const filteredRides = rides.filter((r) => {
    if (filterDest !== "All" && r.airport_code !== filterDest) {
      return false;
    }
    return true;
  });

  return (
    <>
      <div className="filters">
        {DESTINATIONS.map((d) => (
          <button
            key={d}
            className={`filter-chip ${filterDest === d ? "active" : ""}`}
            onClick={() => setFilterDest(d)}
          >
            {d}
          </button>
        ))}
      </div>

      <div className="rides-list">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p style={{ color: "var(--ink-faint)", fontSize: 14 }}>Loading rides...</p>
          </div>
        ) : filteredRides.length > 0 ? (
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
    </>
  );
}
