"use client";

import React, { useEffect, useState } from "react";
import { FaCamera } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BASE_URL = "http://localhost:5000";

export default function ServiceProviderDashboard({ initialData }) {
  const [data, setData] = useState(initialData || null);
  const [loading, setLoading] = useState(!initialData); // only load if no initialData
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [savingPhoto, setSavingPhoto] = useState(false);

  // fetch logged-in user data only if initialData is not provided (admin passes initialData)
  useEffect(() => {
    if (initialData) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/users/about/service-provider`, {
          credentials: "include",
        });
        const json = await res.json();
        if (json.status === "success") {
          setData(json.data.serviceProvider);
        }
      } catch (err) {
        console.error("Failed to fetch:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [initialData]);

  // Handle both logged-in user and admin-provided data
  const user = data?.User || data; // admin passes userDetail directly
  const municipal = user?.municipal;
  const district = municipal?.district;
  const province = district?.province;

  const kyc = data?.kyc || user?.Kyc; // admin uses Kyc
  const kycImages = kyc?.kycImage || kyc?.KycImages || [];

  const imgUrl = (path) => {
    if (!path) return null;
    return path.startsWith("http") ? path : `${BASE_URL}${path}`;
  };

  const handlePhotoChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(f);
    setPhotoPreview(url);
  };

  const handleSavePhoto = async () => {
    if (!photoFile) return alert("Select a picture first.");
    setSavingPhoto(true);

    try {
      const api = `${BASE_URL}/api/users/update-profile`;
      const formData = new FormData();
      formData.append("profile_image", photoFile);

      const res = await fetch(api, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Server returned ${res.status} ${txt}`);
      }

      const json = await res.json();
      const newPath =
        json?.data?.profile_picture ||
        json?.data?.user?.profile_picture ||
        json?.data?.User?.profile_picture ||
        json?.data?.profile_image ||
        json?.profile_picture ||
        null;

      if (newPath) {
        setData((d) => ({
          ...d,
          User: { ...(d?.User || {}), profile_picture: newPath },
        }));
      } else if (json?.data?.user) {
        const returnedUser = json.data.user;
        setData((d) => ({ ...d, User: { ...d?.User, ...returnedUser } }));
      } else {
        throw new Error(json?.message || "Upload succeeded but no profile path returned");
      }

      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
      setPhotoFile(null);
    } catch (err) {
      console.error("Failed to upload photo", err);
      alert("Failed to upload photo: " + (err.message || "Unknown error"));
    } finally {
      setSavingPhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500 text-lg">
        Loading service provider info...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-10 text-center text-red-500 text-lg">
        Failed to load service provider data.
      </div>
    );
  }

  return (
    <div className="">
      <div className="bg-white border rounded-2xl shadow-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <h2 className="text-lg font-semibold">Service Provider Profile</h2>
          <Button className="bg-green-600">Update KYC</Button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar Section */}
          <div className="w-full md:w-1/4 flex flex-col items-center">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-green-100 shadow-sm">
              <img
                src={photoPreview || imgUrl(user?.profile_picture) || "/images/default-profile.jpg"}
                alt={user?.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="mt-3 text-center">
              <div className="font-semibold">{user?.name || user?.username}</div>
              <div className="text-sm text-gray-500">{user?.email}</div>
            </div>

            {/* Only allow photo change if logged-in user */}
            {!initialData && (
              <label className="mt-4 text-sm text-gray-600 flex items-center gap-2 cursor-pointer">
                <FaCamera />
                <span>Change photo</span>
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
              </label>
            )}

            {photoFile && (
              <div className="mt-2 flex gap-2">
                <Button onClick={handleSavePhoto} disabled={savingPhoto}>
                  {savingPhoto ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (photoPreview) URL.revokeObjectURL(photoPreview);
                    setPhotoPreview(null);
                    setPhotoFile(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="flex-1 space-y-6">
            {/* User Info */}
            <div>
              <h3 className="text-xl font-semibold mb-2">User Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Info label="Username" value={user?.username} />
                <Info label="Email" value={user?.email} />
                <Info label="Phone" value={user?.phone_number || "N/A"} />
                <Info label="Active" value={user?.is_active ? "Yes" : "No"} />
                <Info
                  label="Joined"
                  value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                />
              </div>
            </div>

            {/* Location Info */}
            <div>
              <h3 className="text-xl font-semibold mb-2">Location Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Info
                  label="Municipality"
                  value={`${municipal?.name_en || "N/A"} (${municipal?.name_np || ""})`}
                />
                <Info
                  label="District"
                  value={`${district?.name_en || "N/A"} (${district?.name_np || ""})`}
                />
                <Info
                  label="Province"
                  value={`${province?.name_en || "N/A"} (${province?.name_np || ""})`}
                />
              </div>
            </div>

            {/* Provider Info */}
            <div>
              <h3 className="text-xl font-semibold mb-2">Provider Status</h3>
              <div className="flex items-center gap-3">
                <Badge
                  className={`${
                    data?.is_verified
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {data?.is_verified ? "Verified" : "Not Verified"}
                </Badge>
                {data?.is_blocked && (
                  <Badge className="bg-red-100 text-red-700">Blocked</Badge>
                )}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                ID: #{data?.id} • Created:{" "}
                {new Date(data?.createdAt).toLocaleDateString()}
              </div>
            </div>

            {/* KYC Info */}
            <div>
              <h3 className="text-xl font-semibold mb-2">KYC Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Info label="Document Type" value={kyc?.document_type || "N/A"} />
                <Info label="Status" value={kyc?.status || "N/A"} />
                {kyc?.rejection_reason && (
                  <Info label="Rejection Reason" value={kyc.rejection_reason} />
                )}
                <Info
                  label="Verified At"
                  value={kyc?.verified_at ? new Date(kyc.verified_at).toLocaleString() : "N/A"}
                />
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-semibold mb-2">Documents</h4>
                <div className="flex gap-3 flex-wrap">
                  {kycImages.length === 0 ? (
                    <div className="text-sm text-gray-500">No documents submitted</div>
                  ) : (
                    kycImages.map((img, i) => (
                      <a
                        key={i}
                        href={imgUrl(img.image_path)}
                        target="_blank"
                        rel="noreferrer"
                        className="w-40 h-28 block overflow-hidden rounded-md border"
                      >
                        <img
                          src={imgUrl(img.image_path)}
                          alt={img.image_type}
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-medium">{value || "N/A"}</div>
    </div>
  );
}
