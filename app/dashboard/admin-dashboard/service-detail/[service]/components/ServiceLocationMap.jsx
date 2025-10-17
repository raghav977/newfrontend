"use client";

import { useState, useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

export default function AdminServiceLocationMap({ locations }) {
  // store radii for each location separately
  const [radii, setRadii] = useState([]);

  useEffect(() => {
    if (locations && Array.isArray(locations)) {
        console.log("Service Locations:", locations);
      setRadii(locations.map((loc) => loc.radius || 5)); 
    }
  }, []);

  if (!locations || locations.length === 0) return null;

  const first = locations[0];
  const defaultLat = parseFloat(first.latitude) || 0;
  const defaultLon = parseFloat(first.longitude) || 0;

  const handleRadiusChange = (index, value) => {
    setRadii((prev) => {
      const newRadii = [...prev];
      newRadii[index] = value;
      return newRadii;
    });
  };

  return (
    <div className="space-y-4">
        <div>
            The user location is shown with a marker. Blue circles indicate service coverage areas based on specified radii.
            the radius of the user is: {radii[0]} km from the marker point
        </div>
      {/* 🌍 Map */}
      <div className="h-[300px] rounded-xl overflow-hidden shadow-md border border-gray-200">
        <MapContainer
          center={[defaultLat, defaultLon]}
          zoom={10}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {locations.map((loc, idx) => {
            const lat = parseFloat(loc.latitude);
            const lon = parseFloat(loc.longitude);
            const radius = (radii[idx] || 5) * 1000; // km → meters

            if (Number.isNaN(lat) || Number.isNaN(lon)) return null;

            return (
              <div key={idx}>
                <Marker position={[lat, lon]}>
                  <Popup>
                    <div className="space-y-1">
                      <strong>{loc.address || "No Address"}</strong>
                      <div>Lat: {lat.toFixed(5)}, Lon: {lon.toFixed(5)}</div>
                      <div>Radius: {(radius / 1000).toFixed(1)} km</div>
                    </div>
                  </Popup>
                </Marker>
                <Circle
                  center={[lat, lon]}
                  radius={radius}
                  pathOptions={{ color: "blue", fillColor: "blue", fillOpacity: 0.1 }}
                />
              </div>
            );
          })}
        </MapContainer>
      </div>

      {/* 🟢 Radius sliders */}
      {locations.map((loc, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <label className="font-medium text-gray-700 flex-1">
            {loc.address || `Location ${idx + 1}`} Radius (km):
          </label>
          <input
            type="range"
            min="1"
            max="50"
            step="1"
            value={radii[idx]}
            onChange={(e) => handleRadiusChange(idx, Number(e.target.value))}
            className="flex-1 accent-blue-500"
          />
          <span className="w-10 text-center font-semibold text-gray-800">
            {radii[idx]}
          </span>
        </div>
      ))}
    </div>
  );
}
