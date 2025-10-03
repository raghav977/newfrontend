"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyListedRooms, fetchMyRooms } from "@/app/redux/slices/gharbetislice";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Reapply from "./ReApply"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, CheckCircle, Clock, AlertCircle, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ViewRoomModal } from "@/app/dashboard/gharbeti-dashboard/listed-room/components/ViewRoomModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function MyRoomsList() {
  const dispatch = useDispatch();
  const { rooms, loading, error } = useSelector((state) => state.gharbeti);

  const [viewRoom, setViewRoom] = useState(null);
  const [availabilityState, setAvailabilityState] = useState({});
  const [reapplyRoom, setReapplyRoom] = useState(null); 
  const [formData, setFormData] = useState({}); 

  useEffect(() => {
    dispatch(fetchMyRooms());
  }, [dispatch]);

  useEffect(() => {
    if (rooms) {
      const initialAvailability = {};
      rooms.forEach((room) => {
        initialAvailability[room.id] = room.availability;
      });
      setAvailabilityState(initialAvailability);
    }
  }, [rooms]);

  const handleAvailabilityToggle = (roomId, newAvailability) => {
    setAvailabilityState((prev) => ({ ...prev, [roomId]: newAvailability }));
    console.log(`Room ${roomId} availability set to: ${newAvailability}`);
    // 🔥 TODO: call API to update availability
  };

  const handleReapplyOpen = (room) => {
    setReapplyRoom(room);
    setFormData({
      location: room.location || "",
      price: room.price || "",
      benefits: room.benefits || "",
      note: room.note || "",
      contact: room.contact || "",
    });
  };

  const handleReapplySubmit = async () => {
    console.log("Submitting reapply with data:", formData);

    try {
      const response = await fetch(`http://localhost:3024/room/reapply/${reapplyRoom.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      console.log("Reapply response:", data);

      setReapplyRoom(null);
      dispatch(fetchMyListedRooms()); // refresh list
    } catch (err) {
      console.error("Reapply failed:", err);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      approved: {
        class: "bg-green-100 text-green-700 border-green-200",
        icon: <CheckCircle className="h-3 w-3 mr-1" />,
        label: "Approved",
      },
      pending: {
        class: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: <Clock className="h-3 w-3 mr-1" />,
        label: "Pending",
      },
      rejected: {
        class: "bg-red-100 text-red-700 border-red-200",
        icon: <AlertCircle className="h-3 w-3 mr-1" />,
        label: "Rejected",
      },
    };
    const v = variants[status] || {
      class: "bg-muted text-muted-foreground border-border",
      label: status,
    };
    return (
      <Badge className={`flex items-center ${v.class}`}>
        {v.icon}
        {v.label}
      </Badge>
    );
  };

  if (loading) return <p>Loading rooms...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <main className="px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms && rooms.length > 0 ? (
          rooms.map((room) => (
            <Card key={room.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{room.location}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      Price: NPR {room.price}
                    </CardDescription>
                  </div>
                  {getStatusBadge(room.status)}
                </div>
              </CardHeader>

              <CardContent>
                {room.images && room.images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto mb-2">
                    {room.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img.path || "/placeholder.svg"}
                        alt={`room-${room.id}-${idx}`}
                        className="w-20 h-20 object-cover rounded-md border"
                      />
                    ))}
                  </div>
                )}

                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{room.benefits}</p>
                {room.note && <p className="text-xs text-muted-foreground mb-2">Note: {room.note}</p>}
                <p className="text-xs text-muted-foreground mb-2">Contact: {room.contact}</p>

                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row md:items-center md:gap-2 pt-2 border-t border-border mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => setViewRoom(room)}
                  >
                    <Eye className="h-3 w-3 mr-1" /> View
                  </Button>

                  {room.status === "rejected" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => handleReapplyOpen(room)}
                    >
                      <Edit className="h-3 w-3 mr-1" /> Reapply
                    </Button>
                  )}

                  <Button variant="ghost" size="sm" className="h-8 px-2">
                    <Edit className="h-3 w-3 mr-1" /> Edit
                  </Button>

                  <div className="flex items-center gap-2 mt-2 md:mt-0">
                    <span className="text-xs text-muted-foreground">Available:</span>
                    <Switch
                      checked={availabilityState[room.id] || false}
                      onCheckedChange={(checked) => handleAvailabilityToggle(room.id, checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center col-span-full py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Eye className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No rooms listed yet</h3>
            <p className="text-muted-foreground mb-4">Add your rooms to start listing them here.</p>
          </div>
        )}
      </div>

      {/* ViewRoomModal */}
      {viewRoom && (
        <ViewRoomModal
          open={!!viewRoom}
          onOpenChange={() => setViewRoom(null)}
          service={viewRoom}
          loading={false}
          error={null}
        />
      )}

      
      {reapplyRoom && (
        <Reapply
    room={reapplyRoom}
    open={!!reapplyRoom}
    onClose={() => setReapplyRoom(null)}
  />
      )}
    </main>
  );
}
