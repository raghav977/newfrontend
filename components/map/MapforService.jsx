import { useState, useEffect } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  Circle
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

export default function MapService({ onChange }) {
  const [position, setPosition] = useState(null);
  const [radius, setRadius] = useState(5); 
  const zoom = 10;

  
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
        },
        (err) => {
          console.error("Error fetching location:", err);
        }
      );
    }
  }, []);

  // ✅ Notify parent (optional)
  useEffect(() => {
    if (onChange && position) {
      onChange({ latitude: position[0], longitude: position[1], radius });
    }
  }, [position, radius]);

  return (
    <div className="flex flex-col gap-4">
      {/* 🌍 Map Section */}
      <div className="h-[400px] rounded-xl overflow-hidden shadow-md border border-gray-200">
        {position && (
          <MapContainer
            center={position}
            zoom={zoom}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <Marker position={position}>
              <Tooltip>You are here</Tooltip>
            </Marker>

            {/* 🟢 Circle showing service radius */}
            <Circle
              center={position}
              radius={radius * 1000} // km → meters
              pathOptions={{ color: "blue", fillColor: "blue", fillOpacity: 0.1 }}
            />
          </MapContainer>
        )}
        {!position && (
          <div className="h-full flex items-center justify-center text-gray-500">
            Fetching current location...
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <label className="font-medium text-gray-700">Service Radius (km):</label>
        <input
          type="range"
          min="5"
          max="50"
          step="5"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="flex-1 accent-blue-500"
        />
        <span className="w-10 text-center font-semibold text-gray-800">
          {radius}
        </span>
      </div>
    </div>
  );
}
