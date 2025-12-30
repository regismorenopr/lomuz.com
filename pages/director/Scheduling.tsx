
import React, { useState, useMemo, useEffect } from 'react';
import { 
  ArrowLeft, ArrowRight, User, Home, Building2, Users, 
  Search, Wand2, Mic, FolderOpen, Calendar, Clock, 
  Timer, Zap, Guitar, ZapOff, Sparkles, Check, 
  X, Plus, Trash2, Info, ChevronRight,
  ShieldAlert, Send, Music, Headphones, Volume2, Gauge, 
  Cpu, Waves, ListMusic, Repeat, Infinity, Database, AlertCircle, RefreshCw,
  Ticket, Terminal, Layers, Activity, Target
} from 'lucide-react';
import { Button, Card, Badge } from '../../components/ui';
import { ApiService } from '../../services/mockApi';
import { Radio } from '../../types';

type Step = 1 | 2 | 3 | 4 | 5;

interface WizardData {
  target: 'SPECIFIC' | 'SEGMENT' | 'NETWORK' | 'BASE';
  selectedTargetId: string;
  protocol: 'IA' | 'STUDIO' | 'IMPORT' | null;
  title: string;
  script: string;
  voiceId: string;
  activeDays: number[];
  cadence: 'RECURRENT' | 'FIXED';
  startTime: string;
  endTime: string;
  interval: number;
  fixedSlots: string[];
  isIndefinite: boolean;
  entryProtocol: 'HARMONICO' | 'INTERRUPCAO';
}

const VOICES = [
  { id: 'RICARDO', name: 'RICARDO', tone: 'FORMAL', style: 'Sóbrio e Autoritativo' },
  { id: 'ANTONIO', name: 'ANTÔNIO', tone: 'FORMAL', style: 'Sério e Tradicional' },
  { id: 'HELENA', name: 'HELENA', tone: 'AMIGÁVEL', style: 'Suave e Empática' },
  { id: 'BEATRIZ', name: 'BEATRIZ', tone: 'FORMAL', style: 'Elegante e Profissional' },
  { id: 'GAEL', name: 'GAEL', tone: 'AMIGÁVEL', style: 'Dinâmico e Urbano' },
  { id: 'MAYA', name: 'MAYA', tone: 'VENDEDOR', style: 'Vibrante e Energético' },
];

const SchedulingPage: React.FC = () => {
  const [step, setStep] = useState<Step>(1);
  const [clients, setClients] = useState<Radio[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newSlot, setNewSlot] = useState('12:00');
  const [isLaunching, setIsLaunching] = useState(false);

  // PALETA STUDIO NIGHT (Patch 260)
  const INDIGO = "#6366f1";
  const ROSE = "#f43f5e";
  const CARBON = "#050505";

  const [data, setData] = useState<WizardData>({
    target: 'SPECIFIC',
    selectedTargetId: '',
    protocol: null,
    title: '',
    script: '',
    voiceId: 'RICARDO',
    activeDays: [1, 2, 3, 4, 5],
    cadence: 'RECURRENT',
    startTime: '08:00',
    endTime: '20:00',
    interval: 30,
    fixedSlots: [],
    isIndefinite: true,
    entryProtocol: 'HARMONICO'
  });

  useEffect(() => {
    ApiService.getClients().then(setClients);
  }, []);

  const filteredClients = useMemo(() => 
    clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
  , [clients, searchTerm]);

  const isStepValid = (s: number) => {
    switch(s) {
      case 1: return !!data.protocol && (data.target === 'BASE' || data.target === 'NETWORK' || !!data.selectedTargetId);
      case 2: return data.title.length >= 3 && data.script.length >= 10;
      case 3: return data.protocol === 'IA' ? !!data.voiceId : true;
      case 4: return data.activeDays.length > 0 && (data.cadence === 'RECURRENT' ? (!!data.startTime && !!data.endTime) : data.fixedSlots.length > 0);
      default: return true;
    }
  };

  const handleNext = () => isStepValid(step) && setStep((prev) => (prev + 1) as Step);
  const handleBack = () => setStep((prev) => (prev - 1) as Step);

  const toggleDay = (day: number) => {
    setData(prev => ({
      ...prev,
      activeDays: prev.activeDays.includes(day) 
        ? prev.activeDays.filter(d => d !== day) 
        : [...prev.activeDays, day]
    }));
  };

  const addSlot = () => {
    if (!data.fixedSlots.includes(newSlot)) {
      setData(prev => ({ ...prev, fixedSlots: [...prev.fixedSlots, newSlot].sort() }));
    }
  };

  const assistantMessages = {
    1: "Protocolo de Ingestão iniciado. Qual o destino e o método de produção para este novo ativo?",
    2: "O roteiro é a alma do anúncio. O que precisamos comunicar ao seu público?",
    3: "Arquétipia Vocal. Defina o tom que melhor personifica a identidade sonora da marca.",
    4: "Logística de Grade P65. Vamos orquestrar a cadência exata dos disparos na rede.",
    5: "Ticket de Produção Finalizado. Revise o dossiê antes de autorizar o lançamento."
  };

  const onConfirmLaunch = async () => {
    setIsLaunching(true);
    await new Promise(r => setTimeout(r, 2500));
    setIsLaunching(false);
    alert("Protocolo P65 autorizado! A mídia está sendo propagada para as unidades selecionadas.");
    setStep(1);
    setData({ ...data, protocol: null, title: '', script: '', fixedSlots: [] });
  };

  return (
    <div className="max-w-6xl mx-auto pb-40 animate-in fade-in duration-1000">
      
      {/* STUDIO ARCHITECT ASSISTANT */}
      <div className="flex items-center gap-8 mb-12 bg-white/[0.02] p-10 rounded-[48px] border border-white/5 backdrop-blur-[40px] shadow-huge relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 blur-[100px] pointer-events-none" />
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-rose-500/10 rounded-3xl border border-white/10 flex items-center justify-center relative shadow-glow">
          <Sparkles size={32} style={{ color: INDIGO }} className="animate-pulse" />
          <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-indigo-600 rounded-full border-4 border-[#050505] flex items-center justify-center shadow-xl">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] mb-2" style={{ color: INDIGO }}>Studio Manager Assistant</h2>
          <p className="text-white/90 font-bold italic text-2xl tracking-tight leading-tight">"{assistantMessages[step]}"</p>
        </div>
      </div>

      <Card className="bg-[#0A0A0A]/60 border-white/5 shadow-huge rounded-[56px] overflow-hidden p-0 backdrop-blur-[40px]">
        <div className="p-16 min-h-[600px]">
          
          {/* STEP 1: ALVO & PROTOCOLO */}
          {step === 1 && (
            <div className="space-y-16 animate-in slide-in-from-right-8 duration-700">
              <section className="space-y-8">
                 <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white/40">01</span>
                    <h3 className="text-[11px] font-black text-white/50 uppercase tracking-[0.4em]">Destino do Agendamento:</h3>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    <ScopeCard active={data.target === 'SPECIFIC'} onClick={() => setData({...data, target: 'SPECIFIC'})} icon={User} title="Cliente Específico" accent={INDIGO} />
                    <ScopeCard active={data.target === 'SEGMENT'} onClick={() => setData({...data, target: 'SEGMENT'})} icon={Layers} title="Segmento Comercial" accent={INDIGO} />
                    <ScopeCard active={data.target === 'NETWORK'} onClick={() => setData({...data, target: 'NETWORK'})} icon={Building2} title="Rede Organizacional" accent={INDIGO} />
                    <ScopeCard active={data.target === 'BASE'} onClick={() => setData({...data, target: 'BASE'})} icon={Users} title="Toda a Base" accent={INDIGO} />
                 </div>

                 {data.target === 'SPECIFIC' && (
                    <div className="pt-6 animate-in slide-in-from-top-4">
                       <div className="relative group max-w-xl">
                          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" size={20} />
                          <input 
                            type="text" placeholder="Localizar unidade para veiculação..." 
                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-white text-sm focus:border-indigo-500 outline-none transition-all font-bold"
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                          />
                       </div>
                       <div className="flex flex-wrap gap-2 mt-4 max-h-40 overflow-y-auto custom-scrollbar p-1">
                          {filteredClients.map(c => (
                            <button 
                                key={c.id} 
                                onClick={() => setData({...data, selectedTargetId: c.id})}
                                className={`px-5 py-2.5 rounded-xl border text-[10px] font-black uppercase transition-all ${data.selectedTargetId === c.id ? 'bg-indigo-500/10 text-white border-indigo-500 shadow-glow' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'}`}
                            >
                                {c.name}
                            </button>
                          ))}
                       </div>
                    </div>
                 )}
              </section>

              <section className="space-y-8 pt-10 border-t border-white/5">
                 <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white/40">02</span>
                    <h3 className="text-[11px] font-black text-white/50 uppercase tracking-[0.4em]">Protocolo de Produção:</h3>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ProtocolCard active={data.protocol === 'IA'} onClick={() => setData({...data, protocol: 'IA'})} icon={Wand2} title="LOCUTOR NEURAL" desc="IA Generativa" accent={INDIGO} />
                    <ProtocolCard active={data.protocol === 'STUDIO'} onClick={() => setData({...data, protocol: 'STUDIO'})} icon={Mic} title="ESTÚDIO HUMANO" desc="Voz Profissional" accent={INDIGO} />
                    <ProtocolCard active={data.protocol === 'IMPORT'} onClick={() => setData({...data, protocol: 'IMPORT'})} icon={FolderOpen} title="IMPORTAÇÃO DIRETA" desc="Arquivo MP3/FLAC" accent={INDIGO} />
                 </div>
              </section>
            </div>
          )}

          {/* STEP 2: CORAÇÃO ESTRATÉGICO */}
          {step === 2 && (
            <div className="space-y-12 animate-in slide-in-from-right-8 duration-700 max-w-4xl mx-auto">
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
                    <ChevronRight size={14} style={{ color: INDIGO }} /> Título do Anúncio
                  </label>
                  <input 
                    autoFocus
                    type="text" value={data.title} onChange={e => setData({...data, title: e.target.value})}
                    placeholder="Ex: Campanha Promo Inverno - Studio"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-3xl py-7 px-10 text-white text-xl font-black focus:border-indigo-500 outline-none transition-all placeholder:text-white/5 shadow-inner"
                  />
               </div>
               <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
                    <ChevronRight size={14} style={{ color: INDIGO }} /> Roteiro de Locução
                  </label>
                  <textarea 
                    value={data.script} onChange={e => setData({...data, script: e.target.value})}
                    placeholder="Descreva aqui o roteiro para locução ou instruções do spot..."
                    className="w-full min-h-[350px] bg-white/[0.03] border border-white/10 rounded-[40px] p-10 text-indigo-100 text-lg font-mono focus:border-indigo-500 outline-none transition-all resize-none leading-relaxed shadow-inner"
                  />
                  <div className="flex justify-end px-4">
                     <p className={`text-[10px] font-black uppercase tracking-widest ${data.script.length < 10 ? 'text-rose-500' : 'text-white/20'}`}>
                        {data.script.length < 10 ? 'Mínimo 10 caracteres' : `${data.script.length} caracteres`}
                     </p>
                  </div>
               </div>
            </div>
          )}

          {/* STEP 3: ARQUETIPIA VOCAL */}
          {step === 3 && (
            <div className="space-y-12 animate-in slide-in-from-right-8 duration-700">
               <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white/40">03</span>
                  <h3 className="text-[11px] font-black text-white/50 uppercase tracking-[0.4em]">Seleção de Arquétipo Vocal:</h3>
               </div>
               {data.protocol === 'IA' ? (
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {VOICES.map((v) => (
                      <button 
                        key={v.id} onClick={() => setData({...data, voiceId: v.id})}
                        className={`group flex flex-col items-start p-10 rounded-[40px] border-2 transition-all text-left relative overflow-hidden ${data.voiceId === v.id ? 'bg-indigo-500/5 border-indigo-500 shadow-glow' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
                      >
                        {data.voiceId === v.id && (
                          <div className="absolute top-6 right-6 bg-indigo-500 text-white px-3 py-1 rounded-md text-[8px] font-black uppercase animate-pulse shadow-glow">SELECTED</div>
                        )}
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-all ${data.voiceId === v.id ? 'bg-indigo-500 text-white shadow-huge' : 'bg-white/5 text-white/20'}`}>
                           <Mic size={24} />
                        </div>
                        <h4 className={`text-xl font-black uppercase mb-1 ${data.voiceId === v.id ? 'text-white' : 'text-white/40'}`}>{v.name}</h4>
                        <div className="flex gap-2 mb-4">
                          <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${data.voiceId === v.id ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-white/10'}`}>{v.tone}</span>
                        </div>
                        <p className="text-[10px] text-white/30 font-medium leading-relaxed italic">{v.style}</p>
                      </button>
                    ))}
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-white/[0.02] rounded-[48px] border border-dashed border-white/10">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-white/20">
                       <Mic size={40} />
                    </div>
                    <div>
                       <h4 className="text-xl font-black text-white uppercase italic">Protocolo Externo</h4>
                       <p className="text-xs text-lomuz-muted max-w-sm mx-auto">Vozes dinâmicas não disponíveis para o protocolo de Estúdio ou Importação Direta. A voz será processada manualmente.</p>
                    </div>
                 </div>
               )}
            </div>
          )}

          {/* STEP 4: ENGENHARIA DE GRADE P65 */}
          {step === 4 && (
            <div className="space-y-16 animate-in slide-in-from-right-8 duration-700">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                  <div className="space-y-12">
                    <div className="space-y-6">
                      <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-3">
                         <Calendar size={14} style={{ color: INDIGO }} /> 1. Dias de Atuação
                      </h3>
                      <div className="flex flex-wrap gap-3">
                        {['DOM','SEG','TER','QUA','QUI','SEX','SAB'].map((d, i) => (
                          <button
                            key={i} onClick={() => toggleDay(i)}
                            className={`w-16 h-16 rounded-[24px] border-2 font-black text-xs transition-all flex items-center justify-center ${data.activeDays.includes(i) ? 'text-white border-indigo-500 bg-indigo-500/10 shadow-glow' : 'border-white/5 bg-white/5 text-white/20 hover:border-white/10'}`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-3">
                         <Zap size={14} style={{ color: INDIGO }} /> 3. Protocolo de Entrada
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                         <button 
                            onClick={() => setData({...data, entryProtocol: 'HARMONICO'})}
                            className={`flex items-center gap-8 p-8 rounded-[40px] border-2 transition-all text-left ${data.entryProtocol === 'HARMONICO' ? 'bg-white/5 border-indigo-500 shadow-glow' : 'bg-white/[0.01] border-white/5 opacity-40'}`}
                          >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${data.entryProtocol === 'HARMONICO' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5'}`}><Guitar size={24} /></div>
                            <div><h4 className="text-base font-black text-white uppercase italic">Harmônico</h4><p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">Espera o término da música atual</p></div>
                         </button>
                         <button 
                            onClick={() => setData({...data, entryProtocol: 'INTERRUPCAO'})}
                            className={`flex items-center gap-8 p-8 rounded-[40px] border-2 transition-all text-left ${data.entryProtocol === 'INTERRUPCAO' ? 'bg-white/5 border-rose-500 shadow-glow' : 'bg-white/[0.01] border-white/5 opacity-40'}`}
                          >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${data.entryProtocol === 'INTERRUPCAO' ? 'bg-rose-500/20 text-rose-400' : 'bg-white/5'}`}><ZapOff size={24} /></div>
                            <div><h4 className="text-base font-black text-white uppercase italic">Corte Seco (P0)</h4><p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">Interrupção imediata do sinal</p></div>
                         </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-3">
                       <Timer size={14} style={{ color: INDIGO }} /> 2. Cadência de Fluxo
                    </h3>
                    <div className="bg-white/[0.03] border border-white/5 p-10 rounded-[56px] space-y-10 shadow-huge">
                       <div className="flex bg-black/40 p-2 rounded-[24px] border border-white/10">
                          <button 
                            onClick={() => setData({...data, cadence: 'RECURRENT'})}
                            className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${data.cadence === 'RECURRENT' ? 'bg-indigo-500 text-white shadow-lg' : 'text-white/20 hover:text-white'}`}
                          >Recorrente</button>
                          <button 
                            onClick={() => setData({...data, cadence: 'FIXED'})}
                            className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${data.cadence === 'FIXED' ? 'bg-indigo-500 text-white shadow-lg' : 'text-white/20 hover:text-white'}`}
                          >Slots Fixos</button>
                       </div>

                       {data.cadence === 'RECURRENT' ? (
                          <div className="space-y-10 animate-in fade-in">
                             <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-3">
                                   <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-4">Início Janela</label>
                                   <input type="time" value={data.startTime} onChange={e => setData({...data, startTime: e.target.value})} className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 text-white font-mono text-center text-xl focus:border-indigo-500 outline-none" />
                                </div>
                                <div className="space-y-3">
                                   <label className="text-[9px] font-black text-white/30 uppercase tracking-widest ml-4">Término Janela</label>
                                   <input type="time" value={data.endTime} onChange={e => setData({...data, endTime: e.target.value})} className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 text-white font-mono text-center text-xl focus:border-indigo-500 outline-none" />
                                </div>
                             </div>
                             <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                   <span className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2"><Repeat size={12} style={{ color: INDIGO }} /> Intervalo de Repetição</span>
                                   <span className="text-xl font-black text-indigo-400 font-mono">{data.interval} min</span>
                                </div>
                                <input type="range" min="5" max="120" step="5" value={data.interval} onChange={e => setData({...data, interval: parseInt(e.target.value)})} className="w-full h-1.5 bg-white/5 accent-indigo-500 rounded-full" />
                             </div>
                             <div className="pt-8 border-t border-white/5">
                                <label className="flex items-center gap-4 cursor-pointer group">
                                    <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${data.isIndefinite ? 'bg-indigo-500 border-indigo-500 shadow-glow' : 'border-white/10'}`}>
                                        {data.isIndefinite && <Check size={20} className="text-white" strokeWidth={4} />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={data.isIndefinite} onChange={e => setData({...data, isIndefinite: e.target.checked})} />
                                    <div>
                                       <span className="text-[11px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">Vigência Indeterminada</span>
                                       <p className="text-[8px] font-bold text-white/10 uppercase tracking-tighter mt-1">Este protocolo não expira automaticamente no tempo</p>
                                    </div>
                                    <Infinity size={24} className={`ml-auto ${data.isIndefinite ? 'text-indigo-400 animate-pulse' : 'text-white/5'}`} />
                                </label>
                             </div>
                          </div>
                       ) : (
                          <div className="space-y-8 animate-in fade-in">
                             <div className="flex gap-3">
                                <input type="time" value={newSlot} onChange={e => setNewSlot(e.target.value)} className="flex-1 bg-black/60 border border-white/10 rounded-2xl px-6 py-4 text-white font-mono text-xl outline-none focus:border-indigo-500" />
                                <button onClick={addSlot} className="p-4 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl hover:bg-indigo-500 hover:text-white transition-all shadow-glow"><Plus size={24} /></button>
                             </div>
                             <div className="grid grid-cols-3 gap-3 max-h-56 overflow-y-auto custom-scrollbar pr-2">
                                {data.fixedSlots.map(s => (
                                  <div key={s} className="flex items-center justify-between bg-white/5 border border-white/5 rounded-2xl px-4 py-3 group">
                                     <span className="text-sm font-mono font-black text-white/80">{s}</span>
                                     <button onClick={() => setData({...data, fixedSlots: data.fixedSlots.filter(fs => fs !== s)})} className="text-white/10 hover:text-rose-500 transition-colors"><X size={14}/></button>
                                  </div>
                                ))}
                                {data.fixedSlots.length === 0 && <div className="col-span-3 py-10 text-center text-[10px] font-black text-white/10 uppercase tracking-widest border-2 border-dashed border-white/5 rounded-3xl">Grade de Horários Vazia</div>}
                             </div>
                          </div>
                       )}
                    </div>
                  </div>
               </div>
            </div>
          )}

          {/* STEP 5: DOSSIÊ FINAL */}
          {step === 5 && (
            <div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-700 relative">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.02] rotate-[-15deg]">
                  <Ticket size={500} />
               </div>

               <div className="relative z-10 space-y-16">
                  <div className="flex justify-between items-start">
                     <div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.5em] mb-3" style={{ color: INDIGO }}>Lomuz Production Ticket</h4>
                        <h3 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-none">{data.title || 'PROJECT_UNNAMED'}</h3>
                        <div className="flex items-center gap-3 mt-6">
                           <Badge status="PRONTO" />
                           <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Protocolo Validado</span>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-2">Volume Operacional</p>
                        <div className="flex flex-col items-end">
                           <div className="flex items-baseline gap-2">
                              <span className="text-6xl font-black text-white font-mono">{data.cadence === 'FIXED' ? data.fixedSlots.length : 'RECOR.'}</span>
                              <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">Slots/Dia</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-20 pt-16 border-t border-white/5">
                     <div className="space-y-10">
                        <h5 className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em] flex items-center gap-3">
                           <Cpu size={14} style={{ color: INDIGO }} /> Configuração Técnica
                        </h5>
                        <div className="space-y-6">
                           <SummaryItem label="Protocolo" value={data.protocol === 'IA' ? 'Neural Engine v2' : data.protocol === 'STUDIO' ? 'Human Studio' : 'Direct Import'} />
                           <SummaryItem label="Arquétipo Vocal" value={data.protocol === 'IA' ? data.voiceId : 'N/A'} />
                           <SummaryItem label="Regra de Mixagem" value={data.entryProtocol === 'HARMONICO' ? 'Harmônico' : 'Interrupção P0'} />
                        </div>
                     </div>
                     <div className="space-y-10">
                        <h5 className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em] flex items-center gap-3">
                           <Activity size={14} style={{ color: INDIGO }} /> Janela de Audiência
                        </h5>
                        <div className="space-y-6">
                           <SummaryItem label="Alvo de Escopo" value={data.target === 'BASE' ? 'Toda a Rede' : data.target === 'NETWORK' ? 'Organização' : 'Unidade Específica'} />
                           <SummaryItem label="Janela Temporal" value={data.cadence === 'RECURRENT' ? `${data.startTime} ➔ ${data.endTime}` : `${data.fixedSlots.length} Horários Fixos`} />
                           <div className="flex flex-wrap gap-2 pt-2">
                              {data.activeDays.map(d => (
                                 <span key={d} className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[9px] font-black rounded-lg border border-indigo-500/20 uppercase tracking-tighter">
                                   {['DOM','SEG','TER','QUA','QUI','SEX','SAB'][d]}
                                 </span>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

        </div>

        {/* FOOTER NAVEGAÇÃO */}
        <footer className="p-12 border-t border-white/5 bg-black/60 backdrop-blur-[40px] flex items-center justify-between">
          <div className="flex items-center gap-10">
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] mb-3">Progresso do Protocolo</span>
               <div className="flex gap-2">
                  {[1,2,3,4,5].map(s => (
                    <div key={s} className={`h-1.5 rounded-full transition-all duration-700 ${step >= s ? 'w-12 shadow-glow' : 'w-3 bg-white/5'}`} style={{ backgroundColor: step >= s ? INDIGO : '' }} />
                  ))}
               </div>
            </div>
          </div>

          <div className="flex gap-6">
            {step > 1 && (
              <button 
                onClick={handleBack} 
                className="h-16 px-12 rounded-[24px] text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all border border-white/5 hover:bg-white/5 flex items-center gap-3"
              >
                <ArrowLeft size={16} /> Retroceder
              </button>
            )}
            
            {step < 5 ? (
              <button 
                onClick={handleNext} 
                disabled={!isStepValid(step)}
                className={`h-16 px-16 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3 shadow-huge ${isStepValid(step) ? 'bg-white text-black hover:bg-indigo-500 hover:text-white hover:shadow-glow' : 'bg-white/5 text-white/20 cursor-not-allowed opacity-50'}`}
              >
                Prosseguir <ArrowRight size={16} />
              </button>
            ) : (
              <button 
                onClick={onConfirmLaunch} 
                disabled={isLaunching}
                className="h-20 px-24 rounded-[32px] text-xs font-black uppercase tracking-[0.4em] shadow-glow italic text-white transition-all hover:scale-105 active:scale-95 flex items-center gap-4"
                style={{ backgroundColor: INDIGO }}
              >
                {isLaunching ? (
                   <> <RefreshCw size={20} className="animate-spin" /> PROCESSANDO... </>
                ) : (
                   <> CONFIRMAR E LANÇAR ❯ </>
                )}
              </button>
            )}
          </div>
        </footer>
      </Card>
    </div>
  );
};

// --- SUB-COMPONENTS (PATCH 260) ---

const ScopeCard = ({ active, onClick, icon: Icon, title, accent }: any) => (
  <button 
    onClick={onClick}
    className={`p-8 rounded-[40px] border-2 transition-all flex flex-col items-center justify-center gap-5 h-full group relative overflow-hidden ${active ? 'bg-white/5 shadow-glow scale-[1.05]' : 'bg-black/40 border-white/5 text-white/20 hover:border-white/10'}`}
    style={{ borderColor: active ? accent : 'transparent' }}
  >
    <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center transition-all ${active ? 'bg-indigo-500 text-white shadow-huge' : 'bg-white/5 text-white/20 group-hover:text-white/40'}`}>
       <Icon size={24} />
    </div>
    <h4 className={`text-[10px] font-black uppercase tracking-[0.2em] text-center leading-tight transition-colors ${active ? 'text-white' : ''}`}>{title}</h4>
    {active && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-glow" />}
  </button>
);

const ProtocolCard = ({ active, onClick, icon: Icon, title, desc, accent }: any) => (
  <button 
    onClick={onClick}
    className={`p-10 rounded-[48px] border-2 transition-all text-left flex flex-col items-start h-full group relative overflow-hidden ${active ? 'bg-white/5 border-indigo-500 shadow-glow' : 'bg-black/40 border-white/5 text-white/20 hover:border-white/10'}`}
  >
    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-8 transition-all ${active ? 'bg-indigo-500 text-white shadow-huge' : 'bg-white/5 text-white/20'}`}>
       <Icon size={28} />
    </div>
    <h4 className={`text-sm font-black uppercase tracking-[0.2em] mb-2 ${active ? 'text-white' : ''}`}>{title}</h4>
    <p className={`text-[10px] font-bold uppercase tracking-widest opacity-40`} style={{ color: active ? accent : '' }}>{desc}</p>
    {active && <div className="absolute bottom-0 right-0 p-4 opacity-5"><Icon size={80} /></div>}
  </button>
);

const SummaryItem = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between items-center pb-5 border-b border-white/5 group hover:border-white/10 transition-colors">
     <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] group-hover:text-white/40">{label}</span>
     <span className="text-sm font-black text-white uppercase tracking-tight italic">{value}</span>
  </div>
);

export default SchedulingPage;
