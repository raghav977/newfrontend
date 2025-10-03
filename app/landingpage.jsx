


import HeroSection from "@/app/landingpagecomponents/components/HeroSection"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import CallToAction from "@/app/landingpagecomponents/components/CallToAction"

import { Badge } from "@/components/ui/badge"
import { Search, Users, Briefcase, Star, CheckCircle, ArrowRight, MapPin, Clock, Shield, Globe } from "lucide-react"
import PopularCategory from "@/app/landingpagecomponents/components/PopularCategories"
import Footer from "@/app/landingpagecomponents/components/Footer"
// import HeaderNavbar from "./landingpagecomponents/components/HeaderNavbar"
import AboutKaamcha from "./landingpagecomponents/components/AboutKaamcha"
import FeatureService from "./landingpagecomponents/components/FeatureService"
import HeaderNavbar from "./landingpagecomponents/components/HeaderNavbar"

export default function LandingPage() {


  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <HeaderNavbar/>
<HeroSection/>
<PopularCategory/>
<AboutKaamcha/>
<FeatureService/>



{/* popular categories we have */}
    
      

      {/* How It Works Section */}
      

      {/* CTA Section */}
      <CallToAction/>

      {/* Footer */}
      <Footer/>
    </div>
  )
}
