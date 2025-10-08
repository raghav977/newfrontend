"use client";

import { useEffect, useState } from "react";
import CategoryFilter from "./CategoryFilter";
import PriceFilter from "./PriceFilter";
import LocationPicker from "./LocationPicker";

export default function LeftFilter({ filters, setFilters }) {
  const [customerLocation, setCustomerLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCustomerLocation({ latitude, longitude });
          setFilters((prev) => ({ ...prev, location: { latitude, longitude } }));
        },
        (error) => console.error("Error fetching location:", error)
      );
    }
  }, [setFilters]);

  return (
    <div className="space-y-4">
      <CategoryFilter filters={filters} setFilters={setFilters} />
      <PriceFilter filters={filters} setFilters={setFilters} />
      <LocationPicker customerLocation={customerLocation} setFilters={setFilters} />
    </div>
  );
}
