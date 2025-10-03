"use client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { Plus, Upload, FileText, ChevronsUpDown, Clock, X } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import ScheduleForm from "./ScheduleForm"
import { Button } from "@/components/ui/button";

export default function ServiceDetailsForm({ newService, setNewService, categories }) {

      const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(
      (file) =>
        [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ].includes(file.type) && file.size <= 10 * 1024 * 1024
    );
    setNewService((prev) => ({
      ...prev,
      documents: [...prev.documents, ...validFiles],
    }));
  };

  const handleRemoveFile = (fileName) => {
    setNewService((prev) => ({
      ...prev,
      documents: prev.documents.filter((f) => f.name !== fileName),
    }));
  };


    const dummyLocation = [
    "Itahari",
    "Mangalbare",
    "Biratchowk",
    "Kerkha",
    "Dharan",
    "KanchanBari",
  ];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        {/* Category Dropdown */}
        <div>
          <Label className="text-green-700">Category</Label>
          <Select
            onValueChange={(value) => setNewService({ ...newService, category: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div>
          <Label className="text-green-700">Description</Label>
          <Textarea
            value={newService.description}
            onChange={(e) =>
              setNewService({ ...newService, description: e.target.value })
            }
            rows={4}
          />
        </div>

        {/* Rate */}
        <div>
          <Label className="text-green-700">Rate</Label>
          <Input
            type="number"
            value={newService.rate}
            onChange={(e) => setNewService({ ...newService, rate: e.target.value })}
          />
        </div>

        <div>
                        <Label className="text-green-700">Service Locations</Label>
                        <div className="relative">
                          <Button
                            variant="outline"
                            className="w-full justify-between border-green-200 hover:border-green-500 bg-transparent"
                            onClick={() =>
                              setNewService((prev) => ({
                                ...prev,
                                showLocationDropdown: !prev.showLocationDropdown,
                              }))
                            }
                          >
                            <span className="truncate">
                              {newService.locations.length
                                ? `${newService.locations.length} location${
                                    newService.locations.length > 1 ? "s" : ""
                                  } selected`
                                : "Select locations"}
                            </span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0" />
                          </Button>
                          {newService.showLocationDropdown && (
                            <div className="absolute z-10 mt-1 w-full bg-white border border-green-200 rounded-md shadow-lg max-h-48 overflow-auto">
                              {dummyLocation.map((loc) => (
                                <div
                                  key={loc}
                                  className="flex items-center px-3 py-2 hover:bg-green-50 cursor-pointer"
                                  onClick={() => {
                                    setNewService((prev) => {
                                      const locations = prev.locations || [];
                                      if (locations.includes(loc)) {
                                        return {
                                          ...prev,
                                          locations: locations.filter((l) => l !== loc),
                                        };
                                      } else {
                                        return {
                                          ...prev,
                                          locations: [...locations, loc],
                                        };
                                      }
                                    });
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={newService.locations.includes(loc)}
                                    className="mr-3 accent-green-600"
                                    readOnly
                                  />
                                  <span className="text-sm">{loc}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {/* Selected locations display */}
                        {newService.locations.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {newService.locations.map((loc) => (
                              <span
                                key={loc}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                              >
                                {loc}
                                <button
                                  onClick={() => {
                                    setNewService((prev) => ({
                                      ...prev,
                                      locations: prev.locations.filter((l) => l !== loc),
                                    }));
                                  }}
                                  className="hover:text-green-600"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>

                          
                        )}
                        <div>
                                        <Label className="text-green-700">Upload Documents</Label>
                                        <div className="mt-2">
                                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-green-200 rounded-lg cursor-pointer bg-green-50 hover:bg-green-100 transition-colors">
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                              <Upload className="h-8 w-8 text-green-600 mb-2" />
                                              <p className="text-sm text-green-700">
                                                <span className="font-medium">Click to upload</span> or
                                                drag and drop
                                              </p>
                                              <p className="text-xs text-green-600">
                                                PDF, DOC, DOCX (MAX. 10MB)
                                              </p>
                                            </div>
                                            <input
                                              id="documents"
                                              type="file"
                                              className="hidden"
                                              multiple
                                              accept=".pdf,.doc,.docx"
                                              onChange={handleFileUpload}
                                            />
                                          </label>
                                          {newService.documents.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                              {newService.documents.map((doc, index) => (
                                                <div
                                                  key={index}
                                                  className="flex items-center justify-between p-2 bg-green-50 rounded-lg"
                                                >
                                                  <div className="flex items-center">
                                                    <FileText className="h-4 w-4 mr-2 text-green-600" />
                                                    <span className="text-sm text-green-800">
                                                      {doc.name}
                                                    </span>
                                                  </div>
                                                  <button
                                                    type="button"
                                                    onClick={() => handleRemoveFile(doc.name)}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                  >
                                                    <X className="h-4 w-4" />
                                                  </button>
                                                </div>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                      </div>
      </div>

      {/* You can add schedule or other inputs in right column */}
      <div className="space-y-4">
        <ScheduleForm newService={newService} setNewService={setNewService} />
        {/* Schedule or other info can go here */}
      </div>
    </div>
  );
}
