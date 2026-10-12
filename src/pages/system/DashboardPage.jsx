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
  Plus
} from 'lucide-react';
import { easyCellStore } from '../../lib/store';

export default function DashboardPage() {
  const [orders, setOrders] = useState([]);
  const [stock, setStock] = useState([]);
  const [caixa, setCaixa] = useState([]);

  useEffect(() => {
    setOrders(easyCellStore.getOrders());
    setStock(easyCellStore.getStock());
    setCaixa(easyCellStore.getCaixa());
  }, []);

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

        <NavLink
          to="/system/os/nova"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-500/25 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Abrir Nova O.S. (90s)</span>
        </NavLink>
      </div>

      {/* Grid de StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total de O.S.</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">{totalOsHoje}</div>
          <div className="text-[11px] text-slate-500 mt-2">Aparelhos registrados</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Na Bancada / Reparo</span>
            <div className="w-9 h-9 rounded-xl bg-blue-950 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-blue-400 font-mono">{emReparo}</div>
          <div className="text-[11px] text-slate-500 mt-2">Técnicos executando</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Prontos p/ Retirada</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">{prontos}</div>
          <div className="text-[11px] text-slate-500 mt-2">Aguardando cliente</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Faturamento Caixa</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono">
            R$ {(totalFaturamento / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">Recebimentos acumulados</div>
        </div>
      </div>

      {/* Tabela de Ordens Recentes */}
      <div className="glass-panel rounded-3xl border border-slate-800/80 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Ordens de Serviço em Andamento</h3>
            <p className="text-xs text-slate-400">Acompanhamento em tempo real de aparelhos e laudos de entrada</p>
          </div>
          <NavLink to="/system/os" className="text-xs text-cyan-400 font-bold hover:underline flex items-center gap-1">
            Ver todas no Kanban <ArrowUpRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>

        <div className="overflow-x-auto">
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
                    #{ordem.numeroOs}
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
      </div>
    </div>
  );
}
