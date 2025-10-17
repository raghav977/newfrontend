"use client";

import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { connectSocketConnection } from "@/helper/socket";

export default function RightSide({ bookingId = null }) {
  if (!bookingId) return null;

  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [booking, setBooking] = useState(null);

  const [isCancel, setIsCancel] = useState(false);

  /** 🔹 Cancel Booking */
  const handleCancelBooking = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/booking/cancel/${bookingId}`,
        {
          credentials: "include",
          method: "POST",
        }
      );

      const data = await response.json();
      console.log("This is cancel data", data);

      if (response.ok) {
        setIsCancel(true);
        alert("Booking cancelled successfully");
      }
    } catch (err) {
      console.error("Something went wrong", err);
    }
  };

  /** 🔹 Fetch Booking Status */
  const fetchBookingStatus = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/booking/get-booking-status/${bookingId}`,
        { credentials: "include" }
      );

      const data = await response.json();
      console.log("Fetched booking data", data);

      if (data.status === "success") {
        setBooking(data.data.booking);
        setIsCancel(data.data.booking.status === "cancelled");
      }
    } catch (err) {
      console.error("Error fetching booking status", err);
    }
  };

  /** 🔹 Fetch Payment Info */
  const fetchPaymentStatus = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/payments/payment-status/${bookingId}`,
        { credentials: "include" }
      );
      const data = await res.json();
      console.log("Payment data", data);

      if (data.status === "success") {
        setPaymentInfo(data.message);
      } else {
        setPaymentInfo(null);
      }
    } catch (err) {
      console.error("Error fetching payment status:", err);
      setPaymentInfo(null);
    }
  };

  /** 🔹 Handle Payment */
  /** 🔹 Handle Payment */
const handlePayment = async () => {
  console.log("Initiating payment for bid id:", paymentInfo?.bidId);
  if (!paymentInfo?.Bid?.bidAmount) {
    console.error("Payment info not available");
    return;
  }

  const bidAmount = paymentInfo.Bid.bidAmount;
  const productId = bookingId; // or generate unique ID
  const customer = paymentInfo?.Bid?.User;

  const bidId = paymentInfo?.bidId;

  console.log("This is customer info", customer);

  try {
    console.log("Bid amount:", bidAmount);
    console.log("bookingId:", productId);
    console.log("Customer info:", customer);
    const res = await fetch(
      `http://localhost:5000/api/payments/initiate-payment/${bookingId}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: bidAmount,
          productId:productId,
          paymentGateway: "esewa",
          bidId,


        }),
      }
    );

    const data = await res.json();
    console.log("Payment initiation response:", data);

    if (res.ok && data.data.redirect_url) {
      alert("Redirecting to eSewa payment...");
      window.location.href = data.data.redirect_url;
    } else {
      alert(data.message || "Payment initiation failed");
    }
  } catch (err) {
    console.error("Error initiating payment", err);
  }
};


  /** 🔹 Lifecycle: Fetch info & listen for socket updates */
  useEffect(() => {
    fetchBookingStatus();
    fetchPaymentStatus();

    const socket = connectSocketConnection();
    socket.emit("join-booking-room", { bookingId });

    socket.on("bid-accepted", async ({ bid }) => {
      console.log("Bid accepted via socket:", bid);
      await fetchPaymentStatus();
    });

    return () => socket.off("bid-accepted");
  }, [bookingId]);

  /** 🔹 Conditional UI Handling */
  if (isCancel) {
    return (
      <div className="p-6 text-center text-red-500 font-medium">
        Booking has been cancelled. Room closed.
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
      <header className="p-5 border-b bg-gradient-to-r from-indigo-50 to-white">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Provider Status
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage your service actions
        </p>
      </header>

      <div className="p-6 flex flex-col gap-4">
        {/* Payment Button */}
        <motion.button
          whileHover={{ scale: paymentInfo ? 1.03 : 1 }}
          whileTap={{ scale: paymentInfo ? 0.98 : 1 }}
          onClick={handlePayment}
          disabled={!paymentInfo || paymentInfo.status !== "pending"}
          className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl shadow-md transition-all font-medium
            ${
              paymentInfo && paymentInfo.status === "pending"
                ? "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-lg"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          <CheckCircle className="w-5 h-5" />
          {paymentInfo && paymentInfo.status === "pending"
            ? `Pay Rs.${paymentInfo.Bid.bidAmount} to ${paymentInfo.Bid.User.name}`
            : "Payment not available"}
        </motion.button>

        {/* Cancel Booking Button */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCancelBooking}
          disabled={paymentInfo?.status === "pending"}
          className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl shadow-md transition-all font-medium
            ${
              paymentInfo?.status === "pending"
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:shadow-lg"
            }`}
        >
          Cancel Booking
        </motion.button>
      </div>
    </div>
  );
}
