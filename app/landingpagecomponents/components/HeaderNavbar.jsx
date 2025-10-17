"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, BellRing, Check, Briefcase, ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { aboutUser } from "@/app/redux/slices/authSlice";
import { connectSocket, connectSocketConnection, getSocket } from "@/helper/socket";

export default function HeaderNavbar() {
  const reduxUser = useSelector((state) => state.auth.user);

  console.log("Redux user in HeaderNavbar:", reduxUser);
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Dropdowns
  const [menuOpen, setMenuOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const joinRef = useRef(null);

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Sync local user
  useEffect(() => {
    console.log("Redux user changed:", reduxUser);
    if (reduxUser?.user) setUser(reduxUser);
    else setUser(null);
  }, [reduxUser]);

  // Lazy-load profile if redux empty
  useEffect(() => {
    if (reduxUser?.user) return;
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/profile", { credentials: "include" });
        const data = await res.json();
        const maybeUser = data?.data?.user || data?.data || null;
        if (maybeUser) {
          setUser(maybeUser);
          dispatch(aboutUser());
        }
      } catch {}
    })();
  }, [reduxUser, dispatch]);

  // Notifications: fetch + socket
  useEffect(() => {
    if (!user) return;

    console.log("Setting up notifications for user:", user.token);

    const socket = connectSocketConnection();

    console.log("Socket connected in HeaderNavbar:", socket);
    socket.emit("register", { userId: user.id });


    const handleNewNotification = (notif) => {
      console.log("Received new notification:", notif);
      setNotifications((prev) => [notif, ...prev].slice(0, 20));
      setUnreadCount((c) => c + 1);
    };

    const handleBookingCreated = (payload) => {
      console.log("Received booking-created event:", payload);
      const notif = {
        id: payload.id || `booking-${Date.now()}`,
        title: payload.title || "Booking Update",
        message: payload.message || `Booking #${payload.id || ""} created/updated`,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev].slice(0, 20));
      setUnreadCount((c) => c + 1);
    };


    const handleNewBid = (bid) => {
      const notif = {
        id: bid.id || `bid-${Date.now()}`,
        title: "New Bid",
        message: `New bid of Rs.${bid.bidAmount || bid.amount || ""}`,
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [notif, ...prev].slice(0, 20));
      setUnreadCount((c) => c + 1);
    };


    // Live notifications
     socket.on("new-notification", handleNewNotification);
    socket.on("booking-created", handleBookingCreated);
    socket.on("new-bid", handleNewBid);

    // Fetch offline/DB notifications
    const fetchNotifications = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/notifications?limit=6", { credentials: "include" });
        const body = res.ok ? await res.json() : null;
        console.log("Fetched notifications:", body);
        const list = body?.data.data || [];
        console.log("Notification list:", list);
        setNotifications(list.slice(0, 6));
        setUnreadCount(list.filter((n) => !n.isRead).length);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };

    fetchNotifications();
  }, [user]);

  const toggleNotif = () => {
    setNotifOpen((v) => !v);
    if (unreadCount > 0) {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);

      fetch("http://localhost:5000/api/notifications/mark-read", { method: "POST", credentials: "include" }).catch(() => {});
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/api/users/logout", { credentials: "include", method: "POST" });
    } finally {
      setUser(null);
      setMenuOpen(false);
      router.push("/");
    }
  };

  const handleBecomeProvider = () => router.push(user?.service_provider_id ? "/dashboard/provider-dashboard" : "/service-provider/kyc?name=service_provider");
  const handleBecomeGharbeti = () => router.push(user?.gharbeti_id ? "/dashboard/gharbeti-dashboard" : "/service-provider/kyc?name=gharbeti");

  // Close dropdown on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (joinRef.current && !joinRef.current.contains(e.target)) setJoinOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const navConfig = [
    { name: "Home", link: "/" },
    { name: "Home Services", link: "/home-services" },
    { name: "How it works", link: "/how-it-works" },
    { name: "Find a Room", link: "/messages" },
    { name: "My Bookings", link: "/user/bookings", show: (u) => !!u },
  ];

  return (
    <header className="w-full relative z-[9999] border-b bg-white/90 backdrop-blur-lg shadow-sm px-4 md:px-8">
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

        {/* Desktop Nav */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-8">
          {navConfig.filter((item) => !item.show || item.show(user)).map((item) => (
            <Link key={item.name} href={item.link} className="text-gray-800 font-medium hover:text-green-700 text-base">{item.name}</Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <>
              <Link href="/auth/login"><Button variant="ghost" className="text-gray-700 hover:text-green-700 font-semibold">Sign In</Button></Link>
              <Link href="/auth/register"><Button className="bg-white border text-green-700 font-semibold hover:bg-green-50">Register</Button></Link>
            </>
          ) : (
            <>
              {/* Notifications */}
              <div className="relative" ref={notifRef}>
                <button onClick={toggleNotif} className="relative p-2 rounded hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-600">
                  {unreadCount > 0 ? <BellRing className="h-5 w-5 text-green-700" /> : <Bell className="h-5 w-5 text-slate-700" />}
                  {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 leading-none">{unreadCount > 9 ? "9+" : unreadCount}</span>}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50">
                    <div className="px-3 py-2 border-b flex items-center justify-between">
                      <div className="text-sm font-medium">Notifications</div>
                      <button onClick={() => { setNotifications([]); setUnreadCount(0); fetch("/api/notifications/mark-read", { method: "POST", credentials: "include" }).catch(() => {}); }} className="text-xs text-green-600 hover:underline">Mark all read</button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? <div className="p-4 text-sm text-slate-500">No notifications</div> :
                        notifications.map((n) => (
                          <div key={n.id} className={`px-3 py-3 border-b hover:bg-green-50 transition flex items-start gap-2 ${!n.isRead ? "bg-emerald-50" : ""}`}>
                            <div className="pt-1"><Check className="w-4 h-4 text-green-600 opacity-70" /></div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-slate-800">{n.title || n.message}</div>
                              <div className="text-xs text-slate-500 mt-1">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}</div>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                    <div className="p-2 text-center">
                      <Link href="/notifications" onClick={() => setNotifOpen(false)} className="text-sm text-green-600 hover:underline">View all</Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Sell Services */}
              <div className="relative" ref={joinRef}>
                <Button onClick={() => setJoinOpen((v) => !v)} className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold shadow">Sell Your Services <ChevronDown className="h-4 w-4" /></Button>
                {joinOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white border rounded shadow-lg z-50">
                    <button onClick={handleBecomeProvider} className="w-full text-left px-4 py-2 hover:bg-green-50">Be a Provider</button>
                    <button onClick={handleBecomeGharbeti} className="w-full text-left px-4 py-2 hover:bg-green-50">Be a Gharbeti</button>
                  </div>
                )}
              </div>

              <Button onClick={handleLogout} variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 font-semibold">Logout</Button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-600" onClick={() => setMenuOpen((v) => !v)} aria-label="Open menu">
          {menuOpen ? <X className="h-6 w-6 text-green-700" /> : <Menu className="h-6 w-6 text-green-700" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden absolute left-0 top-16 w-full bg-white/95 backdrop-blur-lg shadow-lg z-50 border-t">
          <nav className="flex flex-col gap-2 py-4 px-6">
            {navConfig.filter((item) => !item.show || item.show(user)).map((item) => (
              <Link key={item.name} href={item.link} onClick={() => setMenuOpen(false)} className="text-gray-800 font-medium hover:text-green-700 text-base py-2 border-b border-gray-100">{item.name}</Link>
            ))}
            {user && (
              <>
                <div className="pt-2">
                  <div className="text-sm font-semibold mb-1">Sell Your Services</div>
                  <button onClick={() => { setMenuOpen(false); handleBecomeProvider(); }} className="w-full text-left px-3 py-2 hover:bg-green-50 border-b border-gray-100">Be a Provider</button>
                  <button onClick={() => { setMenuOpen(false); handleBecomeGharbeti(); }} className="w-full text-left px-3 py-2 hover:bg-green-50">Be a Gharbeti</button>
                </div>
                <Link href="/notifications" onClick={() => setMenuOpen(false)} className="px-3 py-2 text-sm border-b border-gray-100">Notifications</Link>
                <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="w-full text-left px-3 py-2 mt-2 text-red-600 hover:bg-red-50 font-semibold">Logout</button>
              </>
            )}
            {!user && (
              <div className="flex flex-col gap-2 px-6 pb-4">
                <Link href="/auth/login" onClick={() => setMenuOpen(false)}><Button variant="ghost" className="w-full justify-start">Sign In</Button></Link>
                <Link href="/auth/register" onClick={() => setMenuOpen(false)}><Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white">Register</Button></Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
