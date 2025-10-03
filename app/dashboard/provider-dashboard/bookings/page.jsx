"use client";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, User, FileText, ArrowRightLeft } from "lucide-react";
import { io } from "socket.io-client";
import { fetchUserId } from "@/app/redux/slices/authSlice";


import {useDispatch,useSelector} from "react-redux";


export default function MyBookings() {

  const dispatch = useDispatch();
  const list = useSelector((state) => state.auth);
  const PROVIDER_ID = list?.user?.user?.id;
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const chatEndRef = useRef(null);
  const socketRef = useRef(null);

  // Fetch bookings
  useEffect(() => {
    async function fetchBookings() {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/booking/provider?status=pending", {
          credentials: "include",
        });
        const data = await res.json();
        setBookings(data.results || []);
      } catch (err) {
        setBookings([]);
      }
      setLoading(false);
    }
    fetchBookings();
    dispatch(fetchUserId())
  }, []);

  // Setup socket connection and listeners for negotiation room
  useEffect(() => {
    if (!selectedBooking) return;

    // Disconnect previous socket if any
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    socketRef.current = io("http://localhost:5000");

    const socket = socketRef.current;
    socket.emit("join-booking-room", { bookingId: selectedBooking.id });

    socket.on("new-bid", (bid) => {
      console.log("Received new-bid event:", bid);
      setSelectedBooking((prev) =>
        prev
          ? { ...prev, Bids: [...(prev.Bids || []), bid] }
          : prev
      );
    });
    socket.on("bid-accepted", (bid) => {
      setSelectedBooking((prev) =>
        prev
          ? {
              ...prev,
              Bids: prev.Bids.map((b) =>
                b.id === bid.id ? { ...b, status: "accepted" } : b
              ),
            }
          : prev
      );
    });
    socket.on("bid-rejected", (bid) => {
      setSelectedBooking((prev) =>
        prev
          ? {
              ...prev,
              Bids: prev.Bids.map((b) =>
                b.id === bid.id ? { ...b, status: "rejected" } : b
              ),
            }
          : prev
      );
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [selectedBooking]);

  // Scroll to bottom on new bid
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedBooking?.Bids]);

  // Place bid (counter bid)
  const placeBid = () => {
    if (!bidAmount || !selectedBooking || !socketRef.current) return;
    const newBid = {
      bookingId: selectedBooking.id,
      bidAmount: parseFloat(bidAmount),
      userId: PROVIDER_ID,
      status: "pending",
      id: Date.now(), // Temporary id for instant display
      user: { id: PROVIDER_ID },
    };
    // Optimistically add bid to chat
    setSelectedBooking((prev) =>
      prev ? { ...prev, Bids: [...(prev.Bids || []), newBid] } : prev
    );
    socketRef.current.emit("place-bid", {
      bookingId: selectedBooking.id,
      bidAmount: parseFloat(bidAmount),
      userId: PROVIDER_ID,
    });
    setBidAmount("");
  };

  // Accept bid
  const acceptBid = (bidId) => {
  if (!socketRef.current) return;
  socketRef.current.emit("accept-bid", { bidId, bookingId: selectedBooking.id, userId: PROVIDER_ID });
  };

  // Reject bid
  const rejectBid = (bidId) => {
  if (!socketRef.current) return;
  socketRef.current.emit("decline-bid", { bidId, bookingId: selectedBooking.id, userId: PROVIDER_ID });
  };

  return (
    <main className="px-6 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">My Bookings</h1>
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
                  {booking.ServiceSchedule?.start_time?.slice(0, 5)} - {booking.ServiceSchedule?.end_time?.slice(0, 5)}
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

      {/* Negotiation Room Modal */}
      <Dialog open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-500" />
              {selectedBooking?.ServiceProviderService?.Service?.name || "Service"}
            </DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                <User className="w-4 h-4" />
                {selectedBooking.User?.name} ({selectedBooking.User?.email})
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-4">
                <Clock className="w-4 h-4" />
                {selectedBooking.ServiceSchedule?.day_of_week},{" "}
                {selectedBooking.ServiceSchedule?.start_time?.slice(0, 5)} - {selectedBooking.ServiceSchedule?.end_time?.slice(0, 5)}
              </div>
              {/* Chat-like Bid List */}
              <div className="flex flex-col h-[40vh] bg-white border rounded-xl shadow mb-4 overflow-y-auto px-2 py-2">
                {selectedBooking.Bids?.length === 0 ? (
                  <p className="text-gray-500 text-center my-auto">No bids yet.</p>
                ) : (
                  selectedBooking.Bids.map((bid) => {
                    const isProviderBid = bid.userId === PROVIDER_ID;
                    return (
                      <div
                        key={bid.id}
                        className={`flex mb-3 ${isProviderBid ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs w-fit p-3 rounded-2xl shadow-sm border text-sm
                            ${isProviderBid
                              ? "bg-blue-100 border-blue-200 text-right"
                              : "bg-gray-100 border-gray-200 text-left"}
                          `}
                        >
                          <div className="font-semibold text-gray-900">
                            Rs.{bid.bidAmount}
                          </div>
                          <div className={`text-xs font-semibold capitalize mt-1 ${
                            bid.status === "accepted"
                              ? "text-green-600"
                              : bid.status === "rejected"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }`}>
                            {bid.status}
                          </div>
                          {bid.status === "pending" && !isProviderBid && (
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => acceptBid(bid.id)}
                                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => rejectBid(bid.id)}
                                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>
              {/* Message Input */}
              <form
                className="flex gap-2"
                onSubmit={e => {
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
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}