import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, FileText, Check, X, AlertCircle, FileCheck, User } from 'lucide-react';

export default function AdminInsuranceApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await api.getInsuranceApplications({});
      setApplications(data);
    } catch (err) {
      console.error(err);
      alert('Error fetching applications: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appId) => {
    if (!window.confirm('Are you sure you want to approve this application? This will generate the active insurance policy and credit the platform commission profit.')) return;
    try {
      await api.updateInsuranceApplicationStatus(appId, {
        status: 'Approved',
        adminApproval: 'Approved'
      });
      alert('Insurance application approved successfully!');
      fetchApplications();
    } catch (err) {
      alert('Error approving application: ' + err.message);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert('Please enter a rejection reason!');
      return;
    }
    try {
      await api.updateInsuranceApplicationStatus(selectedApp.applicationId, {
        status: 'Rejected',
        adminApproval: 'Rejected',
        rejectionReason
      });
      alert('Application rejected.');
      setShowRejectModal(false);
      setRejectionReason('');
      fetchApplications();
    } catch (err) {
      alert('Error rejecting: ' + err.message);
    }
  };

  const openRejectModal = (app) => {
    setSelectedApp(app);
    setShowRejectModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex font-sans">
      {/* Sidebar navigation */}
      <aside className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col p-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 rounded-xl">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <div>
            <span className="text-xl font-black text-white tracking-tight block">ShramaSetu</span>
            <span className="text-emerald-500 text-xs font-bold uppercase tracking-wider">Insurance Admin</span>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1">
          <button onClick={() => navigate('/dashboard/admin')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-400 hover:bg-slate-900 hover:text-white">
            &larr; Back to Dashboard
          </button>
          <div className="pt-2 pb-1 text-[10px] uppercase font-bold text-slate-650 tracking-wider">Insurance System</div>
          <button onClick={() => navigate('/admin/insurance-providers')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-400 hover:bg-slate-900 hover:text-white">
            🏢 Insurance Providers
          </button>
          <button onClick={() => navigate('/admin/insurance-plans')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-400 hover:bg-slate-900 hover:text-white">
            📋 Insurance Plans
          </button>
          <button onClick={() => navigate('/admin/insurance-applications')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all bg-emerald-600 text-white shadow-lg shadow-emerald-900/40">
            📋 Review Applications
          </button>
          <button onClick={() => navigate('/admin/insurance-policies')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-400 hover:bg-slate-900 hover:text-white">
            🛡️ Active Policies
          </button>
          <div className="pt-2 pb-1 text-[10px] uppercase font-bold text-slate-650 tracking-wider">Profits Ledger</div>
          <button onClick={() => navigate('/admin/profits')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-400 hover:bg-slate-900 hover:text-white">
            💵 Unified Profit Dashboard
          </button>
        </nav>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Insurance Applications</h2>
            <p className="text-slate-400 mt-1">Review and verify applications submitted by Plantation Labourers and Owners</p>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-slate-950 p-12 text-center rounded-2xl border border-slate-800">
              <FileText size={48} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-400">No applications found</h3>
              <p className="text-slate-500 mt-1">Applications submitted by users will display here for verification.</p>
            </div>
          ) : (
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 font-bold uppercase">
                      <th className="p-4">Applicant</th>
                      <th className="p-4">Provider / Plan</th>
                      <th className="p-4">Premium Period</th>
                      <th className="p-4">Premium Cost</th>
                      <th className="p-4">Admin Commission</th>
                      <th className="p-4">Documents</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.applicationId} className="border-b border-slate-900 hover:bg-slate-900/30 transition-all">
                        <td className="p-4">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <User size={13} className="text-slate-500" />
                            {app.userName}
                          </div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase mt-1 inline-block ${app.userRole === 'labour' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {app.userRole === 'labour' ? 'Labourer' : 'Owner'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-200">{app.planName}</div>
                          <span className="text-[10px] text-slate-500 block uppercase font-bold">{app.providerName}</span>
                        </td>
                        <td className="p-4 font-bold text-slate-350">{app.premiumType}</td>
                        <td className="p-4 font-black text-white">₹{Number(app.premiumAmount).toLocaleString('en-IN')}</td>
                        <td className="p-4">
                          <span className="font-extrabold text-emerald-400 block">₹{Number(app.commissionAmount).toLocaleString('en-IN')}</span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase">Cut Collected</span>
                        </td>
                        <td className="p-4">
                          {app.documentsURL ? (
                            <a href={app.documentsURL} target="_blank" rel="noreferrer" className="text-emerald-500 hover:text-emerald-400 font-extrabold underline flex items-center gap-1">
                              <FileCheck size={14} /> View Aadhaar / Proof
                            </a>
                          ) : (
                            <span className="text-slate-500">None uploaded</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${app.status === 'Active' || app.status === 'Approved' ? 'bg-emerald-600 text-white shadow-sm' : app.status === 'Rejected' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white animate-pulse'}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          {app.status === 'Pending' ? (
                            <div className="flex gap-2 justify-center">
                              <button onClick={() => handleApprove(app.applicationId)} className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center justify-center shadow-md shadow-emerald-950/20" title="Approve Application">
                                <Check size={14} className="stroke-[3]" />
                              </button>
                              <button onClick={() => openRejectModal(app)} className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors flex items-center justify-center shadow-md shadow-rose-950/20" title="Reject Application">
                                <X size={14} className="stroke-[3]" />
                              </button>
                            </div>
                          ) : app.status === 'Rejected' ? (
                            <div className="text-[10px] text-rose-400 font-bold max-w-[120px] truncate" title={app.rejectionReason}>
                              Rejected: {app.rejectionReason}
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-bold uppercase">Policy Generated</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <AlertCircle size={16} className="text-rose-500" />
                Reject Insurance Application
              </h3>
              <button onClick={() => setShowRejectModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
            </div>
            <form onSubmit={handleRejectSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Rejection Reason *</label>
                <textarea required value={rejectionReason} placeholder="e.g. Document proofs are blurry or registration age criteria does not match." rows="3" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500" onChange={e => setRejectionReason(e.target.value)}></textarea>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowRejectModal(false)} className="px-4 py-2 border border-slate-800 text-slate-400 hover:bg-slate-850 rounded-xl text-xs font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md shadow-rose-950/20">Submit Rejection</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
