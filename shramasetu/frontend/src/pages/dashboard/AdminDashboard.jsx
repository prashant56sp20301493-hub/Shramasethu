import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useTranslation } from 'react-i18next';
import { Users, Briefcase, Tractor, ShieldAlert, LayoutDashboard, LogOut, Activity, Calendar, Wallet, ShieldCheck, BarChart3, MessageSquare, LifeBuoy } from 'lucide-react';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ totalUsers: 0, totalJobs: 0, totalRentals: 0 });
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const adminId = localStorage.getItem('uid');
    const adminRole = localStorage.getItem('role');
    if (!adminId || adminRole !== 'admin') {
      navigate('/login');
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, jobsData] = await Promise.all([
        api.getStats(),
        api.getAdminUsers(),
        api.getJobs()
      ]);
      setStats(statsData);
      setUsers(usersData);
      setJobs(jobsData);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (uid) => {
    if (!confirm('Are you sure you want to delete this user profile?')) return;
    try {
      await api.deleteUser(uid);
      alert('User profile deleted successfully.');
      fetchData();
    } catch (err) {
      alert('Failed to delete user: ' + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

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
            <span className="text-emerald-500 text-xs font-bold uppercase tracking-wider">{t("Admin")}</span>
          </div>
        </div>

        <nav className="space-y-1.5 flex-1">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'overview' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
            <LayoutDashboard size={18} /> {t("overview")}
          </button>
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'users' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
            <Users size={18} /> {t("userManagement")}
          </button>
          <button onClick={() => setActiveTab('jobs')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === 'jobs' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
            <Briefcase size={18} /> {t("activeJobs")}
          </button>
          <button onClick={() => navigate('/admin/rental-companies')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-400 hover:bg-slate-900 hover:text-white">
            <Tractor size={18} /> {t("rentalsSystem")}
          </button>
          <div className="pt-4 mt-2 border-t border-slate-800"></div>
          <button onClick={() => navigate('/admin/attendance')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-400 hover:bg-slate-900 hover:text-white">
            <Calendar size={18} /> {t("globalAttendance")}
          </button>
          <button onClick={() => navigate('/admin/wages')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-400 hover:bg-slate-900 hover:text-white">
            <Wallet size={18} /> {t("globalWages")}
          </button>
          <div className="pt-4 mt-2 border-t border-slate-800"></div>
          <button onClick={() => navigate('/admin/insurance-providers')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-400 hover:bg-slate-900 hover:text-white">
            <ShieldCheck size={18} /> {t("healthInsuranceSystem")}
          </button>
          <button onClick={() => navigate('/admin/profits')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-400 hover:bg-slate-900 hover:text-white">
            <BarChart3 size={18} /> {t("profitsLedger")}
          </button>
          <div className="pt-4 mt-2 border-t border-slate-800"></div>
          <button onClick={() => navigate('/admin/feedback')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-400 hover:bg-slate-900 hover:text-white">
            <MessageSquare size={18} /> {t("manageFeedback")}
          </button>
          <button onClick={() => navigate('/admin/support-chats')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-all text-slate-400 hover:bg-slate-900 hover:text-white">
            <LifeBuoy size={18} /> {t("chatSupportMonitor")}
          </button>
        </nav>

        <button onClick={handleLogout} className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-rose-400 hover:bg-rose-950/30 transition-all border border-dashed border-rose-900/40">
          <LogOut size={18} /> {t("exitCommandCenter")}
        </button>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {activeTab === 'overview' && (
              <>
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight">{t("systemStatus")}</h2>
                  <p className="text-slate-400 mt-1">{t("realTimeStatistics")}</p>
                </div>

                {/* KPI Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 bg-emerald-600/5 rounded-full translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-300" />
                    <Users size={28} className="text-emerald-500 mb-4" />
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">{t("registeredUsers")}</span>
                    <span className="text-4xl font-black text-white mt-2 block">{stats.totalUsers}</span>
                  </div>
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 bg-sky-600/5 rounded-full translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-300" />
                    <Briefcase size={28} className="text-sky-500 mb-4" />
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">{t("activeJobs")}</span>
                    <span className="text-4xl font-black text-white mt-2 block">{stats.totalJobs}</span>
                  </div>
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 bg-amber-600/5 rounded-full translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-300" />
                    <Tractor size={28} className="text-amber-500 mb-4" />
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block">{t("equipmentRentals")}</span>
                    <span className="text-4xl font-black text-white mt-2 block">{stats.totalRentals}</span>
                  </div>
                </div>

                {/* Simulated Server/API Health Check */}
                <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2"><Activity size={18} className="text-emerald-500" /> {t("serverHealth")}</h3>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-extrabold rounded-full uppercase tracking-wider">{t("allSystems")}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm mt-4 border-t border-slate-800/60 pt-4">
                    <div className="text-slate-400">{t("firebaseFirestore")}: <span className="text-emerald-400 font-bold ml-1">{t("connected")}</span></div>
                    <div className="text-slate-400">{t("expressApi")}: <span className="text-emerald-400 font-bold ml-1">{t("online")}</span></div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'users' && (
              <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">{t("registeredUsers")}</h3>
                  <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">{users.length} {t("totalUsers") || "total"}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 uppercase text-xs font-extrabold tracking-wider border-b border-slate-800">
                        <th className="p-4">{t("Name")}</th>
                        <th className="p-4">{t("Email")}</th>
                        <th className="p-4">{t("MobileNumber")}</th>
                        <th className="p-4">{t("Role") || "Role"}</th>
                        <th className="p-4 text-right">{t("actions")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-slate-500">{t("noRecordsFound")}</td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="p-4 font-bold text-white">{user.name}</td>
                            <td className="p-4 text-slate-300">{user.email}</td>
                            <td className="p-4 text-slate-400">{user.mobileNumber || 'N/A'}</td>
                            <td className="p-4">
                              <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold tracking-wider uppercase ${user.role === 'owner' ? 'bg-sky-500/10 text-sky-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{t(user.role === 'owner' ? 'Owner' : 'Labour')}</span>
                            </td>
                            <td className="p-4 text-right">
                              <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 rounded-lg transition-colors inline-flex items-center gap-1.5 font-bold text-xs"><ShieldAlert size={14} /> {t("cancel")}</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'jobs' && (
              <div className="bg-slate-950 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                  <h3 className="text-xl font-bold text-white">{t("activeJobs")}</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-slate-400 uppercase text-xs font-extrabold tracking-wider border-b border-slate-800">
                        <th className="p-4">{t("WorkType")}</th>
                        <th className="p-4">{t("Location")}</th>
                        <th className="p-4">{t("Owner")}</th>
                        <th className="p-4">{t("DailyWage")}</th>
                        <th className="p-4">{t("status")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {jobs.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-8 text-center text-slate-500">{t("noRecordsFound")}</td>
                        </tr>
                      ) : (
                        jobs.map((job) => (
                          <tr key={job.id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="p-4 font-bold text-white">{job.workType}</td>
                            <td className="p-4 text-slate-300">📍 {job.location}</td>
                            <td className="p-4 text-slate-400">{job.ownerName}</td>
                            <td className="p-4 font-semibold text-emerald-400">₹{job.wage}/{t("DailyWage").includes("day") || t("DailyWage").includes("दिन") || t("DailyWage").includes("ದಿನ") ? "" : "day"}</td>
                            <td className="p-4">
                              <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${job.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{t(job.status === 'pending' ? 'Pending' : 'Active')}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
