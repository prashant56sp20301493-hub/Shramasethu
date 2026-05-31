import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Wallet, Search, IndianRupee } from 'lucide-react';

export default function AdminWages() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchWages();
  }, []);

  const fetchWages = async () => {
    try {
      const data = await api.getWages({});
      setRecords(data);
    } catch (err) {
      console.error(err);
    }
  };

  const markAsPaid = async (id) => {
    try {
      await api.updateWageStatus(id, 'paid');
      fetchWages();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const filteredRecords = records.filter(r => 
    r.labourName?.toLowerCase().includes(filter.toLowerCase()) || 
    r.ownerName?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Wallet className="text-emerald-600" size={32} />
          {t("Admin")}: {t("wagesManagement")}
        </h1>
        <button onClick={() => navigate('/dashboard/admin')} className="text-emerald-600 font-semibold hover:underline">
          &larr; {t("backToDashboard")}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={t("selectLabour") + " / " + t("Owner")} 
              className="w-full pl-10 p-2 rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <p className="p-8 text-center text-slate-500">{t("noRecordsFound")}</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-semibold text-slate-700">{t("Date")}</th>
                <th className="p-4 font-semibold text-slate-700">{t("labourName")}</th>
                <th className="p-4 font-semibold text-slate-700">{t("Owner")}</th>
                <th className="p-4 font-semibold text-slate-700">{t("totalWage")}</th>
                <th className="p-4 font-semibold text-slate-700">{t("status")}</th>
                <th className="p-4 font-semibold text-slate-700">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(record => (
                <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 text-slate-800">{new Date(record.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 font-medium text-slate-800">{record.labourName}</td>
                  <td className="p-4 text-slate-600">{record.ownerName}</td>
                  <td className="p-4 text-emerald-700 font-bold flex items-center"><IndianRupee size={16}/>{record.totalWage}</td>
                  <td className="p-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold
                      ${record.paymentStatus?.toLowerCase() === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {record.paymentStatus?.toLowerCase() === 'paid' ? t("paid") : t("pending_val")}
                    </span>
                  </td>
                  <td className="p-4">
                    {record.paymentStatus?.toLowerCase() === 'pending' && (
                      <button onClick={() => markAsPaid(record.id)} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded font-bold shadow-sm">
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
  );
}
