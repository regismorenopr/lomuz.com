
import React from 'react';
import { Loader2, HelpCircle, Inbox } from 'lucide-react';
import { useTranslation } from '../contexts/I18nContext';

export const Card: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  title?: string;
  onClick?: () => void;
}> = ({ children, className = '', title, onClick }) => (
  <div 
    className={`rounded-2xl overflow-hidden text-lomuz-text border border-lomuz-border bg-lomuz-surface shadow-sm ${className}`}
    onClick={onClick}
  >
    {title && (
      <div className="px-6 py-4 border-b border-lomuz-border bg-lomuz-bg-alt/30">
        <h3 className="font-semibold text-sm tracking-wide text-lomuz-text uppercase opacity-90 flex items-center gap-2">{title}</h3>
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'floating' | 'gold';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'primary', 
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props 
}) => {
  
  const baseStyles = "inline-flex items-center justify-center font-medium tracking-wide transition-all duration-300 transform active:scale-[0.98] focus:outline-none focus-visible:ring-1 focus-visible:ring-lomuz-imperial/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:pointer-events-none rounded-xl";
  
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-premium-gradient text-white shadow-xl shadow-lomuz-imperial/20 hover:shadow-lomuz-imperial/40 border border-white/10 hover:brightness-110",
    
    // Gold agora é um roxo elétrico (accent)
    gold: "bg-accent-gradient text-white font-bold border border-white/20 hover:brightness-110 shadow-glow-accent",

    secondary: "bg-lomuz-surface hover:bg-lomuz-surface-hover text-lomuz-text border border-lomuz-border hover:border-lomuz-imperial/30",
    
    danger: "bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 hover:border-rose-500/30",
    
    ghost: "bg-transparent hover:bg-lomuz-surface text-lomuz-muted hover:text-lomuz-text",
    
    floating: "fixed bottom-8 right-8 w-14 h-14 rounded-full bg-premium-gradient text-white shadow-xl shadow-lomuz-imperial/40 z-50 p-0 hover:scale-105 border border-white/10"
  };

  const sizes: Record<ButtonSize, string> = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-5 text-sm gap-2",
      lg: "h-12 px-8 text-base gap-3"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${variant !== 'floating' ? sizes[size] : ''} ${className}`} 
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
          <Loader2 className={`animate-spin ${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} />
      ) : (
          <>
            {leftIcon && <span className="shrink-0 opacity-90">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0 opacity-90">{rightIcon}</span>}
          </>
      )}
    </button>
  );
};

export const Badge: React.FC<{ status: string }> = ({ status }) => {
  const { t } = useTranslation();
  const statusKey = status.toLowerCase(); 

  const styles: Record<string, string> = {
    ONLINE: "bg-lomuz-imperial/10 text-lomuz-imperial border-lomuz-imperial/20 shadow-[0_0_10px_rgba(124,58,237,0.1)]", 
    OFFLINE: "bg-lomuz-surface text-lomuz-subtle border-lomuz-border",
    MAINTENANCE: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    LIVE: "bg-lomuz-imperial/20 text-white border-lomuz-imperial animate-pulse font-bold",
    ALERT: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  };

  const defaultStyle = "bg-lomuz-surface text-lomuz-muted border-lomuz-border";
  const activeStyle = styles[status] || defaultStyle;
  
  const label = t(`status.${statusKey}`) !== `status.${statusKey}` ? t(`status.${statusKey}`) : status;

  return (
    <span className={`px-2.5 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-bold border ${activeStyle}`}>
      {label}
    </span>
  );
};

export const PageHeader: React.FC<{ 
  title: string; 
  description?: string; 
  actions?: React.ReactNode 
}> = ({ title, description, actions }) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 pb-6 border-b border-lomuz-border">
    <div>
      <h2 className="text-3xl font-black text-lomuz-text tracking-tight leading-tight uppercase">{title}</h2>
      {description && <p className="text-lomuz-muted mt-2 text-sm font-light leading-relaxed max-w-2xl">{description}</p>}
    </div>
    <div className="flex items-center gap-3">
      {actions}
    </div>
  </div>
);

export const EmptyState: React.FC<{ 
  titleKey: string; 
  descKey: string; 
  actionLabelKey?: string; 
  onAction?: () => void;
}> = ({ titleKey, descKey, actionLabelKey, onAction }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center border border-dashed border-lomuz-border rounded-2xl bg-lomuz-surface/50">
      <div className="w-16 h-16 rounded-full bg-lomuz-bg flex items-center justify-center text-lomuz-muted mb-4 border border-lomuz-border">
        <Inbox size={32} />
      </div>
      <h3 className="text-lg font-bold text-lomuz-text mb-2">{t(titleKey)}</h3>
      <p className="text-lomuz-subtle max-w-sm mb-6 text-sm">{t(descKey)}</p>
      {actionLabelKey && onAction && (
        <Button onClick={onAction} variant="secondary" size="sm">
          {t(actionLabelKey)}
        </Button>
      )}
    </div>
  );
};
