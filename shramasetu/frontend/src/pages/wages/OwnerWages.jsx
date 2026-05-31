import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Wallet, IndianRupee, Users } from 'lucide-react';

export default function OwnerWages() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    labourId: '',
    wagePerDay: '',
    workDays: '',
    bonus: 0,
    deduction: 0,
    paymentStatus: 'pending'
  });

  const ownerId = localStorage.getItem('uid');
  const ownerName = localStorage.getItem('name');

  useEffect(() => {
    if (!ownerId) return navigate('/login');
    fetchData();
  }, [ownerId]);

  const fetchData = async () => {
    try {
      const [wagesData, usersData, jobsData] = await Promise.all([
        api.getWages({ ownerId }),
        api.getAdminUsers(),
        api.getOwnerJobs(ownerId)
      ]);
      setRecords(wagesData);

      const acceptedLabourIds = new Set();
      jobsData.forEach(job => {
        if (job.acceptedBy && Array.isArray(job.acceptedBy)) {
          job.acceptedBy.forEach(id => acceptedLabourIds.add(id));
        }
      });

      setUsers(usersData.filter(u => u.role === 'labour' && acceptedLabourIds.has(u.id)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const labour = users.find(u => u.id === formData.labourId);
      const totalWage = (Number(formData.wagePerDay) * Number(formData.workDays)) + Number(formData.bonus) - Number(formData.deduction);
      
      await api.addWage({
        ...formData,
        wagePerDay: Number(formData.wagePerDay),
        workDays: Number(formData.workDays),
        bonus: Number(formData.bonus),
        deduction: Number(formData.deduction),
        totalWage,
        ownerId,
        ownerName,
        labourName: labour ? labour.name : 'Unknown'
      });
      alert(t("Confirmed"));
      fetchData();
    } catch (err) {
      alert('Failed to add wage: ' + err.message);
    }
  };

  const markAsPaid = async (id) => {
    try {
      await api.updateWageStatus(id, 'paid');
      fetchData();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto flex gap-8">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Wallet className="text-emerald-600" size={32} />
            {t("wagesManagement")}
          </h1>
          <button onClick={() => navigate('/dashboard/owner')} className="text-emerald-600 font-semibold hover:underline">
            &larr; {t("back")}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {records.length === 0 ? <p className="p-8 text-center text-slate-500">{t("noWageRecords")}</p> : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-semibold text-slate-700">{t("labourName")}</th>
                  <th className="p-4 font-semibold text-slate-700">{t("totalWage")}</th>
                  <th className="p-4 font-semibold text-slate-700">{t("status")}</th>
                  <th className="p-4 font-semibold text-slate-700">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4 font-medium">{r.labourName}</td>
                    <td className="p-4 text-emerald-700 font-bold flex items-center"><IndianRupee size={16}/>{r.totalWage}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${r.paymentStatus?.toLowerCase() === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {r.paymentStatus?.toLowerCase() === 'paid' ? t("paid") : t("pending_val")}
                      </span>
                    </td>
                    <td className="p-4">
                      {r.paymentStatus?.toLowerCase() === 'pending' && (
                        <button onClick={() => markAsPaid(r.id)} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded font-bold">
                          {t("markPaid")}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="w-96">
        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 sticky top-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Users className="text-emerald-600" /> {t("logWages")}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">{t("selectLabour")}</label>
              <select required className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, labourId: e.target.value})}>
                <option value="">{t("selectLabour")}...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">{t("wagePerDay")}</label>
                <input type="number" required className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, wagePerDay: e.target.value})}/>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">{t("workDays")}</label>
                <input type="number" required className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, workDays: e.target.value})}/>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">{t("bonus")}</label>
                <input type="number" className="w-full p-3 border rounded-xl" placeholder="0" onChange={e => setFormData({...formData, bonus: e.target.value})}/>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">{t("deduction")}</label>
                <input type="number" className="w-full p-3 border rounded-xl" placeholder="0" onChange={e => setFormData({...formData, deduction: e.target.value})}/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">{t("paymentStatus")}</label>
              <select className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, paymentStatus: e.target.value})}>
                <option value="pending">{t("pending_val")}</option>
                <option value="paid">{t("paid")}</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl font-bold transition-all">{t("saveWageRecord")}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
