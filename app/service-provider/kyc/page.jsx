"use client";
import { useEffect, useState } from "react";
import { FaIdCard, FaFileUpload, FaCheckCircle } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchDocumentType } from "@/app/redux/slices/documetTypeSlice";
import { useRouter, useSearchParams } from "next/navigation";

export default function KycPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const entity = searchParams.get("name"); // 'gharbeti' or 'service-provider'

  const dispatch = useDispatch();
  const documentTypes = useSelector((state) => state.document.list);

  const [documentType, setDocumentType] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [citizenshipFront, setCitizenshipFront] = useState(null);
  const [citizenshipBack, setCitizenshipBack] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Handles file input changes dynamically
  const handleFileChange = (setter) => (e) => {
    if (e.target.files && e.target.files[0]) setter(e.target.files[0]);
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!documentType || !selfieFile) {
      return setError("Please select a document type and upload your selfie.");
    }

    if (documentType === "citizenship_card" && (!citizenshipFront || !citizenshipBack)) {
      return setError("Both front and back images of citizenship are required.");
    }

    if (documentType !== "citizenship_card" && !documentFile) {
      return setError("Please upload your document.");
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("document_type", documentType);
      formData.append("passport_photo", selfieFile);

      if (documentType === "citizenship_card") {
        formData.append("citizenship_card_front", citizenshipFront);
        formData.append("citizenship_card_back", citizenshipBack);
      } else {
        formData.append("document_file", documentFile);
      }
      console.log("Submitting KYC for entity:", entity);

      if (!entity) {
        setError("Invalid request");
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/kyc/apply?data=${entity}`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push(
            entity === "gharbeti"
              ? "/dashboard/gharbeti-dashboard/"
              : "/dashboard/provider-dashboard/"
          );
        }, 1500);
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchDocumentType());
  }, [dispatch]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50 p-4 sm:p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8 border border-green-100">
        {/* Header */}
        <div className="text-center mb-6">
          <FaCheckCircle className="mx-auto text-green-600 text-5xl mb-2" />
          <h2 className="text-2xl font-bold text-green-700 mb-1">Complete Your KYC</h2>
          <p className="text-gray-600 text-sm">
            Upload your documents to verify your account as a {entity === "gharbeti" ? "Gharbeti" : "Service Provider"}.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Document Type */}
          <div>
            <label className="block text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
              <FaIdCard /> Document Type
            </label>
            <select
              className="w-full border border-green-200 rounded-lg p-2 focus:ring-2 focus:ring-green-400"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              required
              disabled={loading}
            >
              <option value="">Select Document Type</option>
              {Array.isArray(documentTypes) &&
                documentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replaceAll("_", " ").toUpperCase()}
                  </option>
                ))}
            </select>
          </div>

          {/* Conditional file inputs */}
          {documentType === "citizenship_card" ? (
            <>
              {["Front", "Back"].map((side) => (
                <div key={side}>
                  <label className="block text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                    <FaFileUpload /> Citizenship {side}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full border border-green-200 rounded-lg p-2 bg-white"
                    onChange={handleFileChange(side === "Front" ? setCitizenshipFront : setCitizenshipBack)}
                    required
                    disabled={loading}
                  />
                </div>
              ))}
            </>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                <FaFileUpload /> Upload Document
              </label>
              <input
                type="file"
                accept="image/*,.pdf"
                className="w-full border border-green-200 rounded-lg p-2 bg-white"
                onChange={handleFileChange(setDocumentFile)}
                required
                disabled={loading}
              />
            </div>
          )}

          {/* Selfie */}
          <div>
            <label className="block text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
              <FaFileUpload /> Passport Size Photo (Selfie)
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full border border-green-200 rounded-lg p-2 bg-white"
              onChange={handleFileChange(setSelfieFile)}
              required
              disabled={loading}
            />
          </div>

          {/* Error & Success */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && (
            <p className="text-green-600 text-sm text-center font-semibold">
              ✅ KYC submitted successfully! Redirecting...
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className={`w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit KYC"}
          </button>
        </form>
      </div>
    </div>
  );
}
