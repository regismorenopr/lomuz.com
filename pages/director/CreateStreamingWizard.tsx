import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeft, ArrowRight, Check, Radio as RadioIcon, 
  Music, Sparkles, CheckCircle2, Clock, Calendar, 
  Search, Info, Zap, X, Thermometer, 
  Mic2, Newspaper, Smile, Hammer, Car, Heart, 
  Home, ShoppingBag, ListMusic, Volume2,
  RefreshCw, PlayCircle, Megaphone, Dumbbell, Coffee,
  Timer, Repeat, Plus, Trash2, Disc as DiscIcon,
  Wind, Flame, Headphones, AlertTriangle, Utensils,
  Dumbbell as GymIcon, Stethoscope, Scissors, Building,
  Coffee as RestaurantIcon, Beer, HardHat, CarFront,
  Briefcase, Hotel, Pill, Loader2
} from 'lucide-react';
import { Button, Card } from '../../components/ui';
import { api } from '../../services/api';

// Custom icons
const Globe = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20M2 12h20"/>
  </svg>
);

const Sun = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h20M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
  </svg>
);

// --- BIBLIOTECA COMPLETA DE DNA SONORO ---
const ALL_DNA_PROFILES = [
  { id: 'pop-leve', title: 'Pop Leve Nacional', desc: 'Sucessos brasileiros suaves para ambientes vibrantes.', icon: <Music size={24} /> },
  { id: 'pop-inter', title: 'Pop Internacional', desc: 'Os maiores hits do mundo em versões originais.', icon: <Globe size={24} /> },
  { id: 'mpb-moderna', title: 'MPB Moderna', desc: 'A nova MPB com batidas contemporâneas.', icon: <Heart size={24} /> },
  { id: 'flashback-80-90', title: 'Flashback 80/90', desc: 'Viagem nostálgica pelos clássicos das décadas de ouro.', icon: <DiscIcon size={24} /> },
  { id: 'pop-fashion', title: 'Pop Fashion', desc: 'Batidas ideais para provadores e showrooms.', icon: <ShoppingBag size={24} /> },
  { id: 'hits-atuais', title: 'Hits Atuais', desc: 'As mais tocadas nas plataformas de streaming hoje.', icon: <Zap size={24} /> },
  { id: 'instrumental-leve', title: 'Instrumental Leve', desc: 'Som ambiente sem vocais para foco e tranquilidade.', icon: <Wind size={24} /> },
  { id: 'jazz-lounge', title: 'Jazz Lounge', desc: 'Sofisticação e elegância para esperas e jantares.', icon: <RestaurantIcon size={24} /> },
  { id: 'lounge-moderno', title: 'Lounge Moderno', desc: 'Atmosfera de hotel boutique com toques eletrônicos.', icon: <Hotel size={24} /> },
  { id: 'chill-acoustic', title: 'Chill Acoustic', desc: 'Voz e violão para um clima intimista.', icon: <Headphones size={24} /> },
  { id: 'lo-fi', title: 'Lo-fi Beats', desc: 'Batidas calmas para produtividade e foco.', icon: <Coffee size={24} /> },
  { id: 'pop-energetico', title: 'Pop Energético', desc: 'Batidas aceleradas para manter o ritmo lá em cima.', icon: <Zap size={24} /> },
  { id: 'eletronica-motivacional', title: 'Eletrônica Motivation', desc: 'Sintetizadores e energia para alta performance.', icon: <Dumbbell size={24} /> },
  { id: 'dance-hits', title: 'Dance Hits', desc: 'O melhor das pistas para animar o ambiente.', icon: <Flame size={24} /> },
  { id: 'rock-classico', title: 'Rock Clássico', desc: 'Lendas do rock para ambientes com atitude.', icon: <Flame size={24} /> },
  { id: 'rock-nacional', title: 'Rock Nacional', desc: 'Os grandes hinos do rock brasileiro.', icon: <Music size={24} /> },
];

const SEGMENT_SUGGESTIONS: Record<string, string[]> = {
  supermarket: ['pop-leve', 'pop-inter', 'mpb-moderna', 'flashback-80-90'],
  fashion: ['pop-fashion', 'hits-atuais', 'lounge-moderno'],
  pharmacy: ['instrumental-leve', 'pop-leve', 'mpb-moderna'],
  gym: ['pop-energetico', 'eletronica-motivacional', 'dance-hits'],
  restaurant: ['jazz-lounge', 'mpb-moderna', 'pop-inter'],
  clinic: ['instrumental-leve', 'lo-fi'],
  beauty: ['pop-fashion', 'lounge-moderno'],
  hotel: ['lounge-moderno', 'instrumental-leve', 'jazz-lounge'],
  auto: ['rock-classico', 'rock-nacional', 'flashback-80-90']
};

const SEGMENTS = [
  { id: 'supermarket', title: 'Supermercado', icon: <ShoppingBag size={18} /> },
  { id: 'fashion', title: 'Loja de Moda', icon: <ShoppingBag size={18} /> },
  { id: 'pharmacy', title: 'Farmácia', icon: <Pill size={18} /> },
  { id: 'gym', title: 'Academia', icon: <GymIcon size={18} /> },
  { id: 'restaurant', title: 'Restaurante / Café', icon: <RestaurantIcon size={18} /> },
  { id: 'clinic', title: 'Clínica / Consultório', icon: <Stethoscope size={18} /> },
  { id: 'beauty', title: 'Salão de Beleza', icon: <Scissors size={18} /> },
  { id: 'hotel', title: 'Hotel / Recepção', icon: <Hotel size={18} /> },
  { id: 'auto', title: 'Mecânica / Auto Center', icon: <CarFront size={18} /> },
];

const INFORMATIVE_ATTRACTIONS = [
  { id: 'conexaoNews', title: 'Conexão News', desc: 'Giro de notícias atualizado a cada hora.', icon: <Newspaper size={20} /> },
  { id: 'jogoRapido', title: 'Jogo Rápido', desc: 'Informativo dinâmico de esportes.', icon: <Zap size={20} /> },
  { id: 'centralFofocas', title: 'Central de Fofocas', desc: 'Notícias quentes do mundo das celebridades.', icon: <Megaphone size={20} /> },
  { id: 'insideStreaming', title: 'Inside Streaming', desc: 'Curiosidades sobre o universo musical.', icon: <Headphones size={20} /> },
  { id: 'musicPlus', title: 'Music Plus', desc: 'Lançamentos e hits exclusivos.', icon: <Music size={20} /> },
  { id: 'horaCerta', title: 'Hora Certa', desc: 'Informa a hora exata automaticamente.', icon: <Clock size={20} /> },
];

const CONTENT_ATTRACTIONS = [
  { id: 'alimentacaoSaude', title: 'Alimentação e Saúde', desc: 'Dicas para uma vida equilibrada.', icon: <Utensils size={20} /> },
  { id: 'casaBemEstar', title: 'Casa e Bem Estar', desc: 'Organização e harmonia no lar.', icon: <Home size={20} /> },
  { id: 'modaBeleza', title: 'Moda e Beleza', desc: 'Tendências de estilo e cuidados.', icon: <Scissors size={20} /> },
  { id: 'cuidadosCarro', title: 'Cuidados com o Carro', desc: 'Dicas de manutenção automotiva.', icon: <Car size={20} /> },
  { id: 'avisoSupermercado', title: 'Aviso de Consumo', desc: 'Orientação sobre consumo interno.', icon: <AlertTriangle size={20} /> },
  { id: 'maosAObra', title: 'Dicas "Mãos à Obra"', desc: 'Dicas para construção e reformas.', icon: <Hammer size={20} /> },
  { id: 'radioMotivacao', title: 'Rádio Motivação', desc: 'Countdown de 30min para abertura animada.', icon: <Flame size={20} /> },
];

const AutomationCard: React.FC<{ 
  item: any, 
  config: any, 
  onToggle: () => void,
  onUpdateConfig: (newConfig: any) => void
}> = ({ item, config, onToggle, onUpdateConfig }) => {
  const isActive = !!config?.active;
  const mode = config?.mode || 'RECORRENTE';
  const unit = config?.unit || 'MINUTOS';
  const [newStartTime, setNewStartTime] = useState('08:00');
  const [newEndTime, setNewEndTime] = useState('18:00');

  const addInterval = () => {
    const intervals = config.fixedIntervals || [];
    const intervalStr = `${newStartTime} às ${newEndTime}`;
    if (!intervals.includes(intervalStr)) {
      onUpdateConfig({ ...config, fixedIntervals: [...intervals, intervalStr].sort() });
    }
  };

  const removeInterval = (interval: string) => {
    onUpdateConfig({ ...config, fixedIntervals: (config.fixedIntervals || []).filter((i: string) => i !== interval) });
  };

  const unitLabels: Record<string, string> = {
    'MÚSICAS': 'Músicas',
    'MINUTOS': 'Minutos',
    'HORAS': 'Horas',
    'DIAS': 'Dias'
  };

  return (
    <div className={`p-6 rounded-[32px] border transition-all flex flex-col group ${isActive ? 'bg-white/[0.04] border-lomuz-imperial shadow-[0_0_15px_rgba(124,58,237,0.15)]' : 'bg-black/20 border-white/5 opacity-60'}`}>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isActive ? 'bg-lomuz-imperial text-white' : 'bg-white/5 text-white/20'}`}>
            {item.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-0.5">
              <h4 className={`text-sm font-black uppercase tracking-tight transition-colors ${isActive ? 'text-white' : 'text-white/40'}`}>{item.title}</h4>
            </div>
            <p className="text-[10px] text-lomuz-muted leading-tight font-medium line-clamp-1">{item.desc}</p>
          </div>
        </div>
        
        <button 
          onClick={onToggle}
          className={`ml-4 w-11 h-6 rounded-full relative transition-all duration-300 shrink-0 ${isActive ? 'bg-lomuz-imperial' : 'bg-white/10'}`}
        >
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${isActive ? 'left-6' : 'left-1'}`} />
        </button>
      </div>

      {isActive && (
        <div className="mt-6 pt-5 border-t border-white/5 animate-in slide-in-from-top-2 duration-300 space-y-4">
           <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
              <button 
                onClick={() => onUpdateConfig({ ...config, mode: 'RECORRENTE' })}
                className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all uppercase tracking-widest ${mode === 'RECORRENTE' ? 'bg-lomuz-imperial text-white shadow-lg' : 'text-white/30 hover:text-white'}`}
              >
                Recorrente
              </button>
              <button 
                onClick={() => onUpdateConfig({ ...config, mode: 'FIXO' })}
                className={`flex-1 py-2 text-[9px] font-black rounded-lg transition-all uppercase tracking-widest ${mode === 'FIXO' ? 'bg-lomuz-imperial text-white shadow-lg' : 'text-white/30 hover:text-white'}`}
              >
                Horário Fixo
              </button>
           </div>

           {mode === 'RECORRENTE' ? (
              <div className="space-y-3">
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                       <Timer size={10} className="text-lomuz-imperial" /> Intervalo de Repetição
                    </span>
                    <div className="flex bg-black/40 p-0.5 rounded-lg border border-white/5">
                       {['MÚSICAS', 'MINUTOS', 'HORAS', 'DIAS'].map(u => (
                          <button 
                            key={u}
                            onClick={() => onUpdateConfig({ ...config, unit: u })}
                            className={`px-2 py-1 text-[7px] font-black rounded-md transition-all ${unit === u ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white'}`}
                          >
                            {u}
                          </button>
                       ))}
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-3 bg-black/20 p-3 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-bold text-white/60">A cada</span>
                    <input 
                       type="number"
                       value={config.interval || 30}
                       onChange={(e) => onUpdateConfig({ ...config, interval: parseInt(e.target.value) })}
                       className="w-16 bg-white/5 border border-white/10 rounded-xl py-1.5 text-center text-xs font-black text-lomuz-imperial focus:border-lomuz-imperial outline-none"
                    />
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">
                       {unitLabels[unit].toLowerCase()}
                    </span>
                    <Repeat size={12} className="ml-auto text-white/10" />
                 </div>
              </div>
           ) : (
              <div className="space-y-3">
                 <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                       <Clock size={10} className="text-lomuz-imperial" /> Janelas de Execução
                    </span>
                 </div>

                 <div className="grid grid-cols-1 gap-3 bg-black/20 p-4 rounded-2xl border border-white/5">
                    <div className="grid grid-cols-2 gap-3">
                       <div className="space-y-1">
                          <label className="text-[8px] font-black text-white/30 uppercase tracking-widest ml-1">Início</label>
                          <input 
                             type="time" 
                             value={newStartTime}
                             onChange={e => setNewStartTime(e.target.value)}
                             className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none focus:border-lomuz-imperial"
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[8px] font-black text-white/30 uppercase tracking-widest ml-1">Fim</label>
                          <input 
                             type="time" 
                             value={newEndTime}
                             onChange={e => setNewEndTime(e.target.value)}
                             className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs outline-none focus:border-lomuz-imperial"
                          />
                       </div>
                    </div>
                    <button 
                      onClick={addInterval}
                      className="w-full py-2 bg-lomuz-imperial/20 text-lomuz-imperial border border-lomuz-imperial/30 rounded-xl hover:bg-lomuz-imperial hover:text-white transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"
                    >
                      <Plus size={14} /> Adicionar Intervalo
                    </button>
                 </div>

                 <div className="flex flex-col gap-2 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                    {(config.fixedIntervals || []).length > 0 ? config.fixedIntervals.map((i: string) => (
                       <div key={i} className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl px-4 py-2 group/item">
                          <div className="flex items-center gap-2">
                             <Clock size={12} className="text-lomuz-imperial" />
                             <span className="text-[10px] font-mono font-black text-white/80">{i}</span>
                          </div>
                          <button onClick={() => removeInterval(i)} className="text-white/20 hover:text-rose-500 transition-all"><Trash2 size={12} /></button>
                       </div>
                    )) : (
                       <p className="text-[9px] text-white/20 italic text-center py-2">Nenhum horário definido.</p>
                    )}
                 </div>
              </div>
           )}
        </div>
      )}
    </div>
  );
};

const CreateStreamingWizard: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  const [step, setStep] = useState(1);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    segment: '',
    selectedProfiles: [] as string[],
    attractions: {
      conexaoNews: { active: true, mode: 'FIXO', fixedIntervals: ['08:00 às 09:00', '12:00 às 13:00', '18:00 às 19:00'] },
      horaCerta: { active: true, mode: 'RECORRENTE', interval: 60, unit: 'MINUTOS', fixedIntervals: [] }
    } as Record<string, any>,
  });

  useEffect(() => {
    if (formData.segment && SEGMENT_SUGGESTIONS[formData.segment]) {
      setFormData(prev => ({
        ...prev,
        selectedProfiles: SEGMENT_SUGGESTIONS[formData.segment]
      }));
    }
  }, [formData.segment]);

  const sortedProfiles = useMemo(() => {
    const suggestions = formData.segment ? SEGMENT_SUGGESTIONS[formData.segment] || [] : [];
    const recommended = ALL_DNA_PROFILES.filter(p => suggestions.includes(p.id));
    const others = ALL_DNA_PROFILES.filter(p => !suggestions.includes(p.id));
    return [...recommended, ...others];
  }, [formData.segment]);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const toggleProfile = (id: string) => {
    setFormData(prev => ({
      ...prev,
      selectedProfiles: prev.selectedProfiles.includes(id) 
        ? prev.selectedProfiles.filter(p => p !== id)
        : [...prev.selectedProfiles, id]
    }));
  };

  const toggleAttraction = (id: string) => {
    setFormData(prev => ({
      ...prev,
      attractions: { 
        ...prev.attractions, 
        [id]: { 
          active: !prev.attractions[id]?.active,
          mode: prev.attractions[id]?.mode || 'RECORRENTE',
          interval: prev.attractions[id]?.interval || 30,
          unit: prev.attractions[id]?.unit || 'MINUTOS',
          fixedIntervals: prev.attractions[id]?.fixedIntervals || []
        } 
      }
    }));
  };

  const updateAttractionConfig = (id: string, newConfig: any) => {
    setFormData(prev => ({
      ...prev,
      attractions: { ...prev.attractions, [id]: newConfig }
    }));
  };

  const handleFinalize = async () => {
    setIsFinalizing(true);
    try {
        // 1. Criar a rádio (DRAFT)
        const { id } = await api.radios.createSimple(formData);
        
        // 2. Lançar o streaming (READY)
        const launchData = await api.radios.launchStream(id);
        
        // 3. Redirecionamento automático
        if (launchData.playerUrl) {
            window.location.href = launchData.playerUrl;
        } else {
            window.location.href = `/player/${id}`;
        }
    } catch (e) {
        alert("Erro ao finalizar criação do streaming. Tente novamente.");
        setIsFinalizing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-32 animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-12">
        <button onClick={step === 1 ? onFinish : handleBack} className="flex items-center gap-2 text-sm font-black text-white/40 hover:text-white transition-colors uppercase tracking-widest">
          <ArrowLeft size={16} /> Voltar
        </button>
        <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Setup de Streaming</h1>
        <div className="w-20 md:block hidden" /> 
      </div>

      {/* Stepper */}
      <div className="flex justify-center gap-12 mb-16 relative">
        <div className="absolute top-5 left-1/4 right-1/4 h-px bg-white/5 -z-10" />
        {[
          { s: 1, label: 'DADOS' },
          { s: 2, label: 'CURADORIA' },
          { s: 3, label: 'AUTOMAÇÃO' },
          { s: 4, label: 'ATIVAÇÃO' }
        ].map((item) => (
          <div key={item.s} className="flex flex-col items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
              step === item.s 
                ? 'bg-transparent border-lomuz-imperial text-lomuz-imperial shadow-[0_0_15px_rgba(124,58,237,0.3)]' 
                : step > item.s 
                  ? 'bg-lomuz-imperial border-lomuz-imperial text-white' 
                  : 'bg-[#0D0B14] border-white/5 text-[#475569]'
            }`}>
              {step > item.s ? <Check size={18} strokeWidth={3} /> : <span className="text-sm font-black">{item.s}</span>}
            </div>
            <span className={`text-[10px] font-black tracking-[0.2em] ${step === item.s ? 'text-white' : 'text-[#475569]'}`}>{item.label}</span>
          </div>
        ))}
      </div>

      <div className="min-h-[500px]">
        {step === 1 && (
          <div className="max-w-2xl mx-auto animate-in zoom-in-95 duration-200">
            <Card className="p-12 bg-lomuz-surface border-lomuz-border shadow-2xl flex flex-col items-center text-center rounded-[40px]">
              <div className="mb-10">
                  <h2 className="text-4xl md:text-5xl font-black text-white mb-4 uppercase tracking-tight leading-[1.1]">
                    Sua Marca Merece <br/>
                    <span className="text-transparent bg-clip-text bg-premium-gradient">Um Som Inteligente.</span>
                  </h2>
                  <p className="text-lomuz-muted text-sm max-w-lg mx-auto font-medium leading-relaxed">
                    A primeira plataforma que une Psicologia Musical e Marketing de Áudio.
                  </p>
              </div>
              <div className="w-full space-y-8 text-left bg-black/20 p-8 rounded-[32px] border border-white/5">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-lomuz-muted uppercase tracking-[0.2em] ml-1">NOME DO STREAMING</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Shopping Max Premium"
                    className="w-full bg-[#05030B] border-2 border-white/5 focus:border-lomuz-imperial rounded-2xl p-5 text-lg text-white font-black outline-none transition-all placeholder:text-white/10"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-lomuz-muted uppercase tracking-[0.2em] ml-1">SEGMENTO DE MERCADO</label>
                  <select 
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-white font-black outline-none appearance-none text-sm"
                    value={formData.segment}
                    onChange={e => setFormData({...formData, segment: e.target.value})}
                  >
                    <option value="" disabled className="bg-lomuz-surface">Selecione...</option>
                    {SEGMENTS.map(s => (
                       <option key={s.id} value={s.id} className="bg-lomuz-surface">{s.title}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="w-full pt-12 flex justify-center">
                <Button onClick={handleNext} disabled={!formData.name || !formData.segment} variant="primary" className="w-full max-w-[320px] h-16 text-sm font-black uppercase tracking-[0.2em] shadow-glow rounded-2xl">
                  Próximo Passo <ArrowRight size={20} className="ml-2"/>
                </Button>
              </div>
            </Card>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-7xl mx-auto animate-in slide-in-from-right-4 duration-300">
             <div className="mb-12 text-center">
                <h2 className="text-4xl font-black text-white uppercase tracking-tight italic">DNA Sonoro</h2>
                <p className="text-lomuz-muted text-sm font-medium mt-3">Curadoria inicial sugerida para <span className="text-lomuz-imperial font-black uppercase">{SEGMENTS.find(s => s.id === formData.segment)?.title}</span>. Sinta-se livre para orquestrar como desejar.</p>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {sortedProfiles.map((profile) => {
                  const isSelected = formData.selectedProfiles.includes(profile.id);
                  const isSuggested = formData.segment && SEGMENT_SUGGESTIONS[formData.segment]?.includes(profile.id);
                  return (
                    <button 
                      key={profile.id}
                      onClick={() => toggleProfile(profile.id)}
                      className={`p-7 rounded-[32px] border-2 text-left transition-all relative group h-full flex flex-col ${isSelected ? 'bg-lomuz-imperial/10 border-lomuz-imperial shadow-glow' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
                    >
                      {isSuggested && (
                         <div className="absolute -top-3 left-6 px-3 py-1 bg-accent rounded-full text-[8px] font-black text-white uppercase tracking-widest shadow-glow-accent z-10 animate-in slide-in-from-bottom-2">
                           Recomendada
                         </div>
                      )}
                      {isSelected && (
                        <div className="absolute top-6 right-6 w-6 h-6 bg-lomuz-imperial rounded-full flex items-center justify-center text-white animate-in zoom-in duration-300 shadow-glow">
                          <Check size={14} strokeWidth={4} />
                        </div>
                      )}
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-all ${isSelected ? 'bg-lomuz-imperial text-white shadow-glow' : 'bg-white/5 text-white/20'}`}>
                        {profile.icon}
                      </div>
                      <h4 className={`text-sm font-black uppercase mb-2 transition-colors ${isSelected ? 'text-white' : 'text-white/60'}`}>{profile.title}</h4>
                      <p className="text-[10px] text-lomuz-muted leading-relaxed font-medium flex-1">{profile.desc}</p>
                    </button>
                  );
                })}
             </div>
             <div className="flex justify-center mt-16 gap-6">
                <Button variant="ghost" onClick={handleBack} className="text-white/40 hover:text-white uppercase tracking-widest text-xs font-black">Voltar</Button>
                <Button onClick={handleNext} disabled={formData.selectedProfiles.length === 0} variant="primary" className="px-12 h-16 text-sm font-black uppercase tracking-[0.2em] shadow-glow rounded-2xl">
                  Continuar Setup <ArrowRight size={20} className="ml-2" />
                </Button>
             </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-7xl mx-auto animate-in slide-in-from-right-4 duration-300">
             <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                  <h2 className="text-4xl font-black text-white uppercase tracking-tight leading-none italic">Orquestração Inteligente</h2>
                  <p className="text-lomuz-muted text-sm font-medium mt-3">Configure as intervenções automáticas da sua grade. Defina intervalos de repetição ou janelas fixas.</p>
                </div>
                <button className="flex items-center gap-2 text-[10px] font-black text-lomuz-imperial uppercase tracking-widest hover:brightness-110 px-4 py-2 border border-lomuz-imperial/20 rounded-xl bg-lomuz-imperial/5">
                   <RefreshCw size={14} /> Restaurar Padrão
                </button>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div className="space-y-6">
                   <div className="flex items-center gap-3">
                      <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Serviços de Rede</h3>
                      <div className="h-px flex-1 bg-white/5" />
                   </div>
                   <div className="grid grid-cols-1 gap-4">
                      {INFORMATIVE_ATTRACTIONS.map(item => (
                        <AutomationCard 
                          key={item.id} 
                          item={item} 
                          config={formData.attractions[item.id] || { active: false, mode: 'RECORRENTE', interval: 30, unit: 'MINUTOS', fixedIntervals: [] }}
                          onToggle={() => toggleAttraction(item.id)} 
                          onUpdateConfig={(conf) => updateAttractionConfig(item.id, conf)}
                        />
                      ))}
                   </div>
                </div>
                <div className="space-y-6">
                   <div className="flex items-center gap-3">
                      <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Dicas e Conteúdos</h3>
                      <div className="h-px flex-1 bg-white/5" />
                   </div>
                   <div className="grid grid-cols-1 gap-4">
                      {CONTENT_ATTRACTIONS.map(item => (
                        <AutomationCard 
                          key={item.id} 
                          item={item} 
                          config={formData.attractions[item.id] || { active: false, mode: 'RECORRENTE', interval: 30, unit: 'MÚSICAS', fixedIntervals: [] }}
                          onToggle={() => toggleAttraction(item.id)} 
                          onUpdateConfig={(conf) => updateAttractionConfig(item.id, conf)}
                        />
                      ))}
                   </div>
                </div>
             </div>
             <div className="flex justify-center mt-20 gap-4">
                <Button variant="secondary" onClick={handleBack} className="px-10 h-14 uppercase tracking-widest text-xs font-black">Voltar</Button>
                <Button onClick={handleNext} variant="primary" className="px-10 h-14 uppercase tracking-widest text-xs font-black shadow-glow">Revisão Final</Button>
             </div>
          </div>
        )}

        {step === 4 && (
          <div className="max-w-2xl mx-auto animate-in zoom-in-95 duration-200">
            <Card className="p-10 bg-lomuz-surface border-lomuz-border shadow-2xl rounded-[40px]">
               <div className="text-center mb-10">
                  <div className="w-16 h-16 bg-lomuz-imperial/10 rounded-full flex items-center justify-center mx-auto mb-4 text-lomuz-imperial border border-lomuz-imperial/20">
                     <CheckCircle2 size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-white uppercase italic">Setup Concluído!</h2>
                  <p className="text-lomuz-muted text-sm mt-2">Sua programação foi orquestrada com sucesso.</p>
               </div>
               <div className="space-y-4 mb-10">
                  <div className="flex justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                     <span className="text-[10px] font-black text-lomuz-muted uppercase tracking-widest">Projeto</span>
                     <span className="text-sm font-bold text-white">{formData.name}</span>
                  </div>
                  <div className="flex justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                     <span className="text-[10px] font-black text-lomuz-muted uppercase tracking-widest">Segmento</span>
                     <span className="text-sm font-bold text-white uppercase">{SEGMENTS.find(s => s.id === formData.segment)?.title}</span>
                  </div>
                  <div className="flex justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                     <span className="text-[10px] font-black text-lomuz-muted uppercase tracking-widest">Ativos</span>
                     <span className="text-sm font-bold text-white">{Object.values(formData.attractions).filter((v: any) => v.active).length} Automações Ativas</span>
                  </div>
               </div>
               <div className="space-y-4">
                  <Button onClick={handleFinalize} isLoading={isFinalizing} variant="primary" className="w-full h-16 text-xs font-black uppercase tracking-[0.3em] shadow-glow italic">
                    {isFinalizing ? "Sincronizando..." : "Lançar Streaming Agora"}
                  </Button>
                  <Button variant="ghost" onClick={handleBack} className="w-full text-lomuz-muted font-bold uppercase tracking-widest text-[10px]">Ajustar Detalhes</Button>
               </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateStreamingWizard;
