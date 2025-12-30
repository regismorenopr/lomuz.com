
import React, { useState, useEffect } from 'react';
import { 
  Music, Mic, AudioLines, Calendar, ClipboardList, 
  BarChart3, RotateCcw, Radio as RadioIcon, X, 
  Search, Plus, Settings2, Activity, Signal,
  ChevronRight
} from 'lucide-react';
import { Button, Badge } from '../../components/ui';
import { useTranslation } from '../../contexts/I18nContext';
import { ApiService } from '../../services/mockApi';
import { Radio } from '../../types';

const StreamingPlayersPage: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  const { t } = useTranslation();
  const [clients, setClients] = useState<Radio[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'manage'>('list');
  const [selectedRadio, setSelectedRadio] = useState<Radio | null>(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await ApiService.getClients();
    // ORDENAÇÃO A-Z PADRÃO
    const sorted = [...data].sort((a, b) => a.name.localeCompare(b.name));
    setClients(sorted);
    setLoading(false);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.companyName.toLowerCase().includes(search.toLowerCase())
  );

  if (viewMode === 'manage' && selectedRadio) {
      return (
        <div className="animate-in fade-in duration-500">
           <button onClick={() => setViewMode('list')} className="flex items-center gap-2 text-lomuz-muted hover:text-white mb-6 text-sm font-bold transition-colors">
             <RotateCcw size={16} /> Voltar para Frota
           </button>
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-lomuz-border pb-8 mb-8">
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="p-3 bg-lomuz-imperial/10 rounded-2xl text-lomuz-imperial shadow-glow">
                       <RadioIcon size={24}/>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight uppercase">{selectedRadio.name}</h1>
                        <p className="text-xs text-lomuz-muted font-bold uppercase tracking-widest">{selectedRadio.companyName}</p>
                    </div>
                 </div>
              </div>
              <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => window.open(`/player?id=${selectedRadio.id}&monitor=true`, '_blank')} leftIcon={<Activity size={16}/>}>{t('radios.cards.player')}</Button>
                  <Button variant="primary" leftIcon={<Settings2 size={16}/>}>Configurações Avançadas</Button>
              </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ActionCard interactive title={t('radios.cards.music')} icon={Music} desc="Mix de gêneros e regras musicais." />
              <ActionCard interactive title={t('radios.cards.attractions')} icon={Mic} desc="Vinhetas e conteúdos automáticos." />
              <ActionCard interactive title={t('radios.cards.audio')} icon={AudioLines} desc="Normalização e processamento." />
              <ActionCard interactive title={t('radios.cards.scheduling')} icon={Calendar} desc="Programação datada e horários." />
              <ActionCard interactive title={t('radios.cards.audit')} icon={ClipboardList} desc="Logs técnicos de execução." />
              <ActionCard interactive title={t('radios.cards.reports')} icon={BarChart3} desc="Conformidade e uptime." />
           </div>
        </div>
      );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black text-white tracking-tighter uppercase">{t('radios.title')}</h1>
           <p className="text-lomuz-muted text-sm font-medium mt-1">{t('radios.subtitle')}</p>
        </div>
        <Button 
          variant="primary" 
          leftIcon={<Plus size={20}/>}
          onClick={() => onNavigate && onNavigate('create-radio')}
          className="px-8 h-12 rounded-2xl text-xs font-bold uppercase tracking-widest"
        >
          {t('radios.newStreaming')}
        </Button>
      </div>

      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-lomuz-muted group-focus-within:text-lomuz-imperial transition-colors" size={18} />
        <input 
            type="text" 
            placeholder="Buscar por cliente ou rádio..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-lomuz-surface border border-lomuz-border rounded-2xl py-3.5 pl-12 pr-4 text-white focus:border-lomuz-imperial/50 outline-none transition-all font-bold"
        />
      </div>

      <div className="bg-lomuz-surface border border-lomuz-border rounded-[32px] overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
            <thead className="bg-lomuz-bg-alt/50 border-b border-lomuz-border text-[10px] font-black uppercase text-lomuz-muted tracking-[0.2em]">
                <tr>
                    <th className="px-8 py-6">{t('radios.table.client')}</th>
                    <th className="px-8 py-6">{t('radios.table.status')}</th>
                    <th className="px-8 py-6">{t('radios.table.listeners')}</th>
                    <th className="px-8 py-6">{t('radios.table.bitrate')}</th>
                    <th className="px-8 py-6 text-right">{t('radios.table.actions')}</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-lomuz-border/30">
                {loading ? (
                    <tr><td colSpan={5} className="py-20 text-center text-lomuz-muted italic">Carregando frota de players...</td></tr>
                ) : filteredClients.map(c => (
                    <tr key={c.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${c.status === 'ONLINE' ? 'bg-lomuz-imperial/10 border-lomuz-imperial/20 text-lomuz-imperial' : 'bg-white/5 border-white/10 text-lomuz-muted'}`}>
                                    <RadioIcon size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white tracking-tight">{c.name}</p>
                                    <p className="text-[10px] text-lomuz-muted uppercase font-black tracking-tighter">{c.companyName} • {c.city}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${c.status === 'ONLINE' ? 'bg-lomuz-imperial animate-pulse shadow-[0_0_8px_rgba(124,58,237,0.6)]' : 'bg-lomuz-muted'}`} />
                                <Badge status={c.status} />
                            </div>
                        </td>
                        <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                                <Activity size={14} className="text-lomuz-muted" />
                                <span className="text-xs font-mono font-bold text-white">0 / {c.sessionLimit || 100}</span>
                            </div>
                        </td>
                        <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                                <Signal size={14} className="text-lomuz-muted" />
                                <span className="text-[10px] font-black text-lomuz-muted uppercase">{c.bitrate || 128} KBPS</span>
                            </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setSelectedRadio(c); setViewMode('manage'); }} className="p-2 hover:bg-lomuz-imperial/10 rounded-lg text-lomuz-muted hover:text-lomuz-imperial" title="Gerenciar"><Settings2 size={18}/></button>
                                <button className="p-2 hover:bg-rose-500/10 rounded-lg text-lomuz-muted hover:text-rose-500" title="Excluir"><X size={18}/></button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

const ActionCard = ({ title, icon: Icon, desc, onClick, interactive }: any) => (
    <div onClick={onClick} className={`group bg-lomuz-surface border border-lomuz-border p-6 rounded-3xl transition-all relative overflow-hidden ${interactive ? 'cursor-pointer hover:border-lomuz-imperial/40 hover:shadow-2xl hover:shadow-lomuz-imperial/5' : ''}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 bg-lomuz-bg rounded-2xl border border-lomuz-border group-hover:text-lomuz-imperial transition-all"><Icon size={24} /></div>
        {interactive && <ChevronRight size={18} className="text-lomuz-muted group-hover:text-white transition-all" />}
      </div>
      <h3 className="text-sm font-black text-white uppercase mb-1">{title}</h3>
      <p className="text-[11px] text-lomuz-muted leading-relaxed">{desc}</p>
    </div>
);

export default StreamingPlayersPage;
