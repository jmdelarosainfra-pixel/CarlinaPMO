"use client";

import useAuth from "@/utils/useAuth";
import { LogOut } from "lucide-react";

export default function LogoutPage() {
  const { signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/account/signin",
      redirect: true,
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] font-inter flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl p-8 shadow-sm ring-1 ring-slate-100 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut size={24} className="text-violet-600" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-600 mb-2">
              Sign Out
            </h1>
            <p className="text-slate-500">
              Are you sure you want to sign out?
            </p>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full bg-violet-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 transition-colors"
          >
            Sign Out
          </button>
        </div>
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