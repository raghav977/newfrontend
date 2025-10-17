"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function EsewaSuccess() {
  const [status, setStatus] = useState("Processing your payment...");

  useEffect(() => {
    // Make sure this code runs only in the browser
    if (typeof window === 'undefined') return;
    
    const searchParams = new URLSearchParams(window.location.search);
    const amt = searchParams.get("amt");
    const refId = searchParams.get("refId");
    const oid = searchParams.get("oid");

    async function verifyPayment() {
      try {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payment/esewa/verify`, {
          amt,
          refId,
          oid,
        });
        console.log("Payment verified:", res.data);
        setStatus("Payment verified successfully!");
      } catch (err) {
        console.error("Payment verification failed:", err);
        setStatus("Payment verification failed!");
      }
    }

    // Only call if we actually have query params
    if (amt && refId && oid) {
      verifyPayment();
    } else {
      setStatus("Invalid payment data.");
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-xl font-semibold">{status}</h2>
    </div>
  );
}
