import React, { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./ui";

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#05030B] text-white p-6 text-center">
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 border border-rose-500/20">
            <AlertTriangle size={40} className="text-rose-500" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Ops! Algo deu errado.</h1>
          <p className="text-slate-400 mb-6 max-w-md">
            O sistema encontrou um erro inesperado. Tente recarregar a página.
          </p>
          <div className="bg-slate-900/50 p-4 rounded-lg border border-white/10 mb-6 max-w-lg w-full overflow-auto text-left">
             <code className="text-xs text-rose-300 font-mono">
                {this.state.error?.message}
             </code>
          </div>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw size={16} className="mr-2" /> Recarregar Aplicação
          </Button>
        </div>
      );
    }

    // Cast 'this' to 'any' to bypass strict TS check where 'props' is occasionally reported missing on subclass
    return (this as any).props.children;
  }
}

export default ErrorBoundary;