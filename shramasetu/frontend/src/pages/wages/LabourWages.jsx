import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Wallet, IndianRupee, Clock, CheckCircle } from 'lucide-react';

export default function LabourWages() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const uid = localStorage.getItem('uid');

  useEffect(() => {
    if (!uid) {
      navigate('/login');
      return;
    }
    fetchWages();
  }, [uid]);

  const fetchWages = async () => {
    try {
      const data = await api.getWages({ labourId: uid });
      setRecords(data);
    } catch (err) {
      console.error(err);
    }
  };

  const totalEarned = records.filter(r => r.paymentStatus?.toLowerCase() === 'paid').reduce((acc, curr) => acc + curr.totalWage, 0);
  const totalPending = records.filter(r => r.paymentStatus?.toLowerCase() === 'pending').reduce((acc, curr) => acc + curr.totalWage, 0);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Wallet className="text-emerald-600" size={32} />
          {t("wagesManagement")}
        </h1>
        <button onClick={() => navigate('/dashboard/labour')} className="text-emerald-600 font-semibold hover:underline">
          &larr; {t("backToDashboard")}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-emerald-600 text-white rounded-2xl p-6 shadow-lg flex items-center gap-4">
          <div className="bg-emerald-500/50 p-4 rounded-xl"><CheckCircle size={32} /></div>
          <div>
            <p className="text-emerald-100 font-medium">{t("paid")} {t("totalWage")}</p>
            <h2 className="text-3xl font-bold flex items-center"><IndianRupee size={28} /> {totalEarned}</h2>
          </div>
        </div>
        <div className="bg-amber-500 text-white rounded-2xl p-6 shadow-lg flex items-center gap-4">
          <div className="bg-amber-400/50 p-4 rounded-xl"><Clock size={32} /></div>
          <div>
            <p className="text-amber-100 font-medium">{t("pending_val")} {t("totalWage")}</p>
            <h2 className="text-3xl font-bold flex items-center"><IndianRupee size={28} /> {totalPending}</h2>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {records.length === 0 ? (
          <p className="p-8 text-center text-slate-500">{t("noWageRecords")}</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-semibold text-slate-700">{t("Date")}</th>
                <th className="p-4 font-semibold text-slate-700">{t("Owner")}</th>
                <th className="p-4 font-semibold text-slate-700">{t("workDays")}</th>
                <th className="p-4 font-semibold text-slate-700">{t("totalWage")}</th>
                <th className="p-4 font-semibold text-slate-700">{t("status")}</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 text-slate-800">{new Date(record.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-slate-600">{record.ownerName}</td>
                  <td className="p-4 text-slate-600">{record.workDays}</td>
                  <td className="p-4 font-bold text-emerald-700 flex items-center"><IndianRupee size={16} />{record.totalWage}</td>
                  <td className="p-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold
                      ${record.paymentStatus?.toLowerCase() === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {record.paymentStatus?.toLowerCase() === 'paid' ? t("paid") : t("pending_val")}
                    </span>
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
