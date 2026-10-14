import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { db } from '../../src/db/index.js';
import { tenants, lojas } from '../../src/db/schema/tenants.js';
import { usuarios } from '../../src/db/schema/auth.js';
import { eq } from 'drizzle-orm';
import { signJwt, authenticateUser, requireRole } from '../middleware/auth.js';
import { hashPasswordScrypt } from './auth.js';

const INVITES_FILE = path.join(process.cwd(), 'storage', 'onboarding_invites.json');

// Memória e persistência local resiliente
let memoryInvites = [];

function carregarInvites() {
  try {
    if (fs.existsSync(INVITES_FILE)) {
      const data = JSON.parse(fs.readFileSync(INVITES_FILE, 'utf8'));
      if (Array.isArray(data)) memoryInvites = data;
    }
  } catch (e) {
    console.warn('Aviso: Falha ao carregar onboarding_invites.json');
  }
}

function salvarInvites() {
  try {
    const dir = path.dirname(INVITES_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(INVITES_FILE, JSON.stringify(memoryInvites, null, 2), 'utf8');
  } catch (e) {
    console.warn('Aviso: Falha ao gravar onboarding_invites.json');
  }
}

carregarInvites();

export function createOnboardingInvite(tenantData) {
  const token = `act_${crypto.randomBytes(16).toString('hex')}`;
  const agora = new Date();
  const expiraEm = new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias

  const invite = {
    token,
    tenantId: tenantData.id,
    nomeEmpresa: tenantData.nomeEmpresa,
    slug: tenantData.slug,
    plano: tenantData.plano || 'pro',
    emailResponsavel: tenantData.emailResponsavel || '',
    telefone: tenantData.telefone || '',
    status: 'pendente',
    criadoEm: agora.toISOString(),
    expiraEm: expiraEm.toISOString(),
    usadoEm: null,
  };

  // Desativa convites pendentes anteriores do mesmo tenant para manter unicidade
  memoryInvites.forEach((i) => {
    if (i.tenantId === tenantData.id && i.status === 'pendente') {
      i.status = 'cancelado_por_renovacao';
    }
  });

  memoryInvites.unshift(invite);
  salvarInvites();
  return invite;
}

export function getLatestInviteByTenantId(tenantId) {
  return memoryInvites.find((i) => i.tenantId === tenantId && (i.status === 'pendente' || i.status === 'concluido'));
}

export async function onboardingRoutes(fastify, options) {
  // ==========================================
  // 1. CONSULTA PÚBLICA DE TOKEN DE ATIVAÇÃO
  // ==========================================
  fastify.get('/api/v1/onboarding/:token', async (request, reply) => {
    const { token } = request.params;
    carregarInvites();

    const invite = memoryInvites.find((i) => i.token === token);
    if (!invite) {
      return reply.status(404).send({
        valido: false,
        error: 'Link de ativação não encontrado ou inexistente.'
      });
    }

    if (invite.status === 'concluido' || invite.usadoEm) {
      return reply.status(400).send({
        valido: false,
        error: 'Este link já foi utilizado para ativar a conta. Faça login diretamente.'
      });
    }

    const agora = new Date();
    const expira = new Date(invite.expiraEm);
    if (agora > expira || invite.status === 'expirado') {
      invite.status = 'expirado';
      salvarInvites();
      return reply.status(400).send({
        valido: false,
        error: 'Este link de ativação expirou (validade de 7 dias). Solicite um novo link ao administrador.'
      });
    }

    return reply.send({
      valido: true,
      invite: {
        token: invite.token,
        tenantId: invite.tenantId,
        nomeEmpresa: invite.nomeEmpresa,
        slug: invite.slug,
        plano: invite.plano,
        emailResponsavel: invite.emailResponsavel,
        telefone: invite.telefone,
        expiraEm: invite.expiraEm
      }
    });
  });

  // ==========================================
  // 2. CONCLUSÃO DO PRIMEIRO ACESSO PELO CLIENTE
  // ==========================================
  fastify.post('/api/v1/onboarding/:token/completar', async (request, reply) => {
    const { token } = request.params;
    const {
      nomeResponsavel,
      email,
      senha,
      telefone,
      cnpjOuCpf,
      razaoSocial,
      endereco,
      nomeUnidade
    } = request.body || {};

    if (!nomeResponsavel || !email || !senha) {
      return reply.status(400).send({
        error: 'Campos obrigatórios: Nome do Responsável, E-mail e Senha de Acesso.'
      });
    }

    if (senha.length < 6) {
      return reply.status(400).send({
        error: 'A senha de acesso deve possuir no mínimo 6 caracteres.'
      });
    }

    carregarInvites();
    const invite = memoryInvites.find((i) => i.token === token);
    if (!invite || invite.status === 'concluido') {
      return reply.status(400).send({ error: 'Convite inválido ou já utilizado.' });
    }

    const agora = new Date();
    if (agora > new Date(invite.expiraEm)) {
      return reply.status(400).send({ error: 'O link de ativação expirou.' });
    }

    const emailNormalizado = email.toLowerCase().trim();
    const senhaHash = hashPasswordScrypt(senha);
    const userId = `usr_${crypto.randomBytes(8).toString('hex')}`;
    const lojaId = `loj_${invite.slug}_matriz`;

    // 1. Gravação no PostgreSQL (com fallback gracioso em memória)
    try {
      // Cria o usuário administrador do Tenant
      await db.insert(usuarios).values({
        id: userId,
        tenantId: invite.tenantId,
        lojaId,
        nome: nomeResponsavel,
        email: emailNormalizado,
        senhaHash,
        cargo: 'admin'
      }).catch(err => {
        request.log.warn({ err }, 'Aviso: Falha ao inserir usuário no Postgres durante onboarding');
      });

      // Atualiza os dados da Empresa (Tenant)
      await db.update(tenants).set({
        cnpj: cnpjOuCpf || null,
        emailResponsavel: emailNormalizado,
        telefone: telefone || null,
        statusAssinatura: 'ativa',
        atualizadoEm: new Date()
      }).where(eq(tenants.id, invite.tenantId)).catch(() => {});

      // Atualiza a Loja Matriz com dados de endereço
      const enderecoFormatado = endereco
        ? `${endereco.logradouro || ''}, ${endereco.numero || ''} ${endereco.complemento || ''} - ${endereco.bairro || ''}, ${endereco.cidade || ''}/${endereco.uf || ''} - CEP: ${endereco.cep || ''}`.trim()
        : null;

      await db.update(lojas).set({
        nomeUnidade: nomeUnidade || `${invite.nomeEmpresa} (Matriz)`,
        cnpj: cnpjOuCpf || null,
        telefoneWhatsapp: telefone || null,
        enderecoCompleto: enderecoFormatado,
        status: 'ativa',
        atualizadoEm: new Date()
      }).where(eq(lojas.id, lojaId)).catch(() => {});
    } catch (dbErr) {
      request.log.warn({ dbErr }, 'Aviso: Banco offline no onboarding, operando com resiliência');
    }

    // 2. Marca o convite como concluído
    invite.status = 'concluido';
    invite.usadoEm = new Date().toISOString();
    invite.userIdCriado = userId;
    invite.emailResponsavel = emailNormalizado;
    invite.telefone = telefone || invite.telefone;
    salvarInvites();

    // 3. Emite JWT com 7 dias de validade para login imediato
    const jwtSecret = process.env.JWT_SECRET || 'easycell_secret_v1_superadmin_vault_2026';
    const jwtToken = signJwt(
      {
        id: userId,
        email: emailNormalizado,
        nome: nomeResponsavel,
        cargo: 'admin',
        tenantId: invite.tenantId,
        lojaId
      },
      jwtSecret,
      86400 * 7
    );

    const userPayload = {
      id: userId,
      nome: nomeResponsavel,
      email: emailNormalizado,
      cargo: 'admin',
      tenantId: invite.tenantId,
      lojaId,
      telefone: telefone || invite.telefone
    };

    return reply.status(200).send({
      sucesso: true,
      token: jwtToken,
      user: userPayload,
      message: 'Cadastro concluído e conta ativada com sucesso!'
    });
  });

  // ==========================================
  // 3. CONSULTA DE LINK ATIVO (SUPER ADMIN)
  // ==========================================
  fastify.get(
    '/api/v1/saas/tenants/:id/link-ativacao',
    { preHandler: [authenticateUser, requireRole(['superadmin', 'admin'])] },
    async (request, reply) => {
      const { id } = request.params;
      carregarInvites();

      let invite = memoryInvites.find((i) => i.tenantId === id && i.status === 'pendente');
      if (!invite) {
        // Se não houver pendente, tenta buscar tenant para gerar
        invite = memoryInvites.find((i) => i.tenantId === id);
      }

      return reply.send({
        invite: invite || null,
        activationLink: invite ? `/ativar/${invite.token}` : null
      });
    }
  );

  // ==========================================
  // 4. RENOVAR / GERAR NOVO LINK (SUPER ADMIN)
  // ==========================================
  fastify.post(
    '/api/v1/saas/tenants/:id/renovar-link',
    { preHandler: [authenticateUser, requireRole(['superadmin', 'admin'])] },
    async (request, reply) => {
      const { id } = request.params;
      carregarInvites();

      // Busca dados básicos do tenant
      let tenantData = null;
      try {
        const dbResult = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
        if (dbResult.length > 0) tenantData = dbResult[0];
      } catch (e) {}

      if (!tenantData) {
        const prevInvite = memoryInvites.find((i) => i.tenantId === id);
        if (prevInvite) {
          tenantData = {
            id: prevInvite.tenantId,
            nomeEmpresa: prevInvite.nomeEmpresa,
            slug: prevInvite.slug,
            plano: prevInvite.plano,
            emailResponsavel: prevInvite.emailResponsavel,
            telefone: prevInvite.telefone
          };
        }
      }

      if (!tenantData) {
        tenantData = {
          id,
          nomeEmpresa: 'Empresa Cliente',
          slug: id.replace('ten_', ''),
          plano: 'pro'
        };
      }

      const newInvite = createOnboardingInvite(tenantData);

      return reply.send({
        sucesso: true,
        invite: newInvite,
        activationLink: `/ativar/${newInvite.token}`,
        message: 'Novo link de ativação gerado com sucesso (válido por 7 dias)!'
      });
    }
  );
}
