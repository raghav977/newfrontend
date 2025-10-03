"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Filter,
  Globe,
  ArrowLeft,
  Star,
  Users,
  Wrench,
  Zap,
  Home,
  Wind,
  Hammer,
  Paintbrush,
  TreePine,
  Truck,
  Shield,
  Bug,
} from "lucide-react"
import Link from "next/link"

export default function ServicesPage() {
  const [language, setLanguage] = useState("english")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedPriceRange, setSelectedPriceRange] = useState("all")

  const content = {
    english: {
      header: {
        backToHome: "Back to Home",
        login: "Login",
        register: "Register",
      },
      search: {
        title: "Find Home Services",
        subtitle: "Connect with trusted professionals for all your household needs",
        searchPlaceholder: "Search for services, professionals...",
        locationLabel: "Location",
        categoryLabel: "Service Category",
        priceRangeLabel: "Price Range",
        searchButton: "Search Services",
        clearFilters: "Clear Filters",
        resultsFound: "services found",
        noResults: "No services found matching your criteria",
      },
      locations: {
        all: "All Locations",
        kathmandu: "Kathmandu",
        pokhara: "Pokhara",
        chitwan: "Chitwan",
        lalitpur: "Lalitpur",
        bhaktapur: "Bhaktapur",
        biratnagar: "Biratnagar",
        birgunj: "Birgunj",
        dharan: "Dharan",
        butwal: "Butwal",
        nepalgunj: "Nepalgunj",
      },
      categories: {
        all: "All Services",
        plumbing: "Plumbing",
        electrical: "Electrical",
        cleaning: "House Cleaning",
        acRepair: "AC Repair",
        appliance: "Appliance Repair",
        painting: "Painting",
        carpentry: "Carpentry",
        gardening: "Gardening",
        moving: "Moving & Packing",
        rental: "Equipment Rental",
        pestControl: "Pest Control",
        security: "Security Installation",
      },
      priceRanges: {
        all: "All Prices",
        budget: "Budget (Rs. 500-2000)",
        standard: "Standard (Rs. 2000-5000)",
        premium: "Premium (Rs. 5000+)",
      },
      serviceCard: {
        perVisit: "per visit",
        perHour: "per hour",
        perDay: "per day",
        available: "Available",
        busy: "Busy",
        yearsExp: "years experience",
        viewProfile: "View Profile",
        bookNow: "Book Now",
      },
    },
    nepali: {
      header: {
        backToHome: "घर फर्कनुहोस्",
        login: "लगइन",
        register: "दर्ता",
      },
      search: {
        title: "घरेलु सेवाहरू फेला पार्नुहोस्",
        subtitle: "तपाईंको सबै घरेलु आवश्यकताहरूको लागि भरपर्दो पेशेवरहरूसँग जडान गर्नुहोस्",
        searchPlaceholder: "सेवाहरू, पेशेवरहरू खोज्नुहोस्...",
        locationLabel: "स्थान",
        categoryLabel: "सेवा श्रेणी",
        priceRangeLabel: "मूल्य दायरा",
        searchButton: "सेवाहरू खोज्नुहोस्",
        clearFilters: "फिल्टरहरू सफा गर्नुहोस्",
        resultsFound: "सेवाहरू फेला परे",
        noResults: "तपाईंको मापदण्डसँग मिल्ने कुनै सेवा फेला परेन",
      },
      locations: {
        all: "सबै स्थानहरू",
        kathmandu: "काठमाडौं",
        pokhara: "पोखरा",
        chitwan: "चितवन",
        lalitpur: "ललितपुर",
        bhaktapur: "भक्तपुर",
        biratnagar: "विराटनगर",
        birgunj: "वीरगञ्ज",
        dharan: "धरान",
        butwal: "बुटवल",
        nepalgunj: "नेपालगञ्ज",
      },
      categories: {
        all: "सबै सेवाहरू",
        plumbing: "प्लम्बिङ",
        electrical: "बिजुली",
        cleaning: "घर सफाई",
        acRepair: "एसी मर्मत",
        appliance: "उपकरण मर्मत",
        painting: "रंगाई",
        carpentry: "सिकर्मी",
        gardening: "बगैंचा",
        moving: "सार्ने र प्याकिङ",
        rental: "उपकरण भाडा",
        pestControl: "कीरा नियन्त्रण",
        security: "सुरक्षा स्थापना",
      },
      priceRanges: {
        all: "सबै मूल्यहरू",
        budget: "बजेट (रु. ५००-२०००)",
        standard: "मानक (रु. २०००-५०००)",
        premium: "प्रिमियम (रु. ५०००+)",
      },
      serviceCard: {
        perVisit: "प्रति भ्रमण",
        perHour: "प्रति घण्टा",
        perDay: "प्रति दिन",
        available: "उपलब्ध",
        busy: "व्यस्त",
        yearsExp: "वर्ष अनुभव",
        viewProfile: "प्रोफाइल हेर्नुहोस्",
        bookNow: "अहिले बुक गर्नुहोस्",
      },
    },
  }

  // Sample service provider data
  const allServices = [
    {
      id: 1,
      name: { english: "Ram Bahadur", nepali: "राम बहादुर" },
      service: "plumbing",
      location: "kathmandu",
      price: { amount: 1500, period: "visit" },
      priceRange: "budget",
      rating: 4.8,
      experience: 8,
      available: true,
      description: {
        english:
          "Expert plumber with 8+ years experience. Specializes in pipe repairs, bathroom fittings, and water system installations.",
        nepali: "८+ वर्षको अनुभव भएको विशेषज्ञ प्लम्बर। पाइप मर्मत, बाथरूम फिटिङ, र पानी प्रणाली स्थापनामा विशेषज्ञ।",
      },
      completedJobs: 150,
    },
    {
      id: 2,
      name: { english: "Sita Devi", nepali: "सीता देवी" },
      service: "cleaning",
      location: "lalitpur",
      price: { amount: 800, period: "visit" },
      priceRange: "budget",
      rating: 4.9,
      experience: 5,
      available: true,
      description: {
        english:
          "Professional house cleaning service. Deep cleaning, regular maintenance, and eco-friendly cleaning solutions.",
        nepali: "पेशेवर घर सफाई सेवा। गहिरो सफाई, नियमित मर्मत, र पर्यावरण मैत्री सफाई समाधान।",
      },
      completedJobs: 200,
    },
    {
      id: 3,
      name: { english: "Bikash Electrician", nepali: "विकास इलेक्ट्रिसियन" },
      service: "electrical",
      location: "kathmandu",
      price: { amount: 2000, period: "visit" },
      priceRange: "standard",
      rating: 4.7,
      experience: 12,
      available: false,
      description: {
        english:
          "Licensed electrician for all electrical work. Wiring, switch repairs, electrical installations and safety checks.",
        nepali: "सबै बिजुली कामको लागि इजाजतपत्र प्राप्त इलेक्ट्रिसियन। तार, स्विच मर्मत, बिजुली स्थापना र सुरक्षा जाँच।",
      },
      completedJobs: 300,
    },
    {
      id: 4,
      name: { english: "Cool Air Services", nepali: "कूल एयर सेवाहरू" },
      service: "acRepair",
      location: "pokhara",
      price: { amount: 3000, period: "visit" },
      priceRange: "standard",
      rating: 4.6,
      experience: 10,
      available: true,
      description: {
        english: "AC repair and maintenance specialists. All brands serviced with genuine parts and warranty.",
        nepali: "एसी मर्मत र मर्मत विशेषज्ञहरू। सबै ब्रान्डहरू वास्तविक पार्ट्स र वारेन्टीको साथ सेवा।",
      },
      completedJobs: 120,
    },
    {
      id: 5,
      name: { english: "Master Painter", nepali: "मास्टर पेन्टर" },
      service: "painting",
      location: "chitwan",
      price: { amount: 1200, period: "day" },
      priceRange: "budget",
      rating: 4.5,
      experience: 15,
      available: true,
      description: {
        english:
          "Professional painting services for homes and offices. Interior and exterior painting with quality materials.",
        nepali: "घर र कार्यालयहरूको लागि पेशेवर पेन्टिङ सेवाहरू। गुणस्तरीय सामग्रीको साथ भित्री र बाहिरी पेन्टिङ।",
      },
      completedJobs: 180,
    },
    {
      id: 6,
      name: { english: "Fix It Pro", nepali: "फिक्स इट प्रो" },
      service: "appliance",
      location: "kathmandu",
      price: { amount: 2500, period: "visit" },
      priceRange: "standard",
      rating: 4.4,
      experience: 7,
      available: true,
      description: {
        english: "Appliance repair experts. Washing machines, refrigerators, microwaves, and all home appliances.",
        nepali: "उपकरण मर्मत विशेषज्ञहरू। वाशिङ मेसिन, रेफ्रिजरेटर, माइक्रोवेभ, र सबै घरेलु उपकरणहरू।",
      },
      completedJobs: 95,
    },
    {
      id: 7,
      name: { english: "Wood Master", nepali: "वुड मास्टर" },
      service: "carpentry",
      location: "bhaktapur",
      price: { amount: 1800, period: "day" },
      priceRange: "budget",
      rating: 4.7,
      experience: 20,
      available: true,
      description: {
        english: "Expert carpenter for furniture repair, custom woodwork, and home improvements.",
        nepali: "फर्निचर मर्मत, कस्टम काठको काम, र घर सुधारको लागि विशेषज्ञ सिकर्मी।",
      },
      completedJobs: 250,
    },
    {
      id: 8,
      name: { english: "Green Thumb Gardens", nepali: "ग्रीन थम्ब बगैंचा" },
      service: "gardening",
      location: "lalitpur",
      price: { amount: 1000, period: "visit" },
      priceRange: "budget",
      rating: 4.3,
      experience: 6,
      available: true,
      description: {
        english: "Professional gardening services. Lawn care, plant maintenance, landscaping, and garden design.",
        nepali: "पेशेवर बगैंचा सेवाहरू। घाँसे मैदान हेरचाह, बिरुवा मर्मत, भूदृश्य, र बगैंचा डिजाइन।",
      },
      completedJobs: 80,
    },
  ]

  const currentContent = content[language]

  // Get category icon
  const getCategoryIcon = (category) => {
    const iconMap = {
      plumbing: Wrench,
      electrical: Zap,
      cleaning: Home,
      acRepair: Wind,
      appliance: Hammer,
      painting: Paintbrush,
      carpentry: Hammer,
      gardening: TreePine,
      moving: Truck,
      rental: Briefcase,
      pestControl: Bug,
      security: Shield,
    }
    const IconComponent = iconMap[category] || Briefcase
    return <IconComponent className="h-4 w-4" />
  }

  // Filter services based on search criteria
  const filteredServices = useMemo(() => {
    return allServices.filter((service) => {
      const matchesSearch =
        searchQuery === "" ||
        service.name[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
        currentContent.categories[service.service].toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description[language].toLowerCase().includes(searchQuery.toLowerCase())

      const matchesLocation = selectedLocation === "all" || service.location === selectedLocation
      const matchesCategory = selectedCategory === "all" || service.service === selectedCategory
      const matchesPriceRange = selectedPriceRange === "all" || service.priceRange === selectedPriceRange

      return matchesSearch && matchesLocation && matchesCategory && matchesPriceRange
    })
  }, [searchQuery, selectedLocation, selectedCategory, selectedPriceRange, language, currentContent.categories])

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedLocation("all")
    setSelectedCategory("all")
    setSelectedPriceRange("all")
  }

  const formatPrice = (price) => {
    const periodText = currentContent.serviceCard[`per${price.period.charAt(0).toUpperCase() + price.period.slice(1)}`]
    return `Rs. ${price.amount.toLocaleString()} ${periodText}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">{currentContent.header.backToHome}</span>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-green-600 to-emerald-600">
                  <Briefcase className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Kaam Chaa
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 mr-4">
                <Globe className="h-4 w-4 text-gray-600" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLanguage(language === "english" ? "nepali" : "english")}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  {language === "english" ? "नेपाली" : "English"}
                </Button>
              </div>
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                {currentContent.header.login}
              </Button>
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                {currentContent.header.register}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{currentContent.search.title}</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{currentContent.search.subtitle}</p>
          </div>

          {/* Search Form */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 border">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Search Input */}
                <div className="lg:col-span-2">
                  <Input
                    type="text"
                    placeholder={currentContent.search.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Location Filter */}
                <div>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder={currentContent.search.locationLabel} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(currentContent.locations).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Filter */}
                <div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder={currentContent.search.categoryLabel} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(currentContent.categories).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Price Range Filter */}
                <div>
                  <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                    <SelectTrigger>
                      <SelectValue placeholder={currentContent.search.priceRangeLabel} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(currentContent.priceRanges).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                    <Search className="mr-2 h-4 w-4" />
                    {currentContent.search.searchButton}
                  </Button>
                  <Button variant="outline" onClick={clearFilters} className="flex-1 bg-transparent">
                    <Filter className="mr-2 h-4 w-4" />
                    {currentContent.search.clearFilters}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredServices.length} {currentContent.search.resultsFound}
            </h2>
          </div>

          {filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{currentContent.search.noResults}</h3>
              <Button onClick={clearFilters} variant="outline">
                {currentContent.search.clearFilters}
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredServices.map((service) => (
                <Card key={service.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">{service.name[language]}</h3>
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="flex items-center text-green-600">
                                {getCategoryIcon(service.service)}
                                <span className="ml-1 text-sm font-medium">
                                  {currentContent.categories[service.service]}
                                </span>
                              </div>
                              <Badge
                                variant={service.available ? "default" : "secondary"}
                                className={
                                  service.available ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                                }
                              >
                                {service.available
                                  ? currentContent.serviceCard.available
                                  : currentContent.serviceCard.busy}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 text-yellow-500">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-sm text-gray-600">{service.rating}</span>
                          </div>
                        </div>

                        <p className="text-gray-700 mb-4 line-clamp-2">{service.description[language]}</p>

                        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-green-600" />
                            {currentContent.locations[service.location]}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-green-600" />
                            {service.experience} {currentContent.serviceCard.yearsExp}
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-green-600" />
                            {service.completedJobs} jobs completed
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-green-600 font-semibold">
                            <DollarSign className="h-4 w-4 mr-1" />
                            {formatPrice(service.price)}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 mt-4 lg:mt-0 lg:ml-6">
                        <Button variant="outline" size="sm">
                          {currentContent.serviceCard.viewProfile}
                        </Button>
                        <Button
                          size="sm"
                          disabled={!service.available}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50"
                        >
                          {currentContent.serviceCard.bookNow}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
