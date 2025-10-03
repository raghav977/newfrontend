"use client";
import { useState } from "react";
import { FaCamera, FaUserEdit, FaListUl, FaRupeeSign, FaCalendarAlt } from "react-icons/fa";
import KycStatus from "./KycStatus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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
        updated[idx][field] = value;
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
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <Card className="border-green-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold text-green-700 flex items-center gap-3">
                        <FaUserEdit className="text-green-600" />
                        About You
                    </CardTitle>
                    <CardDescription>
                        Provide details about yourself and the services you offer.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!showPreview ? (
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Photo Upload */}
                            <div className="space-y-2">
                                <Label htmlFor="photo" className="text-green-700 font-semibold flex items-center gap-2">
                                    <FaCamera />
                                    Service Photo
                                </Label>
                                <div className="flex items-center gap-4">
                                    <Avatar className="w-24 h-24 border-2 border-green-200">
                                        <AvatarImage src={photo} alt="Service" />
                                        <AvatarFallback>
                                            <FaCamera className="text-gray-400" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <Input
                                        id="photo"
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="max-w-xs"
                                    />
                                </div>
                            </div>
                            {/* About Section */}
                            <div className="space-y-2">
                                <Label htmlFor="about" className="text-green-700 font-semibold flex items-center gap-2">
                                    <FaUserEdit />
                                    About Yourself
                                </Label>
                                <Textarea
                                    id="about"
                                    rows={5}
                                    placeholder="Write about yourself and your service..."
                                    value={about}
                                    onChange={e => setAbout(e.target.value)}
                                    required
                                    className="border-green-200 focus:ring-green-400"
                                />
                            </div>
                            {/* Features */}
                            <div className="space-y-2">
                                <Label className="text-green-700 font-semibold flex items-center gap-2">
                                    <FaListUl />
                                    Features Provided
                                </Label>
                                <div className="space-y-2">
                                    {features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <Input
                                                type="text"
                                                placeholder={`Feature ${idx + 1}`}
                                                value={feature}
                                                onChange={e => handleFeatureChange(idx, e.target.value)}
                                                required
                                                className="border-green-200"
                                            />
                                            {features.length > 1 && (
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    onClick={() => removeFeature(idx)}
                                                >
                                                    ×
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="mt-2 border-green-200 text-green-700"
                                    onClick={addFeature}
                                >
                                    + Add Feature
                                </Button>
                            </div>
                            {/* Cost */}
                            <div className="space-y-2">
                                <Label htmlFor="cost" className="text-green-700 font-semibold flex items-center gap-2">
                                    <FaRupeeSign />
                                    Service Cost
                                </Label>
                                <Input
                                    id="cost"
                                    type="number"
                                    placeholder="Enter cost (in INR)"
                                    value={cost}
                                    onChange={e => setCost(e.target.value)}
                                    required
                                    min={0}
                                    className="border-green-200"
                                />
                            </div>
                            {/* Schedule */}
                            <div className="space-y-4">
                                <Label className="text-green-700 font-semibold flex items-center gap-2">
                                    <FaCalendarAlt />
                                    Weekly Schedule
                                </Label>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {schedule.map((slot, idx) => (
                                        <Card key={slot.day} className="p-4 border-green-100">
                                            <div className="flex items-center justify-between mb-3">
                                                <Label htmlFor={`available-${idx}`} className="font-semibold text-green-700">{slot.day}</Label>
                                                <Switch
                                                    id={`available-${idx}`}
                                                    checked={slot.available}
                                                    onCheckedChange={checked =>
                                                        handleScheduleChange(idx, "available", checked)
                                                    }
                                                />
                                            </div>
                                            {slot.available && (
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="time"
                                                        value={slot.start}
                                                        onChange={e =>
                                                            handleScheduleChange(idx, "start", e.target.value)
                                                        }
                                                        className="border-green-200"
                                                        required
                                                    />
                                                    <span className="text-gray-500">to</span>
                                                    <Input
                                                        type="time"
                                                        value={slot.end}
                                                        onChange={e =>
                                                            handleScheduleChange(idx, "end", e.target.value)
                                                        }
                                                        className="border-green-200"
                                                        required
                                                    />
                                                </div>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            </div>
                            {error && (
                                <p className="text-red-500 text-sm">{error}</p>
                            )}
                            <Button
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-700"
                                disabled={loading}
                            >
                                {loading ? "Saving..." : "Save & Preview"}
                            </Button>
                        </form>
                    ) : (
                        // Customer Preview
                        <div className="space-y-8">
                             <div className="flex justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowPreview(false)}
                                >
                                    Edit Details
                                </Button>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-8">
                                <Avatar className="w-32 h-32 border-4 border-green-200">
                                    <AvatarImage src={photo} alt="Service" />
                                    <AvatarFallback>
                                        <FaCamera className="text-gray-400" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-2 text-center sm:text-left">
                                    <h2 className="text-3xl font-bold text-green-800">Service Provider Profile</h2>
                                    <p className="text-gray-600">This is how customers will see your profile.</p>
                                </div>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-green-700">About</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700">{about}</p>
                                </CardContent>
                            </Card>

                             <Card>
                                <CardHeader>
                                    <CardTitle className="text-green-700">Features</CardTitle>
                                </CardHeader>
                                <CardContent className="flex flex-wrap gap-2">
                                    {features.filter(f => f.trim()).map((feature, idx) => (
                                        <Badge key={idx} variant="secondary" className="text-green-800 bg-green-100">{feature}</Badge>
                                    ))}
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-green-700">Service Cost</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-green-800 text-3xl font-bold">
                                            ₹ {cost}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-green-700">Available Schedule</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                        {schedule.filter(s => s.available).map((slot, idx) => (
                                            <li key={idx} className="flex justify-between items-center p-2 bg-green-50 rounded-md">
                                                <span className="font-semibold">{slot.day}</span>
                                                <span className="text-green-800">{slot.start} - {slot.end}</span>
                                            </li>
                                        ))}
                                        </ul>
                                        {schedule.filter(s => s.available).length === 0 && (
                                            <p className="text-gray-500">No schedule available.</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
            <div className="mt-8">
                <KycStatus/>
            </div>
        </div>
    );
}
