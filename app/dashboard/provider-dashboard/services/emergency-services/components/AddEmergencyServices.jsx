"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyServices } from "@/app/redux/slices/serviceSlice";

// Reusable Input Field Component
const FormField = ({ label, children }) => (
  <div className="flex flex-col gap-1">
    <Label className="text-green-700">{label}</Label>
    {children}
  </div>
);

export default function AddEmergencyServices() {
  const dispatch = useDispatch();
  const servicesList = useSelector((state) => state.service.list?.data || []);

  const [form, setForm] = useState({
    rate: "",
    location: "",
    serviceId: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchMyServices());
  }, [dispatch]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { rate, location, serviceId } = form;

    if (!rate || !location || !serviceId) {
      alert("Please fill all fields and select a service");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        rate: parseFloat(rate),
        location,
        serviceId: parseInt(serviceId),
      };

      const response = await fetch(
        "http://localhost:3024/emergency/add-emergency/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to save");

      alert(data.message || "Emergency service saved ✅");
      setForm({ rate: "", location: "", serviceId: "" });
    } catch (err) {
      console.error(err);
      alert(err.message || "Error saving emergency service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Emergency Service
        </Button>
      </DialogTrigger>

      <DialogContent className="!w-[95vw] !max-w-2xl max-h-[90vh] overflow-y-auto p-8 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-green-800">
            Add New Emergency Service
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <FormField label="Select Service">
            <Select
              value={form.serviceId}
              onValueChange={(val) => handleChange("serviceId", val)}
            >
              <SelectTrigger className="w-full border-green-200 focus:border-green-500">
                <SelectValue placeholder="Choose a service" />
              </SelectTrigger>
              <SelectContent>
                {servicesList.length > 0 ? (
                  servicesList.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>
                      {s.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled>No services available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Rate (NPR)/hour">
            <Input
              type="number"
              placeholder="Enter hourly rate"
              value={form.rate}
              onChange={(e) => handleChange("rate", e.target.value)}
              className="border-green-200 focus:border-green-500"
              required
            />
          </FormField>

          <FormField label="Service Location">
            <Input
              placeholder="Enter location"
              value={form.location}
              onChange={(e) => handleChange("location", e.target.value)}
              className="border-green-200 focus:border-green-500"
              required
            />
          </FormField>

          <div className="flex justify-end gap-3">
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? "Saving..." : "Save Emergency Service"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
