"use client";

import { useEffect, useState } from "react";
import useUser from "@/utils/useUser";

export default function DashboardPage() {
  const { data: user, loading } = useUser();
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if not authenticated
      window.location.href = "/account/signin";
      return;
    }

    if (user) {
      // Fetch user profile to determine role
      fetchUserProfile();
    }
  }, [user, loading]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/users/profile');
      if (response.ok) {
        const profile = await response.json();
        setUserProfile(profile);
        
        // Redirect based on role
        if (profile.role === 'admin') {
          window.location.href = "/admin/dashboard";
        } else if (profile.role === 'homeowner') {
          window.location.href = "/homeowner/dashboard";
        } else if (profile.role === 'contractor') {
          window.location.href = "/contractor/dashboard";
        }
      } else {
        // If no profile exists, redirect to account setup
        window.location.href = "/account/signin";
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      window.location.href = "/account/signin";
    } finally {
      setProfileLoading(false);
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-[#F7F8FC] font-inter flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-slate-600">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return null; // Will redirect
}