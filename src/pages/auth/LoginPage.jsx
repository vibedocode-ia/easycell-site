import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, Lock, Mail, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { VERSION } from '../../lib/version';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redireciona imediatamente se já estiver logado
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/system');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const res = await login(email, senha);
      if (res && res.success) {
        navigate('/system');
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
    <div className="min-h-screen bg-[#030611] text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans selection:bg-cyan-500 selection:text-black">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-500/20 via-blue-600/15 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" />

      {/* Card de Login */}
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
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
          <h2 className="text-xl font-bold text-white">Portal de Acesso Operacional</h2>
          <p className="text-xs text-slate-400 mt-1">Entre com sua credencial de atendente ou técnico de bancada</p>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-cyan-500/40 shadow-2xl backdrop-blur-2xl">
          {erro && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">E-mail ou Usuário</label>
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
              <label className="block text-xs font-semibold text-slate-300 mb-2">Senha de Acesso</label>
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

            <div className="flex items-center justify-between text-xs text-slate-400">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-cyan-400" />
                <span>Lembrar credencial</span>
              </label>
              <span className="text-cyan-400 hover:underline cursor-pointer">Esqueceu a senha?</span>
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm transition-all shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {carregando ? 'Acessando Sistema...' : 'Entrar no Sistema'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <div className="inline-flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>Ambiente Criptografado & Autenticado</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-xs text-slate-400 hover:text-cyan-400 transition-colors">
            ← Voltar para a Landing Page
          </a>
        </div>
      </div>
    </div>
  );
}
