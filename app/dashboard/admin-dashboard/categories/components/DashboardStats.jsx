"use client"
import { FaFolderOpen } from "react-icons/fa";

const DashboardStats = ({ total = 10 }) => {
  return (
    <div className="mt-8">
      {/* cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-green-100 shadow-lg rounded-xl p-6 flex flex-col items-center justify-center">
          <div className="w-14 h-14 flex items-center justify-center bg-green-100 rounded-full mb-4">
            <FaFolderOpen className="text-green-600 text-3xl" />
          </div>
          <h1 className="font-semibold text-green-700 text-lg mb-1">Total Categories</h1>
          <h2 className="text-3xl font-bold text-green-600">{total}</h2>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;