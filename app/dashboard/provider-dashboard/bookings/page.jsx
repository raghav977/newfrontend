"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { aboutUser } from "@/app/redux/slices/authSlice";
import { io } from "socket.io-client";

import ChatComponent from "@/app/user/bookings/[booking_id]/components/ChatComponent";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Clock, User, FileText, ArrowRightLeft } from "lucide-react";

export default function MyBookings() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const userData = authState?.user?.user || authState?.user;
  const PROVIDER_ID = userData?.id;

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [messages, setMessages] = useState([]);
  const [socketRef, setSocketRef] = useState(null);

  // 🧠 Load user info
  useEffect(() => {
    if (!PROVIDER_ID) dispatch(aboutUser());
  }, [dispatch, PROVIDER_ID]);

  // 📦 Fetch bookings
  useEffect(() => {
    if (!PROVIDER_ID) return;

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const base = "https://backendwala.onrender.com/api/booking/provider";
        let backendStatus = selectedStatus === "confirmed" ? "accepted" : selectedStatus;
        const url =
          backendStatus && backendStatus !== "all"
            ? `${base}?status=${encodeURIComponent(backendStatus)}`
            : base;

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

  // 🔌 Fetch bids + setup socket when booking opens
  useEffect(() => {
    if (!selectedBooking) return;

    const fetchBids = async () => {
      try {
        const res = await fetch(
          `https://backendwala.onrender.com/api/bids/user/bids?bookingId=${selectedBooking.id}`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (Array.isArray(data.message)) {
          setMessages(data.message);
        }
      } catch (err) {
        console.error("Error fetching bids:", err);
      }
    };

    fetchBids();

    // Setup socket
    const socket = io("http://localhost:5000", {
      withCredentials: true,
      transports: ["websocket"],
    });
    setSocketRef(socket);

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("join-booking-room", { bookingId: selectedBooking.id });
    });

    socket.on("new-bid", (bid) => {
      console.log("Received new bid:", bid);
      setMessages((prev) => [...prev, bid.bid || bid]);
    });

    socket.on("bid-accepted", (bid) => {
      setMessages((prev) =>
        prev.map((b) => (b.id === bid.id ? { ...b, status: "accepted" } : b))
      );
    });

    socket.on("bid-rejected", (bid) => {
      setMessages((prev) =>
        prev.map((b) => (b.id === bid.id ? { ...b, status: "rejected" } : b))
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedBooking]);

  // 🧭 Wait for user before rendering
  if (!PROVIDER_ID) {
    return (
      <main className="px-6 py-8">
        <h1 className="text-xl text-gray-700 font-semibold">
          Loading user info...
        </h1>
      </main>
    );
  }

  return (
    <main className="px-6 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">My Bookings</h1>

      {/* Filter Dropdown */}
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

      {/* Booking List */}
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

      {/* 💬 Chat / Negotiation Dialog */}
      {selectedBooking && (
        <Dialog
          open={!!selectedBooking}
          onOpenChange={() => setSelectedBooking(null)}
        >
          <DialogContent className="max-w-3xl w-full">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold mb-4 flex items-center gap-2">
                <FileText className="w-6 h-6 text-indigo-500" />
                Booking #{selectedBooking.id} —{" "}
                {selectedBooking.ServiceProviderService?.Service?.name ||
                  "Service"}
              </DialogTitle>
            </DialogHeader>

            {/* Reusable chat/bid component */}
            <ChatComponent
              bookingId={selectedBooking.id}
              currentUserId={PROVIDER_ID}
              messages={messages}
              socketRef={socketRef}
            />
          </DialogContent>
        </Dialog>
      )}
    </main>
  );
}
