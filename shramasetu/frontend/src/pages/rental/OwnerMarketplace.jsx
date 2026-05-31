import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Tractor, Search, MapPin, IndianRupee, Eye, Star, Info, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OwnerMarketplace() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [equipment, setEquipment] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Booking Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedEq, setSelectedEq] = useState(null);
  const [rentalType, setRentalType] = useState('Daily'); // Daily, Weekly, Monthly
  const [startDate, setStartDate] = useState('');
  const [duration, setDuration] = useState('1'); // number of days/weeks/months
  const [estimatedCost, setEstimatedCost] = useState(0);

  const ownerId = localStorage.getItem('uid') || 'OwnerUID';
  const ownerName = localStorage.getItem('name') || 'Owner Name';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get all approved listings for the marketplace
      const [eqData, compData] = await Promise.all([
        api.getEquipment({ approvedOnly: 'true' }),
        api.getRentalCompanies()
      ]);
      setEquipment(eqData.filter(e => e.availability === true));
      setCompanies(compData.filter(c => c.verificationStatus === 'Approved' && c.status === 'Active'));
    } catch (err) {
      console.error(err);
      alert('Error fetching marketplace listings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Estimate rental cost based on selection
  useEffect(() => {
    if (!selectedEq) return;
    let price = 0;
    const durNum = Number(duration || 1);
    if (rentalType === 'Daily') {
      price = selectedEq.dailyPrice * durNum;
    } else if (rentalType === 'Weekly') {
      price = selectedEq.weeklyPrice * durNum;
    } else {
      price = selectedEq.monthlyPrice * durNum;
    }
    setEstimatedCost(price);
  }, [selectedEq, rentalType, duration]);

  const handleOpenBooking = (eq) => {
    setSelectedEq(eq);
    setRentalType('Daily');
    setStartDate(new Date().toISOString().split('T')[0]);
    setDuration('1');
    setShowModal(true);
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!startDate) {
      alert('Please select a lease start date');
      return;
    }

    try {
      // Calculate end date based on rentalType & duration
      const start = new Date(startDate);
      let end = new Date(startDate);
      const durNum = Number(duration || 1);

      if (rentalType === 'Daily') {
        end.setDate(start.getDate() + durNum);
      } else if (rentalType === 'Weekly') {
        end.setDate(start.getDate() + (durNum * 7));
      } else {
        end.setMonth(start.getMonth() + durNum);
      }

      const payload = {
        ownerId,
        ownerName,
        equipmentId: selectedEq.equipmentId,
        rentalType,
        startDate: startDate,
        endDate: end.toISOString().split('T')[0],
        estimatedCost
      };

      await api.createRentalRequest(payload);
      alert(t("Confirmed"));
      setShowModal(false);
      navigate('/owner/rentals');
    } catch (err) {
      alert('Failed to submit rental request: ' + err.message);
    }
  };

  // Filter listings
  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = eq.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          eq.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? eq.category === selectedCategory : true;
    const matchesCompany = selectedCompany ? eq.companyId === selectedCompany : true;
    const matchesLocation = selectedLocation ? eq.location.toLowerCase().includes(selectedLocation.toLowerCase()) : true;
    const matchesPrice = maxPrice ? eq.dailyPrice <= Number(maxPrice) : true;

    return matchesSearch && matchesCategory && matchesCompany && matchesLocation && matchesPrice;
  });

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
            <span className="text-emerald-500 text-xs font-bold uppercase tracking-wider">{t("OwnerPortal")}</span>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1">
          <button onClick={() => navigate('/dashboard/owner')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-400 hover:bg-slate-900 hover:text-white">
            &larr; {t("backToDashboard")}
          </button>
          <button onClick={() => navigate('/owner/marketplace')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all bg-emerald-600 text-white shadow-lg shadow-emerald-900/40">
            🚜 {t("rentalSystem")}
          </button>
          <button onClick={() => navigate('/owner/rentals')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-400 hover:bg-slate-900 hover:text-white">
            📋 {t("trackApplications")}
          </button>
        </nav>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight">{t("rentalSystem")}</h2>
            <p className="text-slate-400 mt-1">{t("Subtitle")}</p>
          </div>

          {/* Search and Advanced Filter Panel */}
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-3">
                <Search size={18} className="text-slate-500" />
                <input type="text" placeholder={t("selectLabour") + "..."} value={searchQuery} className="bg-transparent border-none text-white focus:outline-none w-full text-sm" onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <div className="grid grid-cols-4 gap-3 flex-[2]">
                <select value={selectedCategory} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-350 focus:outline-none" onChange={e => setSelectedCategory(e.target.value)}>
                  <option value="">{t("SelectSkill")}</option>
                  <option value="Tractor">Tractor</option>
                  <option value="Harvester">Harvester</option>
                  <option value="Plough">Plough</option>
                  <option value="Sprayer">Sprayer</option>
                  <option value="Irrigation">Irrigation</option>
                  <option value="Tools">Other Tools</option>
                </select>
                <select value={selectedCompany} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-350 focus:outline-none" onChange={e => setSelectedCompany(e.target.value)}>
                  <option value="">{t("Owner")}</option>
                  {companies.map(c => <option key={c.companyId} value={c.companyId}>{c.companyName}</option>)}
                </select>
                <input type="text" placeholder={t("Location") + "..."} value={selectedLocation} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" onChange={e => setSelectedLocation(e.target.value)} />
                <input type="number" placeholder={t("wagePerDay") + "..."} value={maxPrice} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none" onChange={e => setMaxPrice(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Grid display */}
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : filteredEquipment.length === 0 ? (
            <div className="bg-slate-950 p-12 text-center rounded-2xl border border-slate-800">
              <Tractor size={48} className="mx-auto text-slate-650 mb-4" />
              <h3 className="text-lg font-bold text-slate-400">{t("noRecordsFound")}</h3>
              <p className="text-slate-500 mt-1">{t("checkBackLater")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEquipment.map((eq) => (
                <div key={eq.equipmentId} className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col group hover:border-emerald-600/30 transition-all">
                  
                  {/* Image container */}
                  <div className="h-44 bg-gradient-to-br from-emerald-600/20 to-slate-900 flex items-center justify-center border-b border-slate-800/60 relative">
                    {eq.imageURL ? (
                      <img src={eq.imageURL} alt={eq.equipmentName} className="object-cover w-full h-full opacity-80" />
                    ) : (
                      <Tractor size={44} className="text-emerald-500/60 group-hover:scale-105 transition-transform" />
                    )}
                    <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wide">
                      {eq.category}
                    </span>
                    <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1 shadow">
                      <ShieldCheck size={10} /> {t("Confirmed")}
                    </span>
                  </div>

                  {/* Body Details */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{eq.equipmentName}</h3>
                    <div className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-wider">Provided by: <span className="text-slate-350">{eq.companyName}</span></div>
                    
                    <p className="text-slate-450 text-xs mt-3 line-clamp-3 flex-1 leading-relaxed">{eq.description}</p>
                    
                    <div className="grid grid-cols-3 gap-2 my-4 pt-3 border-t border-slate-900">
                      <div>
                        <span className="text-[9px] text-slate-550 block uppercase font-bold">{t("wagePerDay")}</span>
                        <span className="text-sm font-black text-slate-100 flex items-center"><IndianRupee size={10} />{eq.dailyPrice}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-550 block uppercase font-bold">{t("workDays")}</span>
                        <span className="text-sm font-black text-slate-100 flex items-center"><IndianRupee size={10} />{eq.weeklyPrice}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-550 block uppercase font-bold">{t("bonus")}</span>
                        <span className="text-sm font-black text-emerald-400 flex items-center"><IndianRupee size={10} />{eq.deposit}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-900">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <MapPin size={12} className="text-slate-650" />
                        <span className="truncate max-w-[120px]">{eq.location}</span>
                      </div>
                      <button onClick={() => handleOpenBooking(eq)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-950">
                        {t("applyForCoverage")}
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Booking Modal */}
      <AnimatePresence>
        {showModal && selectedEq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden relative z-10">
              <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 text-white flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Tractor size={20} className="text-emerald-500" />
                  {t("applyForCoverage")}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white font-bold">✕</button>
              </div>

              <form onSubmit={handleRequestSubmit} className="p-6 space-y-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex items-center gap-3">
                  <div className="p-2 bg-emerald-600/10 rounded-lg">
                    <Tractor size={24} className="text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{selectedEq.equipmentName}</h4>
                    <p className="text-xs text-slate-500">Supplier: {selectedEq.companyName} | Condition: {selectedEq.condition}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-1">{t("premiumCycle")} *</label>
                    <select value={rentalType} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setRentalType(e.target.value)}>
                      <option value="Daily">Daily Lease (₹{selectedEq.dailyPrice}/day)</option>
                      <option value="Weekly">Weekly Lease (₹{selectedEq.weeklyPrice}/week)</option>
                      <option value="Monthly">Monthly Lease (₹{selectedEq.monthlyPrice}/month)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-400 mb-1">{t("workDays")} *</label>
                    <input type="number" required min="1" value={duration} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setDuration(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-400 mb-1">{t("Date")} *</label>
                  <input type="date" required value={startDate} min={new Date().toISOString().split('T')[0]} className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={e => setStartDate(e.target.value)} />
                </div>

                {/* Estimate Cost displays */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>{t("totalWage")}:</span>
                    <span className="font-semibold text-slate-200">₹{estimatedCost}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>{t("bonus")}:</span>
                    <span className="font-semibold text-slate-200">₹{selectedEq.deposit}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-black border-t border-slate-900 pt-2 text-white">
                    <span>{t("totalWage")}:</span>
                    <span className="text-emerald-400 flex items-center"><IndianRupee size={14} />{estimatedCost + selectedEq.deposit}</span>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-800 font-bold text-slate-400 transition-all text-sm">{t("cancel")}</button>
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all text-sm shadow-md shadow-emerald-900/30">{t("confirmApply")}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
