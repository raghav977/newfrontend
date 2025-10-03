"use client";
import React, { useState } from "react";
import AuthLayout from "@/app/global/auth-global/authlayout";
import img from "/public/placeholder-logo.png";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

export default function RegisterServiceSeeker() {
  const clientId ="337899844345-5qrjsjkrgs9cibgr3sdc4o9rmm1t5arv.apps.googleusercontent.com";

  // Step state: 1=Choose type, 2=Enter details, 3=Verification
  const [step, setStep] = useState(1);

  // Register method state: "email" or "phone"
  const [method, setMethod] = useState("email");

  // Form values
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Verification code
  const [code, setCode] = useState("");

  // Error and success messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Called when Google login succeeds
  const handleSuccess = (credentialResponse) => {
    const { credential } = credentialResponse;
    console.log("Google credential token:", credential);

    setSuccess("Google login successful!");
    setStep(3);
  };

  
  const handleError = () => {
    setError("Google login failed. Please try again.");
  };

  function handleNext() {
    setError("");
    setSuccess("");
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (method === "email") {
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
          setError("Please enter a valid email address.");
          return;
        }
      } else {
        if (!phone || !/^\d{10,15}$/.test(phone)) {
          setError("Please enter a valid phone number (10-15 digits).");
          return;
        }
      }
      setStep(3);
      // TODO: trigger sending verification code here (API call)
    }
  }

  function handleBack() {
    setError("");
    setSuccess("");
    if (step > 1) setStep(step - 1);
  }

  function handleTokenVerification(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!code || code.length !== 6) {
      setError("Please enter a 6-digit verification code.");
      return;
    }

    // Simulate verification
    // TODO: Call your verification API here
    if (code === "123456") {
      setSuccess("Verification successful! Registration complete.");
      // Reset or redirect user after success
    } else {
      setError("Invalid verification code. Please try again.");
    }
  }

  return (
    <AuthLayout imgSrc={img} imgAlt="register service seeker">
      <div className="text-center">
        <h1 className="font-bold text-2xl mb-6 text-green-600">
          
        </h1>

        {/* Step 1: Choose Method */}
        {step === 1 && (
          <>
            <div className="flex flex-col justify-center gap-6 mb-6">
              <button
                className={`px-6 py-3 rounded-lg font-semibold border ${
                  method === "email"
                    ? "bg-green-600 text-white border-green-600"
                    : "border-gray-300 text-gray-600 hover:bg-green-50"
                }`}
                onClick={() => {
                  setMethod("email");
                  setStep(2);
                }}
                type="button"
              >
                Register with Email
              </button>

              <button
                className={`px-6 py-3 rounded-lg font-semibold border ${
                  method === "phone"
                    ? "bg-green-600 text-white border-green-600"
                    : "border-gray-300 text-gray-600 hover:bg-green-50"
                }`}
                onClick={() => {
                  setMethod("phone");
                  setStep(2);
                }}
                type="button" 
              >
                Register with Phone
              </button>
            </div>

            {/* Google Login Button */}
            <div className="flex justify-center">
              <GoogleOAuthProvider clientId={clientId}>
                <GoogleLogin
                  onSuccess={handleSuccess}
                  onError={handleError}
                  useOneTap
                />
              </GoogleOAuthProvider>
            </div>
          </>
        )}

        {/* Step 2: Input Form */}
        {step === 2 && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleNext();
            }}
            className="max-w-sm mx-auto flex flex-col gap-4"
          >
            {method === "email" && (
              <div className="flex flex-col">
                <label htmlFor="email" className="mb-1 font-medium">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border border-gray-300 p-2 rounded"
                  required
                />
              </div>
            )}

            {method === "phone" && (
              <div className="flex flex-col">
                <label htmlFor="phone" className="mb-1 font-medium">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border border-gray-300 p-2 rounded"
                  required
                />
              </div>
            )}

            {error && (
              <p className="text-red-600 text-sm mt-1 font-semibold">{error}</p>
            )}

            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 rounded border border-gray-400 hover:bg-gray-100"
                disabled={step === 1}
              >
                Back
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                Next
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Verification */}
        {step === 3 && (
          <div className="max-w-sm mx-auto text-center">
            <p className="text-green-700 font-semibold mb-6">
              We have sent a verification code to your{" "}
              {method === "email" ? email : phone}. Please check and enter it
              below.
            </p>

            <form
              onSubmit={handleTokenVerification}
              className="flex flex-col gap-4"
            >
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} // only digits
                className="border border-gray-300 p-2 rounded text-center text-xl tracking-widest"
                required
              />
              {error && <p className="text-red-600 font-semibold">{error}</p>}
              {success && <p className="text-green-600 font-semibold">{success}</p>}

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2 rounded border border-gray-400 hover:bg-gray-100"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  Verify
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
