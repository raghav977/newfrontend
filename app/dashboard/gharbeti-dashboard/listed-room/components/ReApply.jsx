"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { fetchMyListedRooms } from "@/app/redux/slices/gharbetislice";
import { toast } from "sonner";

export default function ReapplyRoom({ room, open, onClose }) {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    location: "",
    price: "",
    benefits: "",
    note: "",
    contact: "",
    images: [],
  });

  useEffect(() => {
    if (room) {
      setFormData({
        location: room.location || "",
        price: room.price || "",
        benefits: room.benefits || "",
        note: room.note || "",
        contact: room.contact || "",
        images: room.images || [],
      });
    }
  }, [room]);

  const handleImageChange = (e) => {
    setFormData({ ...formData, images: Array.from(e.target.files) });
  };

  const handleSubmit = async () => {
    try {
      const form = new FormData();
      form.append("location", formData.location);
      form.append("price", formData.price);
      form.append("benefits", formData.benefits);
      form.append("note", formData.note);
      form.append("contact", formData.contact);
      formData.images.forEach((file) => {
        form.append("images", file);
      });

      const response = await fetch(`http://localhost:3024/room/reapply/${room.id}`, {
        method: "POST",
        credentials: "include",
        body: form,
      });

      if (!response.ok) throw new Error("Failed to reapply");

      const data = await response.json();
      console.log("Reapply response:", data);

      toast.success("Room reapplied successfully ✅");
      onClose();
      dispatch(fetchMyListedRooms()); // refresh after submit
    } catch (err) {
      console.error("Reapply failed:", err);
      toast.error("Reapply failed ❌");
    }
  };

  if (!room) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Reapply for {room.location}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
          <Input
            placeholder="Price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          />
          <Textarea
            placeholder="Benefits"
            value={formData.benefits}
            onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
          />
          <Textarea
            placeholder="Note"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          />
          <Input
            placeholder="Contact"
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
          />

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium mb-1">Upload Images</label>
            <Input type="file" multiple accept="image/*" onChange={handleImageChange} />
            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {formData.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.path ? img.path : URL.createObjectURL(img)}
                    alt={`preview-${idx}`}
                    className="w-full h-24 object-cover rounded-md border"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button className="bg-[#005caf] text-white" onClick={handleSubmit}>
            Submit Reapply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
