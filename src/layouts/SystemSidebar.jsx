import React, { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  Smartphone, 
  LayoutDashboard, 
  PlusCircle, 
  Kanban, 
  Package, 
  DollarSign, 
  LogOut, 
  ShieldCheck, 
  ChevronRight, 
  Bot, 
  Users, 
  Settings, 
  Store, 
  Building2, 
  User, 
  ArrowRight, 
  CreditCard, 
  Gift, 
  HelpCircle,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { VERSION } from '../lib/version';

export default function SystemSidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isSuperadmin = user?.cargo === 'superadmin';

  // Fecha o drawer automaticamente ao mudar de rota no mobile
  useEffect(() => {
    if (isOpen && onClose) {
      onClose();
    }
  }, [location.pathname]);

  // Trava o scroll do body quando o menu mobile está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const navItems = [
    { label: 'Dashboard', path: '/system', icon: LayoutDashboard, tourKey: 'dashboard' },
    { label: 'Nova O.S. Blindada', path: '/system/os/nova', icon: PlusCircle, highlight: true, tourKey: 'nova-os' },
    { label: 'Ordens & Kanban', path: '/system/os', icon: Kanban, tourKey: 'ordens-kanban' },
    { label: 'Filiais & Lojas', path: '/system/lojas', icon: Store, tourKey: 'filiais-lojas' },
    { label: 'Técnicos & Comissões', path: '/system/tecnicos', icon: Users, tourKey: 'tecnicos-comissoes' },
    { label: 'Automações WhatsApp', path: '/system/automacoes', icon: Bot, tourKey: 'automacoes-whatsapp' },
    { label: 'Estoque Triplo', path: '/system/estoque', icon: Package, tourKey: 'estoque-triplo' },
    { label: 'Frente de Caixa', path: '/system/caixa', icon: DollarSign, tourKey: 'frente-caixa' },
    { label: 'Minha Assinatura', path: '/system/assinatura', icon: CreditCard, tourKey: 'minha-assinatura' },
    { label: 'Indique e Ganhe', path: '/system/indicar', icon: Gift, tourKey: 'indique-ganhe' },
    { label: 'Suporte Técnico', path: '/system/suporte', icon: HelpCircle, tourKey: 'suporte-tecnico' },
    { label: 'Configurações', path: '/system/configuracoes', icon: Settings, tourKey: 'configuracoes' },
    { label: 'Meu Perfil', path: '/system/perfil', icon: User, tourKey: 'meu-perfil' },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full min-h-full">
      <div className="overflow-y-auto flex-1">
        {/* Brand Header */}
        <div className="h-16 md:h-20 flex items-center justify-between px-6 border-b border-slate-800/80 sticky top-0 bg-[#050914] z-10">
          <NavLink to={isSuperadmin ? "/admin/saas" : "/system"} className="flex items-center space-x-3 group">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-300/40">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-0.5 font-mono">
                Easy<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Cell</span>
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-cyan-400 -mt-1">
                {isSuperadmin ? 'Visão da Bancada' : 'Painel Operacional'}
              </span>
            </div>
          </NavLink>

          {/* Botão de Fechar no Mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800/60 transition cursor-pointer"
              title="Fechar Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Card Destaque: Retorno ao Super Admin SaaS se logado como SuperAdmin */}
        {isSuperadmin && (
          <div className="p-4 pb-1">
            <NavLink
              to="/admin/saas"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-slate-900 border border-cyan-500/40 hover:border-cyan-400 group transition-all shadow-md shadow-cyan-500/5 hover:scale-[1.02] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center border border-cyan-500/30 group-hover:bg-cyan-500/25">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-black text-white group-hover:text-cyan-300 flex items-center gap-1">
                    Super Admin SaaS
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-cyan-400" />
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono">Controle da Plataforma</div>
                </div>
              </div>
            </NavLink>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="p-4 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {isSuperadmin ? 'Menu da Assistência (Visão Cliente)' : 'Navegação Principal'}
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/system'}
                data-tour={item.tourKey}
                className={({ isActive }) => `
                  flex items-center justify-between px-3.5 py-2.5 md:py-3 rounded-xl text-xs font-semibold transition-all group
                  ${item.highlight ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/10 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400' : ''}
                  ${isActive && !item.highlight ? 'bg-slate-800/90 text-cyan-400 border border-slate-700/80 shadow-md shadow-cyan-500/5' : ''}
                  ${!isActive && !item.highlight ? 'text-slate-400 hover:text-white hover:bg-slate-900/60' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${item.highlight ? 'text-cyan-400' : 'group-hover:text-cyan-400'} transition-colors`} />
                  <span>{item.label}</span>
                </div>
                {item.highlight && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-400 text-black uppercase tracking-wider">
                    Balcão
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Card, Tutorial & Logout */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 shrink-0">
        {/* Botão de Tutorial Fixo na Barra Lateral */}
        <button
          type="button"
          onClick={() => {
            if (onClose) onClose();
            window.dispatchEvent(new CustomEvent('easycell_open_tour'));
          }}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-cyan-300 bg-slate-900/60 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer mb-2.5 group"
        >
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
            <span>Tutorial do Sistema</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-mono bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
            Guia
          </span>
        </button>

        <NavLink
          to="/system/perfil"
          className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 transition-all mb-2 group cursor-pointer"
        >
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-xs font-mono group-hover:scale-105 transition-transform">
              {user?.nome?.[0] || 'V'}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate group-hover:text-cyan-400 transition-colors">{user?.nome || 'Operador'}</div>
              <div className="text-[10px] text-slate-400 capitalize flex items-center gap-1">
                <span>{user?.cargo || 'Atendente'}</span>
                <span className="text-cyan-400 font-semibold">• Perfil</span>
              </div>
            </div>
          </div>
        </NavLink>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair da Sessão</span>
        </button>

        <div className="mt-2 text-center text-[10px] text-slate-500 font-mono">
          EasyCell <span className="text-cyan-400 opacity-60">{VERSION}</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop Sidebar (Fixo e Visível apenas em Telas Médias/Grandes) */}
      <aside className="hidden md:flex w-64 bg-[#050914] border-r border-slate-800/80 flex-col justify-between shrink-0 min-h-screen sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* 2. Mobile Drawer Slide-Over (Ativo sob demanda no celular) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Escurecido com Blur */}
          <div 
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          />

          {/* Gaveta Lateral Deslizante */}
          <aside className="relative w-72 max-w-[85vw] bg-[#050914] border-r border-slate-800/80 shadow-2xl z-10 flex flex-col h-full animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
