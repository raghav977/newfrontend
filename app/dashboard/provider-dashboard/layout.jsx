"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch } from "react-redux";
import { fetchMyServices } from "@/app/redux/slices/serviceSlice";
import { io } from "socket.io-client";
import { Bell, LogOut } from "lucide-react";

const BACKEND_URL = "http://localhost:5000";

export default function ProviderLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [verified, setVerified] = useState(false);
  const socketRef = useRef(null);
  const dispatch = useDispatch();
  const pathname = usePathname();

  const providerNavbar = [
    { name: "Dashboard", link: "/dashboard/provider-dashboard" },
    
    {
      name: "Services",
      link: "/dashboard/provider-dashboard/services",
      children: [
        { name: "All Services", link: "/dashboard/provider-dashboard/services" },
        {
          name: "Emergency Services",
          link: "/dashboard/provider-dashboard/services/emergency-services",
        },
      ],
    },
    { name: "Profile", link: "/dashboard/provider-dashboard/profile" },
    { name: "Messages", link: "/dashboard/provider-dashboard/messages" },
    {name:"Payment",link:"/dashboard/provider-dashboard/payment",
      children:[
        {
          name:"Payment History",
          link:"/dashboard/provider-dashboard/payment/history"
        }
      ]
    },
    {
      name: "Bookings",
      link: "/dashboard/provider-dashboard/bookings",
      children: [
        { name: "My bookings", link: "/dashboard/provider-dashboard/bookings" },
        {
          name: "Past bookings",
          link: "/dashboard/provider-dashboard/services/emergency-services",
        },
      ],
    },
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/users/about/service-provider/",
          { credentials: "include" }
        );
        const data = await res.json();

        if (data.status === "success") {
          console.log("data",data)  
          setUser(data.data);
          console.log("data",data.data)
          setVerified(data.data.serviceProvider.is_verified);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    dispatch(fetchMyServices());
  }, [dispatch]);

  // Socket notifications
  useEffect(() => {
    if (!user) return;
    console.log("Setting up socket for user", user);
    socketRef.current = io("http://localhost:3024", { withCredentials: true });
    socketRef.current.emit("register", { userId: user.id, role: "provider" });

    socketRef.current.on("offlineNotifications", (msgs) =>
      setNotifications((prev) => [...msgs, ...prev])
    );
    socketRef.current.on("privateBid", (msg) =>
      setNotifications((prev) => [{ ...msg, customResponse: "" }, ...prev])
    );
    socketRef.current.on("bidResponse", (msg) =>
      setNotifications((prev) => [
        {
          type: "bidResponse",
          from: msg.from,
          amount: msg.amount,
          service: msg.service,
          message: `Seeker responded: ${msg.response} to your bid of $${msg.amount}`,
        },
        ...prev,
      ])
    );
    socketRef.current.on("privateMessage", (msg) =>
      setNotifications((prev) => [
        {
          type: "message",
          from: msg.from,
          text: msg.text,
          message: `Message from User ${msg.from}: ${msg.text}`,
        },
        ...prev,
      ])
    );

    return () => socketRef.current.disconnect();
  }, [user]);

  const handleLogout = async () => {
    await fetch("http://localhost:5000/api/users/logout", {
      credentials: "include",
      method: "POST",
    });


    useEffect(()=>{
      console.log("User",user)
    },[user])


    setUser(null);
    window.location.href = "/";
  };

  if (loading)
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!user)
    return <div className="flex items-center justify-center min-h-screen">Please login</div>;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 bg-[#039561] flex flex-col text-white shadow-lg">
        {/* Profile */}
        <div className="p-6 border-b border-green-500 flex items-center gap-3">
          <img
            src={`${BACKEND_URL}${user.serviceProvider.User.profile_picture || "/placeholder.svg?height=48&width=48&query=profile"}`}
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover ring-2 ring-white"
          />
          <div>
            <h3 className="font-semibold text-white">{user.name || "Provider User"}</h3>
            <p className="text-sm text-white">Service Provider</p>
          </div>
        </div>

        {/* Navbar */}
        <nav className="flex-1 p-6 space-y-2">
          {providerNavbar.map((nav) => {
            const isParentActive = pathname.startsWith(nav.link);

            return nav.children ? (
              <div key={nav.name} className="group">
                {/* Parent Link */}
                <Link
                  href={nav.link}
                  className={`flex items-center px-3 py-2 text-md font-medium rounded-lg transition-all duration-200
                    ${isParentActive ? "bg-green-700 shadow-md" : "text-white hover:bg-green-500 hover:shadow-md"}
                  `}
                >
                  {nav.name}
                  <svg
                    className={`ml-auto h-4 w-4 text-white transform transition-transform duration-200 ${
                      isParentActive ? "rotate-90" : "group-hover:rotate-90"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>

                {/* Children Links */}
                <div
                  className={`ml-4 mt-1 space-y-1 max-h-0 overflow-hidden group-hover:max-h-96 transition-all duration-300`}
                >
                  {nav.children.map((child) => {
                    const isChildActive = pathname === child.link;
                    return (
                      <Link
                        key={child.name}
                        href={child.link}
                        className={`block px-4 py-1 text-sm rounded transition-all duration-200
                          ${
                            isChildActive
                              ? "bg-green-700 pl-5 border-l-4 border-white shadow-inner"
                              : "text-white hover:bg-green-400 hover:pl-5"
                          }`}
                      >
                        {child.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : (
              <Link
                key={nav.name}
                href={nav.link}
                className={`flex items-center px-3 py-2 text-md font-medium rounded-lg transition-all duration-200
                  ${pathname === nav.link ? "bg-green-700 shadow-md" : "text-white hover:bg-green-500 hover:shadow-md"}
                `}
              >
                {nav.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-green-500 text-center text-xs text-green-100">
          &copy; {new Date().getFullYear()} Kaam-Chaa. All rights reserved.
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col">
        {/* Topbar */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white">
          {!verified && (
            <div className="flex items-center bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md shadow-md w-full max-w-md">
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-700 text-sm">KYC Pending</h4>
                <p className="text-xs text-yellow-800 mt-1">
                  Complete your KYC to start providing services.
                </p>
              </div>
              <Link
                href="/service-provider/kyc"
                className="ml-4 px-3 py-1 bg-yellow-400 text-yellow-900 rounded hover:bg-yellow-500 text-xs font-semibold transition"
              >
                Complete KYC
              </Link>
            </div>
          )}

          {/* Notification Bell */}
          <div className="relative ml-auto">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="relative p-2 rounded-full hover:bg-gray-100"
            >
              <Bell className="h-6 w-6 text-gray-700" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {notifications.length}
                </span>
              )}
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-96 bg-white shadow-lg rounded-lg border border-gray-200 z-50">
                <div className="p-2 font-semibold text-gray-700 border-b">Notifications</div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">No notifications</div>
                  ) : (
                    notifications.map((n, idx) => (
                      <div key={idx} className="p-3 border-b text-sm hover:bg-gray-50">
                        <div>{n.message}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="ml-4 flex items-center px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm text-gray-700"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Logout
          </button>
        </div>

        {/* Page Content */}
        <div className="p-8 flex-1">{children}</div>
      </main>
    </div>
  );
}
