import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import { Languages } from 'lucide-react';

const insuranceTranslations = {
  en: "Health Insurance",
  hi: "स्वास्थ्य बीमा",
  kn: "ಆರೋಗ್ಯ ವಿಮೆ",
  ta: "மருத்துவ காப்பீடு",
  te: "ఆరోగ్య భీమా",
  ml: "ആരോഗ്യ ഇൻഷುറൻസ്",
  mr: "आरोग्य विमा",
  bn: "স্বাস্থ্য বীমা",
  gu: "આરોગ્ય વીમો",
  pa: "ਸਿਹਤ ਬੀਮਾ"
};

const feedbackTranslations = {
  en: "Feedback & Rating",
  hi: "प्रतिक्रिया और रेटिंग",
  kn: "ಪ್ರತಿಕ್ರಿಯೆ ಮತ್ತು ರೇಟಿಂಗ್",
  ta: "கருத்து & மதிப்பீடு",
  te: "అభిప్రాయం & రేటింగ్",
  ml: "അഭിപ്രായവും റേറ്റിംഗും",
  mr: "प्रतिक्रिया आणि रेटिंग",
  bn: "মتابত ও রেটিং",
  gu: "પ્રતિસાદ અને રેટિંગ",
  pa: "ਫੀਡਬੈਕ ਅਤੇ ਰੇਟਿੰਗ"
};

const supportTranslations = {
  en: "AI Chat Support",
  hi: "एआई चैट सहायता",
  kn: "AI ಚಾಟ್ ಬೆಂಬಲ",
  ta: "AI அரட்டை ஆதரவு",
  te: "AI చాట్ సహాయం",
  ml: "AI ചാറ്റ് പിന്തുണ",
  mr: "एआय चॅट सपोर्ट",
  bn: "এআই চ্যাট সহায়তা",
  gu: "AI ચેટ સપોર્ટ",
  pa: "AI ਚੈਟ ਸਹਾਇਤਾ"
};

export default function LabourDashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('find');
  const [jobs, setJobs] = useState([]);
  const [acceptedJobs, setAcceptedJobs] = useState([]);

  const labourId = localStorage.getItem('uid');
  const labourName = localStorage.getItem('name') || 'Labour';

  useEffect(() => {
    if (!labourId) {
      navigate('/login');
      return;
    }
    fetchJobs();
  }, [labourId]);

  const fetchJobs = async () => {
    try {
      const allJobs = await api.getJobs();
      
      // Filter jobs: "find" tab shows jobs not accepted by current user
      const open = allJobs.filter(job => !(job.acceptedBy || []).includes(labourId));
      // "accepted" tab shows jobs accepted by current user
      const accepted = allJobs.filter(job => (job.acceptedBy || []).includes(labourId));

      setJobs(open);
      setAcceptedJobs(accepted);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  const handleAcceptJob = async (jobId) => {
    try {
      await api.acceptJob(jobId, labourId);
      alert(t("JobAcceptedSuccess") || 'Job offer accepted successfully!');
      fetchJobs();
    } catch (err) {
      alert((t("FailedToAccept") || 'Failed to accept job: ') + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-emerald-700 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold tracking-tight">
          ShramaSetu <span className="text-emerald-300 text-sm font-normal">{t("LabourPortal")}</span>
        </h1>
        <div className="flex items-center gap-4">
          {/* Header Language Selector */}
          <div className="flex items-center gap-1 bg-emerald-800 text-white px-2 py-1 rounded-lg border border-emerald-600/30 text-sm">
            <Languages size={16} className="text-emerald-300" />
            <select 
              className="bg-transparent outline-none text-xs font-semibold cursor-pointer text-emerald-100"
              onChange={(e) => {
                const newLng = e.target.value;
                i18n.changeLanguage(newLng);
                localStorage.setItem('i18nextLng', newLng);
              }}
              value={i18n.language}
            >
              <option value="en" className="text-slate-800">English</option>
              <option value="hi" className="text-slate-800">हिंदी</option>
              <option value="kn" className="text-slate-800">ಕನ್ನಡ</option>
              <option value="ta" className="text-slate-800">தமிழ்</option>
              <option value="te" className="text-slate-800">తెలుగు</option>
              <option value="ml" className="text-slate-800">മലയാളം</option>
              <option value="mr" className="text-slate-800">मराठी</option>
              <option value="bn" className="text-slate-800">বাংলা</option>
              <option value="gu" className="text-slate-800">ગુજરાતી</option>
              <option value="pa" className="text-slate-800">ਪੰਜਾਬੀ</option>
            </select>
          </div>
          <span className="text-emerald-100 font-medium hidden md:inline">🌾 {t("WelcomeUser", { name: labourName })}</span>
          <button onClick={handleLogout} className="bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow">{t("Logout")}</button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-2">
          <button onClick={() => setActiveTab('find')} className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'find' ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
            🔍 {t("FindJobs")}
          </button>
          <button onClick={() => setActiveTab('accepted')} className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'accepted' ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
            ✅ {t("MyWorks")}
          </button>
          <hr className="my-2 border-slate-200" />
          <button onClick={() => navigate('/labour/attendance')} className="w-full text-left px-4 py-3 rounded-xl font-semibold transition-all text-slate-600 hover:bg-slate-50">
            📅 {t("AttendanceTracking") || "Attendance"}
          </button>
          <button onClick={() => navigate('/labour/wages')} className="w-full text-left px-4 py-3 rounded-xl font-semibold transition-all text-slate-600 hover:bg-slate-50">
            💰 {t("WagesTracking") || "Wages"}
          </button>
          <hr className="my-2 border-slate-200" />
          <button onClick={() => navigate('/labour/insurance')} className="w-full text-left px-4 py-3 rounded-xl font-semibold transition-all text-slate-600 hover:bg-slate-50">
            🛡️ {insuranceTranslations[i18n.language] || "Health Insurance"}
          </button>
          <hr className="my-2 border-slate-200" />
          <button onClick={() => navigate('/labour/feedback')} className="w-full text-left px-4 py-3 rounded-xl font-semibold transition-all text-slate-600 hover:bg-slate-50">
            📝 {feedbackTranslations[i18n.language] || "Feedback & Rating"}
          </button>
          <button onClick={() => navigate('/labour/support')} className="w-full text-left px-4 py-3 rounded-xl font-semibold transition-all text-slate-600 hover:bg-slate-50">
            💬 {supportTranslations[i18n.language] || "AI Chat Support"}
          </button>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 p-8">
          {activeTab === 'find' && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">{t("AvailableJobs")}</h2>
              {jobs.length === 0 ? (
                <p className="text-slate-500 text-center py-8">{t("NoJobs")}</p>
              ) : (
                <div className="grid gap-4">
                  {jobs.map((job) => (
                    <div key={job.id} className="p-6 border border-slate-150 rounded-xl hover:shadow-md transition-all flex justify-between items-center bg-slate-50/50">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">{job.workType}</h3>
                        <p className="text-slate-500 text-sm mt-1">📍 {job.location} | 📅 {job.date}</p>
                        <p className="text-emerald-700 font-semibold text-sm mt-1">
                          💰 {t("Wage")}: {t("WagePerDay", { wage: job.wage })}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">{t("Owner")}: {job.ownerName}</p>
                      </div>
                      <button onClick={() => handleAcceptJob(job.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-50">
                        {t("AcceptJob")}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'accepted' && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">{t("MyWorks")}</h2>
              {acceptedJobs.length === 0 ? (
                <p className="text-slate-500 text-center py-8">{t("NoJobsPosted")}</p>
              ) : (
                <div className="grid gap-4">
                  {acceptedJobs.map((job) => (
                    <div key={job.id} className="p-6 border border-green-200 rounded-xl bg-emerald-50/30 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">{job.workType}</h3>
                        <p className="text-slate-500 text-sm mt-1">📍 {job.location} | 📅 {job.date}</p>
                        <p className="text-emerald-700 font-semibold text-sm mt-1">
                          💰 {t("Wage")}: {t("WagePerDay", { wage: job.wage })}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">{t("Owner")}: {job.ownerName}</p>
                      </div>
                      <div>
                        <span className="inline-block bg-emerald-100 text-emerald-800 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
                          {t("Confirmed")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
