"use client"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, DollarSign, Clock, Calendar, Edit3, Save, X } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { fetchMyServices } from "@/app/redux/slices/serviceSlice"

export default function EmergencyList() {

  const dispatch = useDispatch();
  let list = useSelector((state)=>state.service.list)
  list = list.data;
  console.log("This is emergency list",list)
  const [emergencyServices, setEmergencyServices] = useState([])
  const [selectedService, setSelectedService] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    serviceName: "",
    emergencyRate: "",
    emergencyLocation: "",
  })
  const [loadingToggle, setLoadingToggle] = useState({}) // track loading per service

  // Fetch all emergency services
  const fetchMyEmergencyServices = async () => {
    try {
      const response = await fetch("http://localhost:3024/emergency/my-emergency-services/", { credentials: "include" })
      const data = await response.json()
      if (data.data) {
        setEmergencyServices(data.data)
      }
    } catch (err) {
      console.error("Error fetching emergency services:", err)
    }
  }

  useEffect(() => {
    fetchMyEmergencyServices()
    dispatch(fetchMyServices());
  }, [])

  // Toggle active/inactive
  const handleToggle = async (serviceId, currentValue) => {
    console.log("The current value", currentValue)
    try {
      // mark this service as loading
      setLoadingToggle((prev) => ({ ...prev, [serviceId]: true }))

      const response = await fetch(`http://localhost:3024/emergency/toggle/${serviceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !currentValue }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Failed to update status")
      setEmergencyServices((prev) => prev.map((s) => (s.id === serviceId ? { ...s, isActive: !currentValue } : s)))
      alert(data.message || `Service ${!currentValue ? "activated" : "deactivated"} successfully`)
    } catch (err) {
      console.error("Toggle error:", err)
      alert(err.message || "Error updating service status")
    } finally {
      setLoadingToggle((prev) => ({ ...prev, [serviceId]: false }))
    }
  }

  // Open modal with selected service
  const handleView = (service) => {
    setSelectedService(service)
    setModalOpen(true)
  }


  const handleDelete = async(id)=>{
    // alert("This is the id to be delted" +id);


    try{
        const response = await fetch(`http://localhost:3024/emergency/delete-emergency-service/${id}`)
        const data = await response.json();
        console.log("This is data",data)
        dispatch(fetchMyEmergencyServices());
    }
    catch(err){
      console.log("Something went wrong")

    }

  }
  const handleEdit = (service) => {
    setEditFormData({
      serviceName: service.serviceName,
      emergencyRate: service.emergencyRate,
      emergencyLocation: service.emergencyLocation,
    })
    setSelectedService(service)
    setEditModalOpen(true)
  }

  // Save edited service
  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`http://localhost:3024/emergency/update/${selectedService.emergencyServiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editFormData),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Failed to update service")
      setEmergencyServices((prev) => prev.map((s) => (s.id === selectedService.id ? { ...s, ...editFormData } : s)))
      setEditModalOpen(false)
      alert("Service updated successfully")
    } catch (err) {
      console.error("Update error:", err)
      alert(err.message || "Error updating service")
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {emergencyServices.map((item) => (
          <Card
            key={item.id}
            className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-green-50/30 backdrop-blur-sm"
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                  {item.serviceName}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.status ? "bg-green-500" : "bg-gray-400"}`} />
                  <span className="text-xs font-medium text-gray-500">{item.status ? "Active" : "Inactive"}</span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-sm font-medium">Emergency Rate</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">Rs {item.emergencyRate}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">Location</span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">{item.emergencyLocation}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Service Status</span>
                <Switch
                  checked={item.status}
                  disabled={loadingToggle[item.id]}
                  onCheckedChange={() => handleToggle(item.emergencyServiceId, item.status)}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleView(item)}
                  className="flex-1 hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-colors"
                >
                  View Details
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleEdit(item)}
                  className="flex-1 hover:bg-green-100 transition-colors"
                  >
                  <Edit3 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                  <Button variant="primary" className='border w-[200px]' onClick={()=>handleDelete(item.emergencyServiceId)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View Details Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-white">
                {selectedService?.serviceName || "Service Details"}
              </DialogTitle>
            </DialogHeader>
          </div>

          {selectedService && (
            <div className="p-6 space-y-4">
              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Emergency Rate</p>
                    <p className="font-semibold text-gray-900">NPR {selectedService.emergencyRate}/hour</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-semibold text-gray-900">{selectedService.emergencyLocation}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${selectedService.status ? "bg-green-500" : "bg-gray-400"}`} />
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-semibold text-gray-900">{selectedService.status ? "Active" : "Inactive"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                    
                  </div>

                  
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end p-6 pt-0">
            <DialogClose asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white px-6">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Service Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5" />
                Edit Service
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-4">
            <div className="space-y-2">
  <Label htmlFor="serviceName" className="text-sm font-medium text-gray-700">
    Service Name
  </Label>

  <Select
    value={editFormData.serviceName}
    onValueChange={(value) =>
      setEditFormData((prev) => ({ ...prev, serviceName: value }))
    }
  >
    <SelectTrigger className="border-gray-200 focus:border-green-500 focus:ring-green-500">
      <SelectValue placeholder="Select a service" />
    </SelectTrigger>
    <SelectContent>
      {list?.map((srv) => (
        <SelectItem key={srv.id} value={srv.name}>
          {srv.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>


            <div className="space-y-2">
              <Label htmlFor="emergencyRate" className="text-sm font-medium text-gray-700">
                Emergency Rate (NPR)
              </Label>
              <Input
                id="emergencyRate"
                type="number"
                value={editFormData.emergencyRate}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, emergencyRate: e.target.value }))}
                className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                placeholder="Enter rate per hour"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyLocation" className="text-sm font-medium text-gray-700">
                Location
              </Label>
              <Input
                id="emergencyLocation"
                value={editFormData.emergencyLocation}
                onChange={(e) => setEditFormData((prev) => ({ ...prev, emergencyLocation: e.target.value }))}
                className="border-gray-200 focus:border-green-500 focus:ring-green-500"
                placeholder="Enter service location"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 pt-0">
            <DialogClose asChild>
              <Button variant="outline" className="px-6 hover:bg-gray-50 bg-transparent">
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700 text-white px-6">
              <Save className="w-4 h-4 mr-1" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
