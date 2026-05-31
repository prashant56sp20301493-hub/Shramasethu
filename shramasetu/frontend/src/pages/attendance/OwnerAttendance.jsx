import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Calendar, Users } from 'lucide-react';

export default function OwnerAttendance() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    labourId: '',
    date: '',
    workType: '',
    status: 'present',
    plantationAddress: ''
  });

  const ownerId = localStorage.getItem('uid');
  const ownerName = localStorage.getItem('name');

  useEffect(() => {
    if (!ownerId) return navigate('/login');
    fetchData();
  }, [ownerId]);

  const fetchData = async () => {
    try {
      const [attData, usersData, jobsData] = await Promise.all([
        api.getAttendance({ ownerId }),
        api.getAdminUsers(), 
        api.getOwnerJobs(ownerId) 
      ]);
      setRecords(attData);

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
      await api.markAttendance({
        ...formData,
        ownerId,
        ownerName,
        labourName: labour ? labour.name : 'Unknown'
      });
      alert(t("Confirmed"));
      fetchData();
    } catch (err) {
      alert('Failed to mark attendance: ' + err.message);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto flex gap-8">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Calendar className="text-emerald-600" size={32} />
            {t("attendanceManagement")}
          </h1>
          <button onClick={() => navigate('/dashboard/owner')} className="text-emerald-600 font-semibold hover:underline">
            &larr; {t("back")}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {records.length === 0 ? <p className="p-8 text-center text-slate-500">{t("noRecordsFound")}</p> : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-semibold text-slate-700">{t("Date")}</th>
                  <th className="p-4 font-semibold text-slate-700">{t("labourName")}</th>
                  <th className="p-4 font-semibold text-slate-700">{t("status")}</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="p-4">{r.date}</td>
                    <td className="p-4 font-medium">{r.labourName}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${r.status?.toLowerCase() === 'present' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {r.status?.toLowerCase() === 'present' ? t("present") : t("absent")}
                      </span>
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
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Users className="text-emerald-600" /> {t("markAttendance")}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">{t("selectLabour")}</label>
              <select required className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, labourId: e.target.value})}>
                <option value="">{t("selectLabour")}...</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">{t("Date")}</label>
              <input type="date" required className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, date: e.target.value})}/>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">{t("status")}</label>
              <select className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="present">{t("present")}</option>
                <option value="absent">{t("absent")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">{t("WorkType")}</label>
              <input type="text" className="w-full p-3 border rounded-xl" placeholder="e.g. Harvesting" onChange={e => setFormData({...formData, workType: e.target.value})}/>
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl font-bold transition-all">{t("saveAttendance")}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
