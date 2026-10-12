import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { VERSION } from '../lib/version';

export default function SystemSidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const navItems = [
    { label: 'Dashboard', path: '/system', icon: LayoutDashboard },
    { label: 'Nova O.S. Blindada', path: '/system/os/nova', icon: PlusCircle, highlight: true },
    { label: 'Ordens & Kanban', path: '/system/os', icon: Kanban },
    { label: 'Técnicos & Comissões', path: '/system/tecnicos', icon: Users },
    { label: 'Automações WhatsApp', path: '/system/automacoes', icon: Bot },
    { label: 'Estoque Triplo', path: '/system/estoque', icon: Package },
    { label: 'Frente de Caixa', path: '/system/caixa', icon: DollarSign },
    { label: 'Configurações', path: '/system/configuracoes', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#050914] border-r border-slate-800/80 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 border-b border-slate-800/80">
          <NavLink to="/system" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-300/40">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-0.5 font-mono">
                Easy<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Cell</span>
              </span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-cyan-400 -mt-1">Painel Operacional</span>
            </div>
          </NavLink>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Navegação Principal
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/system'}
                className={({ isActive }) => `
                  flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all group
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

      {/* User Card & Logout */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 mb-2">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs font-mono">
              {user?.nome?.[0] || 'U'}
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate">{user?.nome || 'Operador'}</div>
              <div className="text-[10px] text-slate-400 capitalize">{user?.cargo || 'Atendente'}</div>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair da Sessão</span>
        </button>

        <div className="mt-2 text-center text-[10px] text-slate-500 font-mono">
          EasyCell <span className="text-cyan-400 opacity-60">{VERSION}</span>
        </div>
      </div>
    </aside>
  );
}
