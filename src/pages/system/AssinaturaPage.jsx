import React, { useState, useEffect } from 'react';
import { CreditCard, Check, ArrowUpRight, ShieldCheck, Clock, ExternalLink, AlertTriangle, Layers, X, Sparkles } from 'lucide-react';

export default function AssinaturaPage() {
  const [sub, setSub] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelMotivo, setCancelMotivo] = useState('');

  const fetchSubscriptionData = async () => {
    const token = localStorage.getItem('easycell_auth_token') || sessionStorage.getItem('easycell_auth_token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [subRes, invRes] = await Promise.all([
        fetch('/api/v1/billing/subscription', { headers }).then((r) => r.json()),
        fetch('/api/v1/billing/invoices', { headers }).then((r) => r.json()),
      ]);

      if (subRes.subscription) setSub(subRes.subscription);
      if (invRes.invoices) setInvoices(invRes.invoices);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const handleUpgrade = async (targetPlanId) => {
    const token = localStorage.getItem('easycell_auth_token') || sessionStorage.getItem('easycell_auth_token');
    try {
      const res = await fetch('/api/v1/billing/subscription/upgrade', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetPlanId }),
      });
      if (res.ok) {
        setUpgradeModal(false);
        fetchSubscriptionData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenPortal = async () => {
    const token = localStorage.getItem('easycell_auth_token') || sessionStorage.getItem('easycell_auth_token');
    try {
      const res = await fetch('/api/v1/billing/portal', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelSub = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('easycell_auth_token') || sessionStorage.getItem('easycell_auth_token');
    try {
      await fetch('/api/v1/billing/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ motivoCancelamento: cancelMotivo }),
      });
      setCancelModal(false);
      fetchSubscriptionData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-cyan-400" />
          Minha Assinatura & Faturamento
        </h1>
        <p className="text-sm text-slate-400">
          Gerencie seu plano ativo, consumo de recursos e histórico de faturas com a segurança do Stripe.
        </p>
      </div>

      {/* Grid Superior: Plano Atual & Medidores de Uso */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Card do Plano */}
        <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-7 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Plano Atual</span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {sub?.status === 'trialing' ? '7 Dias Grátis (Trial)' : sub?.status === 'active' ? 'Ativo' : 'Pendente'}
              </span>
            </div>

            <h2 className="text-3xl font-extrabold text-white mb-2">
              EasyCell {sub?.planId === 'plan_enterprise' ? 'Enterprise' : 'PRO'}
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Acesso total com Laudo Criptografado, Checklist Compulsório e Automações WhatsApp.
            </p>

            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 mb-6">
              <div className="text-xs text-slate-400 mb-1">Próxima renovação:</div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                {sub?.proximaCobranca ? new Date(sub.proximaCobranca).toLocaleDateString('pt-BR') : '25 de Novembro de 2026'}
                <span className="text-xs font-normal text-slate-500">• Cobrança Mensal</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-800/80">
            <button
              onClick={() => setUpgradeModal(true)}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" /> Fazer Upgrade de Plano
            </button>
            <button
              onClick={handleOpenPortal}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
            >
              <span>Gerenciar no Stripe</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Medidores de Uso */}
        <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-7 shadow-xl space-y-5">
          <h3 className="text-base font-bold text-white">Consumo de Recursos no Mês</h3>

          {/* Medidor Lojas */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-300">Lojas / Unidades Físicas:</span>
              <span className="font-bold text-white">1 de 3 Lojas</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full" style={{ width: '33%' }}></div>
            </div>
          </div>

          {/* Medidor Usuários */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-300">Usuários / Técnicos Simultâneos:</span>
              <span className="font-bold text-white">3 de 6 Usuários</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '50%' }}></div>
            </div>
          </div>

          {/* Medidor O.S. */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-300">Ordens de Serviço no Mês:</span>
              <span className="font-bold text-white">42 de 300 O.S.</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '14%' }}></div>
            </div>
          </div>

          {/* Medidor WhatsApp */}
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-300">Disparos de WhatsApp Automáticos:</span>
              <span className="font-bold text-white">189 de 1.500 disparos</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: '12.6%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Histórico de Faturas */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white">Histórico de Faturas</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 border-b border-slate-800">
              <tr>
                <th className="pb-3"># Fatura</th>
                <th className="pb-3">Descrição</th>
                <th className="pb-3">Método</th>
                <th className="pb-3">Valor</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-800/30">
                  <td className="py-3 font-mono text-cyan-400">#{inv.numero}</td>
                  <td className="py-3 text-white font-medium">{inv.descricao}</td>
                  <td className="py-3 text-slate-400 uppercase text-[11px]">
                    {inv.metodoPagamento || 'Cartão'}
                  </td>
                  <td className="py-3 font-bold text-white">
                    R$ {(inv.valorLiquidoCentavos / 100).toFixed(2)}
                  </td>
                  <td className="py-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Paga
                    </span>
                  </td>
                  <td className="py-3 text-slate-400">
                    {new Date(inv.pagoEm || inv.criadoEm).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancelamento Discreto */}
      <div className="text-right">
        <button
          onClick={() => setCancelModal(true)}
          className="text-xs text-slate-500 hover:text-rose-400 transition"
        >
          Cancelar assinatura do sistema
        </button>
      </div>

      {/* Modal de Upgrade */}
      {upgradeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" /> Upgrade para o Plano Enterprise
              </h3>
              <button onClick={() => setUpgradeModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Aumente instantaneamente seu limite para <strong>10 Lojas</strong>, <strong>25 Usuários</strong> e <strong>O.S. Ilimitadas</strong> com cálculo proporcional pro-rata automático pelo Stripe.
            </p>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Novo valor mensal:</span>
                <span className="font-bold text-white text-base">R$ 397,00/mês</span>
              </div>
              <div className="text-[11px] text-cyan-400">Os novos limites são liberados no mesmo segundo.</div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setUpgradeModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Voltar
              </button>
              <button
                onClick={() => handleUpgrade('plan_enterprise')}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20"
              >
                Confirmar Upgrade Pro-Rata
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cancelamento */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Cancelar Assinatura
              </h3>
              <button onClick={() => setCancelModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Tem certeza? Ao cancelar, seu acesso continuará ativo normalmente até o fim do período já pago. Seus dados e laudos não serão excluídos.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Qual o motivo do cancelamento?
              </label>
              <select
                value={cancelMotivo}
                onChange={(e) => setCancelMotivo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="">Selecione um motivo...</option>
                <option value="preco">Preço / Custo mensal</option>
                <option value="pouco_uso">Pouco uso no momento</option>
                <option value="fechamento">Fechamento da assistência</option>
                <option value="outro">Outro motivo</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setCancelModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Manter Assinatura
              </button>
              <button
                onClick={handleCancelSub}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
