"use client";

import React, { useEffect, useState } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus, Check, X } from "lucide-react";

export default function ServiceList() {
  const dispatch = useDispatch();
  const { list = [], total = 0, limit = 10, offset = 0, loading = false, error = null } =
    useSelector((state) => state.category || {});

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");

  // edit dialog state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPackageEnabled, setEditPackageEnabled] = useState(false);

  useEffect(() => {
    dispatch(fetchServices({ page, limit, search }));
  }, [dispatch, page, search, limit]);

  // ---------------- Add Service ---------------- //
  const handleAddService = async () => {
    const name = (newServiceName || "").trim();
    if (!name) return alert("Service name is required");
    await dispatch(addService({ name, package_enabled: false }));
    setNewServiceName("");
    setIsAddOpen(false);
    dispatch(fetchServices({ page, limit, search }));
  };

  // ---------------- Edit Service ---------------- //
  const startEdit = (service) => {
    setEditingService(service);
    setEditName(service.name || "");
    setEditPackageEnabled(Boolean(service.package_enabled));
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    const name = (editName || "").trim();
    if (!name) return alert("Service name required");
    try {
      // prefer slice action if exists, fallback to direct API
      if (updateService) {
        await dispatch(updateService({ id: editingService.id, name, package_enabled: editPackageEnabled }));
      } else {
        const response = await fetch("http://localhost:5000/api/admin/service/edit/" + editingService.id, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, package_enabled: editPackageEnabled }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || "Failed to update service");
        alert("Service updated successfully");
      }
      setIsEditOpen(false);
      setEditingService(null);
      dispatch(fetchServices({ page, limit, search }));
    } catch (err) {
      console.error(err);
      alert("Something went wrong while updating the service.");
    }
  };

  // ---------------- Delete Service ---------------- //
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      if (deleteService) {
        await dispatch(deleteService(id));
      } else {
        await fetch(`http://localhost:5000/api/admin/service/delete/${id}`, { method: "DELETE", credentials: "include" });
      }
      dispatch(fetchServices({ page, limit, search }));
    } catch (err) {
      console.error("delete error", err);
      alert("Delete failed");
    }
  };

  const totalPages = Math.max(1, Math.ceil((total || list.length) / limit));

  return (
    <div className="">
      <Card>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Services</h2>
              <p className="text-sm text-slate-500 mt-1">Manage services offered on the platform.</p>
            </div>

            <div className="flex items-center gap-3">
              <Input
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />

              {/* Add dialog */}
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Service
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Service</DialogTitle>
                    <DialogDescription>Enter service name to add a new service</DialogDescription>
                  </DialogHeader>

                  <div className="mt-3">
                    <Input
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      placeholder="Service Name"
                    />
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddService}>Save</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-4">
        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading services...</div>
        ) : error ? (
          <div className="text-red-600 py-4">{error}</div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-md shadow-sm">
            <table className="min-w-full divide-y">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Package</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-600">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {list.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-700">{service.id}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{service.name}</td>
                    <td className="px-4 py-3 text-sm">
                      {service.package_enabled ? (
                        <Badge className="bg-emerald-100 text-emerald-800">Enabled</Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-700">Disabled</Badge>
                      )}
                    </td>

                    <td className="px-4 py-3 text-sm text-right">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(service)}
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(service.id)}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
              <div className="text-sm text-slate-600">
                Showing page {page} of {totalPages}
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
                <div className="px-3 py-1 border rounded bg-white">{page}</div>
                <Button size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={(v) => { if (!v) { setIsEditOpen(false); setEditingService(null); } else setIsEditOpen(v); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>Update allowed fields for this service</DialogDescription>
          </DialogHeader>

          <div className="mt-3 space-y-3">
            <label className="text-sm text-slate-600">Service Name</label>
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} />

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm text-slate-600">Package Enabled</label>
                <div className="text-xs text-slate-500">Toggle to enable packages for this service</div>
              </div>
              <Switch checked={editPackageEnabled} onCheckedChange={(v) => setEditPackageEnabled(Boolean(v))} />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => { setIsEditOpen(false); setEditingService(null); }}>
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
            <Button onClick={handleUpdate} className="bg-green-600 hover:bg-green-700 text-white">
              <Check className="w-4 h-4 mr-1" /> Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
