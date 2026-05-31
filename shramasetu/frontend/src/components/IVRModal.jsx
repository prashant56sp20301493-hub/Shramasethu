import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate as useAppNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Volume2, X, AlertCircle, RefreshCw, Languages } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { ivrMenuConfig } from '../config/ivrMenuConfig';

const IVRModal = ({ isOpen, onClose, userRole }) => {
  const { t, i18n } = useTranslation();
  const navigate = useAppNavigate();
  const { speak, stop: stopTTS, isSpeaking } = useTextToSpeech();
  
  const handleCommand = useCallback((transcript) => {
    console.log("IVR Heard:", transcript);
    const lowerTranscript = transcript.toLowerCase().replace(/\\s+/g, '');
    let matched = false;
    const currentMenu = ivrMenuConfig[userRole] || ivrMenuConfig['labour']; // Default to labour

    for (const item of currentMenu) {
      if (item.keywords.some(kw => lowerTranscript.includes(kw.toLowerCase()))) {
        handleAction(item);
        matched = true;
        break;
      }
    }
    
    // Check repeat
    if (!matched && (lowerTranscript.includes('0') || lowerTranscript.includes('repeat') || lowerTranscript.includes('zero'))) {
        speakMenu();
        matched = true;
    }

    if (!matched) {
      speak(t('ivr_notUnderstood') || "Sorry, I didn't understand. Please try again.", () => {
        startListening();
      });
    }
  }, [userRole, t, navigate, speak]);

  const { isListening, transcript, error, startListening, stopListening } = useSpeechRecognition(handleCommand);

  const handleAction = (item) => {
    stopListening();
    stopTTS();
    let actionSpeak = '';
    
    // Add logic to pick correct action message
    if (item.route.includes('jobs') || item.route.includes('dashboard')) {
        actionSpeak = t('ivr_openingJobs') || 'Opening available jobs';
    } else if (item.route.includes('attendance')) {
        actionSpeak = t('ivr_openingAttendance') || 'Opening attendance tracker';
    } else if (item.route.includes('wages')) {
        actionSpeak = t('ivr_openingWages') || 'Your wages page is opening';
    } else if (item.route.includes('insurance')) {
        actionSpeak = t('ivr_openingInsurance') || 'Opening insurance options';
    } else if (item.route.includes('support') || item.route.includes('chats')) {
        actionSpeak = t('ivr_openingSupport') || 'Connecting to support';
    } else {
        actionSpeak = t('Loading...');
    }

    speak(actionSpeak, () => {
      onClose();
      navigate(item.route);
    });
  };

  const speakMenu = useCallback(() => {
    stopListening();
    const currentMenu = ivrMenuConfig[userRole] || ivrMenuConfig['labour'];
    
    let menuText = (t('ivr_welcome') || "Welcome to ShramaSetu IVR.") + " ";
    currentMenu.forEach(item => {
      menuText += (t(item.spokenKey) || `Press or say ${item.key}`) + ". ";
    });
    menuText += (t('ivr_press0ToRepeat') || "Press or say 0 to repeat menu") + ".";
    
    speak(menuText, () => {
      startListening();
    });
  }, [userRole, t, speak, startListening, stopListening]);

  useEffect(() => {
    if (isOpen) {
      // Small delay before speaking to let modal animate in
      const timer = setTimeout(() => {
        speakMenu();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      stopTTS();
      stopListening();
    }
  }, [isOpen, speakMenu, stopTTS, stopListening]);

  if (!isOpen) return null;

  const currentMenu = ivrMenuConfig[userRole] || ivrMenuConfig['labour'];

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-end sm:justify-center bg-black/80 backdrop-blur-md p-4"
      >
        <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            
          {/* Header */}
          <div className="bg-emerald-600 p-4 flex justify-between items-center text-white">
            <h2 className="text-xl font-bold flex items-center gap-2">
              {isSpeaking ? <Volume2 className="animate-pulse" /> : <Mic />}
              IVR Assistant
            </h2>
            <button onClick={() => { stopTTS(); stopListening(); onClose(); }} className="p-2 bg-white/20 rounded-full hover:bg-white/30">
              <X size={24} />
            </button>
          </div>

          {/* Status Display */}
          <div className="p-6 text-center border-b border-gray-100 flex flex-col items-center gap-3">
             <div className={`w-24 h-24 rounded-full flex items-center justify-center ${isListening ? 'bg-blue-100 text-blue-600 animate-pulse' : isSpeaking ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                {isListening ? <Mic size={48} /> : isSpeaking ? <Volume2 size={48} /> : <Mic size={48} />}
             </div>
             
             <p className="text-lg font-semibold text-gray-800">
               {isListening ? (t('listening') || "Listening...") : isSpeaking ? (t('speaking') || "Speaking...") : "Ready"}
             </p>
             
             {transcript && (
               <div className="text-xl font-bold text-gray-700 italic border border-gray-200 px-4 py-2 rounded-xl bg-gray-50">
                 "{transcript}"
               </div>
             )}
             
             {error && (
               <div className="text-red-500 font-medium flex items-center gap-2">
                 <AlertCircle size={20} />
                 {error}
               </div>
             )}
          </div>

          {/* Large Number Buttons for Touch Fallback */}
          <div className="p-4 bg-gray-50 flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              {currentMenu.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleAction(item)}
                  className="bg-white border-2 border-emerald-100 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform hover:border-emerald-500 hover:shadow-md"
                >
                  <span className="text-4xl font-black text-emerald-600 bg-emerald-50 w-16 h-16 rounded-full flex items-center justify-center">
                    {item.key}
                  </span>
                  <span className="text-center font-bold text-gray-700 text-lg">
                    {t(item.labelKey)}
                  </span>
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
                <button
                  onClick={() => {
                     const langs = ['en', 'hi', 'kn', 'ta', 'te'];
                     const nextLang = langs[(langs.indexOf(i18n.language) + 1) % langs.length];
                     i18n.changeLanguage(nextLang);
                     speak(t('ivr_selectLanguage') || 'Language changed', () => speakMenu());
                  }}
                  className="bg-blue-50 border-2 border-blue-100 text-blue-700 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform"
                >
                  <Languages size={32} />
                  <span className="font-bold text-lg">{i18n.language.toUpperCase()}</span>
                </button>

                <button
                  onClick={speakMenu}
                  className="bg-orange-50 border-2 border-orange-100 text-orange-700 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform"
                >
                  <RefreshCw size={32} />
                  <span className="font-bold text-lg">Repeat (0)</span>
                </button>
            </div>
          </div>
          
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IVRModal;
