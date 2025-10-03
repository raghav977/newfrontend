"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, DollarSign, FileText, AlertCircle, Save, X, Image as ImageIcon, File } from "lucide-react"

export function ServiceEditModal({ open, onOpenChange, service, onSave }) {
  const [formData, setFormData] = useState({
    rate: "",
    location: "",
    description: "",
    servicesImage: [],        // { preview: string, file?: File, isExisting: boolean }
    related_documents: [],    // { preview: string, file: File, name: string }
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const isReapply = service?.status === "rejected"

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      formData.servicesImage.forEach(img => {
        if (img.file && img.preview.startsWith('blob:')) {
          URL.revokeObjectURL(img.preview)
        }
      })
      formData.related_documents.forEach(doc => {
        if (doc.preview.startsWith('blob:')) {
          URL.revokeObjectURL(doc.preview)
        }
      })
    }
  }, [formData.servicesImage, formData.related_documents])

  useEffect(() => {
    if (!service) return

    // Parse existing images
    const existingImages = Array.isArray(service.servicesImage) 
      ? service.servicesImage.map(img => ({ 
          preview: img, 
          file: null, 
          isExisting: true 
        }))
      : []

    setFormData({
      rate: service.rate?.toString() || "",
      location: typeof service.location === 'string' 
        ? service.location 
        : service.location 
          ? JSON.stringify(service.location)
          : "",
      description: service.description || "",
      servicesImage: existingImages,
      related_documents: [],
    })
    setErrors({})
  }, [service])

  const validateForm = () => {
    const newErrors = {}
    if (!formData.rate || isNaN(Number(formData.rate)) || Number(formData.rate) <= 0)
      newErrors.rate = "Rate must be a positive number"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.location.trim()) newErrors.location = "Location is required"
    if (isReapply && !formData.related_documents.length) 
      newErrors.related_documents = "At least one document is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }))
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isExisting: false
    }))

    setFormData(prev => ({
      ...prev,
      servicesImage: [...prev.servicesImage, ...newImages]
    }))
  }

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const newDocuments = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      type: file.type
    }))

    setFormData(prev => ({
      ...prev,
      related_documents: [...prev.related_documents, ...newDocuments]
    }))
  }

  const removeImage = useCallback((index) => {
    const imageToRemove = formData.servicesImage[index]
    if (imageToRemove.preview.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.preview)
    }
    
    setFormData(prev => ({
      ...prev,
      servicesImage: prev.servicesImage.filter((_, i) => i !== index)
    }))
  }, [formData.servicesImage])

  const removeDocument = useCallback((index) => {
    const docToRemove = formData.related_documents[index]
    if (docToRemove.preview.startsWith('blob:')) {
      URL.revokeObjectURL(docToRemove.preview)
    }
    
    setFormData(prev => ({
      ...prev,
      related_documents: prev.related_documents.filter((_, i) => i !== index)
    }))
  }, [formData.related_documents])

  const handleSave = async () => {
    if (!validateForm()) return

    setSaving(true)
    try {
      const data = new FormData()
      data.append("rate", formData.rate)
      
      // Handle location - parse if it's JSON string, otherwise use as is
      let locationValue = formData.location
      try {
        const parsed = JSON.parse(formData.location)
        if (typeof parsed === 'object' && parsed !== null) {
          locationValue = JSON.stringify(parsed)
        }
      } catch {
        // If it's not valid JSON, use as string
        locationValue = JSON.stringify(formData.location)
      }
      data.append("location", locationValue)
      
      data.append("description", formData.description)

      // Handle service images
      const existingImageUrls = []
      formData.servicesImage.forEach(img => {
        if (img.isExisting) {
          existingImageUrls.push(img.preview) // Keep existing URLs
        } else if (img.file) {
          data.append("servicesImage", img.file) // Add new files
        }
      })
      data.append("servicesImageUrls", JSON.stringify(existingImageUrls))

      // Handle reapply documents
      formData.related_documents.forEach(doc => {
        data.append("related_documents", doc.file)
      })

      const endpoint = isReapply
        ? `http://localhost:3024/services/reapply-service/${service.id}`
        : `http://localhost:3024/services/update-service/${service.id}`

      const response = await fetch(endpoint, {
        method: "PUT",
        body: data,
        credentials: "include"
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Failed to save service:", errorData)
        throw new Error(errorData.message || "Failed to save service")
      }

      const updatedService = await response.json()
      onSave(updatedService.data)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to save service:", error)
      alert(error.message || "Failed to save service. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (!service) return null

  const renderFieldError = (field) =>
    errors[field] ? (
      <p className="text-sm text-destructive flex items-center gap-1 mt-1">
        <AlertCircle className="h-3 w-3" /> {errors[field]}
      </p>
    ) : null

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-6 w-6" />
    return <File className="h-6 w-6" />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-xl font-bold">
                {isReapply ? "Reapply Service" : "Edit Service"}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">ID: {service.id}</Badge>
                <Badge variant="outline" className="text-xs">{service.category}</Badge>
                {isReapply && (
                  <Badge variant="destructive" className="text-xs">
                    Rejected: {service.rejected_reason}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <div className="space-y-6 py-4">
          {/* Rate */}
          <div className="space-y-2">
            <Label htmlFor="rate" className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="h-4 w-4" /> Rate (NPR)
            </Label>
            <Input
              id="rate"
              type="number"
              placeholder="Enter rate"
              value={formData.rate}
              onChange={(e) => handleInputChange("rate", e.target.value)}
              className={errors.rate ? "border-destructive" : ""}
            />
            {renderFieldError("rate")}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4" /> Location (JSON or address)
            </Label>
            <Textarea
              id="location"
              placeholder='Enter location as JSON (e.g., {"address": "123 Main St", "city": "Kathmandu"}) or plain address'
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              className={`min-h-[60px] ${errors.location ? "border-destructive" : ""}`}
            />
            {renderFieldError("location")}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4" /> Description
            </Label>
            <Textarea
              id="description"
              placeholder="Enter service description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={`min-h-[100px] ${errors.description ? "border-destructive" : ""}`}
            />
            {renderFieldError("description")}
          </div>

          {/* Service Images */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <ImageIcon className="h-4 w-4" /> Service Images
              </Label>
              <div className="text-xs text-muted-foreground">
                {formData.servicesImage.length} image(s)
              </div>
            </div>
            
            <Input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handleImageUpload}
              className="cursor-pointer"
            />
            
            {formData.servicesImage.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                {formData.servicesImage.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.preview}
                      alt={`service-${index}`}
                      className="w-full h-32 object-cover rounded-lg border shadow-sm transition-transform group-hover:scale-105"
                    />
                    <button 
                      type="button" 
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {img.isExisting && (
                      <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        Existing
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-xs text-muted-foreground">
              Upload images that showcase your service. Existing images will be preserved unless removed.
            </p>
          </div>

          {/* Reapply Documents */}
          {isReapply && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4" /> Reapply Documents
                </Label>
                <div className="text-xs text-muted-foreground">
                  {formData.related_documents.length} file(s)
                </div>
              </div>
              
              <Input 
                type="file" 
                multiple 
                onChange={handleDocumentUpload}
                className="cursor-pointer"
              />
              
              {formData.related_documents.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                  {formData.related_documents.map((doc, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                      <div className="flex-shrink-0">
                        {getFileIcon(doc.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.type.split('/')[1]?.toUpperCase() || 'FILE'}
                        </p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeDocument(index)}
                        className="text-destructive hover:text-destructive/80"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {renderFieldError("related_documents")}
              <p className="text-xs text-muted-foreground">
                Upload supporting documents or images to strengthen your reapplication.
              </p>
            </div>
          )}

          <Alert variant={isReapply ? "destructive" : "default"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Note:</strong> {isReapply 
                ? "Documents are required for reapplying. Make sure to address the reason for rejection."
                : "Only editable fields can be modified. Changes will be reviewed by admin."}
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            <X className="h-4 w-4 mr-2" /> Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {isReapply ? "Reapplying..." : "Saving..."}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" /> 
                {isReapply ? "Submit Reapply" : "Save Changes"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}