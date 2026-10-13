import React from 'react';
import { RotateCcw, AlertTriangle, Sparkles } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[EasyCell ErrorBoundary] Erro capturado:', error, errorInfo);
    
    // Se for erro de chunk ou script desatualizado por novo deploy, tenta auto-recuperar
    const errString = String(error?.message || '');
    if (
      errString.includes('dynamically imported module') ||
      errString.includes('Failed to fetch') ||
      errString.includes('Loading chunk') ||
      errString.includes('is not valid JSON')
    ) {
      const reloadCount = Number(sessionStorage.getItem('easycell_auto_recover_count') || '0');
      if (reloadCount < 2) {
        sessionStorage.setItem('easycell_auto_recover_count', String(reloadCount + 1));
        try {
          localStorage.removeItem('easycell_user');
        } catch (e) {}
        window.location.reload();
      }
    }
  }

  handleReset = () => {
    try {
      localStorage.removeItem('easycell_user');
      localStorage.removeItem('easycell_token');
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then((keys) => {
          keys.forEach((key) => caches.delete(key));
        });
      }
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-8 text-center shadow-2xl shadow-cyan-950/50 backdrop-blur-xl">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
              Nova Versão Disponível
            </h1>
            
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              O EasyCell foi atualizado no servidor com novos módulos e melhorias de segurança. 
              Clique abaixo para sincronizar seu navegador com a versão mais recente.
            </p>

            <button
              onClick={this.handleReset}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-cyan-500/25 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              Sincronizar e Abrir Agora
            </button>

            <div className="mt-6 pt-6 border-t border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-500">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500/70" />
              <span>Ambiente Protegido EasyCell • Cache Higienizado</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
