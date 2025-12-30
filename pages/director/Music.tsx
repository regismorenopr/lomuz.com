
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { 
  Plus, RefreshCw, Music, Disc, Play, Clock, UploadCloud, CheckCircle2, 
  Loader2, Tags, Trash2, X, Search, Pause, Ban, Edit2, 
  ArrowLeft, ArrowRight, User, MoreHorizontal, ListPlus, Check, AlertCircle, Filter,
  List as ListIcon, Calendar, FileAudio, CheckCircle, XCircle, Minimize2, Maximize2, AlertTriangle, Speaker
} from 'lucide-react';
import { ApiService } from '../../services/mockApi';
import { Media, Playlist, Genre } from '../../types';
import { Button, PageHeader } from '../../components/ui';
import { useTranslation } from '../../contexts/I18nContext';

// --- CONSTANTS ---
const ITEMS_PER_PAGE = 150;
const GENRE_COLORS = [
    '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#10B981', 
    '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#D946EF', '#F43F5E', '#14B8A6'
];

// --- TYPES ---
type QuickFilterType = 'ALL' | 'NO_GENRE' | 'NO_PLAYLIST' | 'BLOCKED' | 'RECENT';

interface UploadTask {
    id: string;
    file: File;
    progress: number;
    status: 'PENDING' | 'UPLOADING' | 'CONVERTING' | 'COMPLETED' | 'ERROR';
    duration?: number;
    error?: string;
}

// --- HELPER FUNCTIONS ---

const getGenreColor = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    const index = Math.abs(hash % GENRE_COLORS.length);
    return GENRE_COLORS[index];
};

const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
};

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
        const objectUrl = URL.createObjectURL(file);
        const audio = new Audio(objectUrl);
        audio.onloadedmetadata = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(audio.duration);
        };
        audio.onerror = () => resolve(0);
    });
};

// --- HELPER COMPONENTS ---

/**
 * Delete Popover Component (Fully Localized)
 */
const DeletePopover = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    count 
}: { 
    isOpen: boolean, 
    onClose: () => void, 
    onConfirm: () => void, 
    count: number 
}) => {
    const { t } = useTranslation();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-[#151326] border border-rose-500/30 rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-500">
                        <Trash2 size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-white">{t('common.deleteConfirmTitle')}</h3>
                </div>
                <p className="text-sm text-slate-300 mb-6">
                    {t('common.deleteConfirmMsg', { count })}
                    <br/>
                    <span className="text-xs text-slate-500 mt-1 block">{t('common.deleteUndoWarning')}</span>
                </p>
                <div className="flex justify-end gap-3">
                    <Button variant="ghost" size="sm" onClick={onClose}>
                        {t('common.cancel')}
                    </Button>
                    <Button variant="danger" size="sm" onClick={onConfirm}>
                        {t('common.delete')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

/**
 * Upload Drawer - Floating Overlay for Batch Uploads
 */
const UploadDrawer = ({ 
    isOpen, 
    onClose, 
    onUploadComplete,
    allGenres
}: { 
    isOpen: boolean, 
    onClose: () => void, 
    onUploadComplete: (newMedia: Media) => void,
    allGenres: Genre[]
}) => {
    const { t } = useTranslation();
    const [queue, setQueue] = useState<UploadTask[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const CONCURRENCY_LIMIT = 3;
    
    // Upload State
    const [selectedGenreIds, setSelectedGenreIds] = useState<string[]>([]);
    const [genreSearch, setGenreSearch] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Queue Processor
    useEffect(() => {
        if (!isOpen || !isProcessing) return;

        const processQueue = async () => {
            const active = queue.filter(t => t.status === 'UPLOADING' || t.status === 'CONVERTING').length;
            const pending = queue.find(t => t.status === 'PENDING');

            if (active < CONCURRENCY_LIMIT && pending) {
                await startUpload(pending.id, selectedGenreIds);
            }
        };

        const interval = setInterval(processQueue, 500);
        return () => clearInterval(interval);
    }, [queue, isOpen, isProcessing, selectedGenreIds]);

    const handleFiles = async (files: FileList | null) => {
        if (!files) return;
        
        const newTasks: UploadTask[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            // Filter: Only accept MP3 or FLAC
            if (!['audio/mpeg', 'audio/flac'].includes(file.type) && !file.name.match(/\.(mp3|flac)$/i)) {
                continue;
            }
            if (file.size > 200 * 1024 * 1024) continue; // > 200MB

            const duration = await getAudioDuration(file);
            newTasks.push({
                id: Math.random().toString(36).substr(2, 9),
                file,
                progress: 0,
                status: 'PENDING',
                duration
            });
        }
        setQueue(prev => [...prev, ...newTasks]);
    };

    const startUpload = async (taskId: string, genres: string[]) => {
        setQueue(prev => prev.map(t => t.id === taskId ? { ...t, status: 'UPLOADING' } : t));

        // Simulate Progress
        for (let i = 0; i <= 100; i += 10) {
            await new Promise(r => setTimeout(r, 100));
            setQueue(prev => prev.map(t => t.id === taskId ? { ...t, progress: i } : t));
        }

        setQueue(prev => prev.map(t => t.id === taskId ? { ...t, status: 'CONVERTING' } : t));
        await new Promise(r => setTimeout(r, 1500)); 

        try {
            const task = queue.find(t => t.id === taskId);
            if(task) {
                // Use uploadMedia instead of uploadSong
                const newMedia = await ApiService.uploadMedia(task.file, genres, task.duration, 'MUSIC');
                onUploadComplete(newMedia);
                setQueue(prev => prev.map(t => t.id === taskId ? { ...t, status: 'COMPLETED' } : t));
            }
        } catch (e) {
            setQueue(prev => prev.map(t => t.id === taskId ? { ...t, status: 'ERROR', error: 'Falha na conversão' } : t));
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (selectedGenreIds.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const filteredGenres = allGenres.filter(g => 
        g.name.toLowerCase().includes(genreSearch.toLowerCase()) && 
        !selectedGenreIds.includes(g.id)
    );

    if (!isOpen) return null;

    const canInteract = selectedGenreIds.length > 0;

    return (
        <div className="fixed top-20 right-4 w-[400px] bg-[#151326] border border-[#7C3AED]/30 rounded-2xl shadow-2xl z-50 flex flex-col max-h-[85vh] animate-in slide-in-from-right-4">
            {/* Header */}
            <div className="p-4 border-b border-[#F9FAFB]/10 flex justify-between items-center bg-[#05030B]/50 rounded-t-2xl">
                <div>
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                        <UploadCloud size={16} className="text-[#22D3EE]" /> 
                        {t('upload.title')}
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setQueue([]); setIsProcessing(false); }} className="text-[10px] uppercase font-bold text-[#F9FAFB]/40 hover:text-white" title={t('upload.clear')}>
                        {t('common.clear')}
                    </button>
                    <button onClick={onClose} className="p-1 hover:bg-[#F9FAFB]/10 rounded text-[#F9FAFB]/50 hover:text-white"><X size={16} /></button>
                </div>
            </div>

            {/* MANDATORY GENRE SELECTOR */}
            <div className="p-4 bg-[#F9FAFB]/5 border-b border-[#F9FAFB]/10">
                <label className="text-[10px] font-bold uppercase text-[#F9FAFB]/50 mb-2 block flex items-center gap-1">
                    <Tags size={10} /> {t('upload.mandatoryGenre')} <span className="text-rose-500">*</span>
                </label>
                
                <div className="flex flex-wrap gap-1.5 mb-2">
                    {selectedGenreIds.map(gid => {
                        const g = allGenres.find(gx => gx.id === gid);
                        return (
                            <span key={gid} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#7C3AED]/20 border border-[#7C3AED]/30 text-[#7C3AED] text-xs font-bold">
                                {g?.name}
                                <button onClick={() => setSelectedGenreIds(prev => prev.filter(x => x !== gid))}><X size={10} className="hover:text-white" /></button>
                            </span>
                        );
                    })}
                </div>

                <div className="relative group">
                    <input 
                        className="w-full bg-[#05030B] border border-[#F9FAFB]/10 rounded-lg py-1.5 px-3 text-xs text-white focus:border-[#7C3AED] outline-none"
                        placeholder={t('upload.genrePlaceholder')}
                        value={genreSearch}
                        onChange={e => setGenreSearch(e.target.value)}
                    />
                    {genreSearch && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-[#151326] border border-[#F9FAFB]/10 rounded-lg shadow-xl z-20 max-h-32 overflow-y-auto">
                            {filteredGenres.map(g => (
                                <button
                                    key={g.id}
                                    onClick={() => { setSelectedGenreIds(prev => [...prev, g.id]); setGenreSearch(''); }}
                                    className="w-full text-left px-3 py-2 text-xs text-[#F9FAFB]/70 hover:bg-[#F9FAFB]/10 hover:text-white block"
                                >
                                    {g.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                {!canInteract && <p className="text-[10px] text-rose-400 mt-2 flex items-center gap-1"><AlertTriangle size={10} /> {t('upload.genreRequired')}</p>}
            </div>

            {/* Drop Zone */}
            <div 
                className={`p-6 border-b border-[#F9FAFB]/10 transition-colors cursor-pointer text-center relative ${isDragging ? 'bg-[#22D3EE]/10 border-[#22D3EE]' : 'hover:bg-[#F9FAFB]/5'} ${!canInteract ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                onDragOver={(e) => { 
                    e.preventDefault(); 
                    if (canInteract) setIsDragging(true); 
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => canInteract && fileInputRef.current?.click()}
            >
                <input ref={fileInputRef} type="file" multiple accept=".mp3,.flac" className="hidden" onChange={(e) => handleFiles(e.target.files)} disabled={!canInteract} />
                <div className="flex flex-col items-center gap-2 text-[#F9FAFB]/40">
                    <Plus size={24} className={isDragging ? 'text-[#22D3EE]' : ''} />
                    <span className="text-xs font-medium">{t('upload.dragDrop')}</span>
                    <span className="text-[10px] text-[#F9FAFB]/30 font-bold uppercase mt-1">Os arquivos devem ser enviados em MP3 ou FLAC.</span>
                </div>
                
                {!canInteract && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px]">
                         <LockIcon />
                    </div>
                )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar min-h-[200px]">
                {queue.map(task => (
                    <div key={task.id} className="bg-[#F9FAFB]/5 rounded-lg p-2.5 flex items-center gap-3 relative overflow-hidden group">
                        {(task.status === 'UPLOADING' || task.status === 'CONVERTING') && (
                            <div className="absolute bottom-0 left-0 h-[2px] bg-[#22D3EE] transition-all duration-300" style={{ width: `${task.progress}%` }}></div>
                        )}
                        <div className="p-2 rounded bg-[#05030B] text-[#F9FAFB]/50 shrink-0"><FileAudio size={16} /></div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-0.5">
                                <span className="text-xs font-bold text-[#F9FAFB] truncate max-w-[180px]" title={task.file.name}>{task.file.name}</span>
                                <span className="text-[9px] text-[#F9FAFB]/30 font-mono">{formatFileSize(task.file.size)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-medium uppercase tracking-wider flex items-center gap-1">
                                    {task.status === 'PENDING' && <span className="text-[#F9FAFB]/30">{t('upload.status.pending')}</span>}
                                    {task.status === 'UPLOADING' && <span className="text-[#22D3EE]">{t('upload.status.uploading', { percent: task.progress })}</span>}
                                    {task.status === 'CONVERTING' && <span className="text-[#7C3AED] animate-pulse">{t('upload.status.converting')}</span>}
                                    {task.status === 'COMPLETED' && <span className="text-[#009B4D]">{t('upload.status.completed')}</span>}
                                    {task.status === 'ERROR' && <span className="text-rose-500">{t('upload.status.error')}</span>}
                                </span>
                            </div>
                        </div>
                        <div className="shrink-0">
                            {task.status === 'COMPLETED' ? <CheckCircle size={16} className="text-[#009B4D]" /> : 
                             task.status === 'ERROR' ? <AlertCircle size={16} className="text-rose-500" /> : 
                             <button onClick={() => setQueue(prev => prev.filter(p => p.id !== task.id))} className="opacity-0 group-hover:opacity-100 text-[#F9FAFB]/30 hover:text-white"><X size={14} /></button>}
                        </div>
                    </div>
                ))}
                {queue.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-[#F9FAFB]/20 py-10">
                        <ListIcon size={32} className="mb-2" />
                        <span className="text-xs">{t('upload.emptyQueue')}</span>
                    </div>
                )}
            </div>

            {/* Bottom Action */}
            <div className="p-4 border-t border-[#F9FAFB]/10 bg-[#05030B]/80 rounded-b-2xl">
                <Button 
                    className="w-full text-xs font-bold"
                    size="md"
                    disabled={!canInteract || queue.filter(t => t.status === 'PENDING').length === 0 || isProcessing}
                    onClick={() => setIsProcessing(true)}
                    isLoading={isProcessing}
                >
                    {isProcessing ? t('upload.processing') : t('upload.startUpload', { count: queue.filter(t => t.status === 'PENDING').length })}
                </Button>
            </div>
        </div>
    );
};

const LockIcon = () => (
    <div className="w-8 h-8 rounded-full bg-[#151326] flex items-center justify-center border border-[#F9FAFB]/10 shadow-xl">
        <div className="w-2.5 h-3 border-2 border-[#F9FAFB]/40 rounded-t-sm mb-1"></div>
        <div className="w-4 h-3 bg-[#F9FAFB]/40 rounded-sm -mt-2"></div>
    </div>
);

/**
 * Compact Chip Renderer
 */
const RenderCompactChips = ({ 
    items, 
    color, 
    emptyLabel = '--',
    maxItems = 2,
    useDynamicColor = false
}: { 
    items: { id: string, name: string }[], 
    color?: string,
    emptyLabel?: string,
    maxItems?: number,
    useDynamicColor?: boolean
}) => {
    const { t } = useTranslation();
    
    if (!items || items.length === 0) {
        return <span className="text-[10px] text-[#F9FAFB]/20 italic select-none">{t(emptyLabel)}</span>;
    }

    const visibleItems = items.slice(0, maxItems);
    const remainder = items.length - maxItems;
    const fullListString = items.map(i => i.name).join(', ');

    return (
        <div className="flex items-center gap-1 overflow-hidden h-full" title={fullListString}>
            {visibleItems.map(item => {
                const itemColor = useDynamicColor ? getGenreColor(item.id) : null;
                const style = itemColor 
                    ? { 
                        borderColor: `${itemColor}40`, 
                        color: itemColor,
                        backgroundColor: `${itemColor}10` 
                      }
                    : {};
                
                return (
                    <span 
                        key={item.id} 
                        className={`inline-flex items-center max-w-[80px] truncate px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold border ${!itemColor ? (color || 'border-white/5 bg-[#F9FAFB]/10') : ''}`}
                        style={style}
                    >
                        {useDynamicColor && <span className="w-1 h-1 rounded-full mr-1 shrink-0" style={{ backgroundColor: itemColor! }}></span>}
                        <span className="truncate">{item.name}</span>
                    </span>
                );
            })}
            {remainder > 0 && (
                <span className={`px-1 py-0.5 rounded-[4px] text-[9px] font-bold border border-white/5 bg-[#F9FAFB]/5 text-[#F9FAFB]/50`}>
                    {t('media.chips.more', { count: remainder })}
                </span>
            )}
        </div>
    );
};

/**
 * Small Popover for Quick Selection
 */
const QuickSelector = ({ 
    title, 
    placeholder, 
    items, 
    selectedIds, 
    onToggle, 
    onCreate, 
    onClose,
    position 
}: { 
    title: string, 
    placeholder: string, 
    items: { id: string, name: string }[], 
    selectedIds: string[], 
    onToggle: (id: string) => void, 
    onCreate?: (name: string) => void,
    onClose: () => void,
    position: { top: number, left: number }
}) => {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (inputRef.current) inputRef.current.focus();
        
        const handleClickOutside = (e: MouseEvent) => {
            if (!(e.target as HTMLElement).closest('.quick-selector')) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const filteredItems = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
    const exactMatch = filteredItems.some(i => i.name.toLowerCase() === search.toLowerCase());

    let { top, left } = position;
    if (left > window.innerWidth - 220) left = window.innerWidth - 240;
    if (top > window.innerHeight - 300) top = top - 200; 

    return (
        <div 
            className="quick-selector fixed z-[9999] w-56 bg-[#151326] border border-[#7C3AED]/30 rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100"
            style={{ top, left }}
        >
            <div className="p-2 border-b border-[#F9FAFB]/10 bg-[#05030B]/80">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold uppercase text-[#F9FAFB]/50 tracking-wider">{title}</span>
                    <button onClick={onClose}><X size={10} className="text-[#F9FAFB]/30 hover:text-white" /></button>
                </div>
                <input 
                    ref={inputRef}
                    className="w-full bg-[#F9FAFB]/5 border border-[#F9FAFB]/10 rounded px-2 py-1 text-[10px] text-white focus:border-[#7C3AED] outline-none"
                    placeholder={placeholder}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && onCreate && search && !exactMatch) {
                            onCreate(search);
                            setSearch('');
                        }
                    }}
                />
            </div>
            <div className="flex-1 overflow-y-auto max-h-48 p-1 custom-scrollbar">
                {onCreate && search && !exactMatch && (
                    <button 
                        onClick={() => { onCreate(search); setSearch(''); }}
                        className="w-full text-left px-2 py-1.5 rounded hover:bg-[#7C3AED]/20 text-[#7C3AED] text-[10px] font-bold flex items-center gap-1.5 mb-1"
                    >
                        <Plus size={10} /> {t('media.actions.createGenre', { name: search })}
                    </button>
                )}
                {filteredItems.map(item => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                        <button
                            key={item.id}
                            onClick={() => onToggle(item.id)}
                            className={`w-full text-left px-2 py-1.5 rounded text-[10px] flex items-center justify-between group transition-colors ${isSelected ? 'bg-[#009B4D]/10 text-[#009B4D] font-bold' : 'text-[#F9FAFB]/70 hover:bg-[#F9FAFB]/5 hover:text-white'}`}
                        >
                            <span className="truncate">{item.name}</span>
                            {isSelected && <Check size={10} />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

const MusicPage: React.FC = () => {
  const { t, formatDate, localeCompare } = useTranslation();
  const [activeTab, setActiveTab] = useState<'tracks' | 'playlists' | 'genres'>('tracks');
  
  // Data
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [search, setSearch] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilterType>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeMediaId, setActiveMediaId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [showUploadDrawer, setShowUploadDrawer] = useState(false);
  
  // Delete State
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, ids: string[]}>({ isOpen: false, ids: [] });
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);

  // Popover State
  const [popover, setPopover] = useState<{ type: 'GENRE' | 'PLAYLIST', targetId: string, x: number, y: number } | null>(null);

  // Player State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playback, setPlayback] = useState<{ isPlaying: boolean, progress: number, currentTime: number }>({ isPlaying: false, progress: 0, currentTime: 0 });

  // --- DATA LOADING ---
  const loadData = async () => {
    setLoading(true);
    const [m, p, g] = await Promise.all([
      ApiService.getMedia(),
      ApiService.getPlaylists(),
      ApiService.getGenres()
    ]);
    
    // Sort A-Z by default using locale aware sort
    const sortedMedia = [...m].sort((a, b) => localeCompare(a.title, b.title));
    
    setMediaList(sortedMedia);
    setPlaylists(p);
    setGenres(g);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // --- HELPERS ---
  const getGenreNames = (ids: string[]) => genres.filter(g => ids.includes(g.id));
  const getPlaylistsForMedia = (mediaId: string) => playlists.filter(pl => pl.media?.some(s => s.id === mediaId) || false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 3000);
  };

  // --- PLAYER LOGIC ---
  const handlePlay = (media: Media) => {
      if (!audioRef.current) return;
      
      if (activeMediaId === media.id) {
          if (playback.isPlaying) {
              audioRef.current.pause();
              setPlayback(p => ({ ...p, isPlaying: false }));
          } else {
              audioRef.current.play();
              setPlayback(p => ({ ...p, isPlaying: true }));
          }
      } else {
          setActiveMediaId(media.id);
          audioRef.current.src = media.audioUrl;
          audioRef.current.load();
          audioRef.current.play().catch(e => console.log("Play failed", e));
          setPlayback({ isPlaying: true, progress: 0, currentTime: 0 });
      }
  };

  useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;
      const update = () => setPlayback(p => ({ 
          ...p, 
          progress: (audio.currentTime / audio.duration) * 100 || 0,
          currentTime: audio.currentTime
      }));
      const ended = () => setPlayback(prev => ({ ...prev, isPlaying: false, progress: 0, currentTime: 0 }));
      audio.addEventListener('timeupdate', update);
      audio.addEventListener('ended', ended);
      return () => {
          audio.removeEventListener('timeupdate', update);
          audio.removeEventListener('ended', ended);
      };
  }, []);

  // --- ACTIONS ---

  const handleUpdateMedia = async (id: string, updates: Partial<Media>) => {
      setMediaList(prev => {
          const updated = prev.map(s => s.id === id ? { ...s, ...updates } : s);
          return updated.sort((a, b) => localeCompare(a.title, b.title));
      });
      await ApiService.updateMedia(id, updates);
  };

  const toggleGenre = async (mediaId: string, genreId: string) => {
      const media = mediaList.find(s => s.id === mediaId);
      if (!media) return;
      const newIds = media.genreIds.includes(genreId) ? media.genreIds.filter(id => id !== genreId) : [...media.genreIds, genreId];
      handleUpdateMedia(mediaId, { genreIds: newIds });
  };

  const createAndAssignGenre = async (mediaId: string, name: string) => {
      const newGenre = await ApiService.addGenre({ name, active: true, description: 'Quick created' });
      setGenres(prev => [...prev, newGenre]);
      toggleGenre(mediaId, newGenre.id);
  };

  const togglePlaylist = async (mediaId: string, playlistId: string) => {
      const playlist = playlists.find(p => p.id === playlistId);
      if (!playlist) return;
      
      const media = mediaList.find(s => s.id === mediaId);
      if (!media) return;

      const currentMedia = playlist.media || [];
      const isPresent = currentMedia.some(s => s.id === mediaId);
      
      let newMedia: Media[];
      if (isPresent) {
          newMedia = currentMedia.filter(s => s.id !== mediaId);
      } else {
          newMedia = [...currentMedia, media];
      }
      
      const updates = { media: newMedia, mediaCount: newMedia.length };
      
      setPlaylists(prev => prev.map(p => p.id === playlistId ? { ...p, ...updates } : p));
      
      await ApiService.updatePlaylist(playlistId, updates);
  };

  const createAndAssignPlaylist = async (mediaId: string, name: string) => {
      const media = mediaList.find(s => s.id === mediaId);
      if (!media) return;

      const genreIds = media.genreIds.length > 0 ? media.genreIds : (genres.length > 0 ? [genres[0].id] : []);

      if (genreIds.length === 0) {
          showToast("Error: No genres available to link playlist", 'error'); 
          return;
      }

      const newPlaylist = await ApiService.addPlaylist({
          name,
          description: 'Quick created',
          mediaCount: 1,
          genreIds: genreIds,
          media: [media]
      });
      setPlaylists(prev => [...prev, newPlaylist]);
      showToast(t('media.toast.playlistCreated', {name}), 'success');
  };

  const requestDelete = (ids: string[]) => {
      setDeleteConfirm({ isOpen: true, ids });
  };

  const confirmDelete = async () => {
      const ids = deleteConfirm.ids;
      setDeleteConfirm({ isOpen: false, ids: [] });
      
      try {
          for (const id of ids) {
              await ApiService.deleteMedia(id);
          }
          // Remove from local state only after successful API call
          setMediaList(prev => prev.filter(s => !ids.includes(s.id)));
          setSelectedIds(new Set()); // Clear selection
          showToast(t('media.toast.deleted', { count: ids.length }), 'success');
      } catch (e: any) {
          console.error(e);
          // Show explicit error if blocked
          if (e.message && e.message.includes("schedules")) {
              showToast(t('media.toast.deleteBlocked'), 'error');
          } else {
              showToast(t('media.toast.deleteError'), 'error');
          }
      }
  };

  const handleUploadComplete = (newMedia: Media) => {
      // Add new media AND re-sort A-Z using localeCompare
      setMediaList(prev => [...prev, newMedia].sort((a, b) => localeCompare(a.title, b.title)));
  };

  // --- FILTERING ---
  const filteredMedia = useMemo(() => {
      return mediaList.filter(media => {
          const s = search.toLowerCase();
          const mediaPlaylists = getPlaylistsForMedia(media.id);
          const genreNames = getGenreNames(media.genreIds).map(g => g.name.toLowerCase()).join(' ');
          const plNames = mediaPlaylists.map(p => p.name.toLowerCase()).join(' ');

          const matchesText = 
              media.title.toLowerCase().includes(s) || 
              (media.artist && media.artist.toLowerCase().includes(s)) ||
              genreNames.includes(s) ||
              plNames.includes(s);
          
          if (!matchesText) return false;

          if (quickFilter === 'NO_GENRE') return media.genreIds.length === 0;
          if (quickFilter === 'NO_PLAYLIST') return mediaPlaylists.length === 0;
          if (quickFilter === 'BLOCKED') return media.blocks?.global;
          if (quickFilter === 'RECENT') {
              const oneWeekAgo = new Date();
              oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
              return new Date(media.uploadedAt || 0) > oneWeekAgo;
          }
          return true;
      });
  }, [mediaList, search, quickFilter, genres, playlists]);

  const paginatedMedia = filteredMedia.slice(0, page * ITEMS_PER_PAGE);

  // --- RENDER ---

  const openPopover = (e: React.MouseEvent, type: 'GENRE' | 'PLAYLIST', targetId: string) => {
      e.stopPropagation();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setPopover({ type, targetId, x: rect.left, y: rect.bottom + 5 });
  };

  return (
    <div className="flex h-[calc(100vh-100px)] flex-col relative bg-[#05030B]">
        <audio ref={audioRef} className="hidden" />

        {/* TOAST NOTIFICATION */}
        {toast && (
            <div className={`fixed bottom-6 right-6 z-[10000] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-right-10 fade-in duration-300 ${toast.type === 'success' ? 'bg-[#009B4D] text-white' : 'bg-rose-500 text-white'}`}>
                {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
                <span className="text-sm font-bold">{toast.msg}</span>
            </div>
        )}

        {/* UPLOAD DRAWER */}
        <UploadDrawer 
            isOpen={showUploadDrawer} 
            onClose={() => setShowUploadDrawer(false)}
            onUploadComplete={handleUploadComplete} 
            allGenres={genres}
        />

        {/* DELETE CONFIRMATION */}
        <DeletePopover 
            isOpen={deleteConfirm.isOpen}
            count={deleteConfirm.ids.length}
            onClose={() => setDeleteConfirm({ isOpen: false, ids: [] })}
            onConfirm={confirmDelete}
        />

        {/* 1. TOP HEADER & TABS (Fixed) */}
        <div className="shrink-0 mb-4 px-1">
            <PageHeader 
                title={t('media.title')} 
                description={t('media.subtitle')}
                actions={
                    <div className="flex bg-[#F9FAFB]/5 p-1 rounded-lg">
                        <button onClick={loadData} className="p-2 text-[#F9FAFB]/50 hover:text-[#F9FAFB]"><RefreshCw size={16} /></button>
                    </div>
                }
            />
            
            {/* TABS */}
            <div className="flex border-b border-[#F9FAFB]/10 gap-6">
                <button 
                    onClick={() => setActiveTab('tracks')} 
                    className={`pb-3 border-b-2 font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'tracks' ? 'border-[#7C3AED] text-[#7C3AED]' : 'border-transparent text-[#F9FAFB]/40 hover:text-[#F9FAFB]'}`}
                >
                    <Music size={16} /> {t('media.tabs.tracks')}
                </button>
                <button 
                    onClick={() => setActiveTab('playlists')} 
                    className={`pb-3 border-b-2 font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'playlists' ? 'border-[#FFCC00] text-[#FFCC00]' : 'border-transparent text-[#F9FAFB]/40 hover:text-[#F9FAFB]'}`}
                >
                    <ListIcon size={16} /> {t('media.tabs.playlists')}
                </button>
                <button 
                    onClick={() => setActiveTab('genres')} 
                    className={`pb-3 border-b-2 font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'genres' ? 'border-[#22D3EE] text-[#22D3EE]' : 'border-transparent text-[#F9FAFB]/40 hover:text-[#F9FAFB]'}`}
                >
                    <Tags size={16} /> {t('media.tabs.genres')}
                </button>
            </div>
        </div>

        {/* 2. TAB CONTENT */}
        <div className="flex-1 min-h-0 relative flex flex-col">
            {activeTab === 'tracks' && (
                <>
                    {/* INTERNAL BAR (Filters) */}
                    <div className="flex flex-col gap-3 mb-3 shrink-0 px-1">
                        <div className="flex items-center justify-between gap-4">
                            <div className="relative flex-1 max-w-2xl group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F9FAFB]/30 group-focus-within:text-[#22D3EE] transition-colors" size={14} />
                                <input 
                                    className="w-full bg-[#151326] border border-[#F9FAFB]/10 rounded-lg py-2 pl-9 pr-4 text-xs text-[#F9FAFB] focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE] outline-none transition-all placeholder:text-[#F9FAFB]/20"
                                    placeholder={t('media.searchPlaceholder')}
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-mono text-[#F9FAFB]/40 bg-[#F9FAFB]/5 px-2 py-1 rounded">
                                    {t('common.selectedCount', { count: filteredMedia.length })}
                                </span>
                                <Button 
                                    size="sm"
                                    leftIcon={<UploadCloud size={14} />}
                                    onClick={() => setShowUploadDrawer(!showUploadDrawer)}
                                >
                                    {t('common.add')}
                                </Button>
                            </div>
                        </div>

                        {/* Quick Filters */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                            <Filter size={12} className="text-[#F9FAFB]/30 mr-1 shrink-0" />
                            {[
                                { id: 'ALL', label: t('media.filters.all') },
                                { id: 'NO_GENRE', label: t('media.filters.noGenre') },
                                { id: 'NO_PLAYLIST', label: t('media.filters.noPlaylist') },
                                { id: 'BLOCKED', label: t('media.filters.blocked') },
                                { id: 'RECENT', label: t('media.filters.recent') }
                            ].map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setQuickFilter(f.id as QuickFilterType)}
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border transition-all whitespace-nowrap
                                        ${quickFilter === f.id 
                                            ? 'bg-[#22D3EE]/20 text-[#22D3EE] border-[#22D3EE]/30' 
                                            : 'bg-[#F9FAFB]/5 text-[#F9FAFB]/50 border-[#F9FAFB]/5 hover:bg-[#F9FAFB]/10 hover:text-[#F9FAFB]'}
                                    `}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ULTRA-COMPACT TABLE */}
                    <div className="flex-1 bg-[#151326]/50 rounded-xl border border-[#F9FAFB]/5 overflow-hidden flex relative">
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse table-fixed">
                                <thead className="bg-[#05030B]/90 backdrop-blur-sm text-[9px] font-bold uppercase text-[#F9FAFB]/40 tracking-wider sticky top-0 z-20">
                                    <tr className="border-b border-[#F9FAFB]/5">
                                        <th className="px-2 py-2 w-8 text-center">
                                            <input 
                                                type="checkbox" 
                                                className="rounded border-white/20 bg-transparent text-[#22D3EE] focus:ring-0 cursor-pointer h-3 w-3" 
                                                onChange={(e) => setSelectedIds(e.target.checked ? new Set(paginatedMedia.map(s => s.id)) : new Set())}
                                                checked={selectedIds.size > 0 && selectedIds.size === paginatedMedia.length}
                                            />
                                        </th>
                                        <th className="px-2 py-2 w-[30%]">{t('media.table.track')}</th>
                                        <th className="px-2 py-2 w-[15%]">{t('media.table.artist')}</th>
                                        <th className="px-2 py-2 w-[20%]">{t('media.table.genres')}</th>
                                        <th className="px-2 py-2 w-[20%]">{t('media.table.playlists')}</th>
                                        <th className="px-2 py-2 w-[120px]">{t('media.table.userDate')}</th>
                                        <th className="px-2 py-2 w-[100px] text-right">{t('media.table.actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs text-[#F9FAFB]/80">
                                    {paginatedMedia.map(media => {
                                        const isActive = activeMediaId === media.id;
                                        const isSelected = selectedIds.has(media.id);
                                        const mediaGenres = getGenreNames(media.genreIds);
                                        const mediaPlaylists = getPlaylistsForMedia(media.id);
                                        const isPlayingThis = isActive && playback.isPlaying;

                                        return (
                                            <tr 
                                                key={media.id} 
                                                className={`
                                                    h-10 border-b border-[#F9FAFB]/5 transition-colors group relative
                                                    ${isActive ? 'bg-[#22D3EE]/5' : 'hover:bg-[#F9FAFB]/5'}
                                                    ${isSelected ? 'bg-[#22D3EE]/10' : ''}
                                                `}
                                            >
                                                <td className="px-2 text-center align-middle">
                                                    <input 
                                                        type="checkbox" 
                                                        className="rounded border-white/20 bg-transparent text-[#22D3EE] focus:ring-0 cursor-pointer h-3 w-3"
                                                        checked={isSelected}
                                                        onChange={() => setSelectedIds(prev => {
                                                            const n = new Set(prev);
                                                            n.has(media.id) ? n.delete(media.id) : n.add(media.id);
                                                            return n;
                                                        })}
                                                    />
                                                </td>
                                                {/* TITLE + INLINE PROGRESS + TIME */}
                                                <td className="px-2 align-middle relative overflow-hidden">
                                                    <div className="flex items-center gap-2 w-full h-full">
                                                        {/* Play Button Overlay */}
                                                        <button 
                                                            onClick={() => handlePlay(media)} 
                                                            className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${isPlayingThis ? 'text-[#22D3EE]' : 'text-[#F9FAFB]/30 hover:text-white'}`}
                                                        >
                                                            {isPlayingThis ? <Pause size={10} fill="currentColor" /> : <Play size={10} fill="currentColor" />}
                                                        </button>
                                                        
                                                        {/* Text Container: Title + Time */}
                                                        <div className="flex-1 min-w-0 flex items-baseline justify-between gap-3 pr-2">
                                                            <span className={`font-medium truncate ${isActive ? 'text-[#22D3EE]' : 'text-[#F9FAFB]'}`} title={media.title}>
                                                                {media.title}
                                                            </span>
                                                            <span className={`text-[9px] font-mono whitespace-nowrap shrink-0 ${isPlayingThis ? 'text-[#22D3EE]' : 'text-[#F9FAFB]/30'}`}>
                                                                {isPlayingThis 
                                                                    ? `${formatTime(playback.currentTime)} / ${formatTime(media.duration)}`
                                                                    : formatTime(media.duration)
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {/* Inline Progress Bar (Bottom) */}
                                                    {isActive && (
                                                        <div className="absolute bottom-0 left-0 h-[2px] bg-[#22D3EE] transition-all duration-300" style={{ width: `${playback.progress}%` }}></div>
                                                    )}
                                                </td>
                                                
                                                <td className="px-2 align-middle truncate text-[#F9FAFB]/60" title={media.artist}>
                                                    {media.artist || '-'}
                                                </td>
                                                
                                                {/* GENRES (COLORED) */}
                                                <td className="px-2 align-middle">
                                                    <RenderCompactChips items={mediaGenres} emptyLabel="media.chips.noGenre" useDynamicColor={true} />
                                                </td>
                                                
                                                {/* PLAYLISTS */}
                                                <td className="px-2 align-middle">
                                                    <RenderCompactChips items={mediaPlaylists} color="bg-[#FFCC00]/10 text-[#FFCC00] border-[#FFCC00]/20" emptyLabel="media.chips.noPlaylist" />
                                                </td>

                                                {/* USER & DATE */}
                                                <td className="px-2 align-middle">
                                                    <div className="flex flex-col leading-tight">
                                                        <span className="text-[9px] text-[#F9FAFB]/70 truncate max-w-[80px]" title={media.uploadedBy}>{media.uploadedBy || 'Sistema'}</span>
                                                        <span className="text-[9px] text-[#F9FAFB]/30 font-mono">{media.uploadedAt ? formatDate(media.uploadedAt) : '--'}</span>
                                                    </div>
                                                </td>

                                                {/* ACTIONS (ALWAYS VISIBLE) */}
                                                <td className="px-2 align-middle text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button 
                                                            onClick={(e) => openPopover(e, 'GENRE', media.id)}
                                                            className="p-1 hover:bg-[#F9FAFB]/10 rounded text-[#F9FAFB]/50 hover:text-[#7C3AED]"
                                                            title={t('media.actions.addGenre')}
                                                        >
                                                            <Tags size={12} />
                                                        </button>
                                                        <button 
                                                            onClick={(e) => openPopover(e, 'PLAYLIST', media.id)}
                                                            className={`p-1 hover:bg-[#F9FAFB]/10 rounded transition-colors ${mediaPlaylists.length > 0 ? 'text-[#FFCC00] hover:text-[#FFE680]' : 'text-[#F9FAFB]/50 hover:text-[#FFCC00]'}`}
                                                            title={t('media.actions.addToPlaylist')}
                                                        >
                                                            <ListPlus size={12} />
                                                        </button>
                                                        <button 
                                                            onClick={() => requestDelete([media.id])}
                                                            className="p-1 hover:bg-rose-500/10 rounded text-[#F9FAFB]/50 hover:text-rose-500 transition-colors"
                                                            title={t('common.delete')}
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            
                            {paginatedMedia.length === 0 && !loading && (
                                <div className="py-20 text-center text-[#F9FAFB]/30 text-xs">
                                    {t('media.empty')}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* POPOVERS */}
                    {popover && (
                        <QuickSelector 
                            title={popover.type === 'GENRE' ? t('media.actions.addGenre') : t('media.actions.addToPlaylist')}
                            placeholder={t('common.search')}
                            items={popover.type === 'GENRE' ? genres : playlists}
                            selectedIds={
                                popover.type === 'GENRE' 
                                ? (mediaList.find(s => s.id === popover.targetId)?.genreIds || [])
                                : (getPlaylistsForMedia(popover.targetId).map(pl => pl.id))
                            }
                            onToggle={(id) => {
                                if (popover.type === 'GENRE') toggleGenre(popover.targetId, id);
                                else togglePlaylist(popover.targetId, id);
                            }}
                            onCreate={(name) => {
                                if (popover.type === 'GENRE') createAndAssignGenre(popover.targetId, name);
                                else createAndAssignPlaylist(popover.targetId, name);
                            }}
                            onClose={() => setPopover(null)}
                            position={{ top: popover.y, left: popover.x }}
                        />
                    )}

                    {/* BATCH BAR */}
                    {selectedIds.size > 0 && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#009B4D] text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-4 z-40">
                            <span className="font-bold text-xs">{t('common.selectedCount', { count: selectedIds.size })}</span>
                            <div className="h-3 w-px bg-white/30"></div>
                            <button className="text-xs font-bold hover:underline flex items-center gap-1"><Tags size={10}/> {t('media.tabs.genres')}</button>
                            <button className="text-xs font-bold hover:underline flex items-center gap-1"><ListPlus size={10}/> {t('media.tabs.playlists')}</button>
                            <div className="h-3 w-px bg-white/30"></div>
                            <button onClick={() => requestDelete(Array.from(selectedIds))} className="text-xs font-bold hover:text-rose-200 flex items-center gap-1"><Trash2 size={10}/> {t('common.delete')}</button>
                            <button onClick={() => setSelectedIds(new Set())} className="ml-1 p-0.5 hover:bg-white/20 rounded-full"><X size={10}/></button>
                        </div>
                    )}
                </>
            )}
            
            {/* OTHER TABS PLACEHOLDERS */}
            {activeTab === 'playlists' && (
                <div className="grid grid-cols-4 gap-4 animate-in fade-in">
                    {playlists.map(pl => (
                        <div key={pl.id} className="glass-panel p-4 rounded-xl hover:border-[#FFCC00]/30 transition-all cursor-pointer">
                            <h3 className="font-bold text-[#F9FAFB]">{pl.name}</h3>
                            <p className="text-xs text-[#F9FAFB]/50">{pl.mediaCount} {t('media.tabs.tracks')}</p>
                        </div>
                    ))}
                </div>
            )}
            {activeTab === 'genres' && (
                <div className="grid grid-cols-6 gap-3 animate-in fade-in">
                    {genres.map(g => (
                        <div key={g.id} className="glass-panel p-3 rounded-xl border-l-4" style={{borderLeftColor: getGenreColor(g.id)}}>
                            <h4 className="font-bold text-[#F9FAFB] text-sm">{g.name}</h4>
                            <p className="text-[10px] text-[#F9FAFB]/50">{g.mediaCount} {t('media.tabs.tracks')}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

export default MusicPage;
