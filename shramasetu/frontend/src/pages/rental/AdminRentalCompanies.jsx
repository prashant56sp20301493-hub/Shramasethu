import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, ShieldCheck, CheckCircle2, XCircle, AlertCircle, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminRentalCompanies() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  
  const [formData, setFormData] = useState({
    companyName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    stateDistrict: '',
    gstNumber: '',
    description: '',
    logoURL: '',
    categories: '',
    commissionType: 'Percentage',
    commissionValue: '10'
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const data = await api.getRentalCompanies();
      setCompanies(data);
    } catch (err) {
      console.error(err);
      alert('Failed to load companies: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setFormData({
      companyName: '',
      ownerName: '',
      email: '',
      phone: '',
      address: '',
      stateDistrict: '',
      gstNumber: '',
      description: '',
      logoURL: '',
      categories: '',
      commissionType: 'Percentage',
      commissionValue: '10'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (c) => {
    setModalMode('edit');
    setSelectedCompanyId(c.companyId);
    setFormData({
      companyName: c.companyName || '',
      ownerName: c.ownerName || '',
      email: c.email || '',
      phone: c.phone || '',
      address: c.address || '',
      stateDistrict: c.stateDistrict || '',
      gstNumber: c.gstNumber || '',
      description: c.description || '',
      logoURL: c.logoURL || '',
      categories: Array.isArray(c.categories) ? c.categories.join(', ') : c.categories || '',
      commissionType: c.commissionType || 'Percentage',
      commissionValue: String(c.commissionValue || 10)
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const categoriesArray = formData.categories
        .split(',')
        .map(cat => cat.trim())
        .filter(cat => cat.length > 0);

      const payload = {
        ...formData,
        categories: categoriesArray,
        commissionValue: Number(formData.commissionValue)
      };

      if (modalMode === 'add') {
        await api.addRentalCompany(payload);
        alert('Rental company added successfully!');
      } else {
        await api.updateRentalCompany(selectedCompanyId, payload);
        alert('Rental company updated successfully!');
      }
      setShowModal(false);
      fetchCompanies();
    } catch (err) {
      alert('Error saving company: ' + err.message);
    }
  };

  const handleStatusChange = async (companyId, field, value) => {
    try {
      const payload = {};
      payload[field] = value;
      await api.updateRentalCompanyStatus(companyId, payload);
      alert('Status updated successfully!');
      fetchCompanies();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  // KPIs
  const total = companies.length;
  const verified = companies.filter(c => c.verificationStatus === 'Approved').length;
  const active = companies.filter(c => c.status === 'Active').length;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex font-sans">
      {/* Sidebar navigation */}
      <aside className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col p-6">
        <div className="mb-8 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 rounded-xl">
            <Building2 size={24} className="text-white" />
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
          <button onClick={() => navigate('/admin/rental-companies')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all bg-emerald-600 text-white shadow-lg shadow-emerald-900/40">
            🏢 Rental Companies
          </button>
          <button onClick={() => navigate('/admin/equipment-marketplace')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-400 hover:bg-slate-900 hover:text-white">
            🚜 Marketplace Listings
          </button>
          <button onClick={() => navigate('/admin/rental-requests')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-400 hover:bg-slate-900 hover:text-white">
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
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight">Rental Companies</h2>
              <p className="text-slate-400 mt-1">Register, verify, and monitor equipment rental partners</p>
            </div>
            <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-md shadow-emerald-900/30">
              <Plus size={18} /> Register Partner Company
            </button>
          </div>

          {/* KPI Dashboard */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Total Registered Companies</span>
              <span className="text-4xl font-black text-white mt-2 block">{loading ? '...' : total}</span>
            </div>
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Verified Companies</span>
              <span className="text-4xl font-black text-emerald-400 mt-2 block">{loading ? '...' : verified}</span>
            </div>
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Active Listing Partners</span>
              <span className="text-4xl font-black text-sky-400 mt-2 block">{loading ? '...' : active}</span>
            </div>
          </div>

          {/* Listing Grid / Table */}
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : companies.length === 0 ? (
            <div className="bg-slate-950 p-12 text-center rounded-2xl border border-slate-800">
              <Building2 size={48} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-400">No rental companies found</h3>
              <p className="text-slate-500 mt-1">Add your first agricultural machinery leasing company now!</p>
            </div>
          ) : (
            <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 uppercase text-xs font-extrabold tracking-wider border-b border-slate-800">
                    <th className="p-4">Company Details</th>
                    <th className="p-4">GST / Owner</th>
                    <th className="p-4">Commission Model</th>
                    <th className="p-4">Verification</th>
                    <th className="p-4">Availability</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {companies.map((c) => (
                    <tr key={c.companyId} className="hover:bg-slate-900/20 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white text-base">{c.companyName}</div>
                        <div className="text-xs text-slate-400 mt-1">📞 {c.phone} | ✉️ {c.email}</div>
                        <div className="text-xs text-slate-500 mt-0.5">📍 {c.address}, {c.stateDistrict}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-slate-350">{c.gstNumber}</div>
                        <div className="text-xs text-slate-500">Owner: {c.ownerName}</div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-semibold text-emerald-400">
                          {c.commissionType === 'Percentage' ? `${c.commissionValue}%` : `₹${c.commissionValue} (Fixed)`}
                        </span>
                        <div className="text-xs text-slate-500">Platform profit</div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${c.verificationStatus === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : c.verificationStatus === 'Rejected' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {c.verificationStatus === 'Approved' ? <ShieldCheck size={12} /> : null}
                          {c.verificationStatus}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider ${c.status === 'Active' ? 'bg-sky-500/10 text-sky-400' : 'bg-slate-800 text-slate-500'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-y-1.5">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleOpenEdit(c)} className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-800">
                            <Edit size={14} />
                          </button>
                          
                          {c.verificationStatus !== 'Approved' && (
                            <button onClick={() => handleStatusChange(c.companyId, 'verificationStatus', 'Approved')} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded">
                              Approve
                            </button>
                          )}
                          {c.verificationStatus === 'Pending' && (
                            <button onClick={() => handleStatusChange(c.companyId, 'verificationStatus', 'Rejected')} className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold px-2 py-1 rounded">
                              Reject
                            </button>
                          )}
                        </div>
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleStatusChange(c.companyId, 'status', c.status === 'Active' ? 'Disabled' : 'Active')} className={`text-xs font-bold px-2 py-1 rounded ${c.status === 'Active' ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'bg-sky-500/10 text-sky-400 hover:bg-sky-500/20'}`}>
                            {c.status === 'Active' ? 'Disable' : 'Enable'}
                          </button>
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

      {/* Register / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden relative z-10">
              <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Building2 size={20} className="text-emerald-500" />
                  {modalMode === 'add' ? 'Register New Partner Rental Company' : 'Edit Rental Company Details'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-1">Company Name *</label>
                    <input type="text" name="companyName" required value={formData.companyName} placeholder="e.g. GreenFarm Rentals" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, companyName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-1">Company Owner *</label>
                    <input type="text" name="ownerName" required value={formData.ownerName} placeholder="e.g. Adarsh Hegde" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, ownerName: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-1">Contact Email *</label>
                    <input type="email" name="email" required value={formData.email} placeholder="e.g. info@greenfarm.com" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-1">Phone Number *</label>
                    <input type="text" name="phone" required value={formData.phone} placeholder="e.g. +91 9876543210" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-1">GST/Business Number *</label>
                    <input type="text" name="gstNumber" required value={formData.gstNumber} placeholder="e.g. 29AAAAA1111A1Z1" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, gstNumber: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-1">State / District *</label>
                    <input type="text" name="stateDistrict" required value={formData.stateDistrict} placeholder="e.g. Karnataka / Chikmagalur" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, stateDistrict: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-1">Company Address *</label>
                  <input type="text" name="address" required value={formData.address} placeholder="Full address" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-1">Commission Type *</label>
                    <select name="commissionType" value={formData.commissionType} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, commissionType: e.target.value})}>
                      <option value="Percentage">Percentage (%)</option>
                      <option value="Fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-1">Commission Value *</label>
                    <input type="number" name="commissionValue" required value={formData.commissionValue} placeholder="10" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, commissionValue: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-1">Equipment Categories Offered (comma separated)</label>
                  <input type="text" name="categories" value={formData.categories} placeholder="Tractor, Harvester, Sprayer, Plough" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, categories: e.target.value})} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-1">Description</label>
                  <textarea name="description" value={formData.description} placeholder="Short bio of the company..." rows="3" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 font-bold text-slate-400 transition-all text-sm">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all text-sm shadow-md shadow-emerald-900/30">Save Company Partner</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
