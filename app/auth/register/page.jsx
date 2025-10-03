"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaLock, FaMapMarkerAlt, FaPhone, FaCheckCircle } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function ServiceProviderSignup() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [useEmail, setUseEmail] = useState(true);
  const [contactValue, setContactValue] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    password: "",
    primary_address: "",
    secondary_address: "",
    username:"",
    name:"",
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordMessage, setPasswordMessage] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!contactValue.trim()) {
      setError(useEmail ? "Please enter your email." : "Please enter your phone number.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/users/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: contactValue, type: useEmail ? "email" : "phone" }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to send OTP");
      }
      setOtpSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/users/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: contactValue, otp: otp }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to verify OTP");
      setOtpVerified(true);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Registration Functions ----------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "password") checkPasswordStrength(value);
  };

  const checkPasswordStrength = (pwd) => {
    let score = 0;
    if (!pwd) {
      setPasswordStrength(0);
      setPasswordMessage("");
      return;
    }
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    setPasswordStrength(score);
    if (score <= 2) setPasswordMessage("Weak password");
    else if (score <= 4) setPasswordMessage("Medium password");
    else setPasswordMessage("Strong password");
  };

  const getPasswordColor = () => {
    switch (passwordStrength) {
      case 1:
      case 2:
        return "bg-red-500";
      case 3:
      case 4:
        return "bg-yellow-400";
      case 5:
        return "bg-green-500";
      default:
        return "bg-gray-200";
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (passwordStrength < 3) {
      setError("Password is too weak.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: contactValue, ...formData }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");
      setLoading(false);
      router.push("/auth/login");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // ---------- Render ----------
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <Card className="rounded-2xl shadow-2xl p-8 border border-green-100">
          <h1 className="text-3xl font-bold text-green-700 text-center mb-8 tracking-tight">
            Service Provider Registration
          </h1>

          <AnimatePresence mode="wait">
            {/* Step 1: Send OTP */}
            {step === 1 && (
              <motion.form
                key="step1"
                onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex justify-center mb-6 relative">
                  <div className="flex bg-green-100 rounded-full p-1 w-64 relative">
                    <motion.div
                      layout
                      className="absolute top-1 left-1 bottom-1 w-1/2 rounded-full bg-green-600 z-0"
                      animate={{ x: useEmail ? 0 : "100%" }}
                      style={{ width: "calc(50% - 0.5rem)" }}
                    />
                    <button
                      type="button"
                      className={`relative z-10 w-1/2 py-2 font-semibold rounded-full transition-colors ${
                        useEmail ? "text-white" : "text-green-700"
                      }`}
                      onClick={() => {
                        setUseEmail(true);
                        setContactValue("");
                        setOtpSent(false);
                        setOtp("");
                        setError("");
                      }}
                    >
                      <FaEnvelope className="inline mr-2" />
                      Email
                    </button>
                    <button
                      type="button"
                      className={`relative z-10 w-1/2 py-2 font-semibold rounded-full transition-colors ${
                        !useEmail ? "text-white" : "text-green-700"
                      }`}
                      onClick={() => {
                        setUseEmail(false);
                        setContactValue("");
                        setOtpSent(false);
                        setOtp("");
                        setError("");
                      }}
                    >
                      <FaPhone className="inline mr-2" />
                      Phone
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-green-700 mb-2">
                    {useEmail ? "Email" : "Phone Number"}
                  </label>
                  <div className="flex items-center border border-green-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-green-400 bg-white">
                    {useEmail ? (
                      <FaEnvelope className="text-green-400 mr-2" />
                    ) : (
                      <FaPhone className="text-green-400 mr-2" />
                    )}
                    <Input
                      type={useEmail ? "email" : "tel"}
                      value={contactValue}
                      onChange={(e) => setContactValue(e.target.value)}
                      required
                      className="w-full outline-none bg-transparent border-none shadow-none"
                      placeholder={useEmail ? "Enter your email" : "Enter your phone number"}
                      disabled={loading}
                    />
                  </div>
                </div>

                {otpSent && (
                  <div>
                    <label className="block text-sm font-semibold text-green-700 mb-2">Enter OTP</label>
                    <div className="flex items-center border border-green-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-green-400 bg-white">
                      <FaCheckCircle className="text-green-400 mr-2" />
                      <Input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        className="w-full outline-none bg-transparent border-none shadow-none"
                        placeholder="Enter OTP"
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}

                {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                <Button
                  type="submit"
                  className={`w-full text-lg py-2 bg-green-600 hover:bg-green-700 font-bold rounded-lg transition ${
                    loading ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                  disabled={loading}
                >
                  {loading ? (otpSent ? "Verifying..." : "Sending OTP...") : otpSent ? "Verify OTP" : "Send OTP"}
                </Button>
              </motion.form>
            )}

            {/* Step 2: Registration Form */}
            {step === 2 && (
              <motion.form
                key="step2"
                onSubmit={handleRegister}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-green-700 mb-2">Password</label>
                  <div className="flex items-center border border-green-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-green-400 bg-white">
                    <FaLock className="text-green-400 mr-2" />
                    <Input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                      className="w-full outline-none bg-transparent border-none shadow-none"
                      disabled={loading}
                    />
                  </div>
                  {formData.password && (
                    <div className="mt-1">
                      <div className="h-2 w-full bg-gray-200 rounded">
                        <div
                          className={`h-2 rounded ${getPasswordColor()}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs mt-1 text-gray-600">{passwordMessage}</p>
                    </div>
                  )}
                </div>

                {/* Primary Address */}
                <div>
                  <label className="block text-sm font-semibold text-green-700 mb-2">Primary Address</label>
                  <div className="flex items-center border border-green-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-green-400 bg-white">
                    <FaMapMarkerAlt className="text-green-400 mr-2" />
                    <Input
                      type="text"
                      name="primary_address"
                      value={formData.primary_address}
                      onChange={handleChange}
                      placeholder="Enter your primary address"
                      required
                      className="w-full outline-none bg-transparent border-none shadow-none"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Secondary Address */}
                <div>
                  <label className="block text-sm font-semibold text-green-700 mb-2">Secondary Address</label>
                  <div className="flex items-center border border-green-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-green-400 bg-white">
                    <FaMapMarkerAlt className="text-green-400 mr-2" />
                    <Input
                      type="text"
                      name="secondary_address"
                      value={formData.secondary_address}
                      onChange={handleChange}
                      placeholder="Enter your secondary address"
                      className="w-full outline-none bg-transparent border-none shadow-none"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-green-700 mb-2">Username</label>
                  <div className="flex items-center border border-green-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-green-400 bg-white">
                    <FaMapMarkerAlt className="text-green-400 mr-2" />
                    <Input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter your username"
                      required
                      className="w-full outline-none bg-transparent border-none shadow-none"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-green-700 mb-2">Name</label>
                  <div className="flex items-center border border-green-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-green-400 bg-white">
                    <FaMapMarkerAlt className="text-green-400 mr-2" />
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      required
                      className="w-full outline-none bg-transparent border-none shadow-none"
                      disabled={loading}
                    />
                  </div>
                </div>

                {error && <div className="text-red-500 text-sm text-center">{error}</div>}

                <Button
                  type="submit"
                  className={`w-full text-lg py-2 bg-green-600 hover:bg-green-700 font-bold rounded-lg transition ${
                    loading ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Register"}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
