import React, { useState, useEffect } from 'react';
import {
  Gift,
  Award,
  TrendingUp,
  Users,
  CheckCircle2,
  Settings,
  Plus,
  Copy,
  Check,
  Share2,
  Clock,
  Sparkles,
  Save,
  ShieldAlert,
  X
} from 'lucide-react';
import { getAuthToken } from '../../lib/auth';

export default function SaasReferralsPage() {
  const [activeTab, setActiveTab] = useState('ranking'); // 'ranking' | 'settings' | 'logs'
  const [stats, setStats] = useState({
    totalIndicacoesPlataforma: 145,
    totalTrialsGerados: 48,
    totalPagosGerados: 23,
    ranking: [
      { id: 'prom_01', tenantId: 'ten_easycell_matriz', empresa: 'EasyCell Matriz', slug: 'easycell-matriz', totalCliques: 74, totalTrials: 18, totalPagos: 6, mesesGanhos: 4, saldoCreditosCentavos: 78800, status: 'ativo' },
      { id: 'prom_02', tenantId: 'ten_cellfix_exp', empresa: 'CellFix Express', slug: 'cellfix-express', totalCliques: 48, totalTrials: 11, totalPagos: 3, mesesGanhos: 2, saldoCreditosCentavos: 39400, status: 'ativo' },
      { id: 'prom_03', tenantId: 'ten_doctor_smart', empresa: 'Doctor Smart Jardins', slug: 'doctor-smart', totalCliques: 31, totalTrials: 7, totalPagos: 2, mesesGanhos: 1, saldoCreditosCentavos: 19700, status: 'ativo' },
      { id: 'prom_04', tenantId: 'ten_smartlab_sp', empresa: 'SmartLab Assistência', slug: 'smartlab-sp', totalCliques: 19, totalTrials: 4, totalPagos: 1, mesesGanhos: 1, saldoCreditosCentavos: 19700, status: 'ativo' },
    ],
    settings: {
      ativo: true,
      trialsParaMesGratis: 3,
      bonusConversaoPagaMeses: 1,
      descontoPorcentoIndicado: 20,
      limiteMaximoMesesGratis: 6,
      validadeCreditosDias: 365,
      mensagemPadraoWhatsapp: 'Olá! Conheça o EasyCell, o sistema mais completo para assistências técnicas de celular. Clique no meu link VIP e ganhe 7 dias grátis no plano PRO: {{link_indicacao}}',
    },
    bonusLogs: [
      { id: 'log_01', data: new Date(Date.now() - 2 * 86400000).toISOString(), empresaBeneficiada: 'EasyCell Matriz', motivo: 'Meta de 3 trials alcançada', creditoConcedido: '1 Mês Grátis (Plano PRO)', valorDescontoCentavos: 19700 },
      { id: 'log_02', data: new Date(Date.now() - 5 * 86400000).toISOString(), empresaBeneficiada: 'CellFix Express', motivo: 'Conversão paga de Loja indicada', creditoConcedido: '1 Mês Grátis (Plano PRO)', valorDescontoCentavos: 19700 },
      { id: 'log_03', data: new Date(Date.now() - 9 * 86400000).toISOString(), empresaBeneficiada: 'EasyCell Matriz', motivo: 'Conversão paga de iFix Barra', creditoConcedido: '1 Mês Grátis (Plano PRO)', valorDescontoCentavos: 19700 },
    ],
  });

  const [settingsForm, setSettingsForm] = useState({
    ativo: true,
    trialsParaMesGratis: 3,
    bonusConversaoPagaMeses: 1,
    descontoPorcentoIndicado: 20,
    limiteMaximoMesesGratis: 6,
    validadeCreditosDias: 365,
    mensagemPadraoWhatsapp: '',
  });

  const [modalCreditoManual, setModalCreditoManual] = useState(false);
  const [novoCredito, setNovoCredito] = useState({
    empresa: '',
    mesesGratis: 1,
    motivo: 'Premiação por indicação de destaque',
  });

  const [salvandoSettings, setSalvandoSettings] = useState(false);
  const [salvoFeedback, setSalvoFeedback] = useState(false);
  const [copiadoLink, setCopiadoLink] = useState(null);

  const carregarDadosReferral = async () => {
    const token = getAuthToken();
    try {
      const res = await fetch('/api/v1/saas/referrals', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        if (data.settings) {
          setSettingsForm(data.settings);
        }
      }
    } catch (err) {
      console.warn('Usando dados resilientes de indicações:', err);
    }
  };

  useEffect(() => {
    carregarDadosReferral();
  }, []);

  const handleSalvarConfiguracoes = async (e) => {
    e.preventDefault();
    setSalvandoSettings(true);
    setSalvoFeedback(false);
    const token = getAuthToken();

    try {
      const res = await fetch('/api/v1/saas/referrals/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settingsForm),
      });

      if (res.ok) {
        setSalvoFeedback(true);
        setTimeout(() => setSalvoFeedback(false), 3000);
      }
    } catch (err) {
      console.error('Erro ao salvar regras:', err);
    } finally {
      setSalvandoSettings(false);
    }
  };

  const handleConcederCredito = async (e) => {
    e.preventDefault();
    if (!novoCredito.empresa) return;

    const token = getAuthToken();
    try {
      const res = await fetch('/api/v1/saas/referrals/credits/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(novoCredito),
      });

      if (res.ok) {
        const data = await res.json();
        setStats((prev) => ({
          ...prev,
          ranking: data.ranking || prev.ranking,
          bonusLogs: [data.log, ...(prev.bonusLogs || [])],
        }));
        setModalCreditoManual(false);
        setNovoCredito({
          empresa: '',
          mesesGratis: 1,
          motivo: 'Premiação por indicação de destaque',
        });
      }
    } catch (err) {
      console.error('Erro ao conceder crédito:', err);
    }
  };

  const copiarLink = (slug) => {
    const url = `https://easycell.vibedocode.pro/r/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiadoLink(slug);
    setTimeout(() => setCopiadoLink(null), 2500);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Gift className="w-6 h-6" />
            </span>
            Programa de Indicações & Motor Viral
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gestão das regras de recompensa, ranking de promotores e concessão de meses grátis.
          </p>
        </div>

        <button
          onClick={() => setModalCreditoManual(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-cyan-500/20 flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Conceder Crédito Manual a Parceiro
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="text-xs text-slate-400 mb-2">Total de Cliques Rastreáveis</div>
          <div className="text-3xl font-black text-white">
            {stats.totalIndicacoesPlataforma}
          </div>
          <div className="text-[11px] text-cyan-400 mt-2">Visitas aos links /r/[slug]</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="text-xs text-slate-400 mb-2">Trials Gratuitos Iniciados</div>
          <div className="text-3xl font-black text-cyan-400">
            {stats.totalTrialsGerados}
          </div>
          <div className="text-[11px] text-slate-400 mt-2">Taxa de conversão clique → trial: 33.1%</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="text-xs text-slate-400 mb-2">Assinaturas Pagas Convertidas</div>
          <div className="text-3xl font-black text-emerald-400">
            {stats.totalPagosGerados}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-2">Meses grátis creditados aos parceiros</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('ranking')}
          className={`pb-4 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'ranking' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Award className="w-4 h-4" />
          Top Assistências Promotoras
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-4 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'settings' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          ⚙️ Configurações das Regras de Indicação
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-4 px-4 text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'logs' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          Histórico de Bonificações Concedidas
        </button>
      </div>

      {/* ABA 1: RANKING E GESTÃO DE PARCEIROS */}
      {activeTab === 'ranking' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white">Ranking de Promotores da Plataforma</h2>
            <p className="text-xs text-slate-400">Lojas que mais divulgam o EasyCell para outras assistências</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3">Posição / Assistência</th>
                  <th className="pb-3">Link de Divulgação</th>
                  <th className="pb-3 text-center">Cliques</th>
                  <th className="pb-3 text-center">Trials</th>
                  <th className="pb-3 text-center">Pagos</th>
                  <th className="pb-3 text-center">Meses Ganhos</th>
                  <th className="pb-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(stats.ranking || []).map((r, index) => (
                  <tr key={r.id || index} className="hover:bg-slate-800/30">
                    <td className="py-4 font-bold text-white flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0
                            ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                            : index === 1
                            ? 'bg-slate-300 text-slate-950'
                            : 'bg-amber-700 text-white'
                        }`}
                      >
                        #{index + 1}
                      </span>
                      <div>
                        <div>{r.empresa}</div>
                        <span className="text-[10px] text-slate-500 font-mono">ID: {r.tenantId}</span>
                      </div>
                    </td>
                    <td className="py-4 font-mono text-cyan-400 text-[11px]">
                      /r/{r.slug}
                    </td>
                    <td className="py-4 text-center font-bold text-slate-300">{r.totalCliques}</td>
                    <td className="py-4 text-center font-bold text-cyan-400">{r.totalTrials}</td>
                    <td className="py-4 text-center font-bold text-emerald-400">{r.totalPagos}</td>
                    <td className="py-4 text-center font-black text-amber-400 text-sm">
                      {r.mesesGanhos} {r.mesesGanhos === 1 ? 'mês' : 'meses'}
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => copiarLink(r.slug)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-bold transition inline-flex items-center gap-1.5"
                      >
                        {copiadoLink === r.slug ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiadoLink === r.slug ? 'Copiado!' : 'Copiar Link'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 2: CONFIGURADOR COMPLETO DAS REGRAS VIRAIS */}
      {activeTab === 'settings' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl max-w-3xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" />
              Parâmetros e Regras de Bonificação do Programa
            </h2>
            <p className="text-xs text-slate-400">Ajuste os gatilhos matemáticos de recompensas do viral loop</p>
          </div>

          <form onSubmit={handleSalvarConfiguracoes} className="space-y-5">
            {/* Toggle Ativo */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <div className="font-bold text-white text-sm">Motor Viral de Indicações Ativo</div>
                <div className="text-xs text-slate-400">Permite que assistências convidem outras e ganhem meses grátis</div>
              </div>
              <button
                type="button"
                onClick={() => setSettingsForm({ ...settingsForm, ativo: !settingsForm.ativo })}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition ${
                  settingsForm.ativo ? 'bg-cyan-500 justify-end' : 'bg-slate-800 justify-start'
                }`}
              >
                <div className="bg-slate-950 w-4 h-4 rounded-full shadow-md" />
              </button>
            </div>

            {/* Regras */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Trials para 1 Mês Grátis (Meta 1)
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settingsForm.trialsParaMesGratis}
                  onChange={(e) => setSettingsForm({ ...settingsForm, trialsParaMesGratis: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-400"
                  required
                />
                <span className="text-[10px] text-slate-500">Padrão: 3 assistências que iniciam o trial de 7 dias</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Bônus por Conversão Paga (Meta 2)
                </label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={settingsForm.bonusConversaoPagaMeses}
                  onChange={(e) => setSettingsForm({ ...settingsForm, bonusConversaoPagaMeses: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-400"
                  required
                />
                <span className="text-[10px] text-slate-500">Meses grátis concedidos quando o indicado paga a 1ª fatura</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Desconto do Convidado (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={settingsForm.descontoPorcentoIndicado}
                  onChange={(e) => setSettingsForm({ ...settingsForm, descontoPorcentoIndicado: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-400"
                  required
                />
                <span className="text-[10px] text-slate-500">Desconto que o amigo indicado recebe ao assinar</span>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Limite Máximo de Meses Grátis Acumuláveis
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={settingsForm.limiteMaximoMesesGratis}
                  onChange={(e) => setSettingsForm({ ...settingsForm, limiteMaximoMesesGratis: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-400"
                  required
                />
                <span className="text-[10px] text-slate-500">Teto por parceiro para controle de margem</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Texto Padrão de Compartilhamento WhatsApp
              </label>
              <textarea
                rows={3}
                value={settingsForm.mensagemPadraoWhatsapp}
                onChange={(e) => setSettingsForm({ ...settingsForm, mensagemPadraoWhatsapp: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-400 leading-relaxed"
                required
              />
              <span className="text-[10px] text-slate-500">Use <code>&#123;&#123;link_indicacao&#125;&#125;</code> como tag dinâmica</span>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={salvandoSettings}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-cyan-500/20 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {salvandoSettings ? 'Salvando...' : 'Salvar Regras do Programa'}
              </button>

              {salvoFeedback && (
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  Regras atualizadas com sucesso!
                </div>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ABA 3: HISTÓRICO DE BONIFICAÇÕES */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div>
            <h2 className="text-lg font-bold text-white">Histórico de Bonificações Concedidas</h2>
            <p className="text-xs text-slate-400">Auditoria completa de meses grátis creditados e abatidos nas faturas</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="pb-3">Data</th>
                  <th className="pb-3">Empresa Beneficiada</th>
                  <th className="pb-3">Motivo / Gatilho</th>
                  <th className="pb-3">Recompensa</th>
                  <th className="pb-3 text-right">Economia Gerada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(stats.bonusLogs || []).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30">
                    <td className="py-3 text-slate-400">{new Date(log.data).toLocaleDateString('pt-BR')}</td>
                    <td className="py-3 font-semibold text-white">{log.empresaBeneficiada}</td>
                    <td className="py-3 text-slate-300">{log.motivo}</td>
                    <td className="py-3 font-bold text-cyan-400">{log.creditoConcedido}</td>
                    <td className="py-3 text-right font-black text-emerald-400">
                      R$ {(log.valorDescontoCentavos / 100).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: CONCEDER CRÉDITO MANUAL */}
      {modalCreditoManual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-cyan-400" />
                Conceder Crédito Manual
              </h3>
              <button onClick={() => setModalCreditoManual(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConcederCredito} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Assistência Parceira</label>
                <select
                  value={novoCredito.empresa}
                  onChange={(e) => setNovoCredito({ ...novoCredito, empresa: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  required
                >
                  <option value="">Selecione a assistência...</option>
                  {(stats.ranking || []).map((r) => (
                    <option key={r.id} value={r.empresa}>
                      {r.empresa} ({r.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Quantidade de Meses Grátis</label>
                <select
                  value={novoCredito.mesesGratis}
                  onChange={(e) => setNovoCredito({ ...novoCredito, mesesGratis: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value={1}>1 Mês Grátis (Abatimento de R$ 197,00)</option>
                  <option value={2}>2 Meses Grátis (Abatimento de R$ 394,00)</option>
                  <option value={3}>3 Meses Grátis (Abatimento de R$ 591,00)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Motivo / Justificativa</label>
                <input
                  type="text"
                  value={novoCredito.motivo}
                  onChange={(e) => setNovoCredito({ ...novoCredito, motivo: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalCreditoManual(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-xl text-xs font-black transition shadow-lg shadow-cyan-500/20"
                >
                  Aplicar Crédito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
