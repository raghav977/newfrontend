// app/service-provider/kyc/page.jsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function KycVerificationLayout({children}) {
  const cookieStore = cookies();
  const token = cookieStore.get("token");

  if (!token) {
    redirect("/"); 
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">KYC Verification</h1>
      <p>Welcome, please complete your KYC process.</p>

      <div>
        {children}
        </div>
    </div>
  );
}
