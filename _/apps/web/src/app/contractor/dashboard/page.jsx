"use client";

import { useEffect, useState } from "react";
import useUser from "@/utils/useUser";
import useUpload from "@/utils/useUpload";
import { Building2, User, LogOut, FileText, Upload, Clock, DollarSign, Calendar, Shield } from "lucide-react";

export default function ContractorDashboard() {
  const { data: user, loading } = useUser();
  const [upload, { loading: uploadLoading }] = useUpload();
  const [userProfile, setUserProfile] = useState(null);
  const [contractorProfile, setContractorProfile] = useState(null);
  const [activeSection, setActiveSection] = useState("documents");
  
  // Document states
  const [dtiFile, setDtiFile] = useState(null);
  const [birFile, setBirFile] = useState(null);
  const [permitFile, setPermitFile] = useState(null);
  
  // Bidding states
  const [improvementTickets, setImprovementTickets] = useState([]);
  const [bids, setBids] = useState({});
  
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
      fetchContractorProfile();
      fetchImprovementTickets();
    }
  }, [user, loading]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/users/profile');
      if (response.ok) {
        const profile = await response.json();
        if (profile.role !== 'contractor') {
          window.location.href = "/dashboard";
          return;
        }
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchContractorProfile = async () => {
    try {
      const response = await fetch('/api/contractors/profile');
      if (response.ok) {
        const profile = await response.json();
        setContractorProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching contractor profile:', error);
    }
  };

  const fetchImprovementTickets = async () => {
    try {
      const response = await fetch('/api/contractors/improvement-tickets');
      if (response.ok) {
        const tickets = await response.json();
        setImprovementTickets(tickets);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    setLoading1(true);
    setError("");
    setSuccess("");

    try {
      let documents = {};

      if (dtiFile) {
        const dtiResult = await upload({ file: dtiFile });
        if (dtiResult.error) {
          setError("Failed to upload DTI/SEC document");
          setLoading1(false);
          return;
        }
        documents.dtiSecDocument = dtiResult.url;
      }

      if (birFile) {
        const birResult = await upload({ file: birFile });
        if (birResult.error) {
          setError("Failed to upload BIR certificate");
          setLoading1(false);
          return;
        }
        documents.birCertificate = birResult.url;
      }

      if (permitFile) {
        const permitResult = await upload({ file: permitFile });
        if (permitResult.error) {
          setError("Failed to upload business permit");
          setLoading1(false);
          return;
        }
        documents.businessPermit = permitResult.url;
      }

      const response = await fetch('/api/contractors/upload-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(documents)
      });

      if (response.ok) {
        setSuccess("Documents uploaded successfully! Status: Pending Admin Approval");
        setDtiFile(null);
        setBirFile(null);
        setPermitFile(null);
        fetchContractorProfile(); // Refresh contractor profile
      } else {
        setError("Failed to upload documents. Please try again.");
      }
    } catch (error) {
      setError("An error occurred during upload.");
    } finally {
      setLoading1(false);
    }
  };

  const handleBidSubmission = async (ticketId) => {
    const bid = bids[ticketId];
    if (!bid || !bid.amount || !bid.finishDate || !bid.warranty) {
      setError("Please fill in all bid fields");
      return;
    }

    setLoading1(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch('/api/contractors/submit-bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          bidAmount: bid.amount,
          commitmentFinishDate: bid.finishDate,
          warrantyPeriodMonths: bid.warranty
        })
      });

      if (response.ok) {
        setSuccess("Bid submitted successfully!");
        setBids(prev => ({ ...prev, [ticketId]: {} }));
        fetchImprovementTickets(); // Refresh tickets
      } else {
        setError("Failed to submit bid. Please try again.");
      }
    } catch (error) {
      setError("An error occurred while submitting bid.");
    } finally {
      setLoading1(false);
    }
  };

  const updateBid = (ticketId, field, value) => {
    setBids(prev => ({
      ...prev,
      [ticketId]: {
        ...prev[ticketId],
        [field]: value
      }
    }));
  };

  const handleSignOut = () => {
    window.location.href = "/account/logout";
  };

  if (loading || !userProfile) {
    return (
      <div className="min-h-screen bg-[#F7F8FC] font-inter flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-slate-600">Loading contractor dashboard...</div>
        </div>
      </div>
    );
  }

  const isApproved = contractorProfile?.approval_status === 'approved';
  const isPending = contractorProfile?.approval_status === 'pending';
  const isRejected = contractorProfile?.approval_status === 'rejected';

  return (
    <div className="min-h-screen bg-[#F7F8FC] font-inter">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full h-16 bg-white border-b border-slate-100 flex items-center px-4 lg:px-8 justify-between">
        <div className="flex items-center gap-4">
          <Building2 size={24} className="text-violet-600" />
          <h1 className="text-2xl font-semibold tracking-tight text-slate-600">
            Constructor
          </h1>
          <span className="text-sm text-slate-500">Contractor Dashboard</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 text-slate-500">
            <User size={18} />
            <span className="font-semibold">{userProfile.full_name}</span>
          </div>
          {contractorProfile && (
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              isApproved ? 'bg-green-100 text-green-700' :
              isPending ? 'bg-yellow-100 text-yellow-700' :
              isRejected ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
            }`}>
              <Shield size={12} className="inline mr-1" />
              {contractorProfile.approval_status === 'approved' ? 'Approved' :
               contractorProfile.approval_status === 'pending' ? 'Pending Approval' :
               contractorProfile.approval_status === 'rejected' ? 'Rejected' : 'Not Submitted'}
            </div>
          )}
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
          <button
            onClick={() => setActiveSection("documents")}
            className={`pb-3 pt-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeSection === "documents"
                ? "border-violet-600 text-violet-600"
                : "border-transparent hover:text-slate-700"
            }`}
          >
            <Upload size={16} />
            Upload Documents
          </button>
          <button
            onClick={() => setActiveSection("bidding")}
            className={`pb-3 pt-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeSection === "bidding"
                ? "border-violet-600 text-violet-600"
                : "border-transparent hover:text-slate-700"
            } ${!isApproved ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!isApproved}
          >
            <DollarSign size={16} />
            House Improvement Bidding
          </button>
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

          {/* Upload Documents Section */}
          {activeSection === "documents" && (
            <div className="bg-white rounded-xl p-8 shadow-sm ring-1 ring-slate-100">
              <h2 className="text-2xl font-semibold text-slate-800 mb-6">Upload Documents</h2>
              
              {contractorProfile && (
                <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield size={16} className={
                      isApproved ? 'text-green-600' :
                      isPending ? 'text-yellow-600' :
                      isRejected ? 'text-red-600' : 'text-gray-600'
                    } />
                    <span className="font-medium">
                      Status: {
                        isApproved ? 'Approved - You can now participate in bidding!' :
                        isPending ? 'Pending Approval - Your documents are being reviewed' :
                        isRejected ? 'Rejected - Please contact admin or resubmit documents' :
                        'Documents Required'
                      }
                    </span>
                  </div>
                  {contractorProfile.company_name && (
                    <p className="text-slate-600">Company: {contractorProfile.company_name}</p>
                  )}
                  {contractorProfile.username && (
                    <p className="text-slate-600">Username: {contractorProfile.username}</p>
                  )}
                </div>
              )}

              <form onSubmit={handleDocumentUpload} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    DTI/SEC Document
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setDtiFile(e.target.files[0])}
                    className="w-full px-4 py-3 bg-white ring-1 ring-slate-200 rounded-lg focus:ring-2 focus:ring-violet-600 focus:outline-none"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  {contractorProfile?.dti_sec_document && (
                    <p className="text-sm text-green-600 mt-1">✓ DTI/SEC document uploaded</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    BIR Certificate
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setBirFile(e.target.files[0])}
                    className="w-full px-4 py-3 bg-white ring-1 ring-slate-200 rounded-lg focus:ring-2 focus:ring-violet-600 focus:outline-none"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  {contractorProfile?.bir_certificate && (
                    <p className="text-sm text-green-600 mt-1">✓ BIR certificate uploaded</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Business Permit (Binangonan)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setPermitFile(e.target.files[0])}
                    className="w-full px-4 py-3 bg-white ring-1 ring-slate-200 rounded-lg focus:ring-2 focus:ring-violet-600 focus:outline-none"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  {contractorProfile?.business_permit && (
                    <p className="text-sm text-green-600 mt-1">✓ Business permit uploaded</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading1 || uploadLoading || (!dtiFile && !birFile && !permitFile)}
                  className="bg-violet-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading1 || uploadLoading ? "Uploading..." : "Submit Documents"}
                </button>
              </form>
            </div>
          )}

          {/* Bidding Section */}
          {activeSection === "bidding" && (
            <div className="space-y-6">
              {!isApproved ? (
                <div className="bg-white rounded-xl p-8 shadow-sm ring-1 ring-slate-100 text-center">
                  <Clock size={48} className="mx-auto text-slate-400 mb-4" />
                  <h2 className="text-2xl font-semibold text-slate-800 mb-4">Bidding Not Available</h2>
                  <p className="text-slate-600">
                    You must be approved by an administrator before you can participate in bidding.
                    Please upload your documents and wait for approval.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-100">
                  <div className="px-8 py-6 border-b border-slate-100">
                    <h2 className="text-2xl font-semibold text-slate-800">House Improvement Bidding</h2>
                    <p className="text-slate-600 mt-1">View and bid on current improvement tickets</p>
                  </div>
                  <div className="p-8">
                    {improvementTickets.length === 0 ? (
                      <p className="text-slate-500 text-center py-8">No bidding tickets available at this time</p>
                    ) : (
                      <div className="space-y-8">
                        {improvementTickets.map((ticket) => (
                          <div key={ticket.id} className="border border-slate-200 rounded-lg p-6">
                            <div className="mb-4">
                              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                                Improvement Request #{ticket.id}
                              </h3>
                              <p className="text-slate-600 mb-2">{ticket.improvement_description}</p>
                              <p className="text-sm text-slate-500">
                                Bidding Deadline: {new Date(ticket.bidding_deadline).toLocaleDateString()}
                              </p>
                              {ticket.homeowner_name && (
                                <p className="text-sm text-slate-500">Homeowner: {ticket.homeowner_name}</p>
                              )}
                            </div>

                            {/* Bid Form */}
                            <div className="grid md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                  Bid Amount (₱)
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={bids[ticket.id]?.amount || ''}
                                  onChange={(e) => updateBid(ticket.id, 'amount', e.target.value)}
                                  className="w-full px-3 py-2 bg-white ring-1 ring-slate-200 rounded-lg focus:ring-2 focus:ring-violet-600 focus:outline-none"
                                  placeholder="0.00"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                  Commitment Finish Date
                                </label>
                                <input
                                  type="date"
                                  value={bids[ticket.id]?.finishDate || ''}
                                  onChange={(e) => updateBid(ticket.id, 'finishDate', e.target.value)}
                                  className="w-full px-3 py-2 bg-white ring-1 ring-slate-200 rounded-lg focus:ring-2 focus:ring-violet-600 focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                  Warranty Period (Months)
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max="120"
                                  value={bids[ticket.id]?.warranty || ''}
                                  onChange={(e) => updateBid(ticket.id, 'warranty', e.target.value)}
                                  className="w-full px-3 py-2 bg-white ring-1 ring-slate-200 rounded-lg focus:ring-2 focus:ring-violet-600 focus:outline-none"
                                  placeholder="12"
                                />
                              </div>
                            </div>

                            <button
                              onClick={() => handleBidSubmission(ticket.id)}
                              disabled={loading1}
                              className="bg-violet-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 disabled:opacity-50"
                            >
                              {loading1 ? "Submitting..." : "Submit Bid"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
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