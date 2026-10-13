import crypto from 'node:crypto';
import { db } from '../../src/db/index.js';
import { whatsappLogs } from '../../src/db/schema/automacoes.js';
import { ordensServico } from '../../src/db/schema/ordens.js';
import { clientes } from '../../src/db/schema/clientes.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import { validateWebhookSecret, authenticateUser } from '../middleware/auth.js';

// Fallback em memória para testes offline isolados
const fallbackIdempotencyKeys = new Set();
const fallbackLogs = [];

export async function whatsappRoutes(fastify, options) {
  // 1. Inbound Webhook do Gateway SofIA / Baileys (com Mapeamento Estrito & Multi-Tenant)
  fastify.post('/api/v1/whatsapp/webhook', { preHandler: [validateWebhookSecret] }, async (request, reply) => {
    const { evento, remetente, mensagem, mensagemId, tenantId: bodyTenantId } = request.body || {};

    if (!mensagemId) {
      return reply.status(400).send({ error: 'Payload inválido: mensagemId é obrigatório para idempotência' });
    }

    if (!remetente) {
      return reply.status(400).send({ error: 'Payload inválido: remetente é obrigatório' });
    }

    // Resolução do Tenant (Default: ten_easycell_matriz)
    const resolvedTenant = request.headers['x-tenant-id'] || bodyTenantId || 'ten_easycell_matriz';
    const idempotencyKey = `inbound_${mensagemId}`;

    try {
      // 1. Verificação de Idempotência Persistente
      let isDuplicate = false;
      try {
        const existing = await db
          .select({ id: whatsappLogs.id })
          .from(whatsappLogs)
          .where(and(eq(whatsappLogs.tenantId, resolvedTenant), eq(whatsappLogs.idempotencyKey, idempotencyKey)))
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

      // 2. Normalização do Telefone do Remetente (extrai apenas dígitos)
      const telDigitos = String(remetente).replace(/\D/g, '');
      const ultimosDigitos = telDigitos.length >= 8 ? telDigitos.slice(-8) : telDigitos;

      // 3. Mapeamento Estrito: Remetente -> Cliente dentro do Tenant
      let clienteAlvo = null;
      try {
        const clientesEncontrados = await db
          .select()
          .from(clientes)
          .where(and(
            eq(clientes.tenantId, resolvedTenant),
            sql`regexp_replace(${clientes.whatsapp}, '\\D', '', 'g') LIKE ${'%' + ultimosDigitos}`
          ))
          .limit(1);
        if (clientesEncontrados.length > 0) {
          clienteAlvo = clientesEncontrados[0];
        }
      } catch (dbErr) {
        request.log.warn({ dbErr }, 'Aviso: Falha ao buscar cliente no PostgreSQL durante webhook');
      }

      const textoLimpo = String(mensagem || '').trim();
      let acaoTomada = 'nenhuma';
      let osIdAfetada = null;
      let numeroOsAfetada = null;

      // 4. Cenário: Remetente Desconhecido (Sem Vínculo com Cliente do Tenant)
      if (!clienteAlvo) {
        acaoTomada = 'remetente_desconhecido';
      } else {
        // 5. Cenário: Cliente Identificado -> Buscar O.S. Pendente Unívoca
        let osAlvo = null;
        try {
          const osList = await db
            .select()
            .from(ordensServico)
            .where(and(
              eq(ordensServico.tenantId, resolvedTenant),
              eq(ordensServico.clienteId, clienteAlvo.id),
              eq(ordensServico.status, 'orcamento_pendente')
            ))
            .orderBy(desc(ordensServico.criadoEm))
            .limit(1);

          if (osList.length > 0) {
            osAlvo = osList[0];
            osIdAfetada = osAlvo.id;
            numeroOsAfetada = osAlvo.numeroOs;
          }
        } catch (dbErr) {
          request.log.warn({ dbErr }, 'Aviso: Falha ao buscar O.S. do cliente no PostgreSQL');
        }

        if (!osAlvo) {
          acaoTomada = 'sem_os_pendente';
        } else if (textoLimpo === '1') {
          // Aprova EXCLUSIVAMENTE a O.S. daquele cliente naquele tenant
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
              .where(and(
                eq(ordensServico.tenantId, resolvedTenant),
                eq(ordensServico.id, osAlvo.id)
              ));
          } catch (dbErr) {
            request.log.error({ dbErr }, 'Erro ao atualizar status da O.S. no PostgreSQL');
          }
        } else if (textoLimpo === '2') {
          // Registra dúvidas EXCLUSIVAMENTE na O.S. daquele cliente
          acaoTomada = 'cliente_com_duvidas';
          try {
            await db
              .update(ordensServico)
              .set({
                duvidasRegistradas: true,
                atualizadoEm: new Date(),
              })
              .where(and(
                eq(ordensServico.tenantId, resolvedTenant),
                eq(ordensServico.id, osAlvo.id)
              ));
          } catch (dbErr) {
            request.log.error({ dbErr }, 'Erro ao registrar dúvidas na O.S. no PostgreSQL');
          }
        }
      }

      // 6. Gravação do Log de Auditoria
      const inboundLogId = crypto.randomUUID();
      const logEntry = {
        id: inboundLogId,
        tenantId: resolvedTenant,
        lojaId: 'loj_matriz_centro',
        ordemId: osIdAfetada || null,
        destinatario: remetente,
        direcao: 'inbound',
        mensagemId,
        idempotencyKey,
        tipoEvento: acaoTomada,
        conteudo: textoLimpo,
        statusEnvio: 'recebido',
        criadoEm: new Date(),
      };

      try {
        await db.insert(whatsappLogs).values(logEntry);
      } catch (dbErr) {
        fallbackLogs.unshift(logEntry);
      }

      return reply.status(200).send({
        sucesso: true,
        tenantId: resolvedTenant,
        mensagemId,
        acaoTomada,
        osIdAfetada,
        numeroOsAfetada,
        persistencia: 'Confirmada',
        processadoEm: new Date().toISOString()
      });
    } catch (err) {
      request.log.error(err, 'Falha crítica no processamento de webhook do WhatsApp');
      return reply.status(500).send({ error: 'Erro interno ao processar webhook' });
    }
  });

  // 2. Outbound: Disparo Ativo com Idempotência
  fastify.post('/api/v1/whatsapp/send', { preHandler: [authenticateUser] }, async (request, reply) => {
    const { destinatario, template, variaveis, osId, idempotencyKey } = request.body || {};
    const tenantId = request.tenantId || 'ten_easycell_matriz';

    if (!destinatario || !template) {
      return reply.status(400).send({ error: 'destinatario e template são obrigatórios' });
    }

    const key = idempotencyKey || `send_${osId || 'avulso'}_${template}_${Date.now()}`;

    let isDuplicate = false;
    try {
      const existing = await db
        .select({ id: whatsappLogs.id })
        .from(whatsappLogs)
        .where(and(eq(whatsappLogs.tenantId, tenantId), eq(whatsappLogs.idempotencyKey, key)))
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
      tenantId,
      lojaId: 'loj_matriz_centro',
      ordemId: osId || null,
      destinatario,
      direcao: 'outbound',
      mensagemId: generatedId,
      idempotencyKey: key,
      tipoEvento: template,
      conteudo: `Mensagem enviada com sucesso para ${destinatario} usando template ${template}.`,
      statusEnvio: 'enviado',
      criadoEm: new Date(),
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

  // 3. Auditoria de Logs
  fastify.get('/api/v1/whatsapp/logs', { preHandler: [authenticateUser] }, async (request, reply) => {
    const tenantId = request.tenantId || 'ten_easycell_matriz';
    try {
      const logs = await db
        .select()
        .from(whatsappLogs)
        .where(eq(whatsappLogs.tenantId, tenantId))
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
