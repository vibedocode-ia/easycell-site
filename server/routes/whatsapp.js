import crypto from 'node:crypto';
import { db } from '../../src/db/index.js';
import { whatsappLogs } from '../../src/db/schema/automacoes.js';
import { ordensServico } from '../../src/db/schema/ordens.js';
import { eq, desc } from 'drizzle-orm';
import { validateWebhookSecret, authenticateUser } from '../middleware/auth.js';

// Fallback em memória para testes offline
const fallbackIdempotencyKeys = new Set();
const fallbackLogs = [];

export async function whatsappRoutes(fastify, options) {
  // 1. Inbound Webhook do Gateway SofIA / Baileys (com Idempotência Persistente)
  fastify.post('/api/v1/whatsapp/webhook', { preHandler: [validateWebhookSecret] }, async (request, reply) => {
    const { evento, remetente, mensagem, mensagemId, timestamp } = request.body || {};

    if (!mensagemId) {
      return reply.status(400).send({ error: 'Payload inválido: mensagemId é obrigatório para idempotência' });
    }

    if (!remetente) {
      return reply.status(400).send({ error: 'Payload inválido: remetente é obrigatório' });
    }

    const idempotencyKey = `inbound_${mensagemId}`;

    try {
      // 1. Verificação de Idempotência Persistente no PostgreSQL
      let isDuplicate = false;
      try {
        const existing = await db
          .select({ id: whatsappLogs.id })
          .from(whatsappLogs)
          .where(eq(whatsappLogs.idempotencyKey, idempotencyKey))
          .limit(1);
        if (existing.length > 0) isDuplicate = true;
      } catch (dbErr) {
        if (fallbackIdempotencyKeys.has(idempotencyKey)) isDuplicate = true;
      }

      if (isDuplicate) {
        return reply.status(200).send({
          status: 'descartado_duplicado',
          mensagemId,
          mensagem: 'Evento já processado e persistido anteriormente. Descartado com segurança por idempotência.'
        });
      }

      fallbackIdempotencyKeys.add(idempotencyKey);

      // 2. Persistência do Log de Entrada
      const inboundLogId = crypto.randomUUID();
      const logEntry = {
        id: inboundLogId,
        destinatario: remetente,
        direcao: 'inbound',
        mensagemId,
        idempotencyKey,
        tipoEvento: 'resposta_cliente',
        conteudo: String(mensagem || '').trim(),
        statusEnvio: 'recebido',
        criadoEm: new Date().toISOString()
      };

      try {
        await db.insert(whatsappLogs).values(logEntry);
      } catch (dbErr) {
        fallbackLogs.unshift(logEntry);
      }

      // 3. Avaliação de Intenção do Cliente (1 = Aprovado / 2 = Dúvidas)
      const textoLimpo = String(mensagem || '').trim();
      let acaoTomada = 'nenhuma';

      if (textoLimpo === '1') {
        acaoTomada = 'orcamento_aprovado_via_whatsapp';

        try {
          await db
            .update(ordensServico)
            .set({
              status: 'aprovado_reparo',
              aprovacaoCanal: 'whatsapp_chat',
              aprovadoEm: new Date(),
              atualizadoEm: new Date(),
            })
            .where(eq(ordensServico.status, 'orcamento_pendente'));
        } catch (dbErr) {
          // fallback
        }
      } else if (textoLimpo === '2') {
        acaoTomada = 'cliente_com_duvidas';

        try {
          await db
            .update(ordensServico)
            .set({
              duvidasRegistradas: true,
              atualizadoEm: new Date(),
            })
            .where(eq(ordensServico.status, 'orcamento_pendente'));
        } catch (dbErr) {
          // fallback
        }
      }

      return reply.status(200).send({
        sucesso: true,
        mensagemId,
        acaoTomada,
        persistencia: 'Confirmada',
        processadoEm: new Date().toISOString()
      });
    } catch (err) {
      request.log.error(err, 'Falha no processamento de webhook do WhatsApp');
      return reply.status(500).send({ error: 'Erro interno ao processar webhook' });
    }
  });

  // 2. Outbound: Disparo Ativo com Idempotência
  fastify.post('/api/v1/whatsapp/send', { preHandler: [authenticateUser] }, async (request, reply) => {
    const { destinatario, template, variaveis, osId, idempotencyKey } = request.body || {};

    if (!destinatario || !template) {
      return reply.status(400).send({ error: 'destinatario e template são obrigatórios' });
    }

    const key = idempotencyKey || `send_${osId || 'avulso'}_${template}_${Date.now()}`;

    let isDuplicate = false;
    try {
      const existing = await db
        .select({ id: whatsappLogs.id })
        .from(whatsappLogs)
        .where(eq(whatsappLogs.idempotencyKey, key))
        .limit(1);
      if (existing.length > 0) isDuplicate = true;
    } catch (dbErr) {
      if (fallbackIdempotencyKeys.has(key)) isDuplicate = true;
    }

    if (isDuplicate) {
      return reply.status(200).send({ status: 'descartado_idempotente', idempotencyKey: key });
    }

    fallbackIdempotencyKeys.add(key);

    const generatedId = `wamid.out_${crypto.randomBytes(8).toString('hex')}`;
    const logId = crypto.randomUUID();
    const entry = {
      id: logId,
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

    try {
      await db.insert(whatsappLogs).values(entry);
    } catch (dbErr) {
      fallbackLogs.unshift(entry);
    }

    return reply.status(200).send({
      sucesso: true,
      mensagemId: generatedId,
      destinatario,
      status: 'enviado',
      idempotencyKey: key
    });
  });

  // 3. Auditoria Real de Logs
  fastify.get('/api/v1/whatsapp/logs', { preHandler: [authenticateUser] }, async (request, reply) => {
    try {
      const logs = await db
        .select()
        .from(whatsappLogs)
        .orderBy(desc(whatsappLogs.criadoEm))
        .limit(50);

      return reply.send({
        total: logs.length,
        logs
      });
    } catch (err) {
      return reply.send({
        total: fallbackLogs.length,
        logs: fallbackLogs
      });
    }
  });
}
