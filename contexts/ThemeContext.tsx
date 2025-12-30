
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextProps {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  resolvedTheme: 'dark' | 'light';
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    return (localStorage.getItem('lomuz-theme') as ThemeMode) || 'dark';
  });
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const applyTheme = (target: 'dark' | 'light') => {
      const root = window.document.documentElement;
      setResolvedTheme(target);
      
      // Remove todas as classes de tema anteriores
      root.classList.remove('dark', 'light');
      
      // Adiciona a classe correspondente para o Tailwind
      root.classList.add(target);
      
      // Aplica o color-scheme do sistema para controles nativos
      root.style.colorScheme = target;
      
      // Atributo para seletores CSS personalizados
      root.setAttribute('data-theme', target);
      
      localStorage.setItem('lomuz-theme', theme);
    };

    if (theme === 'system') {
      const checkSystem = () => {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(isDark ? 'dark' : 'light');
      };
      checkSystem();
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', checkSystem);
      return () => mediaQuery.removeEventListener('change', checkSystem);
    } else {
      applyTheme(theme as 'dark' | 'light');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: setThemeState, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
