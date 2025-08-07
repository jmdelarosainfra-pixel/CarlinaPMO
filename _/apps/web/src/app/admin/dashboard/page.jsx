"use client";

import { useEffect, useState } from "react";
import useUser from "@/utils/useUser";
import { Building2, User, LogOut, Users, FileText, Clock, CheckCircle, X, Eye } from "lucide-react";

export default function AdminDashboard() {
  const { data: user, loading } = useUser();
  const [userProfile, setUserProfile] = useState(null);
  const [activeSection, setActiveSection] = useState("contractors");
  
  // Data states
  const [pendingContractors, setPendingContractors] = useState([]);
  const [concerns, setConcerns] = useState([]);
  const [dateBookings, setDateBookings] = useState([]);
  const [improvementTickets, setImprovementTickets] = useState([]);
  
  const [loading1, setLoading1] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/account/signin";
      return;
    }
    if (user) {
      fetchUserProfile();
      fetchPendingContractors();
      fetchConcerns();
      fetchDateBookings();
      fetchImprovementTickets();
    }
  }, [user, loading]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/users/profile');
      if (response.ok) {
        const profile = await response.json();
        if (profile.role !== 'admin') {
          window.location.href = "/dashboard";
          return;
        }
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchPendingContractors = async () => {
    try {
      const response = await fetch('/api/admin/contractors/pending');
      if (response.ok) {
        const data = await response.json();
        setPendingContractors(data);
      }
    } catch (error) {
      console.error('Error fetching contractors:', error);
    }
  };

  const fetchConcerns = async () => {
    try {
      const response = await fetch('/api/admin/concerns');
      if (response.ok) {
        const data = await response.json();
        setConcerns(data);
      }
    } catch (error) {
      console.error('Error fetching concerns:', error);
    }
  };

  const fetchDateBookings = async () => {
    try {
      const response = await fetch('/api/admin/date-bookings');
      if (response.ok) {
        const data = await response.json();
        setDateBookings(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchImprovementTickets = async () => {
    try {
      const response = await fetch('/api/admin/improvement-tickets');
      if (response.ok) {
        const data = await response.json();
        setImprovementTickets(data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const handleContractorApproval = async (contractorId, action) => {
    setLoading1(true);
    try {
      const response = await fetch('/api/admin/contractors/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractorId, action })
      });

      if (response.ok) {
        setSuccess(`Contractor ${action}d successfully!`);
        fetchPendingContractors();
      } else {
        setError('Failed to update contractor status');
      }
    } catch (error) {
      setError('An error occurred');
    } finally {
      setLoading1(false);
    }
  };

  const handleSignOut = () => {
    window.location.href = "/account/logout";
  };

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen bg-[#F7F8FC] font-inter flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-slate-600">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FC] font-inter">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full h-16 bg-white border-b border-slate-100 flex items-center px-4 lg:px-8 justify-between">
        <div className="flex items-center gap-4">
          <Building2 size={24} className="text-violet-600" />
          <h1 className="text-2xl font-semibold tracking-tight text-slate-600">
            Constructor
          </h1>
          <span className="text-sm text-slate-500">Admin Dashboard</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 text-slate-500">
            <User size={18} />
            <span className="font-semibold">{userProfile.full_name}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="h-10 w-10 rounded-full bg-white ring-1 ring-slate-200 flex items-center justify-center hover:bg-slate-50"
            aria-label="Sign out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-slate-100 px-4 lg:px-8">
        <div className="flex gap-8 text-sm font-medium text-slate-500">
          {[
            { id: "contractors", label: "Contractor Approvals", icon: Users },
            { id: "concerns", label: "Concerns", icon: FileText },
            { id: "bookings", label: "Date Bookings", icon: Clock },
            { id: "improvements", label: "Improvement Tickets", icon: CheckCircle }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`pb-3 pt-4 border-b-2 transition-colors flex items-center gap-2 ${
                activeSection === id
                  ? "border-violet-600 text-violet-600"
                  : "border-transparent hover:text-slate-700"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-4 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Contractor Approvals */}
          {activeSection === "contractors" && (
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-100">
              <div className="px-8 py-6 border-b border-slate-100">
                <h2 className="text-2xl font-semibold text-slate-800">Pending Contractor Approvals</h2>
              </div>
              <div className="p-8">
                {pendingContractors.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No pending contractor approvals</p>
                ) : (
                  <div className="space-y-6">
                    {pendingContractors.map((contractor) => (
                      <div key={contractor.id} className="border border-slate-200 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-800">{contractor.company_name}</h3>
                            <p className="text-slate-600">Username: {contractor.username}</p>
                            <p className="text-slate-600">Email: {contractor.email}</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleContractorApproval(contractor.id, 'approve')}
                              disabled={loading1}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 disabled:opacity-50"
                            >
                              <CheckCircle size={16} className="inline mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleContractorApproval(contractor.id, 'reject')}
                              disabled={loading1}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 disabled:opacity-50"
                            >
                              <X size={16} className="inline mr-1" />
                              Reject
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid md:grid-cols-3 gap-4">
                          {contractor.dti_sec_document && (
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">DTI/SEC Document</label>
                              <a
                                href={contractor.dti_sec_document}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-violet-600 hover:text-violet-700"
                              >
                                <Eye size={16} />
                                View Document
                              </a>
                            </div>
                          )}
                          {contractor.bir_certificate && (
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">BIR Certificate</label>
                              <a
                                href={contractor.bir_certificate}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-violet-600 hover:text-violet-700"
                              >
                                <Eye size={16} />
                                View Document
                              </a>
                            </div>
                          )}
                          {contractor.business_permit && (
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">Business Permit</label>
                              <a
                                href={contractor.business_permit}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-violet-600 hover:text-violet-700"
                              >
                                <Eye size={16} />
                                View Document
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Other sections can be added here */}
          {activeSection === "concerns" && (
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-100 p-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-6">Homeowner Concerns</h2>
              <p className="text-slate-500">Concerns management coming soon...</p>
            </div>
          )}

          {activeSection === "bookings" && (
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-100 p-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-6">Date Bookings</h2>
              <p className="text-slate-500">Date bookings management coming soon...</p>
            </div>
          )}

          {activeSection === "improvements" && (
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-100 p-8">
              <h2 className="text-2xl font-semibold text-slate-800 mb-6">Improvement Tickets</h2>
              <p className="text-slate-500">Improvement tickets management coming soon...</p>
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}