import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Landmark, ArrowUpRight, Award, CirclePercent, TrendingUp, IndianRupee } from 'lucide-react';

export default function AdminCommissions() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.getCommissionStats();
      setStats(data);
    } catch (err) {
      console.error(err);
      alert('Error fetching stats: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const maxRevenue = stats?.monthlyEarnings?.length > 0 
    ? Math.max(...stats.monthlyEarnings.map(m => m.revenue)) 
    : 100;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex font-sans">
      {/* Sidebar navigation */}
      <aside className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col p-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 rounded-xl">
            <Landmark size={24} className="text-white" />
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
          <button onClick={() => navigate('/admin/rental-requests')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-400 hover:bg-slate-900 hover:text-white">
            📋 Rental Requests
          </button>
          <button onClick={() => navigate('/admin/commissions')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all bg-emerald-600 text-white shadow-lg shadow-emerald-900/40">
            💵 Profits & Commissions
          </button>
        </nav>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        {loading ? (
          <div className="h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">Commissions & Profit Analytics</h2>
              <p className="text-slate-400 mt-1">Track platform profits, transaction logs, and partner performance</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Total Rental Revenue</span>
                <span className="text-3xl font-black text-white mt-2 block flex items-center">
                  <IndianRupee size={22} className="text-slate-500" />
                  {stats.kpis.totalRevenue}
                </span>
                <div className="text-[10px] text-slate-500 mt-1">Gross marketplace transaction volume</div>
              </div>
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Platform Profit Earned</span>
                <span className="text-3xl font-black text-emerald-400 mt-2 block flex items-center">
                  <IndianRupee size={22} className="text-emerald-500" />
                  {stats.kpis.totalAdminProfit}
                </span>
                <div className="text-[10px] text-emerald-500/80 mt-1">Net platform commission (Fixed & %)</div>
              </div>
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Awaiting Payout</span>
                <span className="text-3xl font-black text-amber-400 mt-2 block flex items-center">
                  <IndianRupee size={22} className="text-amber-550" />
                  {stats.kpis.pendingCommission}
                </span>
                <div className="text-[10px] text-slate-500 mt-1">Profits from pending cash settlements</div>
              </div>
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Total Bookings Completed</span>
                <span className="text-3xl font-black text-sky-400 mt-2 block">
                  {stats.kpis.totalRentals}
                </span>
                <div className="text-[10px] text-slate-500 mt-1">Total approved machinery leases</div>
              </div>
            </div>

            {/* Grid for Graph and Company Earnings */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Monthly revenue bar chart */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 lg:col-span-2 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp size={18} className="text-emerald-500" />
                  Monthly Rental Volume (Gross vs Net Profit)
                </h3>
                
                {stats.monthlyEarnings.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
                    No transactions captured yet to chart
                  </div>
                ) : (
                  <div className="h-64 flex items-end gap-6 pt-8 pb-4 px-4 border-b border-slate-800">
                    {stats.monthlyEarnings.map((m, idx) => {
                      const grossPercent = (m.revenue / maxRevenue) * 100;
                      const netPercent = (m.profit / maxRevenue) * 100;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end relative group">
                          {/* Hover Tooltip */}
                          <div className="absolute -top-12 bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-[10px] font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity z-20 shadow-md">
                            Gross: ₹{m.revenue}<br />Net: ₹{m.profit}
                          </div>
                          
                          {/* Visual Bars */}
                          <div className="w-full flex gap-1 items-end h-full justify-center">
                            <div style={{ height: `${grossPercent}%` }} className="w-3 bg-emerald-600 rounded-t transition-all hover:bg-emerald-500" />
                            <div style={{ height: `${netPercent}%` }} className="w-3 bg-sky-500 rounded-t transition-all hover:bg-sky-400" />
                          </div>
                          
                          <span className="text-[10px] font-bold text-slate-500 mt-2 block truncate w-full text-center">
                            {m.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="flex gap-4 text-xs font-bold justify-center pt-2">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full inline-block" /> Gross Transaction Value
                  </span>
                  <span className="flex items-center gap-1 text-sky-400">
                    <span className="w-2.5 h-2.5 bg-sky-500 rounded-full inline-block" /> Platform Profit (Commissions)
                  </span>
                </div>
              </div>

              {/* Company Wise Earnings */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award size={18} className="text-amber-500" />
                  Top Partner Earnings
                </h3>
                
                {stats.companyEarnings.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
                    No supplier earnings calculated yet
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {stats.companyEarnings.map((company, index) => (
                      <div key={company.companyId} className="flex justify-between items-center bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/40">
                        <div>
                          <span className="text-xs font-black text-slate-500 block">RANK #{index + 1}</span>
                          <span className="text-sm font-bold text-slate-200 mt-0.5 block">{company.companyName}</span>
                          <span className="text-[10px] text-slate-500 mt-1 block">Rentals: {company.totalRentals}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-white flex items-center justify-end">
                            <IndianRupee size={12} className="text-slate-400" />
                            {company.revenue}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-bold block mt-1">
                            Comm: +₹{company.profit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Commissions Transaction ledger table */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
              <div className="p-6 bg-slate-900 border-b border-slate-800">
                <h3 className="text-lg font-bold text-white">Commissions Ledger Ledger</h3>
                <p className="text-xs text-slate-400 mt-1">Audit log of all marketplace commissions accrued and distributed</p>
              </div>

              {stats.transactions.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-sm">
                  No commission entries recorded in ledger yet
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/40 text-slate-450 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-800">
                      <th className="p-4">Transaction ID</th>
                      <th className="p-4">Supplier Partner</th>
                      <th className="p-4">Equipment Leased</th>
                      <th className="p-4">Lease Gross</th>
                      <th className="p-4">Platform Profit (Net)</th>
                      <th className="p-4">Supplier Payout</th>
                      <th className="p-4">Date Logged</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-xs">
                    {stats.transactions.map((tx) => (
                      <tr key={tx.transactionId} className="hover:bg-slate-900/10 transition-colors">
                        <td className="p-4 font-mono text-slate-500">
                          {tx.transactionId.slice(0, 10).toUpperCase()}...
                        </td>
                        <td className="p-4 font-semibold text-slate-300">
                          {tx.companyName}
                        </td>
                        <td className="p-4 text-slate-350">
                          {tx.equipmentName}
                        </td>
                        <td className="p-4 font-bold text-slate-200">
                          ₹{tx.rentalAmount}
                        </td>
                        <td className="p-4 font-extrabold text-emerald-400">
                          +₹{Math.round(tx.adminProfit)}
                          <span className="text-[9px] text-slate-500 font-normal ml-1">
                            ({tx.commissionType === 'Percentage' ? `${tx.commissionValue}%` : `₹${tx.commissionValue}`})
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-slate-400">
                          ₹{Math.round(tx.companyPayout)}
                        </td>
                        <td className="p-4 text-slate-500">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
