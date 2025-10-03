"use client"

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyRooms } from "@/app/redux/slices/gharbetislice";

export default function RentedList() {
  const dispatch = useDispatch();
const { rooms, loading, error } = useSelector((state) => state.gharbeti);


  useEffect(() => {
    dispatch(fetchMyRooms("rented")); // fetch rented rooms 
  }, [dispatch]);

  if (loading) return <p>Loading rented rooms...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (rooms.length === 0) return <p>No rented rooms found.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {rooms.map((room) => (
        <div key={room.id} className="border rounded-md p-4 shadow-sm">
          <h3 className="font-bold text-lg">{room.location}</h3>
          <p><strong>Price:</strong> NPR {room.price}</p>
          <p><strong>Contact:</strong> {room.contact}</p>
          {room.note && <p><strong>Note:</strong> {room.note}</p>}
          <p><strong>Status:</strong> {room.status}</p>
        </div>
      ))}
    </div>
  );
}
