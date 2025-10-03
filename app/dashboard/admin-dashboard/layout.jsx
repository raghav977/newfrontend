import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
// import Sidebar from "./Sidebar";
import Sidebar from "./components/SidebarComp";

export const metadata = {
  title: "Admin Dashboard",
};

export default function AdminLayout({ children }) {
  console.log("AdminLayout rendered");
  const cookieStore = cookies();
  const token = cookieStore.get("token")?.value;
  console.log("This is token",token)
  if (!token) {
    return;
    redirect("/login");
  }

  let user;
  try {
    user = jwt.verify(token, "your_jwt_secret_key");
    console.log("This is user",user)
    if (!user.roles || !user.roles.includes("Admin")) {
      console.log("User is not admin");
      redirect("/auth/login/admin")
      return;
      redirect("/");
    }
  } catch (err) {
    console.error("JWT verification failed:", err);
    return;

    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar user={user} />
      <main className="flex-1 bg-white p-8 overflow-auto">{children}</main>
    </div>
  );
}