
import React, { useState, useEffect } from 'react';
import { 
  Music, Mic, Calendar, ClipboardList, BarChart3, 
  ArrowLeft, Activity, ShieldCheck, AlertTriangle, 
  TrendingUp, TrendingDown, Info, RefreshCw, Layers,
  CloudOff, FileWarning, Timer, CheckCircle, Zap
} from 'lucide-react';
import { ApiService } from '../../services/mockApi';
import { Radio, ClientPreference, AuditLog, ReliabilityReport } from '../../types';
import { Button, Card, Badge, PageHeader } from '../../components/ui';

interface ClientPreferencesProps {
  clientId: string;
  onBack: () => void;
}

const ClientPreferences: React.FC<ClientPreferencesProps> = ({ clientId, onBack }) => {
  const [activeTab, setActiveTab] = useState<'playlists' | 'audio' | 'attractions' | 'scheduling' | 'logs' | 'reports'>('reports');
  const [client, setClient] = useState<Radio | null>(null);
  const [prefs, setPrefs] = useState<ClientPreference | null>(null);
  const [report, setReport] = useState<ReliabilityReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [clients, p, r] = await Promise.all([
        ApiService.getClients(),
        ApiService.getClientPreferences(clientId),
        ApiService.getReliabilityReport(clientId)
      ]);
      setClient(clients.find(c => c.id === clientId) || null);
      setPrefs(p);
      setReport(r);
      setLoading(false);
    };
    load();
  }, [clientId]);

  if (loading || !client || !report) return <div className="flex h-96 items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-lomuz-gold"></div></div>;

  const NavItem = ({ id, label, icon: Icon }: { id: typeof activeTab, label: string, icon: any }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-5 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === id ? 'text-lomuz-gold border-lomuz-gold bg-lomuz-gold/5' : 'text-lomuz-muted border-transparent hover:text-white'}`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full text-lomuz-muted transition-colors"><ArrowLeft /></button>
        <PageHeader 
          title={client.name} 
          description={`Preferências de Confiabilidade Sonora • ${client.companyName}`}
          actions={<Badge status={client.status} />}
        />
      </div>

      <div className="flex border-b border-lomuz-border overflow-x-auto bg-lomuz-surface/30 rounded-t-xl no-scrollbar">
        <NavItem id="playlists" label="Preferências de Gêneros" icon={Music} />
        <NavItem id="attractions" label="Preferências de Atração" icon={Mic} />
        <NavItem id="scheduling" label="Preferências de Agenda" icon={Calendar} />
        <NavItem id="audio" label="Preferências de Áudio" icon={AudioLines} />
        <NavItem id="logs" label="Preferências de Log" icon={ClipboardList} />
        <NavItem id="reports" label="Preferências de Relatório" icon={BarChart3} />
      </div>

      <div className="min-h-[500px]">
        {activeTab === 'reports' && (
          <div className="space-y-8">
            {/* Linha 1: KPIs Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 bg-lomuz-surface border border-lomuz-border rounded-3xl">
                    <p className="text-[10px] font-black text-lomuz-muted uppercase tracking-widest mb-4">Uptime da Grade</p>
                    <div className="flex items-end justify-between">
                        <h4 className="text-4xl font-black text-white">{report.uptimePercent}%</h4>
                        <TrendingUp className="text-green-500 mb-1" size={24} />
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${report.uptimePercent}%` }} />
                    </div>
                </div>

                <div className="p-6 bg-lomuz-surface border border-lomuz-border rounded-3xl">
                    <p className="text-[10px] font-black text-lomuz-muted uppercase tracking-widest mb-4">Total de Inserções</p>
                    <div className="flex items-end justify-between">
                        <h4 className="text-4xl font-black text-white">{report.totalProgrammed}</h4>
                        <Layers className="text-lomuz-gold mb-1" size={24} />
                    </div>
                    <p className="text-[10px] text-lomuz-muted mt-4">24h de monitoramento ativo</p>
                </div>

                <div className="p-6 bg-lomuz-surface border border-lomuz-border rounded-3xl">
                    <p className="text-[10px] font-black text-lomuz-muted uppercase tracking-widest mb-4">Execuções com Sucesso</p>
                    <div className="flex items-end justify-between">
                        <h4 className="text-4xl font-black text-green-500">{report.successCount}</h4>
                        <CheckCircle className="text-green-500 mb-1" size={24} />
                    </div>
                    <p className="text-[10px] text-green-500/50 mt-4">98.4% de eficiência real</p>
                </div>

                <div className="p-6 bg-lomuz-surface border border-lomuz-border rounded-3xl">
                    <p className="text-[10px] font-black text-lomuz-muted uppercase tracking-widest mb-4">Total de Falhas</p>
                    <div className="flex items-end justify-between">
                        <h4 className={`text-4xl font-black ${report.failCount > 30 ? 'text-rose-500' : 'text-orange-500'}`}>{report.failCount}</h4>
                        <AlertTriangle className="text-rose-500 mb-1" size={24} />
                    </div>
                    <p className="text-[10px] text-rose-500/50 mt-4 font-bold">REQUER ATENÇÃO IA</p>
                </div>
            </div>

            {/* Linha 2: Diagnóstico IA e Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Coluna Analítica */}
                <div className="lg:col-span-8 space-y-6">
                    <Card title="Diagnóstico de Falhas Recorrentes">
                        <div className="space-y-4">
                            {report.recurringFailures.map((fail, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-4 bg-lomuz-bg rounded-2xl border border-lomuz-border group hover:border-rose-500/30 transition-all">
                                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                                        <FileWarning size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h5 className="text-sm font-bold text-white truncate">{fail.mediaTitle}</h5>
                                        <p className="text-[10px] text-lomuz-muted uppercase font-bold tracking-tighter">Última falha: {fail.lastReason}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-rose-500">{fail.count}</p>
                                        <p className="text-[8px] text-lomuz-muted uppercase font-bold">Ocorrências</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-5 bg-lomuz-surface border border-lomuz-border rounded-3xl text-center">
                            <CloudOff size={24} className="mx-auto text-blue-400 mb-2" />
                            <h5 className="text-lg font-black text-white">{report.failureBreakdown.network}</h5>
                            <p className="text-[9px] font-bold text-lomuz-muted uppercase">Erros de Conexão</p>
                        </div>
                        <div className="p-5 bg-lomuz-surface border border-lomuz-border rounded-3xl text-center">
                            <Zap size={24} className="mx-auto text-orange-400 mb-2" />
                            <h5 className="text-lg font-black text-white">{report.failureBreakdown.corrupted}</h5>
                            <p className="text-[9px] font-bold text-lomuz-muted uppercase">Arquivos Inválidos</p>
                        </div>
                        <div className="p-5 bg-lomuz-surface border border-lomuz-border rounded-3xl text-center">
                            <Timer size={24} className="mx-auto text-lomuz-gold mb-2" />
                            <h5 className="text-lg font-black text-white">{report.failureBreakdown.conflict}</h5>
                            <p className="text-[9px] font-bold text-lomuz-muted uppercase">Conflitos de Grade</p>
                        </div>
                    </div>
                </div>

                {/* Coluna Recomendações IA */}
                <div className="lg:col-span-4 space-y-6">
                    <Card title="Assistente IA Lomuz">
                        <div className="space-y-6">
                            <div className="p-5 bg-lomuz-gold/5 border border-lomuz-gold/20 rounded-3xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-2 opacity-20"><Zap size={40} className="text-lomuz-gold" /></div>
                                <h5 className="text-xs font-black text-white uppercase mb-3 flex items-center gap-2">
                                    <ShieldCheck size={14} className="text-lomuz-gold" /> Ação Recomendada
                                </h5>
                                <p className="text-xs text-lomuz-muted leading-relaxed">
                                    Identifiquei que **71% das falhas** são causadas por instabilidade de rede no download. 
                                    <br/><br/>
                                    **Sugestão:** Aumente o "Cache Prévio" do player para 10 faixas e utilize a compressão AAC-HE para arquivos mais leves.
                                </p>
                                <Button variant="gold" size="sm" className="w-full mt-4 text-[10px] font-black uppercase">Aplicar Otimização</Button>
                            </div>

                            <div className="space-y-3">
                                <h6 className="text-[10px] font-black text-lomuz-muted uppercase px-2 tracking-[0.2em]">Saúde da Localidade</h6>
                                <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-between border border-white/5">
                                    <span className="text-xs font-bold text-white">São Paulo (Sede)</span>
                                    <span className="text-[10px] font-black text-green-500 uppercase">Excelente</span>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl flex items-center justify-between border border-white/5">
                                    <span className="text-xs font-bold text-white">Cloud CDN Edge</span>
                                    <span className="text-[10px] font-black text-orange-500 uppercase">Latência Alta</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
          </div>
        )}

        {/* ... manter outras abas simplificadas ... */}
        {activeTab !== 'reports' && (activeTab !== 'logs') && (
           <div className="flex flex-col items-center justify-center py-20 text-lomuz-muted opacity-20">
              <Activity size={64} />
              <p className="mt-4 font-bold uppercase tracking-widest">Interface {activeTab}</p>
           </div>
        )}

        {activeTab === 'logs' && (
           <div className="flex flex-col items-center justify-center py-20 text-lomuz-muted">
              <ClipboardList size={48} className="opacity-20 mb-4" />
              <p>Preferências de Logs e Auditoria</p>
           </div>
        )}
      </div>
    </div>
  );
};

// Componentes Auxiliares
const AudioLines = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2 10v3M6 6v11M10 3v18M14 8v7M18 5v13M22 10v3"/>
  </svg>
);

export default ClientPreferences;
