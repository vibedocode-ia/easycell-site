import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  LogOut, 
  Sparkles, 
  Layers, 
  Store, 
  ArrowRight, 
  User, 
  Smartphone,
  ExternalLink,
  Activity,
  Server,
  DollarSign,
  Gift,
  HelpCircle,
  Bot
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { VERSION } from '../lib/version';

export default function SaasAdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const navItems = [
    { label: 'Visão Geral & Inquilinos', path: '/admin/saas', icon: Building2 },
    { label: 'Criador de Planos', path: '/admin/saas/planos', icon: Layers },
    { label: 'Gerenciador Financeiro', path: '/admin/saas/financeiro', icon: DollarSign },
    { label: 'CRM & Pipeline de Leads', path: '/admin/saas/crm', icon: Users },
    { label: 'Programa de Indicações', path: '/admin/saas/indicacoes', icon: Gift },
    { label: 'Central de Suporte', path: '/admin/saas/suporte', icon: HelpCircle },
    { label: 'SofIA SDR (WhatsApp)', path: '/admin/saas/sofia-sdr', icon: Bot },
    { label: 'Gestão de Filiais Globais', path: '/system/lojas', icon: Store },
    { label: 'Meu Perfil & Segurança', path: '/system/perfil', icon: User },
  ];

  return (
    <div className="flex min-h-screen bg-[#030611] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Sidebar Executiva do Super Admin SaaS */}
      <aside className="w-64 bg-[#050914] border-r border-slate-800/80 flex flex-col justify-between shrink-0 min-h-screen">
        <div>
          {/* Brand Header */}
          <div className="h-20 flex items-center px-6 border-b border-slate-800/80">
            <NavLink to="/admin/saas" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-300/40">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white flex items-center gap-1 font-mono">
                  Easy<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Cell</span>
                </span>
                <span className="text-[9px] uppercase font-bold tracking-widest text-cyan-400 -mt-1 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Super Admin SaaS
                </span>
              </div>
            </NavLink>
          </div>

          {/* Destaque: Alternar para Modo Assistência (Visão do Cliente) */}
          <div className="p-4">
            <NavLink
              to="/system"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/60 border border-cyan-500/30 hover:border-cyan-400/80 group transition-all shadow-md shadow-cyan-500/5 hover:scale-[1.02] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 group-hover:bg-cyan-500/20">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-cyan-300 flex items-center gap-1">
                    Visão do Cliente
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <div className="text-[10px] text-slate-400">Painel da Assistência</div>
                </div>
              </div>
            </NavLink>
          </div>

          {/* Menu de Navegação Executiva */}
          <nav className="px-4 space-y-1.5">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Controle da Plataforma
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin/saas'}
                  className={({ isActive }) => `
                    flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all group
                    ${isActive ? 'bg-slate-800/90 text-cyan-400 border border-slate-700/80 shadow-md shadow-cyan-500/5' : 'text-slate-400 hover:text-white hover:bg-slate-900/60'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 group-hover:text-cyan-400 transition-colors" />
                    <span>{item.label}</span>
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Rodapé: Perfil SuperAdmin & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          <NavLink
            to="/system/perfil"
            className="flex items-center space-x-3 mb-3 p-2 rounded-xl hover:bg-slate-800/50 transition-colors group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-xs font-mono shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform shrink-0">
              {user?.nome ? user.nome.slice(0, 2).toUpperCase() : 'SA'}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-bold text-slate-200 truncate group-hover:text-cyan-300">
                {user?.nome || 'Superadmin'}
              </span>
              <span className="text-[10px] text-amber-400 font-mono font-medium flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Super Admin SaaS
              </span>
            </div>
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl text-xs font-bold text-rose-400/90 hover:text-rose-300 hover:bg-rose-500/10 transition-colors border border-rose-500/20 cursor-pointer active:scale-98"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair da Sessão</span>
          </button>

          <div className="mt-3 text-center">
            <span className="text-[9px] font-mono text-slate-600">
              EasyCell Master SaaS {VERSION}
            </span>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal do SaaS */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Executivo */}
        <header className="h-20 border-b border-slate-800/80 bg-[#030611]/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="font-semibold">Cluster Multi-tenant Online</span>
            </div>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 font-mono">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>Isolamento Estrito Zero-Trust</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Botão em destaque para alternar para a visão da assistência */}
            <NavLink
              to="/system"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs transition-all cursor-pointer shadow-md active:scale-95"
            >
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>Acessar Painel da Assistência (Visão Cliente)</span>
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
            </NavLink>
          </div>
        </header>

        {/* View da Rota Ativa */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
