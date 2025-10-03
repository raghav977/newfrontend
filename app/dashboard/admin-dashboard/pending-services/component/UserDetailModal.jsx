function UserDetailModal({ service, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold text-green-600 mb-4 text-center">User Details</h2>

        <div className="space-y-3 text-gray-700">
          <p><span className="font-semibold">Name:</span> {service.userName || "N/A"}</p>
          <p><span className="font-semibold">Email:</span> {service.userEmail || "N/A"}</p>
          <p><span className="font-semibold">Phone:</span> {service.userPhone || "N/A"}</p>
          <p><span className="font-semibold">Address:</span> {service.userAddress || "N/A"}</p>
          <p><span className="font-semibold">Joined:</span> {service.userJoinedDate || "N/A"}</p>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
