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

export async function authRoutes(fastify, options) {
  // Login estrito: Fail-Closed total, sem backdoors e com scrypt KDF
  fastify.post('/api/v1/auth/login', async (request, reply) => {
    const { email, senha } = request.body || {};

    if (!email || !senha) {
      return reply.status(400).send({ error: 'Email e senha são obrigatórios' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      request.log.error('ERRO CRÍTICO: JWT_SECRET ausente. Operação bloqueada em modo Fail-Closed.');
      return reply.status(500).send({ error: 'Configuração de segurança incompleta no servidor' });
    }

    try {
      const emailNormalizado = email.toLowerCase().trim();
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
        { id: user.id, email: user.email, nome: user.nome, cargo: user.cargo },
        jwtSecret,
        86400 * 7 // 7 dias
      );

      return reply.send({
        sucesso: true,
        token,
        user: { id: user.id, email: user.email, nome: user.nome, cargo: user.cargo }
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
