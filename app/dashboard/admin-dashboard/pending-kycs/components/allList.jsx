"use client";
import React, { useEffect, useState, useMemo } from "react";
import UserDetailModal from "./userdetailModal";

const BASE_URL = "http://localhost:5000";
const API_URL = "http://localhost:5000/api/admin/kyc";

function formatDate(iso) {
  if (!iso) return "N/A";
  const d = new Date(iso);
  return d.toLocaleDateString();
}

function initials(name = "") {
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
}

export default function AllList() {
  const [kycData, setKycData] = useState([]);
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, reason: "" });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedEntity, setSelectedEntity] = useState("");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);

  const [userDetailModalOpen, setUserDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleUserDetailModal = (user) => {
    alert("This is user id "+user.id)
    setSelectedUser(user);
    setUserDetailModalOpen(!userDetailModalOpen);
  }

  // NEW: status filter (all | pending | approved | rejected)
  const [selectedStatus, setSelectedStatus] = useState("pending");

  useEffect(() => {
    fetchCategories();
  }, []);

  // when filters or page change, fetch list
  useEffect(() => {
    fetchKycList(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedStatus, selectedCategory, selectedEntity]);

  // also refetch when searching (reset to page 1)
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      fetchKycList(1);
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:3024/kyc/document-types", {
        credentials: "include",
      });
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setCategories([]);
    }
  };

  const fetchKycList = async (pageToFetch = 1) => {
    try {
      const offset = (pageToFetch - 1) * limit;
      const params = new URLSearchParams();
      if (selectedStatus && selectedStatus !== "all") params.append("status", selectedStatus);
      if (limit) params.append("limit", String(limit));
      if (offset) params.append("offset", String(offset));
      if (selectedCategory) params.append("document_type", selectedCategory);
      if (selectedEntity) params.append("entityType", selectedEntity);
      if (searchText) params.append("q", searchText);

      const url = `${API_URL}/all?${params.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      const list =
        data?.data?.result ||
        data?.results || 
        data?.data ||
        data?.result ||
        data?.items ||
        [];
      const totalCount =
        (data?.data && (data.data.total ?? data.data.count)) ??
        data?.total ??
        data?.count ??
        (Array.isArray(list) ? list.length : 0);

      setKycData(Array.isArray(list) ? list : []);
      setTotal(Number(totalCount || 0));
    } catch (err) {
      console.error("Failed to fetch KYC list:", err);
      setKycData([]);
      setTotal(0);
    }
  };

  const handleKycAction = async (kycId, action, reason = "") => {
    try {
      const payload =
        action === "reject" ? { kycId, action, rejectionReason: reason } : { kycId, action };

        console.log("THis is payload"+JSON.stringify(payload))

      const res = await fetch(`${API_URL}/verify`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update KYC");

      alert(action === "approve" ? "KYC Approved ✅" : "KYC Rejected ❌");
      fetchKycList(page);
      setRejectModal({ open: false, id: null, reason: "" });
    } catch (err) {
      console.error("KYC action error:", err);
      alert("Action failed");
    }
  };

  // client-side safeguard filtering (server already applies filters)
  const filteredData = useMemo(() => {
    return kycData.filter((dt) => {
      const matchesCategory = selectedCategory ? dt.document_type === selectedCategory : true;
      const matchesEntity = selectedEntity ? dt.entityType === selectedEntity : true;
      const matchesStatus = selectedStatus && selectedStatus !== "all" ? dt.status === selectedStatus : true;
      const user = dt.User || {};
      const matchesSearch = searchText
        ? (user.username?.toLowerCase().includes(searchText.toLowerCase()) ||
           user.email?.toLowerCase().includes(searchText.toLowerCase()))
        : true;
      return matchesCategory && matchesEntity && matchesSearch && matchesStatus;
    });
  }, [kycData, selectedCategory, selectedEntity, searchText, selectedStatus]);

  const totalPages = Math.max(1, Math.ceil((total || filteredData.length) / limit));

  return (
    <div className="">
      

      {/* Filters card */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-6 border">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <input
            type="text"
            placeholder="Search applicants by name or email..."
            className="flex-1 border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-green-300 outline-none"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <select
            value={selectedEntity}
            onChange={(e) => { setSelectedEntity(e.target.value); setPage(1); }}
            className="border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-green-300 outline-none"
          >
            <option value="">All Entity Types</option>
            <option value="service_provider">Service Provider</option>
            <option value="gharbeti">Gharbeti</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
            className="border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-green-300 outline-none"
          >
            <option value="">All Document Types</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <div className="ml-auto flex gap-2">
            <button
              className="px-4 py-2 bg-white border rounded-lg text-sm hover:bg-green-50"
              onClick={() => { setSearchText(""); setSelectedCategory(""); setSelectedEntity(""); setSelectedStatus("all"); setPage(1); fetchKycList(1); }}
            >
              Reset
            </button>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
              onClick={() => fetchKycList(1)}
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Tabs (status) */}
      <div className="flex gap-3 mb-4">
        {["all", "pending", "approved", "rejected"].map((st) => (
          <button
            key={st}
            onClick={() => { setSelectedStatus(st); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm ${selectedStatus === st ? "bg-green-600 text-white" : "bg-white border"}`}
          >
            {st === "all" ? "All Applications" : st.charAt(0).toUpperCase() + st.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredData.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center text-slate-500 border">No KYC records found 🚫</div>
        ) : (
          filteredData.map((dt) => {
            const user = dt.User || {};
            const images = dt.KycImages || [];

            const passportPhoto = images.find((img) => img.image_type === "passport_photo");
            const fileImage = images.find((img) => img.image_type === "file");
            const front = images.find((img) => img.image_type === "front");
            const back = images.find((img) => img.image_type === "back");

            const documentLinks = [];
            if (front) documentLinks.push({ label: "Front", path: front.image_path });
            if (back) documentLinks.push({ label: "Back", path: back.image_path });
            if (fileImage) documentLinks.push({ label: "File", path: fileImage.image_path });

            return (
              <div key={dt.id} className="bg-white border rounded-2xl shadow p-5 flex flex-col md:flex-row gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center text-xl font-semibold text-slate-700">
                    {initials(user.username || user.email || "U")}
                  </div>
                </div>

                <div className="flex-1 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold text-slate-900">{user.username || "Unknown"}</div>
                        <div className="text-sm text-slate-500">{user.email || "N/A"}</div>
                        <div className="text-xs text-slate-400 mt-2">Applied {formatDate(dt.createdAt)}</div>
                      </div>

                      <div className="hidden md:block text-right">
                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          dt.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : dt.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}>
                          {dt.status}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">Entity: {dt.entityType || "N/A"}</div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2">Submitted Documents</div>
                      <div className="flex flex-wrap gap-2">
                        {documentLinks.length > 0 ? (
                          documentLinks.map((link, i) => (
                            <a
                              key={i}
                              href={`${BASE_URL}${link.path.replace(/\\/g, "/")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 border rounded-lg text-sm text-blue-600 hover:bg-blue-50"
                            >
                              {link.label}
                            </a>
                          ))
                        ) : (
                          <div className="text-sm text-slate-500">N/A</div>
                        )}
                        {passportPhoto && (
                          <a
                            href={`${BASE_URL}${passportPhoto.image_path.replace(/\\/g, "/")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 border rounded-lg text-sm text-blue-600 hover:bg-blue-50"
                          >
                            Passport
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3 md:w-60">
                    {/* mobile status */}
                    <div className="md:hidden">
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        dt.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : dt.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}>{dt.status}</div>
                      <div className="text-xs text-slate-400 mt-1">Entity: {dt.entityType || "N/A"}</div>
                    </div>

                    <div className="w-full flex gap-2">
                      <button
                        className="flex-1 px-4 py-2 bg-white border rounded-lg text-sm hover:bg-green-50"
                        onClick={() => handleUserDetailModal(user)}
                      >
                        View Details
                      </button>
                      <button
                        className="flex-1 px-4 py-2 bg-white border rounded-lg text-sm hover:bg-green-50"
                        onClick={() => window.open(`mailto:${user.email || ""}`)}
                      >
                        Contact Applicant
                      </button>
                    </div>

                    {dt.status === "pending" && (
                      <div className="w-full flex gap-2 pt-2">
                        <button
                          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          onClick={() => setRejectModal({ open: true, id: dt.id, reason: "" })}
                        >
                          Reject
                        </button>
                        <button
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                          onClick={() => handleKycAction(dt.id, "approve")}
                        >
                          Approve
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Reject KYC #{rejectModal.id}</h3>
            <textarea
              className="border p-3 w-full rounded-lg mb-4 focus:ring-2 focus:ring-red-400 outline-none"
              rows="4"
              placeholder="Enter rejection reason..."
              value={rejectModal.reason}
              onChange={(e) =>
                setRejectModal((prev) => ({ ...prev, reason: e.target.value }))
              }
            />
            <div className="flex justify-end space-x-3">
              <button
                className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
                onClick={() => setRejectModal({ open: false, id: null, reason: "" })}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                disabled={!rejectModal.reason.trim()}
                onClick={() => handleKycAction(rejectModal.id, "reject", rejectModal.reason)}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <div className="text-sm text-slate-600">
          Showing page {page} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded ${page === i + 1 ? "bg-green-600 text-white" : "bg-white border"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>

      {/* User Detail Modal */}
      {userDetailModalOpen && selectedUser && (
  <div
    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 overflow-auto p-4"
    onClick={() => setUserDetailModalOpen(false)} // close when clicking outside
  >
    <div
      className="bg-white w-full max-w-5xl max-h-[90vh] rounded-lg shadow-lg p-6 relative overflow-y-auto"
      onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
    >
      {/* Close button */}
      <button
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-lg font-bold"
        onClick={() => setUserDetailModalOpen(false)}
      >
        ✕
      </button>

      {/* User detail component */}
      <UserDetailModal user={selectedUser} onClose={() => setUserDetailModalOpen(false)} />
    </div>
  </div>
)}


    </div>
  );
}
