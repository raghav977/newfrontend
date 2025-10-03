"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaChevronLeft, FaChevronRight, FaStar } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchServicesImageTitleRate } from "@/app/redux/thunks/serviceThunks";
// import { fetchServicesImageTitleRate } from "@/app/redux/slices/servicesSlice";

// fetchServicesImageTitleRate

export default function FeatureService() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { list: services, loading, error } = useSelector(
    (state) => state.servicesReal.publicServicesCards
  );

  console.log("Services from redux state:", services);

  const [startIdx, setStartIdx] = useState(0);
  const visibleCount = 2; // number of cards visible at a time

  // Fetch services from Redux
  useEffect(() => {
    dispatch(fetchServicesImageTitleRate({ limit: 10, offset: 0 }));
  }, [dispatch]);

  const handlePrev = () => {
    setStartIdx((prev) =>
      prev === 0 ? Math.max(services.length - visibleCount, 0) : prev - 1
    );
  };

  const handleNext = () => {
    setStartIdx((prev) =>
      prev + visibleCount >= services.length ? 0 : prev + 1
    );
  };

  const visibleServices = [];
  for (let i = 0; i < visibleCount; i++) {
    if (services.length > 0) {
      
      visibleServices.push(services[(startIdx + i) % services.length]);
    }
  }

  if (loading) {
    return (
      <section className="py-16 bg-white w-full text-center">
        <p className="text-green-700 font-semibold">Loading services...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white w-full text-center">
        <p className="text-red-600 font-semibold">Failed to load services: {error}</p>
      </section>
    );
  }

  if (!services.length) {
    return (
      <section className="py-16 bg-white w-full text-center">
        <p className="text-green-700 font-semibold">No services available.</p>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white w-full">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-10 text-center text-green-700">
          Our Services
        </h1>

        <div className="flex items-center gap-4">
          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            className="bg-white border border-gray-200 rounded-full p-3 shadow hover:bg-gray-100 transition"
            aria-label="Previous Service"
          >
            <FaChevronLeft className="text-gray-700 text-xl" />
          </button>

          {/* Service Cards */}
          <div className="flex gap-6 overflow-hidden w-full">
            {visibleServices.map((service) => (
              <div
                key={service.id}
                onClick={() => router.push(`/services-detail/${service.id}`)}
                className="bg-white border border-gray-200 rounded-xl shadow-md p-4 flex flex-col w-72 cursor-pointer hover:shadow-lg transition"
              >
                <img
                  src={
                    service.images?.[0]
                      ? `http://localhost:5000${service.images[0]}`
                      : "/fallback.png"
                  }
                  alt={service.name || "Service"}
                  className="rounded-lg mb-3 w-full h-36 object-cover"
                />

                <h2 className="text-lg font-semibold text-gray-800 truncate">
                  {service.name}
                </h2>
                <div className="flex items-center gap-1 mb-2">
                  <FaStar className="text-yellow-400" />
                  <span className="text-sm text-gray-700">{service.rate}</span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {service.description}
                </p>
              </div>
            ))}
          </div>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            className="bg-white border border-gray-200 rounded-full p-3 shadow hover:bg-gray-100 transition"
            aria-label="Next Service"
          >
            <FaChevronRight className="text-gray-700 text-xl" />
          </button>
        </div>
      </div>
    </section>
  );
}
