
"use client";

import { useState } from "react";
import LeftFilter from "./leftfilter/Index";
import RightResult from "./rightfilter/Index";

export default function HomeServicesContent() {
  const [filters, setFilters] = useState({
    category: "",
    priceMin: null,
    priceMax: null,
    location: null,
    radius: null,
  });

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-1/4">
        <LeftFilter filters={filters} setFilters={setFilters} />
      </div>
      <div className="w-full md:w-3/4">
        <RightResult filters={filters} />
      </div>
    </div>
  );
}
