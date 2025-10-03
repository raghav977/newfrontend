"use client";
import { useState, useEffect } from "react";

const BASE_URL = "http://localhost:5000/";

export default function RejectedList() {
  const [kycData, setKycData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedEntity, setSelectedEntity] = useState("");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchKycList(page);
  }, [page, limit]);

  useEffect(() => {
    setPage(1); // reset page when filters/search change
  }, [selectedCategory, selectedEntity, searchText]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${BASE_URL}kyc/document-types`, { credentials: "include" });
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const fetchKycList = async (page = 1) => {
    try {
      const offset = (page - 1) * limit;
      const response = await fetch(
        `${BASE_URL}api/admin/kyc/all?status=rejected&limit=${limit}&offset=${offset}`,
        { credentials: "include" }
      );
      const data = await response.json();
      setKycData(data.data.result || []);
      setTotal(data.data.total || 0);
    } catch (err) {
      console.error("Failed to fetch rejected KYC list:", err);
    }
  };

  const filteredData = kycData.filter((dt) => {
    const matchesCategory = selectedCategory ? dt.document_type === selectedCategory : true;
    const matchesEntity = selectedEntity ? dt.entityType === selectedEntity : true;
    const matchesSearch = searchText
      ? dt.User?.username?.toLowerCase().includes(searchText.toLowerCase()) ||
        dt.User?.email?.toLowerCase().includes(searchText.toLowerCase())
      : true;
    return matchesCategory && matchesEntity && matchesSearch;
  });

  return (
    <div className="mt-6 border rounded-2xl shadow-lg bg-white p-6">
      {/* Search & Filters */}
      <div className="mb-6 flex gap-3 flex-wrap items-center">
        <input
          type="text"
          className="border rounded-xl p-3 text-lg flex-1 focus:ring-2 focus:ring-green-400 outline-none"
          placeholder="🔍 Search by name/email"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded-xl p-3 text-lg focus:ring-2 focus:ring-green-400 outline-none"
        >
          <option value="">📂 All Document Types</option>
          {Array.isArray(categories) &&
            categories.map((cat) => (
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
                "KYC Id",
                "Username",
                "Email",
                "Document Type",
                "Documents",
                "Passport",
                "Entity",
                "Status",
                "Reject Reason",
              ].map((header) => (
                <th key={header} className="p-3 text-left font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((dt, idx) => {
                const passportPhoto = dt.KycImages?.find((img) => img.image_type === "passport_photo");
                const front = dt.KycImages?.find((img) => img.image_type === "front");
                const back = dt.KycImages?.find((img) => img.image_type === "back");

                return (
                  <tr
                    key={dt.id}
                    className={`hover:bg-green-50 transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="p-3 font-medium text-gray-700">{dt.id}</td>
                    <td className="p-3">{dt.User?.username || "N/A"}</td>
                    <td className="p-3">{dt.User?.email || "N/A"}</td>
                    <td className="p-3 capitalize">{dt.document_type.replace("_", " ")}</td>
                    <td className="p-3 space-x-2">
                      {front && (
                        <a
                          href={`${BASE_URL}uploads/${front.image_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          Front
                        </a>
                      )}
                      {back && (
                        <a
                          href={`${BASE_URL}/uploads/${back.image_path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          Back
                        </a>
                      )}
                    </td>
                    <td className="p-3">
                      {passportPhoto ? (
                        <a
                          href={`${BASE_URL}/uploads/${passportPhoto.image_path}`}
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
                    <td className="p-3 capitalize">{dt.entityType || "N/A"}</td>
                    <td className="p-3">
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
                        {dt.status}
                      </span>
                    </td>
                    <td className="p-3">{dt.rejection_reason || "N/A"}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="p-6 text-center text-gray-500">
                  No rejected KYC records found 🚫
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-end items-center space-x-3">
        <button
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
        >
          Previous
        </button>
        <span className="text-gray-700">
          Page {page} of {Math.ceil(total / limit) || 1}
        </span>
        <button
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          disabled={page >= Math.ceil(total / limit)}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
