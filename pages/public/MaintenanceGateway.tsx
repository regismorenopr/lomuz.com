
import React, { useState } from 'react';
import { Lock, Construction, ArrowRight, ShieldAlert } from 'lucide-react';
import { Button } from '../../components/ui';

interface MaintenanceGatewayProps {
  onUnlock: () => void;
}

const MaintenanceGateway: React.FC<MaintenanceGatewayProps> = ({ onUnlock }) => {
  const [login, setLogin] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (login === 'lomuzadm' && pass === 'lomuz2006') {
      localStorage.setItem('lomuz_unlocked', 'true');
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#05030B] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-lomuz-imperial/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-lomuz-gold/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-20 h-20 bg-white/[0.03] border border-white/10 rounded-[24px] flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Construction size={40} className="text-lomuz-gold animate-bounce" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-3">Site em Construção</h1>
          <p className="text-lomuz-muted text-sm font-medium px-4">
            Estamos orquestrando uma nova experiência sonora. O acesso é restrito apenas a desenvolvedores autorizados.
          </p>
        </div>

        <div className="bg-[#0D0D16] border border-white/5 rounded-[40px] p-10 shadow-2xl animate-in zoom-in-95 duration-500">
          <form onSubmit={handleUnlock} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-lomuz-muted uppercase tracking-[0.2em] ml-1">ID DE ACESSO</label>
              <div className={`relative transition-all ${error ? 'translate-x-1' : ''}`}>
                <input 
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="Seu ID de administrador"
                  className={`w-full bg-black/40 border-2 rounded-2xl p-4 text-white font-bold outline-none transition-all placeholder:text-white/10 ${error ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'border-white/5 focus:border-lomuz-imperial'}`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-lomuz-muted uppercase tracking-[0.2em] ml-1">CHAVE PRIVADA</label>
              <input 
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                placeholder="••••••••"
                className={`w-full bg-black/40 border-2 rounded-2xl p-4 text-white font-bold outline-none transition-all placeholder:text-white/10 ${error ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'border-white/5 focus:border-lomuz-imperial'}`}
              />
            </div>

            {error && (
              <p className="text-[10px] font-black text-rose-500 uppercase text-center tracking-widest animate-in fade-in">
                Credenciais Inválidas
              </p>
            )}

            <Button 
              type="submit"
              variant="primary" 
              className="w-full h-14 text-xs font-black uppercase tracking-[0.3em] rounded-2xl shadow-glow"
            >
              Liberar Sistema <ArrowRight size={16} className="ml-2" />
            </Button>
          </form>
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 opacity-30 text-white">
          <Lock size={12} />
          <span className="text-[9px] font-black uppercase tracking-widest">Lomuz Security Protocol v2.5</span>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceGateway;
