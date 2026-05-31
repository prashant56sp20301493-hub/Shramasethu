import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import { ArrowLeft, Send, Trash2, ShieldAlert, Sparkles, CheckCircle, XCircle, Clock, User, Cpu } from 'lucide-react';

const suggestedQuestions = {
  labour: [
    { text: { en: "How do I check in attendance?", hi: "मैं हाजिरी कैसे दर्ज करूँ?", kn: "ನಾನು ಹಾಜರಾತಿಯನ್ನು ಹೇಗೆ ದಾಖಲಿಸುವುದು?" } },
    { text: { en: "How do I track wages and payments?", hi: "मैं मजदूरी और भुगतान को कैसे ट्रैक करूँ?", kn: "ನನ್ನ ವೇತನ ಮತ್ತು ಪಾವತಿಯನ್ನು ನಾನು ಹೇಗೆ ಟ್ರ್ಯಾಕ್ ಮಾಡುವುದು?" } },
    { text: { en: "How can I apply for health insurance?", hi: "मैं स्वास्थ्य बीमा के लिए कैसे आवेदन करूँ?", kn: "ನಾನು ಆರೋಗ್ಯ ವಿಮೆಗಾಗಿ ಹೇಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸುವುದು?" } },
    { text: { en: "How can I login/register my account?", hi: "मैं अपने खाते में लॉगिन/पंजीकरण कैसे करूँ?", kn: "ನನ್ನ ಖಾತೆಯನ್ನು ಲಾಗಿನ್/ನೋಂದಾಯಿಸುವುದು ಹೇಗೆ?" } }
  ],
  owner: [
    { text: { en: "How do I list and post new work?", hi: "मैं नया काम/नौकरी कैसे पोस्ट करूँ?", kn: "ನಾನು ಹೊಸ ಕೆಲಸವನ್ನು ಹೇಗೆ ಪೋಸ್ಟ್ ಮಾಡುವುದು?" } },
    { text: { en: "How do I approve attendance logs?", hi: "मैं हाजिरी रिकॉर्ड को कैसे स्वीकृत करूँ?", kn: "ಹಾಜರಾತಿ ದಾಖಲೆಗಳನ್ನು ನಾನು ಹೇಗೆ ಅನುಮೋದಿಸುವುದು?" } },
    { text: { en: "How does equipment rental marketplace work?", hi: "उपकरण किराया बाजार कैसे काम करता है?", kn: "ಉಪಕರಣ ಬಾಡಿಗೆ ಮಾರುಕಟ್ಟೆ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ?" } },
    { text: { en: "How do I connect workers with health insurance?", hi: "मैं श्रमिकों को स्वास्थ्य बीमा से कैसे जोड़ूँ?", kn: "ನಾನು ಕಾರ್ಮಿಕರಿಗೆ ಆರೋಗ್ಯ ವಿಮೆಯನ್ನು ಹೇಗೆ ಒದಗಿಸುವುದು?" } }
  ]
};

const labels = {
  supportTitle: { en: "AI Support Assistant", hi: "एआई सहायता सहायक", kn: "AI ಬೆಂಬಲ ಸಹಾಯಕಿ" },
  supportDesc: { en: "Instant AgriTech & platform guidance inside ShramaSetu", hi: "श्रमसेतु के भीतर तत्काल कृषि तकनीक और मंच मार्गदर्शन", kn: "ಶ್ರಮಸೇತು ವೇದಿಕೆ ಮತ್ತು ಕೃಷಿ ಮಾರ್ಗದರ್ಶನ" },
  suggestedTitle: { en: "Quick Questions", hi: "त्वरित प्रश्न", kn: "ತ್ವರಿತ ಪ್ರಶ್ನೆಗಳು" },
  escalateBtn: { en: "Escalate to Admin Support", hi: "एडमिन सहायता को एस्केलेट करें", kn: "ಅಡ್ಮಿನ್ ಬೆಂಬಲಕ್ಕೆ ವರ್ಗಾಯಿಸಿ" },
  escalatedTitle: { en: "Escalate Chat Session", hi: "चैट सत्र एस्केलेट करें", kn: "ಚಾಟ್ ಸೆಶನ್ ವರ್ಗಾಯಿಸಿ" },
  escalatedDesc: { en: "If the AI bot was unable to assist, open a human support ticket.", hi: "यदि एआई बॉट सहायता करने में असमर्थ था, तो मानव सहायता टिकट खोलें।", kn: "AI ಬೋಟ್ ಸಹಾಯ ಮಾಡಲು ಸಾಧ್ಯವಾಗದಿದ್ದರೆ, ಮಾನವ ಸಹಾಯಕ್ಕಾಗಿ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ." },
  issueTitle: { en: "Issue / Subject Title", hi: "समस्या / विषय शीर्षक", kn: "ತೊಂದರೆಯ ಶೀರ್ಷಿಕೆ" },
  issuePlaceholder: { en: "e.g. Wages ledger mismatch...", hi: "जैसे मजदूरी बहीखाता बेमेल...", kn: "ಉದಾ: ವೇತನ ಪಾವತಿಯಲ್ಲಿ ವ್ಯತ್ಯಾಸ..." },
  issueDesc: { en: "Explain your issue in detail", hi: "अपनी समस्या विस्तार से समझाएं", kn: "ನಿಮ್ಮ ಸಮಸ್ಯೆಯನ್ನು ವಿವರವಾಗಿ ವಿವರಿಸಿ" },
  issueDescPlaceholder: { en: "Describe what went wrong and what assistance you require...", hi: "वर्णन करें कि क्या गलत हुआ और आपको किस सहायता की आवश्यकता है...", kn: "ಏನು ತಪ್ಪಾಗಿದೆ ಮತ್ತು ನಿಮಗೆ ಯಾವ ಸಹಾಯದ ಅಗತ್ಯವಿದೆ ಎಂಬುದನ್ನು ವಿವರಿಸಿ..." },
  submitEscalation: { en: "Open Human Support Case", hi: "मानव सहायता केस खोलें", kn: "ಮಾನವ ಬೆಂಬಲ ಕೇಸ್ ತೆರೆಯಿರಿ" },
  clearChat: { en: "Clear Conversation History", hi: "चैट इतिहास साफ़ करें", kn: "ಸಂಭಾಷಣೆಯ ಇತಿಹಾಸವನ್ನು ಅಳಿಸಿ" },
  typeInputPlaceholder: { en: "Ask ShramaSetu AI about attendance, wages, rentals, or insurance...", hi: "हाजिरी, मजदूरी, किराए या बीमा के बारे में श्रमसेतु एआई से पूछें...", kn: "ಹಾಜರಾತಿ, ವೇತನ, ಬಾಡಿಗೆ ಅಥವಾ ವಿಮೆ ಬಗ್ಗೆ ಶ್ರಮಸೇತು AI ಗೆ ಕೇಳಿ..." },
  emptyState: { en: "Start a conversation by typing or selecting a quick question!", hi: "टाइप करके या त्वरित प्रश्न चुनकर बातचीत शुरू करें!", kn: "ಟೈಪ್ ಮಾಡುವ ಮೂಲಕ ಅಥವಾ ಪ್ರಶ್ನೆಯನ್ನು ಆಯ್ಕೆಮಾಡುವ ಮೂಲಕ ಸಂಭಾಷಣೆ ಆರಂಭಿಸಿ!" }
};

export default function UserSupport() {
  const navigate = useNavigate();
  const userId = localStorage.getItem('uid');
  const userName = localStorage.getItem('name') || 'User';
  const userRole = localStorage.getItem('role'); // 'labour' or 'owner'
  const currentLang = localStorage.getItem('i18nextLng') || 'en';

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);

  // Escalation Modal
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalationTitle, setEscalationTitle] = useState('');
  const [escalationDesc, setEscalationDesc] = useState('');
  const [escalating, setEscalating] = useState(false);

  const [toast, setToast] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!userId || (userRole !== 'labour' && userRole !== 'owner')) {
      navigate('/login');
      return;
    }
    fetchChatHistory();
  }, [userId, userRole]);

  // Scroll to bottom whenever messages list is updated
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, typing]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchChatHistory = async () => {
    setLoading(true);
    try {
      const history = await api.getAIChatHistory({ userId });
      setMessages(history);
    } catch (err) {
      console.error(err);
      showToast('Error loading chat history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    if (!textToSend) setInputText('');

    // Append user message instantly
    const tempUserMsg = {
      messageId: Math.random().toString(),
      sender: 'User',
      message: text,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setTyping(true);

    try {
      const response = await api.sendAIChatMessage({
        userId,
        userName,
        userRole,
        message: text,
        language: currentLang
      });

      // Append AI response
      setMessages(prev => [...prev, response]);
    } catch (err) {
      console.error(err);
      showToast('Failed to contact AI support', 'error');
    } finally {
      setTyping(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear your support conversation logs?')) return;
    try {
      await api.clearAIChatHistory({ userId });
      setMessages([]);
      showToast('Conversation history cleared!');
    } catch (err) {
      console.error(err);
      showToast('Error clearing logs', 'error');
    }
  };

  const handleOpenEscalation = () => {
    if (messages.length === 0) {
      showToast('Please chat with our AI support assistant first before opening human escalation tickets.', 'error');
      return;
    }
    setShowEscalateModal(true);
  };

  const handleSubmitEscalation = async (e) => {
    e.preventDefault();
    if (!escalationTitle.trim()) return showToast('Please write a title for the issue', 'error');
    if (!escalationDesc.trim()) return showToast('Please explain the issue description', 'error');

    setEscalating(true);
    try {
      // Capture recent conversation thread as summary
      const summaryText = messages
        .slice(-6)
        .map(m => `${m.sender}: ${m.message}`)
        .join('\n');

      await api.submitSupportEscalation({
        userId,
        userName,
        userRole,
        issueTitle: escalationTitle,
        issueDescription: escalationDesc,
        chatSummary: summaryText
      });

      showToast('Your session has been successfully escalated! An administrator will reply soon.');
      setShowEscalateModal(false);
      setEscalationTitle('');
      setEscalationDesc('');
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Escalation failed', 'error');
    } finally {
      setEscalating(false);
    }
  };

  const getLangVal = (obj, def) => {
    if (!obj) return def;
    return obj[currentLang] || obj['en'] || def;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-xl shadow-lg border flex items-center gap-3 transition-all transform translate-y-0 animate-bounce ${toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          {toast.type === 'error' ? <XCircle className="text-rose-600" /> : <CheckCircle className="text-emerald-600" />}
          <span className="font-semibold text-sm">{toast.msg}</span>
        </div>
      )}

      {/* Top Glassmorphic Navigation Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-8 sticky top-0 z-30 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(userRole === 'owner' ? '/dashboard/owner' : '/dashboard/labour')} 
            className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors border border-slate-200/60"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              💬 {getLangVal(labels.supportTitle, "AI Support")}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">{getLangVal(labels.supportDesc, "Instant AgriTech & platform guidance")}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleClearHistory} 
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-all"
            title={getLangVal(labels.clearChat, "Clear chat history")}
          >
            <Trash2 size={18} />
          </button>
          <button 
            onClick={handleOpenEscalation} 
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-sm shadow-amber-900/10 flex items-center gap-1.5"
          >
            <ShieldAlert size={14} /> {getLangVal(labels.escalateBtn, "Escalate to Human")}
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[580px]">
        
        {/* Left Side: Suggestions and Fast-Actions */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-6 self-start">
          <div className="flex items-center gap-2 text-slate-800 font-bold border-b border-slate-100 pb-3">
            <Sparkles className="text-amber-500" size={18} />
            <h2>{getLangVal(labels.suggestedTitle, "Quick Questions")}</h2>
          </div>
          
          <div className="flex flex-col gap-3">
            {(suggestedQuestions[userRole] || []).map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(getLangVal(q.text, ""))}
                className="w-full text-left bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-100 p-4 rounded-xl text-slate-700 hover:text-emerald-800 text-sm font-semibold leading-relaxed transition-all"
              >
                {getLangVal(q.text, "")}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Primary Chat Console */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[580px] overflow-hidden">
          
          {/* Scroll Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-3 p-12">
                <div className="p-4 bg-emerald-50 rounded-full border border-emerald-100">
                  <Cpu size={32} className="text-emerald-600 animate-pulse" />
                </div>
                <p className="text-slate-500 font-bold text-sm leading-relaxed max-w-sm">
                  {getLangVal(labels.emptyState, "Start a conversation by typing or choosing a suggested question!")}
                </p>
              </div>
            ) : (
              <>
                {messages.map((item, idx) => (
                  <div 
                    key={item.messageId || idx} 
                    className={`flex items-start gap-3.5 max-w-[85%] ${item.sender === 'User' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                  >
                    {/* Native Avatar bubble */}
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 shadow-sm ${item.sender === 'User' ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-slate-800 border-slate-750 text-amber-400'}`}>
                      {item.sender === 'User' ? <User size={14} /> : <Cpu size={14} />}
                    </div>

                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm transition-all border ${item.sender === 'User' ? 'bg-emerald-600 border-emerald-500 text-white rounded-tr-none' : 'bg-white border-slate-150 text-slate-700 rounded-tl-none'}`}>
                      <p className="whitespace-pre-wrap font-medium">{item.message}</p>
                      
                      {/* Sub timestamp */}
                      <span className={`text-[9px] block mt-1.5 self-end text-right opacity-60`}>
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Simulated typing indicator */}
                {typing && (
                  <div className="flex items-start gap-3.5 max-w-[85%] mr-auto">
                    <div className="w-8 h-8 rounded-full border flex items-center justify-center shrink-0 bg-slate-800 border-slate-750 text-amber-400">
                      <Cpu size={14} />
                    </div>
                    <div className="bg-white border border-slate-150 p-4 rounded-2xl rounded-tl-none text-sm leading-relaxed flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                      <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                
                <div ref={scrollRef} />
              </>
            )}
          </div>

          {/* Typing input footer */}
          <div className="border-t border-slate-200 p-4 bg-white">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="flex items-center gap-3"
            >
              <input 
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={getLangVal(labels.typeInputPlaceholder, "Ask ShramaSetu AI...")}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm leading-relaxed"
              />
              <button 
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 rounded-xl transition-all shadow-sm shadow-emerald-600/10 flex items-center justify-center"
              >
                <Send size={18} />
              </button>
            </form>
          </div>

        </div>

      </div>

      {/* Human Escalation Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl p-8 flex flex-col gap-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <ShieldAlert className="text-amber-500" />
                {getLangVal(labels.escalatedTitle, "Escalate Chat Session")}
              </h2>
              <p className="text-slate-500 text-xs mt-1">
                {getLangVal(labels.escalatedDesc, "Open a pending human case ticket with administrators.")}
              </p>
            </div>

            <form onSubmit={handleSubmitEscalation} className="space-y-5">
              {/* Subject Title */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">{getLangVal(labels.issueTitle, "Issue / Subject Title")}</label>
                <input 
                  type="text"
                  value={escalationTitle}
                  onChange={(e) => setEscalationTitle(e.target.value)}
                  placeholder={getLangVal(labels.issuePlaceholder, "Explain title...")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">{getLangVal(labels.issueDesc, "Explain your issue")}</label>
                <textarea 
                  rows="4"
                  value={escalationDesc}
                  onChange={(e) => setEscalationDesc(e.target.value)}
                  placeholder={getLangVal(labels.issueDescPlaceholder, "Describe what went wrong...")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm leading-relaxed"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-4 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEscalateModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={escalating}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm shadow-amber-900/10 disabled:opacity-50"
                >
                  {escalating ? 'Escalating...' : getLangVal(labels.submitEscalation, "Open Case")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
