import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle, KeyRound, Sparkles } from 'lucide-react';
import { SignIn } from '@clerk/react';
import { useAuth } from '../../context/AuthContext';
import { VERSION } from '../../lib/version';

export default function LoginPage() {
  const [modoAuth, setModoAuth] = useState('clerk'); // 'clerk' | 'bancada'
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redireciona imediatamente se já estiver logado
  useEffect(() => {
    if (isAuthenticated) {
      if (user?.cargo === 'superadmin') {
        navigate('/admin/saas');
      } else {
        navigate('/system');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmitLegado = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const res = await login(email, senha);
      if (res && res.success) {
        if (res.user?.cargo === 'superadmin') {
          navigate('/admin/saas');
        } else {
          navigate('/system');
        }
      } else {
        setErro(res?.message || 'Credenciais inválidas');
      }
    } catch (err) {
      setErro('Erro de conexão ao processar login.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030611] text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-sans selection:bg-cyan-500 selection:text-black">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/20 via-blue-600/15 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />

      {/* Card de Login */}
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <a href="/" className="inline-flex items-center space-x-3 mb-4 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 border border-cyan-300/40">
              <Smartphone className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1 font-mono">
                Easy<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 glow-text-cyan">Cell</span>
                <span className="text-[10px] text-cyan-400/60 font-mono tracking-normal ml-1">({VERSION})</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 -mt-1">Smart OS Bancada</span>
            </div>
          </a>
          <h2 className="text-xl font-bold text-white">Portal de Acesso Seguro</h2>
          <p className="text-xs text-slate-400 mt-1">Autenticação com criptografia ponta a ponta</p>
        </div>

        {/* Seletor de Modo: Clerk SSO vs Bancada Offline */}
        <div className="flex items-center p-1 bg-slate-900/90 rounded-2xl border border-slate-800 mb-6 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setModoAuth('clerk')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              modoAuth === 'clerk'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Clerk Auth (SSO)</span>
          </button>
          <button
            type="button"
            onClick={() => setModoAuth('bancada')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              modoAuth === 'bancada'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Senha Bancada</span>
          </button>
        </div>

        {modoAuth === 'clerk' ? (
          <div className="flex justify-center w-full">
            <SignIn 
              routing="hash"
              fallbackRedirectUrl="/system"
              signUpUrl="/admin#signup"
            />
          </div>
        ) : (
          <div className="glass-panel p-8 rounded-3xl border border-cyan-500/40 shadow-2xl backdrop-blur-2xl">
            {erro && (
              <div className="mb-5 p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{erro}</span>
              </div>
            )}

            <form onSubmit={handleSubmitLegado} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">E-mail Operacional</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@easycell.com.br"
                    className="w-full bg-slate-950/90 text-white placeholder-slate-500 pl-11 pr-4 py-3.5 rounded-xl text-sm border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-cyan-400 font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Senha de Bancada</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/90 text-white placeholder-slate-500 pl-11 pr-4 py-3.5 rounded-xl text-sm border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-cyan-400 font-medium transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm transition-all shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {carregando ? 'Acessando...' : 'Entrar na Bancada'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800 text-center">
              <div className="inline-flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
                <ShieldCheck className="w-4 h-4" />
                <span>Autenticação Local com Scrypt KDF Ativa</span>
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-6">
          <a href="/" className="text-xs text-slate-400 hover:text-cyan-400 transition-colors">
            ← Voltar para a Landing Page
          </a>
        </div>
      </div>
    </div>
  );
}
