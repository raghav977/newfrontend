"use client";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { io } from "socket.io-client";
import { fetchUserId } from "../../../redux/slices/authSlice";

export default function BidForm({ service }) {
  console.log("This is service")
  const [bidAmount, setBidAmount] = useState("");
  const socketRef = useRef(null);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  // Connect socket
  useEffect(() => {
    if (!user) return;

    socketRef.current = io("http://localhost:3024", {
      withCredentials: true,
    });

    // Register this user once
    socketRef.current.emit("register", { userId: user.message, role: "user" });

    // Listen for private bids
    const handleIncoming = (msg) => {
      console.log("Incoming bid:", msg);
      // TODO: update UI or redux here
    };
    socketRef.current.on("privateBid", handleIncoming);

    return () => {
      socketRef.current.off("privateBid", handleIncoming);
      socketRef.current.disconnect();
    };
  }, [service, user]);

  // Fetch logged-in user once
  useEffect(() => {
    dispatch(fetchUserId());
  }, [dispatch]);

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!bidAmount || !user) return;

    socketRef.current.emit("privateBid", {
      from: user.message,
      to: service.provider.userId,
      amount: bidAmount,
      service: service.id,
    });

    setBidAmount("");
  };

  if (!user) return <p>Loading user...</p>;

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-slate-800">Place Your Bid</h2>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="number"
          placeholder="Enter your amount"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          className="flex-grow"
        />
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          Submit Bid
        </Button>
      </form>
    </div>
  );
}
