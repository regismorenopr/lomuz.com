
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, X, Music, Bot, Zap, Loader2, Wand2, CreditCard, Rocket, CheckCircle, 
  Play, Lock, User, Radio, LayoutDashboard, Fingerprint, Sparkles, BrainCircuit, BarChart3, Globe
} from 'lucide-react';
import { Button } from '../../components/ui';
import ThemeSwitcher from '../../components/ThemeSwitcher';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import DemoPlayer from '../../components/DemoPlayer';
import { User as UserType, UserRole } from '../../types';
import { useTranslation } from '../../contexts/I18nContext';

interface LandingProps {
  onNavigate: (page: string) => void;
  onLogin?: (role: UserRole, user: UserType) => void;
}

const LoginModal = ({ isOpen, onClose, onLogin }: { isOpen: boolean; onClose: () => void; onLogin: any }) => {
    const [activeTab, setActiveTab] = useState<'client' | 'director'>('client');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        let user: UserType;
        if (activeTab === 'director') {
            user = {
              id: 'director-bypass',
              name: 'Diretor Geral',
              email: 'diretor@lomuz.com',
              role: UserRole.DIRECTOR,
              company: 'Lomuz Media Group',
              active: true,
              createdAt: new Date().toISOString()
            };
        } else {
            user = {
              id: 'client-bypass',
              name: 'Cliente Demonstração',
              email: 'cliente@loja.com',
              publicId: 'CLI-DEMO-01',
              role: UserRole.CLIENT,
              company: 'Loja Exemplo Ltda',
              active: true,
              createdAt: new Date().toISOString()
            };
        }
        onLogin(user.role, user);
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-lomuz-surface border border-lomuz-border rounded-3xl shadow-2xl relative overflow-hidden animate-in zoom-in-95">
                <button onClick={onClose} className="absolute top-4 right-4 text-lomuz-muted hover:text-white transition-colors z-20">
                    <X size={20} />
                </button>

                <div className="p-8 pb-0 text-center">
                    <div className="w-12 h-12 bg-premium-gradient rounded-xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-lomuz-imperial/20">
                        <Lock size={20} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-lomuz-text mb-1">Acesse sua Rádio</h2>
                    <p className="text-sm text-lomuz-muted">Gerencie sua programação ou ouça agora.</p>
                </div>

                <div className="p-6">
                    <div className="flex bg-lomuz-bg p-1 rounded-xl mb-6 border border-lomuz-border">
                        <button 
                            onClick={() => setActiveTab('client')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'client' ? 'bg-lomuz-surface text-lomuz-imperial shadow-sm border border-lomuz-imperial/30' : 'text-lomuz-muted hover:text-lomuz-text'}`}
                        >
                            <Radio size={14} /> Sou Cliente
                        </button>
                        <button 
                            onClick={() => setActiveTab('director')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${activeTab === 'director' ? 'bg-lomuz-surface text-lomuz-imperial shadow-sm border border-lomuz-imperial/30' : 'text-lomuz-muted hover:text-lomuz-text'}`}
                        >
                            <LayoutDashboard size={14} /> Sou Diretor
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-lomuz-subtle uppercase ml-1 tracking-wider">Login</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-lomuz-muted group-focus-within:text-lomuz-imperial transition-colors" size={18} />
                                <input 
                                    type="text" 
                                    className="w-full bg-lomuz-input border border-lomuz-border rounded-xl py-3.5 pl-12 pr-4 text-lomuz-text font-medium focus:border-lomuz-imperial focus:outline-none transition-all"
                                    value={activeTab === 'client' ? 'CLI-DEMO' : 'admin@lomuz.com'}
                                    readOnly
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-lomuz-subtle uppercase ml-1 tracking-wider">Senha</label>
                            <div className="relative group">
                                <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-lomuz-muted group-focus-within:text-lomuz-imperial transition-colors" size={18} />
                                <input 
                                    type="password" 
                                    className="w-full bg-lomuz-input border border-lomuz-border rounded-xl py-3.5 pl-12 pr-4 text-lomuz-text font-medium focus:border-lomuz-imperial focus:outline-none transition-all"
                                    value="********"
                                    readOnly
                                />
                            </div>
                        </div>

                        <Button 
                            isLoading={loading} 
                            variant="primary"
                            className="w-full py-4 text-sm uppercase tracking-widest font-bold shadow-lg h-12 mt-2"
                        >
                            {loading ? "Entrando..." : "Acessar Agora"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const Landing: React.FC<LandingProps> = ({ onNavigate, onLogin }) => {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-lomuz-bg text-lomuz-text relative overflow-x-hidden font-sans selection:bg-lomuz-imperial/30">
            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLogin={onLogin} />

            <nav className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-premium-gradient rounded-xl flex items-center justify-center shadow-lg border border-white/10">
                        <span className="font-bold text-white text-xl">L</span>
                    </div>
                    <span className="font-bold text-xl tracking-tight hidden md:block uppercase">LOM<span className="text-lomuz-gold">U</span>Z</span>
                </div>
                <div className="flex items-center gap-4">
                    <ThemeSwitcher />
                    <LanguageSwitcher variant="minimal" />
                    <button 
                        onClick={() => setIsLoginOpen(true)}
                        className="text-sm font-bold text-lomuz-text hover:text-lomuz-imperial transition-colors px-4 py-2"
                    >
                        Entrar
                    </button>
                    <Button 
                        onClick={() => onNavigate('create-radio-guest')}
                        variant="primary" 
                        size="sm" 
                        className="hidden md:flex shadow-glow"
                    >
                        Criar Conta
                    </Button>
                </div>
            </nav>

            <section className="relative pt-40 pb-32 px-6 flex flex-col items-center text-center z-10 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-lomuz-imperial/30 rounded-full blur-[120px] pointer-events-none opacity-60"></div>

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-in slide-in-from-bottom-4">
                    <span className="w-2 h-2 rounded-full bg-lomuz-imperial animate-pulse"></span>
                    <span className="text-xs font-bold uppercase tracking-widest text-white/80">{t('landing.badge')}</span>
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 max-w-5xl leading-[1.1] uppercase">
                    {t('landing.title')} <br/>
                    <span className="text-transparent bg-clip-text bg-premium-gradient">{t('landing.titleGold')}</span>
                </h1>

                <p className="text-lg md:text-xl text-lomuz-muted max-w-2xl mb-10 leading-relaxed">
                    {t('landing.description')}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <Button 
                        onClick={() => onNavigate('create-radio-guest')} 
                        size="lg" 
                        variant="primary"
                        className="h-14 px-10 text-base shadow-2xl shadow-lomuz-imperial/30 hover:scale-105 transition-transform"
                    >
                        {t('landing.buttonCreate')}
                    </Button>
                    <Button 
                        onClick={() => setIsLoginOpen(true)} 
                        size="lg" 
                        variant="secondary"
                        className="h-14 px-10 text-base bg-white/5 border-white/10 hover:bg-white/10 backdrop-blur-md"
                    >
                        <Play size={18} className="mr-2" /> {t('landing.buttonListen')}
                    </Button>
                </div>

                <DemoPlayer />
            </section>

            <footer className="py-12 border-t border-white/5 text-center relative z-10">
                <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
                    <Globe size={16} />
                    <span className="text-xs font-mono uppercase tracking-widest text-white/40">Global Streaming Network</span>
                </div>
                <p className="text-xs text-lomuz-subtle">
                    &copy; {new Date().getFullYear()} Lomuz Systems.
                </p>
            </footer>
        </div>
    );
};

export default Landing;
