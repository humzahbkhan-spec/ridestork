"use client";

import { useState, useEffect, useMemo } from "react";
import RideCard from "./RideCard";
import RideDetailModal from "./RideDetailModal";

const DESTINATIONS = ["All", "SFO", "SJC", "OAK"];

function getDateFilters() {
  const filters = ["All Dates"];
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    filters.push(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
  }
  return filters;
}

export default function RideFeed() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDest, setFilterDest] = useState("All");
  const [filterDate, setFilterDate] = useState("All Dates");
  const [selectedRide, setSelectedRide] = useState(null);

  const dateFilters = useMemo(() => getDateFilters(), []);

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
    const interval = setInterval(fetchRides, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredRides = rides.filter((r) => {
    if (filterDest !== "All" && r.airport_code !== filterDest) {
      return false;
    }
    if (filterDate !== "All Dates") {
      const rideDate = new Date(r.departure_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (rideDate !== filterDate) return false;
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
        {dateFilters.map((d) => (
          <button
            key={d}
            className={`filter-chip ${filterDate === d ? "active" : ""}`}
            onClick={() => setFilterDate(d)}
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
