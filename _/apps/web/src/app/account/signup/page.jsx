"use client";

import { useState } from "react";
import useAuth from "@/utils/useAuth";
import { User, Building2, Phone, MapPin } from "lucide-react";

export default function SignUpPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState("homeowner");
  
  // Common fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Homeowner fields
  const [fullName, setFullName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [address, setAddress] = useState("");
  
  // Contractor fields
  const [companyName, setCompanyName] = useState("");
  const [username, setUsername] = useState("");

  const { signUpWithCredentials } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (userType === "homeowner" && (!fullName || !contactNumber || !address)) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (userType === "contractor" && (!companyName || !username)) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      // First create the auth account
      await signUpWithCredentials({
        email,
        password,
        callbackUrl: "/account/signin",
        redirect: false,
      });

      // Then create the user profile
      const profileData = {
        email,
        role: userType,
        ...(userType === "homeowner" && {
          fullName,
          contactNumber,
          address,
        }),
        ...(userType === "contractor" && {
          companyName,
          username,
        }),
      };

      const response = await fetch('/api/users/create-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('Failed to create profile');
      }

      // Redirect to login
      window.location.href = "/account/signin";
      
    } catch (err) {
      console.error('Signup error:', err);
      setError("Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] font-inter flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* User Type Selection */}
        <div className="bg-white rounded-xl p-6 shadow-sm ring-1 ring-slate-100 mb-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Register as:</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setUserType("homeowner")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                userType === "homeowner"
                  ? "bg-violet-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <User size={16} className="inline mr-2" />
              Homeowner
            </button>
            <button
              onClick={() => setUserType("contractor")}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                userType === "contractor"
                  ? "bg-violet-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Building2 size={16} className="inline mr-2" />
              Contractor
            </button>
          </div>
        </div>

        {/* Registration Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl p-8 shadow-sm ring-1 ring-slate-100"
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-slate-600 mb-2">
              Constructor
            </h1>
            <p className="text-slate-500">
              Create your {userType} account
            </p>
          </div>

          <div className="space-y-6">
            {/* Common Fields */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-white ring-1 ring-slate-200 rounded-lg focus:ring-2 focus:ring-violet-600 focus:outline-none text-slate-700"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-white ring-1 ring-slate-200 rounded-lg focus:ring-2 focus:ring-violet-600 focus:outline-none text-slate-700"
                required
              />
            </div>

            {/* Homeowner Fields */}
            {userType === "homeowner" && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 bg-white ring-1 ring-slate-200 rounded-lg focus:ring-2 focus:ring-violet-600 focus:outline-none text-slate-700"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="Enter your contact number"
                    className="w-full px-4 py-3 bg-white ring-1 ring-slate-200 rounded-lg focus:ring-2 focus:ring-violet-600 focus:outline-none text-slate-700"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Address (Lot/Unit #) *
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your address"
                    rows={3}
                    className="w-full px-4 py-3 bg-white ring-1 ring-slate-200 rounded-lg focus:ring-2 focus:ring-violet-600 focus:outline-none text-slate-700 resize-none"
                    required
                  />
                </div>
              </>
            )}

            {/* Contractor Fields */}
            {userType === "contractor" && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Enter your company name"
                    className="w-full px-4 py-3 bg-white ring-1 ring-slate-200 rounded-lg focus:ring-2 focus:ring-violet-600 focus:outline-none text-slate-700"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    className="w-full px-4 py-3 bg-white ring-1 ring-slate-200 rounded-lg focus:ring-2 focus:ring-violet-600 focus:outline-none text-slate-700"
                    required
                  />
                </div>
              </>
            )}

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
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <p className="text-center text-sm text-slate-600">
              Already have an account?{" "}
              <a
                href="/account/signin"
                className="text-violet-600 hover:text-violet-700 font-medium"
              >
                Sign in
              </a>
            </p>
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