
import React, { useState, useEffect } from 'react';
import { 
  Users, Search, ChevronRight, 
  Settings, Activity, MoreVertical, 
  MapPin, Radio, Filter, RefreshCw,
  Plus, Signal, LayoutGrid, List,
  Thermometer, Music, Terminal, HelpCircle,
  // Added missing Calendar icon import
  Calendar
} from 'lucide-react';
import { Button, Badge } from '../../components/ui';
import { ApiService } from '../../services/mockApi';
import { useTranslation } from '../../contexts/I18nContext';
import { Radio as RadioType } from '../../types';

const ClientsList: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { t, localeCompare } = useTranslation();
  const [clients, setClients] = useState<RadioType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getClients();
      const sorted = [...data].sort((a, b) => localeCompare(a.companyName, b.companyName));
      setClients(sorted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(c => 
    c.companyName.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      
      {/* 1. TOP KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#0D0D16] border border-white/5 rounded-[24px] p-8 flex items-center justify-between group hover:border-lomuz-imperial/30 transition-all">
          <div>
            <p className="text-[10px] font-black text-lomuz-muted uppercase tracking-[0.2em] mb-4">SESSÕES ATIVAS</p>
            <h4 className="text-4xl font-black text-white tracking-tighter">1.240</h4>
          </div>
          <div className="w-14 h-14 rounded-full bg-white/[0.03] flex items-center justify-center text-white/40 group-hover:text-lomuz-imperial transition-colors">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-[#0D0D16] border border-white/5 rounded-[24px] p-8 flex items-center justify-between group hover:border-lomuz-gold/30 transition-all">
          <div>
            <p className="text-[10px] font-black text-lomuz-muted uppercase tracking-[0.2em] mb-4">STREAMINGS ONLINE</p>
            <div className="flex items-baseline gap-1">
              <h4 className="text-4xl font-black text-white tracking-tighter">1</h4>
              <span className="text-lg font-bold text-lomuz-muted">/ 1</span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-full bg-white/[0.03] flex items-center justify-center text-white/40 group-hover:text-lomuz-gold transition-colors">
            <Signal size={24} />
          </div>
        </div>

        <div 
          onClick={() => onNavigate('create-radio')}
          className="bg-[#0D0D16] border border-white/5 rounded-[24px] p-8 flex flex-col items-center justify-center cursor-pointer hover:border-white/20 transition-all border-dashed group"
        >
          <div className="w-10 h-10 rounded-full bg-white/[0.03] flex items-center justify-center mb-4 text-white/20 group-hover:bg-white/10 group-hover:text-white transition-all">
            <Plus size={20} />
          </div>
          <h4 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-2">
            Adicionar Cliente <HelpCircle size={14} className="text-white/20" />
          </h4>
        </div>
      </div>

      {/* 2. HEADER & FILTERS */}
      <div className="space-y-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tight">Gerenciar Clientes</h2>
          <p className="text-lomuz-muted text-sm mt-2">Gerencie suas transmissões e monitore a audiência.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#334155] group-focus-within:text-lomuz-gold transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Pesquisar por Cliente, Streaming, Segmento ou Diretor..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#0D0D16] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm focus:border-white/10 outline-none transition-all placeholder:text-[#334155]"
            />
          </div>
          
          <div className="flex bg-[#0D0D16] p-1 rounded-xl border border-white/5">
            <button className="p-2 text-lomuz-muted hover:text-white"><LayoutGrid size={18} /></button>
            <button className="p-2 bg-lomuz-imperial text-white rounded-lg shadow-glow"><List size={18} /></button>
          </div>

          <div className="flex items-center gap-2">
            <select className="bg-[#0D0D16] border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none">
              <option>A-Z (Padrão)</option>
            </select>
            <select className="bg-[#0D0D16] border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white outline-none min-w-[120px]">
              <option>Todos</option>
            </select>
            <button onClick={loadClients} className="p-3 bg-[#0D0D16] border border-white/5 rounded-xl text-lomuz-muted hover:text-white transition-all">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
        
        <p className="text-[10px] font-black text-lomuz-imperial uppercase tracking-widest">Mostrando {filteredClients.length} clientes</p>
      </div>

      {/* 3. CLIENT LIST (HORIZONTAL ITEMS) */}
      <div className="space-y-4">
        {filteredClients.map((c, idx) => (
          <div 
            key={c.id}
            className="bg-[#0D0D16] border border-white/5 rounded-[24px] p-6 flex flex-wrap lg:flex-nowrap items-center gap-8 group hover:border-white/10 transition-all relative overflow-hidden"
          >
            {/* NO AR BADGE */}
            <div className="flex-shrink-0">
               <div className="bg-white/5 rounded-xl p-6 border border-white/5 flex flex-col items-center justify-center min-w-[100px]">
                  <span className="px-2 py-0.5 bg-lomuz-imperial/20 text-lomuz-imperial text-[8px] font-black rounded border border-lomuz-imperial/30 uppercase tracking-widest mb-4">NO AR</span>
                  <Radio size={20} className="text-lomuz-gold opacity-50" />
               </div>
            </div>

            {/* COMPANY INFO */}
            <div className="flex-1 min-w-[200px]">
               <h3 className="text-xl font-black text-white mb-3">Grupo Lomuz</h3>
               <div className="flex items-center gap-2">
                 <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/5 rounded-lg">
                    <Terminal size={12} className="text-lomuz-muted" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Varejo Geral</span>
                 </div>
               </div>
            </div>

            {/* DIRECTOR INFO */}
            <div className="flex-1 min-w-[200px] border-l border-white/5 pl-8 space-y-3">
               <div className="flex items-center gap-2">
                  <Users size={14} className="text-lomuz-imperial" />
                  <p className="text-xs font-bold text-white">Diretor: <span className="text-white/70">Ana Souza</span></p>
               </div>
               <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-lomuz-muted" />
                  <p className="text-[10px] font-bold text-lomuz-muted">São Paulo, SP • Brasil</p>
               </div>
               <div className="flex items-center gap-4 text-[10px] font-bold text-lomuz-muted uppercase tracking-tighter">
                  <span className="flex items-center gap-1 opacity-40"><Signal size={12}/> 128k</span>
                  {/* Calendar icon fixed below */}
                  <span className="flex items-center gap-1 opacity-40"><Calendar size={12}/> 15/01/2023</span>
               </div>
            </div>

            {/* PLAYER INFO */}
            <div className="flex-1 min-w-[200px] border-l border-white/5 pl-8 space-y-3">
               <div className="flex items-center gap-2 px-2 py-1 bg-orange-500/10 border border-orange-500/20 rounded w-fit">
                  <Thermometer size={12} className="text-orange-500" />
                  <span className="text-[10px] font-black text-orange-500">31ºC</span>
               </div>
               <div className="flex items-center gap-2">
                  <Music size={14} className="text-lomuz-gold" />
                  <p className="text-xs font-black text-white uppercase tracking-tighter">MPB Café</p>
               </div>
               <div className="flex items-center gap-2 opacity-50">
                  <Users size={14} className="text-lomuz-muted" />
                  <span className="text-[10px] font-bold text-lomuz-muted">1240 ouvintes</span>
               </div>
            </div>

            {/* ACTIONS */}
            <div className="flex items-center gap-2 ml-auto">
               <button className="p-3 hover:bg-white/5 rounded-xl text-lomuz-muted transition-all">
                  <List size={18} />
               </button>
               <button className="p-3 hover:bg-white/5 rounded-xl text-lomuz-muted transition-all">
                  <ChevronRight size={20} />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientsList;
