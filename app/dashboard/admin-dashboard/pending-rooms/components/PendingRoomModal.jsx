"use client"
import { useState, useEffect } from "react"
import { FileText, AlertCircle, MapPin, DollarSign, ImageIcon, X, Calendar,User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FaRestroom } from "react-icons/fa"


export default function PendingRoomModal({ room, open, onClose }) {
  const [selectedImage, setSelectedImage] = useState(null)
  const [imageError, setImageError] = useState({})

  const getStatusBadge = (status) => {
    const variants = {
      approved: "bg-[#e6f4ef] text-[#019561] border-[#a1e2c8]",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    }
    return <Badge className={variants[status] || "bg-gray-100 text-gray-800 border-gray-200"}>{status}</Badge>
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-NP", { style: "currency", currency: "NPR" }).format(amount)

  const handleImageError = (index) => setImageError((prev) => ({ ...prev, [index]: true }))

  useEffect(() => setImageError({}), [room])

  const images = Array.isArray(room.images) ? room.images : []

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <DialogTitle className="text-xl font-bold text-gray-800">{room.location}</DialogTitle>
                <div className="flex items-center gap-2">
                  {getStatusBadge(room.status)}
                  <Badge variant="outline" className="text-xs border-[#005caf] text-[#005caf]">ID: {room.id}</Badge>
                </div>
              </div>
              <Button variant="outline" size="icon" onClick={onClose} className="border-[#005caf] text-[#005caf]">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* tabs */}
          <Tabs defaultValue="room" className="mt-4">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="room">Room Details</TabsTrigger>
              <TabsTrigger value="user">User Details</TabsTrigger>

            </TabsList>


            <TabsContent value="room" className="space-y-6 mt-4">
              {/* Room Images */}
              {images.length > 0 && (
                <div>
                  <h3 className="font-semibold text-sm text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-[#005caf]" /> Room Images ({images.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative group cursor-pointer"
                        onClick={() => setSelectedImage(img.path || "/placeholder.svg")}
                      >
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
                <p className="text-gray-800 leading-relaxed">{room.benefits || "No benefits provided"}</p>
              </div>

              <Separator className="bg-[#005caf]" />

              {/* Room Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-[#005caf]" />
                    <div>
                      <p className="text-xs text-gray-600">Price</p>
                      <p className="font-medium text-gray-800">{formatCurrency(room.price)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-[#005caf]" />
                    <div>
                      <p className="text-xs text-gray-600">Location</p>
                      <p className="font-medium text-gray-800">{room.location}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-[#005caf]" />
                    <div>
                      <p className="text-xs text-gray-600">Availability</p>
                      <p className="font-medium text-gray-800">{room.availability ? "Yes" : "No"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-[#005caf]" />
                    <div>
                      <p className="text-xs text-gray-600">Contact</p>
                      <p className="font-medium text-gray-800">{room.contact || "No contact provided"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {room.note && (
                <>
                  <Separator className="bg-[#005caf]" />
                  <div>
                    <h3 className="font-semibold text-sm text-gray-600 uppercase tracking-wide mb-2">Note</h3>
                    <p className="text-gray-800 leading-relaxed">{room.note}</p>
                  </div>
                </>
              )}

              {room.status == "rejected" && room.rejectionMessage && (
                <>
                  <Separator className="bg-[#005caf]" />
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Rejection Reason:</strong> {FaRestroom.rejectionMessage}
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </TabsContent>


            {/* user details */}
            <TabsContent value="user" className="space-y-6 mt-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-[#005caf]" />
                <div>
                  <p className="text-xs text-gray-600">User Name</p>
                  <p className="font-medium text-gray-800">{room?.Gharbeti?.User?.username || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-[#005caf]" />
                <div>
                  <p className="text-xs text-gray-600">Email</p>
                  <p className="font-medium text-gray-800">{room?.Gharbeti?.User?.email || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-[#005caf]" />
                <div>
                  <p className="text-xs text-gray-600">Phone</p>
                  <p className="font-medium text-gray-800">{room?.Gharbeti?.User?.phone_number || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge className={room?.Gharbeti?.is_verified ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {room?.Gharbeti?.is_verified ? "Verified" : "Not Verified"}
                </Badge>
              </div>
            </TabsContent>
          </Tabs>

          

          <div className="mt-6 flex justify-end">
            <Button
              onClick={onClose}
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
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedImage(null)}
                className="border-[#005caf] text-[#005caf]"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>
            <div className="flex items-center justify-center">
              <img
                src={selectedImage}
                alt="Room preview"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
