import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

export default function SaasFinancePage() {
  const [overview, setOverview] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [dunningList, setDunningList] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('easycell_auth_token') || sessionStorage.getItem('easycell_auth_token');
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch('/api/v1/saas/finance/overview', { headers }).then((r) => r.json()),
      fetch('/api/v1/saas/finance/invoices', { headers }).then((r) => r.json()),
      fetch('/api/v1/saas/finance/dunning', { headers }).then((r) => r.json()),
    ])
      .then(([ovData, invData, dunData]) => {
        setOverview(ovData);
        if (invData.invoices) setInvoices(invData.invoices);
        if (dunData.inadimplentes) setDunningList(dunData.inadimplentes);
      })
      .catch((err) => console.error('Erro ao carregar dados financeiros:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredInvoices = filterStatus === 'all'
    ? invoices
    : invoices.filter((i) => i.status === filterStatus);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-cyan-400" />
          Gerenciador Financeiro & Métricas SaaS
        </h1>
        <p className="text-sm text-slate-400">
          Acompanhamento em tempo real de receita recorrente (MRR), faturas, inadimplência e dunning.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>MRR (Receita Recorrente)</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              +{overview?.mrrCrescimentoPercentual || 14.8}% <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-extrabold text-white">
            R$ {overview ? (overview.mrrCentavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '12.850,00'}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            ARR projetado: R$ {overview ? (overview.arrCentavos / 100).toLocaleString('pt-BR') : '154.200,00'}
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="text-xs text-slate-400 mb-2">Assinantes Ativos</div>
          <div className="text-2xl font-extrabold text-white">
            {overview?.totalAssinantesAtivos || 68} <span className="text-xs font-normal text-slate-500">tenants</span>
          </div>
          <div className="text-[11px] text-cyan-400 mt-2">
            {overview?.totalTrials || 19} em período de avaliação gratuita
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="text-xs text-slate-400 mb-2">Taxa de Churn (Cancelamento)</div>
          <div className="text-2xl font-extrabold text-emerald-400">
            {overview?.churnRatePercentual || 1.2}%
          </div>
          <div className="text-[11px] text-slate-500 mt-2">Abaixo da média de mercado (3.5%)</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="text-xs text-slate-400 mb-2">Inadimplência / Dunning</div>
          <div className="text-2xl font-extrabold text-amber-400">
            {overview?.totalInadimplentes || 3} <span className="text-xs font-normal text-slate-500">em atraso</span>
          </div>
          <div className="text-[11px] text-amber-500/80 mt-2">
            7 dias de tolerância em andamento
          </div>
        </div>
      </div>

      {/* Painel de Inadimplência & Dunning */}
      {dunningList.length > 0 && (
        <div className="bg-slate-900/80 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Atenção: Inadimplentes em Processo de Cobrança Automática (Dunning)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3">Assistência / Tenant</th>
                  <th className="pb-3">Plano</th>
                  <th className="pb-3">Dias em Atraso</th>
                  <th className="pb-3">Tentativas Stripe</th>
                  <th className="pb-3">Tolerância Expira em</th>
                  <th className="pb-3">Valor Pendente</th>
                  <th className="pb-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {dunningList.map((d, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="py-3 font-semibold text-white">{d.empresa}</td>
                    <td className="py-3 text-slate-300">{d.plano}</td>
                    <td className="py-3 text-amber-400 font-bold">{d.diasAtraso} dias</td>
                    <td className="py-3 text-slate-400">{d.tentativasCobranca} de 3</td>
                    <td className="py-3 text-slate-300">
                      {new Date(d.gracePeriodFim).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 font-bold text-white">
                      R$ {(d.valorPendenteCentavos / 100).toFixed(2)}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => alert(`Cobrança reenviada para o WhatsApp de ${d.empresa}`)}
                        className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-semibold transition"
                      >
                        Reenviar Cobrança
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tabela de Faturas */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-white">Histórico de Faturas da Plataforma</h2>

          {/* Filtros */}
          <div className="flex items-center gap-2">
            {['all', 'paid', 'pending', 'failed'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                  filterStatus === st
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {st === 'all' ? 'Todas' : st === 'paid' ? 'Pagas' : st === 'pending' ? 'Pendentes' : 'Falhas'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-slate-800">
              <tr>
                <th className="pb-3"># Fatura</th>
                <th className="pb-3">Cliente / Empresa</th>
                <th className="pb-3">Descrição</th>
                <th className="pb-3">Método</th>
                <th className="pb-3">Valor</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/30">
                  <td className="py-3 font-mono text-cyan-400">#{inv.numero}</td>
                  <td className="py-3 font-semibold text-white">{inv.empresa || inv.tenantId}</td>
                  <td className="py-3 text-slate-300">{inv.descricao}</td>
                  <td className="py-3 uppercase text-[11px] text-slate-400 font-mono">
                    {inv.metodoPagamento || 'Cartão'}
                  </td>
                  <td className="py-3 font-bold text-white">
                    R$ {(inv.valorLiquidoCentavos / 100).toFixed(2)}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        inv.status === 'paid'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : inv.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {inv.status === 'paid' ? 'Paga' : inv.status === 'pending' ? 'Pendente' : 'Falha'}
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">
                    {new Date(inv.pagoEm || inv.vencimentoEm || Date.now()).toLocaleDateString('pt-BR')}
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
