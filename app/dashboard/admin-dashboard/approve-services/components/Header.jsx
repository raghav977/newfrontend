import { FaCheckCircle } from "react-icons/fa";

export default function Header(){
    return(

        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Stats Card */}
              <div className="bg-white border border-green-100 shadow-lg rounded-xl p-6 flex flex-col items-center justify-center">
                <div className="w-14 h-14 flex items-center justify-center bg-green-100 rounded-full mb-4">
                  <FaCheckCircle className="text-green-600 text-3xl" />
                </div>
                <h1 className="font-semibold text-green-700 text-lg mb-1">Total Approved Services</h1>
                <h2 className="text-3xl font-bold text-green-600">14</h2>
              </div>
            </div>
    )
}