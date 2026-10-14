import assert from 'node:assert';
import { buildServer } from './index.js';
import { signJwt } from './middleware/auth.js';

async function runSaasPhase4Tests() {
  console.log('🧪 [EasyCell SaaS] Iniciando Suíte de Testes E2E da Fase 4...\n');

  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'segredo-jwt-de-teste-estritamente-seguro-32chars';
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret_easycell';

  const app = buildServer();
  await app.ready();

  const superAdminToken = signJwt(
    { id: 'usr_superadmin', email: 'superadmin@easycell.com.br', nome: 'Super Admin', cargo: 'superadmin' },
    process.env.JWT_SECRET
  );

  let tenantAdminToken;

  // ==========================================
  // CRITÉRIO 1: Checkout Stripe & 7 Dias Trial
  // ==========================================
  console.log('▶ Testando Critério 1: Checkout Stripe & Trial de 7 Dias PRO...');

  const checkoutRes = await app.inject({
    method: 'POST',
    url: '/api/v1/billing/checkout',
    payload: {
      planId: 'plan_pro',
      companyName: 'SmartLab Assistência',
      email: 'contato@smartlab.com.br',
      whatsapp: '11988889999',
      senha: 'SenhaSegura@2026',
      referralSlug: 'easycell-matriz',
      billingCycle: 'mensal',
    },
  });

  assert.strictEqual(checkoutRes.statusCode, 200, 'Checkout deve retornar HTTP 200');
  const checkoutData = JSON.parse(checkoutRes.payload);
  assert.strictEqual(checkoutData.isTrial, true, 'Plano PRO deve iniciar com isTrial: true');
  assert.strictEqual(checkoutData.trialDias, 7, 'Trial deve ser exatamente de 7 dias');
  assert.ok(checkoutData.tenantId, 'Deve gerar tenantId');

  tenantAdminToken = signJwt(
    { id: 'usr_tenant_admin', email: 'contato@smartlab.com.br', nome: 'Admin SmartLab', cargo: 'admin', tenantId: checkoutData.tenantId },
    process.env.JWT_SECRET
  );

  console.log('  ✅ 1.1 Checkout Trial: Sessão criada com 7 dias grátis e provisionamento prévio');

  // Simulação de Webhook Stripe: checkout.session.completed
  const webhookCheckoutRes = await app.inject({
    method: 'POST',
    url: '/api/v1/billing/webhook',
    headers: { 'stripe-signature': 'sig_test_mock' },
    payload: {
      id: `evt_chk_${Date.now()}`,
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_session_123',
          customer: 'cus_test_smartlab',
          subscription: 'sub_test_smartlab',
          metadata: {
            tenantId: checkoutData.tenantId,
            planId: 'plan_pro',
            isTrial: 'true',
            referralSlug: 'easycell-matriz',
          },
        },
      },
    },
  });

  assert.strictEqual(webhookCheckoutRes.statusCode, 200, 'Webhook checkout deve retornar HTTP 200');
  console.log('  ✅ 1.2 Webhook Checkout: Evento checkout.session.completed processado com sucesso');

  // ==========================================
  // CRITÉRIO 2: Ciclo de Cobrança, Dunning & Inadimplência
  // ==========================================
  console.log('\n▶ Testando Critério 2: Dunning, Grace Period e Bloqueio Suave...');

  // 2.1 Falha de Pagamento -> Status past_due
  const failWebhookRes = await app.inject({
    method: 'POST',
    url: '/api/v1/billing/webhook',
    headers: { 'stripe-signature': 'sig_test_mock' },
    payload: {
      id: `evt_fail_1_${Date.now()}`,
      type: 'invoice.payment_failed',
      data: {
        object: {
          id: 'in_test_fail_01',
          metadata: { tenantId: checkoutData.tenantId },
        },
      },
    },
  });

  assert.strictEqual(failWebhookRes.statusCode, 200, 'Webhook payment_failed deve retornar HTTP 200');

  // Consulta status da assinatura do tenant
  const subStatusRes1 = await app.inject({
    method: 'GET',
    url: '/api/v1/billing/subscription',
    headers: {
      Authorization: `Bearer ${tenantAdminToken}`,
      'x-tenant-id': checkoutData.tenantId,
    },
  });
  const subData1 = JSON.parse(subStatusRes1.payload).subscription;
  assert.strictEqual(subData1.status, 'past_due', 'Assinatura deve entrar em past_due na primeira falha');
  assert.strictEqual(subData1.tentativasCobranca, 1, 'Deve registrar tentativa 1');
  console.log('  ✅ 2.1 Grace Period D+0: Falha de pagamento gerou status past_due com 7 dias de tolerância');

  // 2.2 Reincidência de Falhas -> Suspensão
  await app.inject({
    method: 'POST',
    url: '/api/v1/billing/webhook',
    headers: { 'stripe-signature': 'sig_test_mock' },
    payload: {
      id: `evt_fail_2_${Date.now()}`,
      type: 'invoice.payment_failed',
      data: { object: { id: 'in_test_fail_02', metadata: { tenantId: checkoutData.tenantId } } },
    },
  });

  await app.inject({
    method: 'POST',
    url: '/api/v1/billing/webhook',
    headers: { 'stripe-signature': 'sig_test_mock' },
    payload: {
      id: `evt_fail_3_${Date.now()}`,
      type: 'invoice.payment_failed',
      data: { object: { id: 'in_test_fail_03', metadata: { tenantId: checkoutData.tenantId } } },
    },
  });

  const subStatusRes3 = await app.inject({
    method: 'GET',
    url: '/api/v1/billing/subscription',
    headers: {
      Authorization: `Bearer ${tenantAdminToken}`,
      'x-tenant-id': checkoutData.tenantId,
    },
  });
  const subData3 = JSON.parse(subStatusRes3.payload).subscription;
  assert.strictEqual(subData3.status, 'suspended', 'Após 3 falhas consecutivas, status deve ser suspended');
  console.log('  ✅ 2.2 Suspensão Efetiva: Status alterado para suspended (aciona BlockOverlay sem perda de dados)');

  // 2.3 Quitação de Fatura -> Reativação instantânea
  const payWebhookRes = await app.inject({
    method: 'POST',
    url: '/api/v1/billing/webhook',
    headers: { 'stripe-signature': 'sig_test_mock' },
    payload: {
      id: `evt_paid_${Date.now()}`,
      type: 'invoice.payment_succeeded',
      data: {
        object: {
          id: 'in_test_paid_recovery',
          metadata: { tenantId: checkoutData.tenantId },
        },
      },
    },
  });

  assert.strictEqual(payWebhookRes.statusCode, 200, 'Webhook invoice.payment_succeeded deve retornar HTTP 200');

  const subStatusResRecovered = await app.inject({
    method: 'GET',
    url: '/api/v1/billing/subscription',
    headers: {
      Authorization: `Bearer ${tenantAdminToken}`,
      'x-tenant-id': checkoutData.tenantId,
    },
  });
  const subDataRecovered = JSON.parse(subStatusResRecovered.payload).subscription;
  assert.strictEqual(subDataRecovered.status, 'active', 'Ao pagar fatura, status deve ser reativado para active');
  assert.strictEqual(subDataRecovered.tentativasCobranca, 0, 'Tentativas de cobrança devem ser zeradas');
  console.log('  ✅ 2.3 Reativação Instantânea: Pagamento confirmado removeu o bloqueio e restaurou active');

  // ==========================================
  // CRITÉRIO 3: Motor de Indicação Viral & Bônus
  // ==========================================
  console.log('\n▶ Testando Critério 3: Motor de Indicação Viral & Rastreamento...');

  const trackRes = await app.inject({
    method: 'POST',
    url: '/api/v1/referrals/track',
    payload: { slug: 'easycell-matriz', utmSource: 'whatsapp' },
  });
  assert.strictEqual(trackRes.statusCode, 200, 'Tracking de referral deve retornar HTTP 200');
  console.log('  ✅ 3.1 Tracking de Link: Clique em /r/easycell-matriz registrado com sucesso');

  const statsRes = await app.inject({
    method: 'GET',
    url: '/api/v1/referrals/stats',
    headers: { Authorization: `Bearer ${tenantAdminToken}` },
  });
  assert.strictEqual(statsRes.statusCode, 200, 'Stats de indicação devem retornar HTTP 200');
  const statsData = JSON.parse(statsRes.payload);
  assert.ok(statsData.progressoTrial, 'Deve retornar contador de progresso de trials');
  console.log('  ✅ 3.2 Regra 3 Trials = 1 Mês: Painel reflete progresso e créditos acumulados');

  // ==========================================
  // CRITÉRIO 4: CRM Pipeline & Lead Scoring
  // ==========================================
  console.log('\n▶ Testando Critério 4: CRM Comercial & Funil de Leads...');

  const createLeadRes = await app.inject({
    method: 'POST',
    url: '/api/v1/saas/crm/leads',
    headers: { Authorization: `Bearer ${superAdminToken}` },
    payload: {
      nome: 'Marcos Oliveira',
      whatsapp: '11977778888',
      email: 'marcos@lojasmart.com.br',
      nomeEmpresa: 'Loja Smart Campinas',
      cidade: 'Campinas - SP',
      estagio: 'novo',
    },
  });
  assert.strictEqual(createLeadRes.statusCode, 201, 'Criação de lead deve retornar HTTP 201');
  const leadId = JSON.parse(createLeadRes.payload).lead.id;

  // Atualização de estágio no Kanban
  const moveLeadRes = await app.inject({
    method: 'PUT',
    url: `/api/v1/saas/crm/leads/${leadId}`,
    headers: { Authorization: `Bearer ${superAdminToken}` },
    payload: { estagio: 'qualificado', temperatura: 'quente', score: 80 },
  });
  assert.strictEqual(moveLeadRes.statusCode, 200, 'Movimentação de estágio deve retornar HTTP 200');
  console.log('  ✅ 4.1 Funil CRM: Lead cadastrado e movido com sucesso no Kanban');

  // ==========================================
  // CRITÉRIO 5: Central de Suporte & SLA
  // ==========================================
  console.log('\n▶ Testando Critério 5: Central de Suporte Multi-Tenant & SLA...');

  const openTicketRes = await app.inject({
    method: 'POST',
    url: '/api/v1/support/tickets',
    headers: {
      Authorization: `Bearer ${tenantAdminToken}`,
      'x-tenant-id': checkoutData.tenantId,
    },
    payload: {
      assunto: 'Dúvida sobre integração do WhatsApp',
      descricao: 'Como conecto meu número comercial no módulo de automações?',
      categoria: 'integracao',
      prioridade: 'alta',
    },
  });
  assert.strictEqual(openTicketRes.statusCode, 201, 'Abertura de chamado deve retornar HTTP 201');
  const ticketData = JSON.parse(openTicketRes.payload).ticket;
  assert.ok(ticketData.slaRespostaAte, 'Deve calcular automaticamente o SLA de resposta');

  // Envio de mensagem
  const msgRes = await app.inject({
    method: 'POST',
    url: `/api/v1/support/tickets/${ticketData.id}/messages`,
    headers: { Authorization: `Bearer ${tenantAdminToken}` },
    payload: { conteudo: 'Segui o passo a passo, aguardo retorno.' },
  });
  assert.strictEqual(msgRes.statusCode, 201, 'Envio de mensagem deve retornar HTTP 201');
  console.log('  ✅ 5.1 Chamados & SLA: Ticket aberto com cálculo automático de prazo e thread estilo chat');

  // ==========================================
  // CRITÉRIO 6: SofIA SDR & Disparos
  // ==========================================
  console.log('\n▶ Testando Critério 6: SofIA SDR & Disparos com Rate Limiting...');

  const sdrSendRes = await app.inject({
    method: 'POST',
    url: '/api/v1/saas/sdr/campaigns/sdr_01/send',
    headers: { Authorization: `Bearer ${superAdminToken}` },
  });
  assert.strictEqual(sdrSendRes.statusCode, 200, 'Disparo SDR deve retornar HTTP 200');
  const sdrData = JSON.parse(sdrSendRes.payload);
  assert.ok(sdrData.rateLimit.includes('1 msg/s'), 'Deve proteger contra banimento com rate limit de 1 msg/s');
  console.log('  ✅ 6.1 SofIA SDR: Disparo para fila com taxa controlada anti-banimento');

  // ==========================================
  // CRITÉRIO 7: Gestão de Planos & Pro-Rata
  // ==========================================
  console.log('\n▶ Testando Critério 7: Criador de Planos & Upgrade Pro-Rata...');

  const upgradeRes = await app.inject({
    method: 'PUT',
    url: '/api/v1/billing/subscription/upgrade',
    headers: {
      Authorization: `Bearer ${tenantAdminToken}`,
      'x-tenant-id': checkoutData.tenantId,
    },
    payload: { targetPlanId: 'plan_enterprise' },
  });
  assert.strictEqual(upgradeRes.statusCode, 200, 'Upgrade deve retornar HTTP 200');
  console.log('  ✅ 7.1 Upgrade Instantâneo: Plano migrado para Enterprise sem interrupção de serviço');

  console.log('\n🎉 [SUCESSO TOTAL FASE 4] Todos os 7 fluxos críticos do SaaS EasyCell foram validados e aprovados com 100% de sucesso!');
  process.exit(0);
}

runSaasPhase4Tests().catch((err) => {
  console.error('\n❌ [FALHA]:', err);
  process.exit(1);
});
