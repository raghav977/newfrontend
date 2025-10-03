import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function CallToAction() {
  return (
    <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600">
        
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">
          Join thousands of workers and employers who trust Kaam Chaa for their work needs
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-4">
            Register as Worker
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-green-600 text-lg px-8 py-4 bg-transparent"
          >
            Post a Job
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  )
}
