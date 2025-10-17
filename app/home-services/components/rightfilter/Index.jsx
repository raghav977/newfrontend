"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { fetchServicesImageTitleRate } from "@/app/redux/thunks/serviceThunks";
import Loading from "@/components/Loading"; // import the global Loading component

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function RightResult({ filters }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { list: services = [], loading, error } = useSelector(
    (state) => state.servicesReal.publicServicesCards
  );

  const [page, setPage] = useState(0);
  const [showLoading, setShowLoading] = useState(true); // local loading state
  const pageSize = 6;

  useEffect(() => {
    const params = {
      limit: 20,
      offset: 0,
      ...(filters.category && { serviceId: parseInt(filters.category) }),
      ...(filters.priceMin && { minPrice: filters.priceMin }),
      ...(filters.priceMax && { maxPrice: filters.priceMax }),
      ...(filters.location && {
        latitude: filters.location.latitude,
        longitude: filters.location.longitude,
      }),
      ...(filters.radius && { radius: filters.radius }),
    };

    dispatch(fetchServicesImageTitleRate(params));

    // Force the loading skeleton to show for at least 2 seconds
    setShowLoading(true);
    const timer = setTimeout(() => setShowLoading(false), 1000);

    return () => clearTimeout(timer);
  }, [dispatch, filters]);

  const totalPages = Math.ceil(services.length / pageSize);
  const startIdx = page * pageSize;
  const visibleServices = services.slice(startIdx, startIdx + pageSize);

  const handleServiceClick = (id) => {
    router.push(`/services-detail/${id}`);
  };

  const getImageUrl = (service) => {
    const path = service?.images?.[0];
    if (!path) return "/placeholder-service.jpg";
    if (path.startsWith("http")) return path;
    return `${BACKEND_URL}${path}`;
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">
        Available Services
      </h2>

      {loading || showLoading ? (
        <Loading perPage={6} />
      ) : error ? (
        <p className="text-red-600 text-center py-16">Error loading services: {error}</p>
      ) : services.length === 0 ? (
        <p className="text-gray-600 text-center py-16">No services available.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {visibleServices.map((service) => (
              <div
                key={service.id}
                onClick={() => handleServiceClick(service.id)}
                className="group border rounded-xl overflow-hidden shadow-md hover:shadow-xl transition duration-300 bg-white cursor-pointer"
              >
                <div className="relative w-full h-56 overflow-hidden">
                  <img
                    src={getImageUrl(service)}
                    alt={service.name || "Service Image"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => (e.currentTarget.src = "/placeholder-service.jpg")}
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 truncate">
                    {service.name}
                  </h3>
                  <p className="text-green-600 font-bold mt-1">
                    Rs. {service.rate ?? "N/A"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setPage(idx)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  idx === page
                    ? "bg-green-600 text-white shadow"
                    : "bg-gray-100 text-gray-700 hover:bg-green-100"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
