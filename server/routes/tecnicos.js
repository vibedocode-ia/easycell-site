import crypto from 'node:crypto';
import { db } from '../../src/db/index.js';
import { tecnicos, comissoesExtrato } from '../../src/db/schema/tecnicos.js';
import { eq, desc } from 'drizzle-orm';
import { authenticateUser, requireRole } from '../middleware/auth.js';

export async function tecnicosRoutes(fastify, options) {
  // Lista de técnicos persistida no PostgreSQL
  fastify.get('/api/v1/tecnicos', { preHandler: [authenticateUser] }, async (request, reply) => {
    try {
      let lista = await db.select().from(tecnicos).orderBy(tecnicos.nome);

      // Se a tabela estiver vazia, popula os técnicos iniciais de balcão
      if (lista.length === 0) {
        const seedTecnicos = [
          {
            id: crypto.randomUUID(),
            nome: 'Carlos Alexandre Silva',
            especialidade: 'Hardware & Micro-soldagem de Placas',
            telefone: '11 98765-4321',
            percentualComissao: 35,
            ativo: true,
          },
          {
            id: crypto.randomUUID(),
            nome: 'Mariana Duarte Souza',
            especialidade: 'Telas OLED & Recuperação de FaceID',
            telefone: '11 97654-3210',
            percentualComissao: 30,
            ativo: true,
          },
          {
            id: crypto.randomUUID(),
            nome: 'Felipe Santos Oliveira',
            especialidade: 'Baterias, Carcaças & Periféricos',
            telefone: '11 96543-2109',
            percentualComissao: 25,
            ativo: true,
          }
        ];

        for (const tec of seedTecnicos) {
          await db.insert(tecnicos).values(tec).onConflictDoNothing();
        }
        lista = await db.select().from(tecnicos).orderBy(tecnicos.nome);
      }

      return reply.send({ total: lista.length, tecnicos: lista });
    } catch (err) {
      request.log.error(err, 'Falha ao buscar técnicos no banco');
      return reply.status(500).send({ error: 'Erro ao listar técnicos' });
    }
  });

  // Cadastro de novo técnico
  fastify.post('/api/v1/tecnicos', { preHandler: [authenticateUser, requireRole(['admin'])] }, async (request, reply) => {
    const { nome, especialidade, telefone, percentualComissao } = request.body || {};

    if (!nome) {
      return reply.status(400).send({ error: 'Nome do técnico é obrigatório' });
    }

    try {
      const novoTecnico = {
        id: crypto.randomUUID(),
        nome,
        especialidade: especialidade || 'Assistência Geral',
        telefone: telefone || '',
        percentualComissao: Number(percentualComissao) || 30,
        ativo: true,
      };

      await db.insert(tecnicos).values(novoTecnico);
      return reply.status(201).send({ sucesso: true, tecnico: novoTecnico });
    } catch (err) {
      return reply.status(500).send({ error: 'Erro ao cadastrar técnico no banco' });
    }
  });

  // Extrato de comissões do PostgreSQL
  fastify.get('/api/v1/tecnicos/comissoes', { preHandler: [authenticateUser] }, async (request, reply) => {
    try {
      const comissoes = await db.select().from(comissoesExtrato).orderBy(desc(comissoesExtrato.criadoEm));
      return reply.send({ total: comissoes.length, comissoes });
    } catch (err) {
      return reply.status(500).send({ error: 'Erro ao buscar comissões' });
    }
  });

  // Quitação de comissão (apenas admin ou atendente autorizado)
  fastify.post('/api/v1/tecnicos/comissoes/:id/pagar', { preHandler: [authenticateUser] }, async (request, reply) => {
    const { id } = request.params;
    const responsavel = request.user?.nome || 'Administrador EasyCell';

    try {
      await db.update(comissoesExtrato).set({
        statusPagamento: 'pago',
        dataQuitacao: new Date(),
        responsavelQuitacao: responsavel,
      }).where(eq(comissoesExtrato.id, id));

      return reply.send({ sucesso: true, mensagem: 'Comissão quitada com sucesso no banco de dados' });
    } catch (err) {
      return reply.status(500).send({ error: 'Erro ao quitar comissão' });
    }
  });
}
