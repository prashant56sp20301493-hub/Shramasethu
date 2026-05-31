import React from 'react';
import { useTranslation } from 'react-i18next';
import { ivrLanguages, ivrTranslations } from '../../config/ivrLanguageConfig';
import { Globe } from 'lucide-react';

const LanguageVoiceSelector = ({ onLanguageChanged }) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'en';
  const translations = ivrTranslations[currentLang] || ivrTranslations['en'];

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
    if (onLanguageChanged) {
      onLanguageChanged(code);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-white/80 font-semibold text-sm">
        <Globe size={18} className="text-emerald-400" />
        <span>{translations.selectSpokenLanguage}</span>
      </div>
      <div className="grid grid-cols-2 xs:grid-cols-3 gap-2">
        {Object.keys(ivrLanguages).map((code) => {
          const lang = ivrLanguages[code];
          const isSelected = currentLang === code;
          return (
            <button
              key={code}
              onClick={() => handleLanguageChange(code)}
              className={`py-2 px-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center border active:scale-95 ${
                isSelected
                  ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)]'
                  : 'bg-white/10 border-white/5 text-white/80 hover:bg-white/20'
              }`}
            >
              {lang.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LanguageVoiceSelector;
