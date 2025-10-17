"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getDistanceInKm } from "@/helper/distance"; // create a helpers file if not exist

export default function ServiceBooking({ schedules = [], serviceDetail, user, socket, customerLocation }) {



  const formatTime = (timeStr) => { const [hour, minute] = timeStr.split(":"); let h = parseInt(hour); const ampm = h >= 12 ? "PM" : "AM"; h = h % 12 || 12; return `${h}:${minute} ${ampm}`; };
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [price, setPrice] = useState(serviceDetail?.rate || 0);
  const [bidPrice, setBidPrice] = useState("");
  const [bids, setBids] = useState([]);
  const [distanceKm, setDistanceKm] = useState(null);
  const [position, setPosition] = useState(null);
  const [contactNumber, setContactNumber] = useState(user?.phone ?? "");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const packages = serviceDetail?.Packages || [];

  // ----------------------------
  // Calculate distance to provider
  // ----------------------------
  useEffect(() => {
    if (customerLocation && serviceDetail?.ServiceLocations?.length) {
      let minDist = Infinity;
      serviceDetail.ServiceLocations.forEach(loc => {
        const dist = getDistanceInKm(customerLocation.lat, customerLocation.lon, loc.latitude, loc.longitude);
        if (dist < minDist) minDist = dist;
      });
      setDistanceKm(minDist.toFixed(1));
    }
  }, [customerLocation, serviceDetail]);

  // ----------------------------
  // Update price when package changes
  // ----------------------------
  useEffect(() => {
    setPrice(selectedPackage?.price || serviceDetail?.rate || 0);
  }, [selectedPackage, serviceDetail]);

  // ----------------------------
  // WebSocket listeners
  // ----------------------------
  useEffect(() => {
    if (!socket) return;

    // Bids
    const handleNewBid = (newBid) => setBids(prev => [newBid, ...prev]);
    const handleBidAccepted = (acceptedBid) =>
      setBids(prev => prev.map(b => (b.id === acceptedBid.id ? acceptedBid : b)));
    const handleBidRejected = (rejectedBid) =>
      setBids(prev => prev.map(b => (b.id === rejectedBid.id ? rejectedBid : b)));

    // Notifications
    const handleNewNotification = (notif) => {
      console.log("Received new notification:", notif);
      setNotifications(prev => [notif, ...prev].slice(0, 20));
      setUnreadCount(c => c + 1);
    };

    socket.on("new-bid", handleNewBid);
    socket.on("bid-accepted", handleBidAccepted);
    socket.on("bid-rejected", handleBidRejected);
    socket.on("new-notification", handleNewNotification);

    // Join user room for notifications
    socket.emit("join-user-room", { userId: user?.id });

    return () => {
      socket.off("new-bid", handleNewBid);
      socket.off("bid-accepted", handleBidAccepted);
      socket.off("bid-rejected", handleBidRejected);
      socket.off("new-notification", handleNewNotification);
    };
  }, [socket, user]);

  // ----------------------------
  // Contact number validation
  // ----------------------------
  const validateContact = (value) => {
    if (!value.startsWith("9")) {
      toast.error("Contact number must start with 9");
      return;
    }
    if (value.length === 2 && !["8", "7"].includes(value[1])) {
      toast.error("Number must start with 98 or 97");
      return;
    }
    if (/^\d*$/.test(value)) {
      if (value.length > 10) {
        toast.error("Contact number cannot exceed 10 digits");
        return;
      }
      setContactNumber(value);
    } else {
      toast.error("Contact number must contain only digits");
    }
  };

  // ----------------------------
  // Booking handler
  // ----------------------------
  const handleBooking = async () => {
    if (!user) return toast.error("Please sign in to book this service.");
    if (!selectedDay || !selectedTime) return toast.error("Select day & time.");
    if (!contactNumber || contactNumber.length < 7) return toast.error("Please provide a valid contact number.");
    if (bidPrice && (!/^\d+$/.test(bidPrice) || bidPrice.length > 6))
      return toast.error("Bid price must be numeric and max 6 digits.");

    const loc = position || (customerLocation ? { latitude: customerLocation.lat, longitude: customerLocation.lon } : null);
    if (!loc || !loc.latitude || !loc.longitude) {
      return toast.error("Please allow location access or pick your location before booking.");
    }

    try {
      const payload = {
        serviceProviderServiceId: serviceDetail.id,
        serviceScheduleId: selectedTime.scheduleId,
        packageId: selectedPackage?.id || null,
        bidAmount: bidPrice ? parseInt(bidPrice) : null,
        contact_number: contactNumber,
        location: { lat: Number(loc.latitude), lng: Number(loc.longitude) },
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/booking/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Booking failed");

      // Join booking room
      if (socket && socket.emit && data?.data?.newBooking?.id) {
        socket.emit("join-booking-room", { bookingId: data.data.newBooking.id });
        socket.emit("join-user-room", { userId: user.id }); // user room for notifications
      }

      // If bid created
      if (data.data?.newBid) setBids(prev => [data.data.newBid, ...prev]);

      toast.success(`Booking placed. Price: Rs.${bidPrice || price}`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Booking failed");
    }
  };

  const isDisabled = !serviceDetail?.isAvailable || (distanceKm && serviceDetail.ServiceLocations.every(loc => distanceKm > loc.radius));

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="shadow-lg rounded-lg p-6 bg-white space-y-4 h-full">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Book this Service</h2>

        {distanceKm !== null && (
          <p className="text-sm text-gray-700 mb-2">
            Distance to provider: {distanceKm} km {isDisabled && "(Out of provider's service radius)"}
          </p>
        )}

        {/* Day Selection */}
        <div>
          <Label>Select Day</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {schedules.map((s) => (
              <Button key={s.scheduleId} variant={selectedDay === s.day ? "default" : "outline"} onClick={() => { setSelectedDay(s.day); setSelectedTime(""); }}>
                {s.day}
              </Button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        <div>
          <Label>Select Time Slot</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {schedules.filter(s => s.day === selectedDay).flatMap(s => {
              const startHour = parseInt(s.start_time.split(":")[0]);
              const endHour = parseInt(s.end_time.split(":")[0]);
              return Array.from({ length: endHour - startHour }, (_, i) => {
                const start = formatTime(`${startHour + i}:00:00`);
                const end = formatTime(`${startHour + i + 1}:00:00`);
                const slot = `${start} - ${end}`;
                return (
                  <Button key={`${s.scheduleId}-${i}`} variant={selectedTime?.slot === slot ? "default" : "outline"} onClick={() => setSelectedTime({ scheduleId: s.scheduleId, slot })}>
                    {slot}
                  </Button>
                );
              });
            })}
          </div>
        </div>

        {/* Contact */}
        <div>
          <Label>Contact Number</Label>
          <Input type="tel" value={contactNumber} onChange={(e) => validateContact(e.target.value)} placeholder="e.g. 98XXXXXXXX" className="mt-2" />
        </div>

        {/* Package Selection */}
        {packages.length > 0 && (
          <div>
            <Label>Select Package</Label>
            <Select onValueChange={(val) => setSelectedPackage(packages.find(p => String(p.id) === String(val)))}>
              <SelectTrigger className="w-full mt-2">
                <SelectValue placeholder="Choose a package" />
              </SelectTrigger>
              <SelectContent>
                {packages.map((pkg) => (
                  <SelectItem key={pkg.id} value={pkg.id}>
                    {pkg.name} - Rs.{pkg.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label>Price (Rs.)</Label>
          <Input value={price} readOnly className="mt-2" />
        </div>

        {/* Bid */}
        <div>
          <Label>Bid Your Price (Optional)</Label>
          <Input value={bidPrice} onChange={(e) => { const val = e.target.value; if (/^\d*$/.test(val) && val.length <= 6) setBidPrice(val); }} placeholder="Enter your bid (max 6 digits)" className="mt-2" />
        </div>

        <Button onClick={handleBooking} className={`w-full mt-4 py-2 rounded ${isDisabled ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 text-white"}`} disabled={isDisabled}>
          Confirm Booking
        </Button>
      </div>
    </>
  );
}
