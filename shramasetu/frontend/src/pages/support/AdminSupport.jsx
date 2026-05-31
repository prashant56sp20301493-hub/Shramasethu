import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { ArrowLeft, LifeBuoy, Clock, CheckCircle, ShieldAlert, CornerDownRight, MessageSquare, Send, RefreshCw, XCircle, User, MessageCircle } from 'lucide-react';

export default function AdminSupport() {
  const navigate = useNavigate();
  const [escalations, setEscalations] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  
  const [loading, setLoading] = useState(true);
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
      const data = await api.getSupportEscalations();
      setEscalations(data);
      // Auto select first pending ticket if nothing is selected yet
      if (data.length > 0 && !selectedTicket) {
        setSelectedTicket(data[0]);
        setReplyText(data[0].adminReply || '');
      }
    } catch (err) {
      console.error(err);
      showToast('Error fetching escalations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    setReplyText(ticket.adminReply || '');
  };

  const handleResolveTicket = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    if (!replyText.trim()) return showToast('Please write a reply message to resolve', 'error');

    setSubmitting(true);
    try {
      await api.replyToSupportEscalation(selectedTicket.escalationId, {
        adminReply: replyText,
        status: 'Resolved'
      });
      showToast('Human support case replied and resolved successfully!');
      
      // Update selected ticket state locally to show immediate changes
      setSelectedTicket(prev => ({
        ...prev,
        adminReply: replyText,
        status: 'Resolved',
        resolvedAt: new Date().toISOString()
      }));

      fetchData();
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Error updating escalation ticket', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Stats calculate
  const totalCases = escalations.length;
  const pendingCases = escalations.filter(e => e.status === 'Pending').length;
  const resolvedCases = escalations.filter(e => e.status === 'Resolved').length;

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
              💬 Human Support escalations
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">Solve user complaints escalated from multilingual AI support bot</p>
          </div>
        </div>

        <button 
          onClick={fetchData} 
          className="flex items-center gap-2 border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
        >
          <RefreshCw size={16} /> Sync Tickets
        </button>
      </header>

      {/* Main Split Layout Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-8 flex flex-col gap-8">
        
        {/* KPI stats bar */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
            <LifeBuoy size={20} className="text-blue-500 mb-3" />
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Total Escalations</span>
            <span className="text-2xl font-black text-white mt-1.5 block">{totalCases}</span>
          </div>

          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
            <Clock size={20} className="text-amber-500 mb-3" />
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Pending Cases</span>
            <span className="text-2xl font-black text-white mt-1.5 block text-amber-400">{pendingCases}</span>
          </div>

          <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden group">
            <CheckCircle size={20} className="text-emerald-500 mb-3" />
            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Resolved Cases</span>
            <span className="text-2xl font-black text-white mt-1.5 block text-emerald-400">{resolvedCases}</span>
          </div>
        </div>

        {/* Master-Detail Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-[500px]">
          
          {/* Left panel: Escalation Ticket list */}
          <div className="lg:col-span-5 bg-slate-900/30 rounded-2xl border border-slate-850 p-6 flex flex-col gap-5 overflow-y-auto max-h-[580px]">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-850 pb-3">Open Human Tickets</h2>
            
            {loading ? (
              <div className="py-24 flex justify-center items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            ) : escalations.length === 0 ? (
              <div className="py-24 flex flex-col items-center gap-3 text-center">
                <LifeBuoy size={40} className="text-slate-700 animate-pulse" />
                <p className="text-slate-500 text-xs font-semibold">No human escalations recorded!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {escalations.map((ticket) => (
                  <button
                    key={ticket.escalationId}
                    onClick={() => handleSelectTicket(ticket)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${selectedTicket?.escalationId === ticket.escalationId ? 'bg-slate-800/80 border-emerald-500/60 shadow-lg' : 'bg-slate-950/20 border-slate-850 hover:bg-slate-900/50'}`}
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-sm truncate leading-snug">{ticket.issueTitle}</h3>
                      <p className="text-[10px] text-slate-400 mt-1 font-semibold">{ticket.userName} • {ticket.userRole}</p>
                      <span className="text-[9px] text-slate-500 mt-2 block font-medium">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold shrink-0 ${ticket.status === 'Resolved' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-900' : 'bg-amber-950/60 text-amber-300 border border-amber-900'}`}>
                      {ticket.status}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right panel: Live reply terminal */}
          <div className="lg:col-span-7 bg-slate-900/30 rounded-2xl border border-slate-850 p-8 flex flex-col gap-6 overflow-y-auto max-h-[580px]">
            {selectedTicket ? (
              <div className="flex flex-col gap-6 h-full">
                
                {/* User profiling */}
                <div className="flex items-start justify-between gap-4 border-b border-slate-850 pb-5">
                  <div>
                    <h2 className="text-lg font-black text-white leading-snug">{selectedTicket.issueTitle}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${selectedTicket.userRole === 'owner' ? 'bg-violet-950/80 text-violet-300 border border-violet-850' : 'bg-emerald-950/80 text-emerald-300 border border-emerald-850'}`}>
                        {selectedTicket.userName} ({selectedTicket.userRole})
                      </span>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-[10px] font-semibold text-slate-400">UID: {selectedTicket.userId}</span>
                    </div>
                  </div>
                  
                  <span className={`px-3.5 py-1 rounded-full text-xs font-bold ${selectedTicket.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                    {selectedTicket.status}
                  </span>
                </div>

                {/* Ticket description */}
                <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-900 flex flex-col gap-2">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Issue Explanation</span>
                  <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{selectedTicket.issueDescription}</p>
                </div>

                {/* Captured AI chat history thread */}
                {selectedTicket.chatSummary && (
                  <div className="bg-slate-950/20 p-5 rounded-2xl border border-slate-900/60 flex flex-col gap-2">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2 flex items-center gap-1">
                      <MessageCircle size={12} className="text-amber-500" />
                      Recent Conversation Snapshot with AI Chatbot
                    </span>
                    <pre className="text-slate-400 text-xs font-mono leading-relaxed whitespace-pre-wrap max-h-36 overflow-y-auto pr-2 bg-slate-950 p-4 rounded-xl border border-slate-850">
                      {selectedTicket.chatSummary}
                    </pre>
                  </div>
                )}

                {/* Reply terminal action */}
                {selectedTicket.status === 'Pending' ? (
                  <form onSubmit={handleResolveTicket} className="space-y-4 mt-auto border-t border-slate-850 pt-5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Draft Official Response & Close Ticket</label>
                      <textarea
                        rows="3"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write dynamic support instructions, ledger correction responses, or app usage guidance..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 transition-all text-sm leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-sm shadow-emerald-900/20 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                    >
                      <Send size={15} />
                      {submitting ? 'Submitting...' : 'Send Manual Resolution & Mark Resolved'}
                    </button>
                  </form>
                ) : (
                  <div className="border-t border-slate-850 pt-5 mt-auto flex flex-col gap-3">
                    <div className="flex items-start gap-2.5">
                      <CornerDownRight className="text-slate-600 mt-1 shrink-0" size={18} />
                      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-850 w-full">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Admin Resolution Message</span>
                        <p className="text-sm text-slate-300 mt-2 font-semibold italic leading-relaxed">"{selectedTicket.adminReply}"</p>
                        
                        <span className="text-[9px] text-slate-500 mt-4 block text-right font-medium">
                          Case Resolved on {new Date(selectedTicket.resolvedAt).toLocaleDateString()} at {new Date(selectedTicket.resolvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center gap-3 p-12">
                <ShieldAlert size={44} className="text-slate-700 animate-pulse" />
                <p className="text-slate-500 text-sm font-semibold">Select a human support escalation case ticket from the left panel to review details.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
