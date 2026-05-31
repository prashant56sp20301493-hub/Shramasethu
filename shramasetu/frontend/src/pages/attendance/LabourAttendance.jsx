import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function LabourAttendance() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const uid = localStorage.getItem('uid');

  useEffect(() => {
    if (!uid) {
      navigate('/login');
      return;
    }
    fetchAttendance();
  }, [uid]);

  const fetchAttendance = async () => {
    try {
      const data = await api.getAttendance({ labourId: uid });
      setRecords(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Calendar className="text-emerald-600" size={32} />
          {t("attendanceTracking")}
        </h1>
        <button onClick={() => navigate('/dashboard/labour')} className="text-emerald-600 font-semibold hover:underline">
          &larr; {t("backToDashboard")}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {records.length === 0 ? (
          <p className="p-8 text-center text-slate-500">{t("noRecordsFound")}</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-semibold text-slate-700">{t("Date")}</th>
                <th className="p-4 font-semibold text-slate-700">{t("Owner")}</th>
                <th className="p-4 font-semibold text-slate-700">{t("WorkType")}</th>
                <th className="p-4 font-semibold text-slate-700">{t("status")}</th>
              </tr>
            </thead>
            <tbody>
              {records.map(record => (
                <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="p-4 text-slate-800">{record.date}</td>
                  <td className="p-4 text-slate-600">{record.ownerName}</td>
                  <td className="p-4 text-slate-600">{record.workType}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold
                      ${record.status?.toLowerCase() === 'present' ? 'bg-emerald-100 text-emerald-800' : 
                        record.status?.toLowerCase() === 'absent' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                      {record.status?.toLowerCase() === 'present' && <CheckCircle size={14} />}
                      {record.status?.toLowerCase() === 'absent' && <XCircle size={14} />}
                      {record.status?.toLowerCase() === 'pending' && <Clock size={14} />}
                      {record.status?.toLowerCase() === 'present' ? t("present") : record.status?.toLowerCase() === 'absent' ? t("absent") : t("pending_val")}
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
