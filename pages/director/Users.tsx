
import React, { useEffect, useState, useMemo } from 'react';
import { 
  Plus, RefreshCw, Trash2, Shield, User, KeyRound, 
  Mail, Building2, CheckCircle, Search, X, Copy, 
  Users as UsersIcon, ChevronRight, MoreVertical,
  ShieldCheck, AlertTriangle
} from 'lucide-react';
import { ApiService } from '../../services/mockApi';
import { User as UserType, UserRole, CreateUserPayload } from '../../types';
import { Button, PageHeader, EmptyState } from '../../components/ui';
import { useTranslation } from '../../contexts/I18nContext';

const UsersPage: React.FC = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal de Criação
    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState<CreateUserPayload>({
        name: '',
        email: '',
        password: '',
        role: UserRole.CLIENT,
        company: ''
    });

    // Modal de Sucesso (Exibir Credenciais)
    const [successModal, setSuccessModal] = useState<{show: boolean, email?: string, pass?: string, publicId?: string}>({ show: false });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await ApiService.getUsers();
            setUsers(data);
        } catch (e) {
            console.error("Erro ao buscar usuários", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // Lógica de Busca
    const filteredUsers = useMemo(() => {
        return users.filter(u => 
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.company && u.company.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [users, searchTerm]);

    const generatePassword = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let pass = "";
        for (let i = 0; i < 8; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
        setNewUser({ ...newUser, password: pass + '@' });
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const createdUser = await ApiService.createUser(newUser);
            
            // Mostrar Modal de Sucesso com Credenciais
            setSuccessModal({
                show: true,
                email: createdUser.email,
                pass: newUser.password, 
                publicId: createdUser.publicId
            });

            setShowModal(false);
            setNewUser({ name: '', email: '', password: '', role: UserRole.CLIENT, company: '' });
            fetchUsers();
        } catch (e) {
            alert("Erro ao criar usuário.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (window.confirm(t('common.confirmDelete'))) {
            try {
                await ApiService.deleteUser(id);
                // Atualização otimista do estado
                setUsers(prev => prev.filter(u => u.id !== id));
            } catch (e) {
                alert("Erro ao remover usuário.");
            }
        }
    };

    const copyToClipboard = (text?: string) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        // Em um app real, aqui dispararia um toast de sucesso
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-32">
            
            {/* HEADER DINÂMICO */}
            <div className="bg-[#0D0D16] border border-white/5 rounded-[40px] p-10 shadow-huge relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-lomuz-imperial/5 blur-[80px] pointer-events-none" />
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-lomuz-imperial/10 rounded-2xl flex items-center justify-center text-lomuz-imperial border border-lomuz-imperial/20 shadow-glow">
                                <UsersIcon size={24} />
                            </div>
                            <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">{t('users.title')}</h1>
                        </div>
                        <p className="text-lomuz-muted text-sm max-w-xl font-medium leading-relaxed">
                            {t('users.subtitle')}
                        </p>
                    </div>
                    
                    <div className="flex gap-4">
                        <button 
                            onClick={fetchUsers} 
                            disabled={loading}
                            className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white/40 hover:text-white transition-all hover:bg-white/10"
                        >
                            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        </button>
                        <Button 
                            variant="primary" 
                            onClick={() => setShowModal(true)} 
                            className="h-14 px-8 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-glow"
                            leftIcon={<Plus size={18} />}
                        >
                            {t('users.addUser')}
                        </Button>
                    </div>
                </div>

                {/* BARRA DE BUSCA INTEGRADA */}
                <div className="mt-10 relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-lomuz-imperial transition-colors" size={20} />
                    <input 
                        type="text"
                        placeholder="Pesquisar por nome, e-mail ou unidade..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-black/40 border border-white/5 rounded-3xl py-5 pl-16 pr-6 text-white text-sm focus:border-lomuz-imperial/50 outline-none transition-all placeholder:text-white/10 font-bold"
                    />
                </div>
            </div>

            {/* LISTAGEM DE USUÁRIOS */}
            {filteredUsers.length === 0 && !loading ? (
                <EmptyState 
                    titleKey="Nenhum membro encontrado"
                    descKey="Tente ajustar sua busca ou adicione um novo integrante à equipe." 
                    onAction={() => { setSearchTerm(''); setShowModal(true); }}
                    actionLabelKey="users.addUser"
                />
            ) : (
                <div className="bg-[#0D0D16] border border-white/5 rounded-[40px] overflow-hidden shadow-huge">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-black/40 border-b border-white/5 text-[10px] font-black uppercase text-lomuz-muted tracking-[0.3em]">
                            <tr>
                                <th className="px-10 py-7">{t('users.name')}</th>
                                <th className="px-10 py-7">{t('users.role')}</th>
                                <th className="px-10 py-7">{t('users.company')}</th>
                                <th className="px-10 py-7">{t('users.status')}</th>
                                <th className="px-10 py-7 text-right">AÇÕES</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.03]">
                            {filteredUsers.map(u => (
                                <tr key={u.id} className="group hover:bg-white/[0.01] transition-colors">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-premium-gradient flex items-center justify-center text-white font-black text-sm shadow-lg border border-white/10 group-hover:scale-105 transition-transform">
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-black text-white tracking-tight uppercase italic">{u.name}</p>
                                                <p className="text-[11px] text-white/30 font-mono mt-0.5">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${u.role === UserRole.DIRECTOR ? 'bg-lomuz-imperial/10 text-lomuz-imperial border-lomuz-imperial/20' : 'bg-white/5 text-white/40 border-white/10'}`}>
                                            {u.role === UserRole.DIRECTOR ? t('users.roleDirector') : t('users.roleClient')}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6">
                                        {u.company ? (
                                            <div className="flex items-center gap-2 text-white/60">
                                                <Building2 size={14} className="text-lomuz-imperial/50" />
                                                <span className="text-xs font-bold uppercase tracking-tighter">{u.company}</span>
                                            </div>
                                        ) : (
                                            <span className="text-white/10 font-mono text-[10px]">--</span>
                                        )}
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-2 text-[#009B4D] text-[10px] font-black uppercase tracking-tighter">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#009B4D] shadow-[0_0_8px_rgba(0,155,77,0.6)]" />
                                            {t('users.active')}
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            <button 
                                                onClick={() => copyToClipboard(u.email)}
                                                className="p-3 hover:bg-white/5 rounded-xl text-white/20 hover:text-white transition-colors"
                                                title="Copiar E-mail"
                                            >
                                                <Copy size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteUser(u.id)}
                                                className="p-3 hover:bg-rose-500/10 text-white/20 hover:text-rose-500 rounded-xl transition-colors"
                                                title="Remover"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* MODAL DE CRIAÇÃO (LOMUZ STYLE) */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-3xl animate-in fade-in duration-300">
                    <div className="bg-[#0D0D16] border border-white/5 w-full max-w-xl rounded-[48px] flex flex-col animate-in zoom-in-95 duration-300 shadow-huge overflow-hidden">
                        <div className="p-10 border-b border-white/5 bg-black/40 rounded-t-[48px] flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">{t('users.modalTitle')}</h3>
                                <p className="text-[10px] text-lomuz-muted uppercase font-bold tracking-[0.2em] mt-1">Soberania e Acesso Seguro</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-3 hover:bg-white/5 rounded-2xl text-white/20 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateUser} className="p-10 space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-lomuz-muted tracking-widest ml-1">Nome Completo</label>
                                <div className="relative group">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-lomuz-imperial transition-colors" size={20} />
                                    <input 
                                        required
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white focus:border-lomuz-imperial outline-none transition-all font-bold text-sm"
                                        placeholder="Ex: João da Silva"
                                        value={newUser.name}
                                        onChange={e => setNewUser({...newUser, name: e.target.value})}
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-lomuz-muted tracking-widest ml-1">{t('users.email')}</label>
                                <div className="relative group">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-lomuz-imperial transition-colors" size={20} />
                                    <input 
                                        required
                                        type="email"
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white focus:border-lomuz-imperial outline-none transition-all font-bold text-sm"
                                        placeholder="email@empresa.com"
                                        value={newUser.email}
                                        onChange={e => setNewUser({...newUser, email: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-lomuz-muted tracking-widest ml-1">{t('users.password')}</label>
                                <div className="flex gap-3">
                                    <div className="relative flex-1 group">
                                        <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-lomuz-imperial transition-colors" size={20} />
                                        <input 
                                            required
                                            type="text"
                                            className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white focus:border-lomuz-imperial outline-none transition-all font-mono font-bold text-sm"
                                            value={newUser.password}
                                            onChange={e => setNewUser({...newUser, password: e.target.value})}
                                        />
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={generatePassword}
                                        className="px-6 bg-white/5 border border-white/10 rounded-2xl text-lomuz-imperial hover:bg-lomuz-imperial/10 transition-all"
                                        title="Gerar senha segura"
                                    >
                                        <RefreshCw size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-lomuz-muted tracking-widest ml-1">Tipo de Perfil</label>
                                    <select 
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-5 text-white focus:border-lomuz-imperial outline-none appearance-none font-black text-xs uppercase tracking-widest cursor-pointer"
                                        value={newUser.role}
                                        onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
                                    >
                                        <option className="bg-[#0D0D16]" value={UserRole.CLIENT}>Cliente / Unidade</option>
                                        <option className="bg-[#0D0D16]" value={UserRole.DIRECTOR}>Diretor / Geral</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-lomuz-muted tracking-widest ml-1">Empresa</label>
                                    <input 
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white focus:border-lomuz-imperial outline-none font-bold text-sm"
                                        placeholder="Lomuz Network"
                                        value={newUser.company}
                                        onChange={e => setNewUser({...newUser, company: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-16 rounded-3xl text-[11px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all">Cancelar</button>
                                <Button type="submit" variant="primary" isLoading={loading} className="flex-1 h-16 rounded-3xl shadow-glow uppercase font-black tracking-widest text-[11px] italic">Autorizar Membro</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE SUCESSO (CREDENCIAIS) */}
            {successModal.show && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500">
                    <div className="bg-[#0D0D16] border border-white/10 w-full max-w-md rounded-[56px] p-12 text-center shadow-huge relative animate-in zoom-in-95 duration-300">
                        <div className="w-24 h-24 bg-green-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-8 text-green-500 shadow-glow-accent border border-green-500/20">
                            <ShieldCheck size={48} />
                        </div>
                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-3">{t('users.successAdd')}</h3>
                        <p className="text-xs text-lomuz-muted font-medium mb-10 leading-relaxed">
                            {t('users.successAddDesc')}
                        </p>
                        
                        <div className="bg-black/60 rounded-[32px] p-8 mb-10 text-left space-y-6 border border-white/5 shadow-inner">
                            {successModal.publicId && (
                                <div>
                                    <label className="text-[9px] font-black uppercase text-lomuz-muted tracking-[0.2em] block mb-3">ID PÚBLICO (LOGIN)</label>
                                    <div className="flex justify-between items-center text-lomuz-imperial font-mono font-black bg-white/[0.02] p-4 rounded-2xl border border-white/5 group">
                                        <span className="text-lg">{successModal.publicId}</span>
                                        <button onClick={() => copyToClipboard(successModal.publicId)} className="p-2 hover:bg-white/5 rounded-lg text-white/20 hover:text-white transition-all"><Copy size={16} /></button>
                                    </div>
                                </div>
                            )}
                            <div>
                                <label className="text-[9px] font-black uppercase text-lomuz-muted tracking-[0.2em] block mb-3">E-MAIL DE ACESSO</label>
                                <div className="text-white text-sm font-black truncate bg-white/[0.02] p-4 rounded-2xl border border-white/5">{successModal.email}</div>
                            </div>
                            <div>
                                <label className="text-[9px] font-black uppercase text-lomuz-muted tracking-[0.2em] block mb-3">SENHA TEMPORÁRIA</label>
                                <div className="flex justify-between items-center text-white font-mono font-black bg-white/[0.02] p-4 rounded-2xl border border-white/5 group">
                                    <span className="text-lg tracking-widest">{successModal.pass}</span>
                                    <button onClick={() => copyToClipboard(successModal.pass)} className="p-2 hover:bg-white/5 rounded-lg text-white/20 hover:text-white transition-all"><Copy size={16} /></button>
                                </div>
                            </div>
                        </div>

                        <Button onClick={() => setSuccessModal({ show: false })} variant="primary" className="w-full h-16 text-xs font-black uppercase tracking-[0.3em] rounded-3xl shadow-glow italic">
                            {t('common.close')}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;
