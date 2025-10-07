"use client";
import { useState, useEffect, useMemo } from "react";
// import { useToast } from "@/components/ui/use-toast";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Upload, FileText, ChevronsUpDown, Clock, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllServicesReal } from "@/app/redux/slices/serviceallSlice";
import { fetchMyServices } from "@/app/redux/slices/serviceSlice";

const INITIAL_SCHEDULE = [
  { day: "Monday", available: false, times: [] },
  { day: "Tuesday", available: false, times: [] },
  { day: "Wednesday", available: false, times: [] },
  { day: "Thursday", available: false, times: [] },
  { day: "Friday", available: false, times: [] },
  { day: "Saturday", available: false, times: [] },
  { day: "Sunday", available: false, times: [] },
];

export default function AddService() {
  const dispatch = useDispatch();
  const { list } = useSelector((state) => state.allServices);

  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);

  const [newService, setNewService] = useState({
    category: "",
    description: "",
    rate: "",
    locations: [], // will store location ids from API
    documents: [],
    photos: [], // File objects, up to 8 photos (required)
    showLocationDropdown: false,
    includes: [],
    note: "",
    schedule: INITIAL_SCHEDULE,
    newInclude: "",
  });

  const [locationsList, setLocationsList] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [photoPreviews, setPhotoPreviews] = useState([]); // { id, url }

  useEffect(() => {
    dispatch(fetchAllServicesReal());
  }, [dispatch]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLocationsLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/address/locations");
        if (!res.ok) throw new Error("Failed to load locations");
        const json = await res.json();
        const arr = json?.data?.locations ?? [];
        if (!cancelled) setLocationsList(arr);
      } catch (e) {
        console.debug("Failed to load locations", e);
      } finally {
        if (!cancelled) setLocationsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // build photo previews and revoke old URLs
  useEffect(() => {
    // revoke existing
    photoPreviews.forEach((p) => {
      try { URL.revokeObjectURL(p.url); } catch (e) {}
    });
    const previews = (newService.photos || []).map((f, idx) => ({
      id: `${f.name}-${idx}-${f.size}`,
      url: URL.createObjectURL(f),
      name: f.name,
    }));
    setPhotoPreviews(previews);
    return () => {
      previews.forEach((p) => {
        try { URL.revokeObjectURL(p.url); } catch (e) {}
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newService.photos]);

  const handleScheduleChange = (dayIdx, value) => {
    const updated = [...newService.schedule];
    updated[dayIdx].available = value;
    if (!value) updated[dayIdx].times = [];
    setNewService((prev) => ({ ...prev, schedule: updated }));
  };

  const addTimeSlot = (dayIdx) => {
    const updated = [...newService.schedule];
    updated[dayIdx].times.push("");
    setNewService((prev) => ({ ...prev, schedule: updated }));
  };

  const removeTimeSlot = (dayIdx, timeIdx) => {
    const updated = [...newService.schedule];
    updated[dayIdx].times.splice(timeIdx, 1);
    setNewService((prev) => ({ ...prev, schedule: updated }));
  };

  const handleTimeChange = (dayIdx, timeIdx, value) => {
    const updated = [...newService.schedule];
    updated[dayIdx].times[timeIdx] = value;
    setNewService((prev) => ({ ...prev, schedule: updated }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setNewService((prev) => ({
      ...prev,
      documents: [...prev.documents, ...files],
    }));
  };

  const handleRemoveFile = (fileName) => {
    setNewService((prev) => ({
      ...prev,
      documents: prev.documents.filter((f) => f.name !== fileName),
    }));
  };

  // Photos handlers (max 8)
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((f) => f.type.startsWith("image/"));
    setNewService((prev) => {
      const existing = prev.photos || [];
      const combined = [...existing, ...imageFiles].slice(0, 8);
      if (combined.length < existing.length + imageFiles.length) {
        toast.info("Only up to 8 photos allowed. Extra files ignored.", { position: "top-center", autoClose: 3000 });
      }
      return { ...prev, photos: combined };
    });
  };

  const handleRemovePhoto = (fileKey) => {
    // fileKey is index-based id or name — remove by matching name+size if possible
    setNewService((prev) => ({
      ...prev,
      photos: prev.photos.filter((p, idx) => `${p.name}-${idx}-${p.size}` !== fileKey),
    }));
  };

  const wordCount = useMemo(() => {
    return (newService.description || "").trim().split(/\s+/).filter(Boolean).length;
  }, [newService.description]);

  const resetForm = () => {
    // revoke previews
    photoPreviews.forEach((p) => {
      try { URL.revokeObjectURL(p.url); } catch (e) {}
    });
    setIsAddServiceOpen(false);
    setNewService({
      category: "",
      description: "",
      rate: "",
      locations: [],
      documents: [],
      photos: [],
      showLocationDropdown: false,
      includes: [],
      note: "",
      schedule: INITIAL_SCHEDULE,
      newInclude: "",
    });
    setPhotoPreviews([]);
  };

  const handleAddService = async () => {

    console.log("Adding service with data:", newService);
    console.log("Locations list:", !Array.isArray(newService.locations));
    console.log("Location length is:", (newService.locations || []).length);
    console.log("Locaiton , ",newService.locations.length===0);
    try {
      // validations
      if (!newService.category) {
        toast.error("Please select a category.", { position: "top-center" });
        return;
      }
      if (!newService.rate) {
        toast.error("Please enter a rate.", { position: "top-center" });
        return;
      }
      if (!Array.isArray(newService.photos) || newService.photos.length === 0) {
        toast.error("Please upload at least one photo (max 8).", { position: "top-center" });
        return;
      }
      if (!Array.isArray(newService.locations) || newService.locations.length === 0) {
        toast.error("Please select at least one service location.", { position: "top-center" });
        return;
      }
      if (wordCount > 250) {
        toast.error("Description exceeds 250 words.", { position: "top-center" });
        return;
      }

      // prepare metadata
      const mappedSchedules = [];
      newService.schedule.forEach((day) => {
        if (day.available) {
          day.times.forEach((timeRange) => {
            const [start_time = "", end_time = ""] = timeRange.split(" - ");
            mappedSchedules.push({
              day_of_week: day.day,
              start_time,
              end_time,
            });
          });
        }
      });

      // use FormData to send files + JSON fields
      const fd = new FormData();
      // append images under field name "images" (matches multer middleware)
      (newService.photos || []).forEach((file) => fd.append("images", file));
      // append documents too if you want them uploaded as files
      (newService.documents || []).forEach((file) => fd.append("documents", file));

      fd.append("serviceId", String(newService.category));
      fd.append("description", newService.description || "");
      fd.append("rate", String(newService.rate || 0));
      // backend expects location ids array — send as JSON string
    newService.locations.forEach(locId => {
  fd.append("location[]", locId); 
});

     newService.includes.forEach(item => fd.append("include[]", item));
mappedSchedules.forEach(sch => fd.append("schedules[]", JSON.stringify(sch)));

      fd.append("notes", newService.note || "");

      const res = await fetch("http://localhost:5000/api/services/add", {
        method: "POST",
        credentials: "include",
        body: fd, // do NOT set Content-Type header
      });

      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(result.data || result.message || "Something went wrong. Please try again.", {
          position: "top-center",
          autoClose: 3500,
        });
        return;
      }

      toast.success("Service added successfully!", { position: "top-center", autoClose: 3000 });
      dispatch(fetchMyServices());
      resetForm();
    } catch (err) {
      console.error("Error adding service:", err);
      toast.error("Something went wrong. Please try again.", { position: "top-center", autoClose: 3500 });
    }
  };

  return (
    <>
      <ToastContainer />
      <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
        <DialogTrigger asChild>
          <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add New Service
          </Button>
        </DialogTrigger>

        <DialogContent className="!w-[95vw] !max-w-6xl max-h-[90vh] overflow-y-auto p-8 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-green-800">Add New Service</DialogTitle>
            <DialogDescription>
              Fill in all details for your service, including schedule, packages, and documents.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <div>
                <Label className="text-green-700">Category</Label>
                <Select onValueChange={(value) => setNewService((prev) => ({ ...prev, category: value }))}>
                  <SelectTrigger className="border-green-200 focus:border-green-500">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(list) && list.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-green-700">Description (max 250 words)</Label>
                <Textarea
                  value={newService.description}
                  onChange={(e) => {
                    const text = e.target.value;
                    const words = text.trim().split(/\s+/).filter(Boolean);
                    if (words.length <= 250) {
                      setNewService((prev) => ({ ...prev, description: text }));
                    } else {
                      const trimmed = words.slice(0, 250).join(" ");
                      setNewService((prev) => ({ ...prev, description: trimmed }));
                      toast.info("Description limited to 250 words.", { position: "top-center", autoClose: 2000 });
                    }
                  }}
                  rows={4}
                  className="border-green-200 focus:border-green-500"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {wordCount} of 250 words
                </div>
              </div>

              <div>
                <Label className="text-green-700">Rate (NPR)/hour</Label>
                <Input
                  type="number"
                  value={newService.rate}
                  onChange={(e) => setNewService((prev) => ({ ...prev, rate: e.target.value }))}
                  className="border-green-200 focus:border-green-500"
                />
              </div>

              <div>
                <Label className="text-green-700">Service Locations</Label>
                <div className="relative">
                  <Button
                    variant="outline"
                    className="w-full justify-between border-green-200 hover:border-green-500 bg-transparent"
                    onClick={() => setNewService((prev) => ({ ...prev, showLocationDropdown: !prev.showLocationDropdown }))}
                  >
                    <span>{newService.locations.length ? `${newService.locations.length} selected` : "Select locations"}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0" />
                  </Button>
                  {newService.showLocationDropdown && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-green-200 rounded-md shadow-lg max-h-48 overflow-auto">
                      {locationsLoading && <div className="p-3 text-sm text-gray-500">Loading locations...</div>}
                      {!locationsLoading && locationsList.length === 0 && <div className="p-3 text-sm text-gray-500">No locations found</div>}
                      {!locationsLoading && locationsList.map((loc) => (
                        <div
                          key={loc.id}
                          className="flex items-center px-3 py-2 hover:bg-green-50 cursor-pointer"
                          onClick={() =>
                            setNewService((prev) => ({
                              ...prev,
                              locations: prev.locations.includes(loc.id) ? prev.locations.filter((l) => l !== loc.id) : [...prev.locations, loc.id],
                            }))
                          }
                        >
                          <input type="checkbox" checked={newService.locations.includes(loc.id)} className="mr-3 accent-green-600" readOnly />
                          <span className="text-sm">{loc.city}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-green-700">Upload Documents</Label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-green-200 rounded-lg cursor-pointer bg-green-50 hover:bg-green-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-8 w-8 text-green-600 mb-2" />
                    <p className="text-sm text-green-700">Click to upload or drag and drop</p>
                  </div>
                  <input type="file" className="hidden" multiple onChange={handleFileUpload} />
                </label>
                {newService.documents.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {newService.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 text-green-600" />
                          <span className="text-sm text-green-800">{doc.name}</span>
                        </div>
                        <button type="button" onClick={() => handleRemoveFile(doc.name)} className="text-red-500 hover:text-red-700 p-1">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label className="text-green-700">Photos (required, up to 8)</Label>
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-green-200 rounded-lg cursor-pointer bg-green-50 hover:bg-green-100">
                  <div className="flex flex-col items-center justify-center pt-3 pb-4">
                    <Upload className="h-6 w-6 text-green-600 mb-2" />
                    <p className="text-sm text-green-700">Click to upload photos (you can select multiple)</p>
                    <p className="text-xs text-gray-500 mt-1">Minimum 1 photo required. Max 8 photos.</p>
                  </div>
                  <input type="file" accept="image/*" className="hidden" multiple onChange={handlePhotoUpload} />
                </label>

                {photoPreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {photoPreviews.map((p) => (
                      <div key={p.id} className="relative rounded overflow-hidden border">
                        <img src={p.url} alt={p.name} className="object-cover w-full h-24" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(p.id)}
                          className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-green-800 border-b border-green-100 pb-2 flex items-center gap-2"><Clock className="h-4 w-4" /> Weekly Schedule</h3>
              <div className="space-y-3">
                {newService.schedule.map((daySlot, dayIdx) => (
                  <div key={daySlot.day} className="border border-green-200 rounded-lg p-4 bg-white hover:bg-green-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={daySlot.available} onChange={(e) => handleScheduleChange(dayIdx, e.target.checked)} className="w-4 h-4 accent-green-600" />
                        <span className="font-medium text-green-800">{daySlot.day}</span>
                      </div>
                      {daySlot.available && <Button type="button" variant="outline" size="sm" onClick={() => addTimeSlot(dayIdx)} className="text-green-600 border-green-300 hover:bg-green-100"><Plus className="h-3 w-3 mr-1" />Add Time</Button>}
                    </div>
                    {daySlot.available && (
                      <div className="space-y-2 ml-7">
                        {daySlot.times.length === 0 ? (
                          <p className="text-sm text-green-600 italic">No time slots added yet</p>
                        ) : (
                          daySlot.times.map((timeRange, timeIdx) => {
                            const [startTime = "", endTime = ""] = timeRange.split(" - ");
                            return (
                              <div key={timeIdx} className="flex gap-2 items-center">
                                <Input type="time" value={startTime} onChange={(e) => handleTimeChange(dayIdx, timeIdx, `${e.target.value} - ${endTime}`)} className="border-green-200 focus:border-green-500 text-sm" />
                                <span className="text-green-600">to</span>
                                <Input type="time" value={endTime} onChange={(e) => handleTimeChange(dayIdx, timeIdx, `${startTime} - ${e.target.value}`)} className="border-green-200 focus:border-green-500 text-sm" />
                                <Button type="button" variant="ghost" size="sm" onClick={() => removeTimeSlot(dayIdx, timeIdx)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"><X className="h-4 w-4" /></Button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <h3 className='text-lg font-semibold text-green-800 mb-2 flex items-center gap-2'>
                  <Plus className="h-4 w-4" /> What this Service includes
                </h3>
                <ul className="list-disc list-inside space-y-1 mb-2">
                  {Array.isArray(newService.includes) && newService.includes.map((item, idx) => (
                    <li key={idx} className="flex items-center justify-between bg-green-50 px-2 py-1 rounded">
                      <span>{item}</span>
                      <button type="button" onClick={() => {
                        setNewService((prev) => ({ ...prev, includes: prev.includes.filter((_, i) => i !== idx) }));
                      }} className="text-red-500 hover:text-red-700"><X className="h-4 w-4" /></button>
                    </li>
                  ))}
                </ul>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add an included item..."
                    value={newService.newInclude || ""}
                    onChange={(e) => setNewService((prev) => ({ ...prev, newInclude: e.target.value }))}
                    className="border-green-200 focus:border-green-500 flex-1"
                  />
                  <Button type="button" onClick={() => {
                    if (newService.newInclude && newService.newInclude.trim() !== "") {
                      setNewService((prev) => ({
                        ...prev,
                        includes: [...prev.includes, prev.newInclude.trim()],
                        newInclude: "",
                      }));
                    }
                  }} className="bg-green-600 hover:bg-green-700 text-white">Add</Button>
                </div>

                <div className="mt-4">
                  <Label className="text-green-700 font-medium">Additional Notes</Label>
                  <Textarea
                    placeholder="Add any extra notes or special instructions..."
                    value={newService.note || ""}
                    onChange={(e) => setNewService((prev) => ({ ...prev, note: e.target.value }))}
                    rows={4}
                    className="border-green-200 focus:border-green-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-green-100">
            <Button variant="outline" onClick={() => setIsAddServiceOpen(false)} className="border-green-300 text-green-700 hover:bg-green-50">Cancel</Button>
            <Button onClick={handleAddService} className="bg-green-600 hover:bg-green-700 text-white" disabled={!newService.photos || newService.photos.length === 0}>Save Service</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}