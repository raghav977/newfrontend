"use client"
import AuthLayout from "@/app/global/auth-global/authlayout";
import { useState } from "react";
import { FaUser, FaLock } from "react-icons/fa";

export default function ProviderLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch("http://localhost:3024/login-provider/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials:"include"
            });
            const result = await response.json();

            if (!response.ok) {
                console.log("Response",response);
                setError(result?.message || "Login failed. Please try again.");
            } else {
                console.log("this is result",response);    
                
                setError("");
                window.location.href = "/dashboard/provider-dashboard"; 
            }
        } catch (err) {
            setError("Network error. Please try again.");
            console.log("the error",err)
        }
        setLoading(false);
    };

    return (
        <AuthLayout imageSrc="" imageAlt="Provider Login">
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <h2 className="text-2xl font-bold mb-6 text-green-700">Provider Login</h2>
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-sm bg-white rounded-xl shadow p-8 space-y-6 border border-green-100"
                >
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-green-700 mb-2">
                            Email
                        </label>
                        <div className="flex items-center border border-green-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-green-400">
                            <FaUser className="text-green-400 mr-2" />
                            <input
                                id="email"
                                type="email"
                                className="w-full outline-none bg-transparent"
                                placeholder="Enter your email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                autoComplete="email"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-green-700 mb-2">
                            Password
                        </label>
                        <div className="flex items-center border border-green-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-green-400">
                            <FaLock className="text-green-400 mr-2" />
                            <input
                                id="password"
                                type="password"
                                className="w-full outline-none bg-transparent"
                                placeholder="Enter your password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                                disabled={loading}
                            />
                        </div>
                    </div>
                    {error && (
                        <div className="text-red-500 text-sm mt-2">{error}</div>
                    )}
                    <button
                        type="submit"
                        className={`w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </AuthLayout>
    );
}