import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Plus, CheckCircle2, XCircle, Edit, MapPin, Phone, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminInsuranceProviders() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedProviderId, setSelectedProviderId] = useState(null);

  const [formData, setFormData] = useState({
    providerName: '',
    registrationNumber: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    categories: 'Health',
    commissionType: 'Percentage',
    commissionValue: '10'
  });

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const data = await api.getInsuranceProviders();
      setProviders(data);
    } catch (err) {
      console.error(err);
      alert('Error fetching providers: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setFormData({
      providerName: '',
      registrationNumber: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      categories: 'Health',
      commissionType: 'Percentage',
      commissionValue: '10'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p) => {
    setModalMode('edit');
    setSelectedProviderId(p.providerId);
    setFormData({
      providerName: p.providerName || '',
      registrationNumber: p.registrationNumber || '',
      contactPerson: p.contactPerson || '',
      phone: p.phone || '',
      email: p.email || '',
      address: p.address || '',
      categories: Array.isArray(p.categories) ? p.categories.join(', ') : p.categories || 'Health',
      commissionType: p.commissionType || 'Percentage',
      commissionValue: String(p.commissionValue || 10)
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        categories: formData.categories.split(',').map(s => s.trim()).filter(Boolean),
        commissionValue: Number(formData.commissionValue)
      };

      if (modalMode === 'add') {
        await api.addInsuranceProvider(payload);
        alert('Insurance provider added successfully!');
      } else {
        await api.updateInsuranceProvider(selectedProviderId, payload);
        alert('Insurance provider updated successfully!');
      }
      setShowModal(false);
      fetchProviders();
    } catch (err) {
      alert('Error saving provider: ' + err.message);
    }
  };

  const handleStatusChange = async (providerId, field, value) => {
    try {
      const payload = {};
      payload[field] = value;
      await api.updateInsuranceProviderStatus(providerId, payload);
      alert('Provider status updated!');
      fetchProviders();
    } catch (err) {
      alert('Error updating provider status: ' + err.message);
    }
  };

  // KPIs
  const total = providers.length;
  const verified = providers.filter(p => p.verificationStatus === 'Approved').length;
  const active = providers.filter(p => p.status === 'Active').length;

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
          <button onClick={() => navigate('/admin/insurance-providers')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all bg-emerald-600 text-white shadow-lg shadow-emerald-900/40">
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
              <h2 className="text-3xl font-black text-white tracking-tight">Insurance Providers</h2>
              <p className="text-slate-400 mt-1">Manage health insurance partner companies and commission settings</p>
            </div>
            <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-md shadow-emerald-900/30">
              <Plus size={18} /> Add Insurance Provider
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Total Providers Onboarded</span>
              <span className="text-4xl font-black text-white mt-2 block">{loading ? '...' : total}</span>
            </div>
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Verified Companies</span>
              <span className="text-4xl font-black text-emerald-400 mt-2 block">{loading ? '...' : verified}</span>
            </div>
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Active Status Providers</span>
              <span className="text-4xl font-black text-sky-400 mt-2 block">{loading ? '...' : active}</span>
            </div>
          </div>

          {/* Providers Grid */}
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : providers.length === 0 ? (
            <div className="bg-slate-950 p-12 text-center rounded-2xl border border-slate-800">
              <ShieldCheck size={48} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-400">No insurance providers found</h3>
              <p className="text-slate-500 mt-1">Register your first health insurance corporate partner company!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((p) => (
                <div key={p.providerId} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-md flex flex-col hover:border-slate-700 transition-all group">
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white leading-snug group-hover:text-emerald-400 transition-colors">{p.providerName}</h3>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider mt-1">Reg: {p.registrationNumber}</span>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${p.verificationStatus === 'Approved' ? 'bg-emerald-600 text-white' : p.verificationStatus === 'Rejected' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'}`}>
                        {p.verificationStatus}
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs text-slate-400 mt-2 flex-1">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-slate-650 shrink-0" />
                        <span className="truncate">{p.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-slate-650 shrink-0" />
                        <span>{p.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-slate-650 shrink-0" />
                        <span className="truncate">{p.email}</span>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/40 my-4 text-xs flex justify-between items-center">
                      <div>
                        <span className="text-[10px] text-slate-550 block font-bold uppercase">Admin Commission</span>
                        <span className="text-emerald-400 font-extrabold text-sm mt-0.5 block">
                          {p.commissionType === 'Percentage' ? `${p.commissionValue}%` : `₹${p.commissionValue}`}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-550 block font-bold uppercase">Status</span>
                        <button onClick={() => handleStatusChange(p.providerId, 'status', p.status === 'Active' ? 'Disabled' : 'Active')} className={`text-[10px] font-extrabold px-2 py-0.5 rounded mt-0.5 ${p.status === 'Active' ? 'bg-sky-500/10 text-sky-400' : 'bg-slate-800 text-slate-500'}`}>
                          {p.status}
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-slate-900 pt-4 flex gap-2">
                      <button onClick={() => handleOpenEdit(p)} className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 flex-1 flex justify-center items-center gap-1 font-bold text-xs transition-colors">
                        <Edit size={12} /> Edit Details
                      </button>

                      {p.verificationStatus !== 'Approved' && (
                        <button onClick={() => handleStatusChange(p.providerId, 'verificationStatus', 'Approved')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-2 rounded-lg flex-1 transition-colors">
                          Verify
                        </button>
                      )}
                      {p.verificationStatus === 'Pending' && (
                        <button onClick={() => handleStatusChange(p.providerId, 'verificationStatus', 'Rejected')} className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3 py-2 rounded-lg flex-1 transition-colors">
                          Reject
                        </button>
                      )}
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
                  {modalMode === 'add' ? 'Onboard Insurance Provider' : 'Edit Provider Details'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Provider Name *</label>
                    <input type="text" required value={formData.providerName} placeholder="e.g. Star Health Insurance" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, providerName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Company Reg Number *</label>
                    <input type="text" required value={formData.registrationNumber} placeholder="e.g. U66010MH2006PLC165258" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, registrationNumber: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Contact Person Name *</label>
                    <input type="text" required value={formData.contactPerson} placeholder="e.g. Rajesh Kumar" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, contactPerson: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Phone Number *</label>
                    <input type="text" required value={formData.phone} placeholder="e.g. 9876543210" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Business Email *</label>
                  <input type="email" required value={formData.email} placeholder="e.g. corporate@starhealth.com" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Commission Type *</label>
                    <select value={formData.commissionType} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, commissionType: e.target.value})}>
                      <option value="Percentage">Percentage (%)</option>
                      <option value="Fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Commission Value *</label>
                    <input type="number" required value={formData.commissionValue} placeholder="10" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, commissionValue: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Plan Categories</label>
                    <input type="text" value={formData.categories} placeholder="Health, Life" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, categories: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Corporate Office Address *</label>
                  <textarea required value={formData.address} placeholder="Enter corporate headquarters office address..." rows="2" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 font-bold text-slate-400 transition-all text-xs">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all text-xs shadow-md shadow-emerald-900/30">Save Provider Details</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
