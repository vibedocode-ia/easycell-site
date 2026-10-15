import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import SystemSidebar from './SystemSidebar';
import SystemBottomNav from '../components/SystemBottomNav';
import StoreSelector from '../components/StoreSelector';
import BlockOverlay from '../components/BlockOverlay';
import TourGuiado from '../components/TourGuiado';
import { PlusCircle, Search, Building2, HelpCircle, Menu, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SystemLayout() {
  const { user } = useAuth();
  const isSuperadmin = user?.cargo === 'superadmin';
  const [subStatus, setSubStatus] = useState('active');
  const [mobileMenuAberto, setMobileMenuAberto] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('easycell_auth_token') || sessionStorage.getItem('easycell_auth_token');
    if (token) {
      fetch('/api/v1/billing/subscription', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.subscription?.status) setSubStatus(d.subscription.status);
        })
        .catch(() => {});
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-[#030611] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Overlay de Inadimplência e Bloqueio Suave (ativo se past_due ou suspended) */}
      <BlockOverlay status={subStatus} onQuitado={() => setSubStatus('active')} />

      {/* Tour Guiado Interativo para novos usuários e disponível sob demanda */}
      <TourGuiado />

      {/* Sidebar Desktop e Drawer Mobile Slide-over */}
      <SystemSidebar 
        isOpen={mobileMenuAberto} 
        onClose={() => setMobileMenuAberto(false)} 
      />

      {/* Área Principal de Conteúdo */}
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
        {/* Top Header Responsivo */}
        <header className="h-16 md:h-20 border-b border-slate-800/80 bg-[#030611]/85 backdrop-blur-md px-3.5 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2.5 sm:gap-4 flex-1 min-w-0 max-w-xl">
            {/* Botão Hambúrguer Mobile para abrir o menu completo */}
            <button
              type="button"
              onClick={() => setMobileMenuAberto(true)}
              className="md:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition active:scale-95 cursor-pointer shrink-0"
              title="Abrir Menu Principal"
            >
              <Menu className="w-5 h-5 text-cyan-400" />
            </button>

            {/* Logo compacto no mobile quando a sidebar está oculta */}
            <div className="md:hidden flex items-center gap-1.5 shrink-0 mr-1">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-sm">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
            </div>

            <StoreSelector />

            <div className="relative w-full max-w-sm hidden md:block">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar O.S. (#1001), IMEI ou Cliente..."
                className="w-full bg-slate-900/80 text-xs text-white placeholder-slate-500 pl-10 pr-4 py-2 rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-medium"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Botão de Acesso Permanente ao Tutorial do Sistema */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('easycell_open_tour'))}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-950/20 text-slate-300 hover:text-cyan-300 font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer group"
              title="Abrir Tutorial Guiado do Sistema"
            >
              <HelpCircle className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">Tutorial</span>
            </button>

            {/* Banner/Botão para SuperAdmin alternar de volta ao controle SaaS */}
            {isSuperadmin && (
              <NavLink
                to="/admin/saas"
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500/15 via-blue-600/15 to-indigo-600/10 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-bold text-xs transition-all shadow-md shadow-cyan-500/5 active:scale-95 cursor-pointer group"
                title="Voltar ao Painel Master de Gestão da Plataforma SaaS"
              >
                <Building2 className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Super Admin</span>
              </NavLink>
            )}

            {/* No Desktop: Botão Nova O.S. no Header. No Mobile: Botão já está em destaque na barra inferior */}
            <NavLink
              to="/system/os/nova"
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nova O.S. Blindada</span>
            </NavLink>
          </div>
        </header>

        {/* View da Rota Ativa com padding inferior protegido para a Bottom Navigation Bar no mobile */}
        <main className="flex-1 p-3.5 sm:p-6 md:p-8 pb-28 md:pb-8 overflow-y-auto w-full min-w-0 max-w-full">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation Bar Flutuante Exclusiva para Mobile (App Nativo UX) */}
      <SystemBottomNav onOpenMenu={() => setMobileMenuAberto(true)} />
    </div>
  );
}
