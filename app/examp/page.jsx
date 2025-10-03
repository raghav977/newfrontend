"use client";
import { useState } from "react";
// import { Input, Textarea, Button, Switch } from "@/components/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SimpleServiceForm() {
  const [step, setStep] = useState(0);
  const [useSubcategories, setUseSubcategories] = useState(false);

  const [service, setService] = useState({
    category: "",
    description: "",
    basePrice: "",
  });

  const [subcategories, setSubcategories] = useState([]);
  const [packages, setPackages] = useState([]);

  const handleNext = () => {
    let nextStep = step + 1;
    if (nextStep === 1 && !useSubcategories) nextStep += 1; // skip subcategory step
    setStep(nextStep);
  };

  const handlePrevious = () => {
    let prevStep = step - 1;
    if (step === 2 && !useSubcategories) prevStep -= 1; // skip subcategory step
    setStep(prevStep);
  };

  const addSubcategory = () =>
    setSubcategories([...subcategories, { name: "", price: "" }]);
  const addPackage = () =>
    setPackages([...packages, { name: "", price: "" }]);

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="space-y-3">
            <input
              placeholder="Category"
              value={service.category}
              onChange={(e) =>
                setService({ ...service, category: e.target.value })
              }
            />
            <textarea
              placeholder="Description"
              value={service.description}
              onChange={(e) =>
                setService({ ...service, description: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="Base Price"
              value={service.basePrice}
              onChange={(e) =>
                setService({ ...service, basePrice: e.target.value })
              }
            />
            <div className="flex items-center gap-2">
              <span>Use Subcategories?</span>
              <switch
                checked={useSubcategories}
                onCheckedChange={setUseSubcategories}
              />
            </div>
          </div>
        );
      case 1:
        return useSubcategories ? (
          <div className="space-y-3">
            <button onClick={addSubcategory}>+ Add Subcategory</button>
            {subcategories.map((sub, idx) => (
              <div key={idx} className="space-y-2 border p-2 rounded">
                <input
                  placeholder="Subcategory Name"
                  value={sub.name}
                  onChange={(e) => {
                    const updated = [...subcategories];
                    updated[idx].name = e.target.value;
                    setSubcategories(updated);
                  }}
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={sub.price}
                  onChange={(e) => {
                    const updated = [...subcategories];
                    updated[idx].price = e.target.value;
                    setSubcategories(updated);
                  }}
                />
              </div>
            ))}
          </div>
        ) : null;
      case 2:
        return (
          <div className="space-y-3">
            <button onClick={addPackage}>+ Add Package</button>
            {packages.map((pkg, idx) => (
              <div key={idx} className="space-y-2 border p-2 rounded">
                <input
                  placeholder="Package Name"
                  value={pkg.name}
                  onChange={(e) => {
                    const updated = [...packages];
                    updated[idx].name = e.target.value;
                    setPackages(updated);
                  }}
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={pkg.price}
                  onChange={(e) => {
                    const updated = [...packages];
                    updated[idx].price = e.target.value;
                    setPackages(updated);
                  }}
                />
              </div>
            ))}
          </div>
        );
      default:
        return <div>Review & Submit</div>;
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-4 p-4 border rounded shadow">
      {renderStep()}

      <div className="flex justify-between mt-4">
        <button
          variant="outline"
          disabled={step === 0}
          onClick={handlePrevious}
        >
          <ChevronLeft className="mr-1" /> Previous
        </button>

        {step < 2 ? (
          <button onClick={handleNext}>
            Next <ChevronRight className="ml-1" />
          </button>
        ) : (
          <button className="bg-green-600 text-white">Save Service</button>
        )}
      </div>
    </div>
  );
}
