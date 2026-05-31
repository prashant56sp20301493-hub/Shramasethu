import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useTranslation } from 'react-i18next';
import { useNavigate as useRouting } from 'react-router-dom';
import { ShieldCheck, Calendar, Phone, Activity, HeartHandshake, ShieldAlert } from 'lucide-react';

export default function UserInsuranceStatus() {
  const { t } = useTranslation();
  const navigate = useRouting();
  const [applications, setApplications] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem('uid');
  const userRole = localStorage.getItem('role') || 'labour';

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    fetchStatus();
  }, [userId]);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const [appsData, policiesData] = await Promise.all([
        api.getInsuranceApplications({ userId }),
        api.getActiveInsurancePolicies({ userId })
      ]);
      setApplications(appsData);
      setPolicies(policiesData);
    } catch (err) {
      console.error(err);
      alert('Error fetching policy status: ' + err.message);
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
            <span className="text-emerald-500 text-xs font-bold uppercase tracking-wider">{t("healthInsurance")}</span>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1">
          <button onClick={() => navigate(userRole === 'labour' ? '/dashboard/labour' : '/dashboard/owner')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-400 hover:bg-slate-900 hover:text-white">
            &larr; {t("backToDashboard")}
          </button>
          <div className="pt-2 pb-1 text-[10px] uppercase font-bold text-slate-650 tracking-wider">{t("insuranceOptions")}</div>
          <button onClick={() => navigate(`/${userRole}/insurance`)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-400 hover:bg-slate-900 hover:text-white">
            🛡️ {t("insuranceMarketplace")}
          </button>
          <button onClick={() => navigate(`/${userRole}/insurance/status`)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all bg-emerald-600 text-white shadow-lg shadow-emerald-900/40">
            📋 {t("myPolicyStatus")}
          </button>
        </nav>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">{t("myPolicyStatus")}</h2>
            <p className="text-slate-400 mt-1">{t("Subtitle")}</p>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Active protection policies */}
              <div>
                <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                  <HeartHandshake className="text-emerald-500" size={22} />
                  {t("Active")} {t("healthInsurance")} ({policies.length})
                </h3>

                {policies.length === 0 ? (
                  <div className="bg-slate-950 p-8 text-center rounded-2xl border border-slate-800 text-slate-500 text-xs">
                    {t("noInsuranceAvailable")}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {policies.map((p) => (
                      <div key={p.policyId} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col hover:border-slate-700 transition-all relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/10 rounded-full blur-2xl group-hover:bg-emerald-600/20 transition-all" />
                        
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className="text-[9px] text-slate-550 block uppercase font-bold tracking-wider">Policy: #{p.policyId.substring(0, 8)}</span>
                            <h4 className="text-base font-extrabold text-white leading-snug mt-0.5">{p.planName}</h4>
                            <span className="text-[10px] text-emerald-400 uppercase font-black tracking-wider block mt-1">{p.providerName}</span>
                          </div>
                          <HeartHandshake className="text-emerald-500 shrink-0" size={24} />
                        </div>

                        <div className="space-y-3.5 text-xs text-slate-400 mt-2 flex-1">
                          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/40 grid grid-cols-2 gap-2 text-center">
                            <div>
                              <span className="text-[9px] text-slate-550 block uppercase font-bold">{t("sumCoverage")}</span>
                              <span className="text-white font-extrabold text-xs block mt-0.5">₹{Number(p.coverageAmount).toLocaleString('en-IN')}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-550 block uppercase font-bold">{t("yearlyPremium")}</span>
                              <span className="text-emerald-400 font-extrabold text-xs block mt-0.5">₹{Number(p.premiumAmount).toLocaleString('en-IN')}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-900">
                            <div>
                              <span className="text-[9px] text-slate-550 block uppercase font-bold flex items-center gap-1">
                                <Calendar size={10} /> {t("Active")}
                              </span>
                              <span className="text-slate-350 block mt-0.5 font-semibold">{p.policyStartDate}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-550 block uppercase font-bold flex items-center gap-1">
                                <Calendar size={10} /> {t("status")}
                              </span>
                              <span className="text-rose-400 block mt-0.5 font-semibold">{p.policyEndDate}</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-900 p-3 rounded-xl border border-slate-850 mt-4 flex items-center gap-2 text-xs">
                          <Phone size={13} className="text-emerald-500 shrink-0" />
                          <div>
                            <span className="text-[9px] text-slate-550 block font-bold uppercase">Claim support hotline</span>
                            <span className="text-white font-extrabold block mt-0.5">{p.claimSupportContact}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submitted applications */}
              <div>
                <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                  <Activity className="text-sky-500" size={22} />
                  {t("trackApplications")} ({applications.length})
                </h3>

                {applications.length === 0 ? (
                  <div className="bg-slate-950 p-8 text-center rounded-2xl border border-slate-800 text-slate-500 text-xs">
                    {t("noInsuranceAvailable")}
                  </div>
                ) : (
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 bg-slate-900/40 text-slate-400 font-bold uppercase">
                            <th className="p-4">{t("insurancePlans")}</th>
                            <th className="p-4">{t("premiumCycle")}</th>
                            <th className="p-4">{t("yearlyPremium")}</th>
                            <th className="p-4">{t("status")}</th>
                            <th className="p-4">{t("actions")}</th>
                            <th className="p-4 text-right">{t("Date")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {applications.map((app) => (
                            <tr key={app.applicationId} className="border-b border-slate-900 hover:bg-slate-900/20 transition-all">
                              <td className="p-4">
                                <div className="font-bold text-white">{app.planName}</div>
                                <span className="text-[10px] text-slate-500 uppercase font-bold">{app.providerName}</span>
                              </td>
                              <td className="p-4 font-bold text-slate-350">{app.premiumType}</td>
                              <td className="p-4 font-extrabold text-white">₹{Number(app.premiumAmount).toLocaleString('en-IN')}</td>
                              <td className="p-4">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase 
                                  ${app.status?.toLowerCase() === 'active' || app.status?.toLowerCase() === 'approved' ? 'bg-emerald-600 text-white' : 
                                    app.status?.toLowerCase() === 'rejected' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white animate-pulse'}`}>
                                  {app.status?.toLowerCase() === 'active' || app.status?.toLowerCase() === 'approved' ? t("Active") : 
                                   app.status?.toLowerCase() === 'rejected' ? t("absent") : t("pending_val")}
                                </span>
                              </td>
                              <td className="p-4">
                                {app.status?.toLowerCase() === 'rejected' ? (
                                  <div className="text-[10px] text-rose-400 font-bold flex items-center gap-1.5">
                                    <ShieldAlert size={12} /> Reason: {app.rejectionReason}
                                  </div>
                                ) : app.status?.toLowerCase() === 'active' || app.status?.toLowerCase() === 'approved' ? (
                                  <span className="text-[10px] text-slate-500 font-bold uppercase">{t("Active")}</span>
                                ) : (
                                  <span className="text-[10px] text-slate-500 font-bold uppercase">{t("pending_val")}</span>
                                )}
                              </td>
                              <td className="p-4 text-slate-500 font-bold text-right">
                                {new Date(app.appliedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
