"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchServices,
  addService,
  updateService,
  deleteService,
} from "@/app/redux/slices/categorySlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function ServiceList() {
  const dispatch = useDispatch();
  const { list, total, limit, offset, next, previous, loading, error } =
    useSelector((state) => state.category);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [editingService, setEditingService] = useState(null);
  const [editName, setEditName] = useState("");

  // Fetch services whenever page or search changes
  useEffect(() => {
    dispatch(fetchServices({ page, limit, search }));
  }, [dispatch, page, search]);

  // ---------------- Add Service ---------------- //
  const handleAddService = async () => {
    if (!newServiceName.trim()) return alert("Service name is required");
    await dispatch(addService({ name: newServiceName, package_enabled: false }));
    setNewServiceName("");
    setIsAddOpen(false);
    dispatch(fetchServices({ page, limit, search }));
  };

  // ---------------- Edit Service ---------------- //
  const startEdit = (service) => {
    setEditingService(service);
    setEditName(service.name);
  };

 const handleUpdate = async () => {
  if (!editName.trim()) return alert("Service name required");

  try {
    const response = await fetch("http://localhost:5000/api/admin/service/edit/" + editingService.id, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, package_enabled: editingService.package_enabled }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to update service");
    
    alert("Service updated successfully");
    dispatch(fetchServices({ page, limit, search }));

    
     
  } catch (err) {
    console.log("Error in handleUpdate:", err);
    alert("Something went wrong while updating the service.");
  }

  // Clear editing state
  setEditingService(null);
};


  // ---------------- Delete Service ---------------- //
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this service?")) {
      await dispatch(deleteService(id));
      dispatch(fetchServices({ page, limit, search }));
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 space-y-4">
      {/* Header & Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Services</h2>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              + Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
              <DialogDescription>
                Enter service name to add a new service
              </DialogDescription>
            </DialogHeader>
            <Input
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              placeholder="Service Name"
              className="my-3"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddService}>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Input
        placeholder="Search services..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {/* Loading / Error */}
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Service Table */}
      <table className="w-full border-collapse mt-4">
        <thead className="bg-green-50">
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Package Enabled</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map((service) => (
            <tr key={service.id} className="hover:bg-green-50">
              <td className="border p-2">{service.id}</td>

              {/* Name Column */}
              <td className="border p-2">
                {editingService?.id === service.id ? (
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                ) : (
                  service.name
                )}
              </td>

              {/* Package Enabled Column */}
              <td className="border p-2 text-center">
                {editingService?.id === service.id ? (
                  <Switch
                    checked={editingService.package_enabled}
                    onCheckedChange={(val) =>
                      setEditingService((prev) => ({
                        ...prev,
                        package_enabled: val,
                      }))
                    }
                  />
                ) : service.package_enabled ? (
                  "Enabled"
                ) : (
                  "Disabled"
                )}
              </td>

              {/* Actions */}
              <td className="border p-2 flex gap-2">
                {editingService?.id === service.id ? (
                  <>
                    <Button size="sm" onClick={handleUpdate}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingService(null)}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" onClick={() => startEdit(service)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(service.id)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-4">
          <Button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Prev
          </Button>
          <span>
            {page} / {totalPages}
          </span>
          <Button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
