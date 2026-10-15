import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
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
  Sparkles,
  Pencil,
  Link as LinkIcon,
  Copy,
  Check,
  RefreshCw,
  MessageSquare,
  Share2,
  ArrowUpRight
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
  const [modalEditarTenant, setModalEditarTenant] = useState(false);
  const [tenantEdicao, setTenantEdicao] = useState(null);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [modalLinkAtivacao, setModalLinkAtivacao] = useState(false);
  const [linkAtivacaoDados, setLinkAtivacaoDados] = useState({
    tenantNome: '',
    tenantId: '',
    link: '',
    token: '',
    telefone: '',
    expiraEm: '',
    status: ''
  });
  const [copiadoLink, setCopiadoLink] = useState(false);
  const [renovandoLink, setRenovandoLink] = useState(false);

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

    const handleOpenNovo = () => setModalNovoTenant(true);
    window.addEventListener('easycell_open_novo_tenant', handleOpenNovo);
    return () => window.removeEventListener('easycell_open_novo_tenant', handleOpenNovo);
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

  // Abrir modal de edição com os dados da empresa cliente
  const handleAbrirEditar = (tenant) => {
    setTenantEdicao({
      id: tenant.id,
      nomeEmpresa: tenant.nomeEmpresa || '',
      slug: tenant.slug || '',
      cnpj: tenant.cnpj || '',
      emailResponsavel: tenant.emailResponsavel || '',
      telefone: tenant.telefone || '',
      plano: tenant.plano || 'pro',
      statusAssinatura: tenant.statusAssinatura || 'ativa',
      valorMensalidade: String(Math.round((tenant.valorMensalidade || 19700) / 100)),
      limiteLojas: String(tenant.limiteLojas || 3)
    });
    setModalEditarTenant(true);
  };

  // Salvar alterações da empresa cliente
  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    if (!tenantEdicao) return;
    setSalvandoEdicao(true);

    const token = localStorage.getItem('easycell_token');
    const payload = {
      nomeEmpresa: tenantEdicao.nomeEmpresa,
      cnpj: tenantEdicao.cnpj,
      emailResponsavel: tenantEdicao.emailResponsavel,
      telefone: tenantEdicao.telefone,
      plano: tenantEdicao.plano,
      statusAssinatura: tenantEdicao.statusAssinatura,
      valorMensalidade: Number(tenantEdicao.valorMensalidade) * 100,
      limiteLojas: Number(tenantEdicao.limiteLojas)
    };

    try {
      await fetch(`/api/v1/saas/tenants/${tenantEdicao.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('API indisponível, salvando alteração localmente');
    }

    setTenantsList(prev => prev.map(t => {
      if (t.id === tenantEdicao.id) {
        return {
          ...t,
          ...payload
        };
      }
      return t;
    }));

    setSalvandoEdicao(false);
    setModalEditarTenant(false);
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
        const activationUrl = data.activationLink
          ? `${window.location.origin}${data.activationLink}`
          : `${window.location.origin}/ativar/${data.inviteToken}`;

        setLinkAtivacaoDados({
          tenantNome: data.tenant.nomeEmpresa,
          tenantId: data.tenant.id,
          link: activationUrl,
          token: data.inviteToken,
          telefone: data.tenant.telefone,
          expiraEm: data.invite?.expiraEm
        });
        setModalLinkAtivacao(true);
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
        const mockToken = `act_${Date.now()}`;
        setLinkAtivacaoDados({
          tenantNome: novoTenantObj.nomeEmpresa,
          tenantId: localCriado.id,
          link: `${window.location.origin}/ativar/${mockToken}`,
          token: mockToken,
          telefone: novoTenantObj.telefone
        });
        setModalLinkAtivacao(true);
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
      const mockToken = `act_${Date.now()}`;
      setLinkAtivacaoDados({
        tenantNome: novoTenantObj.nomeEmpresa,
        tenantId: localCriado.id,
        link: `${window.location.origin}/ativar/${mockToken}`,
        token: mockToken,
        telefone: novoTenantObj.telefone
      });
      setModalLinkAtivacao(true);
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

  // Abrir ou consultar link de primeiro acesso
  const handleAbrirLinkAtivacao = async (t) => {
    const token = localStorage.getItem('easycell_token');
    try {
      const res = await fetch(`/api/v1/saas/tenants/${t.id}/link-ativacao`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (res.ok && data.invite) {
        setLinkAtivacaoDados({
          tenantNome: t.nomeEmpresa,
          tenantId: t.id,
          link: `${window.location.origin}/ativar/${data.invite.token}`,
          token: data.invite.token,
          telefone: t.telefone,
          expiraEm: data.invite.expiraEm,
          status: data.invite.status
        });
        setModalLinkAtivacao(true);
        return;
      }
    } catch (e) {}

    // Se não tiver ou falhar, renova/gera novo link
    await handleRenovarLink(t);
  };

  // Renovar link de ativação por mais 7 dias
  const handleRenovarLink = async (tenantOuId) => {
    setRenovandoLink(true);
    const tenantId = typeof tenantOuId === 'string' ? tenantOuId : (tenantOuId?.id || linkAtivacaoDados.tenantId);
    const token = localStorage.getItem('easycell_token');

    try {
      const res = await fetch(`/api/v1/saas/tenants/${tenantId}/renovar-link`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (res.ok && data.invite) {
        setLinkAtivacaoDados({
          tenantNome: data.invite.nomeEmpresa || linkAtivacaoDados.tenantNome,
          tenantId,
          link: `${window.location.origin}/ativar/${data.invite.token}`,
          token: data.invite.token,
          telefone: data.invite.telefone || linkAtivacaoDados.telefone,
          expiraEm: data.invite.expiraEm,
          status: data.invite.status
        });
        setModalLinkAtivacao(true);
      }
    } catch (e) {
      console.warn('Erro ao renovar link');
    } finally {
      setRenovandoLink(false);
    }
  };

  // Copiar link de ativação para a área de transferência
  const handleCopiarLink = () => {
    if (!linkAtivacaoDados.link) return;
    navigator.clipboard.writeText(linkAtivacaoDados.link);
    setCopiadoLink(true);
    setTimeout(() => setCopiadoLink(false), 2000);
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
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            Gestão da Plataforma B2B
          </h1>
          <p className="text-xs text-slate-400">
            Painel Executivo de Assistências Técnicas Assinantes & Faturamento Recorrente
          </p>
        </div>

        <button
          onClick={() => setModalNovoTenant(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-500/20 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Assistência (Tenant)</span>
        </button>
      </div>

      {/* KPI Cards - 100% Clicáveis e Interativos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: MRR -> Leva ao Gerenciador Financeiro */}
        <NavLink
          to="/admin/saas/financeiro"
          className="bg-slate-900/80 border border-slate-800 hover:border-emerald-400/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden group transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-lg hover:bg-slate-900 select-none block"
          title="Ver Gerenciador Financeiro e Dunning"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 group-hover:text-emerald-300 transition-colors">MRR (Recorrência)</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all shrink-0">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono group-hover:text-emerald-400 transition-colors">
            R$ {mrrTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] sm:text-[11px] text-emerald-400 flex items-center justify-between mt-1 font-semibold">
            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Faturamento ativo</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
        </NavLink>

        {/* Card 2: Empresas Ativas -> Rola para tabela de Tenants */}
        <button
          type="button"
          onClick={() => document.getElementById('tabela-tenants')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-slate-900/80 border border-slate-800 hover:border-cyan-400/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden group transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-lg hover:bg-slate-900 select-none text-left w-full"
          title="Rolar para lista de empresas cadastradas"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 group-hover:text-cyan-300 transition-colors">Empresas Assinantes</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:scale-110 transition-all shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono group-hover:text-cyan-400 transition-colors">
            {totalAssinantesAtivos} <span className="text-sm text-slate-500 font-sans font-normal">/ {tenantsList.length}</span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-cyan-400 flex items-center justify-between mt-1 font-semibold">
            <span>{tenantsList.length - totalAssinantesAtivos} suspensas</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
        </button>

        {/* Card 3: Total Lojas Físicas -> Leva para Gestão de Filiais */}
        <NavLink
          to="/system/lojas"
          className="bg-slate-900/80 border border-slate-800 hover:border-blue-400/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden group transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-lg hover:bg-slate-900 select-none block"
          title="Ver Gestão de Filiais e Lojas"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 group-hover:text-blue-300 transition-colors">Lojas & Filiais</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:scale-110 transition-all shrink-0">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono group-hover:text-blue-400 transition-colors">
            {totalLojasGerais}
          </div>
          <div className="text-[10px] sm:text-[11px] text-blue-400 flex items-center justify-between mt-1 font-semibold">
            <span>Filiais ativas</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
        </NavLink>

        {/* Card 4: Total O.S. Processadas -> Leva para Quadro de O.S. */}
        <NavLink
          to="/system/os"
          className="bg-slate-900/80 border border-slate-800 hover:border-cyan-400/80 rounded-2xl p-4 sm:p-5 relative overflow-hidden group transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-lg hover:bg-slate-900 select-none block"
          title="Ver Ordens de Serviço Globais no Kanban"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-400 group-hover:text-cyan-300 transition-colors">Volume de O.S.</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:scale-110 transition-all shrink-0">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono group-hover:text-cyan-400 transition-colors">
            {totalOsGerais.toLocaleString('pt-BR')}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 flex items-center justify-between mt-1">
            <span>Mês atual</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </div>
        </NavLink>
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
      <div id="tabela-tenants" className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl scroll-mt-24">
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

                  <td className="py-4 px-5 text-right space-x-2">
                    <button
                      onClick={() => handleAbrirLinkAtivacao(t)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 border border-cyan-800/60"
                      title="Link de Ativação e Primeiro Acesso"
                    >
                      <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Link de Acesso</span>
                    </button>

                    <button
                      onClick={() => handleAbrirEditar(t)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600"
                    >
                      <Pencil className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Editar</span>
                    </button>

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
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Cadastrar Nova Assistência</h3>
                  <p className="text-[11px] text-slate-400">Cria a conta e gera o link de primeiro acesso do cliente</p>
                </div>
              </div>
              <button
                onClick={() => setModalNovoTenant(false)}
                className="text-slate-400 hover:text-white text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Aviso explicativo do fluxo de ativação */}
            <div className="p-3 bg-cyan-950/40 border border-cyan-800/40 rounded-2xl flex items-start gap-2.5 text-xs text-cyan-200">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-white">Primeiro Acesso do Cliente:</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Você apenas cadastra a empresa e o plano. O sistema gerará um link exclusivo para o cliente criar a própria senha e preencher CNPJ/CPF, endereço e dados da loja.
                </p>
              </div>
            </div>

            <form onSubmit={handleCriarTenant} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome da Empresa / Assistência *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: SmartFix Centro Técnico"
                  value={novoForm.nomeEmpresa}
                  onChange={(e) => {
                    const nome = e.target.value;
                    const autoSlug = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
                    setNovoForm({ 
                      ...novoForm, 
                      nomeEmpresa: nome,
                      slug: novoForm.slug ? novoForm.slug : autoSlug 
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">WhatsApp do Responsável</label>
                  <input
                    type="text"
                    placeholder="(21) 99999-9999"
                    value={novoForm.telefone}
                    onChange={(e) => setNovoForm({ ...novoForm, telefone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Para disparo do link de ativação</span>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">E-mail do Responsável</label>
                  <input
                    type="email"
                    required
                    placeholder="cliente@empresa.com"
                    value={novoForm.emailResponsavel}
                    onChange={(e) => setNovoForm({ ...novoForm, emailResponsavel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Login prévio do responsável</span>
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
                    <option value="starter">Starter (1 loja)</option>
                    <option value="pro">Pro (Até 3 lojas)</option>
                    <option value="enterprise">Enterprise (10 lojas)</option>
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

              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800/60">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Slug / Identificador</label>
                  <input
                    type="text"
                    placeholder="smartfix-sp"
                    value={novoForm.slug}
                    onChange={(e) => setNovoForm({ ...novoForm, slug: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-cyan-400 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">CNPJ / CPF (Opcional)</label>
                  <input
                    type="text"
                    placeholder="O cliente preencherá"
                    value={novoForm.cnpj}
                    onChange={(e) => setNovoForm({ ...novoForm, cnpj: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800/80 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-cyan-400 text-[11px]"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalNovoTenant(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={carregando}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {carregando ? 'Criando e Gerando Link...' : 'Criar e Gerar Link de Acesso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Edição de Empresa Cliente */}
      {modalEditarTenant && tenantEdicao && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Editar Empresa Cliente</h3>
                  <p className="text-[11px] text-slate-400 font-mono">ID: {tenantEdicao.id}</p>
                </div>
              </div>
              <button
                onClick={() => setModalEditarTenant(false)}
                className="text-slate-400 hover:text-white text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarEdicao} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome da Empresa / Fantasia</label>
                <input
                  type="text"
                  required
                  value={tenantEdicao.nomeEmpresa}
                  onChange={(e) => setTenantEdicao({ ...tenantEdicao, nomeEmpresa: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-400 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">CNPJ</label>
                  <input
                    type="text"
                    value={tenantEdicao.cnpj}
                    onChange={(e) => setTenantEdicao({ ...tenantEdicao, cnpj: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status da Assinatura</label>
                  <select
                    value={tenantEdicao.statusAssinatura}
                    onChange={(e) => setTenantEdicao({ ...tenantEdicao, statusAssinatura: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-400 font-bold"
                  >
                    <option value="ativa">Ativa</option>
                    <option value="suspensa">Suspensa</option>
                    <option value="pendente">Pendente</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">E-mail do Responsável</label>
                  <input
                    type="email"
                    required
                    value={tenantEdicao.emailResponsavel}
                    onChange={(e) => setTenantEdicao({ ...tenantEdicao, emailResponsavel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={tenantEdicao.telefone}
                    onChange={(e) => setTenantEdicao({ ...tenantEdicao, telefone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Plano</label>
                  <select
                    value={tenantEdicao.plano}
                    onChange={(e) => {
                      const p = e.target.value;
                      let valor = tenantEdicao.valorMensalidade;
                      let limite = tenantEdicao.limiteLojas;
                      if (p === 'starter') { valor = '97'; limite = '1'; }
                      if (p === 'pro') { valor = '197'; limite = '3'; }
                      if (p === 'enterprise') { valor = '497'; limite = '10'; }
                      setTenantEdicao({ ...tenantEdicao, plano: p, valorMensalidade: valor, limiteLojas: limite });
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
                    value={tenantEdicao.valorMensalidade}
                    onChange={(e) => setTenantEdicao({ ...tenantEdicao, valorMensalidade: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Limite Lojas</label>
                  <input
                    type="number"
                    value={tenantEdicao.limiteLojas}
                    onChange={(e) => setTenantEdicao({ ...tenantEdicao, limiteLojas: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setModalEditarTenant(false);
                    handleAbrirLinkAtivacao(tenantEdicao);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 hover:bg-cyan-900 text-xs font-bold transition cursor-pointer"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Link de Acesso</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setModalEditarTenant(false)}
                    className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={salvandoEdicao}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {salvandoEdicao ? 'Salvando Alterações...' : 'Salvar Alterações'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Link de Ativação / Primeiro Acesso */}
      {modalLinkAtivacao && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Cabeçalho */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-inner">
                  <LinkIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    Link de Primeiro Acesso
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      7 Dias
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {linkAtivacaoDados.tenantNome || 'Empresa Cliente'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalLinkAtivacao(false)}
                className="text-slate-400 hover:text-white text-xl p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Informação explicativa */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl text-xs space-y-2">
              <p className="text-slate-300 font-semibold">
                O cliente utilizará este link seguro para configurar a conta:
              </p>
              <ul className="text-slate-400 text-[11px] space-y-1 list-disc list-inside">
                <li>Definir a senha do usuário gestor / admin</li>
                <li>Preencher CNPJ ou CPF e Razão Social</li>
                <li>Cadastrar endereço completo da loja com auto-busca de CEP</li>
                <li>Ao salvar, o cliente é autenticado diretamente no sistema</li>
              </ul>
            </div>

            {/* Caixa do Link */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Link Exclusivo de Ativação
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={linkAtivacaoDados.link || ''}
                  className="w-full bg-slate-950 border border-cyan-500/30 rounded-xl px-3.5 py-2.5 text-cyan-300 font-mono text-xs focus:outline-none select-all"
                />
                <button
                  type="button"
                  onClick={handleCopiarLink}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                    copiadoLink
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 active:scale-95'
                  }`}
                >
                  {copiadoLink ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Link</span>
                    </>
                  )}
                </button>
              </div>
              {linkAtivacaoDados.expiraEm && (
                <p className="text-[10px] text-slate-500 font-mono">
                  Expira em: {new Date(linkAtivacaoDados.expiraEm).toLocaleDateString('pt-BR')} às {new Date(linkAtivacaoDados.expiraEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>

            {/* Ações de Envio: WhatsApp e Renovação */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              {linkAtivacaoDados.telefone && (
                <a
                  href={`https://wa.me/55${linkAtivacaoDados.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Olá! Seu acesso à plataforma EasyCell foi criado.\n\nAcesse o link exclusivo abaixo para definir sua senha e preencher os dados da sua assistência:\n${linkAtivacaoDados.link}\n\nEste link é válido por 7 dias.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/20 active:scale-95 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Enviar por WhatsApp</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => handleRenovarLink(linkAtivacaoDados.tenantId)}
                disabled={renovandoLink}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${renovandoLink ? 'animate-spin' : ''}`} />
                <span>{renovandoLink ? 'Renovando...' : 'Renovar Link (+7 dias)'}</span>
              </button>
            </div>

            {/* Rodapé */}
            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setModalLinkAtivacao(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
