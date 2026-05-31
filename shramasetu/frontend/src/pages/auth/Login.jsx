import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../../api';
import { motion } from 'framer-motion';
import { Languages } from 'lucide-react';

export default function Login() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Direct call to our Backend Auth endpoint
      const userData = await api.login(formData.email, formData.password);

      localStorage.setItem('uid', userData.uid);
      localStorage.setItem('role', userData.role);
      localStorage.setItem('name', userData.name);

      if (userData.role === 'admin') navigate('/dashboard/admin');
      else if (userData.role === 'owner') navigate('/dashboard/owner');
      else if (userData.role === 'labour') navigate('/dashboard/labour');

    } catch (err) {
      setError(err.message || t("invalidCredentials"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-6 relative">
      {/* Floating Language Selector */}
      <div className="absolute top-6 right-6 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm hover:shadow-md transition-all">
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
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
          <option value="kn">ಕನ್ನಡ</option>
          <option value="ta">தமிழ்</option>
          <option value="te">తెలుగు</option>
          <option value="ml">മലയാളം</option>
          <option value="mr">मराठी</option>
          <option value="bn">বাংলা</option>
          <option value="gu">ગુજરાતી</option>
          <option value="pa">ਪੰਜਾਬੀ</option>
        </select>
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-green-700 mb-6">{t("Login")}</h2>
        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="email" name="email" placeholder={t("Email")} required className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-green-500" onChange={handleChange} />
          <input type="password" name="password" placeholder={t("Password")} required className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-green-500" onChange={handleChange} />

          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white p-3 rounded font-bold hover:bg-green-700 transition-colors disabled:opacity-60">
            {loading ? t("LoggingIn") : t("Login")}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          {t("DontHaveAccount")} <Link to="/" className="text-green-600 hover:underline">{t("RegisterHere")}</Link>
        </p>
      </motion.div>
    </div>
  );
}
