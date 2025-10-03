"use client"
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Search, Users, CheckCircle, Shield, Clock, MapPin, DollarSign, FileText, X } from "lucide-react";
import Link from "next/link";

// Dynamic imports for react-leaflet (client-side only)
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(mod => mod.Marker), { ssr: false });
const useMapEvents = dynamic(() => import("react-leaflet").then(mod => mod.useMapEvents), { ssr: false });

const emergencyCategories = ["Plumbing", "Electrical", "Medical", "Security", "Other"];

export default function HeroSection() {
  const [openEmergencyModal, setOpenEmergencyModal] = useState(false);
  const [category, setCategory] = useState("");
  const [locationType, setLocationType] = useState("map");
  const [manualLocation, setManualLocation] = useState("");
  const [mapPin, setMapPin] = useState({ lat: null, lng: null });
  const [mediaFiles, setMediaFiles] = useState([]);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [openMapModal, setOpenMapModal] = useState(false);

  // Get user's location
  useEffect(() => {
    if (!mapPin.lat && typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        setMapPin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, []);

  // Map preview component
  const MapSelector = ({ onSelect }) => (
    <div
      className="relative h-32 w-full rounded-md overflow-hidden border mb-2 cursor-pointer"
      onClick={() => setOpenMapModal(true)}
    >
      {MapContainer && TileLayer && Marker && (
        <MapContainer
          center={[mapPin.lat || 27.7172, mapPin.lng || 85.3240]}
          zoom={13}
          scrollWheelZoom={false}
          className="h-full w-full pointer-events-none"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {mapPin.lat && <Marker position={[mapPin.lat, mapPin.lng]} />}
        </MapContainer>
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white text-sm font-semibold">
        Click to expand map
      </div>
    </div>
  );

  // Expanded map modal
  const ExpandedMapSelector = ({ onSelect, mapPin }) => {
    const MapEvents = () => {
      useMapEvents({
        click(e) {
          onSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
          setOpenMapModal(false);
        },
      });
      return null;
    };

    return (
      <div className="relative h-[400px] w-full rounded-md overflow-hidden border">
        {MapContainer && TileLayer && Marker && useMapEvents && (
          <MapContainer
            center={[mapPin.lat || 27.7172, mapPin.lng || 85.3240]}
            zoom={13}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapEvents />
            {mapPin.lat && <Marker position={[mapPin.lat, mapPin.lng]} />}
          </MapContainer>
        )}
        <p className="absolute bottom-1 left-1 bg-white/80 px-2 py-1 text-xs rounded">
          Click anywhere on the map to select location.
        </p>
      </div>
    );
  };

  const handleEmergencyService = () => setOpenEmergencyModal(!openEmergencyModal);

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    setMediaFiles(files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type
    })));
  };

  const handleSubmit = () => {
    setOpenEmergencyModal(false);
    setCategory("");
    setLocationType("map");
    setManualLocation("");
    setMapPin({ lat: null, lng: null });
    setMediaFiles([]);
    setDescription("");
    setPrice("");
  };

  return (
    <section className="relative  w-full border-red-400 min-h-screen overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 brightness-[.55]"
      >
        <source src="/bgvideo.mp4" type="video/mp4" />
      </video>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/25 via-gray-900/10 to-transparent z-10 pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col-reverse lg:flex-row min-h-screen gap-12">
        {/* Left Text */}
        <div className="flex-1 max-w-xl flex flex-col justify-center space-y-6 text-center lg:text-left">
          <Badge className="self-center lg:self-start bg-green-100 text-green-700 font-medium tracking-wide px-3 py-1 rounded-lg shadow-md animate-bounce">
            🚀 Connect. Work. Grow.
          </Badge>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-lg">
            Find Your Perfect<br></br>
            <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent font-serif">
              Work Match
            </span>
          </h1>

          <p className="text-white/85 text-lg md:text-xl leading-relaxed tracking-wide">
            Whether you need household repairs, cleaning services, or professional help at home,{' '}
            <span className="font-semibold text-green-200">Kaam Chaa</span> connects you with trusted local service providers.
          </p>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Input placeholder="Search for services..." className="flex-1" />
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-6 py-3 font-semibold text-white flex items-center gap-2">
              <Search className="h-5 w-5" /> Find Work
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-4 justify-center lg:justify-start">
            <Link href="/services">
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 shadow-md font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" /> Offer Services
              </Button>
            </Link>
            <Link href="/post-job">
              <Button variant="outline" className="text-white border border-white/50 hover:bg-white/20 px-6 py-3 font-medium flex items-center gap-2">
                <Search className="h-5 w-5" /> Hire Workers
              </Button>
            </Link>
            <Button variant="outline" onClick={handleEmergencyService} className="text-white border border-white/50 hover:bg-white/20 px-6 py-3 font-medium flex items-center gap-2">
              <Search className="h-5 w-5" /> Emergency Service
            </Button>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-6 mt-6 text-white/70 text-sm md:text-base justify-center lg:justify-start">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle className="h-4 w-4 text-green-300" /> Verified Workers
            </div>
            <div className="flex items-center gap-2 font-medium">
              <Shield className="h-4 w-4 text-green-300" /> Secured Platform
            </div>
            <div className="flex items-center gap-2 font-medium">
              <Clock className="h-4 w-4 text-green-300" /> Quick Matching
            </div>
          </div>
        </div>

        {/* Right Image */}
        
      </div>

      {/* Emergency Modal */}
      <Dialog open={openEmergencyModal} onOpenChange={setOpenEmergencyModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Search className="h-5 w-5" /> Emergency Service Request
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Category */}
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category" className="mt-1">
                  <SelectValue placeholder="Select emergency category" />
                </SelectTrigger>
                <SelectContent>
                  {emergencyCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div>
              <Label>Emergency Location</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  variant={locationType === "map" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLocationType("map")}
                >
                  <MapPin className="mr-1 h-4 w-4" /> Map
                </Button>
                <Button
                  variant={locationType === "manual" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLocationType("manual")}
                >
                  <FileText className="mr-1 h-4 w-4" /> Manual
                </Button>
              </div>

              {locationType === "map" ? (
                <>
                  <MapSelector onSelect={setMapPin} />
                  <Dialog open={openMapModal} onOpenChange={setOpenMapModal}>
                    <DialogContent className="max-w-2xl">
                      <ExpandedMapSelector onSelect={setMapPin} mapPin={mapPin} />
                      <div className="flex justify-end mt-2">
                        <Button variant="outline" onClick={() => setOpenMapModal(false)}>Close</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  {mapPin.lat && (
                    <p className="mt-2 text-xs text-green-600">
                      Selected: Lat {mapPin.lat}, Lng {mapPin.lng}
                    </p>
                  )}
                </>
              ) : (
                <Input
                  type="text"
                  placeholder="Enter emergency location"
                  className="mt-2"
                  value={manualLocation}
                  onChange={e => setManualLocation(e.target.value)}
                />
              )}
            </div>

            {/* Media Upload */}
            <div>
              <Label htmlFor="media">Photo/Video (optional)</Label>
              <Input
                id="media"
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleMediaUpload}
                className="mt-1"
              />
              <div className="flex gap-2 mt-2 flex-wrap">
                {mediaFiles.map((media, idx) => (
                  <div key={idx} className="relative">
                    {media.type.startsWith("image") ? (
                      <img src={media.preview} alt="preview" className="h-16 w-16 object-cover rounded" />
                    ) : (
                      <video src={media.preview} className="h-16 w-16 rounded" controls />
                    )}
                    <button
                      type="button"
                      className="absolute top-0 right-0 bg-red-600 text-white rounded-full p-1"
                      onClick={() => setMediaFiles(files => files.filter((_, i) => i !== idx))}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Describe the Emergency</Label>
              <Textarea
                id="description"
                placeholder="Provide details..."
                className="mt-1 min-h-[80px]"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            {/* Price */}
            <div>
              <Label htmlFor="price" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> Price Offer
              </Label>
              <Input
                id="price"
                type="number"
                placeholder="Enter your offer"
                className="mt-1"
                value={price}
                onChange={e => setPrice(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="pt-2 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenEmergencyModal(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!category || (!manualLocation && !mapPin.lat) || !description || !price}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
