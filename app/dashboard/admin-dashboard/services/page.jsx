"use client";

import ServiceList from "./components/ServiceList";

export default function ServicePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-green-800 mb-6">Admin Service Page</h1>
      <ServiceList />
    </div>
  );
}
