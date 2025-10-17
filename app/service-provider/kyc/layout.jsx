// app/service-provider/kyc/page.jsx
import HeaderNavbar from "@/app/landingpagecomponents/components/HeaderNavbar";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function KycVerificationLayout({children}) {
  const cookieStore = cookies();
  const token = cookieStore.get("token");

  if (!token) {
    redirect("/"); 
  }

  return (
    <>
    <HeaderNavbar/>
    <div className="p-6">

      <div>
        {children}
        </div>
    </div>
    </>
  );
}
