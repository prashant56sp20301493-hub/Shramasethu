import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, CheckCircle2, XCircle, Clock, Calendar, ShieldCheck, IndianRupee } from 'lucide-react';

export default function AdminRentalRequests() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await api.getRentalRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
      alert('Error fetching rental requests: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      await api.updateRentalRequestStatus(requestId, { status: newStatus });
      alert(`Rental request marked as ${newStatus}!`);
      fetchRequests();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleUpdatePayment = async (requestId, payStatus) => {
    try {
      await api.updateRentalRequestStatus(requestId, { paymentStatus: payStatus });
      alert(`Payment status updated to ${payStatus}!`);
      fetchRequests();
    } catch (err) {
      alert('Failed to update payment status: ' + err.message);
    }
  };

  // KPIs
  const total = requests.length;
  const pending = requests.filter(r => r.status === 'Pending').length;
  const active = requests.filter(r => r.status === 'Active').length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex font-sans">
      {/* Sidebar navigation */}
      <aside className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col p-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 rounded-xl">
            <ClipboardList size={24} className="text-white" />
          </div>
          <div>
            <span className="text-xl font-black text-white tracking-tight block">ShramaSetu</span>
            <span className="text-emerald-500 text-xs font-bold uppercase tracking-wider">Rental Management</span>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1">
          <button onClick={() => navigate('/dashboard/admin')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-400 hover:bg-slate-900 hover:text-white">
            &larr; Back to Dashboard
          </button>
          <button onClick={() => navigate('/admin/rental-companies')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-400 hover:bg-slate-900 hover:text-white">
            🏢 Rental Companies
          </button>
          <button onClick={() => navigate('/admin/equipment-marketplace')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-400 hover:bg-slate-900 hover:text-white">
            🚜 Marketplace Listings
          </button>
          <button onClick={() => navigate('/admin/rental-requests')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all bg-emerald-600 text-white shadow-lg shadow-emerald-900/40">
            📋 Rental Requests
          </button>
          <button onClick={() => navigate('/admin/commissions')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-400 hover:bg-slate-900 hover:text-white">
            💵 Profits & Commissions
          </button>
        </nav>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">Rental Requests & Leases</h2>
            <p className="text-slate-400 mt-1">Review and process agricultural machinery rental bookings</p>
          </div>

          {/* KPI Dashboard */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Total Bookings Requested</span>
              <span className="text-4xl font-black text-white mt-2 block">{loading ? '...' : total}</span>
            </div>
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Awaiting Review</span>
              <span className="text-4xl font-black text-amber-400 mt-2 block">{loading ? '...' : pending}</span>
            </div>
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Active Machine Leases</span>
              <span className="text-4xl font-black text-sky-400 mt-2 block">{loading ? '...' : active}</span>
            </div>
          </div>

          {/* Table list */}
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-slate-950 p-12 text-center rounded-2xl border border-slate-800">
              <ClipboardList size={48} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-400">No rental requests found</h3>
              <p className="text-slate-500 mt-1">Once landowners request agricultural machinery, they will appear here!</p>
            </div>
          ) : (
            <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 uppercase text-xs font-extrabold tracking-wider border-b border-slate-800">
                    <th className="p-4">Requested Item</th>
                    <th className="p-4">Owner (Renter)</th>
                    <th className="p-4">Lease Duration</th>
                    <th className="p-4">Amount & Earnings</th>
                    <th className="p-4">Workflow Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {requests.map((r) => (
                    <tr key={r.requestId} className="hover:bg-slate-900/20 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white text-base">{r.equipmentName}</div>
                        <div className="text-xs text-slate-400 mt-1">Supplier: <span className="text-emerald-400 font-semibold">{r.companyName}</span></div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-semibold text-slate-300">{r.ownerName}</div>
                        <div className="text-xs text-slate-500">ID: {r.ownerId.slice(0, 8)}...</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-slate-300 capitalize flex items-center gap-1.5">
                          <Calendar size={14} className="text-slate-500" />
                          {r.rentalType} lease
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {r.startDate} to {r.endDate}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-extrabold text-white flex items-center">
                          <IndianRupee size={12} />
                          {r.estimatedCost}
                        </div>
                        <div className="text-xs text-emerald-400 mt-0.5 font-bold">
                          Admin Comm: +₹{Math.round(r.commissionAmount)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Supplier: ₹{Math.round(r.companyEarning)}
                        </div>
                      </td>
                      <td className="p-4 space-y-1.5">
                        <div>
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${r.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : r.status === 'Active' ? 'bg-sky-500/10 text-sky-400' : r.status === 'Pending' ? 'bg-amber-500/10 text-amber-400' : r.status === 'Completed' || r.status === 'Returned' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                            {r.status}
                          </span>
                        </div>
                        <div>
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${r.paymentStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            Pay: {r.paymentStatus}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right space-y-1">
                        <div className="flex justify-end gap-1.5">
                          {r.status === 'Pending' && (
                            <>
                              <button onClick={() => handleUpdateStatus(r.requestId, 'Approved')} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg transition-colors">
                                Approve
                              </button>
                              <button onClick={() => handleUpdateStatus(r.requestId, 'Rejected')} className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold px-2.5 py-1.5 rounded-lg transition-colors">
                                Reject
                              </button>
                            </>
                          )}
                          
                          {r.status === 'Approved' && (
                            <button onClick={() => handleUpdateStatus(r.requestId, 'Active')} className="text-xs bg-sky-600 hover:bg-sky-700 text-white font-bold px-2.5 py-1.5 rounded-lg transition-colors">
                              Mark Active Leased
                            </button>
                          )}

                          {r.status === 'Active' && (
                            <button onClick={() => handleUpdateStatus(r.requestId, 'Completed')} className="text-xs bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-2.5 py-1.5 rounded-lg transition-colors">
                              Mark Returned & Done
                            </button>
                          )}
                        </div>

                        <div className="flex justify-end gap-1.5 mt-1.5">
                          {r.paymentStatus !== 'Paid' && (r.status === 'Approved' || r.status === 'Active' || r.status === 'Completed') && (
                            <button onClick={() => handleUpdatePayment(r.requestId, 'Paid')} className="text-[10px] bg-slate-900 border border-slate-800 hover:bg-slate-800 text-emerald-400 font-extrabold px-2 py-1 rounded">
                              Receive Cash Payment
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
