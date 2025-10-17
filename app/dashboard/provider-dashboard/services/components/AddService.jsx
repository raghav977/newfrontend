"use client";
import { useState, useEffect, useMemo } from "react";
// import { useToast } from "@/components/ui/use-toast";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Map from "../../../../../components/Map";
import MapforService from "../../../../../components/map/MapforService";

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

const BASE_URL = "http://localhost:5000";

const INITIAL_SCHEDULE = [
  { day: "Monday", available: false, times: [] },
  { day: "Tuesday", available: false, times: [] },
  { day: "Wednesday", available: false, times: [] },
  { day: "Thursday", available: false, times: [] },
  { day: "Friday", available: false, times: [] },
  { day: "Saturday", available: false, times: [] },
  { day: "Sunday", available: false, times: [] },
];

export default function AddService({ open = undefined, onOpenChange = undefined, editService = null }) {
  const isControlled = typeof open === "boolean" && typeof onOpenChange === "function";
  const isEditMode = Boolean(editService);

  console.log("Edit service in AddService:", editService);

  const dispatch = useDispatch();
  const { list } = useSelector((state) => state.allServices || {});

  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const dialogOpen = isControlled ? open : isAddServiceOpen;
  const setDialogOpen = (val) => {
    if (isControlled) return onOpenChange(val);
    return setIsAddServiceOpen(val);
  };

  const [showMap, setShowMap] = useState(false);
  const [newService, setNewService] = useState({
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

  // store selected location from map
  const [serviceLocation, setServiceLocation] = useState(null);

  // photo previews (handle both File objects and existing URL strings/objects)
  const [photoPreviews, setPhotoPreviews] = useState([]); // { id, url, source: 'file'|'url' }

  useEffect(() => {
    dispatch(fetchAllServicesReal());
  }, [dispatch]);

  // when editService provided, populate form (only once when prop changes)
  useEffect(() => {
    if (editService) {
      // Normalize schedule if missing
      const schedule = editService.schedule || INITIAL_SCHEDULE;
      // Map photos: backend may provide array of { image_path } or string path or objects
      const photos = Array.isArray(editService.ServiceImages) ? editService.ServiceImages.slice() : [];
      const serviceName = editService.Service?.name || editService.name || "";
      console.log("This is service name from editService:", serviceName);
      setNewService({
        category: editService.Service.name || editService.name || "",
        description: editService.description || "",
        rate: editService.rate || "",
        photos,
        documents: editService.documents || [],
        includes: editService.includes || [],
        note: editService.note || "",
        schedule,
        locations: editService.locations || [],
        newInclude: "",
      });

      // prefill selected map location if present
      if ((editService.locations || []).length > 0) {
        const loc = editService.locations[0];
        setServiceLocation({
          latitude: loc.latitude,
          longitude: loc.longitude,
          radius: loc.radius,
        });
      }
      // open dialog when used in controlled edit flow if not controlled externally
      if (!isControlled) setIsAddServiceOpen(true);
    } else {
      // if switching to add mode, reset
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
      setServiceLocation(null);
      if (!isControlled) setIsAddServiceOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editService]);

  // create previews when photos change (handle both File objects and existing URLs)
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // revoke previous file object URLs
    photoPreviews.forEach((p) => {
      if (p.source === "file") {
        try {
          URL.revokeObjectURL(p.url);
        } catch (e) {}
      }
    });

    const previews = (newService.photos || []).map((p, idx) => {
      if (p instanceof File) {
        return { id: `${p.name}-${idx}-${p.size}`, url: URL.createObjectURL(p), source: "file", name: p.name };
      }
      // backend object { image_path } or { path } or { url } or string path
      if (typeof p === "object" && p !== null) {
        let url = p.image_path || p.path || p.url || "";
        // prefix relative server paths
        if (url && !String(url).startsWith("http") && !String(url).startsWith("data:")) {
          url = `${BASE_URL}${url}`;
        }
        return { id: `url-${idx}`, url: url || JSON.stringify(p), source: "url", name: p.name || "" };
      }
      // plain string path
      let url = String(p);
      if (url && !url.startsWith("http") && !url.startsWith("data:")) {
        url = `${BASE_URL}${url}`;
      }
      return { id: `url-${idx}`, url, source: "url", name: "" };
    });

    setPhotoPreviews(previews);
    return () => {
      // Only run on client side
      if (typeof window === 'undefined') return;
      
      previews.forEach((p) => {
        if (p.source === "file") {
          try {
            URL.revokeObjectURL(p.url);
          } catch (e) {}
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newService.photos]);

  const handleMapOpen = () => {
    setShowMap(true);
  };

  const handleSavelocation = (data) => {
    if (!data) {
      toast.error("Please select a location first.", { position: "top-center", autoClose: 3000 });
      return;
    }
    setNewService((prev) => ({ ...prev, locations: [{ latitude: data.latitude, longitude: data.longitude, radius: data.radius }] }));
    setServiceLocation(data);
    setShowMap(false);
  };

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

  const handleRemovePhoto = (photoId) => {
    // support removing both file-backed and url-backed photos
    setNewService((prev) => ({
      ...prev,
      photos: prev.photos.filter((p, idx) => {
        // compute same id generation as previews
        if (p instanceof File) {
          return `${p.name}-${idx}-${p.size}` !== photoId;
        }
        // url / object
        const url = typeof p === "object" ? (p.image_path || p.path || p.url || JSON.stringify(p)) : String(p);
        return `url-${idx}` !== photoId && url !== photoId && (p.name ? `${p.name}-${idx}-${p.size}` !== photoId : true);
      }),
    }));
  };

  const wordCount = useMemo(() => {
    return (newService.description || "").trim().split(/\s+/).filter(Boolean).length;
  }, [newService.description]);

  const resetForm = () => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      photoPreviews.forEach((p) => {
        if (p.source === "file") {
          try {
            URL.revokeObjectURL(p.url);
          } catch (e) {}
        }
      });
    }
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
    setServiceLocation(null);
    if (!isControlled) setIsAddServiceOpen(false);
  };

  const handleAddService = async () => {
    try {
      // validations (in edit mode, relax some checks)
      if (!newService.category) {
        toast.error("Please select a category.", { position: "top-center" });
        return;
      }
      if (!newService.rate) {
        toast.error("Please enter a rate.", { position: "top-center" });
        return;
      }
      if (!isEditMode && (!Array.isArray(newService.photos) || newService.photos.length === 0)) {
        toast.error("Please upload at least one photo (max 8).", { position: "top-center" });
        return;
      }
      if (!isEditMode && (!Array.isArray(newService.locations) || newService.locations.length === 0)) {
        toast.error("Please select at least one service location.", { position: "top-center" });
        return;
      }
      if (wordCount > 250) {
        toast.error("Description exceeds 250 words.", { position: "top-center" });
        return;
      }

      // prepare schedules mapping
      const mappedSchedules = [];
      (newService.schedule || []).forEach((day) => {
        if (day.available) {
          (day.times || []).forEach((timeRange) => {
            const [start_time = "", end_time = ""] = timeRange.split(" - ");
            mappedSchedules.push({
              day_of_week: day.day,
              start_time,
              end_time,
            });
          });
        }
      });

      // build form data
      const fd = new FormData();
      // append new image files only (File instances)
      (newService.photos || []).forEach((file) => {
        if (file instanceof File) fd.append("images", file);
      });
      // include documents
      (newService.documents || []).forEach((file) => {
        if (file instanceof File) fd.append("documents", file);
      });

      fd.append("serviceId", String(newService.category));
      fd.append("description", newService.description || "");
      fd.append("rate", String(newService.rate || 0));
      fd.append("locations", JSON.stringify(newService.locations || []));
      (newService.includes || []).forEach((item) => fd.append("include[]", item));
      mappedSchedules.forEach((sch) => fd.append("schedules[]", JSON.stringify(sch)));
      fd.append("notes", newService.note || "");

      // If edit mode, call update endpoint; else create
      if (isEditMode) {
        // send list of existing photo URLs so backend can keep them if you didn't remove them
        const existingPhotos = (newService.photos || []).filter((p) => !(p instanceof File)).map((p) => (typeof p === "object" ? (p.image_path || p.path || p.url || "") : String(p)));
        fd.append("existing_photos", JSON.stringify(existingPhotos));

        const res = await fetch(`https://backendwala.onrender.com/api/service-providers/services/${editService.id}`, {
          method: "PUT",
          credentials: "include",
          body: fd,
        });

        const result = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(result.data || result.message || "Update failed. Please try again.", { position: "top-center", autoClose: 3500 });
          return;
        }
        toast.success("Service updated successfully!", { position: "top-center", autoClose: 3000 });
      } else {
        const res = await fetch("https://backendwala.onrender.com/api/services/add", {
          method: "POST",
          credentials: "include",
          body: fd,
        });
        const result = await res.json().catch(() => ({}));
        if (!res.ok) {
          toast.error(result.data || result.message || "Something went wrong. Please try again.", { position: "top-center", autoClose: 3500 });
          return;
        }
        toast.success("Service added successfully!", { position: "top-center", autoClose: 3000 });
      }

      // refresh list
      dispatch(fetchMyServices());
      resetForm();
      // close dialog
      setDialogOpen(false);
    } catch (err) {
      console.error("Error saving service:", err);
      toast.error("Something went wrong. Please try again.", { position: "top-center", autoClose: 3500 });
    }
  };

  return (
    <>
      <ToastContainer />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {/* Only show trigger when used in "add" (uncontrolled) mode */}
        {!isEditMode && !isControlled && (
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add New Service
            </Button>
          </DialogTrigger>
        )}

        <DialogContent className="!w-[95vw] !max-w-6xl max-h-[90vh] overflow-y-auto p-8 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-green-800">{isEditMode ? "Edit Service" : "Add New Service"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update allowed fields below and save changes." : "Fill in all details for your service, including schedule, packages, and documents."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-4">
              <div>
                <Label className="text-green-700">Category</Label>
                <Select
                  onValueChange={(value) => setNewService((prev) => ({ ...prev, category: value }))}
                  value={String(newService.category || "")}
                >
                  <SelectTrigger className="border-green-200 focus:border-green-500" disabled={isEditMode}>
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
                {isEditMode && <div className="text-xs text-slate-500 mt-1">Category cannot be changed for an existing service.</div>}
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
                <Label className="text-green-700">Service Locations (Radius from your current location)</Label>
                <Button
                  variant="outline"
                  className="w-full justify-between border-green-200 hover:border-green-500 bg-transparent"
                  onClick={handleMapOpen}
                  disabled={isEditMode} // editing won't allow changing location here
                >
                  Select Location
                </Button>
                {isEditMode && <div className="text-xs text-slate-500 mt-1">Location cannot be changed through this edit form.</div>}
              </div>

              {serviceLocation && (
                <div className="text-sm text-black-700 mt-2">
                  Selected Location: Lat {serviceLocation.latitude}, Lng {serviceLocation.longitude}, Radius {serviceLocation.radius} km
                </div>
              )}

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
                      <span className="font-medium text-green-800">{daySlot.day}</span>
                      {isEditMode ? null : (
                        <input
                          type="checkbox"
                          checked={daySlot.available}
                          onChange={(e) => handleScheduleChange(dayIdx, e.target.checked)}
                          className="w-4 h-4 accent-green-600"
                        />
                      )}
                    </div>

                    {daySlot.available && (
                      <div className="space-y-2 ml-7">
                        {daySlot.times.length === 0 ? (
                          <p className="text-sm text-green-600 italic">No time slots added yet</p>
                        ) : (
                          daySlot.times.map((timeRange, timeIdx) => {
                            const [startTime = "", endTime = ""] = timeRange.split(" - ");
                            return isEditMode ? (
                              <div key={timeIdx} className="flex gap-2 items-center">
                                <span className="text-green-600">{`${startTime} - ${endTime}`}</span>
                              </div>
                            ) : (
                              <div key={timeIdx} className="flex gap-2 items-center">
                                <Input
                                  type="time"
                                  value={startTime}
                                  onChange={(e) => handleTimeChange(dayIdx, timeIdx, `${e.target.value} - ${endTime}`)}
                                  className="border-green-200 focus:border-green-500 text-sm"
                                />
                                <span className="text-green-600">to</span>
                                <Input
                                  type="time"
                                  value={endTime}
                                  onChange={(e) => handleTimeChange(dayIdx, timeIdx, `${startTime} - ${e.target.value}`)}
                                  className="border-green-200 focus:border-green-500 text-sm"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeTimeSlot(dayIdx, timeIdx)}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                          })
                        )}
                        {!isEditMode && (
                          <div className="mt-2">
                            <Button size="sm" onClick={() => addTimeSlot(dayIdx)}>Add time slot</Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center gap-2">
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

          {showMap && (
            <div className="fixed inset-0 flex items-center justify-center z-50 overflow-hidden">
              <div className="rounded-2xl shadow-2xl w-11/12 max-w-3xl bg-white relative p-6" style={{ maxHeight: "90vh", overflowY: "auto" }}>
                <button onClick={() => setShowMap(false)} className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold">✕</button>

                <h2 className="text-xl font-semibold mb-4 text-gray-800">Select Your Service Area</h2>
                <MapforService
                  onChange={(data) => {
                    setServiceLocation(data);
                  }}
                />

                <div className="flex justify-end mt-4">
                  <button onClick={() => handleSavelocation(serviceLocation)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow">Save Location</button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t border-green-100">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-green-300 text-green-700 hover:bg-green-50">Cancel</Button>
            <Button
              onClick={handleAddService}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={!isEditMode && (!newService.photos || newService.photos.length === 0)}
            >
              {isEditMode ? "Save Changes" : "Save Service"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}