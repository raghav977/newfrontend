'use client';
import { useState, useEffect } from 'react';
import { FaRegTimesCircle } from 'react-icons/fa';

const BASE_URL = 'http://localhost:3024/uploads/';
const API_BASE = 'http://localhost:5000/api/admin/kyc';

export default function ApproveKycList() {
  const [kycData, setKycData] = useState([]);
  const [rejectModal, setRejectModal] = useState({ open: false, id: null, reason: '' });
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch document types/categories for filter dropdown
  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:3024/kyc/document-types', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load categories');
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  // Fetch paginated list of approved KYCs
  const fetchKycList = async (pageNumber = 1) => {
    try {
      const offset = (pageNumber - 1) * limit;
      const res = await fetch(`${API_BASE}/all?status=approved&limit=${limit}&offset=${offset}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to load KYC list');
      const data = await res.json();

      setKycData(data.data.result || []);
      setTotal(data.data.total || 0);
    } catch (err) {
      console.error('Failed to fetch KYC list:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchKycList(page);
  }, [page]);

  // Reset page if filters/search change
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchText]);

  // Handle rejection of KYC
  const handleReject = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          kycId: rejectModal.id,
          action: 'reject',
          rejectionReason: rejectModal.reason,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to reject KYC.');
      }

      setRejectModal({ open: false, id: null, reason: '' });
      fetchKycList(page);
      alert('KYC rejected successfully.');
    } catch (err) {
      alert(err.message || 'Failed to reject KYC.');
    }
    setLoading(false);
  };

  // Apply client-side filtering for category and search
  const filteredData = kycData
    .filter((dt) => (selectedCategory ? dt.document_type === selectedCategory : true))
    .filter((dt) =>
      searchText
        ? dt.User?.username?.toLowerCase().includes(searchText.toLowerCase()) ||
          dt.User?.email?.toLowerCase().includes(searchText.toLowerCase())
        : true
    );

  return (
    <div className="mt-6 border rounded-2xl shadow-lg bg-white p-6">
      {/* Search & Filter */}
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
                {cat.replace('_', ' ')}
              </option>
            ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-full border-collapse">
          <thead className="bg-green-600 text-white">
            <tr>
              {['KYC Id', 'Username', 'Email', 'Document Type', 'Documents', 'Passport', 'Status', 'Action'].map(
                (header) => (
                  <th key={header} className="p-3 text-left font-semibold">
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((dt, idx) => {
                const passportPhoto = dt.KycImages?.find((img) => img.image_type === 'passport_photo');
                const front = dt.KycImages?.find((img) => img.image_type === 'front');
                const back = dt.KycImages?.find((img) => img.image_type === 'back');

                return (
                  <tr
                    key={dt.id}
                    className={`hover:bg-green-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                  >
                    <td className="p-3 font-medium text-gray-700">{dt.id}</td>
                    <td className="p-3">{dt.User?.username || 'N/A'}</td>
                    <td className="p-3">{dt.User?.email || 'N/A'}</td>
                    <td className="p-3 capitalize">{dt.document_type.replace('_', ' ')}</td>
                    <td className="p-3 space-x-2">
                      {front && (
                        <a href={`${BASE_URL}${front.image_path}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                          Front
                        </a>
                      )}
                      {back && (
                        <a href={`${BASE_URL}${back.image_path}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                          Back
                        </a>
                      )}
                    </td>
                    <td className="p-3">
                      {passportPhoto ? (
                        <a href={`${BASE_URL}${passportPhoto.image_path}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                          View
                        </a>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="p-3">
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">{dt.status}</span>
                    </td>
                    <td className="p-3 space-x-2">
                      <button
                        className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-sm transition"
                        onClick={() => setRejectModal({ open: true, id: dt.id, reason: '' })}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="p-6 text-center text-gray-500">
                  No approved KYC records found 🚫
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
              onChange={(e) => setRejectModal((prev) => ({ ...prev, reason: e.target.value }))}
            />
            <div className="flex justify-end space-x-3">
              <button
                className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                onClick={() => setRejectModal({ open: false, id: null, reason: '' })}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition"
                disabled={!rejectModal.reason.trim() || loading}
                onClick={handleReject}
              >
                {loading ? 'Rejecting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

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
