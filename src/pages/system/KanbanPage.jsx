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
  CheckCircle2
} from 'lucide-react';
import { easyCellStore } from '../../lib/store';

export default function KanbanPage() {
  const [orders, setOrders] = useState([]);
  const [busca, setBusca] = useState('');

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

  const [notifFeedback, setNotifFeedback] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('text/plain');
    if (orderId) {
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
    }
  };

  const handleDragStart = (e, orderId) => {
    e.dataTransfer.setData('text/plain', orderId);
  };

  const colunas = [
    { key: 'entrada', label: '1. Recebido / Análise', color: 'border-amber-500/40 bg-amber-950/10 text-amber-400' },
    { key: 'orcamento_pendente', label: '2. Orçamento Pendente', color: 'border-sky-500/40 bg-sky-950/10 text-sky-400' },
    { key: 'aprovado_reparo', label: '3. Aprovado / Em Reparo', color: 'border-blue-500/40 bg-blue-950/10 text-blue-400' },
    { key: 'pronto_retirada', label: '4. Pronto p/ Retirada', color: 'border-emerald-500/40 bg-emerald-950/10 text-emerald-400' },
    { key: 'entregue_pago', label: '5. Entregue & Pago', color: 'border-slate-500/40 bg-slate-900/40 text-slate-400' },
  ];

  const filteredOrders = orders.filter(o => 
    o.clienteNome.toLowerCase().includes(busca.toLowerCase()) ||
    o.aparelhoModelo.toLowerCase().includes(busca.toLowerCase()) ||
    String(o.numeroOs).includes(busca) ||
    (o.aparelhoImei && o.aparelhoImei.includes(busca))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Quadro Kanban Operacional
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Arraste os cards para atualizar o status e disparar notificações automáticas de WhatsApp.</p>
        </div>

      {notifFeedback && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2 shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span className="font-medium">{notifFeedback}</span>
        </div>
      )}

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Filtrar por O.S., IMEI ou Cliente..."
              className="bg-slate-900 text-xs text-white placeholder-slate-500 pl-9 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-400 w-64"
            />
          </div>
          <NavLink
            to="/system/os/nova"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-all shadow-md shadow-cyan-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Nova O.S.</span>
          </NavLink>
        </div>
      </div>

      {/* Grid do Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
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
              <div className={`p-2 rounded-xl border flex items-center justify-between text-xs font-bold ${col.color}`}>
                <span className="truncate">{col.label}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-950/80 font-mono text-[10px]">
                  {ordensNaColuna.length}
                </span>
              </div>

              {/* Lista de Cards da Coluna */}
              <div className="space-y-3 flex-1">
                {ordensNaColuna.map((ordem) => (
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

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/80 font-mono">
                      <span>R$ {((ordem.valorTotal || 0) / 100).toFixed(2)}</span>
                      <NavLink
                        to={`/system/os/${ordem.id}`}
                        className="text-cyan-400 hover:underline flex items-center gap-0.5"
                      >
                        Abrir <ArrowRight className="w-2.5 h-2.5" />
                      </NavLink>
                    </div>
                  </div>
                ))}

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
