import { useEffect, useState } from "react";
import ServiceProviderDashboard from "@/app/dashboard/provider-dashboard/profile/page";

const BASE_URL = "http://localhost:5000";

export default function Profilpage({ onClose, user }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/admin/users/user-detail/${user.id}`, {
          credentials: "include",
        });
        const json = await res.json();
        if (json.status === "success") {
            console.log("Fetched user detail:", json.data.userDetail);
          setUserData(json.data.userDetail);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchUserDetails();
  }, [user]);

  if (!user || loading) return <div>Loading...</div>;
  if (!userData) return <div>User not found</div>;

  return (
    <div className="modal p-4">
      <button onClick={onClose} className="mb-4">Close</button>
      {/* Pass the fetched data to the dashboard */}
      <ServiceProviderDashboard initialData={userData} allowPhotoChange={false} />
    </div>
  );
}
