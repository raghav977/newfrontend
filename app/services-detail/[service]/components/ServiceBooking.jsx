"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MyMap from "../../../../components/map/LeafletMap";

import MapforService from "@/components/map/MapforService";

// Haversine formula: distance in km
export function getDistanceInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Format 24h time to 12h
const formatTime = (timeStr) => {
  const [hour, minute] = timeStr.split(":");
  let h = parseInt(hour);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${minute} ${ampm}`;
};

export default function ServiceBooking({ schedules = [], serviceDetail, user, socket, customerLocation }) {
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [price, setPrice] = useState(serviceDetail?.rate || 0);
  const [bidPrice, setBidPrice] = useState("");
  const [bids, setBids] = useState([]);
  const [distanceKm, setDistanceKm] = useState(null);
  const [position, setPosition] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [contactNumber, setContactNumber] = useState(user?.phone ?? "");

  const packages = serviceDetail?.Packages || [];

  // Calculate distance to nearest provider location
  useEffect(() => {
    if (customerLocation && serviceDetail?.ServiceLocations?.length > 0) {
      let minDistance = Infinity;
      serviceDetail.ServiceLocations.forEach((loc) => {
        const dist = getDistanceInKm(
          customerLocation.lat,
          customerLocation.lon,
          loc.latitude,
          loc.longitude
        );
        if (dist < minDistance) minDistance = dist;
      });
      setDistanceKm(minDistance.toFixed(1));
    }
  }, [customerLocation, serviceDetail]);

  useEffect(() => {
    // keep contact default from user if available
    if (user?.phone) setContactNumber(user.phone);
  }, [user]);

  const validateContact = (value) => {
    // allow only digits up to 10, show short errors via toast but still let user type

    if(!value.startsWith('9')){
      toast.error("Contact number must start with 9");
      return;
    }
    if(value.length==2 && value[1]!=='8' && value[1]!=='7'){
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

    // limit to 10 digits
    // give it to write but if the digit exceed ten digits then stop and give error
    

  };

  // Disable booking if out of radius or provider unavailable
  const isDisabled =
    !serviceDetail?.isAvailable ||
    (distanceKm &&
      serviceDetail.ServiceLocations.every((loc) => distanceKm > loc.radius));

  // Update price when package changes
  useEffect(() => {
    setPrice(selectedPackage?.price || serviceDetail?.rate || 0);
  }, [selectedPackage, serviceDetail]);

  // Handle current location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition({ latitude, longitude });
        toast.success("Location fetched successfully");
      },
      (err) => {
        console.error(err);
        toast.error("Failed to fetch location");
      }
    );
  };

  const [serviceLocation, setServiceLocation] = useState(null);

  const handleSaveLocation = (location) => {
    if (!location) return toast.error("No location selected");
    setPosition({ latitude: location.latitude, longitude: location.longitude });
    setShowMap(false);
    toast.success("Service area saved");
  };

  // Pick location from map
  const handlePickFromMap = () => {
    setShowMap(!showMap);
  };

  // WebSocket listeners
  useEffect(() => {
    if (!socket) return;
    socket.on("new-bid", (newBid) => setBids((prev) => [...prev, newBid]));
    socket.on("bid-accepted", (acceptedBid) =>
      setBids((prev) => prev.map((b) => (b.id === acceptedBid.id ? acceptedBid : b)))
    );
    socket.on("bid-rejected", (rejectedBid) =>
      setBids((prev) => prev.map((b) => (b.id === rejectedBid.id ? rejectedBid : b)))
    );
    return () => {
      socket.off("new-bid");
      socket.off("bid-accepted");
      socket.off("bid-rejected");
    };
  }, [socket]);

  const handleBooking = async () => {
    if (!user) return toast.error("Please sign in to book this service.");
    if (!selectedDay || !selectedTime) return toast.error("Select day & time.");
    if (isDisabled) return toast.error("Service provider unavailable at your location.");
    if (bidPrice && (!/^\d+$/.test(bidPrice) || bidPrice.length > 6))
      return toast.error("Bid price must be numeric and max 6 digits.");
    if (!contactNumber || contactNumber.length < 7)
      return toast.error("Please provide a valid contact number.");

    // prefer explicit position (user-picked/current), fallback to customerLocation prop
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
        contactNumber: contactNumber,
        location: {
          lat: Number(loc.latitude),
          lng: Number(loc.longitude),
        },
      };
      const response = await fetch("http://localhost:5000/api/booking/create", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Booking failed");

      if (socket && socket.emit && data?.data?.newBooking?.id) {
        socket.emit("join-booking-room", { bookingId: data.data.newBooking.id });
      }
      if (data.data?.newBid) setBids((prev) => [...prev, data.data.newBid]);

      toast.success(`Booking placed. Price: Rs.${bidPrice || price}`);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Booking failed");
    }
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="shadow-lg rounded-lg p-6 bg-white space-y-4 h-full">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Book this Service</h2>

        {/* Distance Display */}
        {distanceKm !== null && (
          <p className="text-sm text-gray-700 mb-2">
            Distance to provider: {distanceKm} km
            {isDisabled && " (Out of provider's service radius)"}
          </p>
        )}

        {/* Day Selection */}
        <div>
          <Label>Select Day</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {schedules.map((s) => (
              <Button
                key={s.scheduleId}
                variant={selectedDay === s.day ? "default" : "outline"}
                onClick={() => {
                  setSelectedDay(s.day);
                  setSelectedTime("");
                }}
              >
                {s.day}
              </Button>
            ))}
          </div>
        </div>

        {/* Time Slot Selection */}
        <div>
          <Label>Select Time Slot</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {schedules
              .filter((s) => s.day === selectedDay)
              .flatMap((s) => {
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

        {/* contact number */}
        <div>
          <Label>Contact Number</Label>
          <Input
            type="tel"
            value={contactNumber}
            onChange={(e) => validateContact(e.target.value)}
            className="mt-2"
            placeholder="e.g. 98XXXXXXXX"
          />
        </div>

        {/* Package Selection */}
        {packages.length > 0 && (
          <div>
            <Label>Select Package</Label>
            <Select onValueChange={(val) => setSelectedPackage(packages.find((p) => String(p.id) === String(val)))}>
              <SelectTrigger className="w-full mt-2">
                <SelectValue placeholder="Choose a package" />
              </SelectTrigger>
              <SelectContent>
                {packages.map((pkg, idx) => (
                  <SelectItem key={idx} value={pkg.id}>
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

        {/* Bid */}
        <div>
          <Label>Bid Your Price (Optional)</Label>
          <Input
            value={bidPrice}
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d*$/.test(val) && val.length <= 6) setBidPrice(val);
            }}
            placeholder="Enter your bid (max 6 digits)"
            className="mt-2"
          />
        </div>

        <Button
          onClick={handleBooking}
          className={`w-full mt-4 py-2 rounded ${
            isDisabled
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
          disabled={isDisabled}
        >
          Confirm Booking
        </Button>
      </div>
    </>
  );
}