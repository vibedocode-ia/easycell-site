import { buildServer } from './index.js';

async function runTests() {
  console.log('🧪 [Test Suite] Iniciando testes do Webhook Inbound & Idempotência...');
  const app = buildServer();
  await app.ready();

  const secret = process.env.SOFIA_WEBHOOK_SECRET || 'sofia-easycell-wh-secret-2026';

  // Teste 1: Rejeição sem segredo
  const res1 = await app.inject({
    method: 'POST',
    url: '/api/v1/whatsapp/webhook',
    payload: { mensagemId: 'msg_test_01', mensagem: '1' }
  });
  console.log('Teste 1 (Sem Segredo):', res1.statusCode === 401 ? '✅ PASSOU (401)' : `❌ FALHOU (${res1.statusCode})`);

  // Teste 2: Inbound com segredo e resposta "1" (Aprovação)
  const res2 = await app.inject({
    method: 'POST',
    url: '/api/v1/whatsapp/webhook',
    headers: { 'x-webhook-secret': secret },
    payload: {
      evento: 'mensagem_recebida',
      remetente: '5521998765432',
      mensagem: '1',
      mensagemId: 'msg_inbound_unique_001',
      timestamp: Date.now()
    }
  });
  const data2 = res2.json();
  const pass2 = res2.statusCode === 200 && data2.acaoTomada === 'orcamento_aprovado';
  console.log('Teste 2 (Resposta 1 / Aprovação):', pass2 ? '✅ PASSOU (Aprovado)' : `❌ FALHOU`, data2);

  // Teste 3: Idempotência (Reenvio da mesma mensagemId)
  const res3 = await app.inject({
    method: 'POST',
    url: '/api/v1/whatsapp/webhook',
    headers: { 'x-webhook-secret': secret },
    payload: {
      evento: 'mensagem_recebida',
      remetente: '5521998765432',
      mensagem: '1',
      mensagemId: 'msg_inbound_unique_001', // Mesmo ID
      timestamp: Date.now()
    }
  });
  const data3 = res3.json();
  const pass3 = res3.statusCode === 200 && data3.status === 'descartado_duplicado';
  console.log('Teste 3 (Idempotência / Descarte):', pass3 ? '✅ PASSOU (Descartado)' : `❌ FALHOU`, data3);

  // Teste 4: Inbound com resposta "2" (Dúvidas)
  const res4 = await app.inject({
    method: 'POST',
    url: '/api/v1/whatsapp/webhook',
    headers: { 'x-webhook-secret': secret },
    payload: {
      evento: 'mensagem_recebida',
      remetente: '5521998765432',
      mensagem: '2',
      mensagemId: 'msg_inbound_unique_002',
      timestamp: Date.now()
    }
  });
  const data4 = res4.json();
  const pass4 = res4.statusCode === 200 && data4.acaoTomada === 'cliente_com_duvidas';
  console.log('Teste 4 (Resposta 2 / Dúvidas):', pass4 ? '✅ PASSOU (Dúvidas registradas)' : `❌ FALHOU`, data4);

  // Teste 5: Consulta de logs de auditoria
  const res5 = await app.inject({
    method: 'GET',
    url: '/api/v1/whatsapp/logs'
  });
  const data5 = res5.json();
  const pass5 = res5.statusCode === 200 && data5.total >= 4;
  console.log('Teste 5 (Auditoria de Logs):', pass5 ? `✅ PASSOU (${data5.total} logs registrados)` : `❌ FALHOU`);

  await app.close();
  if (pass2 && pass3 && pass4 && pass5) {
    console.log('🎉 Todos os testes de Webhook & Idempotência foram aprovados!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Erro na execução dos testes:', err);
  process.exit(1);
});
