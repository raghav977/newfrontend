"use client"
import { useState } from "react";
import AuthLayout from "@/app/global/auth-global/authlayout";
import image from "/public/placeholder-logo.png";
// import { useRouter } from "next/router";
import { useRouter } from "next/navigation";


export default function AdminLoginPage() {
    const router = useRouter();
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
        
        setTimeout(() => {
            setLoading(false);
            
            
        }, 1200);
        try{
            const response = await fetch("http://localhost:5000/api/users/login",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                credentials: "include",
                body:JSON.stringify({
                    email,
                    password
                })
            })

            if(!response.ok){
                console.log(" The response is ",response)
                throw new Error(`Http Error! status: ${response.status}`)

            }
            const data = await response.json();
            console.log("Data",data);
            
            console.log("Hello world",data);
            router.push("/dashboard/admin-dashboard/");
            // return;
                
            

        }
        catch(err){
            console.log("Something went wrong",err);
            setError("Something went wrong");

        }
    };

    return (
        <AuthLayout src={image} alt="Admin login logo">
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Admin Login</h2>
                <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                            aria-required="true"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-400"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                            aria-required="true"
                        />
                    </div>
                    {error && (
                        <div className="text-red-500 text-sm mt-2">{error}</div>
                    )}
                    <button
                        type="submit"
                        className={`border p-2 bg-green-500 text-white font-semibold cursor-pointer mt-4 rounded-xl w-full transition-all duration-150 ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </AuthLayout>
    );
}