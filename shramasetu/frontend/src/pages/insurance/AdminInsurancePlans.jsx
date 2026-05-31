import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Plus, CheckCircle2, XCircle, Edit, DollarSign, Users, Award, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminInsurancePlans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  const [formData, setFormData] = useState({
    providerId: '',
    planName: '',
    coverageAmount: '',
    monthlyPremium: '',
    yearlyPremium: '',
    benefits: '',
    eligibility: '',
    validityPeriod: '1 Year',
    claimSupportContact: '',
    commissionType: 'Percentage',
    commissionValue: '10'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansData, providersData] = await Promise.all([
        api.getInsurancePlans(),
        api.getInsuranceProviders()
      ]);
      setPlans(plansData);
      // Only link plans with approved and verified providers!
      setProviders(providersData.filter(p => p.verificationStatus === 'Approved'));
    } catch (err) {
      console.error(err);
      alert('Error fetching data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    if (providers.length === 0) {
      alert('You must have at least one VERIFIED and APPROVED Insurance Provider to create plans! Please verify providers first.');
      return;
    }
    setModalMode('add');
    setFormData({
      providerId: providers[0].providerId,
      planName: '',
      coverageAmount: '300000',
      monthlyPremium: '350',
      yearlyPremium: '3500',
      benefits: 'Full hospitalization, Ambulance coverage, ICU expenses included',
      eligibility: 'All plantation workers aged 18 to 60 years',
      validityPeriod: '1 Year',
      claimSupportContact: '1800-456-7890',
      commissionType: 'Percentage',
      commissionValue: '10'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setModalMode('edit');
    setSelectedPlanId(p.planId);
    setFormData({
      providerId: p.providerId || '',
      planName: p.planName || '',
      coverageAmount: String(p.coverageAmount || ''),
      monthlyPremium: String(p.monthlyPremium || ''),
      yearlyPremium: String(p.yearlyPremium || ''),
      benefits: p.benefits || '',
      eligibility: p.eligibility || '',
      validityPeriod: p.validityPeriod || '1 Year',
      claimSupportContact: p.claimSupportContact || '',
      commissionType: p.commissionType || 'Percentage',
      commissionValue: String(p.commissionValue || 10)
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const linkedProvider = providers.find(pr => pr.providerId === formData.providerId);
      const payload = {
        ...formData,
        providerName: linkedProvider ? linkedProvider.providerName : 'Unknown Provider',
        coverageAmount: Number(formData.coverageAmount),
        monthlyPremium: Number(formData.monthlyPremium),
        yearlyPremium: Number(formData.yearlyPremium),
        commissionValue: Number(formData.commissionValue)
      };

      if (modalMode === 'add') {
        await api.addInsurancePlan(payload);
        alert('Insurance plan added successfully!');
      } else {
        await api.updateInsurancePlan(selectedPlanId, payload);
        alert('Insurance plan updated successfully!');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert('Error saving plan: ' + err.message);
    }
  };

  const handleStatusChange = async (planId, newStatus) => {
    try {
      await api.updateInsurancePlanStatus(planId, { status: newStatus });
      alert('Plan status updated!');
      fetchData();
    } catch (err) {
      alert('Error updating status: ' + err.message);
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
          <button onClick={() => navigate('/admin/insurance-plans')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all bg-emerald-600 text-white shadow-lg shadow-emerald-900/40">
            📋 Insurance Plans
          </button>
          <button onClick={() => navigate('/admin/insurance-applications')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-400 hover:bg-slate-900 hover:text-white">
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
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">Insurance Products</h2>
              <p className="text-slate-400 mt-1">Configure and manage health coverage packages and premium details</p>
            </div>
            <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-md shadow-emerald-900/30">
              <Plus size={18} /> Create Insurance Plan
            </button>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : plans.length === 0 ? (
            <div className="bg-slate-950 p-12 text-center rounded-2xl border border-slate-800">
              <ShieldAlert size={48} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-400">No insurance plans found</h3>
              <p className="text-slate-500 mt-1">Onboard your first insurance product linked with your verified providers!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((p) => (
                <div key={p.planId} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-md flex flex-col hover:border-slate-700 transition-all group relative">
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors leading-snug">{p.planName}</h3>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider mt-0.5">{p.providerName}</span>
                      </div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${p.status === 'Active' ? 'bg-sky-500/10 text-sky-400' : 'bg-slate-800 text-slate-500'}`}>
                        {p.status}
                      </span>
                    </div>

                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/40 my-3 text-xs grid grid-cols-2 gap-2 text-center">
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase font-bold">Max Coverage</span>
                        <span className="text-white font-extrabold text-sm mt-0.5 block">₹{(p.coverageAmount).toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase font-bold">Commission Cut</span>
                        <span className="text-emerald-400 font-extrabold text-sm mt-0.5 block">
                          {p.commissionType === 'Percentage' ? `${p.commissionValue}%` : `₹${p.commissionValue}`}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-400 flex-1 py-1">
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase font-bold">Yearly Premium</span>
                        <span className="text-white font-semibold block">₹{(p.yearlyPremium).toLocaleString('en-IN')} / year</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase font-bold">Monthly Option</span>
                        <span className="text-slate-350 block">₹{(p.monthlyPremium).toLocaleString('en-IN')} / month</span>
                      </div>
                      <div className="pt-1.5 border-t border-slate-900">
                        <span className="text-[9px] text-slate-500 block uppercase font-bold">Eligibility Details</span>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug truncate">{p.eligibility}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase font-bold">Key Benefits</span>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-2">{p.benefits}</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-900 pt-4 mt-4 flex gap-2">
                      <button onClick={() => handleOpenEdit(p)} className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 flex-1 flex justify-center items-center gap-1 font-bold text-xs transition-colors">
                        <Edit size={12} /> Edit Plan
                      </button>

                      <button onClick={() => handleStatusChange(p.planId, p.status === 'Active' ? 'Disabled' : 'Active')} className={`font-bold text-xs px-3 py-2 rounded-lg flex-1 transition-colors ${p.status === 'Active' ? 'bg-rose-950/45 text-rose-400 border border-rose-900/40 hover:bg-rose-900/30' : 'bg-sky-600 hover:bg-sky-700 text-white'}`}>
                        {p.status === 'Active' ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden relative z-10">
              <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <ShieldCheck size={20} className="text-emerald-500" />
                  {modalMode === 'add' ? 'Create Insurance Plan' : 'Edit Insurance Plan'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Supplier Partner *</label>
                    <select required value={formData.providerId} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, providerId: e.target.value})}>
                      {providers.map(p => (
                        <option key={p.providerId} value={p.providerId}>{p.providerName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Plan Name *</label>
                    <input type="text" required value={formData.planName} placeholder="e.g. Shramik Suraksha Standard" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, planName: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Coverage Amount (₹) *</label>
                    <input type="number" required value={formData.coverageAmount} placeholder="300000" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, coverageAmount: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Monthly Premium (₹) *</label>
                    <input type="number" required value={formData.monthlyPremium} placeholder="350" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, monthlyPremium: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Yearly Premium (₹) *</label>
                    <input type="number" required value={formData.yearlyPremium} placeholder="3500" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, yearlyPremium: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Validity Period</label>
                    <input type="text" value={formData.validityPeriod} placeholder="1 Year" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, validityPeriod: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Commission Type *</label>
                    <select value={formData.commissionType} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, commissionType: e.target.value})}>
                      <option value="Percentage">Percentage (%)</option>
                      <option value="Fixed">Fixed Cut (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Commission Value *</label>
                    <input type="number" required value={formData.commissionValue} placeholder="10" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, commissionValue: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Eligibility Criteria *</label>
                    <input type="text" required value={formData.eligibility} placeholder="e.g. Age 18-60, plantation worker" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, eligibility: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Claim Support Contact *</label>
                    <input type="text" required value={formData.claimSupportContact} placeholder="e.g. 1800-123-4567" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, claimSupportContact: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Key Benefits & Coverage Details *</label>
                  <textarea required value={formData.benefits} placeholder="Enter all plan benefits, checklists..." rows="3" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, benefits: e.target.value})}></textarea>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 font-bold text-slate-400 transition-all text-xs">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all text-xs shadow-md shadow-emerald-900/30">Save Plan</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
