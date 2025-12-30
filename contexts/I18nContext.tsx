
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { translations } from '../services/translations';

export type Language = 'pt' | 'en' | 'es' | 'fr' | 'de' | 'it';

interface I18nContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatDate: (date: string | Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string;
  localeCompare: (a: string, b: string) => number;
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

const getNestedTranslation = (lang: Language, key: string): string => {
  const dictionary = (translations[lang] || translations['pt']);
  
  // 1. Tenta buscar como chave aninhada (padrão antigo)
  const keys = key.split('.');
  let current: any = dictionary;
  let foundNested = true;
  
  for (const k of keys) {
    if (current === undefined || current === null || current[k] === undefined) {
        foundNested = false;
        break;
    }
    current = current[k];
  }
  
  if (foundNested && typeof current === 'string') return current;

  // 2. Tenta buscar como chave natural (Invisible Translation)
  if (dictionary[key]) return dictionary[key];

  // 3. Fallback final: Texto original
  return key;
};

const interpolate = (text: string, params?: Record<string, string | number>) => {
    if (!params) return text;
    return text.replace(/{{(\w+)}}/g, (_, key) => {
        return params[key] !== undefined ? String(params[key]) : `{{${key}}}`;
    });
};

const LOCALE_MAP: Record<Language, string> = {
    'pt': 'pt-BR',
    'en': 'en-US',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE',
    'it': 'it-IT'
};

const BROWSER_LANG_MAP: Record<string, Language> = {
    'pt': 'pt', 'pt-br': 'pt', 'pt-pt': 'pt',
    'en': 'en', 'en-us': 'en', 'en-gb': 'en',
    'es': 'es', 'es-es': 'es', 'es-mx': 'es',
    'fr': 'fr', 'fr-fr': 'fr',
    'de': 'de', 'de-de': 'de',
    'it': 'it', 'it-it': 'it'
};

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('pt');

  useEffect(() => {
    const savedLang = localStorage.getItem('lomuz_lang') as Language;
    if (savedLang && translations[savedLang]) {
      setLanguageState(savedLang);
    } else if (typeof navigator !== 'undefined') {
        const navLang = navigator.language.toLowerCase();
        const detected = BROWSER_LANG_MAP[navLang] || BROWSER_LANG_MAP[navLang.split('-')[0]];
        if (detected) setLanguageState(detected);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = LOCALE_MAP[language];
    localStorage.setItem('lomuz_lang', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const text = getNestedTranslation(language, key);
    return interpolate(text, params);
  }, [language]);

  const formatDate = useCallback((date: string | Date, options?: Intl.DateTimeFormatOptions) => {
      try {
          const d = typeof date === 'string' ? new Date(date) : date;
          if (isNaN(d.getTime())) return '-';
          return new Intl.DateTimeFormat(LOCALE_MAP[language], options).format(d);
      } catch (e) { return String(date); }
  }, [language]);

  const formatNumber = useCallback((number: number, options?: Intl.NumberFormatOptions) => {
      try { return new Intl.NumberFormat(LOCALE_MAP[language], options).format(number); }
      catch (e) { return String(number); }
  }, [language]);

  const localeCompare = useCallback((a: string, b: string) => {
      return a.localeCompare(b, LOCALE_MAP[language], { sensitivity: 'base', numeric: true });
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, formatDate, formatNumber, localeCompare }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useTranslation must be used within an I18nProvider');
  return context;
};
