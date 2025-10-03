"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function PackageContent({ packages = [] }) {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  if (!packages.length) return <p className="text-slate-600">No packages available.</p>;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-slate-800 mb-2">Packages</h3>
      <div className="space-y-2">
        {packages.map((pkg, index) => {
          const includes = pkg.includes ? pkg.includes : [];
          return (
            <div key={index} className="border rounded-md p-4 bg-white shadow-sm">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleExpand(index)}>
                <h4 className="font-medium text-slate-900">{pkg.name}</h4>
                {expandedIndex === index ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>

              {expandedIndex === index && (
                <div className="mt-3 space-y-2 text-slate-700">
                  <p><span className="font-semibold">Price:</span> Rs.{pkg.price}</p>
                  <p><span className="font-semibold">Description:</span> {pkg.description}</p>
                  {includes.length > 0 && (
                    <div>
                      <p className="font-semibold">Includes:</p>
                      <ul className="list-disc list-inside ml-4">
                        {includes.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {pkg.note && <p><span className="font-semibold">Note:</span> {pkg.note}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
