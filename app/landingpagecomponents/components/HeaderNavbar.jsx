"use client";

import { useEffect, useState } from "react";
import { Briefcase, Bell, LogOut, Home, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { aboutUser } from "@/app/redux/slices/authSlice";
import { motion, AnimatePresence } from "framer-motion";

// import { useState } from "react";
// import { Briefcase, Bell, LogOut, Home, Menu, X } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import { useRouter } from "next/navigation";

export default function HeaderNavbar() {
  const reduxUser = useSelector((state) => state.auth.user);
  console.log("This is redux user in header",reduxUser)
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();
  // Default links
  // Config-driven navbar links
  const navConfig = [
    { name: "Home", link: "/" },
    { name: "Home Services", link: "/home-services" },
    { name: "How it works", link: "/how-it-works" },
    { name: "Find a Room", link: "/messages" },
    // Role-based links
    {
      name: "Be Service Provider",
      show: (user) => !!user,
      onClick: (user, router) => {
        if (user?.service_provider_id) {
          router.push("/dashboard/provider-dashboard");
        } else {
          router.push("/service-provider/kyc?name=service_provider");
        }
      },
    },
    {
      name: "Provider Dashboard",
      link: "/dashboard/provider-dashboard",
      show: (user) => !!user?.service_provider_id,
    },
    {
      name: "Be Gharbeti",
      show: (user) => !!user,
      onClick: (user, router) => {
        if (user?.gharbeti_id) {
          router.push("/dashboard/gharbeti-dashboard");
        } else {
          router.push("/service-provider/kyc?name=gharbeti");
        }
      },
    },
    {
      name: "Gharbeti Dashboard",
      link: "/dashboard/gharbeti-dashboard",
      show: (user) => !!user?.gharbeti_id,
    },
    {
      name: "My Bookings",
      link: "/user/bookings",
      show: (user) => !!user,
    },
    // Add more links here as needed
  ];

  // Sync local user with redux
  useEffect(() => {
    if (reduxUser?.user) setUser(reduxUser);
    else setUser(null);
  }, [reduxUser]);

  // Lazy-load profile if redux is empty
  useEffect(() => {
    if (reduxUser?.user) return;
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/profile", {
          credentials: "include",
        });
        const data = await res.json();
        const maybeUser = data?.data?.user || data?.data || null;
        if (maybeUser) {
          setUser(maybeUser);
          dispatch(aboutUser());
        }
      } catch {
        setUser(null);
      }
    })();
  }, [reduxUser, dispatch]);

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/users/logout", {
        credentials: "include",
        method: "POST",
      });
    } catch (err) {
      // ignore
    } finally {
      setUser(null);
      setMenuOpen(false);
      router.push("/");
    }
  };

  const navigateAndClose = (href) => {
    setMenuOpen(false);
    router.push(href);
  };

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="w-full z-50 border-b bg-white/90 backdrop-blur-lg shadow-sm px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center h-16 justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 shadow">
            <Briefcase className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
            Kaam Chaa
          </span>
        </Link>
        {/* Desktop Nav links */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-8">
          {navConfig.filter(item => !item.show || item.show(user)).map((item) => (
            item.onClick ? (
              <button
                key={item.name}
                onClick={() => item.onClick(user, router)}
                className="text-green-700 font-semibold hover:text-emerald-700 text-base bg-transparent border-none cursor-pointer"
                style={{ padding: 0, background: "none" }}
              >
                {item.name}
              </button>
            ) : (
              <Link key={item.name} href={item.link} className="text-gray-800 font-medium hover:text-green-700 text-base">
                {item.name}
              </Link>
            )
          ))}
        </nav>
        {/* Desktop Auth actions */}
        <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" className="text-gray-700 hover:text-green-700 font-semibold">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow">
                  Register
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Button variant="ghost" className="p-2" aria-label="Notifications">
                <Bell className="h-5 w-5 text-gray-700" />
                {notifications.length > 0 && (
                  <span className="ml-2 inline-block bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </Button>
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold shadow" onClick={handleLogout}>
                <LogOut className="h-5 w-5 mr-2" /> Logout
              </Button>
            </>
          )}
        </div>
        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Open menu"
        >
          {menuOpen ? <X className="h-6 w-6 text-green-700" /> : <Menu className="h-6 w-6 text-green-700" />}
        </button>
      </div>
      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden absolute left-0 top-16 w-full bg-white/95 backdrop-blur-lg shadow-lg z-50 border-t">
          <nav className="flex flex-col gap-2 py-4 px-6">
            {navConfig.filter(item => !item.show || item.show(user)).map((item) => (
              item.onClick ? (
                <button
                  key={item.name}
                  onClick={() => { item.onClick(user, router); setMenuOpen(false); }}
                  className="text-green-700 font-semibold hover:text-emerald-700 text-base text-left py-2 border-b border-gray-100 bg-transparent border-none cursor-pointer"
                  style={{ padding: 0, background: "none" }}
                >
                  {item.name}
                </button>
              ) : (
                <Link key={item.name} href={item.link} className="text-gray-800 font-medium hover:text-green-700 text-base py-2 border-b border-gray-100">
                  {item.name}
                </Link>
              )
            ))}
          </nav>
          <div className="flex flex-col gap-2 px-6 pb-4">
            {!user ? (
              <>
                <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register" onClick={() => setMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                    Register
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Button variant="ghost" className="w-full justify-start">
                  <Bell className="h-5 w-5 text-gray-700 mr-2" /> Notifications
                  {notifications.length > 0 && (
                    <span className="ml-2 inline-block bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                      {notifications.length}
                    </span>
                  )}
                </Button>
                <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white" onClick={() => { handleLogout(); setMenuOpen(false); }}>
                  <LogOut className="h-5 w-5 mr-2" /> Logout
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
