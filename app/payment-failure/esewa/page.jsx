
export default function EsewaFailure() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h2 className="text-xl font-semibold text-red-600">Payment Failed!</h2>
            <p className="mt-4 text-gray-600">Your payment could not be processed. Please try again.</p>
        </div>
    );
}