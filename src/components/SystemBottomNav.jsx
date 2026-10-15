import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Kanban, 
  Plus, 
  DollarSign, 
  Menu,
  Sparkles
} from 'lucide-react';

export default function SystemBottomNav({ onOpenMenu }) {
  const location = useLocation();
  const pathname = location.pathname;

  const isActive = (path) => {
    if (path === '/system') return pathname === '/system';
    return pathname.startsWith(path);
  };

  return (
    <nav 
      aria-label="Navegação Inferior Mobile"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050914]/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.7)]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto relative">
        {/* 1. Início / Dashboard */}
        <NavLink
          to="/system"
          end
          className={({ isActive: linkActive }) => `
            flex flex-col items-center justify-center min-w-[56px] py-1 px-1 rounded-xl transition-all select-none active:scale-90
            ${linkActive 
              ? 'text-cyan-400 font-bold' 
              : 'text-slate-400 hover:text-slate-200 font-medium'
            }
          `}
        >
          <div className="relative">
            <LayoutDashboard className="w-5 h-5 transition-transform" />
            {isActive('/system') && pathname === '/system' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Início</span>
        </NavLink>

        {/* 2. Ordens & Kanban */}
        <NavLink
          to="/system/os"
          className={({ isActive: linkActive }) => `
            flex flex-col items-center justify-center min-w-[56px] py-1 px-1 rounded-xl transition-all select-none active:scale-90
            ${linkActive 
              ? 'text-cyan-400 font-bold' 
              : 'text-slate-400 hover:text-slate-200 font-medium'
            }
          `}
        >
          <div className="relative">
            <Kanban className="w-5 h-5 transition-transform" />
            {isActive('/system/os') && !pathname.includes('/nova') && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Bancada</span>
        </NavLink>

        {/* 3. Destaque Central: Nova O.S. Blindada (Hero Floating Button) */}
        <NavLink
          to="/system/os/nova"
          className="group relative -mt-5 flex flex-col items-center justify-center select-none active:scale-95 transition-transform"
          title="Abrir Nova Ordem de Serviço"
        >
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 p-[1.5px] shadow-lg shadow-cyan-500/40 hover:shadow-cyan-400/60 transition-shadow">
            <div className="w-full h-full rounded-[14px] bg-slate-950/20 backdrop-blur-sm flex items-center justify-center text-white group-hover:scale-105 transition-transform">
              <Plus className="w-7 h-7 stroke-[2.5] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]" />
            </div>
          </div>
          <span className="text-[10px] font-black text-cyan-300 mt-1 drop-shadow tracking-tight flex items-center gap-0.5">
            Nova O.S.
          </span>
        </NavLink>

        {/* 4. Frente de Caixa (PDV) */}
        <NavLink
          to="/system/caixa"
          className={({ isActive: linkActive }) => `
            flex flex-col items-center justify-center min-w-[56px] py-1 px-1 rounded-xl transition-all select-none active:scale-90
            ${linkActive 
              ? 'text-cyan-400 font-bold' 
              : 'text-slate-400 hover:text-slate-200 font-medium'
            }
          `}
        >
          <div className="relative">
            <DollarSign className="w-5 h-5 transition-transform" />
            {isActive('/system/caixa') && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Caixa</span>
        </NavLink>

        {/* 5. Menu Completo / Mais Opções (Abre Drawer Lateral) */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center min-w-[56px] py-1 px-1 rounded-xl text-slate-400 hover:text-slate-200 transition-all select-none active:scale-90 cursor-pointer"
          title="Ver todos os módulos do sistema"
        >
          <div className="relative">
            <Menu className="w-5 h-5 transition-transform" />
          </div>
          <span className="text-[10px] mt-1 font-medium tracking-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
}
