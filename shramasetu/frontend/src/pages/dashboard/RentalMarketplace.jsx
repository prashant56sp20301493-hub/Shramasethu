import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useTranslation } from 'react-i18next';
import { Tractor, Plus, MapPin, IndianRupee, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RentalMarketplace() {
  const { t } = useTranslation();
  const [rentals, setRentals] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Tractor',
    price: '',
    location: '',
    contact: '',
    description: ''
  });

  const ownerName = localStorage.getItem('name') || 'Owner';

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      const data = await api.getRentals();
      setRentals(data);
    } catch (err) {
      console.error('Error fetching rentals:', err);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.addRental({
        ...formData,
        price: Number(formData.price),
        ownerName,
      });
      alert(t("Confirmed"));
      setShowAddModal(false);
      setFormData({
        title: '',
        category: 'Tractor',
        price: '',
        location: '',
        contact: '',
        description: ''
      });
      fetchRentals();
    } catch (err) {
      alert('Failed to list equipment: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">{t("rentalSystem")}</h2>
          <p className="text-slate-500 mt-1">{t("Subtitle")}</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-md shadow-emerald-100">
          <Plus size={18} /> {t("applyForCoverage")}
        </button>
      </div>

      {/* Grid List */}
      {rentals.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 shadow-sm">
          <Tractor size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700">{t("noRecordsFound")}</h3>
          <p className="text-slate-500 mt-1">{t("checkBackLater")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rentals.map((item) => (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} key={item.id} className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-lg transition-all flex flex-col overflow-hidden group">
              {/* Card Image Placeholder */}
              <div className="h-48 bg-gradient-to-br from-emerald-500/10 to-teal-600/5 flex items-center justify-center border-b border-slate-50 relative">
                <Tractor size={54} className="text-emerald-600/80 group-hover:scale-110 transition-transform duration-300" />
                <span className="absolute top-4 right-4 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{item.category}</span>
              </div>

              {/* Card Content */}
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-slate-800 leading-tight mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">{item.description}</p>

                <div className="space-y-2 mb-4 border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <MapPin size={16} className="text-slate-400" />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 text-sm">
                    <Phone size={16} className="text-slate-400" />
                    <span>{item.contact}</span>
                  </div>
                  <div className="text-slate-400 text-xs mt-1">{t("Owner")}: <span className="font-semibold text-slate-600">{item.ownerName}</span></div>
                </div>

                <div className="flex justify-between items-center border-t border-slate-50 pt-4">
                  <div>
                    <span className="text-slate-400 text-xs block">{t("totalWage")}</span>
                    <span className="text-2xl font-black text-slate-800 flex items-center gap-1">
                      <IndianRupee size={18} className="text-slate-700" />
                      {item.price} <span className="text-sm font-normal text-slate-500">/{t("wagePerDay")}</span>
                    </span>
                  </div>
                  <a href={`tel:${item.contact}`} className="bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 font-bold px-4 py-2.5 rounded-xl transition-all text-sm">{t("Owner")}</a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Equipment Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden relative z-10 border border-slate-100">
              <div className="px-6 py-4 bg-emerald-700 text-white flex justify-between items-center">
                <h3 className="text-lg font-bold">{t("applyForCoverage")}</h3>
                <button onClick={() => setShowAddModal(false)} className="text-white hover:text-emerald-200 font-bold">✕</button>
              </div>

              <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">{t("Name")}</label>
                  <input type="text" name="title" required value={formData.title} placeholder="e.g. Mahindra 575 DI Tractor" className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={handleChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">{t("SelectSkill")}</label>
                    <select name="category" value={formData.category} className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-750" onChange={handleChange}>
                      <option value="Tractor">Tractor</option>
                      <option value="Harvester">Harvester</option>
                      <option value="Plough">Plough</option>
                      <option value="Sprayer">Sprayer</option>
                      <option value="Tools">Other Tools</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">{t("wagePerDay")}</label>
                    <input type="number" name="price" required value={formData.price} placeholder="e.g. 1500" className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">{t("Location")}</label>
                    <input type="text" name="location" required value={formData.location} placeholder="e.g. Chikmagalur" className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-1">{t("MobileNumber")}</label>
                    <input type="text" name="contact" required value={formData.contact} placeholder="e.g. 9876543210" className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={handleChange} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1">{t("message")}</label>
                  <textarea name="description" required value={formData.description} placeholder="Provide details..." rows="3" className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={handleChange}></textarea>
                </div>

                <div className="flex gap-3 justify-end pt-2 border-t border-slate-55">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-slate-600 transition-all text-sm">{t("cancel")}</button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all text-sm shadow-md shadow-emerald-50">{t("confirmApply")}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
