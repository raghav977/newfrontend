"use client";

import { useRef, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import HeaderNavbar from "@/app/landingpagecomponents/components/HeaderNavbar";

function Avatar({ name, size = 10 }) {
  const initials = (name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-indigo-500 text-white font-semibold`}
      style={{ width: `${size * 4}px`, height: `${size * 4}px`, minWidth: `${size * 4}px` }}
    >
      {initials}
    </div>
  );
}

export default function NegotiationPage() {
  const listRef = useRef(null);
  const socketRef = useRef(null);
  const { booking_id } = useParams();

  const currentUser = useSelector((state) => state.auth?.user?.user || state.auth?.user);
  const CURRENT_USER_ID = currentUser?.id ?? null;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState("");
  const [bookingStatus, setBookingStatus] = useState(null);
  const [isCancelable, setIsCancelable] = useState(true);

  const [processingBidIds, setProcessingBidIds] = useState([]);

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [reportMessage, setReportMessage] = useState("");

  const normalizeBid = (raw) => {
    const bidder = raw.User || raw.user || raw.bidder || null;
    const userId = raw.userId ?? raw.UserId ?? bidder?.id ?? null;
    return { ...raw, user: bidder, userId };
  };

  const normalizeMsg = (raw) => {
    const userObj = raw.User || raw.user || raw.sender || null;
    const textVal = raw.text ?? raw.message ?? raw.body ?? raw.content ?? "";
    const id = raw.id ?? raw.messageId ?? `${Date.now()}-${Math.random()}`;
    const created = raw.createdAt ?? raw.created_at ?? raw.time ?? null;
    const time = created
      ? new Date(created).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : raw.time ?? new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const fromUserId = raw.userId ?? raw.UserId ?? userObj?.id ?? raw.senderId ?? null;
    const fromMe = CURRENT_USER_ID && fromUserId ? String(fromUserId) === String(CURRENT_USER_ID) : !!raw.fromMe;
    return {
      id,
      text: textVal,
      time,
      fromMe,
      user: userObj ? { name: userObj.name || userObj.username || userObj.email || "User", id: userObj.id } : null,
    };
  };

  useEffect(() => {
    if (!booking_id) return;
    let cancelled = false;

    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/booking/${booking_id}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (cancelled) return;
          setBookingStatus(data?.booking?.status || data?.status || null);

          const rawBids = data?.booking?.Bids ?? data?.Bids ?? null;
          if (Array.isArray(rawBids)) setBids(rawBids.map(normalizeBid));

          const rawMsgs = data?.booking?.Messages ?? data?.Messages ?? null;
          if (Array.isArray(rawMsgs)) setMessages(rawMsgs.map(normalizeMsg));
        }

        if (!bids.length) {
          try {
            const bRes = await fetch(`http://localhost:5000/api/bids/user/bids?bookingId=${booking_id}`, { credentials: "include" });
            if (bRes.ok) {
              const bData = await bRes.json();
              const arr = Array.isArray(bData?.message)
                ? bData.message
                : Array.isArray(bData?.data)
                ? bData.data
                : Array.isArray(bData)
                ? bData
                : [];
              if (arr.length && !cancelled) setBids(arr.map(normalizeBid));
            }
          } catch (e) {}
        }

        if (!messages.length) {
          const tryUrls = [
            `http://localhost:5000/api/booking/${booking_id}/messages`,
            `http://localhost:5000/api/messages?bookingId=${booking_id}`,
            `http://localhost:5000/api/messages/user?bookingId=${booking_id}`,
          ];
          for (const url of tryUrls) {
            try {
              const mRes = await fetch(url, { credentials: "include" });
              if (!mRes.ok) continue;
              const mData = await mRes.json();
              const arr = Array.isArray(mData)
                ? mData
                : Array.isArray(mData?.message)
                ? mData.message
                : Array.isArray(mData?.data)
                ? mData.data
                : [];
              if (arr.length && !cancelled) {
                setMessages(arr.map(normalizeMsg));
                break;
              }
            } catch (e) {}
          }
        }
      } catch (err) {
        console.debug("Failed to fetch booking data", err);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking_id]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, bids]);

  useEffect(() => {
    if (!booking_id || !CURRENT_USER_ID) return;
    const socket = io("http://localhost:5000", { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-booking-room", { bookingId: booking_id });
    });

    socket.on("new-bid", (bid) => {
      setBids((prev) => {
        if (prev.some((b) => String(b.id) === String(bid.id))) return prev;
        const incomingUserId = bid.userId || bid.user?.id || bid.User?.id || null;
        const incomingAmount = Number(bid.bidAmount ?? bid.amount ?? bid.price ?? 0);
        const tempIndex = prev.findIndex((b) => {
          const tempUserId = b.userId || b.user?.id || null;
          const tempAmount = Number(b.bidAmount ?? b.amount ?? b.price ?? 0);
          return (
            typeof b.id === "number" &&
            b.id < 0 &&
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
          const next = [...prev];
          next[tempIndex] = normalizeBid(bid);
          return next;
        }
        return [...prev, normalizeBid(bid)];
      });
    });

    socket.on("bid-accepted", (payload) => {
      const incoming = payload && payload.bid ? payload.bid : payload;
      if (!incoming) return;
      setBids((prev) => prev.map((b) => (String(b.id) === String(incoming.id) ? { ...b, status: "accepted" } : b)));
      setIsCancelable(false);
      if (payload && payload.bookingStatus) setBookingStatus(payload.bookingStatus);

      // append system message so seeker sees acceptance immediately
      const sys = {
        id: `sys-accept-${incoming.id}-${Date.now()}`,
        text: `Bid accepted — Rs.${incoming.bidAmount ?? incoming.amount ?? ""}`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        fromMe: false,
        user: { name: "System" },
      };
      setMessages((prev) => [...prev, sys]);
    });

    socket.on("bid-rejected", (payload) => {
      const incoming = payload && payload.bid ? payload.bid : payload;
      if (!incoming) return;
      setBids((prev) => prev.map((b) => (String(b.id) === String(incoming.id) ? { ...b, status: "rejected" } : b)));
      setIsCancelable(false);

      const sys = {
        id: `sys-reject-${incoming.id}-${Date.now()}`,
        text: `Bid rejected — Rs.${incoming.bidAmount ?? incoming.amount ?? ""}`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        fromMe: false,
        user: { name: "System" },
      };
      setMessages((prev) => [...prev, sys]);
    });

    socket.on("new-message", (rawMsg) => {
      try {
        const msg = normalizeMsg(rawMsg);
        setMessages((prev) => [...prev, msg]);
      } catch (e) {
        console.debug("Failed to normalize incoming message", e);
      }
    });

    return () => socket.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking_id, CURRENT_USER_ID]);

  const placeBid = () => {
    if (!bidAmount) return alert("Please enter a bid amount.");
    if (!/^[0-9]+$/.test(bidAmount)) return alert("Bid must be numeric.");
    if (bidAmount.length > 8) return alert("Bid must be at most 8 digits.");
    if (!CURRENT_USER_ID) return alert("You must be logged in to bid.");
    if (!socketRef.current) return alert("Socket not connected.");

    const amt = Number(bidAmount);
    const tempId = Date.now() * -1;
    const newBid = {
      id: tempId,
      userId: CURRENT_USER_ID,
      bidAmount: amt,
      status: "pending",
      user: { id: CURRENT_USER_ID, name: currentUser?.name || currentUser?.username || currentUser?.email || "You" },
      __optimistic: true,
    };

    setBids((prev) => [...prev, newBid]);
    setBidAmount("");

    socketRef.current.emit("place-bid", {
      bookingId: booking_id,
      bidAmount: amt,
      userId: CURRENT_USER_ID,
    });
  };

  const acceptBid = (bid) => {
    const bidId = bid?.id;
    if (!socketRef.current) return alert("Socket not connected");
    if (bidId == null) return alert("Invalid bid id.");
    if (Number(bidId) <= 0 && !String(bidId).match(/^\d+$/)) {
      // allow numeric strings too; prevent optimistic negatives
    }
    if (String(bid.userId) === String(CURRENT_USER_ID) || String(bid.user?.id) === String(CURRENT_USER_ID)) return alert("You cannot accept your own bid.");
    if (processingBidIds.includes(String(bidId))) return;

    setProcessingBidIds((p) => [...p, String(bidId)]);
    setBids((prev) => prev.map((b) => (String(b.id) === String(bidId) ? { ...b, status: "accepted" } : b)));
    setIsCancelable(false);

    // local system message for immediate feedback
    setMessages((prev) => [
      ...prev,
      {
        id: `local-accept-${bidId}-${Date.now()}`,
        text: `You accepted Rs.${bid.bidAmount ?? bid.amount ?? ""}`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        fromMe: true,
        user: { name: "You" },
      },
    ]);

    socketRef.current.emit("accept-bid", { bidId, bookingId: booking_id, userId: CURRENT_USER_ID });

    setTimeout(() => setProcessingBidIds((p) => p.filter((id) => id !== String(bidId))), 5000);
  };

  const rejectBid = (bid) => {
    const bidId = bid?.id;
    if (!socketRef.current) return alert("Socket not connected");
    if (bidId == null) return alert("Invalid bid id.");
    if (String(bid.userId) === String(CURRENT_USER_ID) || String(bid.user?.id) === String(CURRENT_USER_ID)) return alert("You cannot reject your own bid.");
    if (processingBidIds.includes(String(bidId))) return;

    setProcessingBidIds((p) => [...p, String(bidId)]);
    setBids((prev) => prev.map((b) => (String(b.id) === String(bidId) ? { ...b, status: "rejected" } : b)));

    setMessages((prev) => [
      ...prev,
      {
        id: `local-reject-${bidId}-${Date.now()}`,
        text: `You rejected Rs.${bid.bidAmount ?? bid.amount ?? ""}`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        fromMe: true,
        user: { name: "You" },
      },
    ]);

    socketRef.current.emit("decline-bid", { bidId, bookingId: booking_id, userId: CURRENT_USER_ID });

    setTimeout(() => setProcessingBidIds((p) => p.filter((id) => id !== String(bidId))), 5000);
  };

  const handleSend = (e) => {
    e?.preventDefault();
    if (!text.trim()) return;
    if (bookingStatus === "cancelled" || bookingStatus === "completed") return alert("Chat disabled for closed booking.");
    const next = {
      id: Date.now(),
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      fromMe: true,
      user: { name: "You" },
    };
    setMessages((s) => [...s, next]);
    setText("");
    if (socketRef.current) {
      socketRef.current.emit("send-message", { bookingId: booking_id, text: next.text });
    }
  };

  const cancelBooking = async () => {
    if (!booking_id) return alert("Missing booking id");
    if (!confirm("Are you sure you want to cancel this booking? This action may be irreversible.")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/booking/cancel/${booking_id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return alert(`Cancel failed: ${err.message || res.statusText}`);
      }
      const data = await res.json().catch(() => ({}));
      setBookingStatus("cancelled");
      alert(data?.message || "Booking cancelled successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to cancel booking");
    }
  };

  const handleCompleteSubmit = async () => {
    if (!booking_id) return alert("Missing booking id");
    try {
      const res = await fetch(`http://localhost:5000/api/booking/complete/${booking_id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return alert(`Failed to complete: ${err.message || res.statusText}`);
      }
      const data = await res.json().catch(() => ({}));
      setBookingStatus("completed");
      setIsCancelable(false);
      setShowCompleteModal(false);
      alert(data?.message || "Booking marked as completed. Thank you for rating.");
    } catch (err) {
      console.error(err);
      alert("Failed to mark booking as completed");
    }
  };

  const handleReportSubmit = async () => {
    if (!booking_id) return alert("Missing booking id");
    if (!reportMessage.trim()) return alert("Please enter a message for the report.");
    try {
      const res = await fetch(`http://localhost:5000/api/booking/report/${booking_id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: reportMessage }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return alert(`Report failed: ${err.message || res.statusText}`);
      }
      const data = await res.json().catch(() => ({}));
      setShowReportModal(false);
      setReportMessage("");
      alert(data?.message || "Report submitted successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to submit report");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <HeaderNavbar />

      <div className="max-w-5xl mx-auto p-4">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">SP</div>
              <div>
                <div className="text-lg font-semibold">Negotiation Room</div>
                <div className="text-sm text-gray-500">Chat with your provider / seeker</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="text-sm text-indigo-600 px-3 py-1 rounded-lg border border-indigo-100">Details</button>
              <button className="text-sm text-gray-600 px-3 py-1 rounded-lg hover:bg-gray-100">Help</button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row">
            <div className="flex-1 p-6">
              <div ref={listRef} className="h-[60vh] overflow-y-auto px-2 space-y-4">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}>
                    {!m.fromMe && (
                      <div className="mr-3">
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">{(m.user?.name || "?").charAt(0)}</div>
                      </div>
                    )}

                    <div className={`max-w-[70%] p-3 rounded-2xl ${m.fromMe ? "bg-indigo-600 text-white rounded-br-none" : "bg-gray-100 text-gray-900 rounded-bl-none"}`}>
                      <div className="text-sm">{m.text}</div>
                      <div className={`text-xs mt-2 ${m.fromMe ? "text-indigo-200" : "text-gray-400"}`}>{m.time}</div>
                    </div>

                    {m.fromMe && (
                      <div className="ml-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-semibold text-white">Y</div>
                      </div>
                    )}
                  </div>
                ))}

                {bids.map((bid) => {
                  const isOwn = String(bid.userId) === String(CURRENT_USER_ID) || String(bid.user?.id) === String(CURRENT_USER_ID);
                  const isOptimistic = typeof bid.id === "number" && bid.id < 0;
                  const isProcessing = processingBidIds.includes(String(bid.id));
                  return (
                    <div key={bid.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                      {!isOwn && (
                        <div className="mr-3">
                          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-semibold text-gray-700">{(bid.user?.name || "?").charAt(0)}</div>
                        </div>
                      )}

                      <div className={`max-w-[70%] p-3 rounded-2xl ${isOwn ? "bg-blue-100 text-right" : "bg-gray-100 text-left"}`}>
                        <div className="font-semibold">Rs.{bid.bidAmount}</div>
                        <div className="text-xs mt-1 text-gray-500">{bid.status}{isOptimistic ? " (sending...)" : ""}</div>
                        {bid.status === "pending" && !isOwn && (
                          <div className="flex gap-2 mt-2 justify-end">
                            <button
                              onClick={() => acceptBid(bid)}
                              disabled={isOptimistic || isProcessing || bookingStatus === "cancelled" || bookingStatus === "completed"}
                              className={`px-3 py-1 ${isOptimistic || isProcessing ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-green-600 text-white hover:bg-green-700"} rounded`}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => rejectBid(bid)}
                              disabled={isOptimistic || isProcessing || bookingStatus === "cancelled" || bookingStatus === "completed"}
                              className={`px-3 py-1 ${isOptimistic || isProcessing ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-red-600 text-white hover:bg-red-700"} rounded`}
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>

                      {isOwn && (
                        <div className="ml-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-sm font-semibold text-white">Y</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSend} className="mt-4 flex items-center gap-3">
                <button type="button" className="p-2 rounded-lg hover:bg-gray-100" disabled>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-9.193 4.11a1 1 0 01-1.287-1.287l4.11-9.193a1 1 0 011.414-.414l8.486 4.243a1 1 0 010 1.828l-4.11 1.887z" />
                  </svg>
                </button>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder={bookingStatus === "cancelled" || bookingStatus === "completed" ? "Chat disabled for closed booking" : "Type a message..."}
                  disabled={bookingStatus === "cancelled" || bookingStatus === "completed"}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="Enter bid (max 8 digits)"
                    className="w-44 border border-gray-200 rounded-full px-3 py-2 focus:outline-none"
                  />
                  <button type="button" onClick={placeBid} className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700">Bid</button>
                </div>
              </form>
            </div>

            <aside className="w-full md:w-80 border-l p-4 bg-slate-50">
              <div className="mb-4">
                <h3 className="text-sm text-gray-500">Booking</h3>
                <div className="text-lg font-semibold">Service name</div>
                <div className="text-sm text-gray-500">Saturday · 10:00 - 11:00</div>
              </div>

              <div className="mb-4">
                <h4 className="text-sm text-gray-500">Participants</h4>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">S</div>
                    <div className="text-sm">Seeker</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center">P</div>
                    <div className="text-sm">Provider</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm text-gray-500">Actions</h4>
                <div className="mt-3 flex flex-col gap-2">
                  <button className="w-full text-sm border border-indigo-100 text-indigo-700 rounded px-3 py-2">View details</button>
                  {bookingStatus === "cancelled" ? (
                    <div className="w-full text-sm bg-red-100 text-red-600 rounded px-3 py-2 text-center">Cancelled</div>
                  ) : (
                    <button onClick={cancelBooking} disabled={!isCancelable} className={`w-full text-sm ${isCancelable ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-400 cursor-not-allowed"} rounded px-3 py-2`}>
                      {isCancelable ? "Cancel booking" : "Cancellation disabled"}
                    </button>
                  )}

                  {bookingStatus === "confirmed" && (
                    <>
                      <button onClick={() => setShowCompleteModal(true)} className="w-full text-sm bg-green-50 text-green-700 rounded px-3 py-2">Mark as Completed</button>
                      <button onClick={() => setShowReportModal(true)} className="w-full text-sm bg-yellow-50 text-yellow-700 rounded px-3 py-2">Report Worker</button>
                    </>
                  )}
                </div>
              </div>

              {showCompleteModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 className="text-lg font-semibold mb-2">Rate this service</h3>
                    <p className="text-sm text-gray-500 mb-4">Please rate the provider's work (1-5).</p>
                    <div className="flex items-center gap-2 mb-4">
                      <input type="number" min="1" max="5" value={rating} onChange={(e) => setRating(Number(e.target.value))} className="w-20 border rounded px-2 py-1" />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setShowCompleteModal(false)} className="px-3 py-2 rounded border">Cancel</button>
                      <button onClick={handleCompleteSubmit} className="px-3 py-2 bg-indigo-600 text-white rounded">Submit</button>
                    </div>
                  </div>
                </div>
              )}

              {showReportModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 className="text-lg font-semibold mb-2">Report Worker</h3>
                    <p className="text-sm text-gray-500 mb-4">Describe the issue:</p>
                    <textarea value={reportMessage} onChange={(e) => setReportMessage(e.target.value)} className="w-full border rounded px-3 py-2 mb-4" rows={4} />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setShowReportModal(false)} className="px-3 py-2 rounded border">Cancel</button>
                      <button onClick={handleReportSubmit} className="px-3 py-2 bg-red-600 text-white rounded">Submit Report</button>
                    </div>
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}