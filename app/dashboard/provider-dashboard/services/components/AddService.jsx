"use client";
import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Plus, Upload, FileText, ChevronsUpDown, Clock, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
// import { fetchServices } from "@/app/redux/slices/categorySlice";
// import fetchAllServices from "@/app/redux/slices/service.all";
import { fetchAllServicesReal } from "@/app/redux/slices/serviceallSlice";
import { fetchMyServices } from "@/app/redux/slices/serviceSlice";
export default function AddService() {
  const dispatch = useDispatch();
  

  const {list} = useSelector((state) => state.allServices);
  console.log("This is the list in add service",list);

  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);

  const [newService, setNewService] = useState({
    category: "",
    description: "",
    rate: "",
    locations: [],
    documents: [],
    showLocationDropdown: false,
    includes:[],
    note:"",
    schedule: [
      { day: "Monday", available: false, times: [] },
      { day: "Tuesday", available: false, times: [] },
      { day: "Wednesday", available: false, times: [] },
      { day: "Thursday", available: false, times: [] },
      { day: "Friday", available: false, times: [] },
      { day: "Saturday", available: false, times: [] },
      { day: "Sunday", available: false, times: [] },
    ],
  });

  

  const dummyLocation = [
    "Itahari",
    "Mangalbare",
    "Biratchowk",
    "Kerkha",
    "Dharan",
    "KanchanBari",
  ];

  useEffect(() => {
    dispatch(fetchAllServicesReal());
  }, [dispatch]);

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
    const files = Array.from(e.target.files);
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

  
  
  

const handleAddService = async () => {
  try {
    console.log("Submitting new service:", newService);

    const mappedLocations = newService.locations.map(loc => ({
      address: loc.address || loc.name || loc || "",
      city: loc.city || "",
      state: loc.state || "",
      zipcode: loc.zipcode || ""
    }));

    const mappedSchedules = [];
    newService.schedule.forEach(day => {
      if (day.available) {
        day.times.forEach(timeRange => {
          const [start_time = "", end_time = ""] = timeRange.split(" - ");
          mappedSchedules.push({
            day_of_week: day.day,
            start_time,
            end_time
          });
        });
      }
    });

    const mappedDocuments = newService.documents.map(file => ({
      image_type: file.type || "document",
      image_path: `/uploads/${file.name}`
    }));

    const payload = {
      serviceId: newService.category,
      description: newService.description,
      rate: parseFloat(newService.rate),
      location: mappedLocations,
      schedules: mappedSchedules,
      serviceDocuments: mappedDocuments,
      include: newService.includes || [],
      notes: newService.note || ""
    };

    const res = await fetch("http://localhost:5000/api/services/add", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const result = await res.json();
    console.log("This is result", result);

    if (!res.ok) {
      
      toast.error(result.data ||"Something went wrong. Please try again.", {
              position: "top-center",
              autoClose: 3500,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
      return; // stop further execution
    }

    // Success toast
    toast.success("Service added successfully!", {
      position: "top-center",
      autoClose: 3500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });

    // Refresh user services
    dispatch(fetchMyServices());

    // Reset form
    setIsAddServiceOpen(true);
    setNewService({
      category: "",
      description: "",
      rate: "",
      locations: [],
      documents: [],
      thumbnail: null,
      showLocationDropdown: false,
      schedule: newService.schedule.map(day => ({ ...day, available: false, times: [] })),
      includes: [],
      note: "",
      newInclude: "",
    });

  } catch (err) {
    console.error("Error adding service:", err);

    // Show unexpected error in toast
    toast.error("Something went wrong. Please try again.", {
      position: "top-center",
      autoClose: 3500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
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

        {/* Service Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-4">
            {/* Category */}
            <div>
              <Label className="text-green-700">Category</Label>
              <Select onValueChange={value => setNewService(prev => ({ ...prev, category: value }))}>
                <SelectTrigger className="border-green-200 focus:border-green-500">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Array.isArray(list) && list.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Description */}
            <div>
              <Label className="text-green-700">Description</Label>
              <Textarea
                value={newService.description}
                onChange={e => setNewService(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="border-green-200 focus:border-green-500"
              />
            </div>
            {/* Rate */}
            <div>
              <Label className="text-green-700">Rate (NPR)/hour</Label>
              <Input
                type="number"
                value={newService.rate}
                onChange={e => setNewService(prev => ({ ...prev, rate: e.target.value }))}
                className="border-green-200 focus:border-green-500"
              />
            </div>
            {/* Locations */}
            <div>
              <Label className="text-green-700">Service Locations</Label>
              <div className="relative">
                <Button
                  variant="outline"
                  className="w-full justify-between border-green-200 hover:border-green-500 bg-transparent"
                  onClick={() => setNewService(prev => ({ ...prev, showLocationDropdown: !prev.showLocationDropdown }))}
                >
                  <span>{newService.locations.length ? `${newService.locations.length} selected` : "Select locations"}</span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0" />
                </Button>
                {newService.showLocationDropdown && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-green-200 rounded-md shadow-lg max-h-48 overflow-auto">
                    {dummyLocation.map(loc => (
                      <div
                        key={loc}
                        className="flex items-center px-3 py-2 hover:bg-green-50 cursor-pointer"
                        onClick={() => setNewService(prev => ({
                          ...prev,
                          locations: prev.locations.includes(loc)
                            ? prev.locations.filter(l => l !== loc)
                            : [...prev.locations, loc],
                        }))}
                      >
                        <input type="checkbox" checked={newService.locations.includes(loc)} className="mr-3 accent-green-600" readOnly />
                        <span className="text-sm">{loc}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Documents */}
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
            {/* Thumbnail */}
            <div>
              <Label className="text-green-700">Thumbnail Image</Label>
              <input type="file" accept="image/*" onChange={e => setNewService(prev => ({ ...prev, thumbnail: e.target.files[0] }))} className="mt-2" />
            </div>
          </div>

          {/* Right Column - Schedule & Packages */}
          <div className="space-y-4">
            {/* Schedule */}
            <h3 className="font-semibold text-green-800 border-b border-green-100 pb-2 flex items-center gap-2"><Clock className="h-4 w-4" /> Weekly Schedule</h3>
            <div className="space-y-3">
              {newService.schedule.map((daySlot, dayIdx) => (
                <div key={daySlot.day} className="border border-green-200 rounded-lg p-4 bg-white hover:bg-green-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={daySlot.available} onChange={e => handleScheduleChange(dayIdx, e.target.checked)} className="w-4 h-4 accent-green-600" />
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
                              <Input type="time" value={startTime} onChange={e => handleTimeChange(dayIdx, timeIdx, `${e.target.value} - ${endTime}`)} className="border-green-200 focus:border-green-500 text-sm" />
                              <span className="text-green-600">to</span>
                              <Input type="time" value={endTime} onChange={e => handleTimeChange(dayIdx, timeIdx, `${startTime} - ${e.target.value}`)} className="border-green-200 focus:border-green-500 text-sm" />
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


            {/* includes wala section */}
            <div className="mt-4">
              <h3 className='text-lg font-semibold text-green-800 mb-2 flex items-center gap-2'>
                <Plus className="h-4 w-4" /> What this Service includes

              </h3>
              <ul className="list-disc list-inside space-y-1 mb-2">
        {Array.isArray(newService.includes) && newService.includes.map((item, idx) => (
          <li key={idx} className="flex items-center justify-between bg-green-50 px-2 py-1 rounded">
            <span>{item}</span>
            <button type="button" onClick={() => {
              setNewService(prev => ({
                ...prev,
                includes: prev.includes.filter((_, i) => i !== idx)
              }))
            }} className="text-red-500 hover:text-red-700"><X className="h-4 w-4" /></button>
          </li>
        ))}
      </ul>
      {/*  */}
      <div className="flex gap-2">
        <Input placeholder = "Add an included item..."
        value={newService.newInclude || ""}
        onChange={e => setNewService(prev => ({ ...prev, newInclude: e.target.value }))}
        className="border-green-200 focus:border-green-500 flex-1"/>
        <Button type="button" onClick={()=>{
          if(newService.newInclude && newService.newInclude.trim() !== ""){
            setNewService(prev => ({
              ...prev,
              includes: [...prev.includes, prev.newInclude.trim()],
              newInclude: ""
            }))
          }
        }} className="bg-green-600 hover:bg-green-700 text-white">Add</Button>


        </div>

        {/* note wala section */}
        <div className="mt-4">
    <Label className="text-green-700 font-medium">Additional Notes</Label>
    <Textarea
      placeholder="Add any extra notes or special instructions..."
      value={newService.note || ""}
      onChange={e => setNewService(prev => ({ ...prev, note: e.target.value }))}
      rows={4}
      className="border-green-200 focus:border-green-500"
    />
  </div>
            </div>

          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-green-100">
          <Button variant="outline" onClick={() => setIsAddServiceOpen(false)} className="border-green-300 text-green-700 hover:bg-green-50">Cancel</Button>
          <Button onClick={handleAddService} className="bg-green-600 hover:bg-green-700 text-white">Save Service</Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
