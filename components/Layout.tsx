
import React, { useState } from 'react';
import { 
  LayoutDashboard, Settings, LogOut, Menu, Music,
  Calendar, Users, Activity, ChevronRight, Sparkles, Plus, ShieldAlert
} from 'lucide-react';
import { User, UserRole } from '../types';
import { useTranslation } from '../contexts/I18nContext';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSwitcher from './ThemeSwitcher';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onNavigate: (page: string) => void;
  onLogout: () => void;
  currentPage: string;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onNavigate, onLogout, currentPage }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  // MODO CLIENTE: Sem menus, apenas o conteúdo (Player Fullscreen)
  if (user.role === UserRole.CLIENT) {
    return (
      <div className="h-screen w-screen bg-lomuz-bg overflow-hidden flex flex-col">
        {children}
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Painel Geral', icon: <LayoutDashboard size={20} /> },
    { id: 'clients-list', label: 'Clientes', icon: <Activity size={20} /> },
    { id: 'create-radio', label: 'Criar Streaming', icon: <Sparkles size={20} />, isSpecial: true },
    { id: 'scheduling', label: 'Agendar Mídias', icon: <Calendar size={20} /> },
    { id: 'media', label: 'Músicas', icon: <Music size={20} /> },
    { id: 'users', label: 'Equipe e Acesso', icon: <Users size={20} /> },
    { id: 'settings', label: 'Preferências', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-lomuz-bg text-lomuz-text font-sans">
      
      {/* MODO DESENVOLVEDOR: Banner de Auditoria */}
      {user.role === UserRole.MASTER && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-lomuz-gold z-[100] animate-pulse" />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0A0A12] border-r border-lomuz-border transition-all md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="h-24 flex items-center px-10">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => onNavigate('landing')}>
            <div className="w-8 h-8 bg-premium-gradient rounded-lg flex items-center justify-center border border-white/10 shadow-glow">
              <span className="text-white font-black text-sm">L</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-white/90 uppercase">LOM<span className="text-lomuz-gold">U</span>Z</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2 custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setIsMobileMenuOpen(false); }}
                className={`w-full group flex items-center gap-4 px-5 py-4 rounded-2xl transition-all relative ${isActive ? 'bg-lomuz-imperial/10 text-white font-bold' : 'text-lomuz-muted hover:text-white hover:bg-white/[0.02]'}`}
              >
                {isActive && <div className="absolute left-0 top-3 bottom-3 w-1 bg-lomuz-imperial rounded-r-full shadow-glow" />}
                <span className={isActive ? 'text-lomuz-imperial' : 'text-lomuz-subtle'}>{item.icon}</span>
                <span className="text-[14px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Auditoria Master no Layout */}
        {user.role === UserRole.MASTER && (
          <div className="px-6 pb-2">
            <div className="p-3 bg-lomuz-gold/5 border border-lomuz-gold/20 rounded-xl flex items-center gap-2">
              <ShieldAlert size={14} className="text-lomuz-gold" />
              <span className="text-[9px] font-black text-lomuz-gold uppercase tracking-widest">Master Auth ON</span>
            </div>
          </div>
        )}

        <div className="p-6 mt-auto">
          <div className="p-5 rounded-[24px] bg-lomuz-bg-alt/40 border border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-premium-gradient flex items-center justify-center text-xs font-bold text-white shadow-inner border border-white/10">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white/90 truncate">{user.name}</p>
                <p className="text-[10px] text-lomuz-imperial font-black uppercase tracking-wider opacity-80">{user.role}</p>
              </div>
            </div>
            <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-2.5 text-[11px] font-bold uppercase tracking-widest text-rose-500/80 hover:text-rose-500 hover:bg-rose-500/5 rounded-xl transition-all">
               <LogOut size={14} /> Sair
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-20 border-b border-lomuz-border/50 flex items-center justify-between px-10 bg-lomuz-bg/40 backdrop-blur-xl sticky top-0 z-30">
          <div className="flex items-center gap-6">
             <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2.5 text-lomuz-muted bg-white/5 rounded-xl"><Menu size={22}/></button>
             <div className="hidden md:flex items-center gap-2 text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
                <span className="text-lomuz-imperial font-bold">Lomuz</span>
                <ChevronRight size={10} className="opacity-30" />
                <span className="text-white/80">{currentPage.replace('-', ' ')}</span>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center bg-white/[0.03] p-1 rounded-xl border border-white/5">
                <LanguageSwitcher />
                <div className="w-px h-4 bg-white/10 mx-1" />
                <ThemeSwitcher />
             </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-depth-gradient relative">
           <div className="relative z-10 max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
