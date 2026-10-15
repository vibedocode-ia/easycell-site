import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowDownLeft, Printer, CheckCircle2, Calendar } from 'lucide-react';
import { easyCellStore } from '../../lib/store';

export default function CaixaPage() {
  const [caixa, setCaixa] = useState([]);
  const [filtroMetodo, setFiltroMetodo] = useState('TODOS');

  useEffect(() => {
    setCaixa(easyCellStore.getCaixa());
  }, []);

  const totalGeral = caixa.reduce((acc, c) => acc + c.valor, 0);
  const totalPix = caixa.filter(c => c.metodoPagamento?.toUpperCase() === 'PIX').reduce((acc, c) => acc + c.valor, 0);
  const totalCartao = caixa.filter(c => c.metodoPagamento?.toUpperCase() === 'CARTÃO' || c.metodoPagamento?.toUpperCase() === 'CARTAO').reduce((acc, c) => acc + c.valor, 0);
  const totalDinheiro = caixa.filter(c => c.metodoPagamento?.toUpperCase() === 'DINHEIRO').reduce((acc, c) => acc + c.valor, 0);

  const transacoesFiltradas = caixa.filter(c => {
    if (filtroMetodo === 'TODOS') return true;
    if (filtroMetodo === 'CARTÃO') {
      return c.metodoPagamento?.toUpperCase() === 'CARTÃO' || c.metodoPagamento?.toUpperCase() === 'CARTAO';
    }
    return c.metodoPagamento?.toUpperCase() === filtroMetodo;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Frente de Caixa & Fechamento Diário
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Apuração consolidada das quitações de Ordens de Serviço por meio de pagamento.</p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir Fechamento</span>
        </button>
      </div>

      {/* Cards de Totais por Método - 100% Clicáveis com Filtro Instantâneo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => setFiltroMetodo('TODOS')}
          className={`glass-panel p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer group shadow-lg active:scale-95 select-none ${
            filtroMetodo === 'TODOS'
              ? 'border-cyan-400/90 ring-2 ring-cyan-400/30 bg-cyan-950/20 shadow-cyan-950/40 scale-[1.02]'
              : 'border-cyan-500/30 hover:border-cyan-400/60'
          }`}
          title="Ver todas as transações"
        >
          <span className="text-[10px] sm:text-[11px] font-bold text-cyan-300 uppercase tracking-wider block mb-1 group-hover:text-cyan-200">
            Total do Dia
          </span>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            R$ {(totalGeral / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[9px] sm:text-[10px] text-slate-400 mt-1 block">
            {filtroMetodo === 'TODOS' ? '● Exibindo tudo' : 'Toque para ver tudo'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFiltroMetodo(filtroMetodo === 'PIX' ? 'TODOS' : 'PIX')}
          className={`glass-panel p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer group shadow-lg active:scale-95 select-none ${
            filtroMetodo === 'PIX'
              ? 'border-emerald-400/90 ring-2 ring-emerald-400/30 bg-emerald-950/20 shadow-emerald-950/40 scale-[1.02]'
              : 'border-emerald-500/30 hover:border-emerald-400/60'
          }`}
          title="Filtrar por pagamentos via PIX"
        >
          <span className="text-[10px] sm:text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1 group-hover:text-emerald-300">
            Via PIX
          </span>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
            R$ {(totalPix / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[9px] sm:text-[10px] text-slate-400 mt-1 block">
            {filtroMetodo === 'PIX' ? '● Filtro ativo' : 'Toque p/ filtrar'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFiltroMetodo(filtroMetodo === 'CARTÃO' ? 'TODOS' : 'CARTÃO')}
          className={`glass-panel p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer group shadow-lg active:scale-95 select-none ${
            filtroMetodo === 'CARTÃO'
              ? 'border-blue-400/90 ring-2 ring-blue-400/30 bg-blue-950/20 shadow-blue-950/40 scale-[1.02]'
              : 'border-blue-500/30 hover:border-blue-400/60'
          }`}
          title="Filtrar por pagamentos via Cartão"
        >
          <span className="text-[10px] sm:text-[11px] font-bold text-blue-400 uppercase tracking-wider block mb-1 group-hover:text-blue-300">
            Via Cartão
          </span>
          <div className="text-xl sm:text-2xl font-black text-blue-400 font-mono">
            R$ {(totalCartao / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[9px] sm:text-[10px] text-slate-400 mt-1 block">
            {filtroMetodo === 'CARTÃO' ? '● Filtro ativo' : 'Toque p/ filtrar'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFiltroMetodo(filtroMetodo === 'DINHEIRO' ? 'TODOS' : 'DINHEIRO')}
          className={`glass-panel p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer group shadow-lg active:scale-95 select-none ${
            filtroMetodo === 'DINHEIRO'
              ? 'border-amber-400/90 ring-2 ring-amber-400/30 bg-amber-950/20 shadow-amber-950/40 scale-[1.02]'
              : 'border-amber-500/30 hover:border-amber-400/60'
          }`}
          title="Filtrar por pagamentos em Dinheiro"
        >
          <span className="text-[10px] sm:text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1 group-hover:text-amber-300">
            Em Dinheiro
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
            R$ {(totalDinheiro / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[9px] sm:text-[10px] text-slate-400 mt-1 block">
            {filtroMetodo === 'DINHEIRO' ? '● Filtro ativo' : 'Toque p/ filtrar'}
          </span>
        </button>
      </div>

      {/* Tabela de Transações */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Extrato de Entradas do Caixa</span>
            {filtroMetodo !== 'TODOS' && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Filtro: {filtroMetodo}
              </span>
            )}
          </h3>
          {filtroMetodo !== 'TODOS' && (
            <button
              type="button"
              onClick={() => setFiltroMetodo('TODOS')}
              className="text-xs text-cyan-400 hover:underline font-bold cursor-pointer"
            >
              Limpar Filtro
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Horário</th>
                <th className="py-3 px-4">Descrição da Entrada</th>
                <th className="py-3 px-4">Operador</th>
                <th className="py-3 px-4">Meio de Pagamento</th>
                <th className="py-3 px-4 text-right">Valor Recebido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {transacoesFiltradas.map((c) => (
                <tr key={c.id} className="hover:bg-slate-900/40">
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {new Date(c.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3.5 px-4 text-white font-bold">{c.descricao}</td>
                  <td className="py-3.5 px-4 text-slate-400">{c.operadorNome}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-800 text-cyan-300">
                      {c.metodoPagamento}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-bold text-sm">
                    + R$ {(c.valor / 100).toFixed(2)}
                  </td>
                </tr>
              ))}
              {transacoesFiltradas.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500 font-mono text-xs">
                    Nenhuma entrada registrada com este método de pagamento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
