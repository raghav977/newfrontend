// ...existing code...
"use client";

import { useEffect, useState } from "react";
import HeaderNavbar from "@/app/landingpagecomponents/components/HeaderNavbar";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  MessageSquare,
  Calendar,
  Clock,
  User,
  MapPin,
  ArrowRight,
  X,
  Check,
} from "lucide-react";

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 8;

  const fetchBookings = async () => {
    setLoading(true);
    try {
      console.log("Fetching bookings from API...");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/bids/user`, {
        credentials: "include",
      });
      const data = await res.json().catch(() => null);
      console.log("Fetched bookings data:", data);
      alert("Fetching bookings...");
      
      const list = (data && data.status === "success" && Array.isArray(data.message))
        ? data.message
        : Array.isArray(data?.data) ? data.data : data?.message || [];

        console.log("Processed bookings list:", list);
      setBookings(list || []);
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
  };

  const displayStatus = (s) => {
    if (!s) return "Unknown";
    const st = String(s).toLowerCase();
    if (["confirmed", "accepted"].includes(st)) return "Confirmed";
    if (["completed", "done"].includes(st)) return "Completed";
    if (["cancelled", "canceled"].includes(st)) return "Cancelled";
    if (["rejected"].includes(st)) return "Rejected";
    if (["pending"].includes(st)) return "Pending";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  


  
  const filtered = bookings?.filter((b) => {
      if (activeTab === "All") return true;
      return displayStatus(b.status).toLowerCase() === activeTab.toLowerCase();
    })
    .filter((b) => {
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      const svc = b?.ServiceProviderService?.Service?.name || b?.service_name || "";
      const provider = b?.Provider?.name || b?.service_provider_name || "";
      return svc.toLowerCase().includes(q) || provider.toLowerCase().includes(q) || String(b.id || "").includes(q);
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">My Bookings</h1>
            <p className="mt-1 text-sm text-slate-500">All your service bookings and negotiation rooms.</p>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center bg-white border rounded-lg px-3 py-1 shadow-sm">
              <input
                type="search"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Search service, provider or id..."
                className="w-64 outline-none text-sm text-slate-700 placeholder:text-slate-400 bg-transparent"
              />
              <button
                onClick={() => { setQuery(""); setPage(1); }}
                className="text-slate-400 hover:text-slate-600 ml-2 p-1 rounded"
                title="Clear"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          {["All", "Confirmed", "Completed", "Cancelled", "Rejected", "Pending"].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition
                ${activeTab === tab ? "bg-green-600 text-white shadow" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: perPage }).map((_, i) => (
              <div key={i} className="animate-pulse p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="h-36 bg-slate-100 rounded-md mb-4" />
                <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-1/2 mb-2" />
                <div className="flex gap-2 mt-3">
                  <div className="h-8 w-24 bg-slate-100 rounded" />
                  <div className="h-8 w-24 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-slate-100">
            <p className="text-lg text-slate-700">No bookings found.</p>
            <p className="text-sm text-slate-500 mt-2">Try changing filters or create a new booking.</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {pageItems.map((booking) => {
                const svc = booking.ServiceProviderService?.Service || {};
                const provider = booking.Provider || booking.ServiceProviderService?.ServiceProvider || {};
                const schedule = booking.ServiceSchedule || null;
                const pkg = booking.Package || null;
                const img = svc?.image || svc?.thumbnail || "/images/service-placeholder.png";

                return (
                  <article key={booking.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-lg transition">
                    <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${img})` }} />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-slate-900">{svc.name || "Service"}</h3>
                          <p className="text-sm text-slate-500 mt-1"><User className="inline-block mr-2" /> {provider.name || provider.fullName || "Provider"}</p>
                        </div>

                        <div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${["confirmed","accepted"].includes((booking.status||"").toLowerCase()) ? "bg-emerald-100 text-emerald-800" : ["pending"].includes((booking.status||"").toLowerCase()) ? "bg-amber-100 text-amber-800" : ["cancelled","rejected","failed"].includes((booking.status||"").toLowerCase()) ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-800"}`}>
                            {displayStatus(booking.status)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-slate-600 space-y-2">
                        {schedule && (
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-green-600" />
                            <div>{schedule.day_of_week || schedule.date || ""} • <span className="font-medium">{schedule.start_time?.slice(0,5)} - {schedule.end_time?.slice(0,5)}</span></div>
                          </div>
                        )}

                        {pkg && (
                          <div className="flex items-center gap-3">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <div>Package: <span className="font-medium">{pkg.name}</span> • Rs. <span className="font-semibold">{Number(pkg.price || booking.amount || 0).toLocaleString()}</span></div>
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <div className="text-xs text-slate-500">{booking.address || booking.location || provider.location || "Location not provided"}</div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                        <button
                          onClick={() => handleNegotiationRoom(booking.id)}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition"
                        >
                          <MessageSquare className="w-4 h-4" /> Open Negotiation
                        </button>

                        <button
                          onClick={() => router.push(`/services/${svc.id || svc.slug || ''}`)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          Details <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-between">
              <div className="text-sm text-slate-600">Showing {(page - 1) * perPage + 1} - {Math.min(page * perPage, filtered.length)} of {filtered.length} bookings</div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-700 disabled:opacity-50"
                >
                  Prev
                </button>
                <div className="px-3 py-1 border rounded-md bg-white text-sm">{page}</div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded-md bg-white border border-slate-200 text-slate-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
