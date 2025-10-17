"use client";

import React, { useEffect, useState, useMemo } from "react";
import { fetchServices } from "@/app/redux/slices/categorySlice";
import { fetchServiceByStatus } from "@/app/redux/slices/serviceSlice";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

const BASE_URL = "http://localhost:5000";

export default function PendingList() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { list, total = 0, loading, error } = useSelector((state) => state.service);
  const categories = useSelector((state) => state.category.list) || [];
  const servicesList = list?.results || [];

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("pending");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [showKycModal, setShowKycModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // view modal state left in file but not used when navigating to detail page
  const [viewOpen, setViewOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewError, setViewError] = useState(null);
  const [serviceDetail, setServiceDetail] = useState(null);

  useEffect(() => {
    dispatch(fetchServices());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchServiceByStatus({ status: selectedStatus, limit, offset: (page - 1) * limit }));
  }, [dispatch, page, limit, selectedStatus]);

  // navigate to service detail page (service-detail/:id)
  const openDetails = (id) => {
    const svcId = id || "";
    if (!svcId) return;
    router.push(`/dashboard/admin-dashboard/service-detail/${svcId}`);
  };

  const closeDetails = () => {
    setViewOpen(false);
    setServiceDetail(null);
    setViewError(null);
  };

  // verify service (approve/reject)
  const handleVerifyService = async (serviceId, action, rejectionReasonParam = "") => {
    try {
      const response = await fetch(`${BASE_URL}/api/admin/service/verifyservice/${serviceId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: action === "approve" ? "approved" : "rejected",
          rejected_reason: action === "reject" ? rejectionReasonParam : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error verifying service:", errorData.message || response.statusText);
        alert(`Failed to ${action} service: ${errorData.message || response.statusText}`);
        return false;
      }

      // refresh
      dispatch(fetchServiceByStatus({ status: selectedStatus, limit, offset: (page - 1) * limit }));
      return true;
    } catch (err) {
      console.error("Network error:", err);
      alert(`Network error while trying to ${action} service.`);
      return false;
    }
  };

  const handleVerifyBeforeAction = (service, action) => {
    if (!service.providerVerified) {
      setSelectedService(service);
      setPendingAction(action);
      setShowKycModal(true);
    } else {
      if (action === "approve") handleVerifyService(service.serviceId, "approve");
      else handleRejectModal(service);
    }
  };

  const handleAccept = (service) => handleVerifyBeforeAction(service, "approve");

  const handleRejectModal = (service) => {
    setSelectedService(service);
    setShowRejectModal(true);
    setRejectionReason("");
  };

  const handleRejectService = async () => {
    if (!selectedService || !rejectionReason.trim()) return alert("Please provide a rejection reason.");
    await handleVerifyService(selectedService.serviceId, "reject", rejectionReason.trim());
    setShowRejectModal(false);
    setSelectedService(null);
    setRejectionReason("");
  };

  const confirmKycAction = () => {
    setShowKycModal(false);
    if (pendingAction === "approve") {
      handleVerifyService(selectedService.serviceId, "approve");
    } else if (pendingAction === "reject") {
      handleRejectModal(selectedService);
    }
  };

  // client-side filtering (server already filtered by status)
  const filteredList = useMemo(() => {
    return servicesList.filter((service) => {
      const matchesName = service.serviceProviderName?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory ? service.serviceName === selectedCategory : true;
      const matchesStatus = selectedStatus && selectedStatus !== "all" ? service.status === selectedStatus : true;
      return matchesName && matchesCategory && matchesStatus;
    });
  }, [servicesList, search, selectedCategory, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil((total || filteredList.length) / limit));

  const statusBadge = (st) => {
    if (st === "approved") return "bg-green-100 text-green-700";
    if (st === "rejected") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="mt-8">
      <div className="mb-6 flex flex-col lg:flex-row gap-3 items-start lg:items-center">
        <input
          type="text"
          className="border border-green-200 rounded-xl p-3 text-lg flex-1 focus:ring-2 focus:ring-green-400"
          placeholder="Search by Provider Name"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />

        <select
          className="border border-green-200 rounded-xl p-3 text-lg"
          value={selectedCategory}
          onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>

        <div className="flex gap-2 ml-auto">
          {["all", "pending", "approved", "rejected"].map((st) => (
            <button
              key={st}
              onClick={() => { setSelectedStatus(st); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm ${selectedStatus === st ? "bg-green-600 text-white" : "bg-white border"}`}
            >
              {st === "all" ? "All" : st.charAt(0).toUpperCase() + st.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-center py-8">Loading...</p>}
      {error && <p className="text-red-500 text-center py-4">{error}</p>}

      <div className="space-y-4">
        {filteredList.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center text-slate-500 border">No services found</div>
        ) : (
          filteredList.map((service) => (
            <div key={service.serviceId} className="bg-white border rounded-2xl shadow p-5 flex flex-col md:flex-row gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-xl font-semibold text-slate-700">
                  {String(service.serviceProviderName || "U").split(" ").slice(0,2).map(s => s.charAt(0)).join("").toUpperCase()}
                </div>
              </div>

              <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-lg font-semibold text-slate-900">{service.serviceName || "Unnamed Service"}</div>
                      
                      <div className="text-xs text-slate-400 mt-2">Provider: {service.serviceProviderName || "N/A"}</div>
                    </div>

                    <div className="hidden md:block text-right">
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusBadge(service.status)}`}>
                        {service.status || "pending"}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Category: {service.category || "N/A"}</div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm font-medium mb-2">Documents</div>
                    <div className="flex flex-wrap gap-2">
                      {(service.documentUrls && service.documentUrls.length > 0) ? (
                        service.documentUrls.map((doc, i) => (
                          <a
                            key={i}
                            href={doc}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 border rounded-lg text-sm text-blue-600 hover:bg-blue-50"
                          >
                            Doc {i + 1}
                          </a>
                        ))
                      ) : (
                        <div className="text-sm text-slate-500">No documents submitted</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 md:w-60">
                  <div className="md:hidden self-start">
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusBadge(service.status)}`}>
                      {service.status || "pending"}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Category: {service.category || "N/A"}</div>
                  </div>

                  <div className="w-full flex gap-2">
                    <button
                      className="flex-1 px-4 py-2 bg-white border rounded-lg text-sm hover:bg-green-50"
                      onClick={() => window.open(`mailto:${service.serviceProviderEmail || ""}`)}
                    >
                      Contact Provider
                    </button>
                    <button
                      className="flex-1 px-4 py-2 bg-white border rounded-lg text-sm hover:bg-green-50"
                      onClick={() => openDetails(service.serviceId || service.id)}
                    >
                      View Details
                    </button>
                  </div>

                  {service.status === "pending" && (
                    <div className="w-full flex gap-2 pt-2">
                      <button
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        onClick={() => handleRejectModal(service)}
                      >
                        Reject
                      </button>
                      <button
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        onClick={() => handleAccept(service)}
                      >
                        Approve
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-3 items-center">
          <button className="px-4 py-2 bg-white border rounded-lg" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
          <div className="text-sm text-slate-600">{page} / {totalPages}</div>
          <button className="px-4 py-2 bg-white border rounded-lg" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}

      {/* View Details Modal (kept but not opened since openDetails navigates away) */}
      {viewOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-start md:items-center justify-center z-50 p-4 overflow-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-xl font-semibold">Service Details</h3>
              <button className="text-slate-500" onClick={closeDetails}>Close</button>
            </div>

            {viewLoading ? (
              <div className="py-12 text-center">Loading details...</div>
            ) : viewError ? (
              <div className="py-12 text-center text-red-500">{viewError}</div>
            ) : serviceDetail ? (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <img
                    src={(serviceDetail?.ServiceImages?.[0]?.image_path || "").startsWith("http")
                      ? serviceDetail.ServiceImages[0].image_path
                      : `${BASE_URL}${serviceDetail?.ServiceImages?.[0]?.image_path || ""}`}
                    alt={serviceDetail?.Service?.name || "service image"}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                    onError={(e) => { e.currentTarget.src = "/placeholder-service.jpg"; }}
                  />
                  <div className="text-sm text-slate-600 mb-2">Category: {serviceDetail?.Service?.name || "N/A"}</div>
                  <div className="text-lg font-semibold">Rs. {serviceDetail?.rate ? parseFloat(serviceDetail.rate).toFixed(0) : "N/A"}</div>
                  <div className="text-sm text-slate-500 mt-2">Status: <span className={`inline-block px-2 py-1 rounded-full text-xs ${statusBadge(serviceDetail?.status)}`}>{serviceDetail?.status}</span></div>
                </div>

                <div>
                  <h4 className="font-semibold">Description</h4>
                  <p className="text-sm text-slate-700 mt-2">{serviceDetail?.description || "No description"}</p>

                  <div className="mt-4">
                    <h4 className="font-semibold">Includes</h4>
                    <ul className="list-disc pl-5 mt-2 text-sm text-slate-700">
                      {(serviceDetail?.includes || []).length > 0 ? serviceDetail.includes.map((inc, i) => <li key={i}>{inc}</li>) : <li>N/A</li>}
                    </ul>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-semibold">Locations</h4>
                    {(serviceDetail?.ServiceLocations || []).map((loc, i) => (
                      <div key={i} className="text-sm text-slate-600 mt-2">
                        <div>Lat: {loc.latitude}, Lng: {loc.longitude}</div>
                        <div>Radius: {loc.radius} km</div>
                        <div>Address: {loc.address || "N/A"}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <h4 className="font-semibold">Schedules</h4>
                    {(serviceDetail?.ServiceSchedules || []).map((s) => (
                      <div key={s.id} className="text-sm text-slate-600 mt-2">
                        Day: {s.day_of_week} • {s.start_time} - {s.end_time}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex gap-2">
                    {serviceDetail?.status === "pending" && (
                      <>
                        <button
                          className="px-4 py-2 bg-red-500 text-white rounded-lg"
                          onClick={() => {
                            const reason = window.prompt("Enter rejection reason:");
                            if (reason && reason.trim()) handleVerifyService(serviceDetail.id || serviceDetail.serviceId, "reject", reason.trim()).then(() => closeDetails());
                          }}
                        >
                          Reject
                        </button>
                        <button
                          className="px-4 py-2 bg-green-600 text-white rounded-lg"
                          onClick={() => handleVerifyService(serviceDetail.id || serviceDetail.serviceId, "approve").then(() => closeDetails())}
                        >
                          Approve
                        </button>
                      </>
                    )}

                    <button
                      className="px-4 py-2 bg-white border rounded-lg"
                      onClick={() => window.open(`${BASE_URL}${serviceDetail?.ServiceImages?.[0]?.image_path || ""}`, "_blank")}
                    >
                      Open Image
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500">No details available.</div>
            )}
          </div>
        </div>
      )}

      {showRejectModal && (
        <RejectModal
          service={selectedService}
          reason={rejectionReason}
          setReason={setRejectionReason}
          onClose={() => setShowRejectModal(false)}
          onReject={handleRejectService}
        />
      )}

      {showKycModal && (
        <KycModal
          pendingAction={pendingAction}
          onConfirm={confirmKycAction}
          onClose={() => setShowKycModal(false)}
        />
      )}
    </div>
  );
}

// Reject Modal component
function RejectModal({ service, reason, setReason, onClose, onReject }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <button
          className="absolute top-4 right-4 text-green-600 hover:text-green-800 text-xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-red-600 mb-4 text-center">Reject Service</h2>
        <div className="mb-4 text-center">
          <p><span className="font-semibold">Service:</span> {service?.serviceName}</p>
          <p><span className="font-semibold">Provider:</span> {service?.serviceProviderName}</p>
        </div>
        <textarea
          className="w-full border border-red-200 rounded-lg p-3 text-base focus:ring-2 focus:ring-red-400 resize-none"
          rows={4}
          placeholder="Please provide a reason..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="flex gap-3 justify-end pt-2">
          <button className="px-6 py-2 bg-white border border-green-200 text-green-700 rounded-lg" onClick={onClose}>Cancel</button>
          <button className={`px-6 py-2 bg-red-500 text-white rounded-lg ${!reason.trim() ? "opacity-60 cursor-not-allowed" : ""}`} onClick={onReject} disabled={!reason.trim()}>Reject Service</button>
        </div>
      </div>
    </div>
  );
}

// KYC Modal component
function KycModal({ pendingAction, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <button className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-xl font-bold" onClick={onClose}>&times;</button>
        <h2 className="text-2xl font-bold text-yellow-600 mb-4 text-center">Provider Not Verified</h2>
        <p className="text-gray-700 text-center mb-6">
          This provider has not completed KYC verification. <br />
          Are you sure you want to proceed with <span className="font-semibold text-green-600">{pendingAction === "approve" ? "Approving" : "Rejecting"}</span> this service?
        </p>
        <div className="flex gap-3 justify-end pt-2">
          <button className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg" onClick={onClose}>Cancel</button>
          <button className={`px-6 py-2 ${pendingAction === "approve" ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"} text-white rounded-lg`} onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}