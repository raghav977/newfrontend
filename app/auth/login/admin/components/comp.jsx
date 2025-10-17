// ...existing code...
"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "/public/placeholder-logo.png";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!email || !password) {
            setError("Please enter both email and password.");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch("http://localhost:5000/api/users/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const text = await response.text().catch(() => null);
                throw new Error(text || `Http Error! status: ${response.status}`);
            }

            // successful login
            setLoading(false);
            router.push("/dashboard/admin-dashboard/");
        } catch (err) {
            setLoading(false);
            setError("Invalid credentials or server error.");
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex items-center justify-center px-4">
            <div className="max-w-xl w-full bg-white shadow-xl rounded-2xl p-8 sm:p-10">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full overflow-hidden shadow-sm border">
                        <Image src={logo} alt="logo" width={64} height={64} className="object-cover" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900">Admin Portal</h1>
                        <p className="text-sm text-slate-500">Secure admin sign in</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                        <div className="relative">
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                placeholder="you@company.com"
                                autoComplete="email"
                                required
                                aria-required="true"
                            />
                            <span className="absolute right-3 top-3 text-slate-400 text-sm">{email ? "" : ""}</span>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-lg border px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                                aria-required="true"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                className="absolute right-3 top-3 text-sm text-slate-600 hover:text-slate-800"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="inline-flex items-center gap-2">
                            <input type="checkbox" checked={remember} onChange={() => setRemember(r => !r)} className="h-4 w-4 rounded border-slate-300" />
                            <span className="text-slate-600">Remember me</span>
                        </label>
                        <a className="text-emerald-600 hover:underline" href="/auth/forgot">Forgot password?</a>
                    </div>

                    {error && <div className="text-red-500 text-sm">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 rounded-xl text-white font-semibold transition ${loading ? "bg-emerald-300 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"}`}
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-500">Or sign in with</div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-center gap-3 rounded-lg border py-2 hover:shadow-sm transition">
                        <svg className="w-5 h-5 text-sky-500" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12.073C22 11.332 21.947 10.616 21.848 9.92H12v3.81h5.497c-.236 1.273-.949 2.353-2.025 3.08v2.564H18.94c2.105-1.938 3.085-4.803 3.06-8.36z"/></svg>
                        <span className="text-sm">Google</span>
                    </button>
                    <button className="flex items-center justify-center gap-3 rounded-lg border py-2 hover:shadow-sm transition">
                        <svg className="w-5 h-5 text-slate-700" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.485 2 12.02 2 16.99 5.657 20.9 10.438 21.8v-6.9H8.078V12h2.36V9.577c0-2.328 1.388-3.607 3.513-3.607.995 0 2.035.177 2.035.177v2.236h-1.146c-1.13 0-1.48.7-1.48 1.417V12h2.52l-.403 2.9h-2.117v6.9C18.343 20.9 22 16.99 22 12.02 22 6.485 17.523 2 12 2z"/></svg>
                        <span className="text-sm">Facebook</span>
                    </button>
                </div>

                <p className="mt-6 text-center text-xs text-slate-400">By continuing, you agree to the admin terms and privacy policy.</p>
            </div>
        </div>
    );
}
