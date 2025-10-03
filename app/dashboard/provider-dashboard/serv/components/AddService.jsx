"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCategories } from "@/app/redux/slices/categorySlice";

import ServiceDetailsForm from "./ServiceDetailsForm";
import PackagesForm from "./PackageForm";

export default function AddService() {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.category.list || []);

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  const [newService, setNewService] = useState({
    category: "",
    description: "",
    rate: "",
    locations: [],
    documents: [],
    thumbnail: null,
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

  const [useSubcategories, setUseSubcategories] = useState(false);
  const [subcategories, setSubcategories] = useState([]);
  const [packages, setPackages] = useState([]); 

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const handlePrevious = () => (step === 0 ? setIsOpen(false) : setStep(step - 1));
  const handleNext = () => setStep(step + 1);

  const handleAddService = async () => {
    // API call logic here
    console.log("This is service",newService);
    console.log("This is subcategory",subcategories);
    console.log("This is package",packages)
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add New Service
        </Button>
      </DialogTrigger>

      <DialogContent className="!w-[95vw] !max-w-6xl max-h-[90vh] overflow-y-auto p-8 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-green-800">
            {step === 0 ? "Add New Service" : "Service Packages & Subcategories"}
          </DialogTitle>
          <DialogDescription>
            {step === 0
              ? "Fill in the details for your new service and set your availability schedule."
              : "Configure packages or subcategories for your service."}
          </DialogDescription>
        </DialogHeader>

        {/* Step Content */}
        {step === 0 ? (
          <ServiceDetailsForm
            newService={newService}
            setNewService={setNewService}
            categories={categories}
          />
        ) : (
          <PackagesForm
            useSubcategories={useSubcategories}
            setUseSubcategories={setUseSubcategories}
            subcategories={subcategories}
            setSubcategories={setSubcategories}
            packages={packages}
            setPackages={setPackages}
          />
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-green-100">
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="border-green-300 text-green-700 hover:bg-green-50"
          >
            {step === 0 ? "Cancel" : "Previous"}
          </Button>

          {step === 0 ? (
            <Button
              onClick={handleNext}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleAddService}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Save Service
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
