import Link from "next/link";
import { FaCheckCircle, FaRegClock, FaIdCard } from "react-icons/fa";

export default function KycStatus() {
    return (
        <div className="mt-8">
            <div className="bg-white border border-green-100 rounded-xl shadow-lg p-6">
                {/* Heading */}
                <h1 className="text-2xl font-bold text-green-700 mb-4 flex items-center gap-2">
                    <FaIdCard className="text-green-600" />
                    Your KYC Status
                </h1>
                {/* Content */}
                <ul className="space-y-3 mb-4">
                    <li className="flex items-center gap-2 text-green-700 font-semibold">
                        <FaCheckCircle className="text-green-500" />
                        Status: <span className="text-green-600 font-bold">Verified</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                        <FaIdCard className="text-green-400" />
                        Document Type: <span className="font-medium">Passport</span>
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                        <FaRegClock className="text-green-400" />
                        Submitted on: <span className="font-medium">2024-02-15</span>
                    </li>
                </ul>
                <Link
                    href="/kyc/view-history/"
                    className="inline-block px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                >
                    View History
                </Link>
            </div>
        </div>
    );
}