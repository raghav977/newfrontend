"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, FileText, CheckCircle, Clock, AlertCircle, Plus, Eye } from "lucide-react"

import Header from "./components/Header"
import MainServiceList from "./components/MainServiceList"
export default function ServicesPage() {
  const [services, setServices] = useState([
    {
      id: 1,
      name: "Web Development",
      category: "Technology",
      description: "Full-stack web development services",
      status: "approved",
      documents: ["portfolio.pdf", "certifications.pdf"],
      submittedDate: "2024-01-15",
    },
    {
      id: 2,
      name: "Digital Marketing",
      category: "Marketing",
      description: "SEO and social media marketing",
      status: "pending",
      documents: ["marketing-portfolio.pdf"],
      submittedDate: "2024-01-20",
    },
    {
      id: 3,
      name: "Graphic Design",
      category: "Design",
      description: "Logo and brand identity design",
      status: "rejected",
      documents: ["design-samples.pdf"],
      submittedDate: "2024-01-18",
    },
  ])

  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false)
  const [newService, setNewService] = useState({
    name: "",
    category: "",
    description: "",
    documents: [],
  })

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-primary" />
      case "pending":
        return <Clock className="h-4 w-4 text-secondary" />
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-destructive" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      approved: "bg-primary/10 text-primary border-primary/20",
      pending: "bg-secondary/10 text-secondary border-secondary/20",
      rejected: "bg-destructive/10 text-destructive border-destructive/20",
    }

    return (
      <Badge variant="outline" className={variants[status]}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </Badge>
    )
  }

  const handleAddService = () => {
    if (newService.name && newService.category && newService.description) {
      const service = {
        id: services.length + 1,
        ...newService,
        status: "pending",
        submittedDate: new Date().toISOString().split("T")[0],
      }
      setServices([...services, service])
      setNewService({ name: "", category: "", description: "", documents: [] })
      setIsAddServiceOpen(false)
    }
  }

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files)
    const fileNames = files.map((file) => file.name)
    setNewService((prev) => ({
      ...prev,
      documents: [...prev.documents, ...fileNames],
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      
      <Header/>
      
      <MainServiceList/>
    </div>
  )
}
