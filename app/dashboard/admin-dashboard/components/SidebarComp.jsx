"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// import { link } from "fs";

const adminNavBar = [
  { name: "Dashboard", link: "/dashboard/admin-dashboard" },
  {
    name:"Bookings",
    link:"/dashboard/admin-dashboard/bookings"
    // children: [
    //   { name: "All Bookings", link: "/dashboard/admin-dashboard/bookings" },
    //   { name: "Confirmed Bookings", link: "/dashboard/admin-dashboard/confirmed-bookings" },
    //   { name: "Completed Bookings", link: "/dashboard/admin-dashboard/completed-bookings" },
    //   { name: "Cancelled Bookings", link: "/dashboard/admin-dashboard/cancelled-bookings" },
    //   { name: "Rejected Bookings", link: "/dashboard/admin-dashboard/rejected-bookings" },
    //   { name: "Pending Bookings", link: "/dashboard/admin-dashboard/pending-bookings" },
    // ],
  },
  { name: "Manage Users", link: "/dashboard/admin-dashboard/users" },
  {
    name: "Manage KYC",
    link:"/dashboard/admin-dashboard/pending-kycs",
    // children: [
    //   { name: "Approved Kycs", link: "/dashboard/admin-dashboard/approve-kycs" },
    //   { name: "Pending Kycs", link: "/dashboard/admin-dashboard/pending-kycs" },
    //   { name: "Rejected Kycs", link: "/dashboard/admin-dashboard/rejected-kycs" },
    // ],
  },
  {
    name: "Services",
    link:"/dashboard/admin-dashboard/pending-services",
    // children: [
    //   // { name: "All Services", link: "/dashboard/admin-dashboard/pending-services" },
    //   // { name: "Approved Services", link: "/dashboard/admin-dashboard/approve-services" },
    //   // { name: "Pending Services", link: "/dashboard/admin-dashboard/pending-services" },
    //   // { name: "Rejected Services", link: "/dashboard/admin-dashboard/rejected-services" },
    // ],
  },
  {
    name: "Rooms",
    link:"/dashboard/admin-dashboard/pending-rooms",
    // children: [
    //   { name: "All Rooms", link: "/dashboard/admin-dashboard/rooms" },
    //   { name: "Approved Rooms", link: "/dashboard/admin-dashboard/approve-rooms" },
    //   { name: "Pending Rooms", link: "/dashboard/admin-dashboard/pending-rooms" },
    //   { name: "Rejected Rooms", link: "/dashboard/admin-dashboard/rejected-rooms" },
    // ],
  },
  { name: "Manage Categories", link: "/dashboard/admin-dashboard/services" },
  { name: "Settings", link: "/dashboard/admin-dashboard/settings" ,
    children:[
      {
        name:"Payment", link:"/dashboard/admin-dashboard/settings/payments"
      }
    ]
  },
 
];

export default function Sidebar({ user = {} }) {
  const pathname = usePathname();
  const [hoveredMenu, setHoveredMenu] = useState(null);

  const renderNavItem = (nav) => {
    const isActive = nav.link
      ? pathname.startsWith(nav.link)
      : nav.children?.some((child) => pathname.startsWith(child.link));

    if (nav.children) {
      return (
        <div
          key={nav.name}
          className="relative"
          onMouseEnter={() => setHoveredMenu(nav.name)}
          onMouseLeave={() => setHoveredMenu(null)}
        >
          {/* Parent */}
          <div
            className={`flex items-center justify-between py-2 px-4 rounded-lg font-medium cursor-pointer transition-colors duration-300
              ${isActive ? "bg-[#039561] text-green-800 shadow-md" : "text-green-50 hover:bg-green-500"}
            `}
          >
            <span>{nav.name}</span>
            <motion.div
              animate={{ rotate: hoveredMenu === nav.name ? 90 : 0 }}
              transition={{ duration: 0.25 }}
            >
              <ChevronRight className="h-4 w-4" />
            </motion.div>
          </div>

          {/* Children */}
          <AnimatePresence>
            {hoveredMenu === nav.name && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="ml-4 mt-2 flex flex-col gap-2 border-l border-green-400 pl-2"
              >
                {nav.children.map((child) => {
                  const isChildActive = pathname.startsWith(child.link);
                  return (
                    <Link
                      key={child.name}
                      href={child.link}
                      className={`py-1 px-3 rounded-md text-sm transition-colors duration-300
                        ${
                          isChildActive
                            ? "bg-green-200 text-green-900 font-semibold shadow-inner"
                            : "text-green-50 hover:bg-green-400 hover:text-white"
                        }
                      `}
                    >
                      {child.name}
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <Link
        key={nav.name}
        href={nav.link}
        className={`py-2 px-4 rounded-lg font-medium transition-colors duration-300
          ${isActive ? "bg-green-100 text-green-800 shadow-md" : "text-green-50 hover:bg-green-500"}
        `}
      >
        {nav.name}
      </Link>
    );
  };

  return (
    <aside className="w-72 bg-[#039561] text-white flex flex-col py-8 px-6 shadow-lg border-r border-green-500">
      {/* Profile */}
      <div className="mb-8 flex flex-col items-center justify-center">
        <span className="text-lg font-semibold">{user.email || "Admin User"}</span>
      </div>

      {/* Title */}
      <div className="mb-10 flex items-center justify-center">
        <span className="text-2xl font-bold tracking-wide">Admin Panel</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-3">{adminNavBar.map((nav) => renderNavItem(nav))}</nav>

      {/* Footer */}
      <div className="mt-auto pt-8 text-xs text-green-100 text-center">
        &copy; {new Date().getFullYear()} Kaam-Chaa. All rights reserved.
      </div>
    </aside>
  );
}
