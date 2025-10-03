"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Format time helper
const formatTime = (timeStr) => {
  const [hour, minute] = timeStr.split(":");
  let h = parseInt(hour);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${h}:${minute} ${ampm}`;
};

export default function ServiceBooking({ schedules = [], serviceDetail, user, socket }) {
  console.log("THis is schedules",schedules)
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [price, setPrice] = useState(serviceDetail?.rate || 0);
  const [bidPrice, setBidPrice] = useState("");
  const [bids, setBids] = useState([]);

  const packages = serviceDetail?.Packages || [];

  // Reset price when package changes
  useEffect(() => {
    if (selectedPackage) setPrice(selectedPackage.price);
    else setPrice(serviceDetail?.rate || 0);
  }, [selectedPackage, serviceDetail]);

  // WebSocket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on("new-bid", (newBid) => setBids(prev => [...prev, newBid]));
    socket.on("bid-accepted", (acceptedBid) => setBids(prev => prev.map(b => b.id === acceptedBid.id ? acceptedBid : b)));
    socket.on("bid-rejected", (rejectedBid) => setBids(prev => prev.map(b => b.id === rejectedBid.id ? rejectedBid : b)));

    return () => {
      socket.off("new-bid");
      socket.off("bid-accepted");
      socket.off("bid-rejected");
    };
  }, [socket]);


  useEffect(()=>{
    console.log("Bids updated:", bids);
  },[bids])
 

  const handleBooking = async () => {
  if (!user) return toast.error("Please sign in to book this service.");
  if (!selectedDay || !selectedTime) return toast.error("Please select both day and time.");
  if (bidPrice && (!/^\d+$/.test(bidPrice) || bidPrice.length > 6)) {
    return toast.error("Bid price must be numeric and max 6 digits.");
  }

  try {
    // console.log("The data to be sent as a payload are");
    const payload = {
      serviceProviderServiceId: serviceDetail.id,
      serviceScheduleId: selectedTime.scheduleId,
      packageId: selectedPackage?.id || null,
      bidAmount: bidPrice ? parseInt(bidPrice) : null,
    };
    console.log("The payload is:", payload);
    const response = await fetch("http://localhost:5000/api/booking/create", {
      method: "POST",
      credentials: "include",
      headers: {
    "Content-Type": "application/json", 
  },
      body: JSON.stringify({
        serviceProviderServiceId: serviceDetail.id,
        serviceScheduleId: selectedTime.scheduleId,
        packageId: selectedPackage?.id || null,
        bidAmount: bidPrice ? parseInt(bidPrice) : null,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Booking failed");

    console.log("Booking response data:", data);

    // Join booking room immediately
    socket.emit("join-booking-room", { bookingId: data.data.newBooking.id });

    // If API returned a bid, update UI
    if (data.data.newBid) {
      setBids(prev => [...prev, data.data.newBid]);
    }

    toast.success(`Booking placed. Price: Rs.${bidPrice || price}`);
  } catch (err) {
    console.error(err);
    toast.error(err.message);
  }
};



  const handleBidAction = (bid, action) => {
    if (!socket) return;
    socket.emit(action === "accept" ? "accept-bid" : "reject-bid", {
      bidId: bid.id,
      bookingId: serviceDetail.id,
    });
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="shadow-lg rounded-lg p-6 bg-white space-y-4">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Book this Service</h2>

        {/* Day Selection */}
        <div>
          <Label>Select Day</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {schedules.map((schedule, idx) => (
              <Button
                key={schedule.id}
                variant={selectedDay === schedule.day ? "default" : "outline"}
                onClick={() => {
                  setSelectedDay(schedule.day);
                  setSelectedTime("");
                }}
              >
                {schedule.day}
              </Button>
            ))}
          </div>
        </div>

        {/* Time Slot Selection */}
        <div>
  <Label>Select Time Slot</Label>
  <div className="grid grid-cols-2 gap-2 mt-2">
    {schedules
      .filter(s => s.day === selectedDay)
      .flatMap(s => {
        const startHour = parseInt(s.start_time.split(":")[0]);
        const endHour = parseInt(s.end_time.split(":")[0]);

        return Array.from({ length: endHour - startHour }, (_, i) => {
          const start = formatTime(`${startHour + i}:00:00`);
          const end = formatTime(`${startHour + i + 1}:00:00`);
          const slot = `${start} - ${end}`;

          return (
            <Button
              key={`${s.scheduleId}-${i}`}
              variant={selectedTime?.slot === slot ? "default" : "outline"}
              onClick={() => setSelectedTime({ scheduleId: s.scheduleId, slot })}
            >
              {slot}
            </Button>
          );
        });
      })}
  </div>
</div>

        

        {/* Package Selection */}
        {packages.length > 0 && (
          <div>
            <Label>Select Package</Label>
            <Select onValueChange={(val) => setSelectedPackage(packages.find(p => p.name === val))}>
              <SelectTrigger className="w-full mt-2">
                <SelectValue placeholder="Choose a package" />
              </SelectTrigger>
              <SelectContent>
                {packages.map((pkg, idx) => (
                  <SelectItem key={idx} value={pkg.name}>
                    {pkg.name} - Rs.{pkg.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Price */}
        <div>
          <Label>Price (Rs.)</Label>
          <Input value={price} readOnly className="mt-2" />
        </div>

        {/* Bid Input */}
        <div>
          <Label>Bid Your Price (Optional)</Label>
          <Input
            value={bidPrice}
            onChange={e => {
              const val = e.target.value;
              if (/^\d*$/.test(val) && val.length <= 6) setBidPrice(val);
            }}
            placeholder="Enter your bid (max 6 digits)"
            className="mt-2"
          />
        </div>

        <Button onClick={handleBooking} className="w-full bg-green-600 hover:bg-green-700 text-white mt-4">
          Confirm Booking
        </Button>

        {/* Existing Bids */}
        {/* {bids.length > 0 && (
          <div className="mt-6 space-y-2">
            <h3 className="font-semibold text-lg">Current Bids</h3>
            {bids.map((bid) => (
              <div key={bid.id} className="flex justify-between items-center p-2 border rounded">
                <span>Rs. {bid.bidAmount} ({bid.status})</span>
                {user?.id === serviceDetail.serviceProviderId && bid.status === "pending" && (
                  <div className="space-x-2">
                    <Button size="sm" onClick={() => handleBidAction(bid, "accept")}>
                      Accept
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleBidAction(bid, "reject")}>
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )} */}
      </div>
    </>
  );
}
