"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

// Mock data
const mockServices = [
  { id: 1, name: "Web Development", description: "Full stack web solutions" },
  { id: 2, name: "Graphic Design", description: "Branding & UI/UX design" },
];

export default function Dashboard() {
  const [selectedService, setSelectedService] = useState(null);
  const [packages, setPackages] = useState({});

  const handleAddPackage = (serviceId, pkg) => {
    setPackages((prev) => ({
      ...prev,
      [serviceId]: [...(prev[serviceId] || []), pkg],
    }));
  };

  return (
    <div className="p-6 grid gap-6">
      {!selectedService && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockServices.map((service) => (
            <Card key={service.id} className="shadow-lg rounded-2xl">
              <CardContent className="p-6 flex flex-col gap-4">
                <h2 className="text-xl font-bold">{service.name}</h2>
                <p className="text-gray-600">{service.description}</p>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => setSelectedService(service)}>View</Button>
                  <Button variant="outline">Edit</Button>
                  <Button variant="destructive">Delete</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedService && (
        <ServiceDetail
          service={selectedService}
          packages={packages[selectedService.id] || []}
          onBack={() => setSelectedService(null)}
          onAddPackage={(pkg) => handleAddPackage(selectedService.id, pkg)}
        />
      )}
    </div>
  );
}

function ServiceDetail({ service, packages, onBack, onAddPackage }) {
  const [newPkg, setNewPkg] = useState("");

  const handleSubmit = () => {
    if (newPkg.trim()) {
      onAddPackage({ name: newPkg, price: "$100" });
      setNewPkg("");
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={onBack}>
        ← Back
      </Button>
      <h1 className="text-2xl font-bold">{service.name}</h1>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <p className="text-gray-600">{service.description}</p>
        </TabsContent>

        <TabsContent value="packages">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="New package name"
                value={newPkg}
                onChange={(e) => setNewPkg(e.target.value)}
              />
              <Button onClick={handleSubmit}>Add</Button>
            </div>
            <div className="grid gap-3">
              {packages.length === 0 && <p className="text-gray-500">No packages yet.</p>}
              {packages.map((pkg, idx) => (
                <Card key={idx} className="p-4 flex justify-between items-center">
                  <span>{pkg.name}</span>
                  <span className="text-sm text-gray-500">{pkg.price}</span>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <p className="text-gray-500">Analytics coming soon...</p>
        </TabsContent>

        <TabsContent value="settings">
          <p className="text-gray-500">Settings options go here...</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}