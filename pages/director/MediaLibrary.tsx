
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { 
  Plus, RefreshCw, Music, Disc, Play, Clock, UploadCloud, 
  Tags, Trash2, X, Search, Pause, Filter,
  List as ListIcon, FileAudio, CheckCircle, AlertTriangle, 
  ChevronRight, Info, Check, ArrowLeft, Layers,
  MoreVertical, Link2, LogIn, Monitor, Headphones,
  // Added Home icon to fix "Cannot find name 'Home'" error
  Home
} from 'lucide-react';
import { ApiService } from '../../services/mockApi';
import { Media, Playlist, Genre, MediaType } from '../../types';
import { Button, PageHeader } from '../../components/ui';
import { useTranslation } from '../../contexts/I18nContext';

// --- CONSTANTS ---
const GENRES_MOCK = [
    { id: '1', name: 'Pop', count: 15, color: 'bg-[#E040FB]' },
    { id: '2', name: 'Rock', count: 18, color: 'bg-[#C2185B]' },
    { id: '3', name: 'Jazz', count: 8, color: 'bg-[#536DFE]' },
    { id: '4', name: 'Ambient', count: 12, color: 'bg-[#4CAF50]' },
    { id: '5', name: 'Eletrônica', count: 20, color: 'bg-[#3D5AFE]' },
    { id: '6', name: 'Sertanejo', count: 15, color: 'bg-[#FF9800]' },
    { id: '7', name: 'Fitness', count: 18, color: 'bg-[#F44336]' },
];

const PLAYLISTS_MOCK = [
    { id: 'p1', name: 'Pop Hits 2024', desc: 'Best of Pop', initials: 'PO', gradient: 'from-[#43E97B] to-[#38F9D7]' },
    { id: 'p2', name: 'Treino Hard', desc: 'High Energy', initials: 'TR', gradient: 'from-[#667EEA] to-[#764BA2]' },
    { id: 'p3', name: 'Jazz & Blues', desc: 'Classics', initials: 'JA', gradient: 'from-[#F093FB] to-[#F5576C]' },
];

const MediaLibraryPage: React.FC = () => {
    const { t, formatDate, localeCompare } = useTranslation();
    const [activeTab, setActiveTab] = useState<'tracks' | 'genres' | 'playlists'>('tracks');
    const [search, setSearch] = useState('');
    const [showInfo, setShowInfo] = useState(true);
    
    // Mock de mídias para a tabela
    const mediaItems = [
        { id: '1', title: 'Cardio Beat', artist: 'FitTrax', duration: '2:00', genres: ['Fitness'], playlists: ['Treino Hard'], user: 'Sistema', date: '01/10/2023' },
        { id: '2', title: 'Dinner Jazz', artist: 'Smooth Quartet', duration: '3:20', genres: ['Jazz'], playlists: ['Jazz & Blues'], user: 'Sistema', date: '02/10/2023' },
        { id: '3', title: 'Happy Shopping', artist: 'Lomuz Select', duration: '2:30', genres: ['Pop'], playlists: ['Pop Hits 2024'], user: 'Sistema', date: '05/10/2023' },
        { id: '4', title: 'Power Workout', artist: 'Gym Heroes', duration: '3:00', genres: ['Eletrônica', 'Fitness'], playlists: ['Treino Hard'], user: 'Sistema', date: '30/09/2023' },
        { id: '5', title: 'Retail Pop Hits', artist: 'Store Radio', duration: '3:00', genres: ['Pop'], playlists: ['Pop Hits 2024'], user: 'Sistema', date: '04/10/2023' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
            
            {/* 1. HEADER PRINCIPAL */}
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight uppercase">BIBLIOTECA MUSICAL</h1>
                    <p className="text-lomuz-muted text-sm mt-1 font-medium">Gerencie suas músicas, vinhetas e playlists.</p>
                </div>
                <button className="p-3 bg-[#0D0D16] border border-white/5 rounded-xl text-lomuz-muted hover:text-white transition-all">
                    <RefreshCw size={20} />
                </button>
            </div>

            {/* 2. BANNER INFORMATIVO (ROXO) */}
            {showInfo && (
                <div className="bg-[#1A1A32] border border-[#7C3AED]/20 rounded-3xl p-8 flex items-start gap-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#7C3AED]" />
                    <div className="w-12 h-12 bg-[#7C3AED]/20 rounded-2xl flex items-center justify-center text-[#7C3AED] shrink-0 border border-[#7C3AED]/20">
                        <Info size={24} />
                    </div>
                    <div className="flex-1 space-y-2">
                        <h4 className="text-sm font-black text-white uppercase tracking-widest">Como funciona Música no Lomuz</h4>
                        <ul className="text-xs text-[#9CA3AF] space-y-2 leading-relaxed">
                            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#7C3AED] rounded-full" /> Músicas têm tratamento diferente de outros áudios (spots/comerciais).</li>
                            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#7C3AED] rounded-full" /> Toda música precisa estar vinculada a um <strong className="text-white">Gênero</strong>.</li>
                            <li className="flex items-center gap-2"><div className="w-1 h-1 bg-[#7C3AED] rounded-full" /> Playlists são formadas por Gêneros. Por isso, <strong className="text-white">músicas não são adicionadas diretamente em playlists</strong>.</li>
                        </ul>
                    </div>
                    <button onClick={() => setShowInfo(false)} className="text-white/20 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
            )}

            {/* 3. NAVEGAÇÃO DE ABAS */}
            <div className="flex gap-10 border-b border-white/5 px-2">
                <button 
                    onClick={() => setActiveTab('tracks')}
                    className={`flex items-center gap-3 pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'tracks' ? 'text-[#7C3AED] border-[#7C3AED]' : 'text-lomuz-muted border-transparent hover:text-white'}`}
                >
                    <Music size={16} /> Músicas
                </button>
                <button 
                    onClick={() => setActiveTab('genres')}
                    className={`flex items-center gap-3 pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'genres' ? 'text-[#7C3AED] border-[#7C3AED]' : 'text-lomuz-muted border-transparent hover:text-white'}`}
                >
                    <Tags size={16} /> Gêneros
                </button>
                <button 
                    onClick={() => setActiveTab('playlists')}
                    className={`flex items-center gap-3 pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all border-b-2 ${activeTab === 'playlists' ? 'text-[#7C3AED] border-[#7C3AED]' : 'text-lomuz-muted border-transparent hover:text-white'}`}
                >
                    <ListIcon size={16} /> Playlists
                </button>
            </div>

            {/* 4. CONTEÚDO DAS ABAS */}
            <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                
                {/* --- ABA MÚSICAS --- */}
                {activeTab === 'tracks' && (
                    <div className="space-y-6">
                        {/* Toolbar */}
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full md:max-w-xl group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#7C3AED] transition-colors" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Buscar por título, artista, gênero..."
                                    className="w-full bg-[#0D0D16] border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:border-white/10 outline-none transition-all placeholder:text-white/20"
                                />
                            </div>
                            <div className="flex items-center gap-6">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">6 selecionados</span>
                                <Button className="bg-[#7C3AED] hover:bg-[#6D28D9] border-none text-xs font-black uppercase tracking-widest px-8 rounded-2xl h-12 shadow-glow shadow-[#7C3AED]/20" leftIcon={<Plus size={16}/>}>
                                    Adicionar
                                </Button>
                            </div>
                        </div>

                        {/* Filtros Rápidos */}
                        <div className="flex gap-2 items-center">
                            <Filter size={14} className="text-white/20 mr-2" />
                            {['TODOS', 'SEM GÊNERO', 'SEM PLAYLIST', 'BLOQUEADAS', 'RECENTES'].map((f, i) => (
                                <button key={f} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${i === 0 ? 'bg-[#00BCD4]/10 border-[#00BCD4]/30 text-[#00BCD4]' : 'bg-white/5 border-white/5 text-white/40 hover:text-white'}`}>
                                    {f}
                                </button>
                            ))}
                        </div>

                        {/* Tabela de Músicas */}
                        <div className="bg-[#0D0D16] border border-white/5 rounded-[32px] overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-black/20 border-b border-white/5 text-[9px] font-black uppercase text-white/30 tracking-[0.2em]">
                                    <tr>
                                        <th className="px-8 py-5 w-12 text-center"><input type="checkbox" className="rounded-sm bg-transparent border-white/20 text-[#7C3AED]" /></th>
                                        <th className="px-6 py-5">TÍTULO</th>
                                        <th className="px-6 py-5">ARTISTA</th>
                                        <th className="px-6 py-5">DURAÇÃO</th>
                                        <th className="px-6 py-5">GÊNEROS</th>
                                        <th className="px-6 py-5">PLAYLISTS</th>
                                        <th className="px-6 py-5">USER • DATA</th>
                                        <th className="px-8 py-5 text-right">AÇÕES</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.03]">
                                    {mediaItems.map(m => (
                                        <tr key={m.id} className="group hover:bg-white/[0.01] transition-all">
                                            <td className="px-8 py-4 text-center">
                                                <input type="checkbox" className="rounded-sm bg-transparent border-white/10 text-[#7C3AED]" />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <button className="text-white/20 group-hover:text-[#7C3AED] transition-colors"><ChevronRight size={18} fill="currentColor" /></button>
                                                    <span className="text-xs font-bold text-white tracking-tight">{m.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[11px] font-bold text-[#64748B]">{m.artist}</td>
                                            <td className="px-6 py-4 text-[10px] font-mono text-white/30">{m.duration}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-1.5">
                                                    {m.genres.map(g => (
                                                        <span key={g} className="px-2 py-0.5 rounded-[4px] bg-[#311B92] text-[#7C3AED] text-[9px] font-black uppercase border border-[#7C3AED]/30">{g}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-1.5">
                                                    {m.playlists.map(p => (
                                                        <span key={p} className="px-2 py-0.5 rounded-[4px] bg-[#F59E0B]/10 text-[#F59E0B] text-[9px] font-black uppercase border border-[#F59E0B]/30">{p}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-white/60">{m.user}</span>
                                                    <span className="text-[9px] text-white/20 font-mono">{m.date}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-2 hover:text-[#7C3AED]"><Link2 size={14} /></button>
                                                    <button className="p-2 hover:text-white"><LogIn size={14} /></button>
                                                    <button className="p-2 hover:text-rose-500"><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- ABA GÊNEROS --- */}
                {activeTab === 'genres' && (
                    <div className="space-y-10">
                        {/* Sub-Header com botões exatos da imagem */}
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                            <div className="flex items-center bg-[#7C3AED] text-white px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest gap-2">
                                Gêneros <ChevronDown size={14} />
                            </div>
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Buscar gêneros..."
                                    className="w-full bg-[#0D0D16] border border-white/5 rounded-xl py-2.5 pl-12 pr-4 text-sm text-white focus:outline-none"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">Criar Gênero</button>
                                <button className="px-6 py-2.5 rounded-xl bg-[#7C3AED] text-white text-xs font-black uppercase tracking-widest hover:bg-[#6D28D9] transition-all flex items-center gap-2 shadow-glow shadow-[#7C3AED]/20">
                                    <UploadCloud size={16} /> Enviar Músicas
                                </button>
                            </div>
                        </div>

                        {/* Lista de Gêneros Estilizados */}
                        <div className="flex flex-wrap gap-4">
                            {GENRES_MOCK.map(g => (
                                <button key={g.id} className={`flex items-center gap-3 px-6 py-4 rounded-full ${g.color} text-white shadow-xl hover:scale-105 transition-all group`}>
                                    <span className="text-sm font-black uppercase tracking-widest">{g.name}</span>
                                    <span className="w-7 h-7 rounded-full bg-black/20 flex items-center justify-center text-[10px] font-black">{g.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- ABA PLAYLISTS --- */}
                {activeTab === 'playlists' && (
                    <div className="space-y-10">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                             <div className="flex items-center bg-[#7C3AED] text-white px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest gap-2">
                                Playlist <ChevronDown size={14} />
                            </div>
                             <div className="flex items-center bg-[#0D0D16] border border-white/5 text-white px-4 py-2.5 rounded-xl font-bold text-xs gap-2">
                                <Home size={14} className="text-white/40" /> Todos Segmentos
                            </div>
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Digite o nome da playlist..."
                                    className="w-full bg-[#0D0D16] border border-white/5 rounded-xl py-2.5 pl-12 pr-4 text-sm text-white focus:outline-none"
                                />
                            </div>
                            <button className="px-6 py-3 rounded-xl bg-[#7C3AED] text-white text-xs font-black uppercase tracking-widest hover:bg-[#6D28D9] transition-all flex items-center gap-2 shadow-glow shadow-[#7C3AED]/20">
                                <Plus size={16} /> Criar Playlist
                            </button>
                        </div>

                        {/* Grid de Cards de Playlist */}
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
                            {PLAYLISTS_MOCK.map(pl => (
                                <div key={pl.id} className="group cursor-pointer">
                                    <div className={`aspect-square rounded-3xl bg-gradient-to-br ${pl.gradient} p-8 flex flex-col items-center justify-center relative overflow-hidden transition-all group-hover:scale-[1.02] shadow-2xl`}>
                                        {/* Iniciais grandes com opacidade no fundo */}
                                        <span className="text-6xl font-black text-white/30 absolute tracking-tighter">{pl.initials}</span>
                                        {/* Ícone de nota no canto */}
                                        <div className="absolute bottom-4 right-4 text-white/50">
                                            <Music size={20} />
                                        </div>
                                    </div>
                                    <div className="mt-4 px-1">
                                        <h4 className="text-base font-black text-white uppercase tracking-tight">{pl.name}</h4>
                                        <p className="text-[10px] text-lomuz-muted font-bold uppercase tracking-widest mt-1">{pl.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Ícone auxiliar ausente no lucide básico v0.344 às vezes
const ChevronDown = ({ size, className }: any) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="m6 9 6 6 6-6"/>
    </svg>
);

export default MediaLibraryPage;
