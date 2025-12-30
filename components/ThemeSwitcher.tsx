
import React, { useState, useRef, useEffect } from 'react';
import { useTheme, ThemeMode } from '../contexts/ThemeContext';
import { Moon, Sun, Monitor, Check } from 'lucide-react';
import { useTranslation } from '../contexts/I18nContext';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = () => {
    switch (theme) {
      case 'dark': return <Moon size={16} />;
      case 'light': return <Sun size={16} />;
      case 'system': return <Monitor size={16} />;
    }
  };

  const options: { id: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { id: 'dark', label: t('theme.dark'), icon: <Moon size={14} /> },
    { id: 'light', label: t('theme.light'), icon: <Sun size={14} /> },
    { id: 'system', label: t('theme.system'), icon: <Monitor size={14} /> },
  ];

  return (
    <div className="relative z-50" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-center p-2 rounded-full border transition-all duration-300
          ${isOpen 
            ? 'bg-lomuz-surface border-lomuz-gold/50 text-lomuz-gold shadow-glow-gold' 
            : 'bg-lomuz-surface border-lomuz-border text-lomuz-muted hover:text-lomuz-text hover:border-lomuz-imperial/30'}
        `}
        aria-label="Alternar tema"
      >
        {getIcon()}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-36 bg-lomuz-surface border border-lomuz-border rounded-xl shadow-2xl overflow-hidden p-1 animate-in fade-in zoom-in-95 duration-200">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => { setTheme(opt.id); setIsOpen(false); }}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all
                ${theme === opt.id 
                  ? 'bg-lomuz-bg-alt text-lomuz-text' 
                  : 'text-lomuz-muted hover:bg-lomuz-bg hover:text-lomuz-text'}
              `}
            >
              <span className={theme === opt.id ? 'text-lomuz-gold' : 'opacity-70'}>
                {opt.icon}
              </span>
              <span className="flex-1 text-left">{opt.label}</span>
              {theme === opt.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-lomuz-gold shadow-[0_0_5px_var(--gold)]"></div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
