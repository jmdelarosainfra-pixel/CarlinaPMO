"use client";

import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";
import useUpload from "@/utils/useUpload";
import { 
  Calendar, 
  MessageSquare, 
  Wrench, 
  Upload, 
  User, 
  Bell, 
  X, 
  Building2,
  LogOut,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

export default function HomeownerDashboard() {
  const { data: user, loading } = useUser();
  const [upload, { loading: uploadLoading }] = useUpload();
  const [activeSection, setActiveSection] = useState("punchlist");
  const [userProfile, setUserProfile] = useState(null);
  const [contractors, setContractors] = useState([]);
  
  // Form states
  const [punchlistDate, setPunchlistDate] = useState("");
  const [acceptanceDate, setAcceptanceDate] = useState("");
  const [concernDescription, setConcernDescription] = useState("");
  const [concernFile, setConcernFile] = useState(null);
  const [improvementDescription, setImprovementDescription] = useState("");
  const [preferredContractor, setPreferredContractor] = useState("");
  const [biddingDeadline, setBiddingDeadline] = useState("");
  
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
      fetchContractors();
    }
  }, [user, loading]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/users/profile');
      if (response.ok) {
        const profile = await response.json();
        if (profile.role !== 'homeowner') {
          window.location.href = "/dashboard";
          return;
        }
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchContractors = async () => {
    try {
      const response = await fetch('/api/contractors/approved');
      if (response.ok) {
        const data = await response.json();
        setContractors(data);
      }
    } catch (error) {
      console.error('Error fetching contractors:', error);
    }
  };

  const handlePunchlistBooking = async (e) => {
    e.preventDefault();
    setLoading1(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingType: 'punchlist',
          requestedDate: punchlistDate
        })
      });

      if (response.ok) {
        setSuccess("Punchlist date booking submitted successfully!");
        setPunchlistDate("");
      } else {
        setError("Failed to submit booking. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading1(false);
    }
  };

  const handleAcceptanceBooking = async (e) => {
    e.preventDefault();
    setLoading1(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingType: 'acceptance',
          requestedDate: acceptanceDate
        })
      });

      if (response.ok) {
        setSuccess("Acceptance date booking submitted successfully!");
        setAcceptanceDate("");
      } else {
        setError("Failed to submit booking. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading1(false);
    }
  };

  const handleConcernSubmission = async (e) => {
    e.preventDefault();
    setLoading1(true);
    setError("");
    setSuccess("");

    try {
      let attachmentUrl = null;
      
      if (concernFile) {
        const uploadResult = await upload({ file: concernFile });
        if (uploadResult.error) {
          setError("Failed to upload file. Please try again.");
          setLoading1(false);
          return;
        }
        attachmentUrl = uploadResult.url;
      }

      const response = await fetch('/api/concerns/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: concernDescription,
          attachmentUrl
        })
      });

      if (response.ok) {
        setSuccess("Concern submitted successfully!");
        setConcernDescription("");
        setConcernFile(null);
      } else {
        setError("Failed to submit concern. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading1(false);
    }
  };

  const handleImprovementRequest = async (e) => {
    e.preventDefault();
    setLoading1(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch('/api/improvement-tickets/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          improvementDescription,
          preferredContractorId: preferredContractor || null,
          biddingDeadline
        })
      });

      if (response.ok) {
        setSuccess("Improvement request submitted successfully!");
        setImprovementDescription("");
        setPreferredContractor("");
        setBiddingDeadline("");
      } else {
        setError("Failed to submit request. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
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
          <div className="text-slate-600">Loading dashboard...</div>
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
          <span className="text-sm text-slate-500">Homeowner Dashboard</span>
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
            { id: "punchlist", label: "Punchlist Booking", icon: Calendar },
            { id: "acceptance", label: "Acceptance Booking", icon: CheckCircle },
            { id: "concerns", label: "Submit Concerns", icon: MessageSquare },
            { id: "improvements", label: "Improvement Requests", icon: Wrench }
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
        <div className="max-w-4xl mx-auto">
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

          {/* Punchlist Date Booking */}
          {activeSection === "punchlist" && (
            <div className="bg-white rounded-xl p-8 shadow-sm ring-1 ring-slate-100">
              <h2 className="text-2xl font-semibold text-slate-800 mb-6">Punchlist Date Booking</h2>
              <form onSubmit={handlePunchlistBooking} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={punchlistDate}
                    onChange={(e) => setPunchlistDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white ring-1 ring-slate-200 rounded-lg focus:ring-2 focus:ring-violet-600 focus:outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading1}
                  className="bg-violet-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading1 ? "Submitting..." : "Submit Booking"}
                </button>
              </form>
            </div>
          )}

          {/* Acceptance Date Booking */}
          {activeSection === "acceptance" && (
            <div className="bg-white rounded-xl p-8 shadow-sm ring-1 ring-slate-100">
              <h2 className="text-2xl font-semibold text-slate-800 mb-6">Acceptance Date Booking</h2>
              <form onSubmit={handleAcceptanceBooking} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={acceptanceDate}
                    onChange={(e) => setAcceptanceDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white ring-1 ring-slate-200 rounded-lg focus:ring-2 focus:ring-violet-600 focus:outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading1}
                  className="bg-violet-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading1 ? "Submitting..." : "Submit Booking"}
                </button>
              </form>
            </div>
          )}

          {/* Concerns Submission */}
          {activeSection === "concerns" && (
            <div className="bg-white rounded-xl p-8 shadow-sm ring-1 ring-slate-100">
              <h2 className="text-2xl font-semibold text-slate-800 mb-6">Submit Concern/Issue</h2>
              <form onSubmit={handleConcernSubmission} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Issue Description
                  </label>
                  <textarea
                    value={concernDescription}
                    onChange={(e) => setConcernDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-white ring-1 ring-slate-200 rounded-lg focus:ring-2 focus:ring-violet-600 focus:outline-none resize-none"
                    placeholder="Describe your concern or issue..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Attachment (Optional)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setConcernFile(e.target.files[0])}
                    className="w-full px-4 py-3 bg-white ring-1 ring-slate-200 rounded-lg focus:ring-2 focus:ring-violet-600 focus:outline-none"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading1 || uploadLoading}
                  className="bg-violet-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading1 || uploadLoading ? "Submitting..." : "Submit Concern"}
                </button>
              </form>
            </div>
          )}

          {/* Improvement Requests */}
          {activeSection === "improvements" && (
            <div className="bg-white rounded-xl p-8 shadow-sm ring-1 ring-slate-100">
              <h2 className="text-2xl font-semibold text-slate-800 mb-6">Construction Improvement Request</h2>
              <form onSubmit={handleImprovementRequest} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    What improvement to be done?
                  </label>
                  <textarea
                    value={improvementDescription}
                    onChange={(e) => setImprovementDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-white ring-1 ring-slate-200 rounded-lg focus:ring-2 focus:ring-violet-600 focus:outline-none resize-none"
                    placeholder="Describe the improvement work needed..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Preferred Contractor (Optional)
                  </label>
                  <select
                    value={preferredContractor}
                    onChange={(e) => setPreferredContractor(e.target.value)}
                    className="w-full px-4 py-3 bg-white ring-1 ring-slate-200 rounded-lg focus:ring-2 focus:ring-violet-600 focus:outline-none"
                  >
                    <option value="">Select a contractor (optional)</option>
                    {contractors.map((contractor) => (
                      <option key={contractor.id} value={contractor.id}>
                        {contractor.company_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Bidding Deadline
                  </label>
                  <input
                    type="date"
                    value={biddingDeadline}
                    onChange={(e) => setBiddingDeadline(e.target.value)}
                    className="w-full px-4 py-3 bg-white ring-1 ring-slate-200 rounded-lg focus:ring-2 focus:ring-violet-600 focus:outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading1}
                  className="bg-violet-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading1 ? "Submitting..." : "Submit Request"}
                </button>
              </form>
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