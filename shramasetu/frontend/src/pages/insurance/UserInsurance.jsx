import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Plus, CheckCircle2, ShieldAlert, Award, FileText, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserInsurance() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [premiumType, setPremiumType] = useState('Monthly'); // 'Monthly' or 'Yearly'

  const userId = localStorage.getItem('uid');
  const userRole = localStorage.getItem('role') || 'labour';
  const userName = localStorage.getItem('name') || 'User';

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    documentsURL: ''
  });

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    fetchPlans();
  }, [userId]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const data = await api.getInsurancePlans();
      // Only show Active plans!
      setPlans(data.filter(p => p.status === 'Active'));
    } catch (err) {
      console.error(err);
      alert('Error fetching insurance plans: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApply = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      email: '',
      phone: '',
      documentsURL: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=800' // Simulated uploaded document URL
    });
    setShowApplyModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const premiumAmount = premiumType === 'Monthly' ? selectedPlan.monthlyPremium : selectedPlan.yearlyPremium;
      const payload = {
        userId,
        userName,
        userRole,
        email: formData.email,
        phone: formData.phone,
        providerId: selectedPlan.providerId,
        providerName: selectedPlan.providerName,
        planId: selectedPlan.planId,
        planName: selectedPlan.planName,
        premiumType,
        premiumAmount,
        documentsURL: formData.documentsURL
      };

      await api.createInsuranceApplication(payload);
      alert(t("Confirmed"));
      setShowApplyModal(false);
      navigate(userRole === 'admin' ? '/admin/insurance-applications' : `/${userRole}/insurance/status`);
    } catch (err) {
      alert('Error applying for insurance: ' + err.message);
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
          <button onClick={() => navigate(`/${userRole}/insurance`)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all bg-emerald-600 text-white shadow-lg shadow-emerald-900/40">
            🛡️ {t("insuranceMarketplace")}
          </button>
          <button onClick={() => navigate(`/${userRole}/insurance/status`)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-400 hover:bg-slate-900 hover:text-white">
            📋 {t("myPolicyStatus")}
          </button>
        </nav>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">{t("insuranceMarketplace")}</h2>
              <p className="text-slate-400 mt-1">{t("Subtitle")}</p>
            </div>
            <button onClick={() => navigate(`/${userRole}/insurance/status`)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-bold px-4 py-2.5 rounded-xl transition-all">
              {t("trackApplications")} <ChevronRight size={16} />
            </button>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : plans.length === 0 ? (
            <div className="bg-slate-950 p-12 text-center rounded-2xl border border-slate-800">
              <ShieldAlert size={48} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-400">{t("noInsuranceAvailable")}</h3>
              <p className="text-slate-500 mt-1">{t("checkBackLater")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((p) => (
                <div key={p.planId} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-md flex flex-col hover:border-slate-700 transition-all group">
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug">{p.planName}</h3>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider mt-0.5">{p.providerName}</span>
                      </div>
                      <Award className="text-emerald-500 shrink-0" size={20} />
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/40 my-3 text-xs flex justify-between items-center text-center">
                      <div className="w-1/2 border-r border-slate-800">
                        <span className="text-[9px] text-slate-500 block uppercase font-bold">{t("sumCoverage")}</span>
                        <span className="text-white font-extrabold text-sm mt-0.5 block">₹{(p.coverageAmount).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="w-1/2">
                        <span className="text-[9px] text-slate-500 block uppercase font-bold">{t("yearlyPremium")}</span>
                        <span className="text-emerald-400 font-extrabold text-sm mt-0.5 block">₹{(p.yearlyPremium).toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="space-y-3 text-xs text-slate-400 flex-1 py-1">
                      <div>
                        <span className="text-[9px] text-slate-550 block uppercase font-bold">{t("monthlyPremiumInstallment")}</span>
                        <span className="text-white font-semibold block">₹{(p.monthlyPremium).toLocaleString('en-IN')} / month</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-550 block uppercase font-bold">{t("eligibility")}</span>
                        <p className="text-[11px] text-slate-350 mt-0.5 leading-snug">{p.eligibility}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-550 block uppercase font-bold">{t("policyBenefits")}</span>
                        <p className="text-[11px] text-slate-350 mt-0.5 leading-snug">{p.benefits}</p>
                      </div>
                    </div>

                    <button onClick={() => handleOpenApply(p)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-emerald-900/20 mt-6">
                      {t("applyForCoverage")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Apply Modal */}
      <AnimatePresence>
        {showApplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowApplyModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative z-10">
              <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-500" />
                  {t("applyForCoverage")}
                </h3>
                <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t("insurancePlans")}:</span>
                    <span className="text-white font-bold">{selectedPlan.planName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">{t("sumCoverage")}:</span>
                    <span className="text-emerald-400 font-bold">₹{selectedPlan.coverageAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t("premiumCycle")} *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${premiumType === 'Monthly' ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400 shadow-sm' : 'bg-slate-950 border-slate-800 text-slate-400'}`} onClick={() => setPremiumType('Monthly')}>
                      {t("monthlyPremium")}
                      <span className="block text-[10px] font-black text-white mt-1">₹{selectedPlan.monthlyPremium}/mo</span>
                    </button>
                    <button type="button" className={`p-3 rounded-xl border text-xs font-bold transition-all text-center ${premiumType === 'Yearly' ? 'bg-emerald-600/10 border-emerald-500 text-emerald-400 shadow-sm' : 'bg-slate-950 border-slate-800 text-slate-400'}`} onClick={() => setPremiumType('Yearly')}>
                      {t("yearlyPremium")}
                      <span className="block text-[10px] font-black text-white mt-1">₹{selectedPlan.yearlyPremium}/yr</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t("emailAddress")} *</label>
                    <input type="email" required value={formData.email} placeholder="e.g. name@domain.com" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t("MobileNumber")} *</label>
                    <input type="text" required value={formData.phone} placeholder="e.g. 9876543210" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t("identityProof")} *</label>
                  <input type="text" required value={formData.documentsURL} placeholder="Aadhaar photo or scanned card URL link..." className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, documentsURL: e.target.value})} />
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                  <button type="button" onClick={() => setShowApplyModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 font-bold text-slate-400 transition-all text-xs">{t("cancel")}</button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all text-xs shadow-md shadow-emerald-900/30">{t("confirmApply")}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
