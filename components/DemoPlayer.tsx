
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, X, Volume2, Volume1, VolumeX, Music, AlertCircle, Headphones } from 'lucide-react';
import { Button } from './ui';

const DEMO_AUDIO_PATH = '/demo/sweet-life-luxury-chill-438146.mp3';
// Fallback URL para visualização imediata caso o arquivo local não exista (Royalty Free)
const FALLBACK_AUDIO_URL = 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3';

const DemoPlayer: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isPreviewEnded, setIsPreviewEnded] = useState(false);
  const [audioSrc, setAudioSrc] = useState(DEMO_AUDIO_PATH);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Fecha modal com ESC ou clique fora
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) handleClose();
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Controle de Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Monitoramento de Tempo (Limite 30s)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const current = audio.currentTime;
      const duration = 30; // Limite fixo de 30s para o demo
      
      setCurrentTime(current);
      setProgress((current / duration) * 100);

      if (current >= 30) {
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
        setIsPreviewEnded(true);
        setProgress(0);
      }
    };

    const handleEnded = () => {
        setIsPlaying(false);
        setProgress(0);
    };

    const handleError = () => {
        console.warn("Demo Player: Arquivo local não encontrado. Tentando fallback ou ocultando.");
        if (audioSrc === DEMO_AUDIO_PATH) {
            // Tenta fallback uma vez
            setAudioSrc(FALLBACK_AUDIO_URL);
        } else {
            // Se falhar o fallback, oculta o componente
            setIsVisible(false);
        }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [isOpen, audioSrc]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPreviewEnded) {
        setIsPreviewEnded(false);
        audioRef.current.currentTime = 0;
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Play failed:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsOpen(false);
    setIsPreviewEnded(false);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <>
      {/* TRIGGER SECTION */}
      <div className="mt-12 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-lomuz-surface/50 border border-lomuz-border rounded-2xl p-1 pr-2 flex items-center gap-4 hover:border-lomuz-gold/30 transition-colors shadow-sm group">
            <div className="w-10 h-10 rounded-xl bg-lomuz-bg flex items-center justify-center text-lomuz-gold border border-lomuz-border group-hover:scale-105 transition-transform">
                <Headphones size={20} />
            </div>
            <div className="flex flex-col text-left mr-2">
                <span className="text-xs font-bold text-lomuz-text">Ouça um demo (30s)</span>
                <span className="text-[10px] text-lomuz-muted">Preview do padrão sonoro.</span>
            </div>
            <Button 
                size="sm" 
                variant="ghost" 
                className="bg-lomuz-bg hover:bg-lomuz-gold text-lomuz-gold hover:text-black border border-lomuz-gold/20 font-bold text-xs h-8 px-4 rounded-lg transition-all"
                onClick={() => setIsOpen(true)}
            >
                Play Demo
            </Button>
        </div>
      </div>

      {/* MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div 
                ref={modalRef}
                className="bg-lomuz-surface border border-lomuz-border w-full max-w-sm rounded-3xl shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300"
            >
                {/* Background Art Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-lomuz-imperial/10 to-transparent pointer-events-none"></div>
                
                {/* Header */}
                <div className="p-6 pb-2 flex justify-between items-start relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lomuz-gold to-yellow-600 flex items-center justify-center text-black shadow-lg shadow-lomuz-gold/20">
                            <Music size={24} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-lomuz-text leading-tight">Sweet Life (Luxury Chill)</h3>
                            <p className="text-[10px] text-lomuz-gold font-bold uppercase tracking-wider mt-0.5">Demo Preview</p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="text-lomuz-muted hover:text-lomuz-text transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Player Controls */}
                <div className="p-6 pt-4 relative z-10 space-y-6">
                    {/* Audio Element */}
                    <audio 
                        ref={audioRef} 
                        src={audioSrc} 
                        preload="metadata"
                    />

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="h-1.5 bg-lomuz-bg rounded-full overflow-hidden border border-lomuz-border">
                            <div 
                                className="h-full bg-lomuz-gold transition-all duration-100 ease-linear" 
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-[10px] font-mono font-medium text-lomuz-muted">
                            <span>{formatTime(currentTime)}</span>
                            <span>0:30</span>
                        </div>
                    </div>

                    {/* Main Actions */}
                    <div className="flex items-center justify-between">
                        {/* Volume */}
                        <div className="flex items-center gap-2 group">
                            <button 
                                onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
                                className="text-lomuz-muted hover:text-lomuz-text transition-colors"
                            >
                                {volume === 0 ? <VolumeX size={18} /> : volume < 0.5 ? <Volume1 size={18} /> : <Volume2 size={18} />}
                            </button>
                            <input 
                                type="range" 
                                min="0" max="1" step="0.1" 
                                value={volume} 
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="w-16 h-1 bg-lomuz-bg rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-lomuz-text [&::-webkit-slider-thumb]:rounded-full opacity-50 group-hover:opacity-100 transition-opacity"
                            />
                        </div>

                        {/* Play Button */}
                        <button 
                            onClick={togglePlay}
                            className="w-14 h-14 rounded-full bg-lomuz-text text-lomuz-bg flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
                        >
                            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                        </button>

                        <div className="w-20"></div> {/* Spacer for balance */}
                    </div>

                    {/* Message Area */}
                    <div className="h-6 flex items-center justify-center">
                        {isPreviewEnded ? (
                            <p className="text-xs text-lomuz-gold animate-pulse font-medium">Preview encerrado. Crie sua conta.</p>
                        ) : (
                            <p className="text-[10px] text-lomuz-subtle">Áudio demonstrativo de alta fidelidade.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default DemoPlayer;
