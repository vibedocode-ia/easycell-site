import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Store, 
  TrendingUp, 
  Users, 
  ShieldAlert, 
  ShieldCheck, 
  Plus, 
  Search, 
  Filter, 
  ExternalLink, 
  DollarSign, 
  AlertCircle,
  CheckCircle2,
  Lock,
  Unlock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { VERSION } from '../../lib/version';

export default function AdminSaasPage() {
  const [tenantsList, setTenantsList] = useState([
    {
      id: 'ten_easycell_matriz',
      nomeEmpresa: 'EasyCell Smartphone Lab (Matriz)',
      slug: 'easycell-matriz',
      cnpj: '12.345.678/0001-90',
      emailResponsavel: 'vanderson@vibedocode.pro',
      telefone: '(11) 99876-5432',
      plano: 'enterprise',
      statusAssinatura: 'ativa',
      valorMensalidade: 49700,
      limiteLojas: 10,
      totalLojas: 3,
      totalOsMes: 480,
      criadoEm: '2026-01-15'
    },
    {
      id: 'ten_iphonetec_sp',
      nomeEmpresa: 'iPhoneTec Assistência & Acessórios',
      slug: 'iphonetec-sp',
      cnpj: '98.765.432/0001-11',
      emailResponsavel: 'marcos@iphonetec.com.br',
      telefone: '(11) 98765-4321',
      plano: 'pro',
      statusAssinatura: 'ativa',
      valorMensalidade: 19700,
      limiteLojas: 3,
      totalLojas: 2,
      totalOsMes: 195,
      criadoEm: '2026-03-02'
    },
    {
      id: 'ten_fixcell_rj',
      nomeEmpresa: 'FixCell Centro de Reparos',
      slug: 'fixcell-rj',
      cnpj: '45.123.890/0001-55',
      emailResponsavel: 'roberto@fixcell.com.br',
      telefone: '(21) 97654-3210',
      plano: 'starter',
      statusAssinatura: 'suspensa',
      valorMensalidade: 9700,
      limiteLojas: 1,
      totalLojas: 1,
      totalOsMes: 62,
      criadoEm: '2026-05-18'
    }
  ]);

  const [busca, setBusca] = useState('');
  const [filtroPlano, setFiltroPlano] = useState('todos');
  const [modalNovoTenant, setModalNovoTenant] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const [novoForm, setNovoForm] = useState({
    nomeEmpresa: '',
    slug: '',
    cnpj: '',
    emailResponsavel: '',
    telefone: '',
    plano: 'pro',
    valorMensalidade: '197',
    limiteLojas: '3'
  });

  // Busca inicial no backend
  useEffect(() => {
    const fetchTenants = async () => {
      const token = localStorage.getItem('easycell_token');
      try {
        const res = await fetch('/api/v1/saas/tenants', {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.tenants && data.tenants.length > 0) {
            setTenantsList(prev => {
              const ids = new Set(data.tenants.map(t => t.id));
              const merged = [...data.tenants];
              prev.forEach(p => {
                if (!ids.has(p.id)) merged.push(p);
              });
              return merged;
            });
          }
        }
      } catch (err) {
        // standalone mode
      }
    };
    fetchTenants();
  }, []);

  // Alternar suspensão de assinatura
  const handleToggleStatus = async (tenantId, statusAtual) => {
    const novoStatus = statusAtual === 'ativa' ? 'suspensa' : 'ativa';
    const token = localStorage.getItem('easycell_token');

    try {
      await fetch(`/api/v1/saas/tenants/${tenantId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ statusAssinatura: novoStatus })
      });
    } catch (err) {
      // offline fallback
    }

    setTenantsList(prev => prev.map(t => {
      if (t.id === tenantId) {
        return { ...t, statusAssinatura: novoStatus };
      }
      return t;
    }));
  };

  // Cadastrar nova empresa assinante
  const handleCriarTenant = async (e) => {
    e.preventDefault();
    setCarregando(true);
    const token = localStorage.getItem('easycell_token');

    const novoTenantObj = {
      nomeEmpresa: novoForm.nomeEmpresa,
      slug: novoForm.slug || novoForm.nomeEmpresa.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      cnpj: novoForm.cnpj,
      emailResponsavel: novoForm.emailResponsavel,
      telefone: novoForm.telefone,
      plano: novoForm.plano,
      valorMensalidade: Number(novoForm.valorMensalidade) * 100,
      limiteLojas: Number(novoForm.limiteLojas),
    };

    try {
      const res = await fetch('/api/v1/saas/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(novoTenantObj)
      });

      if (res.ok) {
        const data = await res.json();
        setTenantsList(prev => [data.tenant, ...prev]);
      } else {
        // Fallback local para preview
        const localCriado = {
          ...novoTenantObj,
          id: `ten_${novoTenantObj.slug}`,
          statusAssinatura: 'ativa',
          totalLojas: 1,
          totalOsMes: 0,
          criadoEm: new Date().toISOString()
        };
        setTenantsList(prev => [localCriado, ...prev]);
      }
    } catch (err) {
      const localCriado = {
        ...novoTenantObj,
        id: `ten_${novoTenantObj.slug}`,
        statusAssinatura: 'ativa',
        totalLojas: 1,
        totalOsMes: 0,
        criadoEm: new Date().toISOString()
      };
      setTenantsList(prev => [localCriado, ...prev]);
    } finally {
      setCarregando(false);
      setModalNovoTenant(false);
      setNovoForm({
        nomeEmpresa: '',
        slug: '',
        cnpj: '',
        emailResponsavel: '',
        telefone: '',
        plano: 'pro',
        valorMensalidade: '197',
        limiteLojas: '3'
      });
    }
  };

  // Cálculo de Métricas SaaS
  const mrrTotal = tenantsList
    .filter(t => t.statusAssinatura === 'ativa')
    .reduce((acc, t) => acc + (t.valorMensalidade || 19700), 0) / 100;

  const totalAssinantesAtivos = tenantsList.filter(t => t.statusAssinatura === 'ativa').length;
  const totalLojasGerais = tenantsList.reduce((acc, t) => acc + (t.totalLojas || 1), 0);
  const totalOsGerais = tenantsList.reduce((acc, t) => acc + (t.totalOsMes || 0), 0);

  // Filtro
  const listaFiltrada = tenantsList.filter(t => {
    const matchBusca = 
      t.nomeEmpresa.toLowerCase().includes(busca.toLowerCase()) ||
      (t.cnpj && t.cnpj.includes(busca)) ||
      (t.emailResponsavel && t.emailResponsavel.toLowerCase().includes(busca.toLowerCase()));
    const matchPlano = filtroPlano === 'todos' || t.plano === filtroPlano;
    return matchBusca && matchPlano;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3 h-3" /> Super Admin SaaS
            </span>
            <span className="text-xs text-slate-500 font-mono">v{VERSION}</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            Gestão da Plataforma B2B
          </h1>
          <p className="text-xs text-slate-400">
            Painel Executivo de Assistências Técnicas Assinantes & Faturamento Recorrente
          </p>
        </div>

        <button
          onClick={() => setModalNovoTenant(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-500/20 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Assistência (Tenant)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* MRR */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">MRR (Recorrência)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            R$ {mrrTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-semibold">
            <TrendingUp className="w-3 h-3" /> Faturamento ativo consolidado
          </div>
        </div>

        {/* Empresas Ativas */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Empresas Assinantes</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {totalAssinantesAtivos} <span className="text-sm text-slate-500 font-sans font-normal">/ {tenantsList.length}</span>
          </div>
          <div className="text-[11px] text-cyan-400 mt-1 font-semibold">
            {tenantsList.length - totalAssinantesAtivos} suspensas ou pendentes
          </div>
        </div>

        {/* Total Lojas Físicas */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Lojas & Filiais Físicas</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {totalLojasGerais}
          </div>
          <div className="text-[11px] text-blue-400 mt-1 font-semibold">
            Pontos de atendimento no Brasil
          </div>
        </div>

        {/* Total O.S. Processadas */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Volume de O.S. (Mês)</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {totalOsGerais.toLocaleString('pt-BR')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Média de {totalAssinantesAtivos > 0 ? Math.round(totalOsGerais / totalAssinantesAtivos) : 0} O.S. por assistência
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome da empresa, CNPJ ou email..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={filtroPlano}
            onChange={(e) => setFiltroPlano(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
          >
            <option value="todos">Todos os Planos</option>
            <option value="starter">Starter (1 loja)</option>
            <option value="pro">Pro (Até 3 lojas)</option>
            <option value="enterprise">Enterprise (Ilimitado)</option>
          </select>
        </div>
      </div>

      {/* Tabela de Inquilinos */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            Empresas Clientes Cadastradas ({listaFiltrada.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-5">Empresa / Tenant</th>
                <th className="py-3.5 px-5">Responsável & Contato</th>
                <th className="py-3.5 px-5">Plano Contratado</th>
                <th className="py-3.5 px-5">Lojas Ativas</th>
                <th className="py-3.5 px-5">Mensalidade</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {listaFiltrada.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-5">
                    <div className="font-bold text-white text-sm">{t.nomeEmpresa}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      slug: <span className="text-cyan-400">{t.slug}</span> {t.cnpj && `• CNPJ: ${t.cnpj}`}
                    </div>
                  </td>

                  <td className="py-4 px-5">
                    <div className="text-slate-200">{t.emailResponsavel}</div>
                    <div className="text-[11px] text-slate-400">{t.telefone || 'Sem telefone'}</div>
                  </td>

                  <td className="py-4 px-5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase font-mono border ${
                      t.plano === 'enterprise' 
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : t.plano === 'pro'
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}>
                      {t.plano}
                    </span>
                  </td>

                  <td className="py-4 px-5 font-mono">
                    <span className="text-white font-bold">{t.totalLojas || 1}</span>
                    <span className="text-slate-500 text-[11px]"> / {t.limiteLojas}</span>
                  </td>

                  <td className="py-4 px-5 font-mono font-bold text-white">
                    R$ {((t.valorMensalidade || 19700) / 100).toFixed(2)}
                  </td>

                  <td className="py-4 px-5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                      t.statusAssinatura === 'ativa'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${t.statusAssinatura === 'ativa' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      {t.statusAssinatura}
                    </span>
                  </td>

                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => handleToggleStatus(t.id, t.statusAssinatura)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        t.statusAssinatura === 'ativa'
                          ? 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60'
                          : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60'
                      }`}
                    >
                      {t.statusAssinatura === 'ativa' ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Suspender</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Reativar</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cadastro de Novo Tenant */}
      {modalNovoTenant && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-white">Cadastrar Nova Assistência (Tenant)</h3>
              </div>
              <button
                onClick={() => setModalNovoTenant(false)}
                className="text-slate-400 hover:text-white text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCriarTenant} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome da Assistência / Empresa</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: SmartFix Centro Técnico"
                  value={novoForm.nomeEmpresa}
                  onChange={(e) => setNovoForm({ ...novoForm, nomeEmpresa: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Slug (Identificador)</label>
                  <input
                    type="text"
                    placeholder="smartfix-sp"
                    value={novoForm.slug}
                    onChange={(e) => setNovoForm({ ...novoForm, slug: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">CNPJ (Opcional)</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0001-00"
                    value={novoForm.cnpj}
                    onChange={(e) => setNovoForm({ ...novoForm, cnpj: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email do Responsável</label>
                  <input
                    type="email"
                    required
                    placeholder="gestor@empresa.com"
                    value={novoForm.emailResponsavel}
                    onChange={(e) => setNovoForm({ ...novoForm, emailResponsavel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(11) 99999-9999"
                    value={novoForm.telefone}
                    onChange={(e) => setNovoForm({ ...novoForm, telefone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Plano SaaS</label>
                  <select
                    value={novoForm.plano}
                    onChange={(e) => {
                      const p = e.target.value;
                      let valor = '197';
                      let limite = '3';
                      if (p === 'starter') { valor = '97'; limite = '1'; }
                      if (p === 'enterprise') { valor = '497'; limite = '10'; }
                      setNovoForm({ ...novoForm, plano: p, valorMensalidade: valor, limiteLojas: limite });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="starter">Starter</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mensalidade (R$)</label>
                  <input
                    type="number"
                    value={novoForm.valorMensalidade}
                    onChange={(e) => setNovoForm({ ...novoForm, valorMensalidade: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Limite Lojas</label>
                  <input
                    type="number"
                    value={novoForm.limiteLojas}
                    onChange={(e) => setNovoForm({ ...novoForm, limiteLojas: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalNovoTenant(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={carregando}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50"
                >
                  {carregando ? 'Criando Tenant...' : 'Criar e Ativar Tenant'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
