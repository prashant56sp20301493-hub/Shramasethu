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
  bn: "स्वास्थ्य बीमा",
  gu: "આરોગ્ય વીમો",
  pa: "ਸਿਹਤ ਬੀਮਾ"
};

const feedbackTranslations = {
  en: "Feedback & Rating",
  hi: "प्रतिक्रिया और रेटिंग",
  kn: "ಪ್ರತಿಕ್ರಿಯೆ ಮತ್ತು ರೇಟಿಂಗ್",
  ta: "கருத்து & மதிப்பீடு",
  te: "అభిప్రాయం & రేటింగ్",
  ml: "അభిപ്രായവും റേറ്റിംഗും",
  mr: "प्रतिक्रिया आणि रेटिंग",
  bn: "মতামত ও রেটিং",
  gu: "પ્રતિસાદ અને રેટિંગ",
  pa: "ਫੀڈਬੈਕ ਅਤੇ ਰੇਟਿੰਗ"
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

export default function OwnerDashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('hire');
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({
    workType: '',
    location: '',
    labourersRequired: '',
    wage: '',
    date: '',
    skillRequired: 'Unskilled'
  });

  const ownerId = localStorage.getItem('uid');
  const ownerName = localStorage.getItem('name') || 'Owner';

  useEffect(() => {
    if (!ownerId) {
      navigate('/login');
      return;
    }
    fetchJobs();
  }, [ownerId]);

  const fetchJobs = async () => {
    try {
      const data = await api.getOwnerJobs(ownerId);
      setJobs(data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.postJob({
        ...formData,
        ownerId,
        ownerName,
        labourersRequired: Number(formData.labourersRequired),
        wage: Number(formData.wage),
      });
      alert(t("PostJobSuccess") || 'Job posted successfully!');
      setFormData({
        workType: '',
        location: '',
        labourersRequired: '',
        wage: '',
        date: '',
        skillRequired: 'Unskilled'
      });
      fetchJobs();
    } catch (err) {
      alert((t("FailedToPostJob") || 'Failed to post job: ') + err.message);
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
          ShramaSetu <span className="text-emerald-300 text-sm font-normal">{t("OwnerPortal")}</span>
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
          <span className="text-emerald-100 font-medium hidden md:inline">🌿 {t("WelcomeUser", { name: ownerName })}</span>
          <button onClick={handleLogout} className="bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow">{t("Logout")}</button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col gap-2">
          <button onClick={() => setActiveTab('hire')} className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'hire' ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
            🌾 {t("HireLabour")}
          </button>
          <button onClick={() => setActiveTab('manage')} className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all ${activeTab === 'manage' ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
            📋 {t("ManageJobs")}
          </button>
          <button onClick={() => navigate('/owner/marketplace')} className="w-full text-left px-4 py-3 rounded-xl font-semibold transition-all text-slate-600 hover:bg-slate-50">
            🚜 {t("RentalMarketplace")}
          </button>
          <hr className="my-2 border-slate-200" />
          <button onClick={() => navigate('/owner/attendance')} className="w-full text-left px-4 py-3 rounded-xl font-semibold transition-all text-slate-600 hover:bg-slate-50">
            📋 {t("AttendanceManagement") || "Attendance"}
          </button>
          <button onClick={() => navigate('/owner/wages')} className="w-full text-left px-4 py-3 rounded-xl font-semibold transition-all text-slate-600 hover:bg-slate-50">
            💵 {t("WagesManagement") || "Wages"}
          </button>
          <hr className="my-2 border-slate-200" />
          <button onClick={() => navigate('/owner/insurance')} className="w-full text-left px-4 py-3 rounded-xl font-semibold transition-all text-slate-600 hover:bg-slate-50">
            🛡️ {insuranceTranslations[i18n.language] || "Health Insurance"}
          </button>
          <hr className="my-2 border-slate-200" />
          <button onClick={() => navigate('/owner/feedback')} className="w-full text-left px-4 py-3 rounded-xl font-semibold transition-all text-slate-600 hover:bg-slate-50">
            📝 {feedbackTranslations[i18n.language] || "Feedback & Rating"}
          </button>
          <button onClick={() => navigate('/owner/support')} className="w-full text-left px-4 py-3 rounded-xl font-semibold transition-all text-slate-600 hover:bg-slate-50">
            💬 {supportTranslations[i18n.language] || "AI Chat Support"}
          </button>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 p-8">
          {activeTab === 'hire' && (
            <div className="max-w-xl bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">{t("PostJob")}</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">{t("WorkType")}</label>
                  <input type="text" name="workType" value={formData.workType} placeholder="e.g. Coffee Harvesting, Weeding" required className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-2">{t("Location")}</label>
                  <input type="text" name="location" value={formData.location} placeholder="e.g. Chikmagalur, Karnataka" required className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={handleChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2">{t("LabourersNeeded")}</label>
                    <input type="number" name="labourersRequired" value={formData.labourersRequired} placeholder="e.g. 5" required className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2">{t("DailyWage")}</label>
                    <input type="number" name="wage" value={formData.wage} placeholder="e.g. 450" required className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" onChange={handleChange} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2">{t("Date")}</label>
                    <input type="date" name="date" value={formData.date} required className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-600" onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-600 mb-2">{t("SkillLevel")}</label>
                    <select name="skillRequired" value={formData.skillRequired} className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-700" onChange={handleChange}>
                      <option value="Skilled">{t("Skilled")}</option>
                      <option value="Unskilled">{t("Unskilled")}</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-xl font-bold transition-all shadow-md shadow-emerald-100 mt-2">
                  {t("SubmitJob")}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">{t("YourPostedJobs")}</h2>
              {jobs.length === 0 ? (
                <p className="text-slate-500 text-center py-8">{t("NoJobsPosted")}</p>
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
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${job.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {job.status === 'pending' ? t("Pending") : t("Active")}
                        </span>
                        <p className="text-slate-500 text-xs mt-2">
                          {t("AcceptedBy")}: <span className="font-semibold text-slate-700">{t("LabourersCount", { count: (job.acceptedBy || []).length })}</span>
                        </p>
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
