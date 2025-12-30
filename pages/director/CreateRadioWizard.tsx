import React, { useState } from 'react';
import { 
  ArrowLeft, ArrowRight, CheckCircle, Play, 
  Check, PlayCircle, ListMusic, Clock, RefreshCw, 
  Zap, Megaphone, Info, Newspaper, Thermometer, 
  Heart, Car, Hammer, ShoppingBag, Sparkles, Smile
} from 'lucide-react';
import { Button, Card } from '../../components/ui';
import { api } from '../../services/api';
import { WizardResponse } from '../../types';

interface CreateRadioWizardProps {
  onFinish: () => void;
}

// COMPONENTE REUTILIZÁVEL - AUTOMATION CARD (DESIGN PREMIUM)
const AutomationCard: React.FC<{
  title: string;
  description: string;
  badgeRight: string;
  badgeMid?: string;
  detail: string;
  enabled: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
}> = ({ title, description, badgeRight, badgeMid, detail, enabled, onToggle, icon }) => {
  return (
    <div className="relative group w-full">
      {/* Glow Roxo Externo (Efeito Neon) */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r from-lomuz-imperial/30 to-purple-600/30 rounded-2xl blur-xl opacity-0 transition-opacity duration-500 pointer-events-none ${enabled ? 'opacity-100' : 'group-hover:opacity-40'}`} />
      
      {/* Card Principal */}
      <div className={`relative flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 backdrop-blur-md ${
        enabled 
          ? 'bg-white/[0.1] border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)]' 
          : 'bg-white/[0.04] border-white/5 hover:border-white/10'
      }`}>
        
        {/* Tile de Ícone à Esquerda */}
        <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${
          enabled ? 'bg-lomuz-imperial text-white shadow-glow' : 'bg-white/5 text-white/30 group-hover:text-white/50'
        }`}>
          {icon}
        </div>

        {/* Conteúdo Central */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-0.5">
            <h4 className={`text-sm font-bold truncate transition-colors ${enabled ? 'text-white' : 'text-white/60'}`}>
              {title}
            </h4>
            
            {/* Chip Superior Direito */}
            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded tracking-tighter uppercase transition-all duration-300 ${
              enabled ? 'bg-lomuz-imperial/20 text-lomuz-imperial' : 'bg-white/5 text-white/20'
            }`}>
              {badgeRight}
            </span>
          </div>

          <p className="text-[11px] text-lomuz-muted truncate mb-2 leading-none">
            {description}
          </p>

          <div className="flex items-center gap-2">
            {/* Chip Inferior (Tipo) */}
            {badgeMid && (
              <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-widest border transition-all duration-300 ${
                enabled ? 'bg-lomuz-imperial/10 border-lomuz-imperial/30 text-lomuz-imperial' : 'bg-white/5 border-white/5 text-white/20'
              }`}>
                {badgeMid}
              </span>
            )}
            
            {/* Texto de Detalhe */}
            <span className={`text-[10px] font-medium transition-colors ${enabled ? 'text-white/50' : 'text-white/20'}`}>
              {detail}
            </span>
          </div>
        </div>

        {/* Toggle à Direita */}
        <div className="shrink-0 ml-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none ${
              enabled ? 'bg-lomuz-imperial' : 'bg-white/10'
            }`}
          >
            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-300 ease-in-out ${
              enabled ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>
    </div>
  );
};

// MOCK DATA PARA ATRAÇÕES
const LEFT_COL_ATTRACTIONS = [
  { id: 'horaCerta', title: 'Hora Certa', desc: 'Informa a hora exata na grade.', tag: 'A CADA 60 MIN', type: 'RECORRENTE', detail: 'A cada 60 min', icon: <Clock size={20} /> },
  { id: 'insideStreaming', title: 'Inside Streaming', desc: 'Curiosidades do mundo da música.', tag: '4 HORÁRIOS FIXOS', type: 'HORÁRIOS FIXOS', detail: '09:15, 11:15, 14:15, 17:15', icon: <Play size={20} /> },
  { id: 'centralFofocas', title: 'Central de Fofocas', desc: 'As notícias mais quentes dos famosos.', tag: '3 HORÁRIOS FIXOS', type: 'HORÁRIOS FIXOS', detail: '10:30, 13:30, 16:30', icon: <Megaphone size={20} /> },
  { id: 'jogoRapido', title: 'Jogo Rápido', desc: 'Dicas rápidas de esporte e lazer.', tag: '3 HORÁRIOS FIXOS', type: 'HORÁRIOS FIXOS', detail: '09:45, 12:45, 15:45', icon: <Zap size={20} /> },
  { id: 'temperatura', title: 'Temperatura', desc: 'Previsão do tempo local na rádio.', tag: 'A CADA 60 MIN', type: 'RECORRENTE', detail: 'A cada 60 min', icon: <Thermometer size={20} /> },
  { id: 'conexaoNews', title: 'Notícias (Conexão News)', desc: 'Giro de notícias atualizado.', tag: '14 HORÁRIOS FIXOS', type: 'HORÁRIOS FIXOS', detail: 'De 1h em 1h (8h às 21h)', icon: <Newspaper size={20} /> },
  { id: 'musicPlus', title: 'Music Plus', desc: 'Lançamentos e sucessos exclusivos.', tag: '3 HORÁRIOS FIXOS', type: 'HORÁRIOS FIXOS', detail: '11:30, 15:30, 20:30', icon: <ListMusic size={20} /> },
];

const RIGHT_COL_ATTRACTIONS = [
  { id: 'locucaoVarejo', title: 'Locução Varejo', desc: 'Chamadas motivacionais para compras.', tag: 'A CADA 60 MIN', type: 'RECORRENTE', detail: 'A cada 60 min', icon: <ShoppingBag size={20} /> },
  { id: 'momentoMotivacao', title: 'Momento Motivação', desc: 'Pílulas diárias de inspiração.', tag: 'A CADA 60 MIN', detail: 'A cada 60 min', icon: <Smile size={20} /> },
  { id: 'maosAObra', title: 'Mãos à Obra', desc: 'Dicas de reforma e construção.', tag: 'A CADA 60 MIN', detail: 'A cada 60 min', icon: <Hammer size={20} /> },
  { id: 'cuidadoCarro', title: 'Cuidado com o Carro', desc: 'Dicas de manutenção automotiva.', tag: 'A CADA 60 MIN', detail: 'A cada 60 min', icon: <Car size={20} /> },
  { id: 'alimentacaoSaude', title: 'Alimentação e Saúde', desc: 'Dicas para uma vida saudável.', tag: 'A CADA 60 MIN', detail: 'A cada 60 min', icon: <Heart size={20} /> },
  { id: 'casaBemEstar', title: 'Casa e Bem-estar', desc: 'Dicas de organização e decoração.', tag: 'A CADA 60 MIN', detail: 'A cada 60 min', icon: <Sparkles size={20} /> },
  { id: 'modaBeleza', title: 'Moda e Beleza', desc: 'As últimas tendências de estilo.', tag: 'A CADA 60 MIN', detail: 'A cada 60 min', icon: <Info size={20} /> },
];

const INITIAL_WIZARD_STATE = {
  radio: { name: '', streamingName: '', segment: '', initialPlaylistId: '' },
  selectedPlaylists: [] as string[],
  attractions: {} as Record<string, boolean>,
  dadosCadastrais: { razaoSocial: '', cnpj: '', organizacao: '', cep: '', email: '', senha: '' }
};

const CreateRadioWizard: React.FC<CreateRadioWizardProps> = ({ onFinish }) => {
  const [step, setStep] = useState(3);
  const [payload, setPayload] = useState(INITIAL_WIZARD_STATE);
  const [successData, setSuccessData] = useState<WizardResponse | null>(null);

  const toggleAttraction = (id: string) => {
    setPayload(prev => ({
      ...prev,
      attractions: { ...prev.attractions, [id]: !prev.attractions[id] }
    }));
  };

  const handleFinish = async () => {
    try {
        const res = await api.radios.createRadioFull(payload as any);
        setSuccessData(res);
    } catch (e) { alert("Erro ao criar rádio."); }
  };

  if (successData) {
      return (
          <div className="max-w-xl mx-auto py-12 animate-in zoom-in-95">
              <Card className="p-8 text-center bg-lomuz-surface border-lomuz-border shadow-2xl">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500"><CheckCircle size={48} /></div>
                  <h2 className="text-3xl font-bold text-white mb-2">Rádio Ativada!</h2>
                  <p className="text-lomuz-muted mb-8">Sua estação já está pronta para transmitir.</p>
                  <Button onClick={() => window.open(successData.linkRadio, '_blank')} className="w-full mb-3">Abrir Player</Button>
                  <Button variant="ghost" onClick={onFinish} className="w-full">Voltar ao Início</Button>
              </Card>
          </div>
      );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Stepper Superior */}
      <div className="flex flex-col items-center mb-16 relative">
          <div className="flex items-center justify-center gap-20 relative w-full max-w-2xl">
              <div className="absolute top-5 left-10 right-10 h-[1px] bg-white/5 -z-10"></div>
              {[
                { s: 1, label: 'DADOS', status: 'done' },
                { s: 2, label: 'CURADORIA', status: 'done' },
                { s: 3, label: 'AUTOMAÇÃO', status: 'active' },
                { s: 4, label: 'ATIVAÇÃO', status: 'pending' }
              ].map((item) => (
                  <div key={item.s} className="flex flex-col items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                        item.status === 'done' ? 'bg-lomuz-imperial border-lomuz-imperial text-white' : 
                        item.status === 'active' ? 'bg-transparent border-lomuz-imperial text-lomuz-imperial shadow-[0_0_15px_rgba(124,58,237,0.3)]' : 
                        'bg-[#0D0B14] border-white/5 text-[#475569]'
                      }`}>
                          {item.status === 'done' ? <Check size={18} strokeWidth={3} /> : <span className="text-sm font-bold">{item.s}</span>}
                      </div>
                      <span className={`text-[10px] font-bold tracking-[0.15em] ${item.status === 'active' ? 'text-lomuz-imperial' : 'text-[#475569]'}`}>{item.label}</span>
                  </div>
              ))}
          </div>
      </div>

      {/* Card Principal */}
      <div className="bg-[#12101D] rounded-[32px] border border-white/5 shadow-2xl flex flex-col overflow-hidden min-h-[600px]">
          
          {/* Header da Etapa */}
          <div className="px-12 pt-12 pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                  <h2 className="text-4xl font-bold text-white mb-2">Atrações e Inteligência</h2>
                  <p className="text-lomuz-muted text-sm font-medium">O segredo está na mistura. Eu configurei os horários ideais, mas você pode ajustar tudo.</p>
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lomuz-imperial/10 border border-lomuz-imperial/30 text-lomuz-imperial text-xs font-bold hover:bg-lomuz-imperial hover:text-white transition-all shadow-glow">
                  <RefreshCw size={14} /> Restaurar Padrão do Sistema
              </button>
          </div>

          <div className="flex-1 px-12 pb-12 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                  
                  {/* Coluna Esquerda: SERVIÇOS INFORMATIVOS */}
                  <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">SERVIÇOS INFORMATIVOS</h3>
                          <div className="h-px flex-1 bg-white/5"></div>
                      </div>
                      <div className="grid gap-4">
                          {LEFT_COL_ATTRACTIONS.map(item => (
                            <AutomationCard 
                              key={item.id} 
                              title={item.title}
                              description={item.desc}
                              badgeRight={item.tag}
                              badgeMid={item.type}
                              detail={item.detail}
                              enabled={!!payload.attractions[item.id]}
                              onToggle={() => toggleAttraction(item.id)}
                              icon={item.icon}
                            />
                          ))}
                      </div>
                  </div>

                  {/* Coluna Direita: CONTEÚDO & VARIEDADES */}
                  <div className="space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">CONTEÚDO & VARIEDADES</h3>
                          <div className="h-px flex-1 bg-white/5"></div>
                      </div>
                      <div className="grid gap-4">
                          {RIGHT_COL_ATTRACTIONS.map(item => (
                            <AutomationCard 
                              key={item.id} 
                              title={item.title}
                              description={item.desc}
                              badgeRight={item.tag}
                              badgeMid={item.type}
                              detail={item.detail}
                              enabled={!!payload.attractions[item.id]}
                              onToggle={() => toggleAttraction(item.id)}
                              icon={item.icon}
                            />
                          ))}
                      </div>
                  </div>
              </div>
          </div>

          {/* Rodapé do Card */}
          <div className="mt-auto px-12 py-8 bg-[#0D0B14]/50 border-t border-white/5 flex justify-between items-center">
              <button onClick={() => onFinish()} className="flex items-center gap-2 text-lomuz-muted hover:text-white transition-colors text-sm font-bold">
                  <ArrowLeft size={18} /> Voltar
              </button>
              
              <button 
                onClick={() => handleFinish()} 
                className="flex items-center gap-2 px-10 py-4 rounded-full text-white font-bold transition-all shadow-lg bg-lomuz-imperial hover:brightness-110 shadow-lomuz-imperial/20"
              >
                  Próximo <ArrowRight size={18} />
              </button>
          </div>
      </div>
    </div>
  );
};

export default CreateRadioWizard;