import HeaderNavbar from "../landingpagecomponents/components/HeaderNavbar";
import HomeServicesContent from "./components/HomeServicesContent";

export const metadata = {
  title: "Home Services | UPAAYAX",
  description: "Find local service providers for all your home needs.",
};

export default function HomeServicesPage() {
  return (
    <>
      <HeaderNavbar />

      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Home Services</h1>

        {/* Client wrapper */}
        <HomeServicesContent />
      </div>
    </>
  );
}
