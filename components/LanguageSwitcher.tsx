
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation, Language } from '../contexts/I18nContext';
import { Globe, ChevronDown } from 'lucide-react';

interface LangOption {
  code: Language;
  label: string;
  region: string;
  flag: string;
}

const LANGUAGES: LangOption[] = [
  { code: 'pt', label: 'Português', region: 'Brasil', flag: '🇧🇷' },
  { code: 'en', label: 'English', region: 'United States', flag: '🇺🇸' },
  { code: 'es', label: 'Español', region: 'España / Latam', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', region: 'Europe', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', region: 'Europe', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', region: 'Europe', flag: '🇮🇹' },
];

// Added LanguageSwitcherProps to support variants like 'pill' and 'minimal' used in the application
interface LanguageSwitcherProps {
  variant?: 'pill' | 'minimal' | 'default';
}

// Updated component to accept props
const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ variant = 'default' }) => {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-lomuz-gold/30 transition-all group"
      >
        <span className="text-lg">{current.flag}</span>
        <span className="text-[10px] font-black text-white uppercase tracking-widest hidden md:block">{current.code}</span>
        <ChevronDown size={14} className={`text-lomuz-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-[#0A0A0F] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-2 space-y-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setIsOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${language === lang.code ? 'bg-lomuz-gold/10 text-lomuz-gold' : 'text-lomuz-muted hover:bg-white/5 hover:text-white'}`}
              >
                <span className="text-xl">{lang.flag}</span>
                <div className="text-left">
                  <p className="text-xs font-bold">{lang.label}</p>
                  <p className="text-[9px] opacity-50 uppercase font-black tracking-tighter">{lang.region}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
