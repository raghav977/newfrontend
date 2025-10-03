"use client";
import { useState, useMemo } from "react";
import { FaSearch, FaStar, FaMapMarkerAlt, FaClock, FaFilter } from "react-icons/fa";

// Mock data for home services
const mockServices = [
  {
    id: 1,
    title: "Professional House Cleaning",
    description: "Deep cleaning service for your entire home with eco-friendly products",
    category: "Cleaning",
    subcategory: "House Cleaning",
    rating: 4.8,
    reviews: 127,
    price: 89,
    location: "Downtown",
    duration: "2-3 hours",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    title: "Emergency Plumbing Repair",
    description: "24/7 plumbing services for leaks, clogs, and installations",
    category: "Plumbing",
    subcategory: "Emergency Repair",
    rating: 4.9,
    reviews: 89,
    price: 120,
    location: "Citywide",
    duration: "1-2 hours",
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    title: "Electrical Installation",
    description: "Licensed electrician for wiring, outlets, and fixture installation",
    category: "Electrical",
    subcategory: "Installation",
    rating: 4.7,
    reviews: 156,
    price: 150,
    location: "North Side",
    duration: "2-4 hours",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    title: "Garden Landscaping",
    description: "Complete garden design and landscaping services",
    category: "Gardening",
    subcategory: "Landscaping",
    rating: 4.6,
    reviews: 73,
    price: 200,
    location: "Suburbs",
    duration: "Full day",
    image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 5,
    title: "AC Maintenance",
    description: "Air conditioning cleaning, repair, and maintenance services",
    category: "HVAC",
    subcategory: "Maintenance",
    rating: 4.8,
    reviews: 94,
    price: 95,
    location: "Metro Area",
    duration: "1-2 hours",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 6,
    title: "Carpet Deep Cleaning",
    description: "Professional carpet and upholstery cleaning with stain removal",
    category: "Cleaning",
    subcategory: "Carpet Cleaning",
    rating: 4.7,
    reviews: 112,
    price: 75,
    location: "Downtown",
    duration: "2-3 hours",
    image: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 7,
    title: "Kitchen Plumbing",
    description: "Specialized kitchen sink, dishwasher, and garbage disposal services",
    category: "Plumbing",
    subcategory: "Kitchen",
    rating: 4.9,
    reviews: 67,
    price: 110,
    location: "West Side",
    duration: "1-3 hours",
    image: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 8,
    title: "Smart Home Setup",
    description: "Installation and setup of smart home devices and automation",
    category: "Electrical",
    subcategory: "Smart Home",
    rating: 4.8,
    reviews: 45,
    price: 180,
    location: "Citywide",
    duration: "3-5 hours",
    image: "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
  },
];

const categories = ["All", "Cleaning", "Plumbing", "Electrical", "Gardening", "HVAC"];
const subcategories = {
  All: [],
  Cleaning: ["House Cleaning", "Carpet Cleaning", "Window Cleaning"],
  Plumbing: ["Emergency Repair", "Kitchen", "Bathroom", "Installation"],
  Electrical: ["Installation", "Repair", "Smart Home", "Wiring"],
  Gardening: ["Landscaping", "Maintenance", "Tree Service", "Lawn Care"],
  HVAC: ["Maintenance", "Repair", "Installation", "Cleaning"],
};

export default function HomeServicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("rating");

  const servicesPerPage = 6;

  // Filter and sort services
  const filteredServices = useMemo(() => {
    const filtered = mockServices.filter((service) => {
      const matchesSearch =
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || service.category === selectedCategory;
      const matchesSubcategory = selectedSubcategory === "All" || service.subcategory === selectedSubcategory;
      return matchesSearch && matchesCategory && matchesSubcategory;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "reviews":
          return b.reviews - a.reviews;
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedCategory, selectedSubcategory, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredServices.length / servicesPerPage);
  const startIndex = (currentPage - 1) * servicesPerPage;
  const paginatedServices = filteredServices.slice(startIndex, startIndex + servicesPerPage);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory("All");
    setCurrentPage(1);
  };

  const handleSubcategoryChange = (subcategory) => {
    setSelectedSubcategory(subcategory);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-white w-full">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between py-4 px-4">
          <h1 className="text-2xl font-bold text-green-700">Home Services</h1>
          <div className="flex-1 max-w-md w-full mx-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-green-200 rounded-lg focus:ring-2 focus:ring-green-400 bg-white text-gray-700"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-green-200 rounded-lg px-3 py-2 bg-white text-gray-700"
            >
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="reviews">Most Reviews</option>
            </select>
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col gap-4">
            {/* Category Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <FaFilter className="h-4 w-4 text-green-400" />
              <span className="text-sm font-medium text-gray-500">Categories:</span>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-1 rounded-lg text-sm font-medium transition ${
                    selectedCategory === category
                      ? "bg-green-600 text-white"
                      : "bg-white text-green-700 border border-green-200 hover:bg-green-50"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            {/* Subcategory Filters */}
            {selectedCategory !== "All" && subcategories[selectedCategory].length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-500">Subcategories:</span>
                <button
                  onClick={() => handleSubcategoryChange("All")}
                  className={`px-4 py-1 rounded-lg text-sm font-medium transition ${
                    selectedSubcategory === "All"
                      ? "bg-green-600 text-white"
                      : "bg-white text-green-700 border border-green-200 hover:bg-green-50"
                  }`}
                >
                  All
                </button>
                {subcategories[selectedCategory].map((subcategory) => (
                  <button
                    key={subcategory}
                    onClick={() => handleSubcategoryChange(subcategory)}
                    className={`px-4 py-1 rounded-lg text-sm font-medium transition ${
                      selectedSubcategory === subcategory
                        ? "bg-green-600 text-white"
                        : "bg-white text-green-700 border border-green-200 hover:bg-green-50"
                    }`}
                  >
                    {subcategory}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-10">
        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-500">
            Showing {paginatedServices.length} of {filteredServices.length} services
            {selectedCategory !== "All" && ` in ${selectedCategory}`}
            {selectedSubcategory !== "All" && ` - ${selectedSubcategory}`}
          </p>
        </div>

        {/* Service Grid */}
        {paginatedServices.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {paginatedServices.map((service) => (
              <div
                key={service.id}
                className="bg-white border border-green-100 rounded-xl shadow-sm hover:shadow-lg transition flex flex-col overflow-hidden"
              >
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-48 object-cover rounded-t-xl"
                />
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg text-green-700 line-clamp-1">{service.title}</h3>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                      {service.category}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{service.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <FaStar className="h-4 w-4 text-yellow-400" />
                      <span className="font-medium text-green-700">{service.rating}</span>
                      <span>({service.reviews})</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <FaMapMarkerAlt className="h-4 w-4" />
                      <span>{service.location}</span>
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                    <FaClock className="h-4 w-4" />
                    {service.duration}
                  </span>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xl font-bold text-green-700">${service.price}</span>
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No services found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
                setSelectedSubcategory("All");
              }}
              className="mt-4 px-6 py-2 border border-green-200 rounded-lg bg-white text-green-700 hover:bg-green-50 font-semibold transition"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg border border-green-200 bg-white text-green-700 font-semibold transition ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-green-100"
              }`}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-lg border border-green-200 font-semibold transition ${
                  currentPage === page
                    ? "bg-green-600 text-white"
                    : "bg-white text-green-700 hover:bg-green-100"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg border border-green-200 bg-white text-green-700 font-semibold transition ${
                currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-green-100"
              }`}
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}