import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ClipboardList, 
  Wrench, 
  CheckCircle2, 
  DollarSign, 
  ArrowUpRight, 
  AlertTriangle,
  Smartphone,
  Eye,
  Plus,
  Sparkles,
  Trash2,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { easyCellStore } from '../../lib/store';

export default function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [stock, setStock] = useState([]);
  const [caixa, setCaixa] = useState([]);
  const [isDemoActive, setIsDemoActive] = useState(false);
  const [modalConfirmLimparDemo, setModalConfirmLimparDemo] = useState(false);

  const carregarDados = () => {
    setOrders(easyCellStore.getOrders());
    setStock(easyCellStore.getStock());
    setCaixa(easyCellStore.getCaixa());
    setIsDemoActive(easyCellStore.isDemoActive());
  };

  useEffect(() => {
    carregarDados();

    const handleAtualizacao = () => carregarDados();
    window.addEventListener('easycell_store_updated', handleAtualizacao);
    window.addEventListener('easycell_demo_cleared', handleAtualizacao);

    return () => {
      window.removeEventListener('easycell_store_updated', handleAtualizacao);
      window.removeEventListener('easycell_demo_cleared', handleAtualizacao);
    };
  }, []);

  const handleLimparDadosDemo = () => {
    easyCellStore.clearDemoData();
    setModalConfirmLimparDemo(false);
    carregarDados();
  };

  const totalOsHoje = orders.length;
  const emReparo = orders.filter(o => o.status === 'aprovado_reparo' || o.status === 'entrada').length;
  const prontos = orders.filter(o => o.status === 'pronto_retirada').length;
  const totalFaturamento = caixa.reduce((acc, c) => acc + c.valor, 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'entrada':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">Em Análise</span>;
      case 'orcamento_pendente':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30">Orçamento</span>;
      case 'aprovado_reparo':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30">Na Bancada</span>;
      case 'pronto_retirada':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 animate-pulse">Pronto</span>;
      case 'entregue_pago':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/30">Finalizado</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Banner Superior de Sinalização de Dados Demonstrativos */}
      {isDemoActive && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-cyan-950/70 via-slate-900 to-amber-950/40 border border-amber-500/40 shadow-xl shadow-amber-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 font-mono">
                  Ambiente com Dados Demonstrativos
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Modo Exemplo
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                Os registros abaixo são demonstrativos para você explorar os recursos. Você pode apagá-los a qualquer momento para iniciar com o balcão 100% zerado e pronto para atendimento real.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('easycell_open_tour'))}
              className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ver Tutorial</span>
            </button>

            <button
              type="button"
              onClick={() => setModalConfirmLimparDemo(true)}
              className="px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition shadow-md shadow-rose-500/10 flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Dados Demo</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Banner / Boas-vindas */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Visão Geral do Balcão & Bancada
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Controle integrado de ordens de serviço blindadas, peças e fechamento de caixa.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <NavLink
            to="/system/os/nova"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-500/25 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Abrir Nova O.S. (90s)</span>
          </NavLink>
        </div>
      </div>

      {/* Grid de StatCards - 100% Clicáveis e Vivos (Nenhum card é apenas informativo) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Card 1: Total de O.S. -> Leva para Ordens & Kanban */}
        <NavLink
          to="/system/os"
          className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 hover:border-cyan-400/80 hover:bg-slate-900/60 transition-all cursor-pointer group shadow-lg shadow-cyan-950/10 hover:scale-[1.02] active:scale-95 block select-none relative overflow-hidden"
          title="Ver todas as Ordens de Serviço no Kanban"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 group-hover:text-cyan-300 transition-colors">
              Total de O.S.
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all shrink-0">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono group-hover:text-cyan-400 transition-colors">
            {totalOsHoje}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
            <span>{totalOsHoje === 0 ? 'Nenhum ativo' : 'Aparelhos ativos'}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
        </NavLink>

        {/* Card 2: Na Bancada / Reparo -> Leva para Bancada Operacional */}
        <NavLink
          to="/system/os"
          className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 hover:border-blue-400/80 hover:bg-slate-900/60 transition-all cursor-pointer group shadow-lg shadow-blue-950/10 hover:scale-[1.02] active:scale-95 block select-none relative overflow-hidden"
          title="Ver ordens atualmente na bancada técnica"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 group-hover:text-blue-300 transition-colors">
              Na Bancada
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-950 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all shrink-0">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">
            {emReparo}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
            <span>Em conserto</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
        </NavLink>

        {/* Card 3: Prontos p/ Retirada -> Leva para aparelhos prontos */}
        <NavLink
          to="/system/os"
          className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 hover:border-emerald-400/80 hover:bg-slate-900/60 transition-all cursor-pointer group shadow-lg shadow-emerald-950/10 hover:scale-[1.02] active:scale-95 block select-none relative overflow-hidden"
          title="Ver aparelhos prontos para retirada e notificar cliente"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 group-hover:text-emerald-300 transition-colors">
              Prontos
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {prontos}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
            <span>Aguardando retirada</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
        </NavLink>

        {/* Card 4: Faturamento Caixa -> Leva para Frente de Caixa & Fechamento */}
        <NavLink
          to="/system/caixa"
          className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-800 hover:border-cyan-400/80 hover:bg-slate-900/60 transition-all cursor-pointer group shadow-lg shadow-cyan-950/10 hover:scale-[1.02] active:scale-95 block select-none relative overflow-hidden"
          title="Ver Frente de Caixa e Fechamento Diário"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 group-hover:text-cyan-300 transition-colors">
              Caixa Hoje
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-3xl font-black text-white font-mono truncate group-hover:text-cyan-300 transition-colors">
            R$ {(totalFaturamento / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
            <span>Recebido hoje</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
        </NavLink>
      </div>

      {/* Seção de Ordens de Serviço: Visão Compacta no Mobile (sem rolagem infinita) + Tabela Completa no Desktop */}
      <div className="glass-panel rounded-3xl border border-slate-800/80 p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              Ordens de Serviço em Andamento
              {isDemoActive && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Dados Exemplo
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 hidden sm:block">Acompanhamento em tempo real de aparelhos e laudos de entrada</p>
          </div>
          {orders.length > 0 && (
            <NavLink to="/system/os" className="text-xs text-cyan-400 font-bold hover:underline flex items-center gap-1 active:scale-95">
              <span>Ver todas no Kanban</span> <ArrowUpRight className="w-3.5 h-3.5" />
            </NavLink>
          )}
        </div>

        {orders.length === 0 ? (
          /* Empty State Limpo */
          <div className="py-10 px-4 text-center space-y-3 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
              <ClipboardList className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">Nenhuma Ordem de Serviço cadastrada</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Seu painel está pronto para receber aparelhos no balcão. Abra sua primeira O.S. blindada em 90 segundos!
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <NavLink
                to="/system/os/nova"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Abrir Primeira O.S. (90s)</span>
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  easyCellStore.restoreDemoData();
                  carregarDados();
                }}
                className="text-xs text-slate-500 hover:text-cyan-300 underline font-medium cursor-pointer transition-colors"
              >
                Restaurar dados de exemplo
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 1. VISÃO MOBILE OTIMIZADA: Tudo cabe na tela sem rolagem vertical pesada + Botão 'Ver Mais' */}
            <div className="block md:hidden space-y-3">
              {/* Exibe apenas as 2 ordens mais recentes de forma compacta e direta */}
              {orders.slice(0, 2).map((ordem) => (
                <NavLink
                  key={ordem.id}
                  to={`/system/os/${ordem.id}`}
                  className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 flex items-center justify-between gap-3 active:scale-98 transition-all shadow-md block"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-cyan-400">#{ordem.numeroOs}</span>
                      {getStatusBadge(ordem.status)}
                    </div>
                    <div className="text-xs font-bold text-white truncate">{ordem.clienteNome}</div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {ordem.aparelhoMarca} {ordem.aparelhoModelo}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono text-xs font-black text-cyan-300">
                      R$ {((ordem.valorTotal || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-cyan-400/80 flex items-center justify-end gap-0.5 mt-1">
                      <span>Ver</span> <ArrowUpRight className="w-3 h-3" />
                    </div>
                  </div>
                </NavLink>
              ))}

              {/* Botão Ver Mais: Direciona para tela exclusiva com visão total das ordens */}
              <NavLink
                to="/system/os"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/60 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 font-bold text-xs shadow-md active:scale-95 transition-all text-center"
              >
                <span>Ver Mais no Kanban ({orders.length} ordens)</span>
                <ArrowUpRight className="w-4 h-4 text-cyan-400" />
              </NavLink>
            </div>

            {/* 2. VISÃO DESKTOP: Tabela Completa para Telas Médias e Grandes */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">O.S.</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Smartphone</th>
                    <th className="py-3 px-4">Senha Registrada</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Valor Total</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {orders.map((ordem) => (
                    <tr key={ordem.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                        <div className="flex items-center gap-1.5">
                          <span>#{ordem.numeroOs}</span>
                          {ordem.isDemo && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              DEMO
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-white font-bold">
                        {ordem.clienteNome}
                        <div className="text-[10px] text-slate-500 font-normal">{ordem.clienteWhatsapp}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-slate-200">{ordem.aparelhoMarca} {ordem.aparelhoModelo}</span>
                        <div className="text-[10px] text-slate-500 font-mono">IMEI: {ordem.aparelhoImei || 'Não inf.'}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {ordem.senhaTipo === 'padrao_pontos' ? (
                          <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 text-[10px]">
                            Padrão 3x3 Salvo
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px]">PIN: {ordem.senhaValor}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(ordem.status)}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-200 font-bold">
                        R$ {((ordem.valorTotal || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <NavLink
                          to={`/system/os/${ordem.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-black text-cyan-300 font-bold text-[11px] transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detalhes</span>
                        </NavLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal de Confirmação para Limpeza dos Dados Demo */}
      {modalConfirmLimparDemo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Limpar Dados de Exemplo?</h3>
                <p className="text-xs text-slate-400">Esta ação deixará seu sistema 100% limpo</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Todas as Ordens de Serviço fictícias e lançamentos de caixa demonstrativos serão apagados. Você poderá iniciar os atendimentos reais com base zerada.
            </p>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setModalConfirmLimparDemo(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleLimparDadosDemo}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-600/20 active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Apagar Dados Demo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
