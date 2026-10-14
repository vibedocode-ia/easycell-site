import React, { useState, useEffect } from 'react';
import { Layers, Plus, Check, X, Edit2, Shield, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

export default function SaasPlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    nome: '',
    slug: '',
    descricao: '',
    precoMensal: 197,
    precoAnual: 1970,
    limiteLojas: 3,
    limiteUsuarios: 6,
    limiteOsMensal: 300,
    limiteWhatsappMensal: 1500,
    trialDias: 7,
    features: {
      whatsappAutomation: true,
      laudoPericial: true,
      sofiaSDR: true,
      multiLoja: true,
      crmLeads: true,
    },
  });

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/v1/saas/plans');
      const data = await res.json();
      if (data.plans) setPlans(data.plans);
    } catch (err) {
      console.error('Erro ao buscar planos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenModal = (plan = null) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        nome: plan.nome,
        slug: plan.slug,
        descricao: plan.descricao || '',
        precoMensal: Math.round(plan.precoMensalCentavos / 100),
        precoAnual: Math.round((plan.precoAnualCentavos || 0) / 100),
        limiteLojas: plan.limiteLojas || 1,
        limiteUsuarios: plan.limiteUsuarios || 3,
        limiteOsMensal: plan.limiteOsMensal || 100,
        limiteWhatsappMensal: plan.limiteWhatsappMensal || 500,
        trialDias: plan.trialDias || 0,
        features: plan.features || {},
      });
    } else {
      setEditingPlan(null);
      setFormData({
        nome: '',
        slug: '',
        descricao: '',
        precoMensal: 197,
        precoAnual: 1970,
        limiteLojas: 3,
        limiteUsuarios: 6,
        limiteOsMensal: 300,
        limiteWhatsappMensal: 1500,
        trialDias: 7,
        features: {
          whatsappAutomation: true,
          laudoPericial: true,
          sofiaSDR: true,
          multiLoja: true,
          crmLeads: true,
        },
      });
    }
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('easycell_auth_token') || sessionStorage.getItem('easycell_auth_token');

    try {
      const payload = {
        nome: formData.nome,
        slug: formData.slug || formData.nome.toLowerCase().replace(/\s+/g, '-'),
        descricao: formData.descricao,
        precoMensalCentavos: Number(formData.precoMensal) * 100,
        precoAnualCentavos: Number(formData.precoAnual) * 100,
        limiteLojas: Number(formData.limiteLojas),
        limiteUsuarios: Number(formData.limiteUsuarios),
        limiteOsMensal: Number(formData.limiteOsMensal),
        limiteWhatsappMensal: Number(formData.limiteWhatsappMensal),
        trialDias: Number(formData.trialDias),
        features: formData.features,
      };

      const res = await fetch('/api/v1/saas/plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setModalOpen(false);
        fetchPlans();
      }
    } catch (err) {
      console.error('Erro ao salvar plano:', err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-cyan-400" />
            Criador de Planos & Precificação
          </h1>
          <p className="text-sm text-slate-400">
            Gerencie os planos de assinatura do SaaS sincronizados automaticamente com o Stripe.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition"
        >
          <Plus className="w-4 h-4" /> Novo Plano
        </button>
      </div>

      {/* Grid de Planos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <div
            key={p.id}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl relative"
          >
            {p.destaque && (
              <span className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider">
                Destaque
              </span>
            )}

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xl font-bold text-white">{p.nome}</h3>
                <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-cyan-400 font-mono font-semibold">
                  {p.slug}
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-4 min-h-[36px]">{p.descricao}</p>

              <div className="mb-6 p-3.5 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-2xl font-extrabold text-white">
                  R$ {p.precoMensalCentavos ? p.precoMensalCentavos / 100 : 0}
                  <span className="text-xs font-normal text-slate-400">/mês</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Trial de {p.trialDias} dias configurado
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-500">Lojas:</span>
                  <span className="font-semibold text-white">{p.limiteLojas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Usuários:</span>
                  <span className="font-semibold text-white">{p.limiteUsuarios}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Limite O.S.:</span>
                  <span className="font-semibold text-white">{p.limiteOsMensal || 'Ilimitado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">WhatsApp:</span>
                  <span className="font-semibold text-white">{p.limiteWhatsappMensal}/mês</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                <RefreshCw className="w-3 h-3 animate-pulse" /> Sincronizado no Stripe
              </span>
              <button
                onClick={() => handleOpenModal(p)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Criação / Edição */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                {editingPlan ? 'Editar Plano' : 'Criar Novo Plano SaaS'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nome do Plano</label>
                <input
                  type="text"
                  required
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: PRO Plus"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Preço Mensal (R$)</label>
                  <input
                    type="number"
                    required
                    value={formData.precoMensal}
                    onChange={(e) => setFormData({ ...formData, precoMensal: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Dias de Trial Grátis</label>
                  <input
                    type="number"
                    value={formData.trialDias}
                    onChange={(e) => setFormData({ ...formData, trialDias: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Limite de Lojas</label>
                  <input
                    type="number"
                    value={formData.limiteLojas}
                    onChange={(e) => setFormData({ ...formData, limiteLojas: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Limite de Usuários</label>
                  <input
                    type="number"
                    value={formData.limiteUsuarios}
                    onChange={(e) => setFormData({ ...formData, limiteUsuarios: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  Salvar Plano
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
