import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Shield, Calendar, Phone, Award } from 'lucide-react';

export default function AdminInsurancePolicies() {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const data = await api.getActiveInsurancePolicies({});
      setPolicies(data);
    } catch (err) {
      console.error(err);
      alert('Error fetching policies: ' + err.message);
    } finally {
      setLoading(false);
    }
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
          <button onClick={() => navigate('/admin/insurance-applications')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-400 hover:bg-slate-900 hover:text-white">
            📋 Review Applications
          </button>
          <button onClick={() => navigate('/admin/insurance-policies')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all bg-emerald-600 text-white shadow-lg shadow-emerald-900/40">
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
            <h2 className="text-3xl font-black text-white tracking-tight">Active Policies</h2>
            <p className="text-slate-400 mt-1">Track and manage active health policies issued across ShramaSetu platform</p>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : policies.length === 0 ? (
            <div className="bg-slate-950 p-12 text-center rounded-2xl border border-slate-800">
              <Shield size={48} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-400">No active policies found</h3>
              <p className="text-slate-500 mt-1">Active policies issued to plantation users will be archived here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {policies.map((p) => (
                <div key={p.policyId} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col hover:border-slate-700 transition-all relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/10 rounded-full blur-2xl group-hover:bg-emerald-600/20 transition-all" />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Policy ID: #{p.policyId.substring(0, 8)}</span>
                      <h3 className="text-base font-extrabold text-white leading-snug mt-0.5">{p.planName}</h3>
                      <span className="text-[10px] text-emerald-400 uppercase font-black tracking-wider block mt-1">{p.providerName}</span>
                    </div>
                    <Shield className="text-emerald-500 shrink-0" size={24} />
                  </div>

                  <div className="space-y-3.5 text-xs text-slate-400 mt-2 flex-1">
                    <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/40 grid grid-cols-2 gap-2 text-center">
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase font-bold">Sum Insured</span>
                        <span className="text-white font-extrabold text-xs block mt-0.5">₹{Number(p.coverageAmount).toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase font-bold">Premium Paid</span>
                        <span className="text-emerald-400 font-extrabold text-xs block mt-0.5">₹{Number(p.premiumAmount).toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase font-bold">Beneficiary Details</span>
                      <div className="text-white font-semibold flex items-center gap-1.5 mt-0.5">
                        <span>{p.userName}</span>
                        <span className={`text-[9px] font-bold px-1 py-0.2 rounded uppercase ${p.userRole === 'labour' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                          {p.userRole}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-900">
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase font-bold flex items-center gap-1">
                          <Calendar size={10} /> Start Date
                        </span>
                        <span className="text-slate-350 block mt-0.5 font-semibold">{p.policyStartDate}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase font-bold flex items-center gap-1">
                          <Calendar size={10} /> End Date
                        </span>
                        <span className="text-rose-400 block mt-0.5 font-semibold">{p.policyEndDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/50 mt-4 flex items-center gap-2 text-xs">
                    <Phone size={13} className="text-emerald-500 shrink-0" />
                    <div>
                      <span className="text-[9px] text-slate-550 block font-bold uppercase">Claim support Hotline</span>
                      <span className="text-white font-extrabold block mt-0.5">{p.claimSupportContact}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
