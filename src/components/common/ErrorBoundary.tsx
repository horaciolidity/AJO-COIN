import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0F0A1C] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto text-rose-400">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-white uppercase tracking-tight">🧄 AJO COIN</h2>
              <p className="text-xs text-gray-300">
                Se detectó una interrupción temporal en la interfaz. ¡Tu progreso local está guardado y seguro!
              </p>
            </div>

            <button
              onClick={this.handleReload}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-sprout-500 to-emerald-600 text-white font-extrabold text-xs shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase"
            >
              <RefreshCw className="w-4 h-4" />
              <span>REINICIAR INTERFAZ</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
