import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowDownLeft, Printer, CheckCircle2, Calendar } from 'lucide-react';
import { easyCellStore } from '../../lib/store';

export default function CaixaPage() {
  const [caixa, setCaixa] = useState([]);

  useEffect(() => {
    setCaixa(easyCellStore.getCaixa());
  }, []);

  const totalGeral = caixa.reduce((acc, c) => acc + c.valor, 0);
  const totalPix = caixa.filter(c => c.metodoPagamento?.toUpperCase() === 'PIX').reduce((acc, c) => acc + c.valor, 0);
  const totalCartao = caixa.filter(c => c.metodoPagamento?.toUpperCase() === 'CARTÃO' || c.metodoPagamento?.toUpperCase() === 'CARTAO').reduce((acc, c) => acc + c.valor, 0);
  const totalDinheiro = caixa.filter(c => c.metodoPagamento?.toUpperCase() === 'DINHEIRO').reduce((acc, c) => acc + c.valor, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Frente de Caixa & Fechamento Diário
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Apuração consolidada das quitações de Ordens de Serviço por meio de pagamento.</p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir Fechamento</span>
        </button>
      </div>

      {/* Cards de Totais por Método */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-cyan-500/40">
          <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider block mb-1">Total Geral do Dia</span>
          <div className="text-2xl font-black text-white font-mono">
            R$ {(totalGeral / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Saldo consolidado</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">Recebido via PIX</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            R$ {(totalPix / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Liquidação instantânea</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-blue-500/30">
          <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block mb-1">Recebido via Cartão</span>
          <div className="text-2xl font-black text-blue-400 font-mono">
            R$ {(totalCartao / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Crédito & Débito</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-amber-500/30">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1">Dinheiro em Espécie</span>
          <div className="text-2xl font-black text-amber-400 font-mono">
            R$ {(totalDinheiro / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Gaveta do balcão</span>
        </div>
      </div>

      {/* Tabela de Transações */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white">Extrato de Entradas do Caixa</h3>

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
              {caixa.map((c) => (
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
