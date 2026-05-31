import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { api } from '../../api';
import { Languages } from 'lucide-react';

export default function Register() {
  const { t, i18n } = useTranslation();
  const { role } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', mobileNumber: '', age: '', address: '', skillStatus: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.register({ ...formData, role });
      alert(t("registrationSuccess"));
      navigate('/login');
    } catch (err) {
      setError(err.message);
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
        <h2 className="text-3xl font-bold text-center text-green-700 mb-6 capitalize">
          {role === 'labour' ? t("Labour") : role === 'owner' ? t("Owner") : t("Admin")} {t("Register")}
        </h2>
        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="name" placeholder={t("Name")} required className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-green-500" onChange={handleChange} />
          <input type="email" name="email" placeholder={t("GmailId")} required className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-green-500" onChange={handleChange} />
          <input type="password" name="password" placeholder={t("PasswordMin")} required minLength={6} className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-green-500" onChange={handleChange} />
          <input type="text" name="mobileNumber" placeholder={t("MobileNumber")} required className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-green-500" onChange={handleChange} />
          <input type="number" name="age" placeholder={t("Age")} required className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-green-500" onChange={handleChange} />
          <textarea name="address" placeholder={t("Address")} required className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-green-500" onChange={handleChange}></textarea>
          
          {role === 'labour' && (
            <select name="skillStatus" required className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-green-500" onChange={handleChange}>
              <option value="">{t("SelectSkill")}</option>
              <option value="Skilled">{t("Skilled")}</option>
              <option value="Unskilled">{t("Unskilled")}</option>
            </select>
          )}

          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white p-3 rounded font-bold hover:bg-green-700 transition-colors disabled:opacity-60">
            {loading ? t("Registering") : t("Register")}
          </button>
        </form>
        <p className="mt-4 text-center text-gray-600">
          {t("AlreadyRegistered")} <Link to="/login" className="text-green-600 hover:underline">{t("LoginHere")}</Link>
        </p>
      </motion.div>
    </div>
  );
}
