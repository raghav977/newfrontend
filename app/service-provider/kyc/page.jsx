"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaIdCard, FaFileUpload, FaCheckCircle, FaCamera } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchDocumentType } from "@/app/redux/slices/documetTypeSlice";
import { useRouter, useSearchParams } from "next/navigation";

export default function KycPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const entity = searchParams.get("name"); // 'gharbeti' or 'service_provider'

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

  useEffect(() => {
    dispatch(fetchDocumentType());
  }, [dispatch]);

  const handleFileChange = (setter) => (e) => {
    if (e.target.files && e.target.files[0]) setter(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!documentType || !selfieFile)
      return setError("Please select a document type and upload your selfie.");

    if (documentType === "citizenship_card" && (!citizenshipFront || !citizenshipBack))
      return setError("Both front and back images of citizenship are required.");

    if (documentType !== "citizenship_card" && !documentFile)
      return setError("Please upload your document.");

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
        }, 2000);
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

  const previewImage = (file) => file && URL.createObjectURL(file);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-green-100 p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <FaCheckCircle className="mx-auto text-green-600 text-6xl mb-3" />
          <h2 className="text-3xl font-bold text-green-700">
            Verify Your Identity
          </h2>
          <p className="text-gray-600 mt-2 text-sm">
            Please complete your KYC to continue as a{" "}
            <span className="font-semibold text-green-700">
              {entity === "gharbeti" ? "Gharbeti" : "Service Provider"}
            </span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Type */}
          <div>
            <label className="block text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
              <FaIdCard /> Select Document Type
            </label>
            <select
              className="w-full border border-green-200 rounded-xl p-3 bg-white text-gray-700 focus:ring-2 focus:ring-green-500 outline-none transition"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              required
              disabled={loading}
            >
              <option value="">Choose your document</option>
              {Array.isArray(documentTypes) &&
                documentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replaceAll("_", " ").toUpperCase()}
                  </option>
                ))}
            </select>
          </div>

          {/* Upload Fields */}
          <div className="space-y-5">
            {documentType === "citizenship_card" ? (
              <>
                {[
                  { label: "Citizenship Front", setter: setCitizenshipFront, file: citizenshipFront },
                  { label: "Citizenship Back", setter: setCitizenshipBack, file: citizenshipBack },
                ].map(({ label, setter, file }) => (
                  <div key={label}>
                    <label className="block text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                      <FaFileUpload /> {label}
                    </label>
                    <div className="flex flex-col items-center gap-3 border-2 border-dashed border-green-200 p-4 rounded-xl hover:border-green-400 transition">
                      <input
                        type="file"
                        accept="image/*"
                        className="w-full text-sm text-gray-600"
                        onChange={handleFileChange(setter)}
                        disabled={loading}
                        required
                      />
                      {file && (
                        <img
                          src={previewImage(file)}
                          alt={label}
                          className="w-40 h-28 object-cover rounded-lg border border-green-100 shadow-sm"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div>
                <label className="block text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                  <FaFileUpload /> Upload Document
                </label>
                <div className="flex flex-col items-center gap-3 border-2 border-dashed border-green-200 p-4 rounded-xl hover:border-green-400 transition">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="w-full text-sm text-gray-600"
                    onChange={handleFileChange(setDocumentFile)}
                    disabled={loading}
                    required
                  />
                  {documentFile && (
                    <p className="text-xs text-green-700 font-medium">
                      ✅ {documentFile.name}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Selfie */}
            <div>
              <label className="block text-sm font-semibold text-green-700 mb-2 flex items-center gap-2">
                <FaCamera /> Passport Size Photo (Selfie)
              </label>
              <div className="flex flex-col items-center gap-3 border-2 border-dashed border-green-200 p-4 rounded-xl hover:border-green-400 transition">
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-sm text-gray-600"
                  onChange={handleFileChange(setSelfieFile)}
                  disabled={loading}
                  required
                />
                {selfieFile && (
                  <img
                    src={previewImage(selfieFile)}
                    alt="Selfie"
                    className="w-32 h-32 object-cover rounded-full border border-green-100 shadow-md"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Feedback Messages */}
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm text-center font-medium"
            >
              {error}
            </motion.p>
          )}
          {success && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-green-600 text-sm text-center font-semibold"
            >
              ✅ KYC submitted successfully! Redirecting...
            </motion.p>
          )}

          {/* Submit Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className={`w-full py-3 font-semibold rounded-xl transition text-white ${
              loading
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl"
            }`}
          >
            {loading ? "Submitting..." : "Submit KYC"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
