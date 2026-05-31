import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ivrLanguages } from '../config/ivrLanguageConfig';

export const useSpeechRecognition = (onResultCallback) => {
  const { i18n, t } = useTranslation();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript("");
        setError(null);
      };

      recognition.onresult = (event) => {
        setIsListening(false);
        const text = event.results[0][0].transcript;
        setTranscript(text);
        if (onResultCallback) {
          onResultCallback(text);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setError(t('ivr_microphoneDenied') || 'Microphone access denied.');
        } else if (event.error !== 'aborted') {
          setError(t('ivr_notUnderstood') || 'Sorry, I didn\'t understand.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      setError("Browser does not support Speech Recognition.");
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onResultCallback, t]);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
      // Ensure recognition.lang is precisely updated matching user's spec
      const currentLang = i18n.language || 'en';
      const speechCode = ivrLanguages[currentLang]?.speechCode || 'en-IN';
      recognitionRef.current.lang = speechCode;
      
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Could not start listening", e);
      }
    }
  }, [i18n.language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.abort();
      setIsListening(false);
    }
  }, [isListening]);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    isSupported: !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  };
};
