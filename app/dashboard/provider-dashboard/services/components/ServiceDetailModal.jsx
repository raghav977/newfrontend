"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  MapPin,
  Calendar,
  FileText,
  ImageIcon,
  X,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
} from "lucide-react"

export default function ServiceDetailModal({
  open,
  onOpenChange,
  service,
  loading,
  onAddPackage,
  onViewPackage,
  onEditPackage,
  onDeletePackage,
}) {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedImage, setSelectedImage] = useState(null)

  if (!service) return null

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />
      case "pending":
        return <AlertCircle className="w-4 h-4" />
      case "rejected":
        return <XCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl border-0 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          {/* Header */}
          <DialogHeader className="relative px-8 py-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-t-3xl -mx-6 -mt-6 mb-6">
            <div className="relative flex justify-between items-start">
              <div className="space-y-3">
                <DialogTitle className="text-3xl font-bold leading-tight">
                  {service.description}
                </DialogTitle>
                <div className="flex items-center gap-4">
                  <Badge
                    className={`${getStatusColor(
                      service.status
                    )} flex items-center gap-2 px-4 py-1.5 font-semibold text-sm rounded-full`}
                  >
                    {getStatusIcon(service.status)}
                    {service.status}
                  </Badge>
                  <div className="flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm font-semibold">
                    <DollarSign className="w-4 h-4 text-white" />
                    <span className="text-white">Rs.{service.rate}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="text-white hover:bg-white/20 rounded-full h-10 w-10"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
          </DialogHeader>

          {/* Tabs */}
          <div className="px-8 pb-8 overflow-y-auto max-h-[calc(90vh-160px)] scrollbar-thin">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-1.5 mb-8">
                {["overview", "packages", "documents", "images"].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="rounded-lg font-semibold text-sm py-2.5 capitalize transition-all data-[state=active]:bg-white data-[state=active]:dark:bg-gray-700 data-[state=active]:text-indigo-600 data-[state=active]:dark:text-indigo-400 shadow-sm"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Overview */}
              <TabsContent value="overview" className="space-y-6 mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-5 shadow-sm border rounded-xl">
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-gray-800">
                      <Calendar className="w-5 h-5 text-indigo-500" /> Schedule
                    </h3>
                    {service.ServiceSchedules?.length ? (
                      <ul className="space-y-2 text-gray-600">
                        {service.ServiceSchedules.map((s) => (
                          <li
                            key={s.id}
                            className="flex justify-between border-b pb-1"
                          >
                            <span>{s.day_of_week}</span>
                            <span className="font-medium">
                              {s.start_time} - {s.end_time}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400">No schedule available.</p>
                    )}
                  </Card>

                  <Card className="p-5 shadow-sm border rounded-xl">
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-gray-800">
                      <MapPin className="w-5 h-5 text-indigo-500" /> Locations
                    </h3>
                    {service.ServiceLocations?.length ? (
                      <ul className="space-y-2 text-gray-600">
                        {service.ServiceLocations.map((loc) => (
                          <li key={loc.id} className="border-b pb-1">
                            {loc.address}, {loc.city || ""}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400">No locations available.</p>
                    )}
                  </Card>
                </div>
              </TabsContent>

              {/* Packages */}
              <TabsContent value="packages" className="mt-0">
                <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-xl">Service Packages</CardTitle>
                      <Button
                        onClick={onAddPackage}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 py-2 font-semibold"
                      >
                        + Add Package
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {service.Packages?.length ? (
                      <div className="grid md:grid-cols-2 gap-4">
                        {service.Packages.map((pkg) => (
                          <Card
                            key={pkg.id}
                            className="p-5 border shadow-sm hover:shadow-md transition rounded-xl"
                          >
                            <div className="flex justify-between items-start">
                              <div className="space-y-2 flex-1">
                                <h3 className="font-semibold text-lg text-gray-900">
                                  {pkg.name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {pkg.description}
                                </p>
                              </div>
                              <div className="text-xl font-bold text-indigo-600">
                                Rs.{pkg.price}
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onViewPackage?.(pkg)}
                              >
                                <Eye className="w-4 h-4 mr-1" /> View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onEditPackage?.(pkg)}
                              >
                                <Edit className="w-4 h-4 mr-1" /> Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => onDeletePackage?.(pkg)}
                              >
                                <Trash2 className="w-4 h-4 mr-1" /> Delete
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <FileText className="w-10 h-10 mx-auto mb-4 text-gray-400" />
                        No packages available yet.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Documents */}
              <TabsContent value="documents" className="mt-0">
                {service.ServiceDocuments?.length ? (
                  <div className="grid gap-3">
                    {service.ServiceDocuments.map((doc) => (
                      <Card
                        key={doc.id}
                        className="p-3 flex justify-between items-center hover:shadow-sm transition"
                      >
                        <span className="flex items-center gap-2 text-sm text-gray-700">
                          <FileText className="w-4 h-4 text-indigo-500" />
                          {doc.document_path}
                        </span>
                        <a
                          href={doc.document_path}
                          target="_blank"
                          className="text-indigo-600 hover:underline text-sm"
                        >
                          View
                        </a>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-6">
                    No documents uploaded.
                  </p>
                )}
              </TabsContent>

              {/* Images */}
              <TabsContent
                value="images"
                className="mt-0 grid grid-cols-2 md:grid-cols-3 gap-4"
              >
                {service.ServiceImages?.length ? (
                  service.ServiceImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative cursor-pointer group"
                      onClick={() => setSelectedImage(img.image_path)}
                    >
                      <img
                        src={img.image_path}
                        alt="Service"
                        className="w-full h-40 object-cover rounded-lg shadow-sm group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 col-span-full text-center py-6">
                    No images available.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="sm:max-w-[90vw] max-h-[90vh] flex items-center justify-center bg-black/95 border-0 rounded-3xl overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 text-white hover:bg-white/20 rounded-full h-12 w-12"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-6 h-6" />
            </Button>
            <img
              src={selectedImage || "/placeholder.svg"}
              alt="Preview"
              className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
