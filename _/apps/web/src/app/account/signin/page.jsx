"use client";

import { useState } from "react";
import useAuth from "@/utils/useAuth";
import { User, Lock, Building2 } from "lucide-react";

export default function SignInPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdminLogin, setIsAdminLogin] = useState(false);

  const { signInWithCredentials } = useAuth();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Static admin credentials
    if (email === "Admin" && password === "Password123") {
      try {
        // Create admin account if it doesn't exist
        await fetch('/api/auth/admin-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email, password })
        });
        
        // Sign in with admin credentials
        await signInWithCredentials({
          email: "admin@constructor.com",
          password: "Password123",
          callbackUrl: "/admin/dashboard",
          redirect: true,
        });
      } catch (err) {
        setError("Admin login failed. Please try again.");
        setLoading(false);
      }
    } else {
      setError("Invalid admin credentials");
      setLoading(false);
    }
  };

  const handleUserLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await signInWithCredentials({
        email,
        password,
        callbackUrl: "/dashboard",
        redirect: true,
      });
    } catch (err) {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] font-inter flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Role Selection */}
        <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-slate-100 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setIsAdminLogin(false)}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                !isAdminLogin
                  ? "bg-violet-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <User size={16} className="inline mr-2" />
              User Login
            </button>
            <button
              onClick={() => setIsAdminLogin(true)}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                isAdminLogin
                  ? "bg-violet-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Building2 size={16} className="inline mr-2" />
              Admin Login
            </button>
          </div>
        </div>

        {/* Login Form */}
        <form
          onSubmit={isAdminLogin ? handleAdminLogin : handleUserLogin}
          className="bg-white rounded-xl p-8 shadow-sm ring-1 ring-slate-100"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-slate-600 mb-2">
              Constructor
            </h1>
            <p className="text-slate-500">
              {isAdminLogin ? "Admin Access" : "Welcome Back"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                {isAdminLogin ? "Username" : "Email"}
              </label>
              <div className="relative">
                <input
                  type={isAdminLogin ? "text" : "email"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isAdminLogin ? "Enter username" : "Enter your email"}
                  className="w-full px-4 py-3 bg-white ring-1 ring-slate-200 rounded-lg focus:ring-2 focus:ring-violet-600 focus:outline-none text-slate-700"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 bg-white ring-1 ring-slate-200 rounded-lg focus:ring-2 focus:ring-violet-600 focus:outline-none text-slate-700"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 disabled:opacity-50 transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {!isAdminLogin && (
              <p className="text-center text-sm text-slate-600">
                Don't have an account?{" "}
                <a
                  href="/account/signup"
                  className="text-violet-600 hover:text-violet-700 font-medium"
                >
                  Sign up
                </a>
              </p>
            )}
          </div>
        </form>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}