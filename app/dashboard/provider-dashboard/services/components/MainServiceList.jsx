"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Trash2 } from "lucide-react";
import ServiceDetailModal from "./ServiceDetailModal";
import AddPackageModal from "./AddPackageModal";
import AddImageModal from "./AddImageModal";
import { useToast } from "@/components/ui/use-toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyServicesTitleRate } from "@/app/redux/thunks/serviceThunks";

export default function MainServiceList() {
  const dispatch = useDispatch();
  const { list, loading, error, currentPage, totalPages } = useSelector(
    (state) => state.servicesReal.myServices
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [addImageOpen, setAddImageOpen] = useState(false);
  const [addPackageOpen, setAddPackageOpen] = useState(false);
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const limit  = 10;

  useEffect(() => {
    dispatch(fetchMyServicesTitleRate({ limit, offset: (page - 1) * limit }));
  }, [page]);

  const handleView = (service) => {
    setModalData(service);
    setModalOpen(true);
  };

  const handleAddImage = (service) => {
    setModalData(service);
    setAddImageOpen(true);
  };

  const handleAddPackage = (service) => {
    setModalData(service);
    setAddPackageOpen(true);
  };

  const handleDelete = async (service) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/service-providers/services/${service.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete service");
      toast({ title: "Deleted", description: "Service deleted successfully", variant: "success" });
      dispatch(fetchMyServicesTitleRate({ limit, offset: (page - 1) * limit }));
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const onUpload = async (file) => {
    if (!modalData) return;
    const formData = new FormData();
    formData.append("images", file);
    try {
      const response = await fetch(
        `http://localhost:5000/api/service-providers/services/${modalData.id}/upload`,
        { method: "POST", body: formData, credentials: "include" }
      );
      if (!response.ok) throw new Error("Failed to upload image");
      toast({ title: "Success", description: "Image uploaded successfully", variant: "success" });
      dispatch(fetchMyServicesTitleRate({ limit, offset: (page - 1) * limit }));
    } catch (err) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <main className="px-6 py-8">
      {loading && <p>Loading services...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {list.map((service) => (
          <Card key={service.id} className="rounded-xl shadow-lg border border-green-100 bg-white hover:shadow-2xl transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg font-bold">{service.Service?.name || "Service"}</CardTitle>
              <CardDescription>Rate: Rs.{service.rate}</CardDescription>
              <CardDescription>Status: {service.status}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {service.ServiceLocations?.map(loc => (
                <div key={loc.id} className="flex items-center gap-1 text-sm">
                  {loc.address}, {loc.city || "N/A"}
                </div>
              ))}

              <div className="flex flex-wrap gap-2 mt-2">
                <Button size="sm" onClick={() => handleView(service)}>View</Button>
                <Button size="sm" onClick={() => handleAddImage(service)}>Add Image</Button>

                {/* Conditionally render Add Package button */}
                {service.Service?.package_enabled && (
                  <Button size="sm" variant="outline" onClick={() => handleAddPackage(service)}>Add Package</Button>
                )}

                <Button size="sm" variant="destructive" onClick={() => handleDelete(service)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-6">
        <Button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>
        <span>Page {page} of {totalPages}</span>
        <Button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
      </div>

      {/* Modals */}
      <ServiceDetailModal open={modalOpen} onOpenChange={setModalOpen} service={modalData} />
      <AddImageModal open={addImageOpen} onClose={() => setAddImageOpen(false)} serviceId={modalData?.id} onUpload={onUpload} />
      <AddPackageModal open={addPackageOpen} onClose={() => setAddPackageOpen(false)} serviceProviderServiceId={modalData?.id} />
    </main>
  );
}
