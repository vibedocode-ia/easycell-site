import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import SystemSidebar from './SystemSidebar';
import { PlusCircle, Search, Bell } from 'lucide-react';

export default function SystemLayout() {
  return (
    <div className="flex min-h-screen bg-[#030611] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Sidebar Fixa Lateral */}
      <SystemSidebar />

      {/* Área Principal de Conteúdo */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 border-b border-slate-800/80 bg-[#030611]/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar O.S. (#1001), IMEI ou Nome do Cliente..."
                className="w-full bg-slate-900/80 text-xs text-white placeholder-slate-500 pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NavLink
              to="/system/os/nova"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nova O.S. Blindada</span>
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
