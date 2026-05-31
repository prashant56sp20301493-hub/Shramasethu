import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, BarChart3, TrendingUp, DollarSign, ArrowUpRight, Activity, Calendar, Wallet } from 'lucide-react';

export default function AdminProfits() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.getUnifiedProfitStats();
      setStats(data);
    } catch (err) {
      console.error(err);
      alert('Error fetching stats: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const kpis = stats?.kpis || {};
  const monthlyEarnings = stats?.monthlyEarnings || [];
  const providerEarnings = stats?.providerEarnings || [];
  const ledger = stats?.ledger || [];

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
          <button onClick={() => navigate('/admin/insurance-applications')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-400 hover:bg-slate-900 hover:text-white">
            📋 Review Applications
          </button>
          <button onClick={() => navigate('/admin/insurance-policies')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-400 hover:bg-slate-900 hover:text-white">
            🛡️ Active Policies
          </button>
          <div className="pt-2 pb-1 text-[10px] uppercase font-bold text-slate-650 tracking-wider">Profits Ledger</div>
          <button onClick={() => navigate('/admin/profits')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all bg-emerald-600 text-white shadow-lg shadow-emerald-900/40">
            💵 Unified Profit Dashboard
          </button>
        </nav>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <BarChart3 className="text-emerald-500" size={32} />
              Unified Profit Dashboard
            </h2>
            <p className="text-slate-400 mt-1">Cross-platform audits tracking Machinery Rentals and Health Insurance Marketplace profit cuts</p>
          </div>

          {/* Unified KPI Metrics grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total platform profits */}
            <div className="bg-gradient-to-br from-slate-950 to-emerald-950/20 p-6 rounded-2xl border border-emerald-500/20 shadow-md flex justify-between items-center group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all" />
              <div>
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">Combined Platform profit</span>
                <span className="text-3xl font-black text-white mt-1.5 block">₹{Number(kpis.totalPlatformProfit || 0).toLocaleString('en-IN')}</span>
                <span className="text-emerald-400 text-[10px] font-bold mt-2 flex items-center gap-1">
                  <TrendingUp size={12} /> Net Platform Cut Logged
                </span>
              </div>
              <div className="p-3 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-900/30">
                <DollarSign size={24} className="text-white" />
              </div>
            </div>

            {/* Rental cut */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm flex justify-between items-center">
              <div>
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">Rental Machinery Profit</span>
                <span className="text-2xl font-black text-white mt-1.5 block">₹{Number(kpis.totalRentalProfit || 0).toLocaleString('en-IN')}</span>
                <span className="text-slate-500 text-[10px] font-semibold mt-2 block">Pending: ₹{Number(kpis.pendingRentalProfit || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-slate-400">
                <Wallet size={20} />
              </div>
            </div>

            {/* Insurance cut */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm flex justify-between items-center">
              <div>
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider block">Health Insurance Profit</span>
                <span className="text-2xl font-black text-emerald-400 mt-1.5 block">₹{Number(kpis.totalInsuranceProfit || 0).toLocaleString('en-IN')}</span>
                <span className="text-slate-500 text-[10px] font-semibold mt-2 block flex items-center gap-1.5">
                  <span>Completed: ₹{Number(kpis.completedInsuranceProfit || 0).toLocaleString('en-IN')}</span>
                  <span>•</span>
                  <span>Pending: ₹{Number(kpis.pendingInsuranceProfit || 0).toLocaleString('en-IN')}</span>
                </span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-emerald-500">
                <ShieldCheck size={20} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pure CSS Monthly Volume Charts */}
            <div className="lg:col-span-2 bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col shadow-sm">
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Monthly Profit Analytics</h3>
              
              {monthlyEarnings.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                  No monthly profit volumes logged yet.
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-end space-y-6 min-h-[220px] pt-4">
                  <div className="flex items-end justify-around h-36 border-b border-slate-800 pb-2">
                    {monthlyEarnings.map((m) => {
                      const maxVal = Math.max(...monthlyEarnings.map(item => item.totalProfit || 1));
                      const totalHeight = Math.max(15, Math.round((m.totalProfit / maxVal) * 100));
                      const rentalPercentage = Math.round((m.rentalProfit / (m.totalProfit || 1)) * 100);
                      const insPercentage = 100 - rentalPercentage;

                      return (
                        <div key={m.month} className="flex flex-col items-center group relative w-16">
                          {/* Tooltip */}
                          <div className="absolute bottom-full mb-2 bg-slate-900 border border-slate-700 text-white font-extrabold text-[10px] p-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all z-20 pointer-events-none text-center shadow-lg min-w-[120px]">
                            <span className="block text-slate-400 font-bold uppercase">{m.month}</span>
                            <span className="block text-sky-400 mt-1">Rentals: ₹{m.rentalProfit}</span>
                            <span className="block text-emerald-400">Insurance: ₹{m.insuranceProfit}</span>
                            <span className="block border-t border-slate-850 mt-1.5 pt-1 text-white">Total: ₹{m.totalProfit}</span>
                          </div>

                          <div className="w-10 rounded-t-lg overflow-hidden flex flex-col justify-end" style={{ height: `${totalHeight}%` }}>
                            {/* Rentals bar section */}
                            {m.rentalProfit > 0 && (
                              <div className="bg-sky-500" style={{ height: `${rentalPercentage}%` }} />
                            )}
                            {/* Insurance bar section */}
                            {m.insuranceProfit > 0 && (
                              <div className="bg-emerald-500" style={{ height: `${insPercentage}%` }} />
                            )}
                          </div>

                          <span className="text-[10px] font-bold text-slate-500 mt-2 block">{m.month}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex justify-center gap-6 text-[10px] font-bold text-slate-400 uppercase">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-sky-500 rounded-sm" />
                      <span>Machinery Rentals Cut</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
                      <span>Health Insurance Commission</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Provider performance metrics */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col shadow-sm">
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Insurance Provider Report</h3>
              
              {providerEarnings.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
                  No verified providers listed.
                </div>
              ) : (
                <div className="space-y-4 flex-1 overflow-y-auto">
                  {providerEarnings.map((p) => {
                    const totalInsRev = kpis.totalInsuranceRevenue || 1;
                    const fillPercentage = Math.min(100, Math.round((p.revenue / totalInsRev) * 100));

                    return (
                      <div key={p.providerId} className="space-y-2 text-xs">
                        <div className="flex justify-between items-center font-bold">
                          <span className="text-white truncate pr-2">{p.providerName}</span>
                          <span className="text-emerald-400 font-extrabold shrink-0">₹{p.profit}</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${fillPercentage}%` }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                          <span>{p.totalApplications} policies</span>
                          <span>Vol: ₹{p.revenue}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Unified Profit Audit Ledger */}
          <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Unified Profit Audit Ledger</h3>
            
            {ledger.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No financial ledger records found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase">
                      <th className="pb-3">Source Channel</th>
                      <th className="pb-3">Partner Supplier</th>
                      <th className="pb-3">Item / Service Name</th>
                      <th className="pb-3">Gross Transaction</th>
                      <th className="pb-3">Platform Cut</th>
                      <th className="pb-3">Partner Payout</th>
                      <th className="pb-3">Payment Status</th>
                      <th className="pb-3 text-right">Transaction Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ledger.map((tx) => (
                      <tr key={tx.id} className="border-b border-slate-900 hover:bg-slate-900/20 transition-all">
                        <td className="py-3.5">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${tx.sourceType === 'rental_commission' ? 'bg-sky-500/10 text-sky-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                            {tx.sourceType === 'rental_commission' ? 'Equipment Rental' : 'Insurance'}
                          </span>
                        </td>
                        <td className="py-3.5 font-bold text-white">{tx.partnerName}</td>
                        <td className="py-3.5 text-slate-350">{tx.itemName}</td>
                        <td className="py-3.5 font-extrabold text-white">₹{Number(tx.grossAmount).toLocaleString('en-IN')}</td>
                        <td className="py-3.5 font-black text-emerald-400">₹{Number(tx.profitAmount).toLocaleString('en-IN')}</td>
                        <td className="py-3.5 text-slate-450">₹{Number(tx.payoutAmount).toLocaleString('en-IN')}</td>
                        <td className="py-3.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${tx.paymentStatus === 'Paid' ? 'bg-emerald-600/10 text-emerald-400' : 'bg-amber-600/10 text-amber-400 animate-pulse'}`}>
                            {tx.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3.5 text-slate-500 font-bold text-right">
                          {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
