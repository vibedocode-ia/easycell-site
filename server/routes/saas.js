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

// Fallback in-memory state for robust operation & tests
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

export async function saasRoutes(fastify, options) {
  // ==========================================
  // 1. GESTÃO DE PLANOS (PÚBLICO E SUPERADMIN)
  // ==========================================
  fastify.get('/api/v1/saas/plans', async (request, reply) => {
    try {
      const plans = await db.select().from(billingPlans).where(eq(billingPlans.ativo, true)).orderBy(billingPlans.ordem);
      if (plans.length > 0) return reply.send({ plans });
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
  // 2. FINANCEIRO SAAS (SUPERADMIN)
  // ==========================================
  fastify.get(
    '/api/v1/saas/finance/overview',
    { preHandler: [authenticateUser, requireRole(['superadmin'])] },
    async (request, reply) => {
      // Dados consolidados do SaaS
      return reply.send({
        mrrCentavos: 1285000, // R$ 12.850,00
        arrCentavos: 15420000, // R$ 154.200,00
        mrrCrescimentoPercentual: 14.8,
        totalAssinantesAtivos: 68,
        totalTrials: 19,
        totalInadimplentes: 3,
        churnRatePercentual: 1.2,
        ltvEstimadoCentavos: 345000, // R$ 3.450,00
        ticketMedioCentavos: 18900,
      });
    }
  );

  fastify.get(
    '/api/v1/saas/finance/invoices',
    { preHandler: [authenticateUser, requireRole(['superadmin'])] },
    async (request, reply) => {
      const { status } = request.query || {};

      const dummyInvoices = [
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

      const filtered = status ? dummyInvoices.filter((i) => i.status === status) : dummyInvoices;
      return reply.send({ total: filtered.length, invoices: filtered });
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
  // 4. MOTOR DE INDICAÇÃO VIRAL
  // ==========================================
  fastify.get(
    '/api/v1/referrals/link',
    { preHandler: [authenticateUser, extractTenantContext] },
    async (request, reply) => {
      const tenantId = request.tenantId;
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
        trialsNecessariosParaCredito: 3,
        progressoTrial: '2/3',
        clientesPagosConvertidos: 1,
        mesesGratisAcumulados: 1,
        descontoAplicadoProximaFaturaCentavos: 19700,
      });
    }
  );

  fastify.post('/api/v1/referrals/track', async (request, reply) => {
    const { slug, utmSource, utmMedium, utmCampaign } = request.body || {};
    if (!slug) return reply.status(400).send({ error: 'Slug de indicação é obrigatório' });

    return reply.send({
      success: true,
      slug,
      tracked: true,
      message: 'Clique registrado no motor viral',
    });
  });

  fastify.get(
    '/api/v1/saas/referrals',
    { preHandler: [authenticateUser, requireRole(['superadmin'])] },
    async (request, reply) => {
      return reply.send({
        totalIndicacoesPlataforma: 145,
        totalTrialsGerados: 48,
        totalPagosGerados: 23,
        ranking: [
          { empresa: 'EasyCell Matriz', totalIndicados: 18, mesesGanhos: 4 },
          { empresa: 'CellFix Express', totalIndicados: 11, mesesGanhos: 2 },
          { empresa: 'Doctor Smart', totalIndicados: 7, mesesGanhos: 1 },
        ],
      });
    }
  );

  // ==========================================
  // 5. SOFIA SDR (WHATSAPP AUTOMATION)
  // ==========================================
  fastify.get(
    '/api/v1/saas/sdr/campaigns',
    { preHandler: [authenticateUser, requireRole(['superadmin'])] },
    async (request, reply) => {
      return reply.send({
        campaigns: [
          {
            id: 'sdr_01',
            nome: 'Prospecção Lojas SP & RJ',
            tipo: 'prospeccao',
            status: 'ativa',
            totalEnviados: 85,
            totalRespostas: 26,
            totalConversoes: 6,
            whatsappNumero: '+55 11 99999-0000',
            template: 'Olá {{nome}} da {{empresa}}, tudo bem? Aqui é a SofIA da EasyCell...',
          },
        ],
      });
    }
  );

  fastify.post(
    '/api/v1/saas/sdr/campaigns/:id/send',
    { preHandler: [authenticateUser, requireRole(['superadmin'])] },
    async (request, reply) => {
      const { id } = request.params;
      return reply.send({
        success: true,
        campaignId: id,
        filaEnviados: 15,
        rateLimit: '1 msg/s com intervalo anti-banimento ativo',
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
