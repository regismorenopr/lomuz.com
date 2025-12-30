import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import { 
    Play, Pause, SkipForward, SkipBack, Music, Settings, Globe, 
    Zap, Headphones, ChevronUp, Radio, Volume2, ShieldCheck, Download,
    Monitor, Clock, Thermometer, Sliders, ListMusic, Sparkles, X, ChevronRight,
    VolumeX, Volume1, Info, Check, Lock, Unlock, AlertCircle,
    Activity, RefreshCw, Mic2, Maximize2, Minimize2, LayoutGrid,
    Database, Gauge, History, Search, Link2, Share2, Eye, EyeOff
} from 'lucide-react';
import { Button, Badge } from '../../components/ui';
import VolumeMonitor from '../../components/VolumeMonitor';
import SoundWaveGlow from '../../components/SoundWaveGlow';
import PlayerEngine from '../../services/playerEngine';
import { api } from '../../services/api';
import { ApiService } from '../../services/mockApi';
import { DSPConfig } from '../../types';
import { useTranslation } from '../../contexts/I18nContext';

// --- COMPONENTES ISOLADOS (Prevenção de Re-renders) ---

const AmbientClock = memo(() => {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 30000);
        return () => clearInterval(timer);
    }, []);
    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5 backdrop-blur-md">
            <Clock size={12} className="text-lomuz-imperial" />
            <span className="text-[11px] font-black font-mono text-white/80">
                {new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(time)}
            </span>
        </div>
    );
});

const AmbientWeather = memo(() => {
    const [weather, setWeather] = useState<{ temp: number } | null>(null);
    useEffect(() => {
        ApiService.getWeather('São Paulo').then(setWeather).catch(() => setWeather(null));
    }, []);
    return (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5 backdrop-blur-md">
            <Thermometer size={12} className="text-accent" />
            <span className="text-[11px] font-black font-mono text-white/80">
                {weather ? `${weather.temp}°C` : '--°C'}
            </span>
        </div>
    );
});

// --- COMPONENTE PRINCIPAL ---

const PlayerPage: React.FC<{ streamId?: string | null, onLogout?: () => void }> = ({ streamId, onLogout }) => {
    const { t, language, setLanguage } = useTranslation();
    
    // States Locais de UI
    const [viewMode, setViewMode] = useState<'FOCUS' | 'STUDIO'>('FOCUS');
    const [isCampaignsOpen, setIsCampaignsOpen] = useState(false);
    const [isQueueOpen, setIsQueueOpen] = useState(false);
    const [isVolumeOpen, setIsVolumeOpen] = useState(false);
    const [showVisualEffects, setShowVisualEffects] = useState(true);

    // States de Player (Funcionalidade)
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<any>(null);
    const [status, setStatus] = useState<'SYNCED' | 'OFFLINE' | 'FETCHING' | 'ERROR'>('SYNCED');
    const [streamingData, setStreamingData] = useState<any>(null);
    
    // Configurações de Campanha
    const [dsp, setDsp] = useState<DSPConfig>({
        masterVolume: 85, musicGain: 80, spokenGain: 100, bitrate: 32,
        normalizationEnabled: true, compressionEnabled: true, fadesEnabled: true,
        mixing: { m2m: 1.5, s2m: 1.0, m2s: 1.0, s2s: 0.5 }
    });

    const engine = useRef(PlayerEngine.getInstance());

    // CARREGAMENTO DE DADOS DO STREAMING VIA ID
    useEffect(() => {
        const loadStreaming = async () => {
            if (!streamId) return;
            setStatus('FETCHING');
            try {
                // Chama API especificada
                const data = await api.radios.getStreamById(streamId);
                setStreamingData(data);
                
                // Configura engine de reprodução com o HLS URL retornado
                await engine.current.sync({ 
                    stream_id: data.id, 
                    queue: [{ 
                        media_id: data.id, 
                        title: data.name, 
                        src: data.hls_url, // Usando hls_url para tocar o áudio conforme regra
                        type: 'LIVE' 
                    }] 
                });
                
                setStatus('SYNCED');
            } catch (e) {
                console.error(e);
                setStatus('ERROR');
            }
        };

        loadStreaming();
    }, [streamId]);

    const toggleViewMode = () => setViewMode(v => v === 'FOCUS' ? 'STUDIO' : 'FOCUS');

    return (
        <div className="h-screen w-screen bg-[#020617] text-white flex flex-col font-sans relative overflow-hidden select-none">
            
            {/* AMBIENT BACKGROUND */}
            <div className="absolute inset-0 bg-depth-gradient opacity-90 z-0" />
            
            {/* EFEITO VISUAL: SOUND WAVE GLOW */}
            {showVisualEffects && (
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <SoundWaveGlow isPlaying={isPlaying} intensity={0.6} />
                </div>
            )}

            <div className={`absolute -top-40 -left-40 w-[800px] h-[800px] bg-lomuz-imperial/10 blur-[150px] rounded-full transition-opacity duration-1000 ${isPlaying ? 'opacity-100' : 'opacity-40'}`} />
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-lomuz-imperial/20 to-transparent" />

            {/* TOP BAR - AMBIENT INFO */}
            <header className="h-16 px-8 flex items-center justify-between relative z-50 bg-black/10 backdrop-blur-2xl border-b border-white/5">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={toggleViewMode}>
                        <div className="w-8 h-8 bg-premium-gradient rounded-lg flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                            <span className="text-white font-black text-sm tracking-tighter">L</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black tracking-tighter text-sm uppercase leading-none">LOM<span className="text-accent">U</span>Z</span>
                            <span className="text-[7px] font-black text-white/20 uppercase tracking-[0.2em]">{t('Broadcast Player')}</span>
                        </div>
                    </div>
                    <div className="h-4 w-px bg-white/10" />
                    <div className="flex items-center gap-2">
                        <AmbientClock />
                        <AmbientWeather />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        onClick={toggleViewMode}
                        className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                    >
                        {viewMode === 'FOCUS' ? <Maximize2 size={12} className="group-hover:text-lomuz-imperial transition-colors" /> : <Minimize2 size={12} className="group-hover:text-lomuz-imperial transition-colors" />}
                        <span className="text-[9px] font-black uppercase tracking-widest">{viewMode === 'FOCUS' ? t('Modo Studio') : t('Modo Foco')}</span>
                    </button>
                    
                    <div className="h-8 w-px bg-white/10 mx-1" />
                    
                    <button onClick={onLogout} className="text-[10px] font-black text-white/20 hover:text-rose-500 transition-colors uppercase tracking-widest">{t('Sair')}</button>
                </div>
            </header>

            {/* MAIN STAGE */}
            <main className="flex-1 relative z-10 flex overflow-hidden">
                
                {/* STUDIO SIDEBAR */}
                <aside className={`bg-black/20 backdrop-blur-3xl border-r border-white/5 transition-all duration-700 ease-in-out flex flex-col ${viewMode === 'STUDIO' ? 'w-80' : 'w-0 opacity-0'}`}>
                    <div className="p-6 border-b border-white/5 flex justify-between items-center whitespace-nowrap">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/40">{t('Fila de Reprodução')}</h3>
                        <ListMusic size={14} className="text-lomuz-imperial" />
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                        <div className="p-4 bg-white/10 border border-lomuz-imperial/30 rounded-2xl flex items-center gap-3 group">
                            <div className="w-8 h-8 rounded-lg bg-lomuz-imperial flex items-center justify-center text-white">
                                <Radio size={14} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold truncate">{streamingData?.name || "Streaming Ao Vivo"}</p>
                                <p className="text-[9px] text-lomuz-imperial uppercase font-black">HLS Feed Ativo</p>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* NOW PLAYING CORE */}
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center relative">
                    
                    <div className={`transition-all duration-1000 ${isPlaying ? 'scale-100' : 'scale-95 opacity-60'}`}>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-lomuz-imperial/10 border border-lomuz-imperial/20 rounded-full mb-8">
                            <div className={`w-1.5 h-1.5 bg-lomuz-imperial rounded-full shadow-glow ${isPlaying ? 'animate-pulse' : ''}`} />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-lomuz-imperial">
                                {status === 'FETCHING' ? "CARREGANDO..." : streamingData?.status === 'online' ? "AO VIVO" : "OFFLINE"}
                            </span>
                        </div>
                        
                        <h1 className={`font-black tracking-tighter uppercase leading-[0.85] transition-all duration-1000 ${viewMode === 'FOCUS' ? 'text-7xl md:text-9xl' : 'text-5xl md:text-7xl'}`}>
                            {streamingData?.name || t('Sincronizando...')}
                        </h1>
                        <p className="text-xl md:text-3xl font-bold text-white/20 tracking-tight mt-6 flex items-center justify-center gap-3">
                            <Headphones size={24} className="opacity-20" />
                            {status === 'ERROR' ? "ID INVÁLIDO OU ERRO DE REDE" : "Lomuz Smart Network"}
                        </p>
                    </div>

                    {/* Main Interaction Area */}
                    <div className="mt-16 flex items-center gap-12 md:gap-24 relative z-20">
                        <button className="text-white/10 hover:text-white transition-all transform active:scale-90"><SkipBack size={32} /></button>
                        
                        <div className="relative group">
                            <div className={`absolute inset-0 bg-lomuz-imperial/20 blur-3xl rounded-full transition-all duration-1000 ${isPlaying ? 'scale-125 opacity-100' : 'scale-75 opacity-0'}`} />
                            <button 
                                onClick={() => setIsPlaying(!isPlaying)}
                                disabled={status !== 'SYNCED'}
                                className="relative w-28 h-28 md:w-36 md:h-36 bg-premium-gradient rounded-full flex items-center justify-center shadow-huge transition-all hover:scale-105 active:scale-95 z-10 border-4 border-white/10 disabled:opacity-30"
                                aria-label={isPlaying ? 'Pause' : 'Play'}
                            >
                                {status === 'FETCHING' ? <RefreshCw size={48} className="animate-spin text-white/50" /> : isPlaying ? <Pause size={56} fill="white" /> : <Play size={56} fill="white" className="ml-2" />}
                            </button>
                        </div>

                        <button className="text-white/10 hover:text-white transition-all transform active:scale-90"><SkipForward size={32} /></button>
                    </div>

                    {/* Focus Mode Indicator */}
                    {viewMode === 'FOCUS' && (
                        <div className="mt-16 w-full max-w-sm bg-white/[0.02] rounded-3xl p-5 flex items-center justify-between border border-white/5 animate-in fade-in slide-in-from-bottom-2 duration-1000">
                             <div className="flex items-center gap-4">
                                <div className="p-2 bg-white/5 rounded-xl text-white/30"><Headphones size={16}/></div>
                                <div className="text-left">
                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">URL DE SINAL</p>
                                    <p className="text-xs font-bold text-white/50 truncate max-w-[180px]">{streamingData?.hls_url || "Aguardando sinal..."}</p>
                                </div>
                             </div>
                             <ChevronRight size={14} className="text-white/10" />
                        </div>
                    )}
                </div>

                {/* STUDIO ANALYTICS */}
                <aside className={`bg-black/20 backdrop-blur-3xl border-l border-white/5 transition-all duration-700 ease-in-out overflow-hidden flex flex-col ${viewMode === 'STUDIO' ? 'w-96' : 'w-0 opacity-0'}`}>
                    <div className="p-8 space-y-10 whitespace-nowrap">
                        <section className="space-y-4">
                             <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
                                <Activity size={12} className="text-lomuz-imperial"/> {t('Processamento em Tempo Real')}
                             </h3>
                             <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[32px] space-y-6">
                                <VolumeMonitor isPlaying={isPlaying} barCount={32} className="h-24 w-full" />
                                <div className="flex justify-between items-center text-[9px] font-black text-white/40 uppercase font-mono">
                                    <span className="flex items-center gap-1.5"><div className="w-1 h-1 bg-green-500 rounded-full" /> Peak: -0.1dB</span>
                                    <span className="text-lomuz-imperial">DSP: Active</span>
                                </div>
                             </div>
                        </section>

                        <section className="space-y-4">
                             <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
                                <ShieldCheck size={12}/> {t('Integridade do Sinal')}
                             </h3>
                             <div className="grid grid-cols-2 gap-3">
                                <StatusTile label="Sync Health" value="100%" icon={Database} />
                                <StatusTile label="Latency" value="24ms" icon={Gauge} />
                                <StatusTile label="Stream ID" value={streamId || "N/A"} icon={Lock} />
                                <StatusTile label="Bitrate" value="128k" icon={Zap} />
                             </div>
                        </section>
                    </div>
                </aside>
            </main>

            {/* SMART DOCK */}
            <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-10 duration-1000 delay-300">
                <div className="bg-[#0D0D16]/80 backdrop-blur-2xl border border-white/10 p-1.5 rounded-full shadow-huge flex items-center gap-1">
                    <DockButton icon={<Sliders size={18}/>} label={t('Ajustes')} onClick={() => setIsCampaignsOpen(true)} active={isCampaignsOpen} />
                    <div className="w-px h-6 bg-white/5 mx-1" />
                    <div className="relative">
                        <DockButton icon={isVolumeOpen ? <VolumeX size={18}/> : <Volume2 size={18}/>} label={t('Volume')} onClick={() => setIsVolumeOpen(!isVolumeOpen)} active={isVolumeOpen} />
                        {isVolumeOpen && (
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 p-4 bg-[#0D0D16]/95 border border-white/10 rounded-2xl shadow-huge animate-in fade-in slide-in-from-bottom-2">
                                <input type="range" className="h-32 w-1.5 accent-lomuz-imperial bg-black/40 rounded-full appearance-none cursor-pointer [writing-mode:vertical-lr] [direction:rtl]" value={dsp.masterVolume} onChange={e => setDsp({...dsp, masterVolume: parseInt(e.target.value)})} />
                            </div>
                        )}
                    </div>
                    <div className="w-px h-6 bg-white/5 mx-1" />
                    <DockButton icon={<Globe size={18}/>} label={language.toUpperCase()} onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')} />
                </div>
            </nav>

            {/* DRAWERS */}
            <aside className={`fixed inset-y-0 right-0 z-[110] w-full max-w-md bg-[#0D0D16] border-l border-white/10 shadow-huge transition-transform duration-500 ease-out flex flex-col ${isCampaignsOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/20">
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-lomuz-imperial/10 rounded-2xl text-lomuz-imperial shadow-glow"><Sparkles size={24} /></div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">{t('Ajustes')}</h2>
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">{t('Controle de Áudio')}</p>
                        </div>
                    </div>
                    <button onClick={() => setIsCampaignsOpen(false)} className="p-3 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all"><X size={28} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                    <section className="space-y-4">
                        <h3 className="text-[11px] font-black text-white/40 uppercase tracking-[0.3em] flex items-center gap-2">
                           <Eye size={14} className="text-lomuz-imperial" /> Estética
                        </h3>
                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                            <div><h4 className="text-xs font-black text-white uppercase">Ondas Sonoras</h4><p className="text-[9px] text-white/30 uppercase mt-1">Efeitos visuais ambientais.</p></div>
                            <button onClick={() => setShowVisualEffects(!showVisualEffects)} className={`w-11 h-6 rounded-full relative transition-all ${showVisualEffects ? 'bg-lomuz-imperial shadow-glow' : 'bg-white/10'}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${showVisualEffects ? 'left-6' : 'left-1'}`} /></button>
                        </div>
                    </section>
                </div>
            </aside>

            {/* Bottom Footer */}
            <footer className="h-10 px-8 bg-black/40 border-t border-white/5 flex items-center justify-between text-[9px] font-black uppercase tracking-[0.4em] text-white/20 relative z-50">
                <div className="flex gap-8">
                   <span className="flex items-center gap-2 opacity-50"><ShieldCheck size={10}/> SECURE STREAM ID: {streamId || "N/A"}</span>
                   <span className="hidden md:flex items-center gap-2 opacity-50"><Monitor size={10}/> {t('REPRODUÇÃO HLS')}</span>
                </div>
                <span className="text-lomuz-imperial font-black tracking-[0.6em] animate-pulse">LOMUZ BROADCAST SYSTEM</span>
            </footer>
        </div>
    );
};

// --- HELPER UI COMPONENTS ---

const DockButton = ({ icon, label, onClick, active }: any) => (
    <button onClick={onClick} className={`flex items-center gap-3 px-6 py-3 rounded-full transition-all group ${active ? 'bg-lomuz-imperial text-white shadow-glow' : 'hover:bg-white/5 text-white/40 hover:text-white'}`}><span className="transition-transform group-active:scale-90">{icon}</span><span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">{label}</span></button>
);

const StatusTile = ({ label, value, icon: Icon }: any) => (
    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex flex-col gap-2 group hover:border-lomuz-imperial/30 transition-colors"><Icon size={12} className="text-white/20" /><div><p className="text-[8px] font-black text-white/20 uppercase tracking-widest">{label}</p><p className="text-xs font-black text-white font-mono">{value}</p></div></div>
);

export default PlayerPage;