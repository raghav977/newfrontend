"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Eye, Trash2, Package, Search, Edit2 } from "lucide-react";
import ServiceDetailModal from "./ServiceDetailModal";
import AddPackageModal from "./AddPackageModal";
import { fetchMyServicesTitleRate } from "@/app/redux/thunks/serviceThunks";
import { useRouter } from "next/navigation";
import AddService from "./AddService";

export default function MainServiceList() {
  const dispatch = useDispatch();
  const { list = [], loading, error, currentPage = 1, totalPages = 1 } = useSelector(
    (state) => state.servicesReal.myServices || {}
  );

  const router = useRouter();

  const [editingService, setEditingService] = useState(null);
const [isEditOpen, setIsEditOpen] = useState(false);


  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [addPackageOpen, setAddPackageOpen] = useState(false);
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const limit = 12;

  // UI state
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    dispatch(fetchMyServicesTitleRate({ limit, offset: (page - 1) * limit }));
  }, [dispatch, page]);

  // handlers
  const openView = (service) => {
    router.push(`/dashboard/provider-dashboard/services/service-detail/${service.id}`);
  };

  const openEdit = (service) => {
    router.push(`/dashboard/provider-dashboard/services/edit/${service.id}`);
  };

  const handleAddPackage = (service) => {
    setModalData(service);
    setAddPackageOpen(true);
  };

  const handleDelete = async (service) => {
    if (typeof window === 'undefined') return;
    const ok = window.confirm(`Delete service "${service?.Service?.name || "Service"}"? This cannot be undone.`);
    if (!ok) return;
    try {
      const response = await fetch(`https://backendwala.onrender.com/api/service-providers/services/${service.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        const txt = await response.text().catch(() => "");
        throw new Error(txt || "Failed to delete service");
      }
      toast({ title: "Deleted", description: "Service deleted successfully", variant: "success" });
      dispatch(fetchMyServicesTitleRate({ limit, offset: (page - 1) * limit }));
    } catch (err) {
      toast({ title: "Error", description: err.message || "Delete failed", variant: "destructive" });
    }
  };

  // client-side search / filter / sort for instant UX (backend still used for main fetch)
  const filtered = useMemo(() => {
    let items = Array.isArray(list) ? [...list] : [];
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter((s) => {
        const title = s.Service?.name || "";
        const desc = s.description || "";
        return title.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
      });
    }
    if (statusFilter !== "all") {
      items = items.filter((s) => String(s.status || "").toLowerCase() === statusFilter);
    }
    if (sortBy === "rate-asc") items.sort((a, b) => Number(a.rate || 0) - Number(b.rate || 0));
    if (sortBy === "rate-desc") items.sort((a, b) => Number(b.rate || 0) - Number(a.rate || 0));
    if (sortBy === "newest") items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return items;
  }, [list, query, statusFilter, sortBy]);

  const placeholderImage = "/images/service-placeholder.png";

  return (
    <main className="px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Search size={16} /></span>
            <input
              aria-label="Search services"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or description"
              className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 bg-white"
            aria-label="Filter by status"
          >
            <option value="all">All status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 bg-white"
            aria-label="Sort services"
          >
            <option value="newest">Newest</option>
            <option value="rate-desc">Rate: High → Low</option>
            <option value="rate-asc">Rate: Low → High</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => { setQuery(""); setStatusFilter("all"); setSortBy("newest"); }}>
            Reset
          </Button>
          <Button onClick={() => { setPage(1); dispatch(fetchMyServicesTitleRate({ limit, offset: 0 })); }} className="bg-green-600">
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-40 bg-slate-100" />
              <CardContent>
                <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-1/3 mb-3" />
                <div className="flex gap-2">
                  <div className="h-8 w-20 bg-slate-100 rounded" />
                  <div className="h-8 w-20 bg-slate-100 rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-600">
          <div className="mx-auto text-slate-400"><Package size={48} /></div>
          <p className="mt-4">No services found. Add your first service to get started.</p>
        </div>
      ) : (
        <>
          {/* grid updated to give more horizontal space per card on wider screens so buttons fit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {filtered.map((service) => {
              const img = service.ServiceImages?.[0]?.image_path || service.ServiceImages?.[0]?.image || placeholderImage;
              const status = String(service.status || "").toLowerCase();
              return (
                // make card a column flex so footer buttons are always visible;
                // set a min height so content doesn't collapse and buttons wrap on smaller screens
                <Card key={service.id} className="rounded-xl shadow hover:shadow-2xl transition-shadow overflow-hidden flex flex-col min-h-[380px]">
                  <div className="relative h-44 bg-slate-50 flex-shrink-0">
                    <img
                      src={img && String(img).startsWith("http") ? img : `http://localhost:5000${img}`}
                      alt={service.Service?.name || "service"}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute left-3 top-3 px-2 py-1 rounded text-xs font-semibold bg-white/90">
                      Rs. {Number(service.rate || 0).toFixed(0)}
                    </div>
                    <div className={`absolute right-3 top-3 px-2 py-1 rounded text-xs font-semibold ${status === "approved" ? "bg-emerald-100 text-emerald-800" : status === "pending" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}>
                      {status || "unknown"}
                    </div>
                  </div>

                  {/* CardContent grows to fill available vertical space so action row sits at bottom */}
                  <CardContent className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 pr-3">
                          <h3 className="text-lg font-semibold truncate">{service.Service?.name || "Untitled"}</h3>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{service.description || "No description provided."}</p>
                          <div className="flex flex-wrap gap-2 mt-3 text-xs">
                            {(service.ServiceLocations || []).slice(0, 2).map((loc, idx) => (
                              <span key={idx} className="px-2 py-1 bg-slate-100 rounded">{loc.city || loc.address || "Location"}</span>
                            ))}
                            {service.Service?.package_enabled && <span className="px-2 py-1 bg-blue-50 rounded">Packages</span>}
                          </div>
                        </div>

                        <div className="flex-shrink-0 text-right">
                          <div className="text-sm text-slate-500">Since</div>
                          <div className="text-sm font-medium">{service.createdAt ? new Date(service.createdAt).toLocaleDateString() : "N/A"}</div>
                        </div>
                      </div>
                    </div>

                    {/* action row: ensure buttons are visible and do not get clipped */}
                    <div className="mt-4 flex items-center gap-2 flex-wrap justify-end">
                      <Button size="sm" onClick={() => openView(service)} aria-label="View">
                        <Eye size={16} />
                        <span className="ml-2 hidden sm:inline">View</span>
                      </Button>

                      {/* <Button
                        size="sm"
                        onClick={() => {
                          setEditingService(service);  
                          setIsEditOpen(true);         
                        }}
                        aria-label="Edit"
                      >
                        <Edit2 size={16} />
                        <span className="ml-2 hidden sm:inline">Edit</span>
                      </Button> */}


                      {service.Service?.package_enabled && (
                        <Button size="sm" onClick={() => handleAddPackage(service)} aria-label="Package">
                          <Package size={16} />
                          <span className="ml-2 hidden sm:inline">Package</span>
                        </Button>
                      )}

                      <Button size="sm" variant="destructive" onClick={() => handleDelete(service)} aria-label="Delete">
                        <Trash2 size={16} />
                        <span className="ml-2 hidden sm:inline">Delete</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

                {
                  isEditOpen && (
                    <AddService
                      open={isEditOpen}
                      onOpenChange={setIsEditOpen}
                      editService={editingService} 
                    />

                  )
                }



          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-slate-600">Showing page {page} of {totalPages}</div>
            <div className="flex items-center gap-2">
              <Button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
              <div className="px-3 py-2 border rounded">{page}</div>
              <Button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
            </div>
          </div>
        </>
      )}

      <AddPackageModal open={addPackageOpen} onClose={() => setAddPackageOpen(false)} serviceProviderServiceId={modalData?.id} />
    </main>
  );
}