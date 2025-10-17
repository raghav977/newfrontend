"use client";

import { useState } from "react";
import { MapContainer, Marker, TileLayer, Tooltip, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

export default function MyMap({ position, zoom = 13, onPositionChange }) {
  const [markerPosition, setMarkerPosition] = useState(position || [27.7172, 85.3240]); // default Kathmandu

  // Component to handle map clicks
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setMarkerPosition([lat, lng]);
        if (typeof onPositionChange === "function") {
          onPositionChange({ latitude: lat, longitude: lng });
        }
      },
    });
    return null;
  };

  return (
    <MapContainer
      center={markerPosition}
      zoom={zoom}
      scrollWheelZoom={true}
      style={{ height: "600px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Click handler */}
      <MapClickHandler />

      {/* Draggable marker */}
      <Marker
        position={markerPosition}
        draggable={true}
        eventHandlers={{
          dragend: (e) => {
            const latlng = e.target.getLatLng();
            setMarkerPosition([latlng.lat, latlng.lng]);
            if (typeof onPositionChange === "function") {
              onPositionChange({ latitude: latlng.lat, longitude: latlng.lng });
            }
          },
        }}
      >
        <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
          Drag or click to change location
        </Tooltip>
      </Marker>
    </MapContainer>
  );
}
