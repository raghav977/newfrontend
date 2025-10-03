"use client"

import { fetchServices } from "@/app/redux/slices/categorySlice"
import { fetchAllServices, fetchServiceByStatus } from "@/app/redux/slices/serviceSlice"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"

export default function PendingList() {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [rejectionReason, setRejectionReason] = useState("")

  const dispatch = useDispatch()

  const { list, loading, error } = useSelector((state) => state.service)
  const categories = useSelector((state) => state.category.list) // Correct slice for categories

  // list structure: { total, limit, offset, results: [...] }
  const servicesList = list?.results || []

  useEffect(() => {
    dispatch(fetchServiceByStatus({ status: "approved" }))
    dispatch(fetchServices())
    dispatch(fetchAllServices())
  }, [dispatch])

  // Filter services by provider name and category
  const filteredList = servicesList.filter((service) => {
    const matchesName = service.serviceProviderName
      ?.toLowerCase()
      .includes(search.toLowerCase())
    const matchesCategory = selectedCategory ? service.serviceName === selectedCategory : true
    return matchesName && matchesCategory
  })

  // Open reject modal
  const handleRejectClick = (service) => {
    setSelectedService(service)
    setRejectionReason("")
    setShowRejectModal(true)
  }

  // Submit rejection reason
  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason")
      return
    }
    try {
      const response = await fetch(`/api/admin/service/verifyservice/${selectedService.serviceId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected", rejected_reason: rejectionReason.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        alert(`Failed to reject service: ${errorData.message || response.statusText}`)
        return
      }

      alert("Service rejected successfully")
      setShowRejectModal(false)
      setSelectedService(null)
      setRejectionReason("")
      dispatch(fetchServiceByStatus({ status: "approved" })) // Refresh list
    } catch (error) {
      alert("Network error while rejecting service")
      console.error(error)
    }
  }

  // Approve service
  const handleApproveClick = async (service) => {
    try {
      const response = await fetch(`/api/admin/service/verifyservice/${service.serviceId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        alert(`Failed to approve service: ${errorData.message || response.statusText}`)
        return
      }

      alert("Service approved successfully")
      dispatch(fetchServiceByStatus({ status: "approved" })) // Refresh list
    } catch (error) {
      alert("Network error while approving service")
      console.error(error)
    }
  }

  return (
    <div className="mt-8">
      {/* Search & Category Filter */}
      <div className="mb-6 flex gap-3 items-center">
        <input
          type="text"
          className="border border-green-200 rounded-xl p-2 text-lg flex-1 focus:ring-2 focus:ring-green-400"
          placeholder="Search by Provider Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border border-green-200 rounded-xl p-2 text-lg focus:ring-2 focus:ring-green-400"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <table className="w-full border-collapse">
        <thead className="bg-green-50">
          <tr>
            <th className="p-2 border">Service Id</th>
            <th className="p-2 border">Service Name</th>
            <th className="p-2 border">Description</th>
            <th className="p-2 border">Documents</th>
            <th className="p-2 border">Service Provider Name</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Reapplied</th>
            <th className="p-2 border">Verified</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredList.length === 0 && (
            <tr>
              <td colSpan="9" className="p-2 text-center">
                No services found.
              </td>
            </tr>
          )}
          {filteredList.map((service) => (
            <tr key={service.serviceId} className="hover:bg-green-50">
              <td className="p-2 border">{service.serviceId}</td>
              <td className="p-2 border">{service.serviceName}</td>
              <td className="p-2 border">{service.description}</td>
              <td className="p-2 border">
                {service.documentUrls && service.documentUrls.length > 0 ? (
                  service.documentUrls.map((doc, i) => (
                    <a
                      key={i}
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-500 underline"
                    >
                      {doc}
                    </a>
                  ))
                ) : (
                  "No documents"
                )}
              </td>
              <td className="p-2 border">{service.serviceProviderName}</td>
              <td className="p-2 border">{service.status}</td>
              <td className="p-2 border">{service.reapplied ? "YES" : ""}</td>
              <td className="p-2 border">{service.providerVerified ? "Verified" : "Not Verified"}</td>
              <td className="p-2 border flex gap-2 justify-center">
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  onClick={() => handleApproveClick(service)}
                >
                  Accept
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  onClick={() => handleRejectClick(service)}
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
            <button
              className="absolute top-3 right-3 text-xl font-bold text-gray-700 hover:text-gray-900"
              onClick={() => setShowRejectModal(false)}
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-4 text-red-600 text-center">Reject Service</h2>
            <p className="mb-4 text-center font-semibold">
              Service: {selectedService?.serviceName}
              <br />
              Provider: {selectedService?.serviceProviderName}
            </p>
            <textarea
              className="w-full border border-red-300 rounded p-3 mb-4 focus:ring-2 focus:ring-red-400"
              rows={4}
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded border border-gray-300"
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white disabled:opacity-60"
                disabled={!rejectionReason.trim()}
                onClick={handleRejectSubmit}
              >
                Reject Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
