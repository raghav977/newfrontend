"use client";

import { useEffect, useMemo, useState } from "react";

export default function BookingDetailsPage() {
    const [bookings, setBookings] = useState([]);
    const [status, setStatus] = useState("all");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            setError(null);
            try {
                const url = new URL("https://backendwala.onrender.com/api/booking/getallbookings");
                if (status && status !== "all") url.searchParams.set("status", status);
                const res = await fetch(url.toString(), { credentials: "include" });
                console.log("Fetch bookings response:", res);
                if (!res.ok) throw new Error(`Server returned ${res.status}`);
                const data = await res.json();
                // Expecting { status: 'success', code: 200, data: [...] }
                const list = Array.isArray(data?.data) ? data.data : [];
                setBookings(list);
            } catch (e) {
                console.error("Failed to fetch bookings", e);
                setError(e.message || String(e));
                setBookings([]);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [status]);

    const filtered = useMemo(() => {
        if (!search.trim()) return bookings;
        const q = search.trim().toLowerCase();
        return bookings.filter((b) => {
            const name = String(b.name || "").toLowerCase();
            const email = String(b.serviceProviderEmail || "").toLowerCase();
            return name.includes(q) || email.includes(q);
        });
    }, [bookings, search]);

    return (
        <div className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Admin — Bookings</h2>

            <div className="flex flex-col md:flex-row md:items-center md:gap-4 mb-4">
                <div className="flex-1">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by user name or provider email"
                        className="w-full border rounded px-3 py-2"
                    />
                </div>

                <div className="mt-3 md:mt-0">
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="border rounded px-3 py-2">
                        <option value="all">All statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded shadow overflow-hidden">
                <div className="p-4 border-b">
                    <div className="text-sm text-gray-600">Showing {filtered.length} booking(s)</div>
                </div>

                {loading ? (
                    <div className="p-6 text-center">Loading…</div>
                ) : error ? (
                    <div className="p-6 text-red-600">Error: {error}</div>
                ) : filtered.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">No bookings found.</div>
                ) : (
                    <div className="divide-y">
                        {filtered.map((b) => (
                            <div key={b.id} className="p-4 hover:bg-gray-50 flex items-center justify-between">
                                <div>
                                    <div className="font-medium">{b.name}</div>
                                       <div className="text-sm text-gray-600">{b.service} · {b.schedule}</div>
                                       <div className="text-sm text-gray-600">Confirmed: Rs.{b.confirmed_bid_amount ?? b.confirmed_money ?? '—'}</div>
                                       <div className="text-sm text-gray-500">Provider: {b.serviceprovider} · {b.serviceProviderEmail}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`px-3 py-1 rounded text-sm ${b.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{b.status}</div>
                                    <button onClick={() => setSelected(b)} className="text-sm text-indigo-600 px-3 py-1 border rounded">View</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail modal */}
            {selected && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6">
                        <div className="flex items-start justify-between">
                            <h3 className="text-xl font-semibold">Booking #{selected.id}</h3>
                            <button onClick={() => setSelected(null)} className="text-gray-500">Close</button>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-gray-500">User</div>
                                <div className="font-medium">{selected.name}</div>
                                <div className="text-sm text-gray-600 mt-2">Service: {selected.service}</div>
                                <div className="text-sm text-gray-600">Schedule: {selected.schedule}</div>
                                   <div className="text-sm text-gray-600">Confirmed bid: Rs.{selected.confirmed_bid_amount ?? selected.confirmed_money ?? '—'}</div>
                                   <div className="text-sm text-gray-600">Package: {selected.package ?? '—'}</div>
                            </div>

                            <div>
                                <div className="text-sm text-gray-500">Provider</div>
                                <div className="font-medium">{selected.serviceprovider}</div>
                                <div className="text-sm text-gray-600">Email: {selected.serviceProviderEmail}</div>
                                <div className="text-sm text-gray-600 mt-2">Status: <span className="font-semibold">{selected.status}</span></div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={() => setSelected(null)} className="px-4 py-2 border rounded">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}