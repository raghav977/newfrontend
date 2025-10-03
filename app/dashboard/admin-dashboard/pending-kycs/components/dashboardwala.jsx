export default function DashboardStats({ total }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
            {/* Stats Card */}
            <div className="bg-white border border-green-100 shadow-md rounded-xl p-6 flex flex-col items-center justify-center">
                <div className="w-12 h-12 flex items-center justify-center bg-green-100 rounded-full mb-3">
                    {/* Icon (optional) */}
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 0 1 8 0v2M9 17H7a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M9 17v2a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2"></path>
                    </svg>
                </div>
                <h2 className="text-lg font-semibold text-green-700 mb-1">Total Pending KYCs</h2>
                <p className="text-3xl font-bold text-green-600">{total}</p>
            </div>
        </div>
    );
}