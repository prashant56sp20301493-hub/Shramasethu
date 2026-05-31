import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Tractor, Users, ShieldCheck, Sprout, Handshake, Languages } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी' },
  { code: 'kn', name: 'ಕನ್ನಡ' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'ml', name: 'മലയാളം' },
  { code: 'mr', name: 'मराठी' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'gu', name: 'ગુજરાતી' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ' },
];

export default function Landing() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-200">
      {/* Navbar */}
      <nav className="w-full px-6 py-4 flex justify-between items-center bg-white/70 backdrop-blur-md fixed top-0 z-50 border-b border-slate-200/50">
        <div className="flex items-center gap-2 text-emerald-700">
          <Sprout size={32} strokeWidth={2.5} />
          <span className="text-2xl font-extrabold tracking-tight">ShramaSetu</span>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <Languages size={18} className="text-slate-500" />
          <select 
            className="bg-transparent outline-none text-sm font-medium text-slate-700 cursor-pointer"
            onChange={(e) => {
              const newLng = e.target.value;
              i18n.changeLanguage(newLng);
              localStorage.setItem('i18nextLng', newLng);
            }}
            value={i18n.language}
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {t("PlatformLive")}
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-8 leading-tight tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-400">
              {t("Empowering")}
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto font-medium">
            {t("Subtitle")}
          </p>
        </motion.div>

        {/* Roles Section */}
        <div className="w-full mt-8" id="roles">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <RoleCard 
              title={t("Labour")}
              description={t("LabourDesc")}
              icon={<Users size={48} className="text-emerald-500" />}
              onClick={() => navigate('/register/labour')} 
              delay={0.1}
              buttonText={t("LoginRegister")}
            />
            <RoleCard 
              title={t("Owner")}
              description={t("OwnerDesc")}
              icon={<Tractor size={48} className="text-emerald-500" />}
              onClick={() => navigate('/register/owner')} 
              delay={0.2}
              buttonText={t("LoginRegister")}
            />
            <RoleCard 
              title={t("Admin")}
              description={t("AdminDesc")}
              icon={<ShieldCheck size={48} className="text-emerald-500" />}
              onClick={() => navigate('/register/admin')} 
              delay={0.3}
              buttonText={t("LoginRegister")}
            />
          </div>
        </div>
      </main>

      {/* Features Showcase */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-16">{t("WhyChoose")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureItem 
              icon={<Handshake size={32} className="text-white" />}
              title={t("SmartJobMatching")}
              desc={t("SmartJobMatchingDesc")}
            />
            <FeatureItem 
              icon={<Tractor size={32} className="text-white" />}
              title={t("RentalMarketplace")}
              desc={t("RentalMarketplaceDesc")}
            />
            <FeatureItem 
              icon={<Languages size={32} className="text-white" />}
              title={t("MultilingualSupport")}
              desc={t("MultilingualSupportDesc")}
            />
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm">
        <p>© 2026 ShramaSetu Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}

function RoleCard({ title, description, icon, onClick, delay, buttonText }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-3xl p-8 flex flex-col items-center text-center cursor-pointer border border-slate-200 shadow-xl shadow-emerald-900/5 hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-900/10 transition-all duration-300 group"
      onClick={onClick}
    >
      <div className="h-24 w-24 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed min-h-[80px]">
        {description}
      </p>
      <div className="mt-8 text-emerald-600 font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
        {buttonText} <span aria-hidden="true">&rarr;</span>
      </div>
    </motion.div>
  );
}

function FeatureItem({ icon, title, desc }) {
  return (
    <div className="flex flex-col items-center">
      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
        {icon}
      </div>
      <h4 className="text-xl font-bold text-slate-900 mb-2">{title}</h4>
      <p className="text-slate-600">{desc}</p>
    </div>
  );
}
