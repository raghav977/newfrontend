"use client"
import { useState, useEffect } from "react"
import { FileText, AlertCircle, MapPin, DollarSign, ImageIcon, X, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function ViewRoomModal({ open, onOpenChange, service, loading, error }) {
  const [selectedImage, setSelectedImage] = useState(null)
  const [imageError, setImageError] = useState({})
  console.log(service);

  const getStatusBadge = (status) => {
    const variants = {
      approved: "bg-[#e6f4ef] text-[#019561] border-[#a1e2c8]",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    }
    return <Badge className={variants[status] || "bg-gray-100 text-gray-800 border-gray-200"}>{status}</Badge>
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
    }).format(amount)
  }

  const handleImageError = (index) => setImageError((prev) => ({ ...prev, [index]: true }))

  useEffect(() => setImageError({}), [service])

  if (loading) return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005caf] mb-4"></div>
          <p className="text-gray-600">Loading room details...</p>
        </div>
      </DialogContent>
    </Dialog>
  )

  if (error || !service) return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-500 font-medium">Failed to load room details</p>
          <p className="text-gray-600 text-sm mt-2">Please try again later</p>
        </div>
      </DialogContent>
    </Dialog>
  )

  const images = Array.isArray(service.images) ? service.images : []

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <DialogTitle className="text-xl font-bold text-gray-800">{service.location}</DialogTitle>
                <div className="flex items-center gap-2">
                  {getStatusBadge(service.status)}
                  <Badge variant="outline" className="text-xs border-[#005caf] text-[#005caf]">ID: {service.id}</Badge>
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Room Images */}
            {images.length > 0 && (
              <div>
                <h3 className="font-semibold text-sm text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-[#005caf]" /> Room Images ({images.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative group cursor-pointer" onClick={() => setSelectedImage(img.path || "/placeholder.svg")}>
                      <img
                        src={img.path || "/placeholder.svg"}
                        alt={`Room image ${idx + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-[#005caf] shadow-sm transition-transform group-hover:scale-105"
                        onError={() => handleImageError(idx)}
                      />
                      {imageError[idx] && (
                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg">
                          <AlertCircle className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {images.length > 0 && <Separator className="bg-[#005caf]" />}

            {/* Benefits */}
            <div>
              <h3 className="font-semibold text-sm text-gray-600 uppercase tracking-wide mb-2">Benefits</h3>
              <p className="text-gray-800 leading-relaxed">{service.benefits || "No benefits provided"}</p>
            </div>

            <Separator className="bg-[#005caf]" />

            {/* Room Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-[#005caf]" />
                  <div>
                    <p className="text-xs text-gray-600">Price</p>
                    <p className="font-medium text-gray-800">{formatCurrency(service.price)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-[#005caf]" />
                  <div>
                    <p className="text-xs text-gray-600">Location</p>
                    <p className="font-medium text-gray-800">{service.location}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-[#005caf]" />
                  <div>
                    <p className="text-xs text-gray-600">Availability</p>
                    <p className="font-medium text-gray-800">{service.availability ? "Yes" : "No"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-[#005caf]" />
                  <div>
                    <p className="text-xs text-gray-600">Contact</p>
                    <p className="font-medium text-gray-800">{service.contact || "No contact provided"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-[#005caf]" />
                  <div>
                    <p className="text-xs text-gray-600">Last Updated</p>
                    <p className="font-medium text-gray-800">
                      {new Date(service.updatedAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {service.note && (
              <>
                <Separator className="bg-[#005caf]" />
                <div>
                  <h3 className="font-semibold text-sm text-gray-600 uppercase tracking-wide mb-2">Note</h3>
                  <p className="text-gray-800 leading-relaxed">{service.note}</p>
                </div>
              </>
            )}

            {/* Rejection Reason */}
            {service.status == "rejected" && service.rejectionMessage && (
              <>
                <Separator className="bg-[#005caf]" />
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Rejection Reason:</strong> {service.rejectionMessage}
                  </AlertDescription>
                </Alert>
              </>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => onOpenChange(false)}
              className="bg-[#005caf] hover:bg-[#00478a] text-white"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="sm:max-w-[90vw] max-h-[90vh]">
            <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <DialogTitle className="text-gray-800">Room Image Preview</DialogTitle>
              <Button variant="outline" size="icon" onClick={() => setSelectedImage(null)} className="border-[#005caf] text-[#005caf]">
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>
            <div className="flex items-center justify-center">
              <img src={selectedImage} alt="Room preview" className="max-w-full max-h-[70vh] object-contain rounded-lg" />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}