"use client";
import { useEffect, useState } from "react";

const BASE_URL = "http://localhost:5000";
const API_URL = "http://localhost:5000/api/admin/kyc";

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

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchKycList(page);
  }, [page]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:3024/kyc/document-types", {
        credentials: "include",
      });
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const fetchKycList = async (page = 1) => {
    try {
      const offset = (page - 1) * limit;
      const res = await fetch(`${API_URL}/all?status=pending&limit=${limit}&offset=${offset}`, {
        credentials: "include",
      });
      const data = await res.json();
      setKycData(data.data.result || []);
      setTotal(data.data.total || 0);
    } catch (err) {
      console.error("Failed to fetch KYC list:", err);
    }
  };

  const handleKycAction = async (kycId, action, reason = "") => {
    try {
      const payload =
        action === "reject" ? { kycId, action, rejectionReason: reason } : { kycId, action };

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
    }
  };

  const filteredData = kycData.filter((dt) => {
    const matchesCategory = selectedCategory ? dt.document_type === selectedCategory : true;
    const matchesEntity = selectedEntity ? dt.entityType === selectedEntity : true;
    const user = dt.User || {};
    const matchesSearch = searchText
      ? user.username?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchText.toLowerCase())
      : true;

    return matchesCategory && matchesEntity && matchesSearch;
  });

  return (
    <div className="mt-6 border rounded-2xl shadow-lg bg-white p-6">
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="🔍 Search by name/email"
          className="border rounded-xl p-3 text-lg flex-1 focus:ring-2 focus:ring-green-400 outline-none"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded-xl p-3 text-lg focus:ring-2 focus:ring-green-400 outline-none"
        >
          <option value="">📂 All Document Types</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        <select
          value={selectedEntity}
          onChange={(e) => setSelectedEntity(e.target.value)}
          className="border rounded-xl p-3 text-lg focus:ring-2 focus:ring-green-400 outline-none"
        >
          <option value="">🏷 All Entity Types</option>
          <option value="service_provider">Service Provider</option>
          <option value="gharbeti">Gharbeti</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-full border-collapse">
          <thead className="bg-green-600 text-white">
            <tr>
              {[
                "KYC ID",
                "Username",
                "Email",
                "Document Type",
                "Documents",
                "Passport",
                "Entity",
                "Status",
                "Action",
              ].map((header) => (
                <th key={header} className="p-3 text-left font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
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
                  <tr key={dt.id} className="even:bg-gray-50 hover:bg-green-50 transition">
                    <td className="p-3 font-medium">{dt.id}</td>
                    <td className="p-3">{user.username || "N/A"}</td>
                    <td className="p-3">{user.email || "N/A"}</td>
                    <td className="p-3 capitalize">{dt.document_type.replace("_", " ")}</td>
                    <td className="p-3 space-x-2">
                      {documentLinks.length > 0 ? (
                        documentLinks.map((link, i) => (
                          <a
                            key={i}
                            href={`${BASE_URL}${link.path.replace(/\\/g, "/")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                          >
                            {link.label}
                          </a>
                        ))
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="p-3">
                      {passportPhoto ? (
                        <a
                          href={`${BASE_URL}${passportPhoto.image_path.replace(/\\/g, "/")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          View
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="p-3 capitalize">{dt.entityType}</td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          dt.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : dt.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {dt.status}
                      </span>
                    </td>
                    <td className="p-3 space-x-2">
                      {dt.status === "pending" && (
                        <>
                          <button
                            className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                            onClick={() => handleKycAction(dt.id, "approve")}
                          >
                            Approve
                          </button>
                          <button
                            className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg"
                            onClick={() => setRejectModal({ open: true, id: dt.id, reason: "" })}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="p-6 text-center text-gray-500">
                  No KYC records found 🚫
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-96 shadow-2xl animate-fadeIn">
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
      <div className="mt-6 flex justify-end items-center space-x-3">
        <button
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        <span className="text-gray-700">
          Page {page} of {Math.ceil(total / limit) || 1}
        </span>
        <button
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          disabled={page >= Math.ceil(total / limit)}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
