"use client"
import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useDispatch } from "react-redux"
import { usePathname } from "next/navigation"
import { io } from "socket.io-client"
import { Bell, LogOut, Home, MessageSquare, User, Building2, CheckCircle, AlertTriangle } from "lucide-react"

export default function GharbetiLayout({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [verified, setVerified] = useState(false)
  const socketRef = useRef(null)

  const dispatch = useDispatch()
  const pathname = usePathname()

  const providerNavbar = [
    { name: "Dashboard", link: "/dashboard/gharbeti-dashboard", icon: Home },
    {
      name: "Room",
      link: "/dashboard/gharbeti-dashboard/room",
      icon: Building2,
      children: [
        { name: "Rented Room", link: "/dashboard/gharbeti-dashboard/rented-room" },
        { name: "Available Room", link: "/dashboard/gharbeti-dashboard/listed-room/" },
      ],
    },
    { name: "Profile", link: "/dashboard/gharbeti-dashboard/profile", icon: User },
    { name: "Messages", link: "/dashboard/gharbeti-dashboard/messages", icon: MessageSquare },
  ]

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("https://backendwala.onrender.com/api/users/about/gharbeti", { credentials: "include" })
        const data = await res.json()
        console.log("THis is data",data.data.gharbeti);
        
        setVerified(data.data.gharbeti.is_verified)
        setUser(data.data.gharbeti);
      } catch (err) {
        console.error("Failed to fetch user:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [dispatch])

  useEffect(() => {
    if (!user) return

    socketRef.current = io("http://localhost:3024", { withCredentials: true })
    socketRef.current.emit("register", { userId: user.id, role: "gharbeti" })

    socketRef.current.on("offlineNotifications", (msgs) => setNotifications((prev) => [...msgs, ...prev]))
    socketRef.current.on("privateBid", (msg) => setNotifications((prev) => [{ ...msg, customResponse: "" }, ...prev]))
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
    )
    socketRef.current.on("privateMessage", (msg) =>
      setNotifications((prev) => [
        { type: "message", from: msg.from, text: msg.text, message: `Message from User ${msg.from}: ${msg.text}` },
        ...prev,
      ])
    )

    return () => socketRef.current.disconnect()
  }, [user])

  const handleLogout = async () => {
    await fetch("http://localhost:3024/auth/logout", { credentials: "include" })
    setUser(null)
  }

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#019561]"></div>
      </div>
    )

  if (!user)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Authentication Required</h2>
          <p className="text-gray-600 mt-2">Please log in to access your dashboard</p>
          <Link href="/login" className="mt-4 inline-block px-6 py-2 bg-[#019561] text-white rounded-md hover:bg-[#017a4b] transition-colors">
            Log In
          </Link>
        </div>
      </div>
    )

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-[#019561] border-r border-[#017a4b] flex flex-col shadow-lg">
        <div className="p-6 border-b border-[#017a4b]">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user.profileImage || "/placeholder.svg?height=48&width=48&query=profile"}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover ring-2 ring-[#a1e2c8]"
              />
              {verified && (
                <CheckCircle className="absolute -bottom-1 -right-1 h-5 w-5 text-[#a1e2c8] bg-[#019561] rounded-full p-0.5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white text-lg truncate">{user.name || "Property Manager"}</h3>
              <p className="text-sm text-[#a1e2c8]">Property Manager</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {providerNavbar.map((nav) => {
            const Icon = nav.icon
            const isActive = pathname === nav.link

            return nav.children ? (
              <div key={nav.name} className="space-y-1">
                <Link
                  href={nav.link}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-[#017a4b] text-white shadow-md"
                      : "text-[#e6f4ef] hover:bg-[#017a4b] hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span>{nav.name}</span>
                </Link>
                <div className="ml-8 space-y-1">
                  {nav.children.map((child) => {
                    const isChildActive = pathname === child.link
                    return (
                      <Link
                        key={child.name}
                        href={child.link}
                        className={`block px-4 py-2 text-sm rounded-md transition-colors ${
                          isChildActive
                            ? "text-white font-semibold bg-[#017a4b]"
                            : "text-[#a1e2c8] hover:text-white hover:bg-[#017a4b]"
                        }`}
                      >
                        {child.name}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ) : (
              <Link
                key={nav.name}
                href={nav.link}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-[#017a4b] text-white shadow-md"
                    : "text-[#e6f4ef] hover:bg-[#017a4b] hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{nav.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-[#017a4b]">
          <p className="text-xs text-[#a1e2c8] text-center">&copy; {new Date().getFullYear()} Kaam-Chaa</p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto flex flex-col">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            {!verified && (
              <div className="flex items-center gap-3 bg-[#e6f4ef] border border-[#a1e2c8] rounded-lg px-4 py-3 max-w-md">
                <AlertTriangle className="h-5 w-5 text-[#019561] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-[#019561] text-sm">KYC Verification Required</h4>
                  <p className="text-xs text-[#017a4b] mt-1">Complete verification to unlock all features</p>
                </div>
                <Link
                  href="/service-provider/kyc"
                  className="px-4 py-2 bg-[#019561] text-white rounded-md hover:bg-[#017a4b] text-sm font-semibold transition-colors"
                >
                  Verify Now
                </Link>
              </div>
            )}

            <div className="flex items-center gap-4 ml-auto">
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="relative p-2 rounded-lg hover:bg-[#e6f4ef] transition-colors"
                >
                  <Bell className="h-5 w-5 text-gray-700" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#019561] text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[1.5rem] h-5 flex items-center justify-center">
                      {notifications.length > 99 ? "99+" : notifications.length}
                    </span>
                  )}
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-96 bg-white shadow-xl rounded-lg border border-gray-200 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200 bg-[#e6f4ef]">
                      <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center">
                          <Bell className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm text-gray-500">No new notifications</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200">
                          {notifications.map((n, idx) => (
                            <div key={idx} className="p-4 hover:bg-[#e6f4ef] transition-colors cursor-pointer">
                              <p className="text-sm text-gray-800 leading-relaxed">{n.message}</p>
                              <span className="text-xs text-gray-500 mt-1 block">
                                {new Date(n.createdAt || Date.now()).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-[#019561] text-white rounded-lg hover:bg-[#017a4b] text-sm font-semibold transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 bg-gray-50">{children}</div>
      </main>
    </div>
  )
}