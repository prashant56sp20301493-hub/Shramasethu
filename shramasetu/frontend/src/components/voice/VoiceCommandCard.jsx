import React from 'react';
import { useTranslation } from 'react-i18next';
import { ivrTranslations } from '../../config/ivrLanguageConfig';
import { HelpCircle } from 'lucide-react';

const VoiceCommandCard = ({ userRole }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const translations = ivrTranslations[currentLang] || ivrTranslations['en'];

  const getExampleCommands = () => {
    // Return localized commands matching the spec exactly
    switch (currentLang) {
      case 'hi':
        if (userRole === 'owner') {
          return ['"काम चाहिए" या "1" बोलें', '"किराया" या "3" बोलें', '"हाजिरी" या "4" बोलें', '"मजदूरी" या "5" बोलें'];
        } else if (userRole === 'admin') {
          return ['"अवलोकन" या "1" बोलें', '"उपयोगकर्ता" या "2" बोलें', '"सक्रिय नौकरी" या "3" बोलें', '"किराया" या "4" बोलें'];
        }
        return ['"काम चाहिए" या "1" बोलें', '"हाजिरी" या "3" बोलें', '"मजदूरी" या "4" बोलें', '"बीमा" या "5" बोलें'];

      case 'kn':
        if (userRole === 'owner') {
          return ['"ಕೆಲಸ ಬೇಕು" ಅಥವಾ "1" ಹೇಳಿ', '"ಬಾಡಿಗೆ" ಅಥವಾ "3" ಹೇಳಿ', '"ಹಾಜರಾತಿ" ಅಥವಾ "4" ಹೇಳಿ', '"ಸಂಬಳ" ಅಥವಾ "5" ಹೇಳಿ'];
        } else if (userRole === 'admin') {
          return ['"ಅವಲೋಕನ" ಅಥವಾ "1" ಹೇಳಿ', '"ಬಳಕೆದಾರ" ಅಥವಾ "2" ಹೇಳಿ', '"ಸಕ್ರಿಯ ಕೆಲಸ" ಅಥವಾ "3" ಹೇಳಿ', '"ಬಾಡಿಗೆ" ಅಥವಾ "4" ಹೇಳಿ'];
        }
        return ['"ಕೆಲಸ ಬೇಕು" ಅಥವಾ "1" ಹೇಳಿ', '"ಹಾಜರಾತಿ" ಅಥವಾ "3" ಹೇಳಿ', '"ಸಂಬಳ" ಅಥವಾ "4" ಹೇಳಿ', '"ವಿಮೆ" ಅಥವಾ "5" ಹೇಳಿ'];

      case 'ta':
        if (userRole === 'owner') {
          return ['"வேலை" அல்லது "1" சொல்லவும்', '"வாடகை" அல்லது "3" சொல்லவும்', '"வருகை" அல்லது "4" சொல்லவும்', '"சம்பளம்" அல்லது "5" சொல்லவும்'];
        } else if (userRole === 'admin') {
          return ['"கண்ணோட்டம்" அல்லது "1" சொல்லவும்', '"பயனர்" அல்லது "2" சொல்லவும்', '"செயலில் உள்ள வேலை" അല്ലെങ്കിൽ "3" சொல்லவும்', '"வாடகை" அல்லது "4" சொல்லவும்'];
        }
        return ['"வேலை" அல்லது "1" சொல்லவும்', '"வருகை" அல்லது "3" சொல்லவும்', '"சம்பளம்" அல்லது "4" சொல்லவும்', '"காப்பீடு" அல்லது "5" சொல்லவும்'];

      case 'te':
        if (userRole === 'owner') {
          return ['"పని" లేదా "1" చెప్పండి', '"అద్దె" లేదా "3" చెప్పండి', '"హాజరు" లేదా "4" చెప్పండి', '"జీతం" లేదా "5" చెప్పండి'];
        } else if (userRole === 'admin') {
          return ['"అవలోకనం" లేదా "1" చెప్పండి', '"వినియోగదారు" లేదా "2" చెప్పండి', '"సక్రియ ఉద్యోగం" அல்லது "3" చెప్పండి', '"అద్దె" లేదా "4" చెప్పండి'];
        }
        return ['"పని" లేదా "1" చెప్పండి', '"హాజరు" లేదా "3" చెప్పండి', '"జీతం" లేదా "4" చెప్పండి', '"బీమా" లేదా "5" చెప్పండి'];

      case 'ml':
        if (userRole === 'owner') {
          return ['"ജോലി" അല്ലെങ്കിൽ "1" പറയുക', '"വാടക" അല്ലെങ്കിൽ "3" പറയുക', '"ಹಾಜർ" അല്ലെങ്കിൽ "4" പറയുക', '"ശമ്പളം" അല്ലെങ്കിൽ "5" പറയുക'];
        } else if (userRole === 'admin') {
          return ['"അവലോകനം" അല്ലെങ്കിൽ "1" പറയുക', '"ഉപയോക്താവ്" അല്ലെങ്കിൽ "2" പറയുക', '"സജീവ ജോലി" അല്ലെങ്കിൽ "3" പറയുക', '"വാടക" അല്ലെങ്കിൽ "4" പറയുക'];
        }
        return ['"ജോലി" അല്ലെങ്കിൽ "1" പറയുക', '"ಹಾജർ" അല്ലെങ്കിൽ "3" പറയുക', '"ശമ്പളം" അല്ലെങ്കിൽ "4" പറയുക', '"ഇൻഷുറൻസ്" അല്ലെങ്കിൽ "5" പറയുക'];

      case 'mr':
        if (userRole === 'owner') {
          return ['"काम" किंवा "1" बोला', '"भाडे" किंवा "3" बोला', '"उपस्थिती" किंवा "4" बोला', '"मजुरी" किंवा "5" बोला'];
        } else if (userRole === 'admin') {
          return ['"आढावा" किंवा "1" बोला', '"वापरकर्ता" किंवा "2" बोला', '"सक्रिय कामे" किंवा "3" बोला', '"भाडे" किंवा "4" बोला'];
        }
        return ['"काम" किंवा "1" बोला', '"उपस्थिती" किंवा "3" बोला', '"मजुरी" किंवा "4" बोला', '"विमा" किंवा "5" बोला'];

      case 'bn':
        if (userRole === 'owner') {
          return ['"কাজ" বা "1" বলুন', '"ভাড়া" বা "3" বলুন', '"উপস্থিতি" বা "4" বলুন', '"মজুরি" বা "5" বলুন'];
        } else if (userRole === 'admin') {
          return ['"পর্যালোচনা" বা "1" বলুন', '"ব্যবহারকারী" বা "2" বলুন', '"সক্রিয় কাজ" বা "3" বলুন', '"ভাড়া" বা "4" বলুন'];
        }
        return ['"কাজ" বা "1" বলুন', '"উপস্থিতি" বা "3" বলুন', '"মজুরি" বা "4" বলুন', '"বীমা" বা "5" বলুন'];

      case 'gu':
        if (userRole === 'owner') {
          return ['"કામ" અથવા "1" બોલો', '"ભાડું" અથવા "3" બોલો', '"હાજરી" અથવા "4" બોલો', '"મજૂરી" અથવા "5" બોલો'];
        } else if (userRole === 'admin') {
          return ['"અવલોકન" અથવા "1" બોલો', '"વપરાશકર્તા" અથવા "2" બોલો', '"સક્રિય કામો" અથવા "3" બોલો', '"ભાડું" અથવા "4" બોલો'];
        }
        return ['"કામ" અથવા "1" બોલો', '"હાજરી" અથવા "3" બોલો', '"મજૂરી" અથવા "4" બોલો', '"વીમા" અથવા "5" બોલો'];

      case 'pa':
        if (userRole === 'owner') {
          return ['"ਕੰਮ" ਜਾਂ "1" ਬੋਲੋ', '"ਕਿਰਾਇਆ" ਜਾਂ "3" ਬੋਲੋ', '"ਹਾਜ਼ਰੀ" ਜਾਂ "4" ਬੋਲੋ', '"ਮਜ਼ਦੂਰੀ" ਜਾਂ "5" ਬੋਲੋ'];
        } else if (userRole === 'admin') {
          return ['"ਸੰਖੇਪ" ਜਾਂ "1" ਬੋਲੋ', '"ਉਪਭੋਗਤਾ" ਜਾਂ "2" ਬੋਲੋ', '"ਸਰਗਰਮ ਨੌਕਰੀਆਂ" ਜਾਂ "3" ਬੋਲੋ', '"ਕਿਰਾਏ" ਜਾਂ "4" ਬੋਲੋ'];
        }
        return ['"ਕੰਮ" ਜਾਂ "1" ਬੋਲੋ', '"ਹਾਜ਼ਰੀ" ਜਾਂ "3" ਬੋਲੋ', '"ਮਜ਼ਦੂਰੀ" ਜਾਂ "4" ਬੋਲੋ', '"ਬੀਮਾ" ਜਾਂ "5" ਬੋਲੋ'];

      case 'en':
      default:
        if (userRole === 'owner') {
          return ['Say "Post new job" or "1"', 'Say "Open manage jobs" or "2"', 'Say "Open attendance" or "4"', 'Say "Release salary" or "5"'];
        } else if (userRole === 'admin') {
          return ['Say "Show analytics" or "1"', 'Say "User management" or "2"', 'Say "Active jobs" or "3"', 'Say "Open rentals" or "4"'];
        }
        return ['Say "Find jobs" or "1"', 'Say "My attendance" or "3"', 'Say "Open wages" or "4"', 'Say "Insurance help" or "5"'];
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-white/80 font-semibold text-sm">
        <HelpCircle size={18} className="text-emerald-400" />
        <span>{translations.trySaying}</span>
      </div>
      <div className="flex flex-col gap-1.5 pl-1.5">
        {getExampleCommands().map((cmd, index) => (
          <div key={index} className="text-xs text-white/70 font-mono bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
            🎙️ {cmd}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VoiceCommandCard;
