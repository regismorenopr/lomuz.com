
import React, { useEffect, useState } from 'react';
import { 
  Users, Radio, Activity, HardDrive, TrendingUp, PieChart, 
  ArrowUpRight, Server, CheckCircle, AlertTriangle
} from 'lucide-react';
import { ApiService } from '../../services/mockApi';
import { DashboardStats, GrowthData, PlanDistribution } from '../../types';
import { PageHeader } from '../../components/ui';
import { useTranslation } from '../../contexts/I18nContext';

const OperationalWidget = () => {
    const [opsData, setOpsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOps = async () => {
            try {
                const res = await fetch('http://localhost:3001/api/v1/dashboard/operational', {
                    headers: { 'Authorization': 'Bearer mock-token' }
                });
                if(res.ok) {
                    const data = await res.json();
                    setOpsData(data);
                }
            } catch (e) {
                console.log("Backend offline.");
            } finally {
                setLoading(false);
            }
        };
        fetchOps();
    }, []);

    if (loading || !opsData || !opsData.stats) return null;

    return (
        <div className="bg-[#151326] border border-lomuz-border rounded-[32px] p-8 mb-8">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-white tracking-tighter flex items-center gap-3 uppercase">
                    <Server size={22} className="text-lomuz-imperial" /> STATUS DA REDE <span className="text-lomuz-muted opacity-30">/ REAL-TIME</span>
                </h3>
                <span className="text-[10px] font-black bg-lomuz-imperial/10 text-lomuz-imperial px-3 py-1.5 rounded-lg border border-lomuz-imperial/20 animate-pulse uppercase tracking-[0.2em]">
                    Sincronizado
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-black/20 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-lomuz-imperial/20 transition-all">
                    <div>
                        <p className="text-[10px] text-lomuz-muted uppercase font-black tracking-widest mb-1">Rádios Online</p>
                        <p className="text-3xl font-black text-lomuz-imperial tracking-tighter">{opsData.stats.online}</p>
                    </div>
                    <CheckCircle size={28} className="text-lomuz-imperial/30 group-hover:text-lomuz-imperial transition-colors" />
                </div>
                <div className="p-6 bg-black/20 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all">
                    <div>
                        <p className="text-[10px] text-lomuz-muted uppercase font-black tracking-widest mb-1">Rádios Offline</p>
                        <p className="text-3xl font-black text-slate-200 tracking-tighter">{opsData.stats.offline}</p>
                    </div>
                    <Radio size={28} className="text-slate-500/30 group-hover:text-slate-500 transition-colors" />
                </div>
                <div className="p-6 bg-black/20 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-red-500/20 transition-all">
                    <div>
                        <p className="text-[10px] text-lomuz-muted uppercase font-black tracking-widest mb-1">Alertas Críticos</p>
                        <p className="text-3xl font-black text-red-400 tracking-tighter">{opsData.alerts.length}</p>
                    </div>
                    <AlertTriangle size={28} className="text-red-500/30 group-hover:text-red-500 transition-colors" />
                </div>
            </div>
        </div>
    );
};

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [growthData, setGrowthData] = useState<GrowthData[]>([]);
  const [planData, setPlanData] = useState<PlanDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [statsData, growth, plans] = await Promise.all([
          ApiService.getDashboardStats(),
          ApiService.getGrowthData(),
          ApiService.getPlanDistribution()
        ]);
        setStats(statsData);
        setGrowthData(growth);
        setPlanData(plans);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lomuz-imperial"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <PageHeader title="Painel Geral" description="Visão geral da sua frota de players e estatísticas de uso." />
      
      <OperationalWidget />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total de Clientes" value={stats.totalClients} icon={Users} color="imperial" trend="+12%" />
        <MetricCard title="Rádios Ativas" value={stats.activeRadios} icon={Radio} color="imperial" status="Ativo" />
        <MetricCard title="Sessões Ativas" value={stats.activeSessions} icon={Activity} color="imperial" label="Global" />
        <MetricCard title="Uso de Armazenamento" value={`${stats.storageUsedPercent}%`} icon={HardDrive} color="imperial" isStorage />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-lomuz-surface border border-lomuz-border rounded-[32px] p-8 shadow-2xl">
            <h4 className="text-lg font-black text-white tracking-tighter uppercase flex items-center gap-3 mb-8">
               <TrendingUp size={20} className="text-lomuz-imperial" /> Crescimento da Base
            </h4>
            <div className="flex items-end justify-between h-40 gap-3">
              {growthData.map((d, i) => (
                <div key={i} className="flex flex-col items-center gap-3 flex-1 group">
                    <div className="relative w-full flex justify-center h-full items-end">
                        <div style={{ height: `${(d.newClients / 10) * 100}%` }} className="w-full max-w-[20px] bg-gradient-to-t from-lomuz-imperial to-lomuz-amethyst rounded-t-lg opacity-80 group-hover:opacity-100 transition-all"></div>
                    </div>
                    <span className="text-[9px] font-black text-lomuz-muted uppercase">{new Date(d.date).getDate()}</span>
                </div>
              ))}
            </div>
        </div>
        <div className="bg-lomuz-surface border border-lomuz-border rounded-[32px] p-8 shadow-2xl">
            <h4 className="text-lg font-black text-white tracking-tighter uppercase flex items-center gap-3 mb-8">
               <PieChart size={20} className="text-lomuz-imperial" /> Distribuição de Planos
            </h4>
            <div className="space-y-4">
               {planData.map((p, i) => (
                 <div key={i} className="flex justify-between items-center p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                    <span className="text-[10px] font-black text-white/60 uppercase">{p.plan}</span>
                    <span className="font-black text-white">{p.count}</span>
                 </div>
               ))}
            </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon: Icon, color, trend, status, label, isStorage }: any) => (
    <div className={`p-8 rounded-[32px] bg-lomuz-surface border border-lomuz-border shadow-2xl group hover:border-lomuz-imperial/40 transition-all`}>
        <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl bg-lomuz-imperial/10 text-lomuz-imperial group-hover:scale-110 transition-transform`}><Icon size={28} /></div>
            {trend && <span className="text-[10px] font-black text-lomuz-gold bg-lomuz-gold/10 px-3 py-1.5 rounded-full border border-lomuz-gold/20">{trend} <ArrowUpRight size={14} className="inline ml-1" /></span>}
            {status && <span className="text-[10px] font-black text-[#009B4D] bg-[#009B4D]/10 px-3 py-1.5 rounded-full border border-[#009B4D]/20 uppercase tracking-widest">{status}</span>}
            {label && <span className="text-[10px] font-black text-lomuz-muted uppercase tracking-[0.2em] mt-2">{label}</span>}
        </div>
        <h3 className="text-4xl font-black text-white mb-2 tracking-tighter">{value}</h3>
        <p className="text-[10px] font-black text-lomuz-muted uppercase tracking-[0.2em]">{title}</p>
        {isStorage && (
            <div className="w-full h-1.5 bg-black/40 rounded-full mt-6 overflow-hidden border border-white/5">
                <div className="h-full bg-gradient-to-r from-lomuz-imperial to-lomuz-amethyst" style={{ width: value }}></div>
            </div>
        )}
    </div>
);

export default DashboardPage;
