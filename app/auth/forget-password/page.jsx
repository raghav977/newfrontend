"use client";

import { useState } from "react";

export default function ForgetPassword() {
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP & new password, 3: Success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // Step 1: Request OTP
  const handleRequestOtp = async () => {
    setError("");
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/users/forget-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to send OTP. Try again.");
        setLoading(false);
        return;
      }

      setStep(2);
      setSuccessMsg("OTP sent to your email.");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password (with OTP)
  const handleResetPassword = async () => {
    setError("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to reset password.");
        setLoading(false);
        return;
      }

      setSuccessMsg("Password reset successfully! You can now login.");
      setStep(3);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Forgot Password</h1>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 mb-4 rounded">{error}</div>
      )}

      {successMsg && (
        <div className="bg-green-100 text-green-700 px-4 py-2 mb-4 rounded">{successMsg}</div>
      )}

      {step === 1 && (
        <>
          <label className="block mb-2 font-semibold" htmlFor="email">
            Enter your email address
          </label>
          <input
            type="email"
            id="email"
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <button
            onClick={handleRequestOtp}
            disabled={loading}
            className={`w-full py-2 px-4 rounded text-white font-semibold ${
              loading ? "bg-indigo-300" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <p className="mb-4">
            Enter the 6-digit OTP sent to <strong>{email}</strong>, and set your new
            password.
          </p>

          <input
            type="text"
            maxLength={6}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-center tracking-widest text-xl font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            disabled={loading}
          />

          <label className="block mb-2 font-semibold" htmlFor="newPassword">
            New Password
          </label>
          <input
            type="password"
            id="newPassword"
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={loading}
          />

          <label className="block mb-2 font-semibold" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            className="w-full border border-gray-300 rounded px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />

          <button
            onClick={handleResetPassword}
            disabled={loading}
            className={`w-full py-2 px-4 rounded text-white font-semibold ${
              loading ? "bg-indigo-300" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>

          <button
            className="mt-3 text-sm text-indigo-600 underline"
            onClick={() => setStep(1)}
            disabled={loading}
          >
            Change Email
          </button>
        </>
      )}

      {step === 3 && (
        <div className="text-center">
          <p className="mb-4 text-green-700 font-semibold">
            Your password has been reset successfully.
          </p>
          <a
            href="/login"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded"
          >
            Go to Login
          </a>
        </div>
      )}
    </div>
  );
}
