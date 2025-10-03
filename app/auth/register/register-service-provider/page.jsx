"use client";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaLock, FaMapMarkerAlt, FaPhone, FaCheckCircle } from "react-icons/fa";
// import { Router, useRouter } from "next/router";
import { useRouter } from 'next/navigation'


export default function ServiceProviderSignup() {
  // const router =  Router();
  const router = useRouter();

  // const router = useRouter();
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
  });

  
  const handleSendOtp = async (e) => {
  e.preventDefault();
  setError("");

  if (!contactValue.trim() ) {
    setError(useEmail ? "Please enter your email." : "Please enter your phone number.");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("http://localhost:3024/otp/send-otp/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        email: contactValue,
        type: useEmail ? "email" : "phone"
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      console.log("This is response error",data)
      throw new Error(data.message || "Failed to send OTP");
    }

    setOtpSent(true);
  } catch (err) {
    console.log("This is an error",err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
  e.preventDefault();
  setError("");

  if (!otp.trim()) {
    setError("Please enter the OTP.");
    return;
  }

  setLoading(true);

  try {
    const response = await fetch("http://localhost:3024/otp/verify-otp/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: contactValue, 
        token: otp,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to verify OTP");
    }

    
    setOtpVerified(true);
    setStep(2); 
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};


  // Step 3: Registration Form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try{
        const response = await fetch("http://localhost:3024/register-service-provider/",{
            method: "POST",
            credentials:"include",
            headers:{
                 "Content-Type": "application/json",
            },
            body:JSON.stringify({
                email:contactValue,
                ...formData,  
            })
        })
        const data = await response.json()
        console.log("Rsponse",data);
        // alert("Successfully registered");
        setLoading(false);
        router.push(`/service-provider/kyc`);
        // router.push("/")
        

    }
    catch(err){
        console.log("Something went wrong",err);

    }
  };

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
          {/* Stepper */}
          <div className="flex justify-center mb-8 gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? "text-green-700" : "text-gray-400"}`}>
              <FaEnvelope className="text-green-400" />
              <span>Email/Phone</span>
              {step > 1 && <FaCheckCircle className="text-green-500" />}
            </div>
            <div className={`flex items-center gap-2 ${step >= 2 ? "text-green-700" : "text-gray-400"}`}>
              <FaCheckCircle className="text-green-400" />
              <span>Register</span>
              {step > 2 && <FaCheckCircle className="text-green-500" />}
            </div>
          </div>
          {/* Step 1: Choose Email/Phone and Send OTP */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex justify-center mb-6 relative">
                  <div className="flex bg-green-100 rounded-full p-1 w-64 relative">
                    <motion.div
                      layout
                      className="absolute top-1 left-1 bottom-1 w-1/2 rounded-full bg-green-600 z-0"
                      animate={{
                        x: useEmail ? 0 : "100%",
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      style={{
                        width: "calc(50% - 0.5rem)",
                      }}
                    />
                    <button
                      type="button"
                      className={`relative z-10 w-1/2 py-2 font-semibold rounded-full transition-colors ${
                        useEmail ? "text-white" : "text-green-700"
                      }`}
                      onClick={() => { setUseEmail(true); setContactValue(""); setOtpSent(false); setOtp(""); setError(""); }}
                    >
                      <FaEnvelope className="inline mr-2" />
                      Email
                    </button>
                    <button
                      type="button"
                      className={`relative z-10 w-1/2 py-2 font-semibold rounded-full transition-colors ${
                        !useEmail ? "text-white" : "text-green-700"
                      }`}
                      onClick={() => { setUseEmail(false); setContactValue(""); setOtpSent(false); setOtp(""); setError(""); }}
                    >
                      <FaPhone className="inline mr-2" />
                      Phone
                    </button>
                  </div>
                </div>
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-6">
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
                          name={useEmail ? "email" : "phone"}
                          value={contactValue}
                          onChange={e => setContactValue(e.target.value)}
                          required
                          className="w-full outline-none bg-transparent border-none shadow-none"
                          placeholder={useEmail ? "Enter your email" : "Enter your phone number"}
                          disabled={loading}
                        />
                      </div>
                    </div>
                    {error && (
                      <div className="text-red-500 text-sm mt-2 text-center">{error}</div>
                    )}
                    <Button
                      type="submit"
                      className={`w-full text-lg py-2 bg-green-600 hover:bg-green-700 font-bold rounded-lg transition ${
                        loading ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                      disabled={loading}
                    >
                      {loading ? "Sending OTP..." : "Send OTP"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-green-700 mb-2">
                        Enter OTP
                      </label>
                      <div className="flex items-center border border-green-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-green-400 bg-white">
                        <FaCheckCircle className="text-green-400 mr-2" />
                        <Input
                          type="text"
                          name="otp"
                          value={otp}
                          onChange={e => setOtp(e.target.value)}
                          required
                          className="w-full outline-none bg-transparent border-none shadow-none"
                          placeholder="Enter OTP"
                          disabled={loading}
                        />
                      </div>
                    </div>
                    {error && (
                      <div className="text-red-500 text-sm mt-2 text-center">{error}</div>
                    )}
                    <Button
                      type="submit"
                      className={`w-full text-lg py-2 bg-green-600 hover:bg-green-700 font-bold rounded-lg transition ${
                        loading ? "opacity-60 cursor-not-allowed" : ""
                      }`}
                      disabled={loading}
                    >
                      {loading ? "Verifying..." : "Verify OTP"}
                    </Button>
                  </form>
                )}
              </motion.div>
            )}
            {/* Step 2: Registration Form */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleRegister}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-semibold text-green-700 mb-2">
                    Password
                  </label>
                  <div className="flex items-center border border-green-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-green-400 bg-white">
                    <FaLock className="text-green-400 mr-2" />
                    <Input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full outline-none bg-transparent border-none shadow-none"
                      placeholder="Enter your password"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-green-700 mb-2">
                    Primary Address
                  </label>
                  <div className="flex items-center border border-green-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-green-400 bg-white">
                    <FaMapMarkerAlt className="text-green-400 mr-2" />
                    <Input
                      type="text"
                      name="primary_address"
                      value={formData.primary_address}
                      onChange={handleChange}
                      required
                      className="w-full outline-none bg-transparent border-none shadow-none"
                      placeholder="Enter your primary address"
                      disabled={loading}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-green-700 mb-2">
                    Secondary Address
                  </label>
                  <div className="flex items-center border border-green-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-green-400 bg-white">
                    <FaMapMarkerAlt className="text-green-400 mr-2" />
                    <Input
                      type="text"
                      name="secondary_address"
                      value={formData.secondary_address}
                      onChange={handleChange}
                      className="w-full outline-none bg-transparent border-none shadow-none"
                      placeholder="Enter your secondary address"
                      disabled={loading}
                    />
                  </div>
                </div>
                {error && (
                  <div className="text-red-500 text-sm mt-2 text-center">{error}</div>
                )}
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
            {/* Step 3: Success */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <FaCheckCircle className="text-green-600 text-5xl mb-4" />
                <h2 className="text-2xl font-bold text-green-700 mb-2">Registration Successful!</h2>
                <p className="text-green-700 mb-4 text-center">Welcome to Kaam-Chaa. You can now login and start providing your services.</p>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
                  onClick={() => window.location.href = "/auth/login/provider"}
                >
                  Go to Login
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}