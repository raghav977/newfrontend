"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchServiceDetailById } from "@/app/redux/thunks/serviceThunks";
import PackageContent from "./PackageContent";
import HeaderWala from "../../../landingpagecomponents/services/[service]/components/HeaderWala";
import ServiceImageGallery from "./ServiceGallery";
import ServiceInfo from "./ServiceInfo";
import ServiceBooking from "./ServiceBooking";
import { io } from "socket.io-client";
// import {fetchAboutUser} from "@/app/redux/slice/authSlice";
import {fetchAboutUser} from "@/app/redux/slices/authSlice";

export default function ServiceDetailPage() {

  const [customerLocation,setCustomerLocation] = useState(null);


  const { service } = useParams();
  const dispatch = useDispatch();
  const { selectedService: { data: serviceDetail, loading, error } } = useSelector((state) => state.servicesReal);
  console.log("Service Detail:", serviceDetail);
  const { user } = useSelector((state) => state.auth); 
  console.log("User in ServiceDetailPage:", user);

  const [schedules, setSchedules] = useState([]);
  const [socket, setSocket] = useState(null);

  

useEffect(() => {
  if (navigator.geolocation) {
    console.log("Fetching user location...");

    // navigator.geolocation.getCurrentPosition(
    //   (pos) => setCustomerLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
    //   (err) => setCustomerLocation(null)
    // );

    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      console.log("User's location:", latitude, longitude);
      setCustomerLocation({ lat: latitude, lon: longitude });
      console.log("Customer location set:", { lat: latitude, lon: longitude });
    }, (error) => {
      console.error("Error fetching location:", error);
      setCustomerLocation(null);
    });
  }
}, []);



  useEffect(() => {
    if (service) {
      dispatch(fetchServiceDetailById({
        service,
        lat: customerLocation ? customerLocation.lat : null,
        lon: customerLocation ? customerLocation.lon : null
      }));
      dispatch(fetchAboutUser())
    }
  }, [service, customerLocation, dispatch]);

  // Prepare schedules for booking component
  useEffect(() => {
    if (serviceDetail?.ServiceSchedules) {
      const formattedSchedules = serviceDetail.ServiceSchedules.map((s) => ({
        scheduleId: s.id,
        day: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
      }));
      setSchedules(formattedSchedules);
    }
  }, [serviceDetail]);

  // Initialize socket only if user is signed in
  useEffect(() => {
    if (user) {
      const newSocket = io("http://localhost:5000", {
        query: { userId: user.id },
      });
      console.log("Socket initialized:", newSocket);
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error || !serviceDetail) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Service not found</h2>
          <p className="text-slate-600">{error || "The service you're looking for doesn't exist."}</p>
        </div>
      </div>
    );
  }

  const includes = serviceDetail.includes || [];
  const notes = serviceDetail.note || "";

  return (
    <div className="bg-slate-50 min-h-screen">
      <HeaderWala />
      <main className="max-w-7xl mx-auto py-12 px-4">
        <div className="grid lg:grid-cols-3 gap-12">

          {/* Left Side */}
          <div className="lg:col-span-2 space-y-8">
            <ServiceImageGallery
              images={serviceDetail.ServiceImages?.map((img) => img.image_path) || ["/fallback.png"]}
            />

            <div className="space-y-4">
              <ServiceInfo
                title={serviceDetail.Service?.name}
                description={serviceDetail.description}
                price={serviceDetail.rate}
                currency="Rs."
              />

              {includes.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-lg text-slate-800 mb-2">Includes:</h3>
                  <ul className="list-disc list-inside text-slate-600">
                    {Array.isArray(includes) && includes.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {notes && (
                <div className="mt-4">
                  <h3 className="font-semibold text-lg text-slate-800 mb-2">Notes:</h3>
                  <p className="font-bold text-slate-700">{notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side */}
          <div className="lg:col-span-1 space-y-8">
            <ServiceBooking
              schedules={schedules}
              serviceDetail={serviceDetail}
              user={user}
              customerLocation={customerLocation}
              socket={socket} // pass socket for real-time bid
            />
            <PackageContent packages={serviceDetail.Packages || []} />
          </div>

        </div>
      </main>
    </div>
  );
}
