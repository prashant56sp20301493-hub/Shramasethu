import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { useTranslation } from 'react-i18next';
import { Star, ArrowLeft, MessageSquare, CheckCircle, Clock, AlertTriangle, XCircle, Search, Filter, RefreshCw, BarChart3, Users, CornerDownRight, Image } from 'lucide-react';

export default function AdminFeedback() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState({
    totalFeedback: 0,
    labourFeedback: 0,
    ownerFeedback: 0,
    pendingFeedback: 0,
    resolvedFeedback: 0,
    averageRating: 5.0
  });
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterRole, setFilterRole] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Selected for reply modal
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [newStatus, setNewStatus] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

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
      const [list, statsData] = await Promise.all([
        api.getFeedback(),
        api.getFeedbackStats()
      ]);
      setFeedback(list);
      setStats(statsData);
    } catch (err) {
      console.error(err);
      showToast('Error loading feedback data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleOpenReplyModal = (item) => {
    setSelectedFeedback(item);
    setReplyText(item.adminReply || '');
    setNewStatus(item.status);
  };

  const handleCloseReplyModal = () => {
    setSelectedFeedback(null);
    setReplyText('');
    setNewStatus('');
  };

  const handleSaveReply = async (e) => {
    e.preventDefault();
    if (!selectedFeedback) return;
    
    setSubmitting(true);
    try {
      await api.replyToFeedback(selectedFeedback.feedbackId, {
        adminReply: replyText,
        status: newStatus
      });
      showToast(t("Confirmed"));
      handleCloseReplyModal();
      fetchData();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error saving reply', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'submitted':
      case 'pending':
        return <Clock size={16} className="text-blue-400" />;
      case 'under review':
        return <AlertTriangle size={16} className="text-amber-400" />;
      case 'resolved':
      case 'approved':
        return <CheckCircle size={16} className="text-emerald-400" />;
      case 'rejected':
        return <XCircle size={16} className="text-rose-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'submitted':
      case 'pending':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">{t("pending_val")}</span>;
      case 'under review':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">{t("pending_val")}</span>;
      case 'resolved':
      case 'approved':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{t("Confirmed")}</span>;
      case 'rejected':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">{t("absent")}</span>;
      default:
        return null;
    }
  };

  // Filter programmatically to handle all options instantly
  const filteredFeedback = feedback.filter(item => {
    if (filterRole && item.userRole !== filterRole) return false;
    if (filterRating && item.rating !== Number(filterRating)) return false;
    if (filterStatus && item.status !== filterStatus) return false;
    if (filterCategory && item.category !== filterCategory) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-2xl border flex items-center gap-3 transition-all transform translate-y-0 ${toast.type === 'error' ? 'bg-slate-900 border-rose-500/40 text-rose-300' : 'bg-slate-900 border-emerald-500/40 text-emerald-300'}`}>
          {toast.type === 'error' ? <XCircle className="text-rose-500" /> : <CheckCircle className="text-emerald-500" />}
          <span className="font-bold text-sm">{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-slate-900/50 border-b border-slate-800/80 py-5 px-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboard/admin')} 
            className="p-2.5 rounded-xl hover:bg-slate-800 text-slate-400 transition-colors border border-slate-800/60"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              📝 {t("Admin")}: {t("manageFeedback")}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">{t("Subtitle")}</p>
          </div>
        </div>

        <button 
          onClick={fetchData} 
          className="flex items-center gap-2 border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
        >
          <RefreshCw size={16} /> {t("actions")}
        </button>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto p-8 flex flex-col gap-8">
        
        {/* KPI Widget Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-5">
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
            <Users size={20} className="text-blue-500 mb-3" />
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">{t("submitFeedback")}</span>
            <span className="text-2xl font-black text-white mt-1.5 block">{stats.totalFeedback}</span>
          </div>

          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
            <Users size={20} className="text-emerald-500 mb-3" />
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">{t("Labour")}</span>
            <span className="text-2xl font-black text-white mt-1.5 block">{stats.labourFeedback}</span>
          </div>

          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
            <Users size={20} className="text-violet-500 mb-3" />
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">{t("Owner")}</span>
            <span className="text-2xl font-black text-white mt-1.5 block">{stats.ownerFeedback}</span>
          </div>

          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
            <Clock size={20} className="text-blue-400 mb-3" />
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">{t("pending_val")}</span>
            <span className="text-2xl font-black text-white mt-1.5 block">{stats.pendingFeedback}</span>
          </div>

          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
            <CheckCircle size={20} className="text-emerald-400 mb-3" />
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">{t("Confirmed")}</span>
            <span className="text-2xl font-black text-white mt-1.5 block">{stats.resolvedFeedback}</span>
          </div>

          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
            <Star size={20} className="text-amber-500 mb-3" />
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">{t("rating")}</span>
            <span className="text-2xl font-black text-white mt-1.5 block">★ {stats.averageRating}</span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-850 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold">
            <Filter size={16} /> {t("SelectSkill")}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1 max-w-4xl">
            {/* Role filter */}
            <select 
              value={filterRole} 
              onChange={(e) => setFilterRole(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-300 focus:outline-none focus:border-emerald-500 text-xs font-semibold"
            >
              <option value="">{t("SelectSkill")}</option>
              <option value="labour">{t("Labour")}</option>
              <option value="owner">{t("Owner")}</option>
            </select>

            {/* Status filter */}
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-300 focus:outline-none focus:border-emerald-500 text-xs font-semibold"
            >
              <option value="">{t("status")}</option>
              <option value="Submitted">{t("pending_val")}</option>
              <option value="Under Review">{t("pending_val")}</option>
              <option value="Resolved">{t("Confirmed")}</option>
              <option value="Rejected">{t("absent")}</option>
            </select>

            {/* Rating filter */}
            <select 
              value={filterRating} 
              onChange={(e) => setFilterRating(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-300 focus:outline-none focus:border-emerald-500 text-xs font-semibold"
            >
              <option value="">{t("rating")}</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            {/* Category filter */}
            <input 
              type="text" 
              placeholder={t("selectCategory")}
              value={filterCategory} 
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-slate-300 focus:outline-none focus:border-emerald-500 text-xs font-semibold"
            />
          </div>
        </div>

        {/* Listing Workspace */}
        {loading ? (
          <div className="py-40 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : filteredFeedback.length === 0 ? (
          <div className="border-2 border-dashed border-slate-800 rounded-3xl p-24 flex flex-col items-center justify-center text-center gap-4 bg-slate-950">
            <MessageSquare className="text-slate-700 animate-pulse" size={56} />
            <p className="text-slate-400 font-bold text-lg">{t("noRecordsFound")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredFeedback.map((item) => (
              <div key={item.feedbackId} className="bg-slate-900/30 border border-slate-850 rounded-2xl p-6 hover:border-slate-800 transition-all flex flex-col gap-4 relative overflow-hidden group">
                {/* Glow bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.status?.toLowerCase() === 'resolved' ? 'bg-emerald-500' : item.status?.toLowerCase() === 'under review' ? 'bg-amber-500' : item.status?.toLowerCase() === 'rejected' ? 'bg-rose-500' : 'bg-blue-500'}`} />

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-white text-base leading-snug">{item.userName}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${item.userRole === 'owner' ? 'bg-violet-950/80 text-violet-300 border border-violet-850' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-850'}`}>
                        {item.userRole === 'owner' ? t("Owner") : t("Labour")}
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-850 px-2 py-0.5 rounded border border-slate-800">{item.category}</span>
                    </div>
                  </div>
                  {getStatusBadge(item.status)}
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={15} fill={star <= item.rating ? "#fbbf24" : "none"} className={star <= item.rating ? "text-amber-400" : "text-slate-800"} />
                  ))}
                </div>

                <p className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed bg-slate-950/45 p-4 rounded-xl border border-slate-900/60">{item.message}</p>

                {item.imageURL && (
                  <a href={item.imageURL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold self-start border border-emerald-950 bg-emerald-950/30 px-3.5 py-2 rounded-xl transition-all">
                    <Image size={14} /> Open Screenshot Attachment
                  </a>
                )}

                {/* Reply display */}
                {item.adminReply && (
                  <div className="border-t border-slate-850 pt-4 mt-1 flex items-start gap-3">
                    <CornerDownRight className="text-slate-600 shrink-0 mt-0.5" size={16} />
                    <div className="bg-slate-950/20 p-3 rounded-xl border border-slate-900 w-full">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{t("adminReply")}</span>
                      <p className="text-sm text-slate-400 mt-1 font-semibold leading-relaxed italic">{item.adminReply}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between gap-4 mt-auto border-t border-slate-850/60 pt-4">
                  <span className="text-[10px] text-slate-500 font-semibold">{new Date(item.createdAt).toLocaleDateString()} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  
                  <button 
                    onClick={() => handleOpenReplyModal(item)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-sm shadow-emerald-900/20 flex items-center gap-1.5"
                  >
                    <MessageSquare size={13} /> {item.adminReply ? t("adminReply") : t("markPaid")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply Modal Dialog */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-8 flex flex-col gap-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div>
              <h2 className="text-xl font-black text-white">{t("submitFeedback")}</h2>
              <p className="text-slate-400 text-xs mt-1">Review feedback and send an official response directly to {selectedFeedback.userName}.</p>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 text-slate-300 text-sm leading-relaxed max-h-32 overflow-y-auto">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">{t("message")}</span>
              {selectedFeedback.message}
            </div>

            <form onSubmit={handleSaveReply} className="space-y-5">
              {/* Status picker */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{t("status")}</label>
                <div className="grid grid-cols-4 gap-2">
                  {['Submitted', 'Under Review', 'Resolved', 'Rejected'].map((status) => (
                    <button
                      type="button"
                      key={status}
                      onClick={() => setNewStatus(status)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${newStatus === status ? 'bg-slate-950 text-white border-emerald-500' : 'bg-slate-950/40 text-slate-400 border-slate-800 hover:bg-slate-950'}`}
                    >
                      {getStatusIcon(status)}
                      {status === 'Submitted' || status === 'Under Review' ? t("pending_val") : status === 'Resolved' ? t("Confirmed") : t("absent")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reply message */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{t("message")}</label>
                <textarea
                  rows="4"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={t("placeholderMessage")}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all text-sm leading-relaxed"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-4 justify-end pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={handleCloseReplyModal}
                  className="px-5 py-3 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold transition-all"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-900/10 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : t("confirmApply")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
