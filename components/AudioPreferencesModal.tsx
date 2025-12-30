
import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

interface AudioPreferencesProps {
  onClose: () => void;
}

const AudioPreferencesModal: React.FC<AudioPreferencesProps> = ({ onClose }) => {
  const [bitrate, setBitrate] = useState('32K');
  const [preset, setPreset] = useState('NEUTRO (RECOMENDADO)');
  const [normEnabled, setNormEnabled] = useState(true);
  const [eqEnabled, setEqEnabled] = useState(false);

  const bitrates = [
    { label: '32K', pro: false },
    { label: '48K', pro: false }, // ADICIONADO PARA CONSISTÊNCIA
    { label: '64K', pro: true },
    { label: '96K', pro: true },
    { label: '128K', pro: true }
  ];

  const presets = [
    'NEUTRO (RECOMENDADO)', 'VOZ EM DESTAQUE',
    'MAIS ENERGIA (LOJAS)', 'SOM SUAVE (AMBIENTE)',
    'GRAVE CONTROLADO', 'NOITE (MENOS AGRESSI...)'
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-[380px] h-full bg-[#12141C] border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-500 shadow-2xl">
        
        {/* HEADER */}
        <header className="p-8 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">PREFERÊNCIAS DE ÁUDIO</h2>
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mt-1">AJUSTES PADRÃO DO SEU PLAYER</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all">
            <X size={24} />
          </button>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar pb-32">
          
          {/* BITRATE */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-lomuz-gold" />
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">TAXA DE TRANSMISSÃO (BITRATE)</h3>
            </div>
            <div className="grid grid-cols-5 gap-1.5 bg-white/[0.02] border border-white/5 p-1 rounded-xl">
              {bitrates.map((b) => (
                <button
                  key={b.label}
                  onClick={() => setBitrate(b.label)}
                  className={`relative flex flex-col items-center justify-center h-14 rounded-lg transition-all ${
                    bitrate === b.label 
                    ? 'bg-white text-black' 
                    : 'text-white/40 hover:bg-white/5'
                  }`}
                >
                  <span className="text-[10px] font-black">{b.label}</span>
                  {b.pro && (
                    <span className={`text-[6px] font-black uppercase flex items-center gap-0.5 mt-0.5 ${bitrate === b.label ? 'text-black/40' : 'text-lomuz-gold'}`}>
                       PRO
                    </span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest text-center">AJUSTE CONFORME A ESTABILIDADE DA SUA INTERNET.</p>
          </section>

          {/* PRESETS */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-lomuz-gold" />
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">PRESETS RÁPIDOS</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p) => (
                <button
                  key={p}
                  onClick={() => setPreset(p)}
                  className={`p-4 rounded-xl border text-[9px] font-black uppercase text-left transition-all ${
                    preset === p 
                    ? 'bg-lomuz-gold/10 border-lomuz-gold text-white shadow-glow-gold' 
                    : 'bg-white/[0.02] border-white/5 text-white/30 hover:border-white/20'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </section>

          {/* VOLUME & NORMALIZAÇÃO */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-lomuz-gold" />
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">VOLUME & NORMALIZAÇÃO</h3>
            </div>
            <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[32px] space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between text-[9px] font-black uppercase text-white/40 tracking-widest">
                  <span>MÚSICA</span>
                  <span className="text-lomuz-gold">85%</span>
                </div>
                <input type="range" className="w-full accent-lomuz-gold opacity-80" defaultValue={85} />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-[9px] font-black uppercase text-white/40 tracking-widest">
                  <span>OUTRAS MÍDIAS</span>
                  <span className="text-lomuz-gold">90%</span>
                </div>
                <input type="range" className="w-full accent-lomuz-gold opacity-80" defaultValue={90} />
              </div>
              
              <div className="pt-4 border-t border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-[10px] font-black text-white uppercase">NORMALIZAÇÃO AUTOMÁTICA</h4>
                    <p className="text-[9px] text-white/30 font-bold uppercase mt-0.5">Equilibra o volume entre faixas.</p>
                  </div>
                  <button 
                    onClick={() => setNormEnabled(!normEnabled)}
                    className={`w-12 h-6 rounded-full relative transition-all ${normEnabled ? 'bg-lomuz-gold' : 'bg-white/10'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${normEnabled ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-[9px] font-black uppercase text-white/40 tracking-widest">
                    <span>INTENSIDADE</span>
                    <span className="text-white">50%</span>
                  </div>
                  <input type="range" className="w-full accent-white/20" defaultValue={50} disabled={!normEnabled} />
                </div>
              </div>
            </div>
          </section>

          {/* EQUALIZAÇÃO */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-lomuz-gold" />
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">EQUALIZAÇÃO (EQ)</h3>
              </div>
              <button 
                onClick={() => setEqEnabled(!eqEnabled)}
                className={`w-10 h-5 rounded-full relative transition-all ${eqEnabled ? 'bg-lomuz-gold' : 'bg-white/10'}`}
              >
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${eqEnabled ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            
            <div className="flex justify-between h-40 gap-4">
              {[1, 2, 3].map((f) => (
                <div key={f} className="flex-1 bg-white/[0.02] border border-white/5 rounded-2xl relative flex flex-col items-center py-4">
                   <div className="flex-1 w-px bg-white/5 relative">
                      <div className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full transition-all border-2 ${eqEnabled ? 'top-1/2 bg-white border-white' : 'top-1/2 bg-white/10 border-white/10'}`} />
                   </div>
                   <span className="text-[8px] font-black text-white/20 uppercase mt-4">{f === 1 ? 'GRAVES' : f === 2 ? 'MÉDIOS' : 'AGUDOS'}</span>
                </div>
              ))}
            </div>
          </section>

        </main>

        {/* FOOTER ACTIONS */}
        <footer className="p-8 border-t border-white/5 bg-black/40 backdrop-blur-md flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-4 rounded-full border border-white/10 text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all"
          >
            DESFAZER
          </button>
          <button 
            onClick={onClose}
            className="flex-1 py-4 rounded-full bg-white text-black text-[11px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            SALVAR
          </button>
        </footer>
      </div>
    </div>
  );
};

export default AudioPreferencesModal;
