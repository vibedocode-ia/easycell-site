import { pgTable, text, timestamp, integer, boolean, jsonb, uuid } from 'drizzle-orm/pg-core';
import { tenants } from './tenants';

// 1. billing_plans — Planos de Assinatura do SaaS
export const billingPlans = pgTable('billing_plans', {
  id: text('id').primaryKey(), // ex: plan_starter, plan_pro, plan_enterprise
  nome: text('nome').notNull(), // "Starter", "PRO", "Enterprise"
  slug: text('slug').notNull().unique(), // "starter", "pro", "enterprise"
  descricao: text('descricao'),
  precoMensalCentavos: integer('preco_mensal_centavos').notNull(), // R$ em centavos
  precoAnualCentavos: integer('preco_anual_centavos'), // Desconto anual
  stripePriceIdMensal: text('stripe_price_id_mensal'), // price_xxx do Stripe
  stripePriceIdAnual: text('stripe_price_id_anual'),
  stripeProductId: text('stripe_product_id'), // prod_xxx do Stripe

  // Limites do plano
  limiteLojas: integer('limite_lojas').default(1).notNull(),
  limiteUsuarios: integer('limite_usuarios').default(3).notNull(),
  limiteOsMensal: integer('limite_os_mensal').default(100), // null = ilimitado
  limiteWhatsappMensal: integer('limite_whatsapp_mensal').default(500),

  // Features booleanas (feature flags)
  features: jsonb('features').$type<{
    whatsappAutomation?: boolean;
    laudoPericial?: boolean;
    sofiaSDR?: boolean;
    relatoriosAvancados?: boolean;
    apiAccess?: boolean;
    suportePrioritario?: boolean;
    backupDiario?: boolean;
    multiLoja?: boolean;
    crmLeads?: boolean;
    customBranding?: boolean;
  }>().notNull(),

  trialDias: integer('trial_dias').default(7).notNull(),
  ativo: boolean('ativo').default(true).notNull(),
  ordem: integer('ordem').default(0).notNull(), // Ordem de exibição
  destaque: boolean('destaque').default(false).notNull(), // Badge "Mais Popular"
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
});

// 2. subscriptions — Assinaturas Ativas de Tenants
export const subscriptions = pgTable('subscriptions', {
  id: text('id').primaryKey(), // sub_xxx
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  planId: text('plan_id').notNull().references(() => billingPlans.id),
  stripeCustomerId: text('stripe_customer_id'), // cus_xxx
  stripeSubscriptionId: text('stripe_subscription_id'), // sub_xxx do Stripe

  status: text('status').default('trialing').notNull(),
  // 'trialing' | 'active' | 'past_due' | 'grace_period' | 'suspended' | 'canceled' | 'expired'

  ciclo: text('ciclo').default('mensal').notNull(), // 'mensal' | 'anual'

  // Datas do ciclo
  trialInicio: timestamp('trial_inicio'),
  trialFim: timestamp('trial_fim'), // trial_inicio + 7 dias
  periodoAtualInicio: timestamp('periodo_atual_inicio'),
  periodoAtualFim: timestamp('periodo_atual_fim'),
  proximaCobranca: timestamp('proxima_cobranca'),

  // Grace period (inadimplência)
  gracePeriodInicio: timestamp('grace_period_inicio'),
  gracePeriodFim: timestamp('grace_period_fim'), // +7 dias após falha
  tentativasCobranca: integer('tentativas_cobranca').default(0).notNull(),

  // Cancelamento
  canceladoEm: timestamp('cancelado_em'),
  motivoCancelamento: text('motivo_cancelamento'),
  cancelamentoEfetivo: timestamp('cancelamento_efetivo'), // Fim do período pago

  // Créditos de indicação
  creditosPendentes: integer('creditos_pendentes').default(0).notNull(), // Meses grátis acumulados

  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
});

// 3. invoices — Faturas e Cobranças
export const invoices = pgTable('invoices', {
  id: text('id').primaryKey(), // inv_xxx
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  subscriptionId: text('subscription_id').references(() => subscriptions.id),
  stripeInvoiceId: text('stripe_invoice_id'), // in_xxx
  stripePaymentIntentId: text('stripe_payment_intent_id'), // pi_xxx

  numero: integer('numero').notNull(), // Sequencial da plataforma

  status: text('status').default('pending').notNull(),
  // 'draft' | 'pending' | 'processing' | 'paid' | 'failed' | 'refunded' | 'void'

  valorBrutoCentavos: integer('valor_bruto_centavos').notNull(),
  descontoCentavos: integer('desconto_centavos').default(0).notNull(), // Crédito de indicação
  valorLiquidoCentavos: integer('valor_liquido_centavos').notNull(),

  metodoPagamento: text('metodo_pagamento'), // 'pix' | 'boleto' | 'cartao_credito' | 'cartao_debito'

  descricao: text('descricao').notNull(),
  referenciaMes: text('referencia_mes'), // "2026-11" (YYYY-MM)

  // Boleto
  boletoUrl: text('boleto_url'),
  boletoCodigoBarras: text('boleto_codigo_barras'),
  boletoVencimento: timestamp('boleto_vencimento'),

  // PIX
  pixQrCode: text('pix_qr_code'), // Base64 ou URL
  pixCopiaCola: text('pix_copia_cola'), // Chave copia e cola
  pixExpiracao: timestamp('pix_expiracao'),

  pagoEm: timestamp('pago_em'),
  vencimentoEm: timestamp('vencimento_em'),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
});

// 4. referrals — Motor de Indicação Viral
export const referrals = pgTable('referrals', {
  id: text('id').primaryKey(), // ref_xxx
  referrerTenantId: text('referrer_tenant_id').notNull().references(() => tenants.id),
  referrerSlug: text('referrer_slug').notNull(), // Slug único do link /r/[slug]

  // Dados do indicado
  referredEmail: text('referred_email'),
  referredTenantId: text('referred_tenant_id').references(() => tenants.id),
  referredNome: text('referred_nome'),
  referredWhatsapp: text('referred_whatsapp'),

  status: text('status').default('pending').notNull(),
  // 'pending' | 'trial_started' | 'converted_paid' | 'expired' | 'credited'

  // Rastreamento
  ipOrigem: text('ip_origem'),
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  utmCampaign: text('utm_campaign'),

  // Crédito gerado
  creditoGerado: boolean('credito_gerado').default(false).notNull(),
  creditoMeses: integer('credito_meses').default(0).notNull(), // 0 ou 1
  creditoAplicadoEm: timestamp('credito_aplicado_em'),

  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  convertidoEm: timestamp('convertido_em'),
});

// 5. referral_credits — Log de Créditos Aplicados
export const referralCredits = pgTable('referral_credits', {
  id: text('id').primaryKey(), // rc_xxx
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  subscriptionId: text('subscription_id').references(() => subscriptions.id),

  tipo: text('tipo').notNull(),
  // 'three_trials' | 'paid_conversion' | 'manual_bonus'

  mesesCreditados: integer('meses_creditados').default(1).notNull(),

  // IDs dos referrals que geraram este crédito
  referralIds: jsonb('referral_ids').$type<string[]>().notNull(),

  aplicadoNaFatura: text('aplicado_na_fatura').references(() => invoices.id),

  criadoEm: timestamp('criado_em').defaultNow().notNull(),
});

// 6. crm_leads — Pipeline de Leads
export const crmLeads = pgTable('crm_leads', {
  id: text('id').primaryKey(), // lead_xxx

  // Dados do lead
  nome: text('nome').notNull(),
  email: text('email'),
  whatsapp: text('whatsapp').notNull(),
  nomeEmpresa: text('nome_empresa'),
  cidade: text('cidade'),

  // Pipeline
  estagio: text('estagio').default('novo').notNull(),
  // 'novo' | 'contatado' | 'qualificado' | 'demo_agendada' | 'proposta' | 'convertido' | 'perdido'

  // Origem
  origem: text('origem').default('organico').notNull(),
  // 'organico' | 'referral' | 'sofia_sdr' | 'landing_page' | 'manual' | 'google_ads' | 'instagram'
  referralId: text('referral_id').references(() => referrals.id),

  // Atribuição
  responsavelId: uuid('responsavel_id'),

  // Notas e interações
  ultimaNota: text('ultima_nota'),
  totalInteracoes: integer('total_interacoes').default(0).notNull(),

  // Conversão
  convertidoTenantId: text('convertido_tenant_id').references(() => tenants.id),
  convertidoEm: timestamp('convertido_em'),
  motivoPerda: text('motivo_perda'),

  // Scoring
  score: integer('score').default(0).notNull(), // 0-100 baseado em interações
  temperatura: text('temperatura').default('frio').notNull(), // 'frio' | 'morno' | 'quente'

  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
});

// 7. crm_interactions — Histórico de Interações com Leads
export const crmInteractions = pgTable('crm_interactions', {
  id: text('id').primaryKey(), // int_xxx
  leadId: text('lead_id').notNull().references(() => crmLeads.id, { onDelete: 'cascade' }),

  tipo: text('tipo').notNull(),
  // 'whatsapp_outbound' | 'whatsapp_inbound' | 'email' | 'ligacao' | 'demo' | 'nota_manual'

  canal: text('canal'), // 'whatsapp' | 'email' | 'telefone' | 'presencial'
  conteudo: text('conteudo').notNull(),

  autorNome: text('autor_nome').notNull(), // "SofIA SDR" ou nome do operador
  autorTipo: text('autor_tipo').default('humano').notNull(), // 'humano' | 'sofia'

  criadoEm: timestamp('criado_em').defaultNow().notNull(),
});

// 8. support_tickets — Tickets de Suporte
export const supportTickets = pgTable('support_tickets', {
  id: text('id').primaryKey(), // tkt_xxx
  tenantId: text('tenant_id').references(() => tenants.id),

  numero: integer('numero').notNull(), // Sequencial #1001
  assunto: text('assunto').notNull(),
  descricao: text('descricao').notNull(),

  categoria: text('categoria').default('geral').notNull(),
  // 'geral' | 'cobranca' | 'bug' | 'feature_request' | 'integracao' | 'cancelamento'

  prioridade: text('prioridade').default('media').notNull(),
  // 'baixa' | 'media' | 'alta' | 'urgente'

  status: text('status').default('aberto').notNull(),
  // 'aberto' | 'em_andamento' | 'aguardando_cliente' | 'resolvido' | 'fechado'

  atribuidoPara: text('atribuido_para'), // SuperAdmin ou agente

  // SLA
  slaRespostaAte: timestamp('sla_resposta_ate'),
  slaResolucaoAte: timestamp('sla_resolucao_ate'),
  primeiraRespostaEm: timestamp('primeira_resposta_em'),

  resolvidoEm: timestamp('resolvido_em'),
  satisfacaoNota: integer('satisfacao_nota'), // 1-5 estrelas
  satisfacaoComentario: text('satisfacao_comentario'),

  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
});

// 9. support_messages — Mensagens dos Tickets
export const supportMessages = pgTable('support_messages', {
  id: text('id').primaryKey(), // msg_xxx
  ticketId: text('ticket_id').notNull().references(() => supportTickets.id, { onDelete: 'cascade' }),

  autorNome: text('autor_nome').notNull(),
  autorTipo: text('autor_tipo').default('cliente').notNull(), // 'cliente' | 'admin' | 'sistema'

  conteudo: text('conteudo').notNull(),
  anexoUrl: text('anexo_url'),

  criadoEm: timestamp('criado_em').defaultNow().notNull(),
});

// 10. dunning_logs — Log de Tentativas de Cobrança
export const dunningLogs = pgTable('dunning_logs', {
  id: text('id').primaryKey(), // dun_xxx
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  subscriptionId: text('subscription_id').notNull().references(() => subscriptions.id),
  invoiceId: text('invoice_id').references(() => invoices.id),

  evento: text('evento').notNull(),
  // 'payment_failed' | 'retry_scheduled' | 'retry_attempted' | 'grace_started'
  // | 'grace_warning_d3' | 'grace_warning_d5' | 'grace_expired' | 'suspended'
  // | 'payment_recovered' | 'reactivated'

  tentativaNumero: integer('tentativa_numero').default(1).notNull(),
  stripeEventId: text('stripe_event_id'),

  // Comunicação
  notificacaoEnviada: boolean('notificacao_enviada').default(false).notNull(),
  canalNotificacao: text('canal_notificacao'), // 'email' | 'whatsapp' | 'in_app'

  detalhes: text('detalhes'),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
});

// 11. sofia_sdr_campaigns — Campanhas do SofIA SDR
export const sofiaSdrCampaigns = pgTable('sofia_sdr_campaigns', {
  id: text('id').primaryKey(), // sdr_xxx
  nome: text('nome').notNull(),
  descricao: text('descricao'),

  tipo: text('tipo').default('prospeccao').notNull(),
  // 'prospeccao' | 'reativacao' | 'onboarding' | 'upsell'

  // Template
  mensagemTemplate: text('mensagem_template').notNull(),

  // Segmentação
  filtroEstagio: jsonb('filtro_estagio').$type<string[]>(),
  filtroTemperatura: jsonb('filtro_temperatura').$type<string[]>(),

  // Métricas
  totalEnviados: integer('total_enviados').default(0).notNull(),
  totalRespostas: integer('total_respostas').default(0).notNull(),
  totalConversoes: integer('total_conversoes').default(0).notNull(),

  status: text('status').default('rascunho').notNull(),
  // 'rascunho' | 'ativa' | 'pausada' | 'concluida'

  whatsappNumero: text('whatsapp_numero'), // Número dedicado do SofIA SDR

  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
});

// 12. saas_notifications — Notificações da Plataforma
export const saasNotifications = pgTable('saas_notifications', {
  id: text('id').primaryKey(), // notif_xxx
  tenantId: text('tenant_id').references(() => tenants.id),

  tipo: text('tipo').notNull(),
  // 'trial_welcome' | 'trial_expiring_d3' | 'trial_expiring_d1' | 'trial_expired'
  // | 'payment_success' | 'payment_failed' | 'grace_warning' | 'account_suspended'
  // | 'referral_signup' | 'referral_credit' | 'plan_upgrade' | 'plan_downgrade'
  // | 'ticket_reply' | 'feature_announcement' | 'system_maintenance'

  titulo: text('titulo').notNull(),
  mensagem: text('mensagem').notNull(),

  canal: text('canal').default('in_app').notNull(), // 'in_app' | 'email' | 'whatsapp'

  lida: boolean('lida').default(false).notNull(),
  lidaEm: timestamp('lida_em'),

  acaoUrl: text('acao_url'), // Link de ação (ex: /system/assinatura)

  criadoEm: timestamp('criado_em').defaultNow().notNull(),
});
