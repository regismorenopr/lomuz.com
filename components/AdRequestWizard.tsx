
import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowRight, ArrowLeft, Wand2, Mic, PlayCircle, PauseCircle, 
  Calendar, CheckCircle, AlertCircle, Sparkles, X, Clock, Repeat,
  MessageSquare, User, Send, ChevronRight, Check
} from 'lucide-react';
import { Button, Card } from './ui';
import { AdRequest, VirtualVoiceId } from '../types';
import { ApiService } from '../services/mockApi';

// --- TYPES ---
export type AdWizardStep = 'TYPE' | 'TEXT' | 'AI_REVIEW' | 'VOICE' | 'SCHEDULE' | 'REVIEW';

interface WizardData {
  type: 'VIRTUAL' | 'PRO' | null;
  textOriginal: string;
  textFinal: string;
  voiceId: VirtualVoiceId | null;
  scheduleDraft: {
    startDate: string;
    endDate: string;
    isIndefinite: boolean;
    mode: 'RECURRENCE' | 'FIXED';
    interval: number; // minutes
    activeDays: number[];
  };
}

interface AdRequestWizardProps {
  radioId: string;
  onClose: () => void;
  onSuccess: () => void;
}

// --- CONSTANTS ---
const STEPS: { id: AdWizardStep; title: string; coach: string }[] = [
  { id: 'TYPE', title: 'Formato', coach: 'Escolha como você quer gerar o anúncio.' },
  { id: 'TEXT', title: 'Roteiro', coach: 'Escreva o texto do anúncio. Máx. 400 caracteres.' },
  { id: 'AI_REVIEW', title: 'Melhoria IA', coach: 'Quer melhorar o texto? A IA sugere uma versão mais clara.' },
  { id: 'VOICE', title: 'Locutor', coach: 'Escolha a voz. Toque uma prévia antes de confirmar.' },
  { id: 'SCHEDULE', title: 'Programação', coach: 'Defina quando este anúncio deve tocar quando ficar pronto.' },
  { id: 'REVIEW', title: 'Confirmação', coach: 'Revise tudo e envie.' },
];

const VOICES_MOCK = [
    { id: 'male_1', label: 'Masculina 1', desc: 'Padrão' },
    { id: 'male_2', label: 'Masculina 2', desc: 'Jovem' },
    { id: 'male_3', label: 'Masculina 3', desc: 'Impacto' },
    { id: 'female_1', label: 'Feminina 1', desc: 'Suave' },
    { id: 'female_2', label: 'Feminina 2', desc: 'Varejo' },
    { id: 'child_1', label: 'Infantil 1', desc: 'Criança' },
];

// --- SUB-COMPONENTS ---

const WizardHeader = ({ currentIdx, total }: { currentIdx: number; total: number }) => {
  const step = STEPS[currentIdx];
  const progress = ((currentIdx + 1) / total) * 100;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-end mb-2">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-lomuz-gold">
            Passo {currentIdx + 1} de {total}
          </span>
          <h3 className="text-xl font-bold text-white leading-tight">{step.title}</h3>
        </div>
        <div className="text-right max-w-[50%]">
           <p className="text-xs text-white/60 italic border-l-2 border-lomuz-gold/50 pl-2">
             "{step.coach}"
           </p>
        </div>
      </div>
      <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-lomuz-gold to-yellow-600 transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

const AdRequestWizard: React.FC<AdRequestWizardProps> = ({ radioId, onClose, onSuccess }) => {
  // --- STATE ---
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [data, setData] = useState<WizardData>({
    type: null,
    textOriginal: '',
    textFinal: '',
    voiceId: 'male_1',
    scheduleDraft: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      isIndefinite: true,
      mode: 'RECURRENCE',
      interval: 30,
      activeDays: [0, 1, 2, 3, 4, 5, 6]
    }
  });
  
  // UI States
  const [aiSuggestion, setAiSuggestion] = useState<{ text: string, reason: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);

  // --- ACTIONS ---

  const handleNext = () => {
    // Validações antes de avançar
    if (currentStepIdx === 0 && !data.type) return; 
    if (currentStepIdx === 1 && (!data.textFinal || data.textFinal.length > 400)) return;
    
    let nextIdx = currentStepIdx + 1;

    // Pular passo de voz se for PRO
    if (STEPS[currentStepIdx].id === 'AI_REVIEW' && data.type === 'PRO') {
       nextIdx = 4; // Pula VOICE (index 3), vai para SCHEDULE (index 4)
    }

    if (nextIdx < STEPS.length) {
      setCurrentStepIdx(nextIdx);
    } else {
      submit();
    }
  };

  const handleBack = () => {
    let prevIdx = currentStepIdx - 1;
    
    // Pular passo de voz voltando se for PRO
    if (STEPS[currentStepIdx].id === 'SCHEDULE' && data.type === 'PRO') {
        prevIdx = 2; // Volta para AI_REVIEW (index 2)
    }

    if (prevIdx >= 0) setCurrentStepIdx(prevIdx);
  };

  const handlePlayVoice = (voiceId: string) => {
    if (previewAudio) {
      previewAudio.pause();
      setPlayingVoice(null);
    }
    
    // Mock audio or real path
    const audio = new Audio(`https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=podcast-intro-110452.mp3&v=${voiceId}`);
    audio.volume = 0.5;
    audio.onended = () => setPlayingVoice(null);
    audio.play();
    
    setPreviewAudio(audio);
    setPlayingVoice(voiceId);
  };

  const handleAnalyzeAI = async () => {
    if (!data.textFinal) return;
    setIsProcessing(true);
    try {
        const res = await ApiService.aiReviewAd(data.textFinal);
        setAiSuggestion({ text: res.suggestion, reason: res.reason });
    } catch (e) {
        alert("Erro na IA");
    } finally {
        setIsProcessing(false);
    }
  };

  const submit = async () => {
    setIsProcessing(true);
    try {
        await ApiService.createAdRequest({
            radioId: radioId,
            type: data.type!,
            voiceId: data.type === 'VIRTUAL' ? (data.voiceId as any) : undefined,
            textOriginal: data.textOriginal || data.textFinal, // Fallback
            textFinal: data.textFinal,
            aiFeedback: aiSuggestion?.reason
        });
        
        // Mock schedule creation logic here if needed
        // ApiService.createClientSchedule(...) using data.scheduleDraft

        onSuccess();
    } catch (e) {
        alert("Erro ao enviar solicitação.");
    } finally {
        setIsProcessing(false);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (previewAudio) previewAudio.pause();
    };
  }, [previewAudio]);

  // --- RENDERERS PER STEP ---

  const renderStepContent = () => {
    const stepId = STEPS[currentStepIdx].id;

    switch (stepId) {
      case 'TYPE':
        return (
          <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-right-4">
            <button 
                onClick={() => setData({ ...data, type: 'VIRTUAL' })}
                className={`p-6 rounded-2xl border-2 transition-all text-left group hover:scale-[1.02] ${data.type === 'VIRTUAL' ? 'bg-indigo-500/20 border-indigo-500 ring-2 ring-indigo-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
            >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${data.type === 'VIRTUAL' ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white/50 group-hover:text-white'}`}>
                    <Wand2 size={24} />
                </div>
                <h4 className="font-bold text-lg text-white mb-1">Locutor Virtual (IA)</h4>
                <p className="text-xs text-white/50 leading-relaxed">Geração instantânea com vozes neurais ultra-realistas. Custo reduzido.</p>
            </button>

            <button 
                onClick={() => setData({ ...data, type: 'PRO' })}
                className={`p-6 rounded-2xl border-2 transition-all text-left group hover:scale-[1.02] ${data.type === 'PRO' ? 'bg-purple-500/20 border-purple-500 ring-2 ring-purple-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
            >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${data.type === 'PRO' ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/50 group-hover:text-white'}`}>
                    <Mic size={24} />
                </div>
                <h4 className="font-bold text-lg text-white mb-1">Locutor Profissional</h4>
                <p className="text-xs text-white/50 leading-relaxed">Gravado em estúdio por humanos. Mais emoção e interpretação. Entrega em 24h.</p>
            </button>
          </div>
        );

      case 'TEXT':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
             <div className="relative">
                <textarea 
                    autoFocus
                    value={data.textFinal}
                    onChange={(e) => {
                        const val = e.target.value.slice(0, 400);
                        setData({ ...data, textFinal: val, textOriginal: data.textOriginal || val });
                    }}
                    className="w-full h-40 bg-black/20 border border-white/10 rounded-xl p-4 text-white resize-none outline-none focus:border-lomuz-gold transition-colors text-lg"
                    placeholder="Digite o texto do seu anúncio aqui..."
                />
                <div className={`absolute bottom-3 right-3 text-xs font-bold px-2 py-1 rounded bg-black/40 backdrop-blur-md ${data.textFinal.length >= 400 ? 'text-rose-500' : 'text-white/50'}`}>
                    {data.textFinal.length} / 400
                </div>
             </div>
             {data.textFinal.length < 20 && (
                 <p className="text-xs text-yellow-500 flex items-center gap-1">
                     <AlertCircle size={12} /> Texto muito curto. Recomendamos pelo menos 20 caracteres.
                 </p>
             )}
          </div>
        );

      case 'AI_REVIEW':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
             {!aiSuggestion ? (
                 <div className="text-center py-10">
                     <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-white/30">
                         <Sparkles size={32} />
                     </div>
                     <p className="text-sm text-white/60 mb-6 max-w-xs mx-auto">Nossa IA pode analisar seu texto para torná-lo mais persuasivo e adequado para rádio.</p>
                     <Button onClick={handleAnalyzeAI} isLoading={isProcessing} className="bg-indigo-500 hover:bg-indigo-600 text-white border-none shadow-lg shadow-indigo-500/20">
                         <Wand2 size={16} className="mr-2" /> Analisar e Melhorar Texto
                     </Button>
                     <div className="mt-4">
                        <button onClick={handleNext} className="text-xs text-white/40 hover:text-white underline">Pular esta etapa</button>
                     </div>
                 </div>
             ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="p-4 rounded-xl bg-white/5 border border-white/10 opacity-60">
                         <h5 className="text-[10px] font-bold uppercase text-white/40 mb-2">Original</h5>
                         <p className="text-sm text-white italic">"{data.textOriginal}"</p>
                     </div>
                     <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                         <h5 className="text-[10px] font-bold uppercase text-indigo-400 mb-2 flex items-center gap-1"><Sparkles size={10} /> Sugestão da IA</h5>
                         <p className="text-sm text-white font-medium">"{aiSuggestion.text}"</p>
                         <div className="mt-3 pt-3 border-t border-indigo-500/20 text-[10px] text-indigo-300">
                             <span className="font-bold">Por que?</span> {aiSuggestion.reason}
                         </div>
                     </div>
                     <div className="col-span-2 flex justify-center gap-3 mt-2">
                         <Button variant="ghost" onClick={handleNext} size="sm">Manter Original</Button>
                         <Button onClick={() => { setData({ ...data, textFinal: aiSuggestion.text }); handleNext(); }} className="bg-indigo-500 border-none text-white hover:bg-indigo-600" size="sm">
                             <CheckCircle size={14} className="mr-2" /> Aceitar Sugestão
                         </Button>
                     </div>
                 </div>
             )}
          </div>
        );

      case 'VOICE':
        return (
          <div className="animate-in fade-in slide-in-from-right-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {VOICES_MOCK.map(v => {
                      const isSelected = data.voiceId === v.id;
                      const isPlaying = playingVoice === v.id;
                      return (
                          <div 
                            key={v.id}
                            onClick={() => { setData({ ...data, voiceId: v.id as any }); handlePlayVoice(v.id); }}
                            className={`
                                relative p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-white/5
                                ${isSelected ? 'bg-indigo-500/20 border-indigo-500' : 'bg-transparent border-white/10'}
                            `}
                          >
                              <div className="flex justify-between items-start mb-2">
                                  <div className={`p-2 rounded-full ${isSelected ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white/50'}`}>
                                      <User size={16} />
                                  </div>
                                  {isSelected && <div className="text-indigo-400"><CheckCircle size={16} /></div>}
                              </div>
                              <h5 className="text-sm font-bold text-white">{v.label}</h5>
                              <p className="text-[10px] text-white/50">{v.desc}</p>
                              
                              <button className={`absolute bottom-3 right-3 text-white/70 hover:text-white hover:scale-110 transition-transform ${isPlaying ? 'text-indigo-400 animate-pulse' : ''}`}>
                                  {isPlaying ? <PauseCircle size={24} /> : <PlayCircle size={24} />}
                              </button>
                          </div>
                      );
                  })}
              </div>
          </div>
        );

      case 'SCHEDULE':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-white/50">Data Início</label>
                          <input 
                            type="date" 
                            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-lomuz-gold"
                            value={data.scheduleDraft.startDate}
                            onChange={(e) => setData(p => ({ ...p, scheduleDraft: { ...p.scheduleDraft, startDate: e.target.value } }))}
                          />
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase text-white/50">Data Fim</label>
                          <div className="flex items-center gap-2">
                              <input 
                                type="date" 
                                disabled={data.scheduleDraft.isIndefinite}
                                className="flex-1 bg-black/30 border border-white/10 rounded-lg p-2 text-sm text-white outline-none focus:border-lomuz-gold disabled:opacity-50"
                                value={data.scheduleDraft.endDate}
                                onChange={(e) => setData(p => ({ ...p, scheduleDraft: { ...p.scheduleDraft, endDate: e.target.value } }))}
                              />
                              <label className="flex items-center gap-1 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={data.scheduleDraft.isIndefinite} 
                                    onChange={(e) => setData(p => ({ ...p, scheduleDraft: { ...p.scheduleDraft, isIndefinite: e.target.checked } }))}
                                    className="accent-lomuz-gold"
                                  />
                                  <span className="text-[10px] text-white">Indefinido</span>
                              </label>
                          </div>
                      </div>
                  </div>

                  <div className="pt-2 border-t border-white/5 space-y-2">
                      <label className="text-[10px] font-bold uppercase text-white/50 block">Regra de Exibição</label>
                      <div className="flex gap-2">
                          <button 
                            onClick={() => setData(p => ({ ...p, scheduleDraft: { ...p.scheduleDraft, mode: 'RECURRENCE' } }))}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${data.scheduleDraft.mode === 'RECURRENCE' ? 'bg-white/10 border-white text-white' : 'bg-transparent border-white/10 text-white/50'}`}
                          >
                              A cada intervalo
                          </button>
                          <button 
                            onClick={() => setData(p => ({ ...p, scheduleDraft: { ...p.scheduleDraft, mode: 'FIXED' } }))}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${data.scheduleDraft.mode === 'FIXED' ? 'bg-white/10 border-white text-white' : 'bg-transparent border-white/10 text-white/50'}`}
                          >
                              Horário Fixo
                          </button>
                      </div>
                      
                      {data.scheduleDraft.mode === 'RECURRENCE' && (
                          <div className="flex items-center gap-2 p-3 bg-black/20 rounded-lg">
                              <Repeat size={14} className="text-white/50" />
                              <span className="text-xs text-white">Repetir a cada</span>
                              <input 
                                type="number" 
                                className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1 text-center text-sm font-bold text-white focus:border-lomuz-gold outline-none"
                                value={data.scheduleDraft.interval}
                                onChange={(e) => setData(p => ({ ...p, scheduleDraft: { ...p.scheduleDraft, interval: parseInt(e.target.value) } }))}
                              />
                              <span className="text-xs text-white">minutos</span>
                          </div>
                      )}
                      
                      {data.scheduleDraft.mode === 'FIXED' && (
                          <div className="p-3 bg-black/20 rounded-lg text-center text-xs text-white/50 italic">
                              Agendamento de horário fixo será configurado após a criação.
                          </div>
                      )}
                  </div>
                  
                  <div className="pt-2 border-t border-white/5">
                      <label className="text-[10px] font-bold uppercase text-white/50 block mb-2">Dias da Semana</label>
                      <div className="flex justify-between">
                          {['D','S','T','Q','Q','S','S'].map((d, i) => {
                              const isActive = data.scheduleDraft.activeDays.includes(i);
                              return (
                                  <button 
                                    key={i}
                                    onClick={() => {
                                        const newDays = isActive 
                                            ? data.scheduleDraft.activeDays.filter(day => day !== i)
                                            : [...data.scheduleDraft.activeDays, i];
                                        setData(p => ({ ...p, scheduleDraft: { ...p.scheduleDraft, activeDays: newDays } }));
                                    }}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all ${isActive ? 'bg-lomuz-gold border-lomuz-gold text-black' : 'bg-transparent border-white/10 text-white/30'}`}
                                  >
                                      {d}
                                  </button>
                              )
                          })}
                      </div>
                  </div>
              </div>
          </div>
        );

      case 'REVIEW':
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="bg-white/5 rounded-xl border border-white/10 divide-y divide-white/5">
                  <div className="p-4 flex gap-4">
                      <div className="p-2 bg-white/5 rounded text-white/50 h-fit"><Wand2 size={16} /></div>
                      <div>
                          <h6 className="text-[10px] font-bold uppercase text-white/40">Formato</h6>
                          <p className="text-sm font-bold text-white">{data.type === 'VIRTUAL' ? 'Locutor Virtual (IA)' : 'Locutor Profissional'}</p>
                          {data.type === 'VIRTUAL' && <p className="text-xs text-indigo-400">Voz: {VOICES_MOCK.find(v => v.id === data.voiceId)?.label}</p>}
                      </div>
                  </div>
                  <div className="p-4 flex gap-4">
                      <div className="p-2 bg-white/5 rounded text-white/50 h-fit"><MessageSquare size={16} /></div>
                      <div>
                          <h6 className="text-[10px] font-bold uppercase text-white/40">Conteúdo</h6>
                          <p className="text-sm text-white italic line-clamp-3">"{data.textFinal}"</p>
                          <p className="text-[10px] text-white/30 mt-1">{data.textFinal.length} caracteres</p>
                      </div>
                  </div>
                  <div className="p-4 flex gap-4">
                      <div className="p-2 bg-white/5 rounded text-white/50 h-fit"><Calendar size={16} /></div>
                      <div>
                          <h6 className="text-[10px] font-bold uppercase text-white/40">Programação</h6>
                          <p className="text-sm text-white">Início em {new Date(data.scheduleDraft.startDate).toLocaleDateString()}</p>
                          <p className="text-xs text-white/60">
                              {data.scheduleDraft.mode === 'RECURRENCE' ? `A cada ${data.scheduleDraft.interval} min` : 'Horário Fixo'} • {data.scheduleDraft.activeDays.length} dias/semana
                          </p>
                      </div>
                  </div>
              </div>
          </div>
        );
        
      default: return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
            <WizardHeader currentIdx={currentStepIdx} total={STEPS.length} />
            
            <div className="min-h-[300px]">
                {renderStepContent()}
            </div>
        </div>

        <div className="mt-auto pt-6 border-t border-white/10 flex justify-between items-center bg-lomuz-bg pb-2 sticky bottom-0">
            <div>
                {currentStepIdx > 0 && (
                    <Button variant="ghost" onClick={handleBack} className="text-white/50 hover:text-white">
                        <ArrowLeft size={16} className="mr-2" /> Voltar
                    </Button>
                )}
            </div>
            <div className="flex gap-3">
                <Button variant="ghost" onClick={onClose} className="text-white/30 hover:text-white hover:bg-white/5">Cancelar</Button>
                
                {currentStepIdx < STEPS.length - 1 ? (
                    <Button 
                        onClick={handleNext} 
                        disabled={
                            (currentStepIdx === 0 && !data.type) || 
                            (currentStepIdx === 1 && !data.textFinal)
                        }
                        className="bg-white text-black hover:bg-white/90 font-bold px-6"
                    >
                        Próximo <ChevronRight size={16} className="ml-1" />
                    </Button>
                ) : (
                    <Button 
                        onClick={submit} 
                        isLoading={isProcessing}
                        className="bg-gradient-to-r from-lomuz-gold to-yellow-600 border-none text-black font-bold shadow-lg shadow-lomuz-gold/20 px-8 hover:brightness-110"
                    >
                        <Send size={16} className="mr-2" /> Enviar Solicitação
                    </Button>
                )}
            </div>
        </div>
    </div>
  );
};

export default AdRequestWizard;
