
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { useTranslation } from '../contexts/I18nContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { Mail, Lock, Unlock } from 'lucide-react';
import { Button } from '../components/ui';
import { api } from '../services/api';

interface LoginProps {
  onLogin: (role: UserRole, user: User) => void;
  onNavigate: (page: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setError('');

      try {
          const user = await api.auth.login(email, password);
          // Backend role comes as string, map to Enum
          const role = user.role === 'DIRECTOR' ? UserRole.DIRECTOR : UserRole.CLIENT;
          onLogin(role, user);
      } catch (err) {
          setError("Credenciais inválidas ou erro no servidor.");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-lomuz-bg transition-colors duration-500">
      <div className="max-w-md w-full glass-panel rounded-3xl shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500 border border-lomuz-border">
        <div className="p-10 text-center border-b border-lomuz-border bg-lomuz-surface rounded-t-3xl">
          <div className="w-16 h-16 bg-gradient-to-br from-lomuz-imperial to-lomuz-amethyst rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg border border-white/10">
            <span className="text-3xl font-bold text-white">L</span>
          </div>
          <h1 className="text-3xl font-bold text-lomuz-text tracking-tight mb-2">LOM<span className="text-lomuz-gold">U</span>Z</h1>
          <p className="text-lomuz-muted text-xs uppercase tracking-[0.2em] font-medium">{t('login.subtitle')}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
             {error && <div className="text-rose-500 text-sm text-center font-bold bg-rose-500/10 p-2 rounded">{error}</div>}

             <div className="space-y-5">
                 <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-lomuz-subtle uppercase ml-1 tracking-wider">E-mail</label>
                     <div className="relative group">
                         <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-lomuz-muted" size={18} />
                         <input 
                            type="email" 
                            required
                            className="w-full bg-lomuz-bg-alt border border-lomuz-border rounded-xl py-3.5 pl-12 pr-4 text-lomuz-text font-medium"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                         />
                     </div>
                 </div>
                 <div className="space-y-1.5">
                     <label className="text-[10px] font-bold text-lomuz-subtle uppercase ml-1 tracking-wider">Senha</label>
                     <div className="relative group">
                         <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-lomuz-muted" size={18} />
                         <input 
                            type="password" 
                            required
                            className="w-full bg-lomuz-bg-alt border border-lomuz-border rounded-xl py-3.5 pl-12 pr-4 text-lomuz-text font-medium"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                         />
                     </div>
                 </div>
             </div>

             <Button 
                isLoading={loading} 
                variant="primary"
                className="w-full py-4 text-sm uppercase tracking-widest font-bold shadow-lg h-12"
             >
                 {loading ? "Autenticando..." : "Entrar"}
             </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
