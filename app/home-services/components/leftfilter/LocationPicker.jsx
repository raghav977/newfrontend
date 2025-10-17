"use client";

import MapService from "@/components/map/MapforService";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function LocationPicker({ customerLocation, setFilters }) {
  const [showMap, setShowMap] = useState(false);
  const [initialLocationSet, setInitialLocationSet] = useState(false);

  const handleMapToggle = () => setShowMap(!showMap);

  // Only set initial location once to filters
  useEffect(() => {
    if (customerLocation && !initialLocationSet) {
      setFilters((prev) => ({
        ...prev,
        location: { ...customerLocation },
      }));
      setInitialLocationSet(true);
    }
  }, [customerLocation, setFilters, initialLocationSet]);

  const handleLocationChange = ({ latitude, longitude, radius }) => {
    setFilters((prev) => ({
      ...prev,
      location: { latitude, longitude },
      radius,
    }));
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-2">Your Location</h2>
      {customerLocation ? (
        <p>
          Latitude: {customerLocation.latitude.toFixed(4)}, Longitude:{" "}
          {customerLocation.longitude.toFixed(4)}
        </p>
      ) : (
        <p>Location not available. Please enable location services.</p>
      )}

      <Button onClick={handleMapToggle}>Show Map</Button>

      {showMap && customerLocation && (
        <MapService
          center={{
            lat: customerLocation.latitude,
            lng: customerLocation.longitude,
          }}
          onChange={handleLocationChange} // only called when user moves map or changes radius
        />
      )}
    </div>
  );
}
