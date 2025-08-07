"use client";

import { useEffect } from "react";
import useUser from "@/utils/useUser";
import { Building2, Users, Shield, ArrowRight } from "lucide-react";

export default function HomePage() {
  const { data: user, loading } = useUser();

  useEffect(() => {
    if (!loading && user) {
      // Redirect authenticated users to their dashboard
      window.location.href = "/dashboard";
    }
  }, [user, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FC] font-inter flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-[#F7F8FC] font-inter">
      {/* Header */}
      <header className="bg-white shadow-sm ring-1 ring-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Building2 size={32} className="text-violet-600 mr-3" />
              <h1 className="text-2xl font-semibold text-slate-600">Constructor</h1>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/account/signin"
                className="text-slate-600 hover:text-slate-800 font-medium"
              >
                Sign In
              </a>
              <a
                href="/account/signup"
                className="bg-violet-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-violet-700 transition-colors"
              >
                Get Started
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-slate-800 mb-6">
            Construction Management
            <span className="block text-violet-600">Made Simple</span>
          </h1>
          <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto">
            Streamline your construction projects with our comprehensive platform. 
            Connect homeowners, contractors, and administrators in one secure system.
          </p>
          
          <div className="flex justify-center gap-4 mb-16">
            <a
              href="/account/signup"
              className="bg-violet-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-violet-700 transition-colors flex items-center"
            >
              Get Started
              <ArrowRight size={20} className="ml-2" />
            </a>
            <a
              href="/account/signin"
              className="bg-white text-slate-700 px-8 py-4 rounded-lg font-semibold text-lg ring-1 ring-slate-200 hover:bg-slate-50 transition-colors"
            >
              Sign In
            </a>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-xl p-8 shadow-sm ring-1 ring-slate-100 text-center">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users size={32} className="text-violet-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-4">For Homeowners</h3>
            <p className="text-slate-600 mb-6">
              Book punchlist dates, submit concerns, and request construction improvements with ease.
            </p>
            <ul className="text-sm text-slate-500 space-y-2">
              <li>• Date booking system</li>
              <li>• Issue reporting</li>
              <li>• Bidding requests</li>
              <li>• Progress tracking</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm ring-1 ring-slate-100 text-center">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 size={32} className="text-violet-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-4">For Contractors</h3>
            <p className="text-slate-600 mb-6">
              Upload documents, participate in bidding, and manage your construction projects.
            </p>
            <ul className="text-sm text-slate-500 space-y-2">
              <li>• Document management</li>
              <li>• Bidding system</li>
              <li>• Project tracking</li>
              <li>• Approval workflow</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm ring-1 ring-slate-100 text-center">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield size={32} className="text-violet-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-4">For Administrators</h3>
            <p className="text-slate-600 mb-6">
              Manage all aspects of the platform with comprehensive admin controls.
            </p>
            <ul className="text-sm text-slate-500 space-y-2">
              <li>• User management</li>
              <li>• Approval workflows</li>
              <li>• Bidding oversight</li>
              <li>• System analytics</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Building2 size={24} className="text-violet-600 mr-2" />
              <span className="text-slate-600 font-medium">Constructor</span>
            </div>
            <p className="text-slate-500 text-sm">
              © 2025 Constructor. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}