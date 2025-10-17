"use client";

import { useRef, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import HeaderNavbar from "@/app/landingpagecomponents/components/HeaderNavbar";

import Cookie from "@/app/user/bookings/[booking_id]/components/Cookie";

import Leftpage from "./components/Left"
import Rightpage from "./components/Right"
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
  const {booking_id} = useParams();

  return (
    <div className="min-h-screen bg-slate-50">
      <HeaderNavbar />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 max-w-7xl mx-auto p-4">

      <Leftpage bookingId={booking_id}/>
      <Rightpage bookingId={booking_id}/>
      <Cookie/>
      </div>


    </div>
  );
}