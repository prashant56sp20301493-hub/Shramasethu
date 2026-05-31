import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Tractor, Plus, MapPin, IndianRupee, ShieldCheck, CheckCircle2, XCircle, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminEquipmentMarketplace() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(null);

  const [formData, setFormData] = useState({
    companyId: '',
    equipmentName: '',
    category: 'Tractor',
    description: '',
    dailyPrice: '',
    weeklyPrice: '',
    monthlyPrice: '',
    deposit: '',
    quantity: '1',
    condition: 'Excellent',
    imageURL: '',
    location: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eqData, compData] = await Promise.all([
        api.getEquipment(),
        api.getRentalCompanies()
      ]);
      setEquipment(eqData);
      // Only link equipment to active & approved companies
      setCompanies(compData.filter(c => c.verificationStatus === 'Approved' && c.status === 'Active'));
    } catch (err) {
      console.error(err);
      alert('Error fetching data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    if (companies.length === 0) {
      alert('Please register and approve at least one Rental Company first!');
      return;
    }
    setModalMode('add');
    setFormData({
      companyId: companies[0].companyId,
      equipmentName: '',
      category: 'Tractor',
      description: '',
      dailyPrice: '',
      weeklyPrice: '',
      monthlyPrice: '',
      deposit: '',
      quantity: '1',
      condition: 'Excellent',
      imageURL: '',
      location: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (eq) => {
    setModalMode('edit');
    setSelectedEquipmentId(eq.equipmentId);
    setFormData({
      companyId: eq.companyId || '',
      equipmentName: eq.equipmentName || '',
      category: eq.category || 'Tractor',
      description: eq.description || '',
      dailyPrice: String(eq.dailyPrice || 0),
      weeklyPrice: String(eq.weeklyPrice || 0),
      monthlyPrice: String(eq.monthlyPrice || 0),
      deposit: String(eq.deposit || 0),
      quantity: String(eq.quantity || 1),
      condition: eq.condition || 'Excellent',
      imageURL: eq.imageURL || '',
      location: eq.location || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const linkedCompany = companies.find(c => c.companyId === formData.companyId);
      const payload = {
        ...formData,
        companyName: linkedCompany ? linkedCompany.companyName : 'Independent',
        dailyPrice: Number(formData.dailyPrice),
        weeklyPrice: Number(formData.weeklyPrice),
        monthlyPrice: Number(formData.monthlyPrice),
        deposit: Number(formData.deposit),
        quantity: Number(formData.quantity)
      };

      if (modalMode === 'add') {
        await api.addEquipment(payload);
        alert('Equipment listed successfully!');
      } else {
        await api.updateEquipment(selectedEquipmentId, payload);
        alert('Equipment updated successfully!');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert('Error saving equipment: ' + err.message);
    }
  };

  const handleStatusChange = async (equipmentId, field, value) => {
    try {
      const payload = {};
      payload[field] = value;
      await api.updateEquipmentStatus(equipmentId, payload);
      alert('Listing status updated!');
      fetchData();
    } catch (err) {
      alert('Error updating listing status: ' + err.message);
    }
  };

  // KPIs
  const total = equipment.length;
  const approved = equipment.filter(e => e.adminApproval === 'Approved').length;
  const active = equipment.filter(e => e.availability === true).length;

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
          <button onClick={() => navigate('/admin/equipment-marketplace')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all bg-emerald-600 text-white shadow-lg shadow-emerald-900/40">
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
              <h2 className="text-3xl font-black text-white tracking-tight">Equipment Marketplace Management</h2>
              <p className="text-slate-400 mt-1">Manage and approve catalog listings for Owner marketplace</p>
            </div>
            <button onClick={handleOpenAdd} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-md shadow-emerald-900/30">
              <Plus size={18} /> Add Equipment Listing
            </button>
          </div>

          {/* KPI Dashboard */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Total Catalog Items</span>
              <span className="text-4xl font-black text-white mt-2 block">{loading ? '...' : total}</span>
            </div>
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Approved for Marketplace</span>
              <span className="text-4xl font-black text-emerald-400 mt-2 block">{loading ? '...' : approved}</span>
            </div>
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">Available Equipment Leases</span>
              <span className="text-4xl font-black text-sky-400 mt-2 block">{loading ? '...' : active}</span>
            </div>
          </div>

          {/* Listing Grid */}
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : equipment.length === 0 ? (
            <div className="bg-slate-950 p-12 text-center rounded-2xl border border-slate-800">
              <Tractor size={48} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-lg font-bold text-slate-400">No equipment listings found</h3>
              <p className="text-slate-500 mt-1">Create your first catalog equipment linked to a rental company partner!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {equipment.map((eq) => (
                <div key={eq.equipmentId} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-md flex flex-col group relative">
                  
                  {/* Image banner with badges */}
                  <div className="h-44 bg-gradient-to-br from-emerald-600/20 to-slate-900 border-b border-slate-800/60 flex items-center justify-center relative">
                    {eq.imageURL ? (
                      <img src={eq.imageURL} alt={eq.equipmentName} className="object-cover w-full h-full opacity-80" />
                    ) : (
                      <Tractor size={48} className="text-emerald-500/60 group-hover:scale-105 transition-transform" />
                    )}
                    <span className="absolute top-3 left-3 bg-emerald-600/10 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wide">
                      {eq.category}
                    </span>
                    <span className={`absolute top-3 right-3 text-xs font-extrabold px-2.5 py-0.5 rounded-full ${eq.adminApproval === 'Approved' ? 'bg-emerald-600 text-white' : eq.adminApproval === 'Rejected' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'}`}>
                      {eq.adminApproval}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-white leading-snug">{eq.equipmentName}</h3>
                    <p className="text-xs text-slate-400 mt-1">Linked: <span className="text-emerald-400 font-semibold">{eq.companyName}</span></p>
                    <p className="text-slate-500 text-xs mt-2 line-clamp-2 flex-1">{eq.description}</p>
                    
                    <div className="grid grid-cols-3 gap-2 my-4 pt-3 border-t border-slate-900">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Daily</span>
                        <span className="text-sm font-black text-slate-200">₹{eq.dailyPrice}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Weekly</span>
                        <span className="text-sm font-black text-slate-200">₹{eq.weeklyPrice}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase font-bold">Deposit</span>
                        <span className="text-sm font-black text-emerald-400">₹{eq.deposit}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-4">
                      <MapPin size={12} className="text-slate-600" />
                      <span>{eq.location || 'No Location specified'}</span>
                      <span className="text-slate-700">|</span>
                      <span>Stock: {eq.quantity}</span>
                    </div>

                    <div className="border-t border-slate-900 pt-4 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500 font-medium">Availability Status:</span>
                        <button onClick={() => handleStatusChange(eq.equipmentId, 'availability', !eq.availability)} className={`text-xs font-bold px-2 py-0.5 rounded ${eq.availability ? 'bg-sky-500/10 text-sky-400' : 'bg-slate-800 text-slate-500'}`}>
                          {eq.availability ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </div>

                      {/* Admin action controls */}
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleOpenEdit(eq)} className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 flex-1 flex justify-center items-center gap-1 font-bold text-xs transition-colors">
                          <Edit size={12} /> Edit Details
                        </button>

                        {eq.adminApproval !== 'Approved' && (
                          <button onClick={() => handleStatusChange(eq.equipmentId, 'adminApproval', 'Approved')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-2 rounded-lg flex-1 transition-colors">
                            Approve
                          </button>
                        )}
                        {eq.adminApproval === 'Pending' && (
                          <button onClick={() => handleStatusChange(eq.equipmentId, 'adminApproval', 'Rejected')} className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3 py-2 rounded-lg flex-1 transition-colors">
                            Reject
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Register / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden relative z-10">
              <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Tractor size={20} className="text-emerald-500" />
                  {modalMode === 'add' ? 'Add Equipment Listing' : 'Edit Equipment Listing'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-1">Rental Company Partner *</label>
                    <select name="companyId" value={formData.companyId} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, companyId: e.target.value})}>
                      {companies.map(c => <option key={c.companyId} value={c.companyId}>{c.companyName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-1">Equipment Name *</label>
                    <input type="text" name="equipmentName" required value={formData.equipmentName} placeholder="e.g. John Deere 5050D Tractor" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, equipmentName: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-1">Category *</label>
                    <select name="category" value={formData.category} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, category: e.target.value})}>
                      <option value="Tractor">Tractor</option>
                      <option value="Harvester">Harvester</option>
                      <option value="Plough">Plough</option>
                      <option value="Sprayer">Sprayer</option>
                      <option value="Irrigation">Irrigation System</option>
                      <option value="Tools">Other Tools</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-1">Location *</label>
                    <input type="text" name="location" required value={formData.location} placeholder="e.g. Hassan, Karnataka" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, location: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-450 mb-1">Daily Price (₹) *</label>
                    <input type="number" required value={formData.dailyPrice} placeholder="1200" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, dailyPrice: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-450 mb-1">Weekly Price (₹) *</label>
                    <input type="number" required value={formData.weeklyPrice} placeholder="7000" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, weeklyPrice: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-450 mb-1">Monthly Price (₹) *</label>
                    <input type="number" required value={formData.monthlyPrice} placeholder="25000" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, monthlyPrice: e.target.value})} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-450 mb-1">Security Deposit (₹) *</label>
                    <input type="number" required value={formData.deposit} placeholder="5000" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, deposit: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-450 mb-1">Quantity Stock *</label>
                    <input type="number" required value={formData.quantity} placeholder="5" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, quantity: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-450 mb-1">Machine Condition *</label>
                    <select name="condition" value={formData.condition} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, condition: e.target.value})}>
                      <option value="Brand New">Brand New</option>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-1">Equipment Image URL</label>
                  <input type="text" name="imageURL" value={formData.imageURL} placeholder="https://example.com/tractor.jpg" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, imageURL: e.target.value})} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-1">Description & Rental Terms</label>
                  <textarea name="description" value={formData.description} placeholder="Enter model, engine specs, fuel consumption, driver required, terms..." rows="3" className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 font-bold text-slate-400 transition-all text-sm">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all text-sm shadow-md shadow-emerald-900/30">Save Equipment listing</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
