import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Eye, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import PendingRoomModal from "./PendingRoomModal"; 
export default function PendingRoomList({ list, onApprove, onReject }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewRoom, setViewRoom] = useState(null); 


  const handleApprove = async (id) => {
  alert("This is the id: " + id);

  try {
    const response = await fetch(`http://localhost:3024/admin/approve-room/${id}`, {
      method: "POST",
      credentials: "include",
    });

    // check HTTP status here
    if (!response.ok) {
      console.error("Something went wrong, status:", response.status);
      return;
    }

    const data = await response.json();
    console.log("Everything went good", data);

    // Optionally show success feedback
    alert("Room approved successfully!");
  } catch (err) {
    console.error("Error approving room:", err);
  }
};

  const filteredList = useMemo(() => {
    if (!searchTerm) return list;
    return list.filter((room) =>
      room.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (room.contact && room.contact.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (room.note && room.note.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [list, searchTerm]);

  const handleReject = async (room) => {
  const reason = prompt("Enter rejection message:", "");
  if (!reason) return; // if user cancels

  try {
    const response = await fetch(`http://localhost:3024/admin/reject-room/${room.id}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }), 
    });

    const data = await response.json();
    console.log("Response from server:", data);

    if (response.ok) {
      alert(`Room ${room.id} rejected successfully!`);
    } else {
      alert(`Failed to reject room: ${data.message || "Unknown error"}`);
    }
  } catch (err) {
    console.error("Error rejecting room:", err);
    alert("Something went wrong. Check console.");
  }
};


  return (
    <div className="mt-4 space-y-4">
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by location, contact or note..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Pending Rooms List */}
      {filteredList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((room) => (
            <Card key={room.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{room.location}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">Price: NPR {room.price}</p>
                {room.note && <p className="text-sm text-muted-foreground">Note: {room.note}</p>}
                <p className="text-sm text-muted-foreground">Contact: {room.contact}</p>
                <p className='text-sm text-muted-foreground'>Kyc_verified:{room.Gharbeti.is_verified? 'Yes':'No'} </p>
                
                {room.rejectionMessage && (
                  <p className="text-sm text-red-600 font-medium">
                    Rejection Message: {room.rejectionMessage}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-2">
                  {/* View Button */}
                  <Button
                    variant="light"
                    size="sm"
                    className="flex-1 flex items-center justify-center gap-1"
                    onClick={() => setViewRoom(room)}
                  >
                    <Eye className="w-4 h-4" /> View
                  </Button>

                  {/* Approve Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 flex items-center justify-center gap-1"
                    onClick={() => handleApprove(room.id)}
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </Button>

                  {/* Reject Button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1 flex items-center justify-center gap-1"
                    onClick={() => handleReject(room)}
                  >
                    <AlertCircle className="w-4 h-4" /> Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">No pending rooms found.</div>
      )}

      {/* Room Detail Modal */}
      {viewRoom && (
        <PendingRoomModal
          room={viewRoom}
          open={!!viewRoom}
          onClose={() => setViewRoom(null)}
        />
      )}
    </div>
  );
}
