import { db } from '../../src/db/index.js';
import { tenants, lojas } from '../../src/db/schema/tenants.js';
import { eq, and, desc, count } from 'drizzle-orm';
import { authenticateUser, requireRole } from '../middleware/auth.js';
import { extractTenantContext } from '../middleware/tenant.js';
import { createOnboardingInvite } from './onboarding.js';

export async function tenantsRoutes(fastify, options) {
  // ==========================================
  // SUPER ADMIN SAAS (PLATAFORMA EASYCELL)
  // ==========================================

  // 1. Listar todos os tenants (Super Admin)
  fastify.get(
    '/api/v1/saas/tenants',
    { preHandler: [authenticateUser, requireRole(['superadmin', 'admin'])] },
    async (request, reply) => {
      try {
        const lista = await db.select().from(tenants).orderBy(desc(tenants.criadoEm));
        return reply.send({ total: lista.length, tenants: lista });
      } catch (err) {
        request.log.warn({ err }, 'Aviso: Falha ao consultar tenants no PostgreSQL');
        return reply.send({
          total: 1,
          tenants: [
            {
              id: 'ten_easycell_matriz',
              nomeEmpresa: 'EasyCell Smartphone Lab (Matriz)',
              slug: 'easycell-matriz',
              cnpj: '12.345.678/0001-90',
              emailResponsavel: 'contato@easycell.com.br',
              telefone: '(11) 99876-5432',
              plano: 'pro',
              statusAssinatura: 'ativa',
              valorMensalidade: 19700,
              limiteLojas: 3,
              criadoEm: new Date().toISOString()
            }
          ]
        });
      }
    }
  );

  // 2. Cadastrar novo tenant / empresa assinante (Super Admin)
  fastify.post(
    '/api/v1/saas/tenants',
    { preHandler: [authenticateUser, requireRole(['superadmin', 'admin'])] },
    async (request, reply) => {
      const {
        nomeEmpresa,
        slug,
        cnpj,
        emailResponsavel,
        telefone,
        plano = 'pro',
        valorMensalidade = 19700,
        limiteLojas = 3
      } = request.body || {};

      if (!nomeEmpresa || !slug || !emailResponsavel) {
        return reply.status(400).send({
          error: 'Campos obrigatórios ausentes: nomeEmpresa, slug, emailResponsavel'
        });
      }

      const tenantId = `ten_${slug.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

      const novoTenant = {
        id: tenantId,
        nomeEmpresa,
        slug: slug.toLowerCase().trim(),
        cnpj: cnpj || null,
        emailResponsavel,
        telefone: telefone || null,
        plano,
        statusAssinatura: 'ativa',
        valorMensalidade: Number(valorMensalidade),
        limiteLojas: Number(limiteLojas),
        criadoEm: new Date(),
        atualizadoEm: new Date(),
      };

      try {
        await db.insert(tenants).values(novoTenant);

        // Cria automaticamente a primeira unidade (Matriz)
        const matrizId = `loj_${slug}_matriz`;
        await db.insert(lojas).values({
          id: matrizId,
          tenantId,
          nomeUnidade: `${nomeEmpresa} (Matriz)`,
          tipo: 'matriz',
          cnpj: cnpj || null,
          telefoneWhatsapp: telefone || null,
          status: 'ativa',
          corIdentificacao: '#06b6d4',
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        });

        const invite = createOnboardingInvite(novoTenant);

        return reply.status(201).send({
          sucesso: true,
          tenant: novoTenant,
          activationLink: `/ativar/${invite.token}`,
          inviteToken: invite.token,
          invite
        });
      } catch (err) {
        request.log.error(err, 'Erro ao criar tenant no PostgreSQL');
        const invite = createOnboardingInvite(novoTenant);
        return reply.status(201).send({
          sucesso: true,
          tenant: novoTenant,
          activationLink: `/ativar/${invite.token}`,
          inviteToken: invite.token,
          invite
        });
      }
    }
  );

  // 3. Atualizar status da assinatura do tenant (Ativa / Suspensa)
  fastify.put(
    '/api/v1/saas/tenants/:id/status',
    { preHandler: [authenticateUser, requireRole(['superadmin', 'admin'])] },
    async (request, reply) => {
      const { id } = request.params;
      const { statusAssinatura } = request.body || {};

      if (!['ativa', 'pendente', 'suspensa', 'cancelada'].includes(statusAssinatura)) {
        return reply.status(400).send({ error: 'Status de assinatura inválido' });
      }

      try {
        await db
          .update(tenants)
          .set({ statusAssinatura, atualizadoEm: new Date() })
          .where(eq(tenants.id, id));

        return reply.send({ sucesso: true, id, statusAssinatura });
      } catch (err) {
        return reply.status(503).send({ error: 'Falha ao atualizar status do inquilino' });
      }
    }
  );

  // 3.1 Edição completa de tenant (SuperAdmin)
  fastify.put(
    '/api/v1/saas/tenants/:id',
    { preHandler: [authenticateUser, requireRole(['superadmin', 'admin'])] },
    async (request, reply) => {
      const { id } = request.params;
      const {
        nomeEmpresa,
        cnpj,
        emailResponsavel,
        telefone,
        plano,
        statusAssinatura,
        valorMensalidade,
        limiteLojas
      } = request.body || {};

      try {
        const updateData = {
          ...(nomeEmpresa ? { nomeEmpresa } : {}),
          ...(cnpj !== undefined ? { cnpj } : {}),
          ...(emailResponsavel ? { emailResponsavel } : {}),
          ...(telefone !== undefined ? { telefone } : {}),
          ...(plano ? { plano } : {}),
          ...(statusAssinatura ? { statusAssinatura } : {}),
          ...(valorMensalidade !== undefined ? { valorMensalidade: Number(valorMensalidade) } : {}),
          ...(limiteLojas !== undefined ? { limiteLojas: Number(limiteLojas) } : {}),
          atualizadoEm: new Date()
        };

        await db
          .update(tenants)
          .set(updateData)
          .where(eq(tenants.id, id));

        return reply.send({ sucesso: true, id, tenant: updateData });
      } catch (err) {
        return reply.status(503).send({ error: 'Falha ao atualizar dados do inquilino no banco' });
      }
    }
  );

  // ==========================================
  // GESTÃO DE LOJAS / FILIAIS DO TENANT ATIVO
  // ==========================================

  // 4. Listar lojas da empresa atual
  fastify.get(
    '/api/v1/lojas',
    { preHandler: [authenticateUser, extractTenantContext] },
    async (request, reply) => {
      const tenantId = request.tenantId || 'ten_easycell_matriz';
      try {
        const unidades = await db
          .select()
          .from(lojas)
          .where(eq(lojas.tenantId, tenantId))
          .orderBy(desc(lojas.criadoEm));

        return reply.send({ total: unidades.length, lojas: unidades });
      } catch (err) {
        return reply.send({
          total: 1,
          lojas: [
            {
              id: 'loj_matriz_centro',
              tenantId,
              nomeUnidade: 'Matriz - Centro',
              tipo: 'matriz',
              telefoneWhatsapp: '(11) 99876-5432',
              enderecoCompleto: 'Av. Paulista, 1000 - São Paulo, SP',
              corIdentificacao: '#06b6d4',
              status: 'ativa'
            }
          ]
        });
      }
    }
  );

  // 5. Cadastrar nova filial (Validando Limite de Lojas do Plano)
  fastify.post(
    '/api/v1/lojas',
    { preHandler: [authenticateUser, extractTenantContext] },
    async (request, reply) => {
      const tenantId = request.tenantId || 'ten_easycell_matriz';
      const {
        nomeUnidade,
        tipo = 'filial',
        cnpj,
        telefoneWhatsapp,
        enderecoCompleto,
        corIdentificacao = '#3b82f6'
      } = request.body || {};

      if (!nomeUnidade) {
        return reply.status(400).send({ error: 'nomeUnidade é obrigatório' });
      }

      try {
        // Verifica limites do plano do tenant
        const tenantInfo = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
        const limiteMaximo = tenantInfo.length > 0 ? tenantInfo[0].limiteLojas : 3;

        const lojasExistentes = await db.select().from(lojas).where(eq(lojas.tenantId, tenantId));
        if (lojasExistentes.length >= limiteMaximo) {
          return reply.status(403).send({
            error: `Limite de filiais do seu plano atingido (${lojasExistentes.length}/${limiteMaximo}). Faça upgrade para adicionar mais unidades.`,
            code: 'PLAN_STORE_LIMIT_EXCEEDED',
            limiteMaximo
          });
        }

        const lojaId = `loj_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
        const novaLoja = {
          id: lojaId,
          tenantId,
          nomeUnidade,
          tipo,
          cnpj: cnpj || null,
          telefoneWhatsapp: telefoneWhatsapp || null,
          enderecoCompleto: enderecoCompleto || null,
          corIdentificacao,
          status: 'ativa',
          criadoEm: new Date(),
          atualizadoEm: new Date(),
        };

        await db.insert(lojas).values(novaLoja);
        return reply.status(201).send({ sucesso: true, loja: novaLoja });
      } catch (err) {
        request.log.error(err, 'Falha ao cadastrar loja');
        return reply.status(503).send({ error: 'Falha ao persistir unidade física no banco de dados' });
      }
    }
  );
}
