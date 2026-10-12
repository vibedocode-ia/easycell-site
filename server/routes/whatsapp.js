import { validateWebhookSecret } from '../middleware/auth.js';

// Cache em memória de mensagens processadas para garantia de idempotência (7 dias)
const processedMessageIds = new Set();

// Mock store de logs de mensagens para histórico e auditoria
const logsStore = [
  {
    id: 'log_01',
    ordemId: 'os_1001',
    destinatario: '5521998765432',
    direcao: 'outbound',
    mensagemId: 'wamid.HBgLMjE5OTg3NjU0MzIVAgASGBgyMjh',
    idempotencyKey: 'idemp_os_1001_entrada',
    tipoEvento: 'os_entrada',
    conteudo: 'Olá Carlos! Sua O.S. #1001 (iPhone 13 Pro) foi recebida na EasyCell. Acompanhe em tempo real com laudo de fotos: https://easycell.vibedocode.pro/track/tr_1001',
    statusEnvio: 'entregue',
    criadoEm: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'log_02',
    ordemId: 'os_1001',
    destinatario: '5521998765432',
    direcao: 'outbound',
    mensagemId: 'wamid.HBgLMjE5OTg3NjU0MzIVAgASGBgyMjl',
    idempotencyKey: 'idemp_os_1001_orcamento',
    tipoEvento: 'orcamento',
    conteudo: 'EasyCell Informa: Orçamento da O.S. #1001 disponível! Peças: R$ 750,00 | Mão de obra: R$ 150,00. Total: R$ 900,00. Responda 1 para APROVAR ou 2 para DÚVIDAS.',
    statusEnvio: 'lido',
    criadoEm: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

export async function whatsappRoutes(fastify, options) {
  // Inbound Webhook do Gateway SofIA / Baileys
  fastify.post('/api/v1/whatsapp/webhook', { preHandler: [validateWebhookSecret] }, async (request, reply) => {
    const { evento, remetente, mensagem, mensagemId, timestamp } = request.body || {};

    if (!mensagemId) {
      return reply.status(400).send({ error: 'mensagemId é obrigatório para idempotência' });
    }

    // Validação estrita de Idempotência
    if (processedMessageIds.has(mensagemId)) {
      return reply.status(200).send({
        status: 'descartado_duplicado',
        mensagem: 'Evento já processado anteriormente. Descartado com segurança por idempotência.'
      });
    }

    processedMessageIds.add(mensagemId);

    const logEntry = {
      id: `log_${Date.now()}`,
      destinatario: remetente || 'desconhecido',
      direcao: 'inbound',
      mensagemId,
      idempotencyKey: `inbound_${mensagemId}`,
      tipoEvento: 'resposta_cliente',
      conteudo: String(mensagem || ''),
      statusEnvio: 'recebido',
      criadoEm: new Date().toISOString()
    };
    logsStore.unshift(logEntry);

    // Avaliação de resposta rápida do cliente (1 = Aprovado / 2 = Dúvidas)
    const textoLimpo = String(mensagem || '').trim();
    let acaoTomada = 'nenhuma';

    if (textoLimpo === '1') {
      acaoTomada = 'orcamento_aprovado';
      // Registra resposta de confirmação
      logsStore.unshift({
        id: `log_${Date.now() + 1}`,
        destinatario: remetente,
        direcao: 'outbound',
        mensagemId: `auto_${Date.now()}`,
        idempotencyKey: `auto_resp_${mensagemId}`,
        tipoEvento: 'confirmacao_aprovacao',
        conteudo: '✅ Perfeito! Seu orçamento foi aprovado com sucesso via WhatsApp. Nosso técnico já iniciou o reparo do seu aparelho.',
        statusEnvio: 'enviado',
        criadoEm: new Date().toISOString()
      });
    } else if (textoLimpo === '2') {
      acaoTomada = 'cliente_com_duvidas';
      logsStore.unshift({
        id: `log_${Date.now() + 1}`,
        destinatario: remetente,
        direcao: 'outbound',
        mensagemId: `auto_${Date.now()}`,
        idempotencyKey: `auto_resp_${mensagemId}`,
        tipoEvento: 'notificacao_duvidas',
        conteudo: 'Entendido! Um de nossos técnicos ou atendentes entrará em contato em instantes para tirar suas dúvidas.',
        statusEnvio: 'enviado',
        criadoEm: new Date().toISOString()
      });
    }

    return reply.status(200).send({
      sucesso: true,
      acaoTomada,
      mensagemId,
      processadoEm: new Date().toISOString()
    });
  });

  // Outbound: Disparo de Mensagem Ativa
  fastify.post('/api/v1/whatsapp/send', async (request, reply) => {
    const { destinatario, template, variaveis, osId, idempotencyKey } = request.body || {};

    if (!destinatario || !template) {
      return reply.status(400).send({ error: 'destinatario e template são obrigatórios' });
    }

    const key = idempotencyKey || `send_${osId || 'avulso'}_${template}_${Date.now()}`;
    if (processedMessageIds.has(key)) {
      return reply.status(200).send({ status: 'descartado_idempotente' });
    }
    processedMessageIds.add(key);

    const generatedId = `wamid.out_${Date.now()}`;
    const log = {
      id: `log_${Date.now()}`,
      ordemId: osId || null,
      destinatario,
      direcao: 'outbound',
      mensagemId: generatedId,
      idempotencyKey: key,
      tipoEvento: template,
      conteudo: `Mensagem enviada com sucesso para ${destinatario} usando template ${template}.`,
      statusEnvio: 'enviado',
      criadoEm: new Date().toISOString()
    };
    logsStore.unshift(log);

    return reply.status(200).send({
      sucesso: true,
      mensagemId: generatedId,
      destinatario,
      status: 'enviado'
    });
  });

  // Consulta de Logs e Auditoria
  fastify.get('/api/v1/whatsapp/logs', async (request, reply) => {
    return reply.send({
      total: logsStore.length,
      logs: logsStore.slice(0, 50)
    });
  });
}
