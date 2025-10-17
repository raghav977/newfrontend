"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, Plus, MapPin } from "lucide-react"
import { useDispatch, useSelector } from "react-redux"
import { fetchServices } from "@/app/redux/slices/categorySlice"
// import { stat } from "fs"
import AddService from "./AddService"

const dummyCategories = [
  {
    id: 1,
    name: "Plumbing",
    subcategories: ["Pipe Repair", "Leak Fixing", "Bathroom Installation"]
  },
  {
    id: 2,
    name: "Electrical",
    subcategories: ["Wiring", "Appliance Repair", "Lighting Installation"]
  },
  {
    id: 3,
    name: "Cleaning",
    subcategories: ["Home Cleaning", "Office Cleaning", "Carpet Cleaning"]
  },
]

const dummyLocations = [
  "Downtown",
  "Uptown",
  "Suburbs",
  "City Center",
  "East Side",
  "West Side"
]

export default function ServiceUI() {
    const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState("");

  const subcategories = selectedCategory ? selectedCategory.subcategories : [];

    const dispatch = useDispatch();
    const list = useSelector((state)=>state.category.list);
    console.log("This is the list",list);

  const [services, setServices] = useState([])
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false)
  const [subCategoryList, setSubCategoryList] = useState([])
  const [newService, setNewService] = useState({
    name: "",
    category: "",
    subcategory: "All subcategories",
    description: "",
    documents: [],
    locations: [],
    rate: ""
  })

  useEffect(() => {
    const categoryObj = dummyCategories.find(cat => cat.name === newService.category)
    if (categoryObj) {
      setSubCategoryList(["All subcategories", ...categoryObj.subcategories])
      setNewService(prev => ({
        ...prev,
        subcategory: "All subcategories"
      }))
    } else {
      setSubCategoryList([])
      setNewService(prev => ({
        ...prev,
        subcategory: "All subcategories"
      }))
    }
  }, [newService.category])

  const handleAddService = () => {
    if (
      newService.name &&
      newService.category &&
      newService.description &&
      newService.locations.length > 0 &&
      newService.rate
    ) {
      const service = {
        id: services.length + 1,
        ...newService,
        status: "pending",
        submittedDate: new Date().toISOString().split("T")[0],
      }
      setServices([...services, service])
      setNewService({
        name: "",
        category: "",
        subcategory: "All subcategories",
        description: "",
        documents: [],
        locations: [],
        rate: ""
      })
      setIsAddServiceOpen(false)
    }
  }

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    const fileNames = files.map(file => file.name)
    setNewService(prev => ({
      ...prev,
      documents: [...prev.documents, ...fileNames],
    }))
  }

  const handleLocationChange = (e) => {
    const { options } = e.target
    const selected = []
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) selected.push(options[i].value)
    }
    setNewService(prev => ({
      ...prev,
      locations: selected
    }))
  }

  useEffect(()=>{
    dispatch(fetchServices());
  },[dispatch])

  return (
    <div className="">

      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Service Management</h1>
            <p className="text-muted-foreground">Manage your services and track their approval status</p>
          </div>
          
      <AddService/>
        </div>
      </header>
      
      

      <div className="grid gap-4">
        {services.map(service => (
          <Card key={service.id}>
            <CardHeader>
              <CardTitle>{service.name}</CardTitle>
              <CardDescription>
                {service.category} | {service.subcategory} | Status: {service.status}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-2">{service.description}</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {service.locations.map((loc, idx) => (
                  <span key={idx} className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    <MapPin className="h-3 w-3 mr-1" /> {loc}
                  </span>
                ))}
              </div>
              <p className="mb-2"><strong>Rate:</strong> ₹{service.rate}</p>
              {service.documents.length > 0 && (
                <div className="mt-2 space-y-1">
                  <strong>Documents:</strong>
                  {service.documents.map((doc, idx) => (
                    <p key={idx} className="text-sm">{doc}</p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}