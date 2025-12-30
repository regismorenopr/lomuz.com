
import React, { useState, useEffect } from 'react';
import { 
  Music, Mic, Calendar, ClipboardList, 
  BarChart3, ChevronRight, X, Info, Zap,
  ExternalLink, RotateCcw, ShieldCheck, 
  Settings2, Sliders, History, Radio as RadioIcon,
  Timer, Volume2, Waves, Activity, Monitor
} from 'lucide-react';
import { Button, Card, Badge } from '../../components/ui';
import { useTranslation } from '../../contexts/I18nContext';
import { ApiService } from '../../services/mockApi';
import { Radio } from '../../types';

type PreferenceModule = 'music' | 'content' | 'audio' | 'audit' | 'reports' | null;

const PreferenciasPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeModule, setActiveModule] = useState<PreferenceModule>(null);
  const [clients, setClients] = useState<Radio[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    ApiService.getClients().then(setClients);
  }, []);

  const selectedClient = clients.find(c => c.id === selectedClientId);

  // --- COMPONENT: PREFERENCE CARD ---
  const PreferenceCard = ({ id, icon: Icon, title, desc }: { id: PreferenceModule, icon: any, title: string, desc: string }) => (
    <div 
      onClick={() => setActiveModule(id)}
      className="group bg-lomuz-surface border border-lomuz-border p-6 rounded-3xl cursor-pointer hover:border-lomuz-gold/40 transition-all hover:shadow-2xl hover:shadow-lomuz-gold/5 relative overflow-hidden"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-lomuz-bg rounded-2xl border border-lomuz-border group-hover:text-lomuz-gold transition-all">
          <Icon size={24} />
        </div>
        <ChevronRight size={18} className="text-lomuz-muted group-hover:text-white transition-all" />
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-xs text-lomuz-muted leading-relaxed">{desc}</p>
    </div>
  );

  // --- COMPONENT: DRAWER ---
  const Drawer = ({ title, isOpen, onClose, children }: { title: string, isOpen: boolean, onClose: () => void, children?: React.ReactNode }) => {
    if (!isOpen) return null;
    return (
      <>
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-in fade-in duration-300" onClick={onClose} />
        <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-lomuz-bg border-l border-lomuz-border z-[101] shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
          <div className="p-8 border-b border-lomuz-border flex justify-between items-center bg-lomuz-surface/50">
            <div>
               <p className="text-[10px] font-black text-lomuz-gold uppercase tracking-[0.2em] mb-1">{selectedClient?.name || 'Ajustes de Sistema'}</p>
               <h3 className="text-xl font-black text-white uppercase">{title}</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-lomuz-muted hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {children || <div className="py-20 text-center text-lomuz-muted opacity-30 italic">Nenhuma configuração disponível neste módulo.</div>}
          </div>
          <div className="p-8 border-t border-lomuz-border bg-lomuz-surface/30 flex gap-4">
             <Button variant="secondary" onClick={onClose} className="flex-1">Descartar</Button>
             <Button variant="primary" onClick={() => { setHasChanges(true); onClose(); }}>Confirmar Ajustes</Button>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-32 animate-in fade-in duration-500">
      
      {/* HEADER E SELETOR DE CONTEXTO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-lomuz-border pb-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-lomuz-gold/10 rounded-lg text-lomuz-gold"><ShieldCheck size={20} /></div>
             <h1 className="text-3xl font-black text-white tracking-tight uppercase tracking-tighter">PREFERÊNCIAS</h1>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-lomuz-muted uppercase tracking-widest mb-1">Seletor de Contexto (Unidade)</span>
            <select 
              value={selectedClientId} 
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="bg-lomuz-surface border border-lomuz-border rounded-xl px-4 py-2 text-sm font-bold text-white outline-none focus:border-lomuz-gold transition-all cursor-pointer min-w-[240px]"
            >
              <option value="">Selecione uma rádio...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
        
        <div className="flex gap-3">
           <Button variant="secondary" onClick={() => window.location.reload()} leftIcon={<RotateCcw size={16} />}>Restaurar Padrão</Button>
           <Button variant="gold" disabled={!selectedClientId} onClick={() => window.open(`/player?id=${selectedClientId}&monitor=true`, '_blank')} leftIcon={<ExternalLink size={16} />}>Abrir Player</Button>
        </div>
      </div>

      {/* GRID DE MODULOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PreferenceCard 
          id="music" 
          icon={Music} 
          title="Curadoria Musical" 
          desc="Mix de gêneros musicais e regras de repetição/separação por artista." 
        />
        <PreferenceCard 
          id="content" 
          icon={Mic} 
          title="Conteúdo Automático" 
          desc="Vinhetas, spots institucionais, temperatura e hora certa automática." 
        />
        <PreferenceCard 
          id="audio" 
          icon={AudioLines} 
          title="Processamento de Áudio" 
          desc="Volume master, normalização inteligente (DSP) e transições de áudio." 
        />
        <PreferenceCard 
          id="audit" 
          icon={ClipboardList} 
          title="Auditoria Técnica" 
          desc="Logs detalhados de execução técnica das últimas 24h e histórico." 
        />
        <PreferenceCard 
          id="reports" 
          icon={BarChart3} 
          title="Relatórios de Saúde" 
          desc="Gráficos de conformidade, sucesso de sinal, conexões e uptime." 
        />
      </div>

      {/* DRAWERS */}
      
      {/* 1. CURADORIA MUSICAL */}
      <Drawer title="Curadoria Musical" isOpen={activeModule === 'music'} onClose={() => setActiveModule(null)}>
         <div className="space-y-10">
            {/* Mix de Gêneros */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 text-lomuz-gold">
                   <Waves size={18} />
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Estratégia de Curadoria (%)</h4>
                </div>
                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl space-y-6">
                    {['Jazz Lounge', 'Pop Rock', 'Acoustic Cover'].map(g => (
                    <div key={g} className="space-y-2">
                        <div className="flex justify-between text-xs font-black text-white uppercase">
                            <span>{g}</span>
                            <span className="text-lomuz-gold">33%</span>
                        </div>
                        <input type="range" className="w-full accent-lomuz-gold" />
                    </div>
                    ))}
                </div>
            </div>

            {/* Regras de Separação */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 text-lomuz-gold">
                   <Timer size={18} />
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Regras de Proteção (Minutos)</h4>
                </div>
                <div className="grid gap-4">
                    <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-white">Separação de Artista</span>
                            <span className="text-[10px] text-lomuz-muted italic">Mínimo de tempo para repetir o mesmo cantor.</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <input type="number" defaultValue={60} className="w-16 bg-black/40 border border-white/10 rounded-lg p-2 text-center text-sm font-bold text-white" />
                            <span className="text-[10px] font-bold text-lomuz-muted uppercase">Min</span>
                        </div>
                    </div>
                    <div className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-white">Separação de Faixa</span>
                            <span className="text-[10px] text-lomuz-muted italic">Tempo mínimo para repetir a mesma música exata.</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <input type="number" defaultValue={240} className="w-16 bg-black/40 border border-white/10 rounded-lg p-2 text-center text-sm font-bold text-white" />
                            <span className="text-[10px] font-bold text-lomuz-muted uppercase">Min</span>
                        </div>
                    </div>
                </div>
            </div>
         </div>
      </Drawer>

      {/* 2. CONTEÚDO AUTOMÁTICO */}
      <Drawer title="Conteúdo Automático" isOpen={activeModule === 'content'} onClose={() => setActiveModule(null)}>
          <div className="space-y-8">
              <div className="p-5 bg-lomuz-gold/5 border border-lomuz-gold/20 rounded-3xl flex gap-4 text-lomuz-gold">
                 <Info size={20} className="shrink-0" />
                 <p className="text-xs font-bold leading-relaxed">Defina a inteligência de inserção de conteúdos não-musicais que o player deve processar automaticamente.</p>
              </div>

              <div className="space-y-4">
                  <label className="text-[10px] font-black text-lomuz-muted uppercase tracking-widest block px-2">Cidade para Temperatura</label>
                  <input type="text" placeholder="Ex: São Paulo, SP" className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-lomuz-gold outline-none" defaultValue="São Paulo, SP" />
              </div>

              <div className="space-y-4">
                  <label className="text-[10px] font-black text-lomuz-muted uppercase tracking-widest block px-2">Frequência da Hora Certa</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none">
                      <option>A cada 30 minutos</option>
                      <option>A cada 60 minutos</option>
                      <option>Desativado</option>
                  </select>
              </div>
          </div>
      </Drawer>

      {/* 3. PROCESSAMENTO DE ÁUDIO */}
      <Drawer title="Processamento de Áudio" isOpen={activeModule === 'audio'} onClose={() => setActiveModule(null)}>
          <div className="space-y-10">
             {/* Volume Master */}
             <div className="p-8 bg-white/[0.03] rounded-[40px] border border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                   <h4 className="text-xs font-black text-white uppercase tracking-widest">Volume Master (Software)</h4>
                   <Volume2 size={18} className="text-lomuz-gold" />
                </div>
                <input type="range" className="w-full accent-lomuz-gold" defaultValue={85} />
                <div className="flex justify-between text-[10px] font-mono text-lomuz-muted"><span>0% (Mute)</span><span>85% (Ideal)</span><span>100% (Max)</span></div>
             </div>

             {/* DSP Presets */}
             <div className="space-y-4">
                <label className="text-[10px] font-black text-lomuz-muted uppercase tracking-widest block px-2">Preset de Processamento (DSP)</label>
                <div className="grid grid-cols-2 gap-3">
                   {['NEUTRO', 'BROADCAST', 'SUAVE', 'LOJA / VAREJO', 'VOZ CLARA', 'NOTURNO'].map(p => (
                      <button key={p} className={`p-4 rounded-2xl border text-[10px] font-black uppercase text-left transition-all ${p === 'BROADCAST' ? 'bg-lomuz-gold border-lomuz-gold text-black' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'}`}>
                         {p}
                      </button>
                   ))}
                </div>
             </div>

             {/* Transição */}
             <div className="bg-black/40 rounded-3xl p-6 border border-white/5 space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-xs font-bold text-white uppercase">Fundição de Faixas (Crossfade)</span>
                      <span className="text-[10px] text-lomuz-muted italic">Tempo de sobreposição entre as músicas.</span>
                   </div>
                   <span className="text-xs font-black text-lomuz-gold">1.5s</span>
                </div>
                <input type="range" min="0" max="5" step="0.5" className="w-full accent-lomuz-gold" defaultValue={1.5} />
             </div>

             {/* Qualidade */}
             <div className="flex items-center justify-between p-6 bg-white/[0.03] rounded-2xl border border-white/5">
                <div className="flex flex-col">
                   <span className="text-xs font-bold text-white uppercase">Taxa de Streaming</span>
                   <span className="text-[10px] text-lomuz-muted italic">Configura a fidelidade do áudio vs estabilidade de rede.</span>
                </div>
                <select className="bg-black/40 border border-white/10 rounded-lg p-2 text-xs font-bold text-white">
                   <option>48 kbps (Econômico)</option>
                   <option selected>128 kbps (HD Stereo)</option>
                   <option>256 kbps (Ultra HQ)</option>
                </select>
             </div>
          </div>
      </Drawer>

      {/* 4. AUDITORIA TÉCNICA */}
      <Drawer title="Auditoria Técnica" isOpen={activeModule === 'audit'} onClose={() => setActiveModule(null)}>
          <div className="space-y-6">
             <div className="relative group">
                <input type="text" placeholder="Filtrar logs por ação ou usuário..." className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white" />
             </div>
             <div className="space-y-2">
                {[
                    { u: 'Ana Souza', a: 'Alteração de Crossfade', t: 'Há 12 min' },
                    { u: 'João Diretor', a: 'Inclusão de Gênero: Pop', t: 'Há 45 min' },
                    { u: 'SISTEMA', a: 'Sincronização de Player: OK', t: 'Há 2h' },
                    { u: 'Ana Souza', a: 'Update de Volume: 85%', t: 'Ontem, 18:30' }
                ].map((log, i) => (
                    <div key={i} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl flex items-center gap-4">
                       <div className="w-8 h-8 rounded-full bg-lomuz-bg flex items-center justify-center text-lomuz-muted"><History size={14}/></div>
                       <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{log.a}</p>
                          <p className="text-[9px] text-lomuz-muted uppercase font-black">{log.u}</p>
                       </div>
                       <span className="text-[9px] text-lomuz-muted font-mono">{log.t}</span>
                    </div>
                ))}
             </div>
          </div>
      </Drawer>

      {/* 5. RELATÓRIOS DE SAÚDE */}
      <Drawer title="Relatórios de Saúde" isOpen={activeModule === 'reports'} onClose={() => setActiveModule(null)}>
          <div className="space-y-8">
             <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-white/[0.03] border border-white/5 rounded-3xl text-center">
                    <Activity size={24} className="mx-auto text-green-500 mb-2" />
                    <h5 className="text-xl font-black text-white">99.9%</h5>
                    <p className="text-[9px] font-bold text-lomuz-muted uppercase">Uptime Médio</p>
                </div>
                <div className="p-5 bg-white/[0.03] border border-white/5 rounded-3xl text-center">
                    <Monitor size={24} className="mx-auto text-lomuz-gold mb-2" />
                    <h5 className="text-xl font-black text-white">128</h5>
                    <p className="text-[9px] font-bold text-lomuz-muted uppercase">Conexões Pico</p>
                </div>
             </div>
             <div className="p-6 bg-lomuz-imperial/5 border border-lomuz-imperial/20 rounded-3xl">
                <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-4">Uso de Armazenamento Cloud</h4>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                   <div className="h-full bg-lomuz-imperial" style={{ width: '65%' }} />
                </div>
                <div className="flex justify-between mt-2 text-[9px] font-bold text-lomuz-muted">
                   <span>65.4 GB USADO</span>
                   <span>100 GB LIMITE</span>
                </div>
             </div>
          </div>
      </Drawer>

      {/* BARRA DE SALVAMENTO FLUTUANTE (DIRTY STATE) */}
      {hasChanges && (
         <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[90] w-full max-w-2xl px-4 animate-in slide-in-from-bottom-10 duration-500">
            <div className="bg-lomuz-imperial border border-white/20 rounded-3xl p-5 shadow-2xl flex items-center justify-between gap-6 backdrop-blur-xl">
               <div className="flex items-center gap-4 text-white">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-pulse"><Zap size={18} className="text-lomuz-gold" /></div>
                  <div>
                     <p className="text-sm font-black uppercase tracking-tighter">Alterações Pendentes</p>
                     <p className="text-[10px] opacity-60">Sincronização imediata necessária com o player.</p>
                  </div>
               </div>
               <div className="flex gap-2">
                  <button onClick={() => setHasChanges(false)} className="px-4 py-2 text-xs font-bold text-white/50 hover:text-white uppercase transition-colors">Descartar</button>
                  <Button variant="gold" onClick={() => setHasChanges(false)}>Salvar Preferências</Button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};

const AudioLines = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 10v3M6 6v11M10 3v18M14 8v7M18 5v13M22 10v3"/>
  </svg>
);

export default PreferenciasPage;
