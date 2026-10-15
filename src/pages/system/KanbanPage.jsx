import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Eye, 
  Smartphone, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Filter,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ArrowRightCircle
} from 'lucide-react';
import { easyCellStore } from '../../lib/store';

export default function KanbanPage() {
  const [orders, setOrders] = useState([]);
  const [busca, setBusca] = useState('');
  const [mobileTabAtiva, setMobileTabAtiva] = useState('entrada');
  const [notifFeedback, setNotifFeedback] = useState(null);

  const carregarOrdens = () => {
    setOrders(easyCellStore.getOrders());
  };

  useEffect(() => {
    carregarOrdens();
    const handleAtualizacao = () => carregarOrdens();
    window.addEventListener('easycell_store_updated', handleAtualizacao);
    window.addEventListener('easycell_demo_cleared', handleAtualizacao);
    return () => {
      window.removeEventListener('easycell_store_updated', handleAtualizacao);
      window.removeEventListener('easycell_demo_cleared', handleAtualizacao);
    };
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    const updated = easyCellStore.updateOrderStatus(orderId, newStatus);
    setOrders(updated);

    const targetOrder = updated.find(o => o.id === orderId);
    const labels = {
      entrada: 'Entrada Registrada',
      orcamento_pendente: 'Orçamento com Opção 1/2',
      aprovado_reparo: 'Início de Reparo',
      pronto_retirada: 'Aparelho Pronto para Retirada',
      entregue_pago: 'Recibo & Garantia'
    };

    setNotifFeedback(`📲 WhatsApp Automático: Notificação de "${labels[newStatus] || newStatus}" enviada para ${targetOrder?.clienteNome || 'Cliente'}!`);
    setTimeout(() => setNotifFeedback(null), 4000);
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('text/plain');
    if (orderId) {
      handleUpdateStatus(orderId, newStatus);
    }
  };

  const handleDragStart = (e, orderId) => {
    e.dataTransfer.setData('text/plain', orderId);
  };

  // Próximo status natural no fluxo operacional
  const getProximoStatus = (statusAtual) => {
    switch (statusAtual) {
      case 'entrada':
        return { nextKey: 'aprovado_reparo', label: 'Iniciar Reparo' };
      case 'orcamento_pendente':
        return { nextKey: 'aprovado_reparo', label: 'Aprovar Reparo' };
      case 'aprovado_reparo':
        return { nextKey: 'pronto_retirada', label: 'Marcar Pronto' };
      case 'pronto_retirada':
        return { nextKey: 'entregue_pago', label: 'Entregar & Finalizar' };
      default:
        return null;
    }
  };

  const colunas = [
    { key: 'entrada', label: '1. Recebido / Análise', color: 'border-amber-500/40 bg-amber-950/15 text-amber-400', pillColor: 'text-amber-400 border-amber-500/50 bg-amber-950/40' },
    { key: 'orcamento_pendente', label: '2. Orçamento Pendente', color: 'border-sky-500/40 bg-sky-950/15 text-sky-400', pillColor: 'text-sky-400 border-sky-500/50 bg-sky-950/40' },
    { key: 'aprovado_reparo', label: '3. Aprovado / Em Reparo', color: 'border-blue-500/40 bg-blue-950/15 text-blue-400', pillColor: 'text-blue-400 border-blue-500/50 bg-blue-950/40' },
    { key: 'pronto_retirada', label: '4. Pronto p/ Retirada', color: 'border-emerald-500/40 bg-emerald-950/15 text-emerald-400', pillColor: 'text-emerald-400 border-emerald-500/50 bg-emerald-950/40' },
    { key: 'entregue_pago', label: '5. Entregue & Pago', color: 'border-slate-500/40 bg-slate-900/40 text-slate-400', pillColor: 'text-slate-300 border-slate-700 bg-slate-800' },
  ];

  const filteredOrders = orders.filter(o => 
    o.clienteNome.toLowerCase().includes(busca.toLowerCase()) ||
    o.aparelhoModelo.toLowerCase().includes(busca.toLowerCase()) ||
    String(o.numeroOs).includes(busca) ||
    (o.aparelhoImei && o.aparelhoImei.includes(busca))
  );

  const colunaAtivaMobile = colunas.find(c => c.key === mobileTabAtiva) || colunas[0];
  const ordensColunaMobile = filteredOrders.filter(o => o.status === mobileTabAtiva);

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-10">
      {/* Top Header & Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Quadro Kanban Operacional
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Arraste os cards no desktop ou toque para avançar status no mobile com WhatsApp automático.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar O.S., IMEI ou Cliente..."
              className="bg-slate-900 text-xs text-white placeholder-slate-500 pl-9 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-400 w-full sm:w-64"
            />
          </div>
          <NavLink
            to="/system/os/nova"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 shrink-0 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova O.S.</span>
          </NavLink>
        </div>
      </div>

      {/* Feedback de Disparo WhatsApp */}
      {notifFeedback && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs flex items-center gap-2.5 shadow-lg animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 animate-pulse" />
          <span className="font-medium">{notifFeedback}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. VISÃO MOBILE TOUCH-FIRST: Segmented Control + Cards Vivos */}
      {/* ======================================================== */}
      <div className="block md:hidden space-y-4">
        {/* Barra Segmentada de Abas com Contagem em Tempo Real */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-0.5 -mx-1">
          {colunas.map((col) => {
            const count = filteredOrders.filter(o => o.status === col.key).length;
            const isSelected = mobileTabAtiva === col.key;
            const shortLabel = col.label.split('. ')[1] || col.label;

            return (
              <button
                key={col.key}
                type="button"
                onClick={() => setMobileTabAtiva(col.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer select-none active:scale-95 ${
                  isSelected 
                    ? `${col.pillColor} shadow-md border ring-1 ring-cyan-500/20` 
                    : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800/80'
                }`}
              >
                <span>{shortLabel}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  isSelected ? 'bg-black/60 text-white' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Header da Coluna Selecionada no Mobile */}
        <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-bold ${colunaAtivaMobile.color}`}>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-current animate-ping" />
            {colunaAtivaMobile.label}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-950/80 font-mono text-[11px]">
            {ordensColunaMobile.length} {ordensColunaMobile.length === 1 ? 'ordem' : 'ordens'}
          </span>
        </div>

        {/* Lista de Cards da Aba Ativa no Mobile */}
        <div className="space-y-3">
          {ordensColunaMobile.map((ordem) => {
            const proximo = getProximoStatus(ordem.status);

            return (
              <div
                key={ordem.id}
                className="p-4 rounded-2xl glass-panel border border-slate-800/90 shadow-lg space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-black text-cyan-400">
                      #{ordem.numeroOs}
                    </span>
                    {ordem.isDemo && (
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        DEMO
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" /> Hoje
                  </span>
                </div>

                <div>
                  <div className="text-sm font-bold text-white">
                    {ordem.clienteNome}
                  </div>
                  <div className="text-xs text-slate-300 font-medium mt-0.5">
                    {ordem.aparelhoMarca} {ordem.aparelhoModelo}
                  </div>
                  {ordem.aparelhoImei && (
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      IMEI: {ordem.aparelhoImei}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <span className="font-mono font-black text-white text-sm">
                    R$ {((ordem.valorTotal || 0) / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Botão de Abrir Detalhes da O.S. */}
                    <NavLink
                      to={`/system/os/${ordem.id}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 font-bold text-xs hover:border-cyan-500/50 transition-all flex items-center gap-1 active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Detalhes</span>
                    </NavLink>

                    {/* Botão de Avanço Rápido de Status (Touch-First) */}
                    {proximo && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(ordem.id, proximo.nextKey)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1"
                      >
                        <span>{proximo.label}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {ordensColunaMobile.length === 0 && (
            <div className="p-8 rounded-2xl border border-dashed border-slate-800 text-center space-y-2 bg-slate-950/40">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-slate-600 flex items-center justify-center mx-auto">
                <Smartphone className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-400 font-medium">Nenhum aparelho nesta etapa no momento.</p>
              <NavLink
                to="/system/os/nova"
                className="inline-block text-xs text-cyan-400 hover:underline font-bold mt-1"
              >
                + Criar Nova Ordem de Serviço
              </NavLink>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. VISÃO DESKTOP WIDESCREEN: 5 Colunas com Drag & Drop */}
      {/* ======================================================== */}
      <div className="hidden md:grid md:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
        {colunas.map((col) => {
          const ordensNaColuna = filteredOrders.filter(o => o.status === col.key);

          return (
            <div
              key={col.key}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.key)}
              className="glass-panel rounded-2xl border border-slate-800/90 p-3.5 space-y-3 min-h-[550px] flex flex-col"
            >
              {/* Cabeçalho da Coluna */}
              <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold ${col.color}`}>
                <span className="truncate">{col.label}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-950/80 font-mono text-[10px]">
                  {ordensNaColuna.length}
                </span>
              </div>

              {/* Lista de Cards da Coluna */}
              <div className="space-y-3 flex-1">
                {ordensNaColuna.map((ordem) => {
                  const proximo = getProximoStatus(ordem.status);

                  return (
                    <div
                      key={ordem.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, ordem.id)}
                      className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-850 hover:border-cyan-500/50 shadow-md cursor-grab active:cursor-grabbing transition-all space-y-2.5 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-black text-cyan-400">
                            #{ordem.numeroOs}
                          </span>
                          {ordem.isDemo && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              DEMO
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3" /> Hoje
                        </span>
                      </div>

                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {ordem.clienteNome}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {ordem.aparelhoMarca} {ordem.aparelhoModelo}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1.5 border-t border-slate-800/80 font-mono">
                        <span className="text-white font-bold">R$ {((ordem.valorTotal || 0) / 100).toFixed(2)}</span>
                        
                        <div className="flex items-center gap-2">
                          {proximo && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(ordem.id, proximo.nextKey)}
                              className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-0.5 cursor-pointer"
                              title={`Mover para ${proximo.label}`}
                            >
                              <span>{proximo.label}</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                          <NavLink
                            to={`/system/os/${ordem.id}`}
                            className="text-slate-400 hover:text-cyan-400 flex items-center gap-0.5 font-bold"
                            title="Ver detalhes da O.S."
                          >
                            <Eye className="w-3 h-3" />
                          </NavLink>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {ordensNaColuna.length === 0 && (
                  <div className="h-32 rounded-xl border border-dashed border-slate-800/80 flex items-center justify-center text-[11px] text-slate-600 font-mono">
                    Solte O.S. aqui
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
