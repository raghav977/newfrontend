"use client";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import { aboutUser } from "@/app/redux/slices/authSlice";

import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, User, FileText, ArrowRightLeft } from "lucide-react";

export default function MyBookings() {
  const dispatch = useDispatch();
  const list = useSelector((state) => state.auth);
  const userData = list?.user?.user || list?.user; // handle both structures
  const PROVIDER_ID = userData?.id;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const chatEndRef = useRef(null);
  const socketRef = useRef(null);

  // 🧠 Load user info once if not present
  useEffect(() => {
    if (!PROVIDER_ID) {
      dispatch(aboutUser());
    }
  }, [dispatch, PROVIDER_ID]);

  // Fetch bookings after provider loaded
  useEffect(() => {
    if (!PROVIDER_ID) return;
    const fetchBookings = async () => {
      setLoading(true);
      try {
        // Build URL based on selectedStatus (omit param for 'all')
  const base = "http://localhost:5000/api/booking/provider";
  // Map UI status names to backend status names if needed
  let backendStatus = selectedStatus;
  if (selectedStatus === "confirmed") backendStatus = "accepted"; 
  if (selectedStatus === "all") backendStatus = null;
  const url = backendStatus ? `${base}?status=${encodeURIComponent(backendStatus)}` : base;
        const res = await fetch(url, { credentials: "include" });
        const data = await res.json();
        setBookings(data.results || []);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [PROVIDER_ID, selectedStatus]);

  // Socket setup
  useEffect(() => {
    if (!selectedBooking) return;

    if (socketRef.current) socketRef.current.disconnect();

    const socket = io("http://localhost:5000", { withCredentials: true });
    socketRef.current = socket;

    socket.emit("join-booking-room", { bookingId: selectedBooking.id });

    socket.on("new-bid", (bid) =>
      setSelectedBooking((prev) => {
        if (!prev) return prev;
        // If server sent bid directly, normalize
        const incoming = bid && bid.bid ? bid.bid : bid;
        // If exact id already exists, ignore
        if ((prev.Bids || []).some((b) => b.id === incoming.id)) return prev;

        // Try to replace optimistic temporary bid (neg id) with server bid
        const incomingUserId = incoming.userId || incoming.user?.id || incoming.User?.id || incoming.UserId || null;
        const incomingAmount = Number(incoming.bidAmount ?? incoming.amount ?? incoming.price ?? 0);

        const tempIndex = (prev.Bids || []).findIndex((b) => {
          const tempUserId = b.userId || b.user?.id || b.User?.id || b.UserId || null;
          const tempAmount = Number(b.bidAmount ?? b.amount ?? b.price ?? 0);
          return (
            (typeof b.id === "number" && b.id < 0) &&
            b.__optimistic &&
            tempUserId != null &&
            incomingUserId != null &&
            String(tempUserId) === String(incomingUserId) &&
            Number.isFinite(tempAmount) &&
            Number.isFinite(incomingAmount) &&
            tempAmount === incomingAmount &&
            b.status === "pending"
          );
        });

        if (tempIndex !== -1) {
          const next = { ...prev };
          next.Bids = [...(prev.Bids || [])];
          next.Bids[tempIndex] = incoming;
          return next;
        }

        return prev ? { ...prev, Bids: [...(prev.Bids || []), incoming] } : prev;
      })
    );

    socket.on("bid-accepted", (payload) =>
      setSelectedBooking((prev) => {
        if (!prev) return prev;
        const incoming = payload && payload.bid ? payload.bid : payload;
        const next = { ...prev };
        next.Bids = (prev.Bids || []).map((b) => (b.id === incoming.id ? { ...b, status: "accepted" } : b));
        // If server provided bookingStatus, update booking status too
        if (payload && payload.bookingStatus) next.status = payload.bookingStatus;
        return next;
      })
    );

    socket.on("bid-rejected", (payload) =>
      setSelectedBooking((prev) => {
        if (!prev) return prev;
        const incoming = payload && payload.bid ? payload.bid : payload;
        const next = { ...prev };
        next.Bids = (prev.Bids || []).map((b) => (b.id === incoming.id ? { ...b, status: "rejected" } : b));
        if (payload && payload.bookingStatus) next.status = payload.bookingStatus;
        return next;
      })
    );

    return () => socket.disconnect();
  }, [selectedBooking]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedBooking?.Bids]);

  const placeBid = () => {
    if (!bidAmount || !selectedBooking || !socketRef.current || !PROVIDER_ID) return;
    // validate numeric and max 8 digits
    if (!/^[0-9]+$/.test(String(bidAmount))) return alert("Bid must be numeric");
    if (String(bidAmount).length > 8) return alert("Bid must be at most 8 digits");

    const tempId = Date.now() * -1;
    const newBid = {
      id: tempId,
      bookingId: selectedBooking.id,
      bidAmount: parseFloat(bidAmount),
      userId: PROVIDER_ID,
      status: "pending",
      user: { id: PROVIDER_ID },
      __optimistic: true,
    };

    setSelectedBooking((prev) => (prev ? { ...prev, Bids: [...(prev.Bids || []), newBid] } : prev));

    socketRef.current.emit("place-bid", {
      bookingId: selectedBooking.id,
      bidAmount: parseFloat(bidAmount),
      userId: PROVIDER_ID,
    });

    setBidAmount("");
  };

  const acceptBid = (bidId) => {
    if (!socketRef.current) return;
    socketRef.current.emit("accept-bid", {
      bidId,
      bookingId: selectedBooking.id,
      userId: PROVIDER_ID,
    });
  };

  const rejectBid = (bidId) => {
    if (!socketRef.current) return;
    socketRef.current.emit("decline-bid", {
      bidId,
      bookingId: selectedBooking.id,
      userId: PROVIDER_ID,
    });
  };

  // 🧭 Wait for user before rendering
  if (!PROVIDER_ID) {
    return (
      <main className="px-6 py-8">
        <h1 className="text-xl text-gray-700 font-semibold">Loading user info...</h1>
      </main>
    );
  }

  return (
    <main className="px-6 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">My Bookings</h1>

      <div className="flex items-center gap-4 mb-6">
        <label className="text-sm text-gray-600">Filter:</label>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <p>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p className="text-gray-500">No bookings found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <Card
              key={booking.id}
              className="rounded-xl shadow-lg border border-gray-100 bg-white hover:shadow-2xl transition-shadow cursor-pointer"
              onClick={() => setSelectedBooking(booking)}
            >
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  {booking.ServiceProviderService?.Service?.name || "Service"}
                </CardTitle>
                <CardDescription>
                  <Badge
                    className={
                      booking.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : booking.status === "accepted"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }
                  >
                    {booking.status}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <User className="w-4 h-4" />
                  {booking.User?.name} ({booking.User?.email})
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Clock className="w-4 h-4" />
                  {booking.ServiceSchedule?.day_of_week},{" "}
                  {booking.ServiceSchedule?.start_time?.slice(0, 5)} -{" "}
                  {booking.ServiceSchedule?.end_time?.slice(0, 5)}
                </div>
                {booking.Bids?.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <ArrowRightLeft className="w-4 h-4" />
                    Bid: Rs.{booking.Bids[0].bidAmount}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Negotiation Room */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              {selectedBooking?.ServiceProviderService?.Service?.name || "Service"}
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <>
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                <User className="w-4 h-4" />
                {selectedBooking.User?.name} ({selectedBooking.User?.email})
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
                <Clock className="w-4 h-4" />
                {selectedBooking.ServiceSchedule?.day_of_week},{" "}
                {selectedBooking.ServiceSchedule?.start_time?.slice(0, 5)} -{" "}
                {selectedBooking.ServiceSchedule?.end_time?.slice(0, 5)}
              </div>

              <div className="flex flex-col h-[40vh] bg-white border rounded-xl shadow mb-4 overflow-y-auto px-2 py-2">
                {selectedBooking.Bids?.length === 0 ? (
                  <p className="text-gray-500 text-center my-auto">No bids yet.</p>
                ) : (
                  selectedBooking.Bids.map((bid) => {
                    const isProviderBid = bid.userId === PROVIDER_ID;
                    return (
                      <div
                        key={bid.id}
                        className={`flex mb-3 ${
                          isProviderBid ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs w-fit p-3 rounded-2xl shadow-sm border text-sm ${
                            isProviderBid
                              ? "bg-blue-100 border-blue-200 text-right"
                              : "bg-gray-100 border-gray-200 text-left"
                          }`}
                        >
                          <div className="font-semibold text-gray-900">
                            Rs.{bid.bidAmount}
                          </div>
                          <div
                            className={`text-xs font-semibold capitalize mt-1 ${
                              bid.status === "accepted"
                                ? "text-green-600"
                                : bid.status === "rejected"
                                ? "text-red-600"
                                : "text-yellow-600"
                            }`}
                          >
                            {bid.status}
                          </div>
                          {bid.status === "pending" && !isProviderBid && (
                            <div className="flex gap-2 mt-2">
                              <Button
                                onClick={() => acceptBid(bid.id)}
                                className="bg-green-600 text-white hover:bg-green-700"
                              >
                                Accept
                              </Button>
                              <Button
                                onClick={() => rejectBid(bid.id)}
                                className="bg-red-600 text-white hover:bg-red-700"
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  placeBid();
                }}
              >
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder="Type your bid..."
                  className="flex-1 border px-3 py-2 rounded-lg"
                />
                <Button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Send
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
