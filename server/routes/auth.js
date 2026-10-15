import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { db } from '../../src/db/index.js';
import { usuarios } from '../../src/db/schema/auth.js';
import { eq } from 'drizzle-orm';
import { signJwt, authenticateUser } from '../middleware/auth.js';

// KDF Moderno com Salt Aleatório de 16 bytes e derivação de 64 bytes via Scrypt nativo
export function hashPasswordScrypt(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

export function verifyPasswordScrypt(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, key] = storedHash.split(':');
  const keyBuf = Buffer.from(key, 'hex');
  const derivedBuf = crypto.scryptSync(password, salt, 64);
  if (keyBuf.length !== derivedBuf.length) return false;
  return crypto.timingSafeEqual(keyBuf, derivedBuf);
}

// SuperAdmin oficial da plataforma
const SUPERADMIN_VANDERSON = {
  id: 'usr_superadmin_vanderson',
  nome: 'Vanderson Oliveira',
  email: 'omd.vandersonoliveira@gmail.com',
  cargo: 'superadmin',
  tenantId: 'ten_easycell_matriz',
  telefone: '(21) 99975-7549',
  // Scrypt KDF derivado padrão com salt de 16 bytes para EC@Entrar2026
  senhaHash: '6cc26c01ee11f36d3fb87db234c375ea:649dc59a5c4e9c87ac529f478b4a9201c11aded8e684ca7d77a711d9216110a7c3fce06a6f531489f66d68973f0d679d4d97b0c71be0b57a580ea05603923880'
};

const VAULT_FILE = path.join(process.cwd(), 'storage', 'superadmin_vault.json');
const USERS_VAULT_FILE = path.join(process.cwd(), 'storage', 'users_vault.json');

function carregarVault() {
  try {
    if (fs.existsSync(VAULT_FILE)) {
      const data = JSON.parse(fs.readFileSync(VAULT_FILE, 'utf8'));
      if (data.senhaHash) SUPERADMIN_VANDERSON.senhaHash = data.senhaHash;
      if (data.nome) SUPERADMIN_VANDERSON.nome = data.nome;
      if (data.email) SUPERADMIN_VANDERSON.email = data.email;
      if (data.telefone) SUPERADMIN_VANDERSON.telefone = data.telefone;
    }
  } catch (e) {}
}

function salvarVault() {
  try {
    const dir = path.dirname(VAULT_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(VAULT_FILE, JSON.stringify(SUPERADMIN_VANDERSON, null, 2), 'utf8');
  } catch (e) {}
}

carregarVault();

// Cofre de Usuários Operacionais (Lojistas, Técnicos e Atendentes)
let memoryUsersVault = [];

export function carregarUsersVault() {
  try {
    if (fs.existsSync(USERS_VAULT_FILE)) {
      const data = JSON.parse(fs.readFileSync(USERS_VAULT_FILE, 'utf8'));
      if (Array.isArray(data)) memoryUsersVault = data;
    }
  } catch (e) {
    console.warn('Aviso: Falha ao carregar users_vault.json');
  }
  return memoryUsersVault;
}

export function salvarUserVault(userObj) {
  try {
    carregarUsersVault();
    const emailNorm = (userObj.email || '').toLowerCase().trim();
    const idx = memoryUsersVault.findIndex(u => (u.email && u.email.toLowerCase().trim() === emailNorm) || u.id === userObj.id);
    if (idx >= 0) {
      memoryUsersVault[idx] = { ...memoryUsersVault[idx], ...userObj, atualizadoEm: new Date().toISOString() };
    } else {
      memoryUsersVault.push({ ...userObj, criadoEm: userObj.criadoEm || new Date().toISOString(), atualizadoEm: new Date().toISOString() });
    }
    const dir = path.dirname(USERS_VAULT_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(USERS_VAULT_FILE, JSON.stringify(memoryUsersVault, null, 2), 'utf8');
  } catch (e) {
    console.warn('Aviso: Falha ao gravar users_vault.json');
  }
}

export function buscarUserVault(email) {
  carregarUsersVault();
  const emailNorm = (email || '').toLowerCase().trim();
  return memoryUsersVault.find(u => (u.email || '').toLowerCase().trim() === emailNorm);
}

carregarUsersVault();

export async function authRoutes(fastify, options) {
  // Login estrito: Fail-Closed total, autenticação Scrypt KDF e provisionamento do SuperAdmin
  fastify.post('/api/v1/auth/login', async (request, reply) => {
    const { email, senha } = request.body || {};

    if (!email || !senha) {
      return reply.status(400).send({ error: 'Email e senha são obrigatórios' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'easycell_secret_v1_superadmin_vault_2026';

    const emailNormalizado = email.toLowerCase().trim();

    // 1. Verificação prioritária do SuperAdmin Vanderson Oliveira via Scrypt KDF
    if (emailNormalizado === SUPERADMIN_VANDERSON.email) {
      let senhaCorreta = verifyPasswordScrypt(senha, SUPERADMIN_VANDERSON.senhaHash);

      // Resiliência Postgres: se não coincidiu com a memória/vault, checa se há hash atualizado no banco
      if (!senhaCorreta) {
        try {
          const userDb = await db.select().from(usuarios).where(eq(usuarios.email, emailNormalizado)).limit(1);
          if (userDb.length > 0 && verifyPasswordScrypt(senha, userDb[0].senhaHash)) {
            senhaCorreta = true;
            SUPERADMIN_VANDERSON.senhaHash = userDb[0].senhaHash;
            salvarVault();
          }
        } catch (dbErr) {}
      }

      if (senhaCorreta) {
        const token = signJwt(
          { 
            id: SUPERADMIN_VANDERSON.id, 
            email: SUPERADMIN_VANDERSON.email, 
            nome: SUPERADMIN_VANDERSON.nome, 
            cargo: SUPERADMIN_VANDERSON.cargo,
            tenantId: SUPERADMIN_VANDERSON.tenantId
          },
          jwtSecret,
          86400 * 7 // 7 dias
        );

        // Sincroniza e garante persistência no Postgres
        try {
          const userDb = await db.select().from(usuarios).where(eq(usuarios.email, emailNormalizado)).limit(1);
          if (userDb.length === 0) {
            await db.insert(usuarios).values({
              id: SUPERADMIN_VANDERSON.id,
              tenantId: SUPERADMIN_VANDERSON.tenantId,
              nome: SUPERADMIN_VANDERSON.nome,
              email: SUPERADMIN_VANDERSON.email,
              senhaHash: SUPERADMIN_VANDERSON.senhaHash,
              cargo: SUPERADMIN_VANDERSON.cargo,
            }).catch(() => {});
          } else if (userDb[0].senhaHash !== SUPERADMIN_VANDERSON.senhaHash) {
            await db.update(usuarios).set({
              senhaHash: SUPERADMIN_VANDERSON.senhaHash,
              atualizadoEm: new Date()
            }).where(eq(usuarios.email, emailNormalizado)).catch(() => {});
          }
        } catch (dbSyncErr) {
          request.log.warn('Aviso: Postgres offline para sincronização de usuário, mantendo sessão em memória/JWT');
        }

        return reply.send({
          sucesso: true,
          token,
          user: { 
            id: SUPERADMIN_VANDERSON.id, 
            email: SUPERADMIN_VANDERSON.email, 
            nome: SUPERADMIN_VANDERSON.nome, 
            cargo: SUPERADMIN_VANDERSON.cargo,
            tenantId: SUPERADMIN_VANDERSON.tenantId,
            telefone: SUPERADMIN_VANDERSON.telefone
          }
        });
      } else {
        return reply.status(401).send({ error: 'Credenciais inválidas' });
      }
    }

    // 2. Verificação de usuários operacionais (PostgreSQL + Cofre Resiliente)
    let authenticatedUser = null;

    try {
      const userList = await db.select().from(usuarios).where(eq(usuarios.email, emailNormalizado)).limit(1);
      if (userList.length > 0) {
        const user = userList[0];
        if (verifyPasswordScrypt(senha, user.senhaHash)) {
          authenticatedUser = {
            id: user.id,
            email: user.email,
            nome: user.nome,
            cargo: user.cargo,
            tenantId: user.tenantId,
            lojaId: user.lojaId,
            telefone: user.telefone
          };
          // Mantém cofre em sincronia com o banco
          salvarUserVault(user);
        }
      }
    } catch (dbErr) {
      request.log.warn({ dbErr }, 'Aviso: Banco offline na autenticação, buscando no cofre');
    }

    // Se o banco falhou ou não encontrou, checa no cofre persistente
    if (!authenticatedUser) {
      const vaulted = buscarUserVault(emailNormalizado);
      if (vaulted && verifyPasswordScrypt(senha, vaulted.senhaHash)) {
        authenticatedUser = {
          id: vaulted.id,
          email: vaulted.email,
          nome: vaulted.nome,
          cargo: vaulted.cargo,
          tenantId: vaulted.tenantId,
          lojaId: vaulted.lojaId,
          telefone: vaulted.telefone
        };
      }
    }

    if (!authenticatedUser) {
      return reply.status(401).send({ error: 'Credenciais inválidas' });
    }

    const token = signJwt(
      { 
        id: authenticatedUser.id, 
        email: authenticatedUser.email, 
        nome: authenticatedUser.nome, 
        cargo: authenticatedUser.cargo, 
        tenantId: authenticatedUser.tenantId,
        lojaId: authenticatedUser.lojaId
      },
      jwtSecret,
      86400 * 7 // 7 dias
    );

    return reply.send({
      sucesso: true,
      token,
      user: authenticatedUser
    });
  });

  // Perfil da sessão autenticada (com fallback resiliente)
  fastify.get('/api/v1/auth/me', { preHandler: [authenticateUser] }, async (request, reply) => {
    let userResp = { ...request.user };
    if (request.user?.id === SUPERADMIN_VANDERSON.id || request.user?.email === SUPERADMIN_VANDERSON.email) {
      userResp.nome = SUPERADMIN_VANDERSON.nome;
      userResp.email = SUPERADMIN_VANDERSON.email;
      userResp.telefone = SUPERADMIN_VANDERSON.telefone;
      return reply.send({ user: userResp });
    }

    try {
      const userList = await db.select().from(usuarios).where(eq(usuarios.id, request.user.id)).limit(1);
      if (userList.length > 0) {
        const u = userList[0];
        return reply.send({
          user: {
            id: u.id,
            email: u.email,
            nome: u.nome,
            cargo: u.cargo,
            tenantId: u.tenantId,
            lojaId: u.lojaId,
            telefone: u.telefone
          }
        });
      }
    } catch (e) {}

    const vaulted = buscarUserVault(request.user?.email);
    if (vaulted) {
      return reply.send({
        user: {
          id: vaulted.id,
          email: vaulted.email,
          nome: vaulted.nome,
          cargo: vaulted.cargo,
          tenantId: vaulted.tenantId,
          lojaId: vaulted.lojaId,
          telefone: vaulted.telefone
        }
      });
    }

    return reply.send({ user: userResp });
  });

  // Atualizar senha do usuário autenticado (com Scrypt KDF)
  fastify.put('/api/v1/auth/senha', { preHandler: [authenticateUser] }, async (request, reply) => {
    const { senhaAtual, novaSenha } = request.body || {};
    const userId = request.user?.id;
    const userEmail = request.user?.email?.toLowerCase().trim();

    if (!senhaAtual || !novaSenha) {
      return reply.status(400).send({ error: 'Senha atual e nova senha são obrigatórias' });
    }

    if (novaSenha.length < 6) {
      return reply.status(400).send({ error: 'A nova senha deve ter no mínimo 6 caracteres' });
    }

    // 1. Caso SuperAdmin Vanderson Oliveira
    if (userEmail === SUPERADMIN_VANDERSON.email || userId === SUPERADMIN_VANDERSON.id) {
      let senhaAtualValida = verifyPasswordScrypt(senhaAtual, SUPERADMIN_VANDERSON.senhaHash);
      if (!senhaAtualValida) {
        try {
          const userDb = await db.select().from(usuarios).where(eq(usuarios.email, userEmail)).limit(1);
          if (userDb.length > 0 && verifyPasswordScrypt(senhaAtual, userDb[0].senhaHash)) {
            senhaAtualValida = true;
          }
        } catch (e) {}
      }

      if (!senhaAtualValida) {
        return reply.status(401).send({ error: 'Senha atual incorreta' });
      }

      const novoHash = hashPasswordScrypt(novaSenha);
      SUPERADMIN_VANDERSON.senhaHash = novoHash;
      salvarVault();

      try {
        await db.update(usuarios).set({
          senhaHash: novoHash,
          atualizadoEm: new Date()
        }).where(eq(usuarios.id, SUPERADMIN_VANDERSON.id)).catch(() => {});
      } catch (dbErr) {
        request.log.warn('Aviso: Postgres offline, senha atualizada na instância em memória');
      }

      return reply.send({
        sucesso: true,
        message: 'Senha do SuperAdmin atualizada com sucesso com criptografia Scrypt'
      });
    }

    // 2. Usuários comuns no PostgreSQL
    try {
      const userList = await db.select().from(usuarios).where(eq(usuarios.id, userId)).limit(1);
      if (userList.length === 0) {
        return reply.status(404).send({ error: 'Usuário não encontrado' });
      }

      const user = userList[0];
      const senhaValida = verifyPasswordScrypt(senhaAtual, user.senhaHash);
      if (!senhaValida) {
        return reply.status(401).send({ error: 'Senha atual incorreta' });
      }

      const novoHash = hashPasswordScrypt(novaSenha);
      await db.update(usuarios).set({
        senhaHash: novoHash,
        atualizadoEm: new Date()
      }).where(eq(usuarios.id, userId));

      return reply.send({ sucesso: true, message: 'Senha atualizada com sucesso' });
    } catch (err) {
      request.log.error(err, 'Erro ao atualizar senha no banco');
      return reply.status(500).send({ error: 'Falha ao atualizar senha' });
    }
  });

  // Atualizar dados de perfil do usuário autenticado
  fastify.put('/api/v1/auth/perfil', { preHandler: [authenticateUser] }, async (request, reply) => {
    const { nome, email, telefone } = request.body || {};
    const userId = request.user?.id;

    if (!nome) {
      return reply.status(400).send({ error: 'Nome é obrigatório' });
    }

    if (userId === SUPERADMIN_VANDERSON.id || request.user?.cargo === 'superadmin') {
      SUPERADMIN_VANDERSON.nome = nome;
      if (email) SUPERADMIN_VANDERSON.email = email.toLowerCase().trim();
      if (telefone !== undefined) SUPERADMIN_VANDERSON.telefone = telefone;
      salvarVault();
      return reply.send({
        sucesso: true,
        user: {
          id: SUPERADMIN_VANDERSON.id,
          nome: SUPERADMIN_VANDERSON.nome,
          email: SUPERADMIN_VANDERSON.email,
          cargo: SUPERADMIN_VANDERSON.cargo,
          tenantId: SUPERADMIN_VANDERSON.tenantId,
          telefone: SUPERADMIN_VANDERSON.telefone
        }
      });
    }

    try {
      await db.update(usuarios).set({
        nome,
        ...(email ? { email: email.toLowerCase().trim() } : {}),
        atualizadoEm: new Date()
      }).where(eq(usuarios.id, userId));

      return reply.send({
        sucesso: true,
        user: { 
          ...request.user, 
          nome, 
          ...(email ? { email: email.toLowerCase().trim() } : {}),
          ...(telefone !== undefined ? { telefone } : {})
        }
      });
    } catch (err) {
      return reply.status(500).send({ error: 'Falha ao atualizar dados de perfil' });
    }
  });
}
