import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate as useAppNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, X, AlertCircle, RefreshCw, Eye, EyeOff, Sparkles, VolumeX } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../../hooks/useTextToSpeech';
import { ownerIvrMenu } from '../../config/ownerIvrMenus';
import { ivrLanguages, ivrTranslations } from '../../config/ivrLanguageConfig';
import { ownerIvrIntentMap, OWNER_INTENTS } from '../../config/ownerIvrIntentMap';
import VoiceVisualizer from './VoiceVisualizer';
import LanguageVoiceSelector from './LanguageVoiceSelector';
import VoiceCommandCard from './VoiceCommandCard';

const OwnerIVRModal = ({ isOpen, onClose, userRole }) => {
  const { i18n } = useTranslation();
  const navigate = useAppNavigate();
  const { speak, stop: stopTTS, isSpeaking } = useTextToSpeech();
  
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return i18n.language || 'en';
  });

  const [hasSpokenWelcome, setHasSpokenWelcome] = useState(false);

  // Accessibility state ("Easy Mode")
  const [isEasyMode, setIsEasyMode] = useState(() => {
    return localStorage.getItem('shramasetu_easymode') === 'true';
  });

  const currentSpeechCode = ivrLanguages[currentLanguage]?.speechCode || 'en-IN';
  const translations = ivrTranslations[currentLanguage] || ivrTranslations['en'];

  const getTranslatedWelcomeMenu = (lang) => {
    const translationSet = ivrTranslations[lang] || ivrTranslations['en'];
    return translationSet.welcomeGreetings['owner'] || translationSet.welcomeGreetings['labour'];
  };

  const speakWelcomeAndMenu = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    speak(getTranslatedWelcomeMenu(currentLanguage), () => {
      startListening();
    });
  }, [currentLanguage, speak]);

  // Welcome Greet Effect Loop
  useEffect(() => {
    if (isOpen && !hasSpokenWelcome) {
      speakWelcomeAndMenu();
      setHasSpokenWelcome(true);
    }
  }, [isOpen, hasSpokenWelcome, speakWelcomeAndMenu]);

  useEffect(() => {
    if (!isOpen) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setHasSpokenWelcome(false);
    }
  }, [isOpen]);

  const handleLanguageChange = (lang) => {
    setCurrentLanguage(lang);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
    
    const nextTranslations = ivrTranslations[lang] || ivrTranslations['en'];
    
    speak(nextTranslations.spokenResponses.languageChanged, () => {
      speak(getTranslatedWelcomeMenu(lang), () => {
        startListening();
      });
    });
  };

  const handleIntent = useCallback((intent) => {
    stopListening();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    const matchedItem = ownerIvrMenu.find(item => item.intent === intent);
    
    if (intent === OWNER_INTENTS.REPEAT) {
      speak(translations.spokenResponses.repeatMenu, () => {
        speakWelcomeAndMenu();
      });
      return;
    }

    if (matchedItem) {
      let actionText = '';
      
      switch (intent) {
        case OWNER_INTENTS.HIRE_LABOUR:
          actionText = "Opening Hire Labour section.";
          break;
        case OWNER_INTENTS.MANAGE_JOBS:
          actionText = "Opening Manage Jobs section.";
          break;
        case OWNER_INTENTS.RENTALS:
          actionText = translations.spokenResponses.rentals || "Opening Rental Marketplace.";
          break;
        case OWNER_INTENTS.ATTENDANCE:
          actionText = translations.spokenResponses.attendance || "Opening Attendance Management.";
          break;
        case OWNER_INTENTS.WAGES:
          actionText = translations.spokenResponses.wages || "Opening Wages Management.";
          break;
        case OWNER_INTENTS.INSURANCE:
          actionText = translations.spokenResponses.insurance || "Opening Health Insurance.";
          break;
        case OWNER_INTENTS.FEEDBACK:
          actionText = "Opening Feedback and Rating.";
          break;
        case OWNER_INTENTS.SUPPORT:
          actionText = translations.spokenResponses.support || "Opening AI Chat Support.";
          break;
        default:
          actionText = translations.openingPage;
      }

      speak(actionText, () => {
        onClose();
        navigate(matchedItem.route);
      });
    } else {
      speak(translations.spokenResponses.notUnderstood, () => {
        startListening();
      });
    }
  }, [translations, navigate, speak, onClose, speakWelcomeAndMenu]);

  const handleCommand = useCallback((transcriptText) => {
    console.log("Owner IVR Speech Heard:", transcriptText);
    const text = transcriptText.toLowerCase().trim();
    let foundIntent = null;

    // Direct command intents synonyms lookup
    for (const mapping of ownerIvrIntentMap) {
      const keywords = mapping.keywords[currentLanguage] || mapping.keywords['en'] || [];
      if (keywords.some(keyword => text.includes(keyword.toLowerCase()))) {
        foundIntent = mapping.intent;
        break;
      }
    }

    if (foundIntent) {
      handleIntent(foundIntent);
    } else {
      speak(translations.spokenResponses.notUnderstood, () => {
        startListening();
      });
    }
  }, [handleIntent, speak, currentLanguage, translations]);

  const { isListening, transcript, error, startListening, stopListening } = useSpeechRecognition(handleCommand);

  const toggleEasyMode = () => {
    const nextVal = !isEasyMode;
    setIsEasyMode(nextVal);
    localStorage.setItem('shramasetu_easymode', nextVal ? 'true' : 'false');
  };

  const getLocalizedMenuLabel = (labelKey) => {
    const normalizedKey = labelKey.charAt(0).toLowerCase() + labelKey.slice(1);
    if (normalizedKey === 'wagesManagementOwner') return translations.wagesManagementOwner;
    if (normalizedKey === 'healthInsuranceSystem') return translations.healthInsurance;
    if (normalizedKey === 'chatSupportMonitor') return translations.chatSupport;
    if (normalizedKey === 'rentalSystem') return translations.rentalSystem;
    
    return translations[normalizedKey] || translations[labelKey] || labelKey;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-end sm:justify-center bg-black/85 backdrop-blur-xl p-4 overflow-y-auto"
      >
        <div className={`w-full max-w-2xl bg-gradient-to-b from-gray-900 via-slate-900 to-black rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col my-4 ${isEasyMode ? 'border-amber-400/30' : ''}`}>
            
          {/* Header */}
          <div className="bg-emerald-950/80 px-6 py-4 flex justify-between items-center text-white border-b border-white/5">
            <h2 className="text-xl font-bold flex items-center gap-2.5">
              <Sparkles className="text-emerald-400 animate-pulse" />
              <span>{translations.title || "Owner Assistant"}</span>
            </h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleEasyMode}
                className={`py-1.5 px-3 rounded-full flex items-center gap-1.5 font-bold text-xs border transition-all active:scale-95 ${
                  isEasyMode 
                    ? 'bg-amber-400 border-amber-300 text-black' 
                    : 'bg-white/10 border-white/5 text-white hover:bg-white/20'
                }`}
              >
                {isEasyMode ? <EyeOff size={14} /> : <Eye size={14} />}
                {translations.easyMode}
              </button>
              <button onClick={() => { stopTTS(); stopListening(); onClose(); }} className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white">
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Audio Visualization Console */}
          <div className="p-6 text-center flex flex-col items-center gap-4">
             <div className="relative">
               {isListening && (
                 <motion.div
                   animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.6, 0.3] }}
                   transition={{ repeat: Infinity, duration: 1.5 }}
                   className="absolute inset-0 rounded-full bg-emerald-500/20 blur-lg"
                 />
               )}
               <button
                 onClick={isListening ? stopListening : startListening}
                 className={`w-28 h-28 rounded-full flex items-center justify-center border-4 relative transition-all active:scale-95 ${
                   isListening 
                     ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_30px_rgba(37,99,235,0.6)] animate-pulse' 
                     : isSpeaking 
                     ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_30px_rgba(16,185,129,0.6)]' 
                     : 'bg-white/10 border-white/10 text-white/50 hover:bg-white/20'
                 }`}
               >
                 {isListening ? <Mic size={48} /> : isSpeaking ? <Volume2 size={48} /> : <Mic size={48} />}
               </button>
             </div>
             
             <VoiceVisualizer isActive={isListening || isSpeaking} colorClass={isListening ? "bg-blue-500" : "bg-emerald-500"} />
             
             <div className="flex flex-col gap-1.5 max-w-md">
               <h3 className="text-white/90 text-lg font-bold">
                 {isListening 
                   ? translations.listening 
                   : isSpeaking 
                   ? translations.speaking 
                   : translations.assistantReady}
               </h3>
               {transcript ? (
                 <div className="text-xl font-bold text-emerald-400 italic bg-white/5 border border-white/10 px-5 py-3 rounded-2xl shadow-inner max-w-sm mx-auto">
                   "{transcript}"
                 </div>
               ) : (
                 <p className="text-white/50 text-sm">
                   {translations.sayCommand}
                 </p>
               )}
             </div>
             
             {error && (
               <div className="text-red-400 font-medium flex items-center gap-2 bg-red-950/20 px-4 py-2 rounded-xl border border-red-500/20">
                 <AlertCircle size={18} />
                 <span className="text-sm">{error}</span>
               </div>
             )}
          </div>

          {/* Quick Menu Touch Grid */}
          <div className="px-6 pb-6 flex-1 overflow-y-auto flex flex-col gap-4">
            
            <div className="border-t border-white/5 my-2" />

            <div className="flex flex-col gap-2.5">
               <div className={`grid gap-3 ${isEasyMode ? 'grid-cols-1' : 'grid-cols-2'}`}>
                 {ownerIvrMenu.map((item) => (
                   <button
                     key={item.key}
                     onClick={() => handleIntent(item.intent)}
                     className={`bg-white/5 hover:bg-white/10 active:scale-98 transition-all border border-white/5 rounded-2xl flex items-center gap-4 hover:border-emerald-500/50 shadow-sm ${
                       isEasyMode ? 'p-6 border-emerald-500/20' : 'p-4'
                     }`}
                   >
                     <span className={`font-black text-emerald-400 bg-emerald-500/10 rounded-full flex items-center justify-center flex-shrink-0 ${
                       isEasyMode ? 'text-4xl w-16 h-16' : 'text-2xl w-12 h-12'
                     }`}>
                       {item.key}
                     </span>
                     <div className="text-left">
                       <span className={`block font-bold text-white ${isEasyMode ? 'text-xl' : 'text-base'}`}>
                         {getLocalizedMenuLabel(item.labelKey)}
                       </span>
                     </div>
                   </button>
                 ))}
               </div>
            </div>

            {/* Language Selection inside Modal */}
            <LanguageVoiceSelector onLanguageChanged={handleLanguageChange} />

            {/* Example vocal tags */}
            <VoiceCommandCard userRole={userRole} />

            {/* Controls Bar */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={speakWelcomeAndMenu}
                className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/20 rounded-2xl py-4 flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-transform"
              >
                <RefreshCw size={24} />
                <span className="font-bold text-xs">{translations.repeat}</span>
              </button>

              <button
                onClick={() => { stopTTS(); stopListening(); }}
                className="bg-red-950/40 hover:bg-red-950/60 text-red-400 border border-red-500/20 rounded-2xl py-4 flex flex-col items-center justify-center gap-1.5 active:scale-95 transition-transform"
              >
                <VolumeX size={24} />
                <span className="font-bold text-xs">{translations.stopTTS}</span>
              </button>
            </div>

          </div>
          
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OwnerIVRModal;
