import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Building2, 
  Layers, 
  Plus, 
  DollarSign, 
  Menu
} from 'lucide-react';

export default function SaasBottomNav({ onOpenMenu, onNovoTenant }) {
  const location = useLocation();
  const pathname = location.pathname;

  const isActive = (path) => {
    if (path === '/admin/saas') return pathname === '/admin/saas';
    return pathname.startsWith(path);
  };

  const handleActionCenter = () => {
    if (typeof onNovoTenant === 'function') {
      onNovoTenant();
    } else {
      window.dispatchEvent(new CustomEvent('easycell_open_novo_tenant'));
    }
  };

  return (
    <nav 
      aria-label="Navegação Inferior Super Admin SaaS"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050914]/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_rgba(0,0,0,0.7)]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto relative">
        {/* 1. Início / Inquilinos */}
        <NavLink
          to="/admin/saas"
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
            <Building2 className="w-5 h-5 transition-transform" />
            {isActive('/admin/saas') && pathname === '/admin/saas' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Tenants</span>
        </NavLink>

        {/* 2. Criador de Planos */}
        <NavLink
          to="/admin/saas/planos"
          className={({ isActive: linkActive }) => `
            flex flex-col items-center justify-center min-w-[56px] py-1 px-1 rounded-xl transition-all select-none active:scale-90
            ${linkActive 
              ? 'text-cyan-400 font-bold' 
              : 'text-slate-400 hover:text-slate-200 font-medium'
            }
          `}
        >
          <div className="relative">
            <Layers className="w-5 h-5 transition-transform" />
            {isActive('/admin/saas/planos') && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Planos</span>
        </NavLink>

        {/* 3. Destaque Central: Novo Tenant (Hero Floating Button) */}
        <button
          type="button"
          onClick={handleActionCenter}
          className="group relative -mt-5 flex flex-col items-center justify-center select-none active:scale-95 transition-transform cursor-pointer"
          title="Cadastrar Nova Assistência (Tenant)"
        >
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 p-[1.5px] shadow-lg shadow-cyan-500/40 hover:shadow-cyan-400/60 transition-shadow">
            <div className="w-full h-full rounded-[14px] bg-slate-950/20 backdrop-blur-sm flex items-center justify-center text-white group-hover:scale-105 transition-transform">
              <Plus className="w-7 h-7 stroke-[2.5] text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]" />
            </div>
          </div>
          <span className="text-[10px] font-black text-cyan-300 mt-1 drop-shadow tracking-tight flex items-center gap-0.5">
            Novo Tenant
          </span>
        </button>

        {/* 4. Gerenciador Financeiro */}
        <NavLink
          to="/admin/saas/financeiro"
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
            {isActive('/admin/saas/financeiro') && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Financeiro</span>
        </NavLink>

        {/* 5. Menu Completo (Abre Drawer Lateral no Mobile) */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center min-w-[56px] py-1 px-1 rounded-xl transition-all select-none active:scale-90 text-slate-400 hover:text-slate-200 font-medium cursor-pointer"
          title="Abrir Menu Completo do Super Admin"
        >
          <div className="relative">
            <Menu className="w-5 h-5 transition-transform" />
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Menu</span>
        </button>
      </div>
    </nav>
  );
}
