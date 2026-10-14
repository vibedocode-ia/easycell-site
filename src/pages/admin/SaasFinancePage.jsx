import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  Copy,
  Check,
  Receipt,
  FileText,
  Server,
  Cpu,
  ShieldCheck,
  CreditCard,
  QrCode,
  X
} from 'lucide-react';
import { getAuthToken } from '../../lib/auth';

export default function SaasFinancePage() {
  const [activeTab, setActiveTab] = useState('cashflow'); // 'cashflow' | 'invoices' | 'dunning'
  const [overview, setOverview] = useState({
    mrrCentavos: 1285000,
    arrCentavos: 15420000,
    mrrCrescimentoPercentual: 14.8,
    totalEntradasCentavos: 218800,
    totalSaidasCentavos: 102900,
    lucroLiquidoCentavos: 115900,
    margemOperacionalPercentual: 53.0,
    totalAssinantesAtivos: 68,
    totalTrials: 19,
    totalInadimplentes: 3,
    churnRatePercentual: 1.2,
  });

  const [transactions, setTransactions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [dunningList, setDunningList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filterTipo, setFilterTipo] = useState('all'); // 'all' | 'entrada' | 'saida'
  const [invoiceFilter, setInvoiceFilter] = useState('all'); // 'all' | 'paid' | 'pending' | 'failed'

  // Modais
  const [modalNovaTransacao, setModalNovaTransacao] = useState(false);
  const [modalNovaCobranca, setModalNovaCobranca] = useState(false);
  const [cobrancaGerada, setCobrancaGerada] = useState(null);
  const [copiadoPix, setCopiadoPix] = useState(false);

  // Form states
  const [novaTransacao, setNovaTransacao] = useState({
    tipo: 'entrada',
    categoria: 'assinatura_pro',
    descricao: '',
    valorReais: '',
    metodoPagamento: 'pix',
  });

  const [novaCobranca, setNovaCobranca] = useState({
    empresa: '',
    descricao: 'Mensalidade avulsa / Serviços adicionais',
    valorReais: '197,00',
    diasVencimento: 3,
    metodoPagamento: 'pix',
  });

  const carregarDadosFinanceiros = async () => {
    const token = getAuthToken();
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [resOv, resTx, resInv, resDun] = await Promise.all([
        fetch('/api/v1/saas/finance/overview', { headers }).then((r) => r.json()).catch(() => null),
        fetch('/api/v1/saas/finance/transactions', { headers }).then((r) => r.json()).catch(() => null),
        fetch('/api/v1/saas/finance/invoices', { headers }).then((r) => r.json()).catch(() => null),
        fetch('/api/v1/saas/finance/dunning', { headers }).then((r) => r.json()).catch(() => null),
      ]);

      if (resOv && resOv.mrrCentavos) {
        setOverview(resOv);
      }
      if (resTx && resTx.transactions) {
        setTransactions(resTx.transactions);
      }
      if (resInv && resInv.invoices) {
        setInvoices(resInv.invoices);
      }
      if (resDun && resDun.inadimplentes) {
        setDunningList(resDun.inadimplentes);
      }
    } catch (err) {
      console.warn('Usando estado local resiliente para o financeiro:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDadosFinanceiros();
  }, []);

  const handleSalvarTransacao = async (e) => {
    e.preventDefault();
    if (!novaTransacao.descricao || !novaTransacao.valorReais) return;

    const valorLimpo = parseFloat(novaTransacao.valorReais.replace(/\./g, '').replace(',', '.'));
    if (isNaN(valorLimpo) || valorLimpo <= 0) return;

    const valorCentavos = Math.round(valorLimpo * 100);
    const token = getAuthToken();

    try {
      const res = await fetch('/api/v1/saas/finance/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tipo: novaTransacao.tipo,
          categoria: novaTransacao.categoria,
          descricao: novaTransacao.descricao,
          valorCentavos,
          metodoPagamento: novaTransacao.metodoPagamento,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTransactions((prev) => [data.transaction, ...prev]);
        if (data.metrics) setOverview(data.metrics);
        setModalNovaTransacao(false);
        setNovaTransacao({
          tipo: 'entrada',
          categoria: 'assinatura_pro',
          descricao: '',
          valorReais: '',
          metodoPagamento: 'pix',
        });
      }
    } catch (err) {
      console.error('Erro ao salvar transação:', err);
    }
  };

  const handleEmitirCobranca = async (e) => {
    e.preventDefault();
    if (!novaCobranca.empresa || !novaCobranca.valorReais) return;

    const valorLimpo = parseFloat(novaCobranca.valorReais.replace(/\./g, '').replace(',', '.'));
    if (isNaN(valorLimpo) || valorLimpo <= 0) return;

    const valorCentavos = Math.round(valorLimpo * 100);
    const token = getAuthToken();

    try {
      const res = await fetch('/api/v1/saas/finance/invoices/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          empresa: novaCobranca.empresa,
          descricao: novaCobranca.descricao,
          valorCentavos,
          metodoPagamento: novaCobranca.metodoPagamento,
          diasVencimento: novaCobranca.diasVencimento,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCobrancaGerada(data.invoice);
        setInvoices((prev) => [data.invoice, ...prev]);
      }
    } catch (err) {
      console.error('Erro ao emitir cobrança:', err);
    }
  };

  const copiarPix = (texto) => {
    navigator.clipboard.writeText(texto);
    setCopiadoPix(true);
    setTimeout(() => setCopiadoPix(false), 2500);
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filterTipo === 'all') return true;
    return t.tipo === filterTipo;
  });

  const filteredInvoices = invoices.filter((i) => {
    if (invoiceFilter === 'all') return true;
    return i.status === invoiceFilter;
  });

  const formatarMoeda = (centavos) => {
    if (centavos === undefined || centavos === null || isNaN(centavos)) return 'R$ 0,00';
    return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header com Ações Executivas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <DollarSign className="w-6 h-6" />
            </span>
            Gerenciador Financeiro & Caixa do SaaS
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Controle total de entradas, saídas, receita recorrente (MRR), margem líquida e emissão de cobranças.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setModalNovaTransacao(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            Nova Movimentação (Entrada / Saída)
          </button>
          <button
            onClick={() => {
              setCobrancaGerada(null);
              setModalNovaCobranca(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-cyan-500/20 flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            Emitir Cobrança Manual (PIX)
          </button>
        </div>
      </div>

      {/* Grid de Balanço & Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* MRR */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>MRR (Receita Recorrente)</span>
            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
              +{overview.mrrCrescimentoPercentual}% <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-black text-white">
            {formatarMoeda(overview.mrrCentavos)}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>ARR Projetado:</span>
            <span className="text-cyan-400 font-bold">{formatarMoeda(overview.arrCentavos)}</span>
          </div>
        </div>

        {/* Entradas do Mês */}
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Entradas / Receitas
            </span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
              Realizado
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {formatarMoeda(overview.totalEntradasCentavos)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Mensalidades, setups e faturas quitadas
          </div>
        </div>

        {/* Saídas do Mês */}
        <div className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="text-rose-400 font-bold flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" /> Saídas / Despesas
            </span>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-rose-500/10 text-rose-400 rounded-full border border-rose-500/20">
              Operacional
            </span>
          </div>
          <div className="text-2xl font-black text-rose-400">
            {formatarMoeda(overview.totalSaidasCentavos)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            Servidores, IA, WhatsApp Gateway e Stripe
          </div>
        </div>

        {/* Lucro Líquido & Margem */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Lucro Líquido do SaaS</span>
            <span className="text-cyan-400 font-bold">
              {overview.margemOperacionalPercentual}% margem
            </span>
          </div>
          <div className="text-2xl font-black text-white">
            {formatarMoeda(overview.lucroLiquidoCentavos)}
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
            <span>Assinantes Ativos:</span>
            <span className="text-white font-bold">{overview.totalAssinantesAtivos} tenants ({overview.totalTrials} trials)</span>
          </div>
        </div>
      </div>

      {/* Tabs de Navegação Financeira */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('cashflow')}
          className={`pb-4 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'cashflow'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Receipt className="w-4 h-4" />
          Fluxo de Caixa (Entradas & Saídas)
          <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
            {transactions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-4 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'invoices'
              ? 'border-cyan-400 text-cyan-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Faturas & Assinaturas Stripe
          <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
            {invoices.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('dunning')}
          className={`pb-4 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'dunning'
              ? 'border-amber-400 text-amber-400'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Régua de Cobrança / Dunning
          <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-bold font-mono">
            {dunningList.length}
          </span>
        </button>
      </div>

      {/* ABA 1: FLUXO DE CAIXA COMPLETO (ENTRADAS & SAÍDAS) */}
      {activeTab === 'cashflow' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Extrato de Movimentações Financeiras</h2>
              <p className="text-xs text-slate-400">Receitas diretas e despesas operacionais da infraestrutura do SaaS</p>
            </div>

            {/* Filtros de Tipo */}
            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setFilterTipo('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filterTipo === 'all' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterTipo('entrada')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  filterTipo === 'entrada' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-emerald-400'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" /> Entradas
              </button>
              <button
                onClick={() => setFilterTipo('saida')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                  filterTipo === 'saida' ? 'bg-rose-500 text-slate-950' : 'text-slate-400 hover:text-rose-400'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5" /> Saídas
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3">Tipo / Data</th>
                  <th className="pb-3">Descrição da Movimentação</th>
                  <th className="pb-3">Categoria</th>
                  <th className="pb-3">Método</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${
                            tx.tipo === 'entrada'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {tx.tipo === 'entrada' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        </span>
                        <div>
                          <div className="font-bold text-white capitalize">{tx.tipo}</div>
                          <div className="text-[10px] text-slate-500">
                            {new Date(tx.data).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-semibold text-white">
                      {tx.descricao}
                      {tx.documentoReferencia && (
                        <span className="block text-[10px] font-mono text-slate-500">
                          Ref: {tx.documentoReferencia}
                        </span>
                      )}
                    </td>
                    <td className="py-4">
                      <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-[11px] font-medium border border-slate-700">
                        {tx.categoria.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 uppercase text-slate-400 font-mono text-[11px]">
                      {tx.metodoPagamento}
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          tx.status === 'confirmado' || tx.status === 'pago'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td
                      className={`py-4 text-right font-black text-sm ${
                        tx.tipo === 'entrada' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tx.tipo === 'entrada' ? '+' : '-'} {formatarMoeda(tx.valorCentavos)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 2: FATURAS STRIPE & ASSINATURAS */}
      {activeTab === 'invoices' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Faturas das Assistências Técnicas (Tenants)</h2>
              <p className="text-xs text-slate-400">Sincronizadas com Stripe Billing, PIX automático e Cartão</p>
            </div>

            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              {['all', 'paid', 'pending', 'failed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setInvoiceFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition capitalize ${
                    invoiceFilter === st ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
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
                  <th className="pb-3">Cliente / Assistência</th>
                  <th className="pb-3">Descrição</th>
                  <th className="pb-3">Método</th>
                  <th className="pb-3">Valor</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/30">
                    <td className="py-3 font-mono text-cyan-400 font-bold">#{inv.numero}</td>
                    <td className="py-3 font-semibold text-white">{inv.empresa}</td>
                    <td className="py-3 text-slate-300">{inv.descricao}</td>
                    <td className="py-3 text-slate-400 uppercase font-mono">{inv.metodoPagamento}</td>
                    <td className="py-3 font-bold text-white">{formatarMoeda(inv.valorLiquidoCentavos)}</td>
                    <td className="py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          inv.status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : inv.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {inv.status === 'paid' ? 'Paga' : inv.status === 'pending' ? 'Pendente' : 'Recusada'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {inv.pixCopiaECola ? (
                        <button
                          onClick={() => copiarPix(inv.pixCopiaECola)}
                          className="px-3 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ml-auto"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copiar PIX
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Stripe Auto</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 3: RÉGUA DE DUNNING & INADIMPLÊNCIA */}
      {activeTab === 'dunning' && (
        <div className="space-y-6">
          <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400 font-bold text-base">
              <AlertTriangle className="w-6 h-6" />
              <span>Régua de Tolerância e Bloqueio Suave (D+0 a D+7)</span>
            </div>
            <p className="text-xs text-slate-300">
              O EasyCell adota uma abordagem comercial humanizada: ao ocorrer falha no cartão ou PIX expirado, o sistema concede 7 dias de tolerância sem cortar o acesso da assistência. Durante esse período, o sistema exibe alerta não destrutivo. Após 7 dias sem quitação, o <strong>BlockOverlay</strong> é ativado sem exclusão de dados.
            </p>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead className="text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="pb-3">Assistência / Tenant</th>
                    <th className="pb-3">Plano</th>
                    <th className="pb-3">Dias em Atraso</th>
                    <th className="pb-3">Tentativas Stripe</th>
                    <th className="pb-3">Tolerância Expira em</th>
                    <th className="pb-3">Valor Pendente</th>
                    <th className="pb-3 text-right">Ação de Regularização</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {dunningList.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-800/40">
                      <td className="py-3 font-semibold text-white">
                        {d.empresa}
                        <span className="block text-[10px] text-slate-400">{d.email} • {d.telefone}</span>
                      </td>
                      <td className="py-3 text-cyan-400 font-bold">{d.plano}</td>
                      <td className="py-3 text-amber-400 font-bold">{d.diasAtraso} dias</td>
                      <td className="py-3 text-slate-400">{d.tentativasCobranca} de 3</td>
                      <td className="py-3 text-slate-300">
                        {new Date(d.gracePeriodFim).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-3 font-bold text-white">
                        {formatarMoeda(d.valorPendenteCentavos)}
                      </td>
                      <td className="py-3 text-right">
                        <a
                          href={`https://wa.me/55${d.telefone.replace(/\D/g, '')}?text=Ol%C3%A1%20${encodeURIComponent(d.empresa)}%2C%20identificamos%20uma%20pend%C3%AAncia%20na%20sua%20assinatura%20do%20EasyCell.%20Podemos%20gerar%20um%20PIX%20para%20manter%20sua%20loja%20ativa%3F`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-[11px] font-bold transition inline-flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" /> Cobrar via WhatsApp
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVA MOVIMENTAÇÃO (ENTRADA / SAÍDA) */}
      {modalNovaTransacao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                Novo Lançamento Financeiro
              </h3>
              <button onClick={() => setModalNovaTransacao(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvarTransacao} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Tipo de Movimentação</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNovaTransacao({ ...novaTransacao, tipo: 'entrada' })}
                    className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      novaTransacao.tipo === 'entrada'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" /> Entrada (Receita)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNovaTransacao({ ...novaTransacao, tipo: 'saida' })}
                    className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      novaTransacao.tipo === 'saida'
                        ? 'bg-rose-500 text-slate-950'
                        : 'bg-slate-950 text-slate-400 border border-slate-800'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" /> Saída (Despesa)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Servidor VPS Coolify / Consultoria de Implantação"
                  value={novaTransacao.descricao}
                  onChange={(e) => setNovaTransacao({ ...novaTransacao, descricao: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Valor (R$)</label>
                  <input
                    type="text"
                    placeholder="197,00"
                    value={novaTransacao.valorReais}
                    onChange={(e) => setNovaTransacao({ ...novaTransacao, valorReais: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Método</label>
                  <select
                    value={novaTransacao.metodoPagamento}
                    onChange={(e) => setNovaTransacao({ ...novaTransacao, metodoPagamento: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="pix">PIX</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="boleto">Boleto Bancário</option>
                    <option value="transferencia">Transferência</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Categoria</label>
                <select
                  value={novaTransacao.categoria}
                  onChange={(e) => setNovaTransacao({ ...novaTransacao, categoria: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="assinatura_pro">Assinatura PRO</option>
                  <option value="assinatura_enterprise">Assinatura Enterprise</option>
                  <option value="assinatura_starter">Assinatura Starter</option>
                  <option value="servico_avulso">Serviço de Setup / Consultoria</option>
                  <option value="infraestrutura">Infraestrutura / Servidores VPS</option>
                  <option value="inteligencia_artificial">Tokens IA (Gemini / OpenAI)</option>
                  <option value="whatsapp_gateway">Gateway WhatsApp</option>
                  <option value="taxa_gateway">Taxas Stripe / Banco</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalNovaTransacao(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-xl text-xs font-black transition shadow-lg shadow-cyan-500/20"
                >
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EMITIR COBRANÇA MANUAL COM PIX COPIA E COLA */}
      {modalNovaCobranca && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-cyan-400" />
                Emitir Cobrança Manual (PIX / Link)
              </h3>
              <button onClick={() => setModalNovaCobranca(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!cobrancaGerada ? (
              <form onSubmit={handleEmitirCobranca} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Empresa / Assistência</label>
                  <input
                    type="text"
                    placeholder="Ex: SmartCell Campinas"
                    value={novaCobranca.empresa}
                    onChange={(e) => setNovaCobranca({ ...novaCobranca, empresa: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Motivo / Descrição</label>
                  <input
                    type="text"
                    value={novaCobranca.descricao}
                    onChange={(e) => setNovaCobranca({ ...novaCobranca, descricao: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Valor (R$)</label>
                    <input
                      type="text"
                      placeholder="197,00"
                      value={novaCobranca.valorReais}
                      onChange={(e) => setNovaCobranca({ ...novaCobranca, valorReais: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">Vencimento em</label>
                    <select
                      value={novaCobranca.diasVencimento}
                      onChange={(e) => setNovaCobranca({ ...novaCobranca, diasVencimento: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                    >
                      <option value={1}>1 dia (Hoje)</option>
                      <option value={3}>3 dias</option>
                      <option value={7}>7 dias</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-cyan-500/20"
                >
                  Gerar QR Code PIX & Código
                </button>
              </form>
            ) : (
              <div className="space-y-5 text-center">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <div className="font-bold text-white text-sm">Cobrança #{cobrancaGerada.numero} Gerada!</div>
                  <div className="text-xs text-slate-400">{cobrancaGerada.empresa} • {formatarMoeda(cobrancaGerada.valorLiquidoCentavos)}</div>
                </div>

                <div className="space-y-2 text-left">
                  <label className="text-xs font-bold text-slate-400">Código PIX Copia e Cola:</label>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-cyan-400 break-all select-all">
                    {cobrancaGerada.pixCopiaECola}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => copiarPix(cobrancaGerada.pixCopiaECola)}
                    className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                  >
                    {copiadoPix ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
                    {copiadoPix ? 'PIX Copiado!' : 'Copiar Código PIX'}
                  </button>
                  <button
                    onClick={() => setModalNovaCobranca(false)}
                    className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
