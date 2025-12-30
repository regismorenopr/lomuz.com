
import React, { useState, useRef, useEffect } from 'react';
import { 
  Wand2, Mic, FolderOpen, ArrowRight, ArrowLeft, 
  X, Sparkles, Check, PlayCircle, PauseCircle,
  UploadCloud, FileAudio, AlertCircle, Zap, Guitar, ZapOff,
  Calendar, Clock, Infinity, Timer
} from 'lucide-react';
import { Button } from './ui';
import { ApiService } from '../services/mockApi';

type Protocol = 'IA' | 'STUDIO' | 'IMPORT' | null;

const CampaignWizard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [protocol, setProtocol] = useState<Protocol>(null);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('RICARDO');
  
  // Scheduling State
  const [activeDays, setActiveDays] = useState([1, 2, 3, 4, 5]); // SEG-SEX
  const [cadenceMode, setCadenceMode] = useState<'RECORRENTE' | 'FIXO'>('RECORRENTE');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('20:00');
  const [endDate, setEndDate] = useState('');
  const [isIndefinite, setIsIndefinite] = useState(true);
  const [entryProtocol, setEntryProtocol] = useState<'HARMONICO' | 'INTERRUPCAO'>('HARMONICO');

  // Lógica de anulação de horário final se for FIXO
  useEffect(() => {
    if (cadenceMode === 'FIXO') {
      setEndTime(''); // Anula horário final
    } else if (!endTime) {
      setEndTime('20:00'); // Valor padrão ao voltar para recorrente
    }
  }, [cadenceMode]);

  const totalSteps = 5;

  const voices = [
    { id: 'RICARDO', name: 'RICARDO', tone: 'TOM FORMAL' },
    { id: 'ANTONIO', name: 'ANTÔNIO', tone: 'TOM FORMAL' },
    { id: 'HELENA', name: 'HELENA', tone: 'TOM AMIGÁVEL' },
    { id: 'BEATRIZ', name: 'BEATRIZ', tone: 'TOM FORMAL' },
    { id: 'GAEL', name: 'GAEL', tone: 'TOM AMIGÁVEL' },
    { id: 'MAYA', name: 'MAYA', tone: 'TOM AMIGÁVEL' },
    { id: 'LUCAS', name: 'LUCAS', tone: 'TOM AMIGÁVEL' },
    { id: 'CLARICE', name: 'CLARICE', tone: 'TOM FORMAL' },
  ];

  const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
  const dayLabels = ['DOMINGO', 'SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SÁBADO'];

  const handleFinish = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000)); 
    setLoading(false);
    onClose();
    alert("Protocolo lançado com sucesso! Sua campanha já está na rede Lomuz.");
  };

  const next = () => {
    if (step === 1 && !protocol) return;
    setStep(prev => prev + 1);
  };

  const back = () => setStep(prev => prev - 1);

  const toggleDay = (idx: number) => {
    setActiveDays(prev => prev.includes(idx) ? prev.filter(d => d !== idx) : [...prev, idx]);
  };

  const getAssistantMessage = () => {
    switch(step) {
      case 1: return "Olá! Sou seu assistente de branding sonoro. Qual protocolo seguiremos hoje?";
      case 2: return "O roteiro é a alma do anúncio. O que precisamos comunicar?";
      case 3: return "Selecione o arquétipo vocal que traduz sua marca.";
      case 4: return "Quase lá. Vamos orquestrar a logística de veiculação.";
      case 5: return "Tudo em ordem. Este é o seu checklist final de campanha.";
      default: return "";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07090F]/95 backdrop-blur-xl p-6">
      <div className="w-full max-w-5xl bg-[#12141C] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-[750px] relative">
        
        {/* Header - Roxo Imperial em destaque */}
        <header className="p-8 flex items-center justify-between border-b border-white/5 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-lomuz-imperial/10 rounded-2xl border border-lomuz-imperial/20 flex items-center justify-center relative">
               <Sparkles size={20} className="text-lomuz-imperial" />
               <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-lomuz-imperial rounded-full border-2 border-[#12141C] shadow-[0_0_10px_rgba(124,58,237,0.5)]" />
            </div>
            <div>
               <h2 className="text-[10px] font-black text-lomuz-imperial uppercase tracking-[0.3em]">SONIC ARCHITECT ASSISTANT</h2>
               <p className="text-white/80 font-bold italic text-sm">"{getAssistantMessage()}"</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-white/20 hover:text-white transition-all">
            <X size={24} />
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-10 custom-scrollbar relative">
          
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-500">
               <ProtocolCard 
                 active={protocol === 'IA'}
                 onClick={() => setProtocol('IA')}
                 icon={<div className="text-[10px] font-black text-lomuz-imperial">IA</div>}
                 title="LOCUTOR IA"
                 subtitle="NEURAL LOMUZ"
               />
               <ProtocolCard 
                 active={protocol === 'STUDIO'}
                 onClick={() => setProtocol('STUDIO')}
                 icon={<Mic size={20} className="text-lomuz-imperial" />}
                 title="LOCUTOR ESTÚDIO"
                 subtitle="VOZ HUMANA"
               />
               <ProtocolCard 
                 active={protocol === 'IMPORT'}
                 onClick={() => setProtocol('IMPORT')}
                 icon={<FolderOpen size={20} className="text-lomuz-imperial" />}
                 title="IMPORTAR MÍDIA"
                 subtitle="MP3/FLAC BATCH"
               />
            </div>
          )}

          {step === 2 && (
            <div className="max-w-4xl mx-auto space-y-10 animate-in slide-in-from-right-4">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">TÍTULO DA GRAVAÇÃO / PROJETO</label>
                <input 
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Ex: Oferta Relâmpago Natal"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-6 px-8 text-white text-lg font-bold placeholder:text-white/10 focus:border-lomuz-imperial outline-none transition-all"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">ROTEIRO ESTRATÉGICO</label>
                <textarea 
                  value={text}
                  onChange={e => setText(e.target.value.slice(0, 400))}
                  placeholder="Digite o roteiro aqui..."
                  className="w-full h-48 bg-white/[0.03] border border-white/10 rounded-2xl p-8 text-white text-lg placeholder:text-white/10 focus:border-lomuz-imperial outline-none transition-all resize-none shadow-inner leading-relaxed"
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-4">
               <div className="flex items-center gap-3">
                  <h3 className="text-[10px] font-black uppercase text-white/40 tracking-[0.3em]">ARQUETIPIA VOCAL LOMUZ</h3>
                  <div className="h-px flex-1 bg-white/5"></div>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {voices.map((v) => (
                    <button 
                      key={v.id}
                      onClick={() => setSelectedVoice(v.id)}
                      className={`group relative flex flex-col items-start p-8 rounded-[32px] border-2 transition-all text-left ${selectedVoice === v.id ? 'bg-lomuz-imperial/5 border-lomuz-imperial shadow-glow' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-6 transition-all ${selectedVoice === v.id ? 'bg-lomuz-imperial text-white' : 'bg-white/5 text-white/20'}`}>
                         <Mic size={18} />
                      </div>
                      <h4 className={`text-base font-black uppercase tracking-tight mb-1 transition-colors ${selectedVoice === v.id ? 'text-white' : 'text-white/60'}`}>{v.name}</h4>
                      <p className={`text-[8px] font-black uppercase tracking-[0.2em] transition-colors ${selectedVoice === v.id ? 'text-lomuz-imperial' : 'text-white/20'}`}>{v.tone}</p>
                    </button>
                  ))}
               </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-12 animate-in slide-in-from-right-4 max-w-5xl mx-auto">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* 1. DIAS DE ATUAÇÃO */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       <Calendar size={14} className="text-lomuz-imperial" />
                       <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">1. DIAS DE ATUAÇÃO</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {days.map((d, i) => (
                         <button
                           key={d}
                           onClick={() => toggleDay(i)}
                           className={`w-14 h-12 rounded-2xl text-[10px] font-black transition-all border-2 ${activeDays.includes(i) ? 'bg-lomuz-imperial border-lomuz-imperial text-white shadow-glow' : 'bg-white/[0.02] border-white/5 text-white/20 hover:border-white/10'}`}
                         >
                           {d}
                         </button>
                       ))}
                    </div>
                  </div>

                  {/* 2. DEFINIR HORÁRIOS */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       <Timer size={14} className="text-lomuz-imperial" />
                       <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">2. DEFINIR HORÁRIOS</h3>
                    </div>
                    <div className="bg-white/[0.03] border border-white/5 p-8 rounded-[40px] space-y-6">
                       <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
                          <button 
                            onClick={() => setCadenceMode('RECORRENTE')}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${cadenceMode === 'RECORRENTE' ? 'bg-lomuz-imperial text-white shadow-lg' : 'text-white/20 hover:text-white'}`}
                          >
                            RECORRENTE
                          </button>
                          <button 
                            onClick={() => setCadenceMode('FIXO')}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${cadenceMode === 'FIXO' ? 'bg-lomuz-imperial text-white shadow-lg' : 'text-white/20 hover:text-white'}`}
                          >
                            HORÁRIO FIXO
                          </button>
                       </div>

                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[8px] font-black text-white/20 uppercase tracking-widest flex items-center gap-1.5"><Clock size={8}/> HORÁRIO INICIAL</label>
                             <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-white font-mono text-center focus:border-lomuz-imperial outline-none" />
                          </div>
                          <div className="space-y-2">
                             <label className={`text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-opacity ${cadenceMode === 'FIXO' ? 'opacity-20' : 'opacity-100'}`}><Clock size={8}/> HORÁRIO FINAL</label>
                             <input 
                               type="time" 
                               disabled={cadenceMode === 'FIXO'} 
                               value={cadenceMode === 'FIXO' ? '' : endTime} 
                               onChange={e => setEndTime(e.target.value)} 
                               className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-white font-mono text-center focus:border-lomuz-imperial outline-none disabled:bg-black/10 disabled:opacity-20 disabled:cursor-not-allowed" 
                             />
                          </div>
                       </div>
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* 3. VIGÊNCIA (PERÍODO) */}
                  <div className={`space-y-4 transition-all ${cadenceMode === 'FIXO' ? 'opacity-20 pointer-events-none' : ''}`}>
                    <div className="flex items-center gap-2">
                       <Clock size={14} className="text-lomuz-imperial" />
                       <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">3. VIGÊNCIA DA CAMPANHA</h3>
                    </div>
                    <div className="bg-white/[0.03] border border-white/5 p-8 rounded-[40px] space-y-6">
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isIndefinite ? 'bg-lomuz-imperial border-lomuz-imperial' : 'bg-transparent border-white/10'}`}>
                                    {isIndefinite && <Check size={16} className="text-white" strokeWidth={4} />}
                                </div>
                                <input type="checkbox" className="hidden" checked={isIndefinite} onChange={e => setIsIndefinite(e.target.checked)} />
                                <span className="text-xs font-black uppercase tracking-widest text-white/60 group-hover:text-white">PERÍODO INDETERMINADO</span>
                            </label>
                            <Infinity size={20} className={isIndefinite ? 'text-lomuz-imperial animate-pulse' : 'text-white/10'} />
                        </div>

                        <div className={`space-y-2 transition-all ${isIndefinite ? 'opacity-20' : 'opacity-100'}`}>
                            <label className="text-[8px] font-black text-white/20 uppercase tracking-widest">DATA FINAL ESPECÍFICA</label>
                            <input 
                                type="date" 
                                disabled={isIndefinite} 
                                value={endDate} 
                                onChange={e => setEndDate(e.target.value)} 
                                className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-6 text-white font-bold outline-none focus:border-lomuz-imperial disabled:cursor-not-allowed" 
                            />
                        </div>
                    </div>
                  </div>

                  {/* 4. PROTOCOLO DE ENTRADA */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                       <Zap size={14} className="text-lomuz-imperial" />
                       <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">4. PROTOCOLO DE ENTRADA</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                       <button onClick={() => setEntryProtocol('HARMONICO')} className={`flex items-center gap-6 p-6 rounded-[32px] border-2 transition-all text-left ${entryProtocol === 'HARMONICO' ? 'bg-white/5 border-lomuz-imperial shadow-glow' : 'bg-white/[0.02] border-white/5 hover:border-white/10 opacity-40'}`}>
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${entryProtocol === 'HARMONICO' ? 'bg-lomuz-imperial/20 text-lomuz-imperial' : 'bg-white/5 text-white/20'}`}><Guitar size={20} /></div>
                          <div><h4 className="text-sm font-black text-white uppercase tracking-tight">HARMÔNICO</h4><p className="text-[8px] font-bold text-white/40 uppercase mt-0.5">Após execução atual</p></div>
                       </button>
                       <button onClick={() => setEntryProtocol('INTERRUPCAO')} className={`flex items-center gap-6 p-6 rounded-[32px] border-2 transition-all text-left ${entryProtocol === 'INTERRUPCAO' ? 'bg-white/5 border-lomuz-imperial shadow-glow' : 'bg-white/[0.02] border-white/5 hover:border-white/10 opacity-40'}`}>
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${entryProtocol === 'INTERRUPCAO' ? 'bg-rose-500/20 text-rose-500' : 'bg-white/5 text-white/20'}`}><ZapOff size={20} /></div>
                          <div><h4 className="text-sm font-black text-white uppercase tracking-tight">INTERRUPÇÃO</h4><p className="text-[8px] font-bold text-white/40 uppercase mt-0.5">Corte imediato</p></div>
                       </button>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {step === 5 && (
            <div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-500 relative">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none opacity-[0.03] rotate-[-12deg]">
                  <span className="text-[300px] font-black text-white leading-none">OK</span>
               </div>

               <div className="relative z-10 space-y-12">
                  <div className="flex justify-between items-start">
                     <div>
                        <h4 className="text-[10px] font-black text-lomuz-imperial uppercase tracking-[0.4em] mb-2">LOMUZ DOSSIÊ DE CAMPANHA</h4>
                        <h3 className="text-5xl font-black text-white tracking-tight uppercase">{title || 'ANÚNCIO SEM TÍTULO'}</h3>
                     </div>
                     <div className="text-right">
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">VOLUME OPERACIONAL</p>
                        <div className="flex items-baseline justify-end gap-1">
                           <span className="text-4xl font-black text-white">{cadenceMode === 'FIXO' ? '1' : '24'}</span>
                           <span className="text-[10px] font-black text-white/40 uppercase">{cadenceMode === 'FIXO' ? 'INSERÇÃO/DIA' : 'INSERÇÕES/DIA'}</span>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16 pt-10 border-t border-white/5">
                     <div className="space-y-8">
                        <h5 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-3">
                           <FolderOpen size={12}/> PARÂMETROS DE LANÇAMENTO
                        </h5>
                        <div className="space-y-6">
                           <div className="flex justify-between items-center pb-4 border-b border-white/5">
                              <span className="text-[10px] font-black text-white/40 uppercase">TIPO DE GRAVAÇÃO</span>
                              <span className="text-xs font-black text-white uppercase">{protocol === 'IA' ? 'IA NEURAL' : protocol === 'STUDIO' ? 'HUMANA ESTÚDIO' : 'IMPORTAÇÃO'}</span>
                           </div>
                           <div className="flex justify-between items-center pb-4 border-b border-white/5">
                              <span className="text-[10px] font-black text-white/40 uppercase">DISTRIBUIÇÃO</span>
                              <span className="text-xs font-black text-white uppercase">{cadenceMode === 'FIXO' ? 'HORÁRIO PONTUAL' : 'FLUXO RECORRENTE'}</span>
                           </div>
                           <div className="flex justify-between items-center pb-4 border-b border-white/5">
                              <span className="text-[10px] font-black text-white/40 uppercase">REGRA DE MIXAGEM</span>
                              <span className={`text-[10px] font-black uppercase ${entryProtocol === 'HARMONICO' ? 'text-green-500' : 'text-rose-500'}`}>
                                 {entryProtocol === 'HARMONICO' ? 'TOCAR APÓS ARQUIVO ATUAL' : 'INTERROMPER REPRODUÇÃO'}
                              </span>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-8">
                        <h5 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-3">
                           <Calendar size={12}/> JANELA DE AUDIÊNCIA
                        </h5>
                        <div className="space-y-6">
                           <div className="flex flex-wrap gap-2">
                              {activeDays.map(d => (
                                 <div key={d} className="px-3 py-1 bg-lomuz-imperial/20 border border-lomuz-imperial/30 rounded-full">
                                    <span className="text-[8px] font-black text-lomuz-imperial uppercase">{dayLabels[d]}</span>
                                 </div>
                              ))}
                           </div>
                           <div className="space-y-2">
                              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">HORÁRIO</p>
                              <p className="text-xs font-black text-white uppercase leading-relaxed">
                                 {cadenceMode === 'RECORRENTE' ? `JANELA: ${startTime} ATÉ ${endTime}` : `PONTUAL ÀS ${startTime}`}
                              </p>
                           </div>
                           <div className="space-y-2">
                              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">VIGÊNCIA</p>
                              <p className="text-xs font-black text-white uppercase leading-relaxed">
                                 {cadenceMode === 'FIXO' ? 'ÚNICA EXECUÇÃO' : isIndefinite ? 'PERÍODO INDETERMINADO' : `ATÉ ${endDate}`}
                              </p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}
        </main>

        {/* Footer Navigation */}
        <footer className="h-24 px-10 border-t border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-10">
             {step > 1 && (
               <button onClick={back} className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase hover:text-white transition-all tracking-widest px-4 py-2 border border-white/10 rounded-xl">
                  <ArrowLeft size={14} /> RETROCEDER
               </button>
             )}
          </div>

          <div className="flex flex-col items-center">
             <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">ETAPA {step} DE {totalSteps}</span>
             <div className="flex gap-1 mt-2">
                {[1,2,3,4,5].map(s => (
                  <div key={s} className={`h-1 rounded-full transition-all ${step >= s ? 'w-6 bg-lomuz-imperial' : 'w-2 bg-white/10'}`} />
                ))}
             </div>
          </div>

          <div className="flex items-center gap-4">
             {step === 5 ? (
               <button 
                 onClick={handleFinish}
                 disabled={loading}
                 className="flex items-center gap-4 px-12 py-4 rounded-full bg-premium-gradient text-white text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-glow hover:scale-105 active:scale-95"
               >
                  {loading ? 'LANÇANDO...' : 'CONFIRMAR E LANÇAR'} <Wand2 size={16} />
               </button>
             ) : (
               <button 
                 onClick={next}
                 disabled={loading || (step === 1 && !protocol) || (step === 2 && (!text || !title))}
                 className={`flex items-center gap-4 px-12 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl ${step === 1 && !protocol ? 'bg-white/5 text-white/20' : 'bg-lomuz-imperial text-white hover:scale-105 active:scale-95 shadow-glow'}`}
               >
                  PROSSEGUIR <ArrowRight size={16} />
               </button>
             )}
          </div>
        </footer>
      </div>
    </div>
  );
};

const ProtocolCard = ({ active, onClick, icon, title, subtitle }: any) => (
  <button 
    onClick={onClick}
    className={`group relative flex flex-col items-center justify-center p-10 rounded-[32px] border-2 transition-all h-64 ${active ? 'bg-lomuz-imperial/5 border-lomuz-imperial shadow-glow' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}
  >
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all ${active ? 'bg-lomuz-imperial text-white shadow-glow' : 'bg-white/5 text-white/20 group-hover:scale-110'}`}>
       {icon}
    </div>
    <h4 className={`text-sm font-black uppercase tracking-widest mb-1 transition-colors ${active ? 'text-white' : 'text-white/60'}`}>{title}</h4>
    <p className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${active ? 'text-lomuz-imperial' : 'text-white/20'}`}>{subtitle}</p>
    {active && <div className="absolute top-4 right-4 text-lomuz-imperial animate-in zoom-in"><Check size={20} /></div>}
  </button>
);

export default CampaignWizard;
