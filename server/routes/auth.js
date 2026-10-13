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
  // Scrypt KDF derivado para 'testemudar' com salt de 16 bytes
  senhaHash: '78da9798a555121c9ec3f6d41d91d652:88a826f869a855cebb0a505683984fb45555ebbdf8a1c26c8fb69068e527488c7b5380c8194d5c7acef96bfd91726594bc7baab58daeef28ac33f5d1002fbc03'
};

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
      const senhaCorreta = verifyPasswordScrypt(senha, SUPERADMIN_VANDERSON.senhaHash);
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

        // Tenta sincronizar com o Postgres se disponível
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
            tenantId: SUPERADMIN_VANDERSON.tenantId
          }
        });
      } else {
        return reply.status(401).send({ error: 'Credenciais inválidas' });
      }
    }

    // 2. Verificação de usuários operacionais no PostgreSQL
    try {
      const userList = await db.select().from(usuarios).where(eq(usuarios.email, emailNormalizado)).limit(1);

      if (userList.length === 0) {
        return reply.status(401).send({ error: 'Credenciais inválidas' });
      }

      const user = userList[0];
      const senhaValida = verifyPasswordScrypt(senha, user.senhaHash);

      if (!senhaValida) {
        return reply.status(401).send({ error: 'Credenciais inválidas' });
      }

      const token = signJwt(
        { id: user.id, email: user.email, nome: user.nome, cargo: user.cargo, tenantId: user.tenantId },
        jwtSecret,
        86400 * 7 // 7 dias
      );

      return reply.send({
        sucesso: true,
        token,
        user: { id: user.id, email: user.email, nome: user.nome, cargo: user.cargo, tenantId: user.tenantId }
      });
    } catch (err) {
      request.log.error(err, 'Falha ao autenticar usuário no PostgreSQL');
      return reply.status(503).send({ error: 'Serviço de banco de dados indisponível no momento' });
    }
  });

  // Perfil da sessão autenticada
  fastify.get('/api/v1/auth/me', { preHandler: [authenticateUser] }, async (request, reply) => {
    return reply.send({ user: request.user });
  });
}
