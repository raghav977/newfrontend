"use client";

import { useEffect, useState } from "react";
import HeaderNavbar from "@/app/landingpagecomponents/components/HeaderNavbar";

import { useRouter } from "next/navigation";

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");

  const fetchBookings = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/bids/user", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.status === "success") {
        setBookings(data.message);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);


  const handleNegotiationRoom = (bookingId) => {
  router.push(`/user/bookings/${bookingId}`);
  }

  return (
    <div>
      <HeaderNavbar />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['All', 'Accepted', 'Pending', 'Rejected'].map(tab => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-lg font-medium transition border ${activeTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-600">Loading your bookings...</p>
        ) : bookings.length === 0 ? (
          <p className="text-gray-600">You have no bookings yet.</p>
        ) : (
          <div className="grid gap-6">
            {bookings
              .filter(booking => {
                if (activeTab === 'All') return true;
                return booking.status?.toLowerCase() === activeTab.toLowerCase();
              })
              .map((booking) => (
                <div
                  key={booking.id}
                  className="border border-green-200 rounded-xl p-5 shadow-sm hover:shadow-lg transition bg-white hover:bg-green-50"
                >
                  {/* Service Info */}
                  <h2 className="text-lg font-semibold mb-1">
                    {booking.ServiceProviderService?.Service?.name || "Service"}
                  </h2>
                  <p className="text-sm text-green-700 mb-2 font-medium">
                    Status: <span className="capitalize font-semibold">{booking.status}</span>
                  </p>

                  {/* Schedule */}
                  {booking.ServiceSchedule && (
                    <p className="mb-2 text-sm text-green-600">
                      {booking.ServiceSchedule.day_of_week} • {booking.ServiceSchedule.start_time.slice(0, 5)} - {booking.ServiceSchedule.end_time.slice(0, 5)}
                    </p>
                  )}

                  {/* Package */}
                  {booking.Package && (
                    <p className="mb-2 text-sm text-green-600">
                      Package: <span className="font-semibold">{booking.Package.name}</span> (${booking.Package.price})
                    </p>
                  )}

                  {/* Bids removed from card. Only show negotiation room button below. */}

                  {/* Negotiation Room */}
                  <button
                    className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                    onClick={() => handleNegotiationRoom(booking.id)}
                  >
                    Open Negotiation Room
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}