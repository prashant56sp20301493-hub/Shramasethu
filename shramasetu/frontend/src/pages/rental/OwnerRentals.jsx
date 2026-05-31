import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, Calendar, IndianRupee, ShieldAlert, Tractor, Ban } from 'lucide-react';

export default function OwnerRentals() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'pending'

  const ownerId = localStorage.getItem('uid') || 'OwnerUID';

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    setLoading(true);
    try {
      const data = await api.getRentalRequests({ ownerId });
      setRequests(data);
    } catch (err) {
      console.error(err);
      alert('Error fetching rentals: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm(t("cancel") + "?")) return;
    try {
      await api.updateRentalRequestStatus(requestId, { status: 'Cancelled' });
      alert(t("Confirmed"));
      fetchRentals();
    } catch (err) {
      alert('Failed to cancel request: ' + err.message);
    }
  };

  // Filter requests
  const pendingRequests = requests.filter(r => r.status?.toLowerCase() === 'pending');
  const activeLeases = requests.filter(r => r.status?.toLowerCase() !== 'pending');

  const activeTabRequests = activeTab === 'pending' ? pendingRequests : activeLeases;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex font-sans">
      
      {/* Sidebar navigation */}
      <aside className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col p-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 rounded-xl">
            <Tractor size={24} className="text-white" />
          </div>
          <div>
            <span className="text-xl font-black text-white tracking-tight block">ShramaSetu</span>
            <span className="text-emerald-500 text-xs font-bold uppercase tracking-wider">{t("OwnerPortal")}</span>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1">
          <button onClick={() => navigate('/dashboard/owner')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-400 hover:bg-slate-900 hover:text-white">
            &larr; {t("backToDashboard")}
          </button>
          <button onClick={() => navigate('/owner/marketplace')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-400 hover:bg-slate-900 hover:text-white">
            {t("rentalSystem")}
          </button>
          <button onClick={() => navigate('/owner/rentals')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all bg-emerald-600 text-white shadow-lg shadow-emerald-900/40">
            📋 {t("trackApplications")}
          </button>
        </nav>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">{t("myPolicyStatus")}</h2>
              <p className="text-slate-400 mt-1">{t("Subtitle")}</p>
            </div>
            <button onClick={() => navigate('/owner/marketplace')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl transition-all shadow-md shadow-emerald-950">
              + {t("applyForCoverage")}
            </button>
          </div>

          {/* Tab toggles */}
          <div className="flex border-b border-slate-800">
            <button onClick={() => setActiveTab('active')} className={`px-6 py-3 font-bold text-sm border-b-2 transition-all ${activeTab === 'active' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-450 hover:text-white'}`}>
              {t("Active")} ({activeLeases.length})
            </button>
            <button onClick={() => setActiveTab('pending')} className={`px-6 py-3 font-bold text-sm border-b-2 transition-all ${activeTab === 'pending' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-450 hover:text-white'}`}>
              {t("pending_val")} ({pendingRequests.length})
            </button>
          </div>

          {/* Grid/Table listings */}
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : activeTabRequests.length === 0 ? (
            <div className="bg-slate-950 p-12 text-center rounded-2xl border border-slate-800">
              <ClipboardCheck size={48} className="mx-auto text-slate-650 mb-4" />
              <h3 className="text-lg font-bold text-slate-400">{t("noRecordsFound")}</h3>
              <p className="text-slate-500 mt-1">{t("checkBackLater")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeTabRequests.map((req) => (
                <div key={req.requestId} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col group relative">
                  
                  {/* Title card banner */}
                  <div className="bg-slate-900 p-4 border-b border-slate-800/80 flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-600/10 rounded-lg">
                      <Tractor size={20} className="text-emerald-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-white text-sm truncate">{req.equipmentName}</h4>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide">Supplier: {req.companyName}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider 
                        ${req.status?.toLowerCase() === 'approved' || req.status?.toLowerCase() === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' : 
                          req.status?.toLowerCase() === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}>
                        {req.status?.toLowerCase() === 'approved' || req.status?.toLowerCase() === 'active' ? t("Active") : 
                         req.status?.toLowerCase() === 'pending' ? t("pending_val") : t("status")}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-550 block font-bold uppercase tracking-wide">{t("premiumCycle")}</span>
                        <span className="text-slate-200 font-semibold">{req.rentalType}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-550 block font-bold uppercase tracking-wide">{t("paymentStatus")}</span>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase mt-0.5 ${req.paymentStatus?.toLowerCase() === 'paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {req.paymentStatus?.toLowerCase() === 'paid' ? t("paid") : t("pending_val")}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-900">
                      <div>
                        <span className="text-[10px] text-slate-555 block font-bold uppercase tracking-wide">{t("Date")}</span>
                        <span className="text-slate-300 font-medium">{req.startDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-555 block font-bold uppercase tracking-wide">{t("status")}</span>
                        <span className="text-slate-300 font-medium">{req.endDate}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800/40 text-xs">
                      <div>
                        <span className="text-[9px] text-slate-500 block font-bold uppercase">{t("totalWage")}</span>
                        <span className="text-sm font-black text-white flex items-center mt-0.5"><IndianRupee size={10} />{req.estimatedCost}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block font-bold uppercase">{t("bonus")}</span>
                        <span className="text-sm font-black text-emerald-400 flex items-center mt-0.5"><IndianRupee size={10} />{req.deposit}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block font-bold uppercase">{t("totalWage")}</span>
                        <span className="text-sm font-black text-sky-400 flex items-center mt-0.5"><IndianRupee size={10} />{req.estimatedCost + req.deposit}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Cancel button if pending */}
                  {req.status?.toLowerCase() === 'pending' && (
                    <div className="px-5 py-4 border-t border-slate-900 bg-slate-900/10 flex justify-end">
                      <button onClick={() => handleCancelRequest(req.requestId)} className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-350 font-bold py-1.5 transition-all">
                        <Ban size={12} /> {t("cancel")}
                      </button>
                    </div>
                  )}

                  {/* Warning banner if rejected */}
                  {req.status?.toLowerCase() === 'rejected' && (
                    <div className="px-4 py-2.5 bg-rose-600/10 border-t border-rose-600/20 text-[10px] text-rose-400 font-bold flex items-center gap-1.5 uppercase tracking-wide">
                      <ShieldAlert size={12} className="shrink-0" />
                      {t("absent")}
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
