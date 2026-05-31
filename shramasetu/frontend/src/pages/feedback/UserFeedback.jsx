import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useTranslation } from 'react-i18next';
import { Star, FileText, ArrowLeft, Send, Image, MessageSquare, CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';

export default function UserFeedback() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const userId = localStorage.getItem('uid');
  const userName = localStorage.getItem('name') || 'User';
  const userRole = localStorage.getItem('role'); // 'labour' or 'owner'
  
  const [category, setCategory] = useState('');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [imageURL, setImageURL] = useState('');
  
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Dynamic roles category maps using standard translation keys!
  const categories = {
    labour: [
      { value: 'Work', key: 'WorkType' },
      { value: 'Wages', key: 'wagesManagement' },
      { value: 'Attendance', key: 'attendanceTracking' },
      { value: 'Insurance', key: 'healthInsurance' },
      { value: 'Owner', key: 'Owner' },
      { value: 'AppIssues', key: 'support' },
      { value: 'Other', key: 'actions' }
    ],
    owner: [
      { value: 'Labour', key: 'Labour' },
      { value: 'Attendance', key: 'attendanceManagement' },
      { value: 'Wages', key: 'wagesManagement' },
      { value: 'Rental', key: 'rentalSystem' },
      { value: 'Insurance', key: 'healthInsurance' },
      { value: 'AppIssues', key: 'support' },
      { value: 'Admin', key: 'Admin' }
    ]
  };

  useEffect(() => {
    if (!userId || (userRole !== 'labour' && userRole !== 'owner')) {
      navigate('/login');
      return;
    }
    // Set default category
    const list = categories[userRole] || [];
    if (list.length > 0) setCategory(list[0].value);
    
    fetchHistory();
  }, [userId, userRole]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.getFeedback({ userId });
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setHistory(data);
    } catch (err) {
      console.error(err);
      showToast('Error loading feedback history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category) return showToast('Please select a category', 'error');
    if (!message.trim()) return showToast('Please write a message', 'error');

    setSubmitting(true);
    try {
      await api.submitFeedback({
        userId,
        userName,
        userRole,
        category,
        rating,
        message,
        imageURL
      });
      showToast(t("Confirmed"));
      setMessage('');
      setImageURL('');
      setRating(5);
      fetchHistory();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Submission failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'submitted':
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock size={12} /> {t("pending_val")}
          </span>
        );
      case 'under review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle size={12} /> {t("pending_val")}
          </span>
        );
      case 'resolved':
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle size={12} /> {t("Confirmed")}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={12} /> {t("absent")}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200">
            {t("status")}
          </span>
        );
    }
  };

  const getCategoryLabel = (val) => {
    const list = categories[userRole] || [];
    const item = list.find(c => c.value === val);
    return item ? t(item.key) : val;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-lg border flex items-center gap-3 transition-all transform translate-y-0 animate-bounce ${toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          {toast.type === 'error' ? <XCircle className="text-rose-600" /> : <CheckCircle className="text-emerald-600" />}
          <span className="font-semibold text-sm">{toast.msg}</span>
        </div>
      )}

      {/* Top Glassmorphic Navigation Bar */}
      <header className="bg-white border-b border-slate-200 py-5 px-8 sticky top-0 z-30 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(userRole === 'owner' ? '/dashboard/owner' : '/dashboard/labour')} 
            className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors border border-slate-200/60"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              📝 {t("submitFeedback")}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">{userName} • {userRole === 'owner' ? t("Owner") : t("Labour")}</p>
          </div>
        </div>
      </header>

      {/* Split Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Submit Form */}
        <div className="lg:col-span-5 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm self-start flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{t("submitFeedback")}</h2>
            <p className="text-slate-500 text-sm mt-1">{t("formDesc")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Category Select */}
            <div>
              <label className="block text-xs font-bold text-slate-660 uppercase tracking-wider mb-2">{t("selectCategory")}</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium transition-all"
              >
                {(categories[userRole] || []).map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {t(cat.key)}
                  </option>
                ))}
              </select>
            </div>

            {/* Star Rating */}
            <div>
              <label className="block text-xs font-bold text-slate-660 uppercase tracking-wider mb-2">{t("rating")}</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    type="button" 
                    key={star} 
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star size={28} fill={star <= rating ? "#fbbf24" : "none"} className={star <= rating ? "text-amber-400" : "text-slate-300"} />
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback Message */}
            <div>
              <label className="block text-xs font-bold text-slate-660 uppercase tracking-wider mb-2">{t("message")}</label>
              <textarea 
                rows="4"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t("placeholderMessage")}
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm leading-relaxed"
              />
            </div>

            {/* Image link URL */}
            <div>
              <label className="block text-xs font-bold text-slate-660 uppercase tracking-wider mb-2">{t("imageURL")}</label>
              <div className="relative">
                <input 
                  type="text"
                  value={imageURL}
                  onChange={(e) => setImageURL(e.target.value)}
                  placeholder={t("placeholderImage")}
                  className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-11 pr-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                />
                <Image className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
              </div>
            </div>

            {/* Submit button */}
            <button 
              type="submit" 
              disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm shadow-emerald-600/10 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <Send size={16} />
              {submitting ? 'Submitting...' : t("submitFeedback")}
            </button>
          </form>
        </div>

        {/* Right Side: History & Status Tracker */}
        <div className="lg:col-span-7 bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">{t("historyTitle")}</h2>
            <p className="text-slate-500 text-sm mt-1">Track reviews status and view administrator responses.</p>
          </div>

          {loading ? (
            <div className="py-20 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-16 flex flex-col items-center justify-center text-center gap-4">
              <FileText className="text-slate-300" size={48} />
              <p className="text-slate-500 font-semibold">{t("noFeedback")}</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[580px] overflow-y-auto pr-2">
              {history.map((item) => (
                <div key={item.feedbackId} className="border border-slate-100 rounded-xl p-5 hover:border-slate-200 transition-colors flex flex-col gap-4 bg-slate-50/50">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        {getCategoryLabel(item.category)}
                      </span>
                      <div className="flex items-center gap-1 mt-2.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} size={15} fill={star <= item.rating ? "#fbbf24" : "none"} className={star <= item.rating ? "text-amber-400" : "text-slate-200"} />
                        ))}
                      </div>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>

                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{item.message}</p>
                  
                  {/* Optional uploaded image */}
                  {item.imageURL && (
                    <a href={item.imageURL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-bold self-start border border-emerald-100 rounded-lg px-3 py-1.5 hover:bg-emerald-50/30 transition-all">
                      <Image size={14} /> View Attached Screenshot
                    </a>
                  )}

                  {/* Admin Reply */}
                  {item.adminReply && (
                    <div className="border-t border-slate-100 pt-3 mt-1 flex items-start gap-2.5">
                      <MessageSquare className="text-slate-400 mt-0.5 shrink-0" size={16} />
                      <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">{t("adminReply")}</span>
                        <p className="text-sm text-slate-600 mt-1 font-medium leading-relaxed italic">{item.adminReply}</p>
                      </div>
                    </div>
                  )}

                  <span className="text-[10px] text-slate-400 self-end mt-1">
                    {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
