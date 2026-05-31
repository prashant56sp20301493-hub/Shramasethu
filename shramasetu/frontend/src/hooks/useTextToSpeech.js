import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ivrLanguages } from '../config/ivrLanguageConfig';

export const useTextToSpeech = () => {
  const { i18n } = useTranslation();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback((text, callback) => {
    if (!('speechSynthesis' in window)) {
      if (callback) callback();
      return;
    }

    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(text);
    const currentLang = i18n.language || 'en';
    utterance.lang = ivrLanguages[currentLang]?.speechCode || 'en-IN';
    utterance.rate = 0.85; 
    utterance.pitch = 1;

    utterance.onend = () => {
      setIsSpeaking(false);
      if (callback) callback();
    };

    // If the OS doesn't have a TTS voice for the language, it might error.
    // We MUST fire the callback so the IVR can still move to the listening phase.
    utterance.onerror = (e) => {
      console.warn("TTS Error (Voice might not be installed):", e);
      setIsSpeaking(false);
      if (callback) callback(); 
    };

    window.speechSynthesis.speak(utterance);
  }, [i18n.language]);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking, isSupported: !!window.speechSynthesis };
};
