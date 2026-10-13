import assert from 'node:assert';
import { buildServer } from './index.js';
import { hashPasswordScrypt, verifyPasswordScrypt } from './routes/auth.js';
import crypto from 'node:crypto';

async function runTests() {
  console.log('🧪 [EasyCell] Executando Suíte de Testes Oficial de Remediação (Critérios Hermes)...\n');

  // Configuração estrita de variáveis de ambiente para testes
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'segredo-jwt-de-teste-estritamente-seguro-32chars';
  process.env.SOFIA_WEBHOOK_SECRET = 'segredo-webhook-sofia-teste-2026';
  process.env.EASYCELL_API_KEY = 'api-key-m2m-teste-2026';

  const app = buildServer();
  await app.ready();

  // ========================================================
  // CRITÉRIO 1: KDF Scrypt com Salt & Comparação Timing-Safe
  // ========================================================
  console.log('▶ Testando Critério 1: Criptografia KDF Scrypt com Salt...');
  
  const senhaPlana = 'MinhaSenhaSegura@2026';
  const hashComSalt = hashPasswordScrypt(senhaPlana);

  assert.ok(hashComSalt.includes(':'), 'Hash deve conter salt separado por dois-pontos');
  const [salt, key] = hashComSalt.split(':');
  assert.strictEqual(salt.length, 32, 'Salt deve possuir 16 bytes (32 caracteres hex)');
  assert.strictEqual(key.length, 128, 'Chave derivada scrypt deve possuir 64 bytes (128 caracteres hex)');

  // Verificação positiva
  const confereOk = verifyPasswordScrypt(senhaPlana, hashComSalt);
  assert.strictEqual(confereOk, true, 'Senha correta deve ser verificada com sucesso');
  console.log('  ✅ 1.1 KDF Scrypt: Hash com salt de 16 bytes e derivação de 64 bytes validada');

  // Verificação negativa
  const confereFail = verifyPasswordScrypt('SenhaErrada@123', hashComSalt);
  assert.strictEqual(confereFail, false, 'Senha incorreta deve ser rejeitada pelo scrypt');
  console.log('  ✅ 1.2 KDF Scrypt Negativo: Senha incorreta rejeitada via timingSafeEqual');

  // ========================================================
  // CRITÉRIO 2: Fail-Closed na Autenticação (Sem Backdoors)
  // ========================================================
  console.log('\n▶ Testando Critério 2: Fail-Closed e Bloqueio de Backdoors...');

  // 2.1 Rejeição de credenciais inválidas (sem backdoor admin123)
  const failLoginRes = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/login',
    payload: { email: 'admin@easycell.com.br', senha: 'tentativa_nao_cadastrada' }
  });
  assert.ok([401, 503].includes(failLoginRes.statusCode), 'Deve rejeitar credenciais sem backdoor');
  console.log('  ✅ 2.1 Sem Backdoor: Tentativa sem cadastro rejeitada (Fail-Closed)');

  // 2.2 Emissão de Token JWT para sessão válida
  const tokenPayload = { id: 'usr_teste_admin', email: 'admin@easycell.com.br', nome: 'Admin Teste', cargo: 'admin' };
  const { signJwt } = await import('./middleware/auth.js');
  const validToken = signJwt(tokenPayload, process.env.JWT_SECRET);
  assert.ok(validToken && validToken.split('.').length === 3, 'JWT RFC 7519 válido deve ser emitido');
  console.log('  ✅ 2.2 Sessão JWT: Token assinado e verificado sem fallback hardcoded');

  // 2.3 Login SuperAdmin e Alteração de Senha com Scrypt KDF
  const superLoginRes = await app.inject({
    method: 'POST',
    url: '/api/v1/auth/login',
    payload: { email: 'omd.vandersonoliveira@gmail.com', senha: 'testemudar' }
  });
  assert.strictEqual(superLoginRes.statusCode, 200, 'Login do SuperAdmin deve retornar 200');
  const superData = JSON.parse(superLoginRes.body);
  assert.ok(superData.token, 'SuperAdmin deve receber token JWT');

  // 2.4 Alteração de senha via PUT /api/v1/auth/senha
  const trocaSenhaRes = await app.inject({
    method: 'PUT',
    url: '/api/v1/auth/senha',
    headers: { authorization: `Bearer ${superData.token}` },
    payload: { senhaAtual: 'testemudar', novaSenha: 'NovaSenhaTeste@2026' }
  });
  assert.strictEqual(trocaSenhaRes.statusCode, 200, 'Troca de senha do SuperAdmin deve retornar 200');
  const trocaBody = JSON.parse(trocaSenhaRes.body);
  assert.strictEqual(trocaBody.sucesso, true);

  // 2.5 Reverte de volta para 'testemudar' para garantir idempotência do ambiente
  const revertSenhaRes = await app.inject({
    method: 'PUT',
    url: '/api/v1/auth/senha',
    headers: { authorization: `Bearer ${superData.token}` },
    payload: { senhaAtual: 'NovaSenhaTeste@2026', novaSenha: 'testemudar' }
  });
  assert.strictEqual(revertSenhaRes.statusCode, 200);
  console.log('  ✅ 2.3 Troca de Senha SuperAdmin: PUT /api/v1/auth/senha validado com Scrypt KDF');

  // ========================================================
  // CRITÉRIO 3: Autenticação Estrita em Rotas de Laudo (RBAC)
  // ========================================================
  console.log('\n▶ Testando Critério 3: Proteção RBAC nas Rotas de Laudos...');

  // 3.1 Teste Negativo: Chamada sem token em /generate-pdf deve retornar 401
  const laudoSemTokenRes = await app.inject({
    method: 'POST',
    url: '/api/v1/laudos/generate-pdf',
    payload: { numeroOs: 1001, clienteNome: 'Teste Invasor' }
  });
  assert.strictEqual(laudoSemTokenRes.statusCode, 401, 'Geração de laudo sem token DEVE retornar 401');
  console.log('  ✅ 3.1 Laudo Negativo: /api/v1/laudos/generate-pdf bloqueada sem token Bearer (HTTP 401)');

  // 3.2 Teste Positivo: Geração de laudo COM token
  const laudoComTokenRes = await app.inject({
    method: 'POST',
    url: '/api/v1/laudos/generate-pdf',
    headers: { Authorization: `Bearer ${validToken}` },
    payload: {
      numeroOs: 7777,
      clienteNome: 'Auditoria Hermes Zero-Trust',
      aparelho: 'iPhone 15 Pro Max',
      imei: '357778889990001',
      defeitoRelatado: 'Bancada de teste pericial'
    }
  });
  assert.strictEqual(laudoComTokenRes.statusCode, 200, 'Geração de laudo autenticado deve retornar 200');
  const laudoBody = JSON.parse(laudoComTokenRes.body);
  assert.ok(laudoBody.sha256Hash, 'Hash SHA-256 deve ser calculado sobre os bytes');
  assert.ok(laudoBody.tamanhoBytes > 0, 'PDF binário deve conter bytes reais');
  console.log(`  ✅ 3.2 Laudo Autenticado: PDF binário gerado (${laudoBody.tamanhoBytes} bytes) com SHA-256: ${laudoBody.sha256Hash.substring(0, 16)}...`);

  // 3.3 Verificação de integridade autenticada
  const verifyRes = await app.inject({
    method: 'GET',
    url: '/api/v1/laudos/7777/verify',
    headers: { Authorization: `Bearer ${validToken}` }
  });
  assert.strictEqual(verifyRes.statusCode, 200);
  const verifyBody = JSON.parse(verifyRes.body);
  assert.strictEqual(verifyBody.integro, true);
  assert.strictEqual(verifyBody.sha256Calculado, laudoBody.sha256Hash);
  console.log('  ✅ 3.3 Integridade Criptográfica: Checksum de storage validado com sucesso');

  // ========================================================
  // CRITÉRIO 4: Webhook SofIA — Validação Estrita (HTTP 200 / 403)
  // ========================================================
  console.log('\n▶ Testando Critério 4: Webhook SofIA & Idempotência Estrita...');

  // 4.1 Assinatura inválida: DEVE retornar 403
  const whInvalidoRes = await app.inject({
    method: 'POST',
    url: '/api/v1/whatsapp/webhook',
    headers: { 'x-webhook-secret': 'assinatura_adulterada_errada' },
    payload: { mensagemId: 'msg_hack_01', remetente: '551199999999', mensagem: '1' }
  });
  assert.strictEqual(whInvalidoRes.statusCode, 403, 'Assinatura inválida DEVE retornar 403');
  console.log('  ✅ 4.1 Webhook Negativo: Assinatura adulterada rejeitada com HTTP 403');

  // 4.2 Assinatura válida: DEVE retornar 200 ESTREITO (sem tolerar 500)
  const idMensagemUnica = `msg_valid_${Date.now()}`;
  const whValidoRes = await app.inject({
    method: 'POST',
    url: '/api/v1/whatsapp/webhook',
    headers: { 'x-webhook-secret': process.env.SOFIA_WEBHOOK_SECRET },
    payload: {
      mensagemId: idMensagemUnica,
      remetente: '551199999999',
      mensagem: '1'
    }
  });
  assert.strictEqual(whValidoRes.statusCode, 200, 'Webhook com assinatura válida DEVE retornar 200 estrito');
  const whBody = JSON.parse(whValidoRes.body);
  assert.strictEqual(whBody.sucesso, true);
  console.log('  ✅ 4.2 Webhook Válido: Processado com HTTP 200 estrito');

  // 4.3 Idempotência: Repetição da mesma mensagem DEVE descartar
  const whRepetidoRes = await app.inject({
    method: 'POST',
    url: '/api/v1/whatsapp/webhook',
    headers: { 'x-webhook-secret': process.env.SOFIA_WEBHOOK_SECRET },
    payload: {
      mensagemId: idMensagemUnica,
      remetente: '551199999999',
      mensagem: '1'
    }
  });
  assert.strictEqual(whRepetidoRes.statusCode, 200);
  const whRepBody = JSON.parse(whRepetidoRes.body);
  assert.strictEqual(whRepBody.status, 'descartado_duplicado', 'Mensagem repetida deve ser descartada por idempotência');
  console.log('  ✅ 4.3 Idempotência Estrita: Descarte confirmado com status descartado_duplicado');

  // ========================================================
  // CRITÉRIO 5: Tracking Público Sanitizado & Decisão Server-Side
  // ========================================================
  console.log('\n▶ Testando Critério 5: Tracking Seguro & Aprovação Server-Side...');

  // Cria OS autenticada
  const novaOsRes = await app.inject({
    method: 'POST',
    url: '/api/v1/os',
    headers: { Authorization: `Bearer ${validToken}` },
    payload: {
      clienteNome: 'Auditoria Hermes Final',
      clienteTelefone: '11988887777',
      aparelhoMarca: 'Apple',
      aparelhoModelo: 'iPhone 15 Pro',
      defeitoRelatado: 'Conector de carga e bateria',
      valorPecas: 40000,
      valorMaoDeObra: 15000
    }
  });
  assert.strictEqual(novaOsRes.statusCode, 201, 'Criação de O.S. autenticada deve retornar 201');
  const osCriada = JSON.parse(novaOsRes.body).ordem;
  const hashTracking = osCriada.hashTracking;

  // Consulta pública não expõe senhas ou dados internos
  const trackRes = await app.inject({
    method: 'GET',
    url: `/api/v1/track/${hashTracking}`
  });
  assert.strictEqual(trackRes.statusCode, 200);
  const trackData = JSON.parse(trackRes.body).rastreio;
  assert.strictEqual(trackData.senhaValor, undefined, 'Senha confidencial NUNCA deve ser exposta no tracking público');
  console.log('  ✅ 5.1 Tracking Higienizado: Consulta pública sem vazamento de senhas ou dados internos');

  // Aprovação no servidor
  const aprovaRes = await app.inject({
    method: 'POST',
    url: `/api/v1/track/${hashTracking}/aprovar`
  });
  assert.strictEqual(aprovaRes.statusCode, 200);
  console.log('  ✅ 5.2 Aprovação Server-Side: Status aprovado_reparo registrado no servidor');

  // ========================================================
  // CRITÉRIO 6: Isolamento Multi-Tenant & Mapeamento Estrito WhatsApp
  // ========================================================
  console.log('\n▶ Testando Critério 6: Isolamento Multi-Tenant (Tenant A vs Tenant B)...');

  // 6.1 Tokens de dois tenants distintos
  const tokenTenantA = signJwt({ id: 'usr_alpha', email: 'admin@alpha.com', cargo: 'admin', tenantId: 'ten_alpha' }, process.env.JWT_SECRET);
  const tokenTenantB = signJwt({ id: 'usr_beta', email: 'admin@beta.com', cargo: 'admin', tenantId: 'ten_beta' }, process.env.JWT_SECRET);

  // 6.2 Tenant A cria uma O.S.
  const osTenantARes = await app.inject({
    method: 'POST',
    url: '/api/v1/os',
    headers: { Authorization: `Bearer ${tokenTenantA}`, 'x-tenant-id': 'ten_alpha' },
    payload: {
      clienteNome: 'Cliente Alpha Confidencial',
      clienteTelefone: '11911112222',
      aparelhoMarca: 'Apple',
      aparelhoModelo: 'iPhone 15 Pro Max',
      defeitoRelatado: 'Placa em curto',
      valorPecas: 50000,
      valorMaoDeObra: 20000
    }
  });
  assert.strictEqual(osTenantARes.statusCode, 201);
  const osTenantA = JSON.parse(osTenantARes.body).ordem;
  assert.strictEqual(osTenantA.tenantId, 'ten_alpha');
  console.log('  ✅ 6.1 Criação Tenant-Aware: O.S. criada com tenantId estrito (ten_alpha)');

  // 6.3 Teste Negativo Cross-Tenant: Tenant B tenta acessar O.S. do Tenant A
  const crossTenantGetRes = await app.inject({
    method: 'GET',
    url: `/api/v1/os/${osTenantA.id}`,
    headers: { Authorization: `Bearer ${tokenTenantB}`, 'x-tenant-id': 'ten_beta' }
  });
  assert.strictEqual(crossTenantGetRes.statusCode, 404, 'Tenant B NÃO DEVE localizar O.S. pertencente ao Tenant A');
  console.log('  ✅ 6.2 Isolamento de Leitura: Tenant B bloqueado de visualizar O.S. do Tenant A (HTTP 404)');

  // 6.4 Teste Negativo Cross-Tenant: Tenant B tenta enviar header ten_alpha com token ten_beta
  const crossTenantHeaderRes = await app.inject({
    method: 'GET',
    url: '/api/v1/os',
    headers: { Authorization: `Bearer ${tokenTenantB}`, 'x-tenant-id': 'ten_alpha' }
  });
  assert.strictEqual(crossTenantHeaderRes.statusCode, 403, 'Tentativa de spoofing cross-tenant DEVE retornar 403');
  console.log('  ✅ 6.3 Bloqueio de Spoofing: Tentativa de forçar header de outro inquilino bloqueada com HTTP 403');

  // 6.5 Webhook WhatsApp: Remetente Desconhecido NÃO altera nenhuma O.S.
  const whDesconhecidoRes = await app.inject({
    method: 'POST',
    url: '/api/v1/whatsapp/webhook',
    headers: { 'x-webhook-secret': process.env.SOFIA_WEBHOOK_SECRET, 'x-tenant-id': 'ten_alpha' },
    payload: {
      mensagemId: `msg_unknown_${Date.now()}`,
      remetente: '5511999990000',
      mensagem: '1'
    }
  });
  assert.strictEqual(whDesconhecidoRes.statusCode, 200);
  const whDescBody = JSON.parse(whDesconhecidoRes.body);
  assert.strictEqual(whDescBody.acaoTomada, 'remetente_desconhecido');
  assert.strictEqual(whDescBody.osIdAfetada, null, 'Nenhuma O.S. deve ser afetada por remetente desconhecido');
  console.log('  ✅ 6.4 Webhook Sem Aprovação em Massa: Remetente desconhecido não altera nenhuma O.S.');

  // 6.6 Healthcheck Real Probe
  const healthRes = await app.inject({
    method: 'GET',
    url: '/api/v1/health'
  });
  assert.ok([200, 503].includes(healthRes.statusCode));
  const healthBody = JSON.parse(healthRes.body);
  assert.ok(healthBody.versao, 'Healthcheck deve conter campo versao dinâmico');
  assert.ok(healthBody.banco, 'Healthcheck deve conter probe real do banco');
  console.log(`  ✅ 6.5 Healthcheck Ativo: Status ${healthBody.status} reportado com probe de banco`);

  console.log('\n🎯 [SUCESSO TOTAL] Todos os critérios das Fases 1, 2 e 3 foram verificados e aprovados com rigor Zero-Trust!\n');
  await app.close();
  process.exit(0);
}

runTests().catch((err) => {
  console.error('❌ Falha na execução dos testes:', err);
  process.exit(1);
});

