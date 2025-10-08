"use client";

import { fetchAllServicesName } from "@/app/redux/thunks/serviceThunks";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
// import { fetchAllServicesName } from "@/app/redux/slices/";





export default function PopularCategory() {
  const dispatch = useDispatch();

  const { list: services, loading, error } = useSelector(
    (state) => state.servicesReal.publicServicesNames
  );

  console.log("This is the list wala",services);

  useEffect(() => {
    dispatch(fetchAllServicesName());
  }, [dispatch]);

  const marqueeCategories = [...services, ...services]; 

  if (loading) {
    return (
      <section className="py-16 bg-green-50 text-center">
        <p className="text-green-700 font-semibold">Loading popular categories...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-green-50 text-center">
        <p className="text-red-600 font-semibold">Failed to load categories: {error}</p>
      </section>
    );
  }

  if (!services.length) {
    return (
      <section className="py-16 bg-green-50 text-center">
        <p className="text-green-700 font-semibold">No popular categories available.</p>
      </section>
    );
  }

  return (
    <section className="py-16 bg-green-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-green-700 text-center mb-8">
          Popular Categories
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-xl mx-auto">
          Explore the most in-demand services and find trusted professionals for your needs.
        </p>

        {/* Marquee Scroll */}
        <div className="overflow-hidden relative w-full">
          <div
            className="flex gap-8 whitespace-nowrap animate-marquee"
            style={{ display: "inline-flex" }}
          >
            {marqueeCategories.map((cat, idx) => (
              <div
                key={cat.name + idx}
                className="bg-white border border-green-100 rounded-xl shadow-lg flex flex-col items-center justify-center p-6 hover:scale-105 transition-transform cursor-pointer min-w-[160px]"
              >
                <span className="text-green-700 font-semibold text-lg group-hover:text-green-800">
                  {cat.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Marquee Animation */}
        <style jsx>{`
          @keyframes marquee {
            0% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .animate-marquee {
            animation: marquee 20s linear infinite;
          }
        `}</style>
      </div>
    </section>
  );
}
