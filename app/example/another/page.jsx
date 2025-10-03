"use client"
import React, { useState } from "react";
import { Upload, CheckCircle, XCircle, Clock } from "lucide-react";

const dummyServices = [
  {
    id: 1,
    name: "Plumbing",
    documents: [
      { type: "License", status: "approved" },
      { type: "Insurance", status: "pending" },
    ],
    status: "pending",
  },
  {
    id: 2,
    name: "Electrical",
    documents: [
      { type: "Certification", status: "rejected" },
      { type: "Insurance", status: "approved" },
    ],
    status: "rejected",
  },
];

export default function ProviderDashboard() {
  const [services, setServices] = useState(dummyServices);

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="text-green-500" size={18} />;
      case "rejected":
        return <XCircle className="text-red-500" size={18} />;
      case "pending":
      default:
        return <Clock className="text-yellow-500" size={18} />;
    }
  };

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {services.map((service) => (
        <div
          key={service.id}
          className="border rounded-2xl shadow-md p-4 bg-white"
        >
          <h2 className="text-xl font-semibold mb-2">{service.name}</h2>
          <div className="flex items-center mb-3">
            <span className="mr-2">Status:</span>
            {getStatusIcon(service.status)}
            <span className="ml-2 capitalize font-medium">{service.status}</span>
          </div>

          <h3 className="font-medium mb-2">Documents</h3>
          <ul className="space-y-2">
            {service.documents.map((doc, i) => (
              <li
                key={i}
                className="flex items-center justify-between border p-2 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  {getStatusIcon(doc.status)}
                  <span>{doc.type}</span>
                </div>
                <button className="flex items-center border px-2 py-1 rounded text-sm">
                  <Upload size={16} className="mr-1" /> Re-upload
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <h3 className="font-medium mb-2">Add New Document</h3>
            <div className="flex space-x-2">
              <input type="file" className="flex-1 border rounded px-2 py-1" />
              <button className="bg-blue-500 text-white px-3 rounded">Upload</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
