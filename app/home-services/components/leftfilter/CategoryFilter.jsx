"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllServicesName } from "@/app/redux/thunks/serviceThunks";

export default function CategoryFilter({ filters, setFilters }) {
  const dispatch = useDispatch();

  const { list: categories = [], loading, error } = useSelector(
    (state) => state.servicesReal.publicServicesNames || {}
  );

  // ✅ Fetch all categories on mount
  useEffect(() => {
    dispatch(fetchAllServicesName());
  }, [dispatch]);

  const handleCategoryChange = (e) => {
    setFilters({ ...filters, category: e.target.value });
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h2 className="text-lg font-semibold mb-2 text-gray-800">Category</h2>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading categories...</p>
      ) : error ? (
        <p className="text-red-500 text-sm">Error: {error}</p>
      ) : (
        <select
          value={filters.category || ""}
          onChange={handleCategoryChange}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
