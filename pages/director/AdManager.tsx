
import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Plus, Search, Filter, RefreshCw, 
  Mic2, Wand2, Clock, CheckCircle, ChevronRight,
  MoreVertical, FileText
} from 'lucide-react';
import { Button, Card, Badge, PageHeader } from '../../components/ui';
import { useTranslation } from '../../contexts/I18nContext';
import { ApiService } from '../../services/mockApi';
import { AdRequest } from '../../types';
import AdRequestWizard from '../../components/AdRequestWizard';

const AdManager: React.FC = () => {
    const { t } = useTranslation();
    const [requests, setRequests] = useState<AdRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showWizard, setShowWizard] = useState(false);
    const [search, setSearch] = useState('');

    const loadData = async () => {
        setLoading(true);
        // Usamos um ID de rádio fake para o mock
        const data = await ApiService.getAdRequests('rad-demo-1');
        setRequests(data);
        setLoading(false);
    };

    useEffect(() => { loadData(); }, []);

    const filtered = requests.filter(r => r.textFinal.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <PageHeader 
                title={t('ads.title')} 
                description={t('ads.subtitle')}
                actions={
                    <Button variant="gold" leftIcon={<Plus size={18}/>} onClick={() => setShowWizard(true)}>
                        {t('ads.newRequest')}
                    </Button>
                }
            />

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-lomuz-surface/30 p-4 rounded-3xl border border-lomuz-border">
                <div className="relative w-full md:max-w-md group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-lomuz-muted group-focus-within:text-lomuz-gold transition-colors" size={18} />
                    <input 
                        type="text" 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Buscar por conteúdo do anúncio..."
                        className="w-full bg-lomuz-bg border border-lomuz-border rounded-2xl py-3 pl-12 pr-4 text-white focus:border-lomuz-gold/50 outline-none transition-all"
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={loadData}><RefreshCw size={14} /></Button>
                    <Button variant="ghost" size="sm"><Filter size={14} className="mr-2"/> Filtrar</Button>
                </div>
            </div>

            <div className="bg-lomuz-surface border border-lomuz-border rounded-[32px] overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead className="bg-lomuz-bg-alt/50 border-b border-lomuz-border text-[10px] font-black uppercase text-lomuz-muted tracking-widest">
                        <tr>
                            <th className="px-8 py-5">{t('ads.table.content')}</th>
                            <th className="px-8 py-5">{t('ads.table.type')}</th>
                            <th className="px-8 py-5">{t('ads.table.status')}</th>
                            <th className="px-8 py-5 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-lomuz-border/30">
                        {loading ? (
                             <tr><td colSpan={4} className="py-20 text-center text-lomuz-muted italic">Carregando solicitações...</td></tr>
                        ) : filtered.length === 0 ? (
                             <tr><td colSpan={4} className="py-20 text-center text-lomuz-muted italic">Nenhuma solicitação encontrada.</td></tr>
                        ) : filtered.map(req => (
                            <tr key={req.id} className="group hover:bg-white/[0.02] transition-colors">
                                <td className="px-8 py-5 max-w-md">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-white line-clamp-1">{req.textFinal}</span>
                                        <span className="text-[10px] text-lomuz-muted uppercase font-bold tracking-tighter mt-1">
                                            {new Date(req.createdAt).toLocaleDateString()} • {req.textFinal.length} caracteres
                                        </span>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2">
                                        {req.type === 'VIRTUAL' ? <Wand2 size={14} className="text-indigo-400" /> : <Mic2 size={14} className="text-purple-400" />}
                                        <span className="text-xs font-bold text-white/70">{req.type === 'VIRTUAL' ? 'Locutor IA' : 'Profissional'}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <Badge status={req.status} />
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <button className="p-2 hover:bg-white/5 rounded-lg text-lomuz-muted hover:text-white">
                                        <MoreVertical size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showWizard && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <Card className="max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col p-0">
                        <div className="p-6 border-b border-lomuz-border flex justify-between items-center bg-lomuz-bg-alt/30">
                            <h2 className="text-xl font-black text-white uppercase flex items-center gap-3">
                                <Sparkles className="text-lomuz-gold" /> {t('ads.newRequest')}
                            </h2>
                            <button onClick={() => setShowWizard(false)} className="p-2 hover:bg-white/5 rounded-full text-lomuz-muted">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto">
                            <AdRequestWizard 
                                radioId="rad-demo-1" 
                                onClose={() => setShowWizard(false)} 
                                onSuccess={() => { loadData(); setShowWizard(false); }}
                            />
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
};

const X = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
);

export default AdManager;
