"use client"
import { useState } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Upload, X } from "lucide-react"
import { useDispatch } from "react-redux"
import { fetchMyListedRooms } from "@/app/redux/slices/gharbetislice"

const FormField = ({ label, children, required = false }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">
      {label}
      {required && <span className="text-red-500">*</span>}
    </Label>
    {children}
  </div>
)

export default function AddRoom() {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    images: [],
    name: "",
    location: "",
    price: "",
    description: "",
    availability_status: false,
    note: "",
  })

  const [imagePreviews, setImagePreviews] = useState([])

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    handleChange("images", files)
    const previews = files.map((file) => URL.createObjectURL(file))
    setImagePreviews(previews)
  }

  const removeImage = (index) => {
    const newPreviews = imagePreviews.filter((_, i) => i !== index)
    const newFiles = Array.from(form.images).filter((_, i) => i !== index)
    setImagePreviews(newPreviews)
    handleChange("images", newFiles)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();

      form.images.forEach((file) => {
        formData.append("images", file);
      });

      formData.append("name", form.name);
      formData.append("location", form.location);
      formData.append("price", form.price);
      formData.append("description", form.description);
      formData.append("availability_status", form.availability_status ? "1" : "0");
      formData.append("note", form.note);

      const res = await fetch("http://localhost:5000/api/rooms/create", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        alert("Room added successfully!");
        dispatch(fetchMyListedRooms());
      } else {
        alert(data.message || "Failed to add room");
      }
    } catch (err) {
      alert("Something went wrong while submitting");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus className="h-4 w-4" /> Add Room
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto p-0 rounded-xl border-0 shadow-xl">
        <div className="p-6 border-b border-gray-100">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">Add New Room</DialogTitle>
            <p className="text-sm text-gray-500 mt-1">Fill in the details to list your room</p>
          </DialogHeader>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField label="Room Images" required>
              <div className="space-y-3">
                <div className="relative">
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload images</span>
                    <span className="text-xs text-gray-400">PNG, JPG up to 10MB each</span>
                  </label>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {imagePreviews.map((src, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={src || "/placeholder.svg"}
                          alt={`preview-${idx}`}
                          className="w-full h-20 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormField>

            <FormField label="Room Name" required>
              <Input
                type="text"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="e.g., Deluxe Room"
                required
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <FormField label="Location" required>
                <Input
                  type="text"
                  value={form.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="e.g., Kathmandu, Thamel"
                  required
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </FormField>

              <FormField label="Price (NPR)" required>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  placeholder="e.g., 15000"
                  required
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </FormField>
            </div>

            <FormField label="Description" required>
              <Textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Describe the room, amenities, etc."
                rows={3}
                required
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
              />
            </FormField>

            <FormField label="Availability Status">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Checkbox
                  checked={form.availability_status}
                  onCheckedChange={(val) => handleChange("availability_status", val)}
                  className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">Room is available</span>
                  <p className="text-xs text-gray-500">Check if the room is currently available for rent</p>
                </div>
              </div>
            </FormField>

            <FormField label="Additional Notes">
              <Textarea
                value={form.note}
                onChange={(e) => handleChange("note", e.target.value)}
                placeholder="Any additional information about the room..."
                rows={3}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Submit Room Listing
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}