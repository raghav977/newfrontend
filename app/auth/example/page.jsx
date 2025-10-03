"use client";
import { useState } from "react";
import { FaCamera, FaUserEdit, FaListUl, FaRupeeSign, FaCalendarAlt } from "react-icons/fa";

export default function ServiceProviderDashboard() {
    const [photo, setPhoto] = useState(null);
    const [about, setAbout] = useState("");
    const [features, setFeatures] = useState([""]);
    const [cost, setCost] = useState("");
    const [schedule, setSchedule] = useState([
        { day: "Monday", available: false, start: "", end: "" },
        { day: "Tuesday", available: false, start: "", end: "" },
        { day: "Wednesday", available: false, start: "", end: "" },
        { day: "Thursday", available: false, start: "", end: "" },
        { day: "Friday", available: false, start: "", end: "" },
        { day: "Saturday", available: false, start: "", end: "" },
        { day: "Sunday", available: false, start: "", end: "" },
    ]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    // Handle photo upload
    const handlePhotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setPhoto(URL.createObjectURL(e.target.files[0]));
        }
    };

    // Handle features change
    const handleFeatureChange = (idx, value) => {
        const updated = [...features];
        updated[idx] = value;
        setFeatures(updated);
    };

    // Add new feature
    const addFeature = () => setFeatures([...features, ""]);

    // Remove feature
    const removeFeature = (idx) => {
        const updated = features.filter((_, i) => i !== idx);
        setFeatures(updated);
    };

    // Handle schedule change
    const handleScheduleChange = (idx, field, value) => {
        const updated = [...schedule];
        updated[idx][field] = field === "available" ? value : value;
        setSchedule(updated);
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        // Add API call logic here
        setTimeout(() => {
            setLoading(false);
            setShowPreview(true);
        }, 800);
    };

    return (
        <div className="max-w-3xl mx-auto p-8 bg-white rounded-xl shadow border border-green-100 mt-10">
            <h1 className="text-3xl font-bold text-green-700 mb-8 flex items-center gap-2">
                <FaUserEdit className="text-green-600" />
                Service Provider Dashboard
            </h1>
            {!showPreview ? (
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Photo Upload */}
                    <div>
                        <label className="block text-green-700 font-semibold mb-2 flex items-center gap-2">
                            <FaCamera />
                            Service Photo
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="block mb-2"
                        />
                        {photo && (
                            <img
                                src={photo}
                                alt="Service"
                                className="w-40 h-40 object-cover rounded-lg border border-green-200 mt-2"
                            />
                        )}
                    </div>
                    {/* About Section */}
                    <div>
                        <label className="block text-green-700 font-semibold mb-2 flex items-center gap-2">
                            <FaUserEdit />
                            About Yourself
                        </label>
                        <textarea
                            className="w-full border border-green-200 rounded-lg p-3 focus:ring-2 focus:ring-green-400"
                            rows={4}
                            placeholder="Write about yourself and your service..."
                            value={about}
                            onChange={e => setAbout(e.target.value)}
                            required
                        />
                    </div>
                    {/* Features */}
                    <div>
                        <label className="block text-green-700 font-semibold mb-2 flex items-center gap-2">
                            <FaListUl />
                            Features Provided
                        </label>
                        {features.map((feature, idx) => (
                            <div key={idx} className="flex items-center gap-2 mb-2">
                                <input
                                    type="text"
                                    className="flex-1 border border-green-200 rounded-lg p-2"
                                    placeholder={`Feature ${idx + 1}`}
                                    value={feature}
                                    onChange={e => handleFeatureChange(idx, e.target.value)}
                                    required
                                />
                                {features.length > 1 && (
                                    <button
                                        type="button"
                                        className="text-red-500 font-bold px-2"
                                        onClick={() => removeFeature(idx)}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            className="mt-2 bg-green-100 text-green-700 px-4 py-1 rounded-lg font-medium"
                            onClick={addFeature}
                        >
                            + Add Feature
                        </button>
                    </div>
                    {/* Cost */}
                    <div>
                        <label className="block text-green-700 font-semibold mb-2 flex items-center gap-2">
                            <FaRupeeSign />
                            Service Cost
                        </label>
                        <input
                            type="number"
                            className="w-full border border-green-200 rounded-lg p-2"
                            placeholder="Enter cost (in INR)"
                            value={cost}
                            onChange={e => setCost(e.target.value)}
                            required
                            min={0}
                        />
                    </div>
                    {/* Schedule */}
                    <div>
                        <label className="text-green-700 font-semibold mb-2 flex items-center gap-2">
                            <FaCalendarAlt />
                            Weekly Schedule
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {schedule.map((slot, idx) => (
                                <div key={slot.day} className="border border-green-100 rounded-lg p-3 mb-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <input
                                            type="checkbox"
                                            checked={slot.available}
                                            onChange={e =>
                                                handleScheduleChange(idx, "available", e.target.checked)
                                            }
                                            className="accent-green-600"
                                        />
                                        <span className="font-semibold text-green-700">{slot.day}</span>
                                    </div>
                                    {slot.available && (
                                        <div className="flex gap-2">
                                            <input
                                                type="time"
                                                value={slot.start}
                                                onChange={e =>
                                                    handleScheduleChange(idx, "start", e.target.value)
                                                }
                                                className="border border-green-200 rounded-lg p-1"
                                                required
                                            />
                                            <span className="text-green-700">to</span>
                                            <input
                                                type="time"
                                                value={slot.end}
                                                onChange={e =>
                                                    handleScheduleChange(idx, "end", e.target.value)
                                                }
                                                className="border border-green-200 rounded-lg p-1"
                                                required
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    {error && (
                        <div className="text-red-500 text-sm mt-2">{error}</div>
                    )}
                    <button
                        type="submit"
                        className={`w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save Details"}
                    </button>
                </form>
            ) : (
                // Customer Preview
                <div className="bg-green-50 rounded-xl p-8 shadow border border-green-100">
                    <h2 className="text-2xl font-bold text-green-700 mb-4">Service Provider Profile</h2>
                    {photo && (
                        <img
                            src={photo}
                            alt="Service"
                            className="w-48 h-48 object-cover rounded-lg border border-green-200 mb-6 mx-auto"
                        />
                    )}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-green-700 mb-2">About</h3>
                        <p className="text-gray-700">{about}</p>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-green-700 mb-2">Features</h3>
                        <ul className="list-disc pl-6 text-gray-700">
                            {features.filter(f => f.trim()).map((feature, idx) => (
                                <li key={idx}>{feature}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-green-700 mb-2">Service Cost</h3>
                        <p className="text-green-800 text-xl font-bold">
                            ₹ {cost}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-green-700 mb-2">Available Schedule</h3>
                        <table className="w-full border border-green-200 rounded-lg">
                            <thead className="bg-green-100">
                                <tr>
                                    <th className="p-2 text-left text-green-700">Day</th>
                                    <th className="p-2 text-left text-green-700">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {schedule.filter(s => s.available).map((slot, idx) => (
                                    <tr key={idx} className="border-t">
                                        <td className="p-2">{slot.day}</td>
                                        <td className="p-2">
                                            {slot.start} - {slot.end}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {schedule.filter(s => s.available).length === 0 && (
                            <p className="text-gray-500 mt-2">No schedule available.</p>
                        )}
                    </div>
                    <button
                        className="mt-8 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
                        onClick={() => setShowPreview(false)}
                    >
                        Edit Details
                    </button>
                </div>
            )}
        </div>
    );
}