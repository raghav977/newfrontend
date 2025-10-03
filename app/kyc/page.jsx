"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaIdCard, FaPassport, FaCheckCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function KycVerification() {
  const router = useRouter();
  const [documentType, setDocumentType] = useState("passport");
  const [passportPhoto, setPassportPhoto] = useState(null);
  const [citizenshipFront, setCitizenshipFront] = useState(null);
  const [citizenshipBack, setCitizenshipBack] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!passportPhoto) {
      setError("Passport size photo is required");
      setLoading(false);
      return;
    }

    if (documentType === "citizenship" && (!citizenshipFront || !citizenshipBack)) {
      setError("Both front and back images of citizenship are required");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("document_type", documentType);
    formData.append("passport_size_photo", passportPhoto);

    if (documentType === "citizenship") {
      formData.append("citizenship_front", citizenshipFront);
      formData.append("citizenship_back", citizenshipBack);
    } else {
      formData.append("document", documentType === "passport" ? passportPhoto : null);
    }

    try {
      const res = await fetch("http://localhost:3024/upgrade-provider", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "KYC submission failed");

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="rounded-2xl shadow-2xl p-8 border border-green-100">
          <h1 className="text-3xl font-bold text-green-700 text-center mb-6">
            KYC Verification
          </h1>

          <AnimatePresence>
            {!success ? (
              <motion.form
                key="kyc-form"
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-green-700 mb-1">
                    Document Type
                  </label>
                  <select
                    className="w-full border border-green-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                  >
                    <option value="passport">Passport</option>
                    <option value="citizenship">Citizenship Card</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-green-700 mb-1">
                    Passport Size Photo
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPassportPhoto(e.target.files[0])}
                    required
                  />
                </div>

                {documentType === "citizenship" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-green-700 mb-1">
                        Citizenship Front
                      </label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCitizenshipFront(e.target.files[0])}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-green-700 mb-1">
                        Citizenship Back
                      </label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setCitizenshipBack(e.target.files[0])}
                        required
                      />
                    </div>
                  </>
                )}

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <Button
                  type="submit"
                  className={`w-full py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg ${
                    loading ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit KYC"}
                </Button>
              </motion.form>
            ) : (
              <motion.div
                key="kyc-success"
                className="flex flex-col items-center justify-center py-12"
              >
                <FaCheckCircle className="text-green-600 text-5xl mb-4" />
                <h2 className="text-2xl font-bold text-green-700 mb-2">
                  KYC Submitted Successfully!
                </h2>
                <p className="text-green-700 text-center mb-4">
                  Your application is under review. You will be notified once verified.
                </p>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
                  onClick={() => router.push("/dashboard")}
                >
                  Go to Dashboard
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
