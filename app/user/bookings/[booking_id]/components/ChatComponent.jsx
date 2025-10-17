"use client";

import React, { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { connectSocketConnection } from "@/helper/socket";

export default function ChatComponent({ bookingId, bookingOwnerId, currentUserId }) {
  const [chatMessages, setChatMessages] = useState([]);
  const [bidAmount, setBidAmount] = useState("");
  const [isRoomClosed, setIsRoomClosed] = useState(false);
  const socketRef = useRef(null);
  const listRef = useRef(null);

  // 1️⃣ Initialize socket once
  useEffect(() => {
    if (!socketRef.current) {
      const socket = connectSocketConnection();
      socketRef.current = socket;
    }
  }, []);
  useEffect(() => {
    if (!bookingId) return;

    const fetchBids = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/bids/user/bids?bookingId=${bookingId}`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (Array.isArray(data.message)) {
          setChatMessages(data.message);
        }
      } catch (err) {
        console.error("Error fetching bids:", err);
      }
    };

    fetchBids();
  }, [bookingId]);

  // 3️⃣ Join socket room + listeners
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !bookingId) return;

    const joinRoom = () => {
      socket.emit("join-booking-room", { bookingId });
      console.log(`Joined room booking-${bookingId}`);
    };

    if (socket.connected) joinRoom();
    else socket.on("connect", joinRoom);

    // Socket event handlers
    const handleNewBid = (newBid) => {
      setChatMessages((prev) => {
        if (!prev.find((m) => m.id === newBid.id)) return [...prev, newBid];
        return prev;
      });
    };

    const handleBidAccepted = ({ bid }) => {
      setChatMessages((prev) =>
        prev.map((m) =>
          m.id === bid.id
            ? { ...m, status: "accepted" }
            : { ...m, status: "rejected" }
        )
      );
      toast.success(`Bid Rs.${bid.bidAmount} accepted!`);
      setIsRoomClosed(true);
    };

    const handleBidRejected = ({ bid }) => {
      setChatMessages((prev) =>
        prev.map((m) => (m.id === bid.id ? { ...m, status: "rejected" } : m))
      );
      toast.info(`Bid Rs.${bid.bidAmount} rejected!`);
    };

    const handleError = (err) => {
      toast.error(err.message || "Socket error");
    };

    // Attach listeners
    socket.on("new-bid", handleNewBid);
    socket.on("bid-accepted", handleBidAccepted);
    socket.on("bid-rejected", handleBidRejected);
    socket.on("error", handleError);

    // Cleanup
    return () => {
      socket.off("connect", joinRoom);
      socket.off("new-bid", handleNewBid);
      socket.off("bid-accepted", handleBidAccepted);
      socket.off("bid-rejected", handleBidRejected);
      socket.off("error", handleError);
    };
  }, [bookingId]);

  // 4️⃣ Auto-scroll chat
  useEffect(() => {
    if (listRef.current)
      listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [chatMessages]);

  // 5️⃣ Place bid
  const handleBidSubmit = () => {
    const amount = parseFloat(bidAmount);
    const socket = socketRef.current;
    if (!amount || isRoomClosed || !socket?.connected) return;

    socket.emit("place-bid", { bookingId, bidAmount: amount });
    setBidAmount("");
  };

  // 6️⃣ Accept/Reject bids
  const handleAcceptBid = (bidId) => {
    const socket = socketRef.current;
    if (!socket?.connected) return;
    socket.emit("accept-bid", { bidId, bookingId });
  };

  const handleRejectBid = (bidId) => {
    const socket = socketRef.current;
    if (!socket?.connected) return;
    socket.emit("reject-bid", { bidId, bookingId });
  };

  // Helper for avatar initials
  const getAvatarLetter = (name) =>
    name ? name.charAt(0).toUpperCase() : "?";

  return (
    <div className="p-4 bg-gray-50 rounded">
      <ToastContainer />
      <h2 className="text-2xl font-semibold mb-4">Bids / Chat</h2>

      {/* Chat area */}
      <div
        ref={listRef}
        className="space-y-4 max-h-[60vh] overflow-y-auto border p-4 rounded bg-white"
      >
        {chatMessages.map((msg) => {
          const isOwnMessage = msg.user?.id === currentUserId;
          const avatarLetter = getAvatarLetter(msg.user?.name);

          return (
            <div
              key={msg.id}
              className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
            >
              {!isOwnMessage && (
                <div className="mr-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-semibold text-white">
                    {avatarLetter}
                  </div>
                </div>
              )}

              <div
                className={`max-w-[75%] p-3 rounded-2xl shadow-sm ${
                  isOwnMessage
                    ? "bg-blue-50 text-slate-900 rounded-br-none"
                    : "bg-gray-100 text-slate-900 rounded-bl-none"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold">Rs. {msg.bidAmount}</div>

                  {msg.status === "pending" &&
                    currentUserId !== msg.user.id &&
                    !isRoomClosed && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptBid(msg.id)}
                          className="text-green-600 text-xs font-semibold hover:underline"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectBid(msg.id)}
                          className="text-red-500 text-xs font-semibold hover:underline"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                  {msg.status !== "pending" && (
                    <div
                      className={`text-xs capitalize ${
                        msg.status === "accepted"
                          ? "text-green-600"
                          : msg.status === "rejected"
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      {msg.status}
                    </div>
                  )}
                </div>

                <div className="text-xs mt-1 text-gray-400">
                  {new Date(msg.createdAt).toLocaleString()}
                </div>
              </div>

              {isOwnMessage && (
                <div className="ml-3">
                  <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">
                    {avatarLetter}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Input field */}
      {!isRoomClosed && (
        <div className="mt-4 flex gap-2">
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder="Type your bid..."
            className="border p-2 rounded w-full"
            onKeyDown={(e) => e.key === "Enter" && handleBidSubmit()}
          />
          <button
            onClick={handleBidSubmit}
            className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700 transition"
          >
            Send
          </button>
        </div>
      )}

      {isRoomClosed && (
        <div className="mt-2 text-center text-gray-500 font-medium">
          Bidding is closed for this booking.
        </div>
      )}
    </div>
  );
}
