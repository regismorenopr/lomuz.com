
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Globe, Users, Target, Search, Lock, Unlock, 
  Waves, Sliders, Timer, Zap, Mic2, ListMusic, 
  Sparkles, ShieldCheck, DollarSign, ArrowRight,
  Settings2, Activity, Volume2, Info, X, Check,
  CheckCircle2, Plus, ChevronRight, AlertCircle,
  Database, Gauge, Music, Headphones, VolumeX,
  Radio, HardDrive, Cpu, Power, MessageSquare,
  ShieldAlert
} from 'lucide-react';
import { Button, Card, Badge } from '../../components/ui';
import { ApiService } from '../../services/mockApi';
import { 
  SovereigntyScope, DSPConfig, ClientControls, 
  SovereigntyJob, Radio as RadioType
} from '../../types';

const AudioPreferencesView: React.FC = () => {
  // --- STATE ---
  const [scope, setScope] = useState<SovereigntyScope>(SovereigntyScope.NETWORK);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [clients, setClients] = useState<RadioType[]>([]);
  
  const [dsp, setDsp] = useState<DSPConfig>({
    masterVolume: 85, musicGain: 80, spokenGain: 100, bitrate: 32, // PADRÃO ALTERADO PARA 32
    normalizationEnabled: true, compressionEnabled: true, fadesEnabled: true,
    mixing: { m2m: 1.5, s2m: 1.0, m2s: 1.0, s2s: 0.5 }
  });

  const [controls, setControls] = useState({
    plRemove: true, plAdd: true, plSchedule: false,
    procNormalizer: true, procCompression: true, procFadeIn: true, procFadeOut: true,
    adIA: true, adPro: false, adImport: true,
    iaSmart: true
  });

  const [governance, setGovernance] = useState<Record<string, boolean>>({
    v1: true, v2: true, v3: false, v4: true, v5: true, v6: false, v7: true
  });

  const [job, setJob] = useState<SovereigntyJob>({ status: 'IDLE', progress: 0, targetCount: 0 });
  const [isConfirming, setIsConfirming] = useState(false);
  const [justification, setJustification] = useState('');

  // --- DATA LOADING ---
  useEffect(() => {
    ApiService.getClients().then(setClients);
  }, []);

  const segments = useMemo(() => {
    const s = Array.from(new Set(clients.map(c => typeof c.type === 'string' ? c.type : 'Varejo')));
    return s.sort();
  }, [clients]);

  const filteredTargets = useMemo(() => {
    if (scope === SovereigntyScope.SPECIFIC) {
      return clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (scope === SovereigntyScope.SEGMENT) {
      return segments.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return [];
  }, [scope, clients, segments, searchTerm]);

  const toggleTarget = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // --- LOGIC ---
  const impactCount = scope === SovereigntyScope.NETWORK ? clients.length : selectedIds.length;
  const isHQ = dsp.bitrate > 48;
  const hqFee = isHQ ? 1.25 : 0;
  const totalImpact = impactCount * hqFee;

  const handlePropagate = async () => {
    if (!justification && impactCount > 0) return;
    setIsConfirming(false);
    setJob({ status: 'RUNNING', progress: 0, targetCount: impactCount });

    for (let i = 0; i <= 100; i += 5) {
      setJob(prev => ({ ...prev, progress: i }));
      await new Promise(r => setTimeout(r, 60));
    }

    setJob(prev => ({ ...prev, status: 'SUCCESS' }));
    setTimeout(() => {
        setJob(prev => ({ ...prev, status: 'IDLE' }));
        setJustification('');
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-40">
      
      {/* 1. SELETOR DE ALVOS (TOP) */}
      <div className="bg-[#0D0D16] border border-white/5 rounded-[40px] p-8 shadow-huge backdrop-blur-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-lomuz-imperial/5 blur-[80px] pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="space-y-1">
             <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Soberania <span className="text-accent">Púrpura</span></h1>
             <p className="text-[10px] font-black text-lomuz-muted uppercase tracking-[0.2em]">Patch 246 • Engine de Governança Sonora</p>
          </div>

          <div className="flex bg-black/60 p-1.5 rounded-[24px] border border-white/10 shadow-inner">
             <button 
                onClick={() => { setScope(SovereigntyScope.SPECIFIC); setSelectedIds([]); }} 
                className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${scope === SovereigntyScope.SPECIFIC ? 'bg-blue-600 text-white shadow-lg' : 'text-white/30 hover:text-white'}`}
             >
                <Users size={14} /> Clientes
             </button>
             <button 
                onClick={() => { setScope(SovereigntyScope.SEGMENT); setSelectedIds([]); }} 
                className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${scope === SovereigntyScope.SEGMENT ? 'bg-lomuz-imperial text-white shadow-lg' : 'text-white/30 hover:text-white'}`}
             >
                <Target size={14} /> Segmentos
             </button>
             <button 
                onClick={() => { setScope(SovereigntyScope.NETWORK); setSelectedIds([]); }} 
                className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${scope === SovereigntyScope.NETWORK ? 'bg-accent text-white shadow-glow-accent' : 'text-white/30 hover:text-white'}`}
             >
                <Globe size={14} /> Toda a Rede
             </button>
          </div>
        </div>

        {scope !== SovereigntyScope.NETWORK && (
          <div className="mt-8 pt-8 border-t border-white/5 animate-in slide-in-from-top-4">
             <div className="relative flex items-center gap-4 bg-black/40 px-6 py-4 rounded-2xl border border-white/5">
                <Search className="text-white/20" size={18} />
                <input 
                    type="text" 
                    placeholder={scope === SovereigntyScope.SPECIFIC ? "Pesquisar unidades pelo nome..." : "Pesquisar segmentos comerciais..."} 
                    className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none placeholder:text-white/10 font-bold" 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                />
             </div>
             <div className="flex flex-wrap gap-2 mt-4 max-h-32 overflow-y-auto custom-scrollbar p-1">
                {filteredTargets.map((item: any) => {
                  const id = typeof item === 'string' ? item : item.id;
                  const name = typeof item === 'string' ? item : item.name;
                  const isSelected = selectedIds.includes(id);
                  return (
                    <button 
                        key={id} 
                        onClick={() => toggleTarget(id)} 
                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${isSelected ? 'bg-lomuz-imperial border-lomuz-imperial text-white shadow-glow' : 'bg-white/5 border-white/5 text-white/30 hover:border-white/10'}`}
                    >
                        {name}
                    </button>
                  );
                })}
             </div>
          </div>
        )}
      </div>

      {/* 2. LAYOUT PRINCIPAL (ESTEIRA VERTICAL + ASIDE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* COLUNA DE CARDS (LISTA VERTICAL) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* 1. VOLUME */}
          <PreferenceCard 
            index="01" title="Volume" desc="Ajuste fino de saída de áudio."
            governance={governance.v1} onToggleGov={() => setGovernance({...governance, v1: !governance.v1})}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black text-white/40 uppercase tracking-widest">
                     <span className="flex items-center gap-2"><Music size={12} className="text-lomuz-imperial" /> Ganho de Música</span>
                     <span className="text-white font-mono">{dsp.musicGain}%</span>
                  </div>
                  <input type="range" className="w-full h-1.5 bg-white/5 accent-lomuz-imperial" value={dsp.musicGain} onChange={e => setDsp({...dsp, musicGain: parseInt(e.target.value)})} />
               </div>
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black text-white/40 uppercase tracking-widest">
                     <span className="flex items-center gap-2"><Mic2 size={12} className="text-accent" /> Ganho de Vozes / Anúncios</span>
                     <span className="text-white font-mono">{dsp.spokenGain}%</span>
                  </div>
                  <input type="range" className="w-full h-1.5 bg-white/5 accent-accent" value={dsp.spokenGain} onChange={e => setDsp({...dsp, spokenGain: parseInt(e.target.value)})} />
               </div>
            </div>
          </PreferenceCard>

          {/* 2. MIXAGEM / TRANSIÇÃO */}
          <PreferenceCard 
            index="02" title="Mixagem / Transição" desc="Dinâmica de sobreposição de faixas."
            governance={governance.v2} onToggleGov={() => setGovernance({...governance, v2: !governance.v2})}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {Object.entries(dsp.mixing).map(([key, val]) => (
                 <div key={key} className="p-4 bg-black/40 border border-white/5 rounded-2xl flex flex-col items-center">
                    <p className="text-[8px] font-black text-white/20 uppercase mb-4 tracking-tighter">
                        {key === 'm2m' ? 'Mus ➔ Mus' : key === 's2m' ? 'Voz ➔ Mus' : key === 'm2s' ? 'Mus ➔ Voz' : 'Voz ➔ Voz'}
                    </p>
                    <span className="text-2xl font-black text-white font-mono leading-none mb-4">{val}s</span>
                    <input 
                        type="range" min="0" max="5" step="0.1" 
                        className="w-full h-1 bg-white/5 accent-lomuz-imperial" 
                        value={val} 
                        onChange={e => setDsp({...dsp, mixing: {...dsp.mixing, [key]: parseFloat(e.target.value)}})} 
                    />
                 </div>
               ))}
            </div>
          </PreferenceCard>

          {/* 3. PROCESSAMENTO DE ÁUDIO */}
          <PreferenceCard 
            index="03" title="Processamento de Áudio" desc="Engenharia de sinal IA."
            governance={governance.v3} onToggleGov={() => setGovernance({...governance, v3: !governance.v3})}
          >
            <div className="grid grid-cols-2 gap-4 mb-6">
                <ToggleOption 
                    label="Normalização IA" icon={Gauge} 
                    active={controls.procNormalizer} 
                    onClick={() => setControls({...controls, procNormalizer: !controls.procNormalizer})} 
                />
                <ToggleOption 
                    label="Compressão de Presença" icon={Cpu} 
                    active={controls.procCompression} 
                    onClick={() => setControls({...controls, procCompression: !controls.procCompression})} 
                />
                <ToggleOption 
                    label="Entrada Suave (Fade-in)" icon={Waves} 
                    active={controls.procFadeIn} 
                    onClick={() => setControls({...controls, procFadeIn: !controls.procFadeIn})} 
                />
                <ToggleOption 
                    label="Saída Suave (Fade-out)" icon={Waves} 
                    active={controls.procFadeOut} 
                    onClick={() => setControls({...controls, procFadeOut: !controls.procFadeOut})} 
                />
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-[9px] font-bold text-white/20 uppercase tracking-widest italic">
                <AlertCircle size={14} className="text-white/10" />
                Esta configuração está limitada à qualidade de streaming.
            </div>
          </PreferenceCard>

          {/* 4. QUALIDADE DE STREAMING */}
          <PreferenceCard 
            index="04" title="Qualidade de Streaming" desc="Largura de banda e fidelidade sonora."
            governance={governance.v4} onToggleGov={() => setGovernance({...governance, v4: !governance.v4})}
            variant="accent"
          >
            <div className="flex bg-black/60 p-1.5 rounded-[20px] border border-white/10 w-fit">
               {[
                 { v: 32, l: 'Ultra Econômico' }, 
                 { v: 48, l: 'Econômico' }, 
                 { v: 64, l: 'Padrão' }, 
                 { v: 96, l: 'HD' }, 
                 { v: 128, l: 'Mastering' }
               ].map(kb => (
                 <button 
                    key={kb.v} 
                    onClick={() => setDsp({...dsp, bitrate: kb.v as any})} 
                    className={`flex flex-col items-center justify-center px-8 py-4 rounded-xl transition-all ${dsp.bitrate === kb.v ? 'bg-white text-black shadow-huge' : 'text-white/20 hover:text-white hover:bg-white/5'}`}
                 >
                   <span className="text-lg font-black font-mono leading-none">{kb.v}k</span>
                   <span className="text-[7px] font-black uppercase tracking-widest mt-1 opacity-50">{kb.l}</span>
                 </button>
               ))}
            </div>
          </PreferenceCard>

          {/* 5. GERENCIAMENTO DE PLAYLISTS */}
          <PreferenceCard 
            index="05" title="Gerenciamento de Playlists" desc="Nível de autonomia do cliente final."
            governance={governance.v5} onToggleGov={() => setGovernance({...governance, v5: !governance.v5})}
          >
            <div className="grid grid-cols-3 gap-4">
                <ToggleOption 
                    label="Remover Playlists" icon={VolumeX} 
                    active={controls.plRemove} 
                    onClick={() => setControls({...controls, plRemove: !controls.plRemove})} 
                />
                <ToggleOption 
                    label="Adicionar Playlists" icon={Plus} 
                    active={controls.plAdd} 
                    onClick={() => setControls({...controls, plAdd: !controls.plAdd})} 
                />
                <ToggleOption 
                    label="Agendar Locais" icon={Timer} 
                    active={controls.plSchedule} 
                    onClick={() => setControls({...controls, plSchedule: !controls.plSchedule})} 
                />
            </div>
          </PreferenceCard>

          {/* 6. MODO INTELIGENTE */}
          <PreferenceCard 
            index="06" title="Modo Inteligente" desc="Curadoria autônoma via algoritmo Lomuz."
            governance={governance.v6} onToggleGov={() => setGovernance({...governance, v6: !governance.v6})}
          >
            <div className="flex items-center justify-between p-6 bg-lomuz-imperial/5 border border-lomuz-imperial/20 rounded-[32px] overflow-hidden">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-lomuz-imperial/10 rounded-2xl flex items-center justify-center text-lomuz-imperial shadow-glow"><Power size={32} /></div>
                  <div className="max-w-md">
                    <h4 className="text-sm font-black text-white uppercase italic mb-1">Switch Mestre de IA</h4>
                    <p className="text-[9px] text-lomuz-muted uppercase tracking-widest font-bold leading-relaxed">
                        Deixe que a IA realize a troca automática das playlists para a melhor experiência sensorial conforme o fluxo do PDV.
                    </p>
                  </div>
               </div>
               <button 
                    onClick={() => setControls({...controls, iaSmart: !controls.iaSmart})}
                    className={`w-14 h-8 rounded-full relative transition-all duration-300 shrink-0 ${controls.iaSmart ? 'bg-lomuz-imperial shadow-glow' : 'bg-white/10'}`}
               >
                  <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all shadow-sm ${controls.iaSmart ? 'left-7' : 'left-1'}`} />
               </button>
            </div>
          </PreferenceCard>

          {/* 7. GERAR ANÚNCIOS */}
          <PreferenceCard 
            index="07" title="Gerar Anúncios" desc="Protocolos de produção de spots."
            governance={governance.v7} onToggleGov={() => setGovernance({...governance, v7: !governance.v7})}
          >
             <div className="grid grid-cols-3 gap-4">
                <ToggleOption 
                    label="Voz Virtual (IA)" icon={Sparkles} 
                    active={controls.adIA} 
                    onClick={() => setControls({...controls, adIA: !controls.adIA})} 
                />
                <ToggleOption 
                    label="Pro Studio (Voz Real)" icon={Mic2} 
                    active={controls.adPro} 
                    onClick={() => setControls({...controls, adPro: !controls.adPro})} 
                />
                <ToggleOption 
                    label="Importação Direta" icon={HardDrive} 
                    active={controls.adImport} 
                    onClick={() => setControls({...controls, adImport: !controls.adImport})} 
                />
             </div>
          </PreferenceCard>

        </div>

        {/* 3. PAINEL DE IMPACTO (ASIDE STICKY) - REDIMENSIONADO */}
        <aside className="lg:col-span-4 space-y-5 sticky top-24">
          <Card className="p-7 border-accent/20 bg-[#0D0D16]/90 backdrop-blur-3xl shadow-huge relative overflow-hidden rounded-[32px]">
             <div className="absolute -top-12 -right-12 opacity-[0.03] rotate-12 pointer-events-none"><Cpu size={220} className="text-accent" /></div>
             
             <div className="flex items-center gap-2.5 mb-8">
                <Gauge size={16} className="text-accent" />
                <h3 className="text-[9px] font-black text-accent uppercase tracking-[0.4em]">Audit de Impacto</h3>
             </div>
             
             <div className="space-y-7 mb-10">
                <div className="flex justify-between items-center border-b border-white/5 pb-5">
                   <div className="space-y-0.5">
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block">Unidades Alvo</span>
                      <span className="text-[11px] font-bold text-white/30 italic">Total do escopo</span>
                   </div>
                   <span className="text-4xl font-black text-white font-mono tracking-tighter leading-none">{impactCount}</span>
                </div>
                
                <div className="flex justify-between items-center border-b border-white/5 pb-5">
                   <div className="space-y-0.5">
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block">Qualidade</span>
                      <span className="text-[11px] font-bold text-accent italic">{isHQ ? 'High Fidelity' : 'Eco-Stream'}</span>
                   </div>
                   <span className="text-3xl font-black text-white font-mono leading-none">{dsp.bitrate}k</span>
                </div>

                <div className="flex justify-between items-center border-b border-white/5 pb-5">
                   <div className="space-y-0.5">
                      <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block">Impacto Mensal</span>
                      <span className="text-[11px] font-bold text-white/30 italic">Infra Cloud Extra</span>
                   </div>
                   <span className="text-3xl font-black text-accent font-mono leading-none tracking-tight">US$ {totalImpact.toFixed(2)}</span>
                </div>
             </div>

             {job.status === 'RUNNING' ? (
               <div className="space-y-3 py-3">
                  <div className="flex justify-between text-[9px] font-black text-white uppercase tracking-widest">
                    <span>Sincronizando Frota...</span>
                    <span className="text-accent">{job.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-accent shadow-glow-accent transition-all duration-300" style={{ width: `${job.progress}%` }} />
                  </div>
               </div>
             ) : job.status === 'SUCCESS' ? (
               <div className="p-5 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center gap-3 text-green-500 animate-in zoom-in">
                  <CheckCircle2 size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Soberania Ativa</span>
               </div>
             ) : (
               <button 
                  onClick={() => impactCount > 0 ? setIsConfirming(true) : null} 
                  disabled={impactCount === 0} 
                  className="w-full h-16 bg-accent text-white text-xs font-black uppercase tracking-[0.3em] shadow-glow-accent rounded-2xl hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-10 disabled:grayscale flex items-center justify-center gap-3 group"
               >
                 Propagar Soberania <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
               </button>
             )}
          </Card>

          <div className="p-5 bg-white/[0.02] border border-white/5 rounded-[24px] flex items-start gap-3">
             <Info size={16} className="text-accent/40 shrink-0 mt-0.5" />
             <p className="text-[9px] font-medium text-white/20 uppercase leading-relaxed tracking-wide">
                Bitrates superiores a 48k demandam processamento prioritário em tempo real (Lossless Edge). Os custos são recalculados a cada ciclo de faturamento.
             </p>
          </div>
        </aside>
      </div>

      {/* 4. PROGRESS BAR (FIXED BOTTOM) */}
      {job.status === 'RUNNING' && (
        <div className="fixed bottom-12 left-0 right-0 h-1 z-[300] flex justify-center px-4">
            <div className="w-full max-w-7xl h-full bg-lomuz-imperial/20 rounded-full overflow-hidden blur-[1px]">
                <div className="h-full bg-accent animate-pulse shadow-glow-accent" style={{ width: `${job.progress}%` }} />
            </div>
        </div>
      )}

      {/* 5. MODAL DE CONFIRMAÇÃO */}
      {isConfirming && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-[#020617]/95 backdrop-blur-3xl animate-in fade-in duration-300">
           <Card className="max-w-2xl w-full p-12 border-lomuz-imperial/20 bg-[#0D0D16] shadow-huge rounded-[48px] relative overflow-hidden">
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-lomuz-imperial/5 blur-[100px]" />
              
              <div className="text-center space-y-6 relative z-10">
                 <div className="w-24 h-24 bg-lomuz-imperial/10 rounded-[32px] flex items-center justify-center mx-auto text-lomuz-imperial border border-lomuz-imperial/20 shadow-glow mb-2">
                    <ShieldAlert size={48} />
                 </div>
                 <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Autorizar Lançamento</h2>
                 <p className="text-sm text-lomuz-muted max-w-sm mx-auto leading-relaxed font-medium">
                    Confirmar propagação de novas diretrizes sonoras para **{impactCount} unidades**. Esta ação é auditável e irreversível.
                 </p>
              </div>

              <div className="mt-10 space-y-8 relative z-10">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-lomuz-muted uppercase tracking-[0.3em] ml-4">Justificativa Operacional</label>
                    <textarea 
                        autoFocus 
                        placeholder="Descreva o motivo desta alteração global..." 
                        className="w-full bg-black/40 border border-white/10 rounded-[32px] p-8 text-white text-sm focus:border-lomuz-imperial outline-none h-40 resize-none font-medium leading-relaxed" 
                        value={justification} 
                        onChange={e => setJustification(e.target.value)} 
                    />
                 </div>
                 
                 <div className="flex flex-col gap-4">
                    <Button 
                        variant="gold" 
                        disabled={!justification} 
                        className="w-full h-16 font-black uppercase text-xs tracking-[0.3em] shadow-glow" 
                        onClick={handlePropagate}
                    >
                        Confirmar Propagação Púrpura
                    </Button>
                    <button 
                        onClick={() => { setIsConfirming(false); setJustification(''); }} 
                        className="text-[10px] font-black text-white/20 uppercase hover:text-white transition-all py-3 tracking-widest"
                    >
                        Abortar Lançamento
                    </button>
                 </div>
              </div>
           </Card>
        </div>
      )}
    </div>
  );
};

// --- HELPER COMPONENTS ---

const PreferenceCard = ({ index, title, desc, children, governance, onToggleGov, variant = 'imperial' }: any) => {
  const accentClass = variant === 'accent' ? 'border-accent/40' : 'border-lomuz-imperial/40';
  const textAccent = variant === 'accent' ? 'text-accent' : 'text-lomuz-imperial';

  return (
    <Card className={`p-10 border-white/5 bg-black/40 backdrop-blur-3xl hover:border-white/10 transition-all rounded-[40px] relative overflow-hidden group border-l-2 ${accentClass} shadow-huge`}>
      <div className="flex justify-between items-start gap-4 mb-10 relative z-10">
         <div className="flex items-center gap-6">
            <span className="text-4xl font-black text-white/5 font-mono italic leading-none">{index}</span>
            <div className="space-y-1">
               <h3 className={`text-xl font-black ${textAccent} uppercase tracking-tight italic`}>{title}</h3>
               <p className="text-[10px] text-lomuz-muted uppercase tracking-[0.2em] font-black opacity-40">{desc}</p>
            </div>
         </div>
         <button 
            onClick={onToggleGov} 
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border transition-all ${governance ? 'bg-accent/10 border-accent text-accent shadow-glow-accent' : 'bg-white/5 border-white/10 text-white/20 hover:border-white/20'}`}
         >
           {governance ? <Lock size={12} /> : <Unlock size={12} />}
           <span className="text-[8px] font-black uppercase tracking-widest">{governance ? 'Não permitir para o cliente' : 'Permitir para o cliente'}</span>
         </button>
      </div>
      <div className="relative z-10 animate-in fade-in duration-700">
         {children}
      </div>
    </Card>
  );
};

const ToggleOption = ({ label, icon: Icon, active, onClick }: any) => (
  <button 
    onClick={onClick} 
    className={`flex items-center justify-between gap-4 p-5 rounded-[24px] border transition-all group ${active ? 'bg-white/[0.04] border-white/20 text-white shadow-lg' : 'bg-black/20 border-white/5 text-white/20 hover:border-white/10'}`}
  >
    <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl transition-all ${active ? 'bg-lomuz-imperial text-white shadow-glow' : 'bg-white/5 text-white/20 group-hover:text-white/40'}`}>
            <Icon size={16} />
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest text-left">{label}</span>
    </div>
    <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-accent shadow-glow-accent animate-pulse' : 'bg-white/10'}`} />
  </button>
);

export default AudioPreferencesView;
