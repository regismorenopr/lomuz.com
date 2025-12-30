
import React, { useState } from 'react';
import { useTranslation } from '../../contexts/I18nContext';
import { ApiService } from '../../services/mockApi';
import { RegisterPayload } from '../../types';
import { Button } from '../../components/ui';
import { ArrowLeft, CheckCircle, Mail, User, Building2, Phone, Shield, Copy, Lock, Eye, EyeOff } from 'lucide-react';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import ThemeSwitcher from '../../components/ThemeSwitcher';

interface RegisterProps {
    onNavigate: (page: string) => void;
}

const Register: React.FC<RegisterProps> = ({ onNavigate }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<RegisterPayload>({
        fullName: '',
        email: '',
        password: '',
        companyName: '',
        phone: '',
        acceptedTerms: false
    });
    
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const [createdCredentials, setCreatedCredentials] = useState<{id?: string}>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        if (!formData.password || formData.password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres.");
            return;
        }

        if (formData.password !== confirmPassword) {
            setError("As senhas não coincidem.");
            return;
        }

        if(!formData.acceptedTerms) {
            setError("É necessário aceitar os termos de uso.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await ApiService.registerDirector(formData);
            setCreatedCredentials({ id: response.user.email });
            setIsSuccess(true);
        } catch (e: any) {
            setError(e.message || "Erro ao realizar cadastro. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen relative flex items-center justify-center p-4 bg-lomuz-bg">
                 <div className="relative z-10 max-w-md w-full glass-panel rounded-3xl p-10 text-center border border-[#009B4D]/30 shadow-xl animate-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-[#009B4D]/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <CheckCircle size={40} className="text-[#009B4D]" />
                    </div>
                    <h2 className="text-3xl font-bold text-lomuz-text mb-2">Conta Criada!</h2>
                    <p className="text-lomuz-muted mb-6">Sua conta de diretor foi configurada com sucesso.</p>
                    
                    <div className="bg-lomuz-bg-alt border border-lomuz-border p-6 rounded-2xl w-full mb-8 relative overflow-hidden text-left">
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-lomuz-subtle mb-1 block">Seu Login</label>
                                <div className="flex items-center justify-between bg-lomuz-input p-3 rounded-lg border border-lomuz-border">
                                    <span className="text-lomuz-imperial font-mono font-bold text-lg truncate">{createdCredentials.id}</span>
                                    <Copy size={16} className="text-lomuz-muted hover:text-lomuz-text cursor-pointer" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <Button onClick={() => onNavigate('login')} className="w-full">
                        Acessar Área do Diretor
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 bg-lomuz-bg overflow-y-auto">
             <div className="absolute top-6 right-6 z-50 flex gap-2">
                <ThemeSwitcher />
                <LanguageSwitcher variant="pill" />
             </div>

             <div className="relative z-10 max-w-lg w-full glass-panel rounded-3xl border border-lomuz-border shadow-2xl my-8">
                 <div className="p-8 border-b border-lomuz-border bg-lomuz-bg-alt/50 rounded-t-3xl">
                     <button onClick={() => onNavigate('login')} className="flex items-center gap-2 text-lomuz-muted hover:text-lomuz-imperial transition-colors mb-4 text-sm font-medium">
                         <ArrowLeft size={16} /> Voltar para Login
                     </button>
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-lomuz-imperial/20 rounded-lg text-lomuz-imperial"><Shield size={24} /></div>
                        <div>
                            <h1 className="text-2xl font-bold text-lomuz-text">Criar Conta de Diretor</h1>
                            <p className="text-lomuz-muted text-xs">Gestão completa para suas rádios</p>
                        </div>
                     </div>
                 </div>

                 <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
                            <Shield size={16} /> {error}
                        </div>
                    )}

                     <div className="space-y-1">
                         <label className="text-xs font-bold text-lomuz-muted uppercase ml-1">Nome Completo *</label>
                         <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-lomuz-muted" size={18} />
                            <input 
                                required
                                type="text" 
                                className="w-full bg-lomuz-input border border-lomuz-border rounded-xl py-3 pl-12 pr-4 text-lomuz-text focus:outline-none focus:border-lomuz-imperial transition-colors"
                                placeholder="Seu nome"
                                value={formData.fullName}
                                onChange={e => setFormData({...formData, fullName: e.target.value})}
                            />
                         </div>
                     </div>

                     <div className="space-y-1">
                         <label className="text-xs font-bold text-lomuz-muted uppercase ml-1">E-mail Corporativo *</label>
                         <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-lomuz-muted" size={18} />
                            <input 
                                required
                                type="email" 
                                className="w-full bg-lomuz-input border border-lomuz-border rounded-xl py-3 pl-12 pr-4 text-lomuz-text focus:outline-none focus:border-lomuz-imperial transition-colors"
                                placeholder="seu@empresa.com"
                                value={formData.email}
                                onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                         </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-lomuz-muted uppercase ml-1">Senha *</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-lomuz-muted" size={18} />
                                <input 
                                    required
                                    type={showPassword ? "text" : "password"}
                                    className="w-full bg-lomuz-input border border-lomuz-border rounded-xl py-3 pl-12 pr-10 text-lomuz-text focus:outline-none focus:border-lomuz-imperial transition-colors"
                                    placeholder="••••••"
                                    value={formData.password}
                                    onChange={e => setFormData({...formData, password: e.target.value})}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-lomuz-muted hover:text-lomuz-text"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-lomuz-muted uppercase ml-1">Confirmar Senha *</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-lomuz-muted" size={18} />
                                <input 
                                    required
                                    type={showConfirmPassword ? "text" : "password"}
                                    className={`w-full bg-lomuz-input border rounded-xl py-3 pl-12 pr-10 text-lomuz-text focus:outline-none transition-colors ${confirmPassword && confirmPassword !== formData.password ? 'border-red-500/50 focus:border-red-500' : 'border-lomuz-border focus:border-lomuz-imperial'}`}
                                    placeholder="••••••"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-lomuz-muted hover:text-lomuz-text"
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-lomuz-muted uppercase ml-1">Organização/Rede</label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-lomuz-muted" size={18} />
                                <input 
                                    type="text" 
                                    className="w-full bg-lomuz-input border border-lomuz-border rounded-xl py-3 pl-12 pr-4 text-lomuz-text focus:outline-none focus:border-lomuz-imperial transition-colors"
                                    placeholder="Nome da Empresa"
                                    value={formData.companyName}
                                    onChange={e => setFormData({...formData, companyName: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-lomuz-muted uppercase ml-1">Telefone</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-lomuz-muted" size={18} />
                                <input 
                                    type="text" 
                                    className="w-full bg-lomuz-input border border-lomuz-border rounded-xl py-3 pl-12 pr-4 text-lomuz-text focus:outline-none focus:border-lomuz-imperial transition-colors"
                                    placeholder="(00) 00000-0000"
                                    value={formData.phone}
                                    onChange={e => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                        </div>
                     </div>

                     <div className="pt-2">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.acceptedTerms ? 'bg-lomuz-imperial border-lomuz-imperial' : 'border-lomuz-border bg-lomuz-input group-hover:border-lomuz-imperial'}`}>
                                {formData.acceptedTerms && <CheckCircle size={14} className="text-white" />}
                            </div>
                            <input 
                                type="checkbox" 
                                className="hidden" 
                                checked={formData.acceptedTerms}
                                onChange={e => setFormData({...formData, acceptedTerms: e.target.checked})}
                            />
                            <span className="text-sm text-lomuz-muted group-hover:text-lomuz-text transition-colors">
                                Li e aceito os <span className="text-lomuz-imperial underline">Termos de Uso</span> para diretores.
                            </span>
                        </label>
                     </div>

                     <Button 
                        type="submit" 
                        isLoading={isLoading} 
                        className="w-full py-4 text-lg mt-4 shadow-lg h-14"
                     >
                         Criar Conta Grátis
                     </Button>
                 </form>
             </div>
        </div>
    );
};

export default Register;
