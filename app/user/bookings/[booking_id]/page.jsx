"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import io from "socket.io-client";
import HeaderNavbar from "@/app/landingpagecomponents/components/HeaderNavbar";
import { fetchUserId } from "@/app/redux/slices/authSlice";
import { useSelector, useDispatch } from "react-redux";

export default function NegotiationRoomPage() {
  const dispatch = useDispatch();
  const list = useSelector((state) => state.auth);
  const CURRENT_USER_ID = list?.user?.user?.id;

  console.log("The current_user id is",CURRENT_USER_ID);

  

  const { booking_id } = useParams();
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [serviceProviderId, setServiceProviderId] = useState(null);
  const chatEndRef = useRef(null);
  const socketRef = useRef(null);

  // Fetch user id on mount
  useEffect(() => {
    dispatch(fetchUserId());
  }, [dispatch]);

  // Fetch all bids for this booking from API
  useEffect(() => {
    async function fetchBids() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/bids/user?bookingId=${booking_id}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.message && Array.isArray(data.message)) {
          const booking = data.message.find((b) => b.id == booking_id);
          console.log("This is booking",booking);
          if (booking) {
            setServiceProviderId(booking.service_provider_id || null);
            setBids(booking.Bids || []);
          } else {
            setBids([]);
          }
        } else {
          setBids([]);
        }
      } catch (err) {
        setBids([]);
      }
      setLoading(false);
    }
    fetchBids();
  }, [booking_id]);

  // Socket setup
  useEffect(() => {
    socketRef.current = io("http://localhost:5000", { withCredentials: true });

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-booking-room", { bookingId: booking_id });
    });

    socketRef.current.on("new-bid", (bid) => {
      setBids((prev) => [...prev, bid]);
    });

    socketRef.current.on("bid-accepted", (bid) => {
      setBids((prev) =>
        prev.map((b) => (b.id === bid.id ? { ...b, status: "accepted" } : b))
      );
    });

    socketRef.current.on("bid-rejected", (bid) => {
      setBids((prev) =>
        prev.map((b) => (b.id === bid.id ? { ...b, status: "rejected" } : b))
      );
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [booking_id]);

  // Scroll to bottom on new bid
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [bids]);

  const placeBid = () => {
    if (!bidAmount || !CURRENT_USER_ID) return;
    socketRef.current.emit("place-bid", {
      bookingId: booking_id,
      bidAmount: parseFloat(bidAmount),
      userId: CURRENT_USER_ID,
    });
    setBidAmount("");
  };

  const acceptBid = (bidId) => {
  socketRef.current.emit("accept-bid", { bidId, bookingId: booking_id, userId: CURRENT_USER_ID });
  };

  const rejectBid = (bidId) => {
  socketRef.current.emit("decline-bid", { bidId, bookingId: booking_id, userId: CURRENT_USER_ID });
  };

  return (
    <div>
      <HeaderNavbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-4">
          Negotiation Room – Booking #{booking_id}
        </h1>

        {/* Chat Container */}
        <div className="flex flex-col h-[60vh] bg-white border rounded-xl shadow mb-6 overflow-y-auto px-4 py-4">
          {loading ? (
            <p className="text-gray-400">Loading bids...</p>
          ) : bids.length === 0 ? (
            <p className="text-gray-500 text-center my-auto">No bids yet.</p>
          ) : (
            bids.map((bid) => {
              console.log("This is bid",bid);
              console.log("This is bid",bid.user?.id);
              // User's message: left, Provider's message: right
              const isUserBid = bid.userId === CURRENT_USER_ID;
              const canAcceptOrReject =
                serviceProviderId && CURRENT_USER_ID === serviceProviderId && !isUserBid;
              return (
                <div
                  key={bid.id}
                  className={`flex mb-3 ${isUserBid ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-xs w-fit p-3 rounded-2xl shadow-sm border text-sm
                      ${isUserBid
                        ? "bg-blue-100 border-blue-200 text-left"
                        : "bg-green-100 border-green-200 text-right"}
                    `}
                  >
                    {/* Show sender name if available */}
                    <div className="text-xs text-gray-500 mb-1 font-semibold">
                      {bid.user?.name}
                    </div>
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
                    {bid.status === "pending" && canAcceptOrReject && (
                      <div className="flex gap-2 mt-2 justify-end">
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
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}