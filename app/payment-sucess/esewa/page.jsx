// pages/payment-success/esewa.jsx

"use client"
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

export default function EsewaSuccess() {
  const searchParams = new URLSearchParams(window.location.search);
  const amt = searchParams.get("amt");
  const refId = searchParams.get("refId");
  const oid = searchParams.get("oid");

  useEffect(() => {
    async function verifyPayment() {
      try {
        const res = await axios.post("http://localhost:5000/api/payment/esewa/verify", {
          amt,
          refId,
          oid,
        });
        console.log("Payment verified:", res.data);
        alert("Payment verified successfully!");
      } catch (err) {
        console.error("Payment verification failed:", err);
        alert("Verification failed!");
      }
    }
    verifyPayment();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-xl font-semibold">Processing your payment...</h2>
    </div>
  );
}
