"use client"
import React, { useState } from "react";
// import axios from "axios";

const services = [
  { id: 1, name: "Plumbing" },
  { id: 2, name: "Carpentry" },
  { id: 3, name: "Electrician" },
  { id: 4, name: "Painter" }
];

export default function KycForm() {
  const [kycList, setKycList] = useState([]);

  const handleAddService = (service) => {
    if (!kycList.find(k => k.subCategoryId === service.id)) {
      setKycList([
        ...kycList,
        {
          subCategoryId: service.id,
          serviceName: service.name,
          qualification: "",
          experience: "",
          document_url: "",
          selfie_url: ""
        }
      ]);
    }
  };

  const handleChange = (index, field, value) => {
    const newList = [...kycList];
    newList[index][field] = value;
    setKycList(newList);
  };

  const handleSubmit = async () => {
    const payload = {
      userId: 1, // replace with actual logged-in user ID
      services: kycList
    };
    console.log("Submitting KYC data:", payload);
    // axios.post("/api/kyc", payload); // uncomment when backend ready
    alert("KYC submitted! Check console for payload.");
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">KYC Form</h2>

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Select Services:</h3>
        {services.map(service => (
          <button
            key={service.id}
            className="bg-blue-500 text-white px-3 py-1 mr-2 mb-2 rounded"
            onClick={() => handleAddService(service)}
          >
            {service.name}
          </button>
        ))}
      </div>

      {kycList.map((kyc, index) => (
        <div key={kyc.subCategoryId} className="border p-4 mb-4 rounded shadow-sm">
          <h4 className="font-semibold mb-2">{kyc.serviceName}</h4>

          <label className="block mb-2">
            Qualification:
            <input
              type="text"
              value={kyc.qualification}
              onChange={(e) => handleChange(index, "qualification", e.target.value)}
              className="border p-1 w-full"
            />
          </label>

          <label className="block mb-2">
            Experience:
            <input
              type="text"
              value={kyc.experience}
              onChange={(e) => handleChange(index, "experience", e.target.value)}
              className="border p-1 w-full"
            />
          </label>

          <label className="block mb-2">
            Document URL:
            <input
              type="text"
              value={kyc.document_url}
              onChange={(e) => handleChange(index, "document_url", e.target.value)}
              className="border p-1 w-full"
            />
          </label>

          <label className="block mb-2">
            Selfie URL:
            <input
              type="text"
              value={kyc.selfie_url}
              onChange={(e) => handleChange(index, "selfie_url", e.target.value)}
              className="border p-1 w-full"
            />
          </label>
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Submit KYC
      </button>
    </div>
  );
}
