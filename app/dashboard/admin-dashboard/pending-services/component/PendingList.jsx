"use client"

import { fetchServices } from "@/app/redux/slices/categorySlice"
import { fetchServiceByStatus } from "@/app/redux/slices/serviceSlice"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useRouter } from "next/navigation"

export default function PendingList() {
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [showKycModal, setShowKycModal] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const dispatch = useDispatch()
  const router = useRouter()

  const { list, total, loading, error } = useSelector((state) => state.service)
  const categories = useSelector((state) => state.category.list)
  const servicesList = list?.results || []

  // Fetch services & categories
  useEffect(() => {
    dispatch(fetchServiceByStatus({ status: "pending", limit, offset: (page - 1) * limit }))
    dispatch(fetchServices())
  }, [dispatch, page, limit])

  // Unified verify service API call
  const handleVerifyService = async (serviceId, action, rejectionReason = "") => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/service/verifyservice/${serviceId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: action === "approve" ? "approved" : "rejected",
          rejected_reason: action === "reject" ? rejectionReason : null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Error verifying service:", errorData.message || response.statusText)
        alert(`Failed to ${action} service: ${errorData.message || response.statusText}`)
        return
      }

      // Refresh list after success
      dispatch(fetchServiceByStatus({ status: "pending", limit, offset: (page - 1) * limit }))
    } catch (err) {
      console.error("Network error:", err)
      alert(`Network error while trying to ${action} service.`)
    }
  }

  // Approve handler
  const handleAccept = (service) => {
    handleVerifyBeforeAction(service, "approve")
  }

  // Reject modal open handler
  const handleRejectModal = (service) => {
    setSelectedService(service)
    setShowRejectModal(true)
    setRejectionReason("")
  }

  // Reject service handler
  const handleRejectService = () => {
    if (!selectedService || !rejectionReason.trim()) return alert("Please provide a rejection reason.")
    handleVerifyService(selectedService.serviceId, "reject", rejectionReason.trim())
    setShowRejectModal(false)
    setSelectedService(null)
    setRejectionReason("")
  }

  // KYC check before action
  const handleVerifyBeforeAction = (service, action) => {
    if (!service.providerVerified) {
      setSelectedService(service)
      setPendingAction(action)
      setShowKycModal(true)
    } else {
      action === "approve" ? handleVerifyService(service.serviceId, "approve") : handleRejectModal(service)
    }
  }

  // Confirm KYC modal action
  const confirmKycAction = () => {
    setShowKycModal(false)
    if (pendingAction === "approve") {
      handleVerifyService(selectedService.serviceId, "approve")
    } else if (pendingAction === "reject") {
      handleRejectModal(selectedService)
    }
  }

  // Filter services by search & category
  const filteredList = servicesList.filter((service) => {
    const matchesName = service.serviceProviderName?.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory ? service.serviceName === selectedCategory : true
    return matchesName && matchesCategory
  })

  const totalPages = Math.ceil(total / limit)

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
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Services Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-green-50">
            <tr>
              <th className="p-2 border">Service Id</th>
              <th className="p-2 border">Service Name</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Documents</th>
              <th className="p-2 border">Provider Name</th>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Reapplied</th>
              <th className="p-2 border">Verified</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((service) => (
              <tr key={service.serviceId} className="hover:bg-green-50">
                <td className="p-2 border">{service.serviceId}</td>
                <td className="p-2 border">{service.serviceName}</td>
                <td className="p-2 border">{service.description}</td>
                <td className="p-2 border">
                  {service.documentUrls?.length
                    ? service.documentUrls.map((doc, i) => (
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
                    : "No documents"}
                </td>
                <td className="p-2 border">{service.serviceProviderName}</td>
                <td className="p-2 border">{service.category || "N/A"}</td>
                <td className="p-2 border">{service.status}</td>
                <td className="p-2 border">{service.reapplied ? "YES" : ""}</td>
                <td className="p-2 border">{service.providerVerified ? "Verified" : "Not Verified"}</td>
                <td className="p-2 border flex items-center justify-around">
                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    onClick={() => handleVerifyBeforeAction(service, "approve")}
                  >
                    Accept
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    onClick={() => handleVerifyBeforeAction(service, "reject")}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-3">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
          <span>{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <RejectModal
          service={selectedService}
          reason={rejectionReason}
          setReason={setRejectionReason}
          onClose={() => setShowRejectModal(false)}
          onReject={handleRejectService}
        />
      )}

      {/* KYC Modal */}
      {showKycModal && (
        <KycModal
          pendingAction={pendingAction}
          onConfirm={confirmKycAction}
          onClose={() => setShowKycModal(false)}
        />
      )}
    </div>
  )

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
    )
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
    )
  }
}
