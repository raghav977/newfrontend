"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Trash2 } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AddPackageModal({ open, onClose, serviceProviderServiceId, onPackageAdded }) {
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    includes: [""],
    note: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleIncludeChange = (index, value) => {
    const newIncludes = [...form.includes];
    newIncludes[index] = value;
    setForm({ ...form, includes: newIncludes });
  };

  const handleAddInclude = () => setForm({ ...form, includes: [...form.includes, ""] });
  const handleRemoveInclude = (index) => {
    const newIncludes = form.includes.filter((_, i) => i !== index);
    setForm({ ...form, includes: newIncludes });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("https://backendwala.onrender.com/api/packages/create", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, serviceProviderServiceId }),
      });

      if (!response.ok) {
        const resData = await response.json();
        throw new Error(resData.message || "Failed to create package");
      }

      const newPkg = await response.json();
      toast.success(`Package Added: ${newPkg.data.name}`, { position: "top-right" });
      setForm({ name: "", price: "", description: "", includes: [""], note: "" });
      onPackageAdded?.();
      onClose();
    } catch (err) {
      toast.error(err.message, { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <ToastContainer />
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md w-full">
          <DialogHeader className="flex justify-between items-center">
            <DialogTitle>Add Package</DialogTitle>
            <Button variant="outline" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="name" placeholder="Package Name" value={form.name} onChange={handleChange} required />
            <Input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required />
            <Textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
            
            <div>
              <label className="font-medium mb-1 block">Includes:</label>
              {form.includes.map((inc, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={inc}
                    onChange={(e) => handleIncludeChange(index, e.target.value)}
                    placeholder={`Include ${index + 1}`}
                    required
                  />
                  {form.includes.length > 1 && (
                    <Button type="button" variant="destructive" size="icon" onClick={() => handleRemoveInclude(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={handleAddInclude}>
                <Plus className="w-4 h-4 mr-1" /> Add Include
              </Button>
            </div>

            <Textarea name="note" placeholder="Note" value={form.note} onChange={handleChange} />

            <div className="flex justify-end gap-2 mt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Package"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
