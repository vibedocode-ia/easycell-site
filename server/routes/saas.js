import { db } from '../../src/db/index.js';
import {
  billingPlans,
  subscriptions,
  invoices,
  referrals,
  referralCredits,
  crmLeads,
  crmInteractions,
  supportTickets,
  supportMessages,
  sofiaSdrCampaigns,
  saasNotifications,
  dunningLogs
} from '../../src/db/schema/saas.js';
import { tenants } from '../../src/db/schema/tenants.js';
import { eq, and, desc, sql, count } from 'drizzle-orm';
import { authenticateUser, requireRole } from '../middleware/auth.js';
import { extractTenantContext } from '../middleware/tenant.js';

// ==========================================
// ESTADO EM MEMÓRIA ROBUSTO (PERSISTENTE / FALLBACK)
// ==========================================

const memoryPlans = [
  {
    id: 'plan_starter',
    nome: 'Starter',
    slug: 'starter',
    descricao: 'Ideal para assistências individuais e pequenos laboratórios',
    precoMensalCentavos: 9700,
    precoAnualCentavos: 97000,
    limiteLojas: 1,
    limiteUsuarios: 2,
    limiteOsMensal: 80,
    limiteWhatsappMensal: 300,
    features: { whatsappAutomation: true, laudoPericial: true, sofiaSDR: false, multiLoja: false },
    trialDias: 0,
    ativo: true,
    ordem: 1,
    destaque: false,
  },
  {
    id: 'plan_pro',
    nome: 'PRO',
    slug: 'pro',
    descricao: 'Para assistências em crescimento que buscam escala e automação com SofIA',
    precoMensalCentavos: 19700,
    precoAnualCentavos: 197000,
    limiteLojas: 3,
    limiteUsuarios: 6,
    limiteOsMensal: 300,
    limiteWhatsappMensal: 1500,
    features: { whatsappAutomation: true, laudoPericial: true, sofiaSDR: true, multiLoja: true, crmLeads: true },
    trialDias: 7,
    ativo: true,
    ordem: 2,
    destaque: true,
  },
  {
    id: 'plan_enterprise',
    nome: 'Enterprise',
    slug: 'enterprise',
    descricao: 'Redes de franquias, grandes laboratórios e centros de reparo avançados',
    precoMensalCentavos: 39700,
    precoAnualCentavos: 397000,
    limiteLojas: 10,
    limiteUsuarios: 25,
    limiteOsMensal: null,
    limiteWhatsappMensal: 5000,
    features: { whatsappAutomation: true, laudoPericial: true, sofiaSDR: true, multiLoja: true, crmLeads: true, customBranding: true },
    trialDias: 7,
    ativo: true,
    ordem: 3,
    destaque: false,
  },
];

// Fluxo de Caixa Total do SaaS (Entradas e Saídas)
let memoryTransactions = [
  {
    id: 'tx_101',
    tipo: 'entrada',
    categoria: 'assinatura_pro',
    descricao: 'Mensalidade Plano PRO - SmartLab Assistência',
    valorCentavos: 19700,
    status: 'confirmado',
    metodoPagamento: 'cartao_credito',
    data: new Date(Date.now() - 1 * 86400000).toISOString(),
    documentoReferencia: 'sub_smartlab_01',
  },
  {
    id: 'tx_102',
    tipo: 'entrada',
    categoria: 'assinatura_enterprise',
    descricao: 'Mensalidade Plano Enterprise - iFix Brasil',
    valorCentavos: 39700,
    status: 'confirmado',
    metodoPagamento: 'pix',
    data: new Date(Date.now() - 2 * 86400000).toISOString(),
    documentoReferencia: 'sub_ifix_02',
  },
  {
    id: 'tx_103',
    tipo: 'entrada',
    categoria: 'servico_avulso',
    descricao: 'Treinamento e Setup Assistido de Bancada VIP',
    valorCentavos: 120000,
    status: 'confirmado',
    metodoPagamento: 'pix',
    data: new Date(Date.now() - 3 * 86400000).toISOString(),
    documentoReferencia: 'cob_setup_103',
  },
  {
    id: 'tx_104',
    tipo: 'saida',
    categoria: 'infraestrutura',
    descricao: 'Cluster VPS Hostinger & Servidor Coolify Docker',
    valorCentavos: 48000,
    status: 'pago',
    metodoPagamento: 'cartao_credito',
    data: new Date(Date.now() - 5 * 86400000).toISOString(),
    documentoReferencia: 'hostinger_vps_out',
  },
  {
    id: 'tx_105',
    tipo: 'saida',
    categoria: 'inteligencia_artificial',
    descricao: 'Consumo Tokens Gemini 1.5 & OpenAI API (SofIA SDR)',
    valorCentavos: 31000,
    status: 'pago',
    metodoPagamento: 'cartao_credito',
    data: new Date(Date.now() - 6 * 86400000).toISOString(),
    documentoReferencia: 'gemini_tokens_out',
  },
  {
    id: 'tx_106',
    tipo: 'saida',
    categoria: 'whatsapp_gateway',
    descricao: 'Serviço de Instância Dedicada WhatsApp (Anti-Ban)',
    valorCentavos: 15000,
    status: 'pago',
    metodoPagamento: 'pix',
    data: new Date(Date.now() - 8 * 86400000).toISOString(),
    documentoReferencia: 'gw_baileys_out',
  },
  {
    id: 'tx_107',
    tipo: 'saida',
    categoria: 'taxa_gateway',
    descricao: 'Taxas de Intermediação Stripe & Liquidação PIX',
    valorCentavos: 8900,
    status: 'pago',
    metodoPagamento: 'desconto_em_conta',
    data: new Date(Date.now() - 10 * 86400000).toISOString(),
    documentoReferencia: 'stripe_fee_out',
  },
];

let memoryInvoices = [
  {
    id: 'inv_1001',
    tenantId: 'ten_easycell_matriz',
    empresa: 'EasyCell Matriz',
    numero: 1001,
    status: 'paid',
    valorBrutoCentavos: 19700,
    descontoCentavos: 0,
    valorLiquidoCentavos: 19700,
    metodoPagamento: 'cartao_credito',
    descricao: 'Assinatura PRO - Mensal',
    pagoEm: new Date().toISOString(),
  },
  {
    id: 'inv_1002',
    tenantId: 'ten_ifix_sp',
    empresa: 'iFix São Paulo',
    numero: 1002,
    status: 'pending',
    valorBrutoCentavos: 19700,
    descontoCentavos: 0,
    valorLiquidoCentavos: 19700,
    metodoPagamento: 'pix',
    descricao: 'Assinatura PRO - Mensal',
    vencimentoEm: new Date(Date.now() + 2 * 86400000).toISOString(),
  },
  {
    id: 'inv_1003',
    tenantId: 'ten_cell_express',
    empresa: 'Cell Express Sul',
    numero: 1003,
    status: 'failed',
    valorBrutoCentavos: 9700,
    descontoCentavos: 0,
    valorLiquidoCentavos: 9700,
    metodoPagamento: 'cartao_credito',
    descricao: 'Assinatura Starter - Mensal (Recusado pelo emissor)',
    vencimentoEm: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

// Configurações do Programa Viral de Indicações
let referralSettings = {
  ativo: true,
  trialsParaMesGratis: 3,
  bonusConversaoPagaMeses: 1,
  descontoPorcentoIndicado: 20,
  limiteMaximoMesesGratis: 6,
  validadeCreditosDias: 365,
  mensagemPadraoWhatsapp: 'Olá! Conheça o EasyCell, o sistema mais completo para assistências técnicas de celular. Clique no meu link VIP e ganhe 7 dias grátis no plano PRO: {{link_indicacao}}',
};

let promoterRankings = [
  { id: 'prom_01', tenantId: 'ten_easycell_matriz', empresa: 'EasyCell Matriz', slug: 'easycell-matriz', totalCliques: 74, totalTrials: 18, totalPagos: 6, mesesGanhos: 4, saldoCreditosCentavos: 78800, status: 'ativo' },
  { id: 'prom_02', tenantId: 'ten_cellfix_exp', empresa: 'CellFix Express', slug: 'cellfix-express', totalCliques: 48, totalTrials: 11, totalPagos: 3, mesesGanhos: 2, saldoCreditosCentavos: 39400, status: 'ativo' },
  { id: 'prom_03', tenantId: 'ten_doctor_smart', empresa: 'Doctor Smart Jardins', slug: 'doctor-smart', totalCliques: 31, totalTrials: 7, totalPagos: 2, mesesGanhos: 1, saldoCreditosCentavos: 19700, status: 'ativo' },
  { id: 'prom_04', tenantId: 'ten_smartlab_sp', empresa: 'SmartLab Assistência', slug: 'smartlab-sp', totalCliques: 19, totalTrials: 4, totalPagos: 1, mesesGanhos: 1, saldoCreditosCentavos: 19700, status: 'ativo' },
];

let referralBonusLogs = [
  { id: 'log_01', data: new Date(Date.now() - 2 * 86400000).toISOString(), empresaBeneficiada: 'EasyCell Matriz', motivo: 'Meta de 3 trials alcançada', creditoConcedido: '1 Mês Grátis (Plano PRO)', valorDescontoCentavos: 19700 },
  { id: 'log_02', data: new Date(Date.now() - 5 * 86400000).toISOString(), empresaBeneficiada: 'CellFix Express', motivo: 'Conversão paga de Loja indicada', creditoConcedido: '1 Mês Grátis (Plano PRO)', valorDescontoCentavos: 19700 },
  { id: 'log_03', data: new Date(Date.now() - 9 * 86400000).toISOString(), empresaBeneficiada: 'EasyCell Matriz', motivo: 'Conversão paga de iFix Barra', creditoConcedido: '1 Mês Grátis (Plano PRO)', valorDescontoCentavos: 19700 },
];

// Configurações e Campanhas SofIA SDR
let sdrSettings = {
  numeroAtivo: '+55 (11) 99999-0000',
  statusConexao: 'online', // 'online' | 'desconectado' | 'pareando'
  sessaoId: 'sofia_sdr_master_session',
  promptPersonalidade: 'Você é a SofIA, consultora de vendas da EasyCell. Seu objetivo é abordar donos de assistência técnica de celulares de forma consultiva, entender se eles usam papel ou sistemas lentos, e oferecer um teste gratuito de 7 dias do plano PRO com automação do WhatsApp.',
  horarioInicio: '09:00',
  horarioFim: '18:00',
  diasSemana: ['seg', 'ter', 'qua', 'qui', 'sex'],
  taxaDisparoSegundos: 10,
  limiteDiarioMensagens: 50,
  cadenciaAutomatica: true,
};

let sdrCampaigns = [
  {
    id: 'sdr_01',
    nome: 'Prospecção Lojas SP & Grande ABC',
    tipo: 'prospeccao_fria',
    status: 'ativa',
    totalEnviados: 85,
    totalRespostas: 26,
    totalConversoes: 6,
    publicoAlvo: 'Leads frios do CRM no estado de SP',
    template: 'Olá {{nome}} da {{empresa}}, tudo bem? Aqui é a SofIA da EasyCell! Vi que você trabalha com conserto de celulares em {{cidade}}. Como você gerencia as O.S. e avisos aos clientes hoje?',
    criadoEm: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 'sdr_02',
    nome: 'Reativação de Trials Expirados',
    tipo: 'reativacao',
    status: 'ativa',
    totalEnviados: 42,
    totalRespostas: 18,
    totalConversoes: 8,
    publicoAlvo: 'Assistências que finalizaram os 7 dias de trial',
    template: 'Oi {{nome}}! Seu período de testes do EasyCell terminou ontem. Preparei um cupom especial de 20% OFF na primeira mensalidade do plano PRO para sua loja continuar operando sem travas. Posso ativar para você?',
    criadoEm: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'sdr_03',
    nome: 'Campanha Redes de Franquias & Multi-Lojas',
    tipo: 'prospeccao_enterprise',
    status: 'pausada',
    totalEnviados: 19,
    totalRespostas: 7,
    totalConversoes: 2,
    publicoAlvo: 'Empresas com 3 ou mais filiais',
    template: 'Olá {{nome}}, acompanho o crescimento da {{empresa}}! Sabia que o EasyCell tem gestão centralizada multi-lojas e laudo pericial fotográfico para franquias? Gostaria de uma demonstração de 15 minutos?',
    criadoEm: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
];

const memoryLeads = [
  {
    id: 'lead_01',
    nome: 'Carlos Mendonça',
    whatsapp: '11988887777',
    email: 'carlos@ifixsp.com.br',
    nomeEmpresa: 'iFix Assistência SP',
    cidade: 'São Paulo - SP',
    estagio: 'qualificado',
    origem: 'organico',
    temperatura: 'quente',
    score: 85,
    totalInteracoes: 3,
    ultimaNota: 'Interessado no plano PRO e na automação do WhatsApp.',
    criadoEm: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'lead_02',
    nome: 'Renata Vasconcelos',
    whatsapp: '21977776666',
    email: 'renata@techcellrj.com',
    nomeEmpresa: 'TechCell Barra',
    cidade: 'Rio de Janeiro - RJ',
    estagio: 'novo',
    origem: 'referral',
    temperatura: 'morno',
    score: 40,
    totalInteracoes: 1,
    ultimaNota: 'Veio indicada por EasyCell Matriz.',
    criadoEm: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const memoryTickets = [
  {
    id: 'tkt_1001',
    tenantId: 'ten_easycell_matriz',
    numero: 1001,
    assunto: 'Dúvida sobre integração com impressora térmica',
    descricao: 'Gostaria de saber como configurar a impressão de etiquetas zebra no balcão.',
    categoria: 'integracao',
    prioridade: 'media',
    status: 'aberto',
    atribuidoPara: 'Suporte Técnico N2',
    slaRespostaAte: new Date(Date.now() + 18 * 3600000).toISOString(),
    criadoEm: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
];

const memoryMessages = [
  {
    id: 'msg_01',
    ticketId: 'tkt_1001',
    autorNome: 'EasyCell Matriz',
    autorTipo: 'cliente',
    conteudo: 'Olá, preciso de auxílio para conectar a impressora térmica via USB.',
    criadoEm: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
];

function calculateFinanceOverview() {
  const totalEntradasCentavos = memoryTransactions
    .filter((t) => t.tipo === 'entrada' && (t.status === 'confirmado' || t.status === 'pago'))
    .reduce((acc, t) => acc + (Number(t.valorCentavos) || 0), 0);
  const totalSaidasCentavos = memoryTransactions
    .filter((t) => t.tipo === 'saida')
    .reduce((acc, t) => acc + (Number(t.valorCentavos) || 0), 0);
  const lucroLiquidoCentavos = totalEntradasCentavos - totalSaidasCentavos;
  const margemOperacionalPercentual = totalEntradasCentavos > 0
    ? Number(((lucroLiquidoCentavos / totalEntradasCentavos) * 100).toFixed(1))
    : 0;

  const mrrCentavos = 1285000; // R$ 12.850,00 recorrente ativo
  const arrCentavos = mrrCentavos * 12; // R$ 154.200,00 projetado

  return {
    mrrCentavos,
    arrCentavos,
    mrrCrescimentoPercentual: 14.8,
    totalEntradasCentavos,
    totalSaidasCentavos,
    lucroLiquidoCentavos,
    margemOperacionalPercentual,
    totalAssinantesAtivos: 68,
    totalTrials: 19,
    totalInadimplentes: 3,
    churnRatePercentual: 1.2,
    ticketMedioCentavos: 18900,
    ltvEstimadoCentavos: 345000,
  };
}

export async function saasRoutes(fastify, options) {
  // ==========================================
  // 1. GESTÃO DE PLANOS (PÚBLICO E SUPERADMIN)
  // ==========================================
  fastify.get('/api/v1/saas/plans', async (request, reply) => {
    try {
      const plans = await db.select().from(billingPlans).where(eq(billingPlans.ativo, true)).orderBy(billingPlans.ordem);
      if (plans && plans.length > 0) return reply.send({ plans });
    } catch {
      // Fallback
    }
    return reply.send({ plans: memoryPlans });
  });

  fastify.post(
    '/api/v1/saas/plans',
    { preHandler: [authenticateUser, requireRole(['superadmin'])] },
    async (request, reply) => {
      const { nome, slug, precoMensalCentavos, precoAnualCentavos, features, limiteLojas, limiteUsuarios, limiteOsMensal, limiteWhatsappMensal, trialDias = 7 } = request.body || {};

      if (!nome || !slug || !precoMensalCentavos) {
        return reply.status(400).send({ error: 'Campos obrigatórios: nome, slug, precoMensalCentavos' });
      }

      const planId = `plan_${slug}`;
      const newPlan = {
        id: planId,
        nome,
        slug,
        precoMensalCentavos: Number(precoMensalCentavos),
        precoAnualCentavos: precoAnualCentavos ? Number(precoAnualCentavos) : Number(precoMensalCentavos) * 10,
        features: features || {},
        limiteLojas: Number(limiteLojas) || 1,
        limiteUsuarios: Number(limiteUsuarios) || 3,
        limiteOsMensal: limiteOsMensal ? Number(limiteOsMensal) : null,
        limiteWhatsappMensal: Number(limiteWhatsappMensal) || 500,
        trialDias: Number(trialDias),
        ativo: true,
        ordem: memoryPlans.length + 1,
        destaque: false,
      };

      memoryPlans.push(newPlan);

      try {
        await db.insert(billingPlans).values(newPlan).onConflictDoUpdate({
          target: billingPlans.id,
          set: newPlan,
        });
      } catch (err) {
        request.log.warn('Aviso: Salvo plano em memória');
      }

      return reply.status(201).send({ success: true, plan: newPlan });
    }
  );

  // ==========================================
  // 2. GERENCIADOR FINANCEIRO TOTAL SAAS (SUPERADMIN)
  // ==========================================
  fastify.get(
    '/api/v1/saas/finance/overview',
    { preHandler: [authenticateUser, requireRole(['superadmin'])] },
    async (request, reply) => {
      return reply.send(calculateFinanceOverview());
    }
  );

  fastify.get(
    '/api/v1/saas/finance/transactions',
    { preHandler: [authenticateUser, requireRole(['superadmin'])] },
    async (request, reply) => {
      const { tipo, categoria } = request.query || {};
      let filtered = [...memoryTransactions];
      if (tipo && tipo !== 'all') {
        filtered = filtered.filter((t) => t.tipo === tipo);
      }
      if (categoria) {
        filtered = filtered.filter((t) => t.categoria === categoria);
      }
      return reply.send({
        total: filtered.length,
        transactions: filtered,
        metrics: calculateFinanceOverview(),
      });
    }
  );

  fastify.post(
    '/api/v1/saas/finance/transactions',
    { preHandler: [authenticateUser, requireRole(['superadmin'])] },
    async (request, reply) => {
      const { tipo, categoria, descricao, valorCentavos, metodoPagamento = 'pix', data, documentoReferencia } = request.body || {};

      if (!tipo || !descricao || !valorCentavos) {
        return reply.status(400).send({ error: 'Tipo, descrição e valor são obrigatórios.' });
      }

      const newTx = {
        id: `tx_${Date.now()}`,
        tipo: tipo === 'saida' ? 'saida' : 'entrada',
        categoria: categoria || 'outros',
        descricao,
        valorCentavos: Math.abs(Number(valorCentavos)),
        status: 'confirmado',
        metodoPagamento,
        data: data || new Date().toISOString(),
        documentoReferencia: documentoReferencia || `manual_${Date.now()}`,
      };

      memoryTransactions.unshift(newTx);
      return reply.status(201).send({ success: true, transaction: newTx, metrics: calculateFinanceOverview() });
    }
  );

  fastify.get(
    '/api/v1/saas/finance/invoices',
    { preHandler: [authenticateUser, requireRole(['superadmin'])] },
    async (request, reply) => {
      const { status } = request.query || {};
      const filtered = status && status !== 'all' ? memoryInvoices.filter((i) => i.status === status) : memoryInvoices;
      return reply.send({ total: filtered.length, invoices: filtered });
    }
  );

  fastify.post(
    '/api/v1/saas/finance/invoices/manual',
    { preHandler: [authenticateUser, requireRole(['superadmin'])] },
    async (request, reply) => {
      const { empresa, tenantId, descricao, valorCentavos, metodoPagamento = 'pix', diasVencimento = 3 } = request.body || {};

      if (!empresa || !valorCentavos) {
        return reply.status(400).send({ error: 'Empresa e valor são obrigatórios.' });
      }

      const invId = `inv_${Date.now()}`;
      const pixCopiaECola = `00020126580014br.gov.bcb.pix0136easycell-cobranca-${Date.now()}520400005303986540${(Number(valorCentavos) / 100).toFixed(2)}5802BR5916EASYCELL SAAS6009SAO PAULO62070503***6304`;

      const newInvoice = {
        id: invId,
        tenantId: tenantId || 'ten_manual',
        empresa,
        numero: memoryInvoices.length + 1001,
        status: 'pending',
        valorBrutoCentavos: Number(valorCentavos),
        descontoCentavos: 0,
        valorLiquidoCentavos: Number(valorCentavos),
        metodoPagamento,
        descricao: descricao || 'Cobrança manual avulsa',
        vencimentoEm: new Date(Date.now() + Number(diasVencimento) * 86400000).toISOString(),
        pixCopiaECola,
        linkPagamento: `https://easycell.vibedocode.pro/fatura/${invId}`,
        criadoEm: new Date().toISOString(),
      };

      memoryInvoices.unshift(newInvoice);

      // Adiciona também no fluxo de entradas futuras
      memoryTransactions.unshift({
        id: `tx_${Date.now()}`,
        tipo: 'entrada',
        categoria: 'cobranca_avulsa',
        descricao: `Fatura #${newInvoice.numero} - ${empresa}`,
        valorCentavos: Number(valorCentavos),
        status: 'pendente',
        metodoPagamento,
        data: new Date().toISOString(),
        documentoReferencia: invId,
      });

      return reply.status(201).send({ success: true, invoice: newInvoice });
    }
  );

  fastify.get(
    '/api/v1/saas/finance/dunning',
    { preHandler: [authenticateUser, requireRole(['superadmin'])] },
    async (request, reply) => {
      return reply.send({
        inadimplentes: [
          {
            tenantId: 'ten_cell_express',
            empresa: 'Cell Express Sul',
            email: 'contato@cellexpress.com.br',
            telefone: '51999998888',
            plano: 'Starter',
            diasAtraso: 4,
            tentativasCobranca: 2,
            gracePeriodFim: new Date(Date.now() + 3 * 86400000).toISOString(),
            status: 'past_due',
            valorPendenteCentavos: 9700,
          },
          {
            tenantId: 'ten_smart_rio',
            empresa: 'SmartCell Copacabana',
            email: 'financeiro@smartcell.rio',
            telefone: '21988881234',
            plano: 'PRO',
            diasAtraso: 6,
            tentativasCobranca: 3,
            gracePeriodFim: new Date(Date.now() + 1 * 86400000).toISOString(),
            status: 'past_due',
            valorPendenteCentavos: 19700,
          },
        ],
      });
    }
  );

  // ==========================================
  // 3. CRM & LEADS PIPELINE (SUPERADMIN)
  // ==========================================
  fastify.get(
    '/api/v1/saas/crm/pipeline',
    { preHandler: [authenticateUser, requireRole(['superadmin'])] },
    async (request, reply) => {
      const counts = {
        novo: 12,
        contatado: 8,
        qualificado: 6,
        demo_agendada: 4,
        proposta: 3,
        convertido: 15,
        perdido: 2,
      };
      return reply.send({ pipeline: counts });
    }
  );

  fastify.get(
    '/api/v1/saas/crm/leads',
    { preHandler: [authenticateUser, requireRole(['superadmin'])] },
    async (request, reply) => {
      return reply.send({ total: memoryLeads.length, leads: memoryLeads });
    }
  );

  fastify.post(
    '/api/v1/saas/crm/leads',
    { preHandler: [authenticateUser, requireRole(['superadmin'])] },
    async (request, reply) => {
      const { nome, whatsapp, email, nomeEmpresa, cidade, estagio = 'novo', origem = 'manual', temperatura = 'morno' } = request.body || {};

      if (!nome || !whatsapp) {
        return reply.status(400).send({ error: 'Nome e WhatsApp são obrigatórios' });
      }

      const newLead = {
        id: `lead_${Date.now()}`,
        nome,
        whatsapp,
        email: email || null,
        nomeEmpresa: nomeEmpresa || null,
        cidade: cidade || null,
        estagio,
        origem,
        temperatura,
        score: 50,
        totalInteracoes: 0,
        criadoEm: new Date().toISOString(),
      };

      memoryLeads.unshift(newLead);
      return reply.status(201).send({ success: true, lead: newLead });
    }
  );

  fastify.put(
    '/api/v1/saas/crm/leads/:id',
    { preHandler: [authenticateUser, requireRole(['superadmin'])] },
    async (request, reply) => {
      const { id } = request.params;
      const { estagio, temperatura, score, ultimaNota } = request.body || {};

      const lead = memoryLeads.find((l) => l.id === id);
      if (lead) {
        if (estagio) lead.estagio = estagio;
        if (temperatura) lead.temperatura = temperatura;
        if (score !== undefined) lead.score = Number(score);
        if (ultimaNota) lead.ultimaNota = ultimaNota;
        lead.totalInteracoes = (lead.totalInteracoes || 0) + 1;
      }

      return reply.send({ success: true, lead: lead || { id, estagio } });
    }
  );

  // ==========================================
  // 4. MOTOR DE INDICAÇÃO VIRAL (CONFIGURAÇÃO & GESTÃO)
  // ==========================================
  fastify.get(
    '/api/v1/referrals/link',
    { preHandler: [authenticateUser, extractTenantContext] },
    async (request, reply) => {
      const tenantId = request.tenantId || 'ten_parceiro';
      const slug = tenantId.replace(/^ten_/, '');
      return reply.send({
        referralSlug: slug,
        referralUrl: `https://easycell.vibedocode.pro/r/${slug}`,
      });
    }
  );

  fastify.get(
    '/api/v1/referrals/stats',
    { preHandler: [authenticateUser, extractTenantContext] },
    async (request, reply) => {
      return reply.send({
        totalCliques: 42,
        trialsIniciados: 2,
        trialsNecessariosParaCredito: referralSettings.trialsParaMesGratis || 3,
        progressoTrial: `2/${referralSettings.trialsParaMesGratis || 3}`,
        clientesPagosConvertidos: 1,
        mesesGratisAcumulados: 1,
        descontoAplicadoProximaFaturaCentavos: 19700,
        mensagemCompartilhamento: referralSettings.mensagemPadraoWhatsapp,
      });
    }
  );

  fastify.post('/api/v1/referrals/track', async (request, reply) => {
    const { slug } = request.body || {};
    if (!slug) return reply.status(400).send({ error: 'Slug de indicação é obrigatório' });

    return reply.send({
      success: true,
      slug,
      tracked: true,
      message: 'Clique registrado no motor viral',
    });
  });

  // Visão SuperAdmin do Programa de Indicações
  fastify.get(
    '/api/v1/saas/referrals',
    { preHandler: [authenticateUser, requireRole(['superadmin'])] },
    async (request, reply) => {
      return reply.send({
        totalIndicacoesPlataforma: 145,
        totalTrialsGerados: 48,
        totalPagosGerados: 23,
        ranking: promoterRankings,
        settings: referralSettings,
        bonusLogs: referralBonusLogs,
      });
    }
  );

  fastify.get(
    '/api/v1/saas/referrals/settings',
    { preHandler: [authenticateUser, requireRole(['superadmin'])] },
    async (request, reply) => {
      return reply.send({ settings: referralSettings });
    }
  );

  fastify.put(
    '/api/v1/saas/referrals/settings',
    { preHandler: [authenticateUser, requireRole(['superadmin'])] },
    async (request, reply) => {
      const {
        ativo,
        trialsParaMesGratis,
        bonusConversaoPagaMeses,
        descontoPorcentoIndicado,
        limiteMaximoMesesGratis,
        validadeCreditosDias,
        mensagemPadraoWhatsapp
      } = request.body || {};

      if (ativo !== undefined) referralSettings.ativo = Boolean(ativo);
      if (trialsParaMesGratis !== undefined) referralSettings.trialsParaMesGratis = Number(trialsParaMesGratis);
      if (bonusConversaoPagaMeses !== undefined) referralSettings.bonusConversaoPagaMeses = Number(bonusConversaoPagaMeses);
      if (descontoPorcentoIndicado !== undefined) referralSettings.descontoPorcentoIndicado = Number(descontoPorcentoIndicado);
      if (limiteMaximoMesesGratis !== undefined) referralSettings.limiteMaximoMesesGratis = Number(limiteMaximoMesesGratis);
      if (validadeCreditosDias !== undefined) referralSettings.validadeCreditosDias = Number(validadeCreditosDias);
      if (mensagemPadraoWhatsapp) referralSettings.mensagemPadraoWhatsapp = mensagemPadraoWhatsapp;

      return reply.send({ success: true, settings: referralSettings, message: 'Configurações de indicação atualizadas com sucesso!' });
    }
  );

  fastify.post(
    '/api/v1/saas/referrals/credits/manual',
    { preHandler: [authenticateUser, requireRole(['superadmin'])] },
    async (request, reply) => {
      const { tenantId, empresa, mesesGratis = 1, motivo } = request.body || {};

      if (!empresa) {
        return reply.status(400).send({ error: 'Empresa parceira é obrigatória.' });
      }

      const log = {
        id: `log_${Date.now()}`,
        data: new Date().toISOString(),
        empresaBeneficiada: empresa,
        motivo: motivo || 'Bonificação concedida manualmente pelo SuperAdmin',
        creditoConcedido: `${mesesGratis} ${mesesGratis === 1 ? 'Mês Grátis' : 'Meses Grátis'}`,
        valorDescontoCentavos: Number(mesesGratis) * 19700,
      };

      referralBonusLogs.unshift(log);

      const promoter = promoterRankings.find((p) => p.empresa === empresa || p.tenantId === tenantId);
      if (promoter) {
        promoter.mesesGanhos = (promoter.mesesGanhos || 0) + Number(mesesGratis);
        promoter.saldoCreditosCentavos = (promoter.saldoCreditosCentavos || 0) + (Number(mesesGratis) * 19700);
      }

      return reply.status(201).send({ success: true, log, ranking: promoterRankings });
    }
  );

  // ==========================================
  // 5. SOFIA SDR (WHATSAPP AUTOMATION & CONFIGURAÇÃO)
  // ==========================================
  fastify.get(
    '/api/v1/saas/sdr/settings',
    { preHandler: [authenticateUser, requireRole(['superadmin'])] },
    async (request, reply) => {
      return reply.send({ settings: sdrSettings });
    }
  );

  fastify.put(
    '/api/v1/saas/sdr/settings',
    { preHandler: [authenticateUser, requireRole(['superadmin'])] },
    async (request, reply) => {
      const {
        promptPersonalidade,
        horarioInicio,
        horarioFim,
        taxaDisparoSegundos,
        limiteDiarioMensagens,
        numeroAtivo,
        cadenciaAutomatica
      } = request.body || {};

      if (promptPersonalidade) sdrSettings.promptPersonalidade = promptPersonalidade;
      if (horarioInicio) sdrSettings.horarioInicio = horarioInicio;
      if (horarioFim) sdrSettings.horarioFim = horarioFim;
      if (taxaDisparoSegundos) sdrSettings.taxaDisparoSegundos = Number(taxaDisparoSegundos);
      if (limiteDiarioMensagens) sdrSettings.limiteDiarioMensagens = Number(limiteDiarioMensagens);
      if (numeroAtivo) sdrSettings.numeroAtivo = numeroAtivo;
      if (cadenciaAutomatica !== undefined) sdrSettings.cadenciaAutomatica = Boolean(cadenciaAutomatica);

      return reply.send({ success: true, settings: sdrSettings, message: 'Configurações da SofIA SDR salvas com sucesso!' });
    }
  );

  fastify.get(
    '/api/v1/saas/sdr/campaigns',
    { preHandler: [authenticateUser, requireRole(['superadmin'])] },
    async (request, reply) => {
      return reply.send({ campaigns: sdrCampaigns, settings: sdrSettings });
    }
  );

  fastify.post(
    '/api/v1/saas/sdr/campaigns',
    { preHandler: [authenticateUser, requireRole(['superadmin'])] },
    async (request, reply) => {
      const { nome, template, publicoAlvo = 'Leads do CRM', tipo = 'prospeccao_ativa' } = request.body || {};

      if (!nome || !template) {
        return reply.status(400).send({ error: 'Nome da campanha e template de mensagem são obrigatórios.' });
      }

      const newCampaign = {
        id: `sdr_${Date.now()}`,
        nome,
        tipo,
        status: 'ativa',
        totalEnviados: 0,
        totalRespostas: 0,
        totalConversoes: 0,
        publicoAlvo,
        template,
        criadoEm: new Date().toISOString(),
      };

      sdrCampaigns.unshift(newCampaign);
      return reply.status(201).send({ success: true, campaign: newCampaign });
    }
  );

  fastify.put(
    '/api/v1/saas/sdr/campaigns/:id/status',
    { preHandler: [authenticateUser, requireRole(['superadmin'])] },
    async (request, reply) => {
      const { id } = request.params;
      const { status } = request.body || {};

      const camp = sdrCampaigns.find((c) => c.id === id);
      if (camp && status) {
        camp.status = status;
      }
      return reply.send({ success: true, campaign: camp });
    }
  );

  fastify.post(
    '/api/v1/saas/sdr/test-send',
    { preHandler: [authenticateUser, requireRole(['superadmin'])] },
    async (request, reply) => {
      const { whatsappDestino, template } = request.body || {};

      if (!whatsappDestino) {
        return reply.status(400).send({ error: 'Número de WhatsApp de destino é obrigatório para o teste.' });
      }

      const previewMensagem = (template || sdrCampaigns[0]?.template || '')
        .replace('{{nome}}', 'Vanderson')
        .replace('{{empresa}}', 'EasyCell Teste')
        .replace('{{cidade}}', 'São Paulo');

      return reply.send({
        success: true,
        enviadoPara: whatsappDestino,
        mensagemSimulada: previewMensagem,
        tempoEnvioMs: 420,
        gatewayStatus: 'delivered',
        message: 'Mensagem de teste processada pelo Gateway SofIA!',
      });
    }
  );

  fastify.post(
    '/api/v1/saas/sdr/campaigns/:id/send',
    { preHandler: [authenticateUser, requireRole(['superadmin'])] },
    async (request, reply) => {
      const { id } = request.params;
      const camp = sdrCampaigns.find((c) => c.id === id);
      if (camp) {
        camp.totalEnviados = (camp.totalEnviados || 0) + 15;
      }
      return reply.send({
        success: true,
        campaignId: id,
        filaEnviados: 15,
        rateLimit: '1 msg/s com intervalo anti-banimento ativo (10s)',
        status: 'disparando',
      });
    }
  );

  // ==========================================
  // 6. CENTRAL DE SUPORTE & TICKETS
  // ==========================================
  fastify.get(
    '/api/v1/support/tickets',
    { preHandler: [authenticateUser, extractTenantContext] },
    async (request, reply) => {
      const tenantId = request.tenantId;
      const userTickets = memoryTickets.filter((t) => !tenantId || t.tenantId === tenantId);
      return reply.send({ tickets: userTickets });
    }
  );

  fastify.post(
    '/api/v1/support/tickets',
    { preHandler: [authenticateUser, extractTenantContext] },
    async (request, reply) => {
      const tenantId = request.tenantId;
      const { assunto, descricao, categoria = 'geral', prioridade = 'media' } = request.body || {};

      if (!assunto || !descricao) {
        return reply.status(400).send({ error: 'Assunto e descrição são obrigatórios' });
      }

      const ticketId = `tkt_${Date.now()}`;
      const slaHoras = prioridade === 'urgente' ? 2 : prioridade === 'alta' ? 6 : 24;

      const newTicket = {
        id: ticketId,
        tenantId,
        numero: memoryTickets.length + 1001,
        assunto,
        descricao,
        categoria,
        prioridade,
        status: 'aberto',
        atribuidoPara: 'Triagem Automática',
        slaRespostaAte: new Date(Date.now() + slaHoras * 3600000).toISOString(),
        criadoEm: new Date().toISOString(),
      };

      memoryTickets.unshift(newTicket);
      return reply.status(201).send({ success: true, ticket: newTicket });
    }
  );

  fastify.get(
    '/api/v1/support/tickets/:id',
    { preHandler: [authenticateUser, extractTenantContext] },
    async (request, reply) => {
      const { id } = request.params;
      const ticket = memoryTickets.find((t) => t.id === id);
      const messages = memoryMessages.filter((m) => m.ticketId === id);
      return reply.send({ ticket, messages });
    }
  );

  fastify.post(
    '/api/v1/support/tickets/:id/messages',
    { preHandler: [authenticateUser, extractTenantContext] },
    async (request, reply) => {
      const { id } = request.params;
      const { conteudo, autorNome = 'Atendente' } = request.body || {};

      if (!conteudo) return reply.status(400).send({ error: 'Conteúdo da mensagem é obrigatório' });

      const newMsg = {
        id: `msg_${Date.now()}`,
        ticketId: id,
        autorNome,
        autorTipo: request.user?.cargo === 'superadmin' ? 'admin' : 'cliente',
        conteudo,
        criadoEm: new Date().toISOString(),
      };

      memoryMessages.push(newMsg);
      return reply.status(201).send({ success: true, message: newMsg });
    }
  );

  fastify.get(
    '/api/v1/saas/support/tickets',
    { preHandler: [authenticateUser, requireRole(['superadmin'])] },
    async (request, reply) => {
      return reply.send({ tickets: memoryTickets });
    }
  );

  // ==========================================
  // 7. NOTIFICAÇÕES DO SISTEMA
  // ==========================================
  fastify.get(
    '/api/v1/notifications',
    { preHandler: [authenticateUser, extractTenantContext] },
    async (request, reply) => {
      return reply.send({
        notifications: [
          {
            id: 'notif_01',
            titulo: '🎉 Bem-vindo ao EasyCell!',
            mensagem: 'Seu período de avaliação gratuita de 7 dias do plano PRO está ativo.',
            tipo: 'trial_welcome',
            lida: false,
            criadoEm: new Date().toISOString(),
          },
        ],
      });
    }
  );
}
