"use client"
import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// Component to update map center
const RecenterMap = ({ center }) => {
  const map = useMap();
  map.setView(center, 13);
  return null;
};

const EmergencyServiceMap = () => {
  const [center, setCenter] = useState({ lat: 40.7128, lng: -74.0060 });
  const [radius, setRadius] = useState(5);
  const [rate, setRate] = useState(1200);
  const [search, setSearch] = useState("");

  const handleSearch = async () => {
    if (!search) return;

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        search
      )}`;
      const res = await axios.get(url);
      if (res.data && res.data.length > 0) {
        const place = res.data[0];
        const newCenter = { lat: parseFloat(place.lat), lng: parseFloat(place.lon) };
        setCenter(newCenter); // update marker
      } else {
        alert("Location not found");
      }
    } catch (err) {
      console.error(err);
      alert("Error searching location");
    }
  };

  const handleDrag = (e) => {
    setCenter(e.target.getLatLng());
  };

  return (
    <div style={{ width: "100%", height: "600px" }}>
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Search location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "300px", marginRight: "5px" }}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      <MapContainer center={center} zoom={13} style={{ height: "70%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <RecenterMap center={center} />
        <Marker position={center} draggable={true} eventHandlers={{ dragend: handleDrag }} />
        <Circle
          center={center}
          radius={radius * 1000}
          pathOptions={{ color: "red", fillColor: "#f03", fillOpacity: 0.2 }}
        />
      </MapContainer>

      <div style={{ marginTop: "15px" }}>
        <label>
          Emergency Rate:{" "}
          <input
            type="number"
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
          />
        </label>
        <br />
        <label>
          Radius (km):{" "}
          <input
            type="number"
            value={radius}
            onChange={(e) => setRadius(parseFloat(e.target.value))}
            min={1}
            max={50}
          />
        </label>

        <div style={{ marginTop: "10px" }}>
          <strong>Selected Location:</strong> {center.lat.toFixed(5)}, {center.lng.toFixed(5)}
          <br />
          <strong>Radius:</strong> {radius} km
          <br />
          <strong>Emergency Rate:</strong> {rate}
        </div>
      </div>
    </div>
  );
};

export default EmergencyServiceMap;
