import crypto from 'node:crypto';

export const DEFAULT_JWT_SECRET = 'easycell_secret_v1_superadmin_vault_2026';

// Funções de JWT seguras baseadas em RFC 7519 e node:crypto nativo
export function signJwt(payload, secret, expiresInSeconds = 86400) {
  const effectiveSecret = secret || process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
  if (!effectiveSecret) {
    throw new Error('JWT_SECRET não configurado no servidor');
  }
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = crypto.createHmac('sha256', effectiveSecret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyJwt(token, secret) {
  const effectiveSecret = secret || process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
  if (!token || !effectiveSecret) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', effectiveSecret).update(`${header}.${body}`).digest('base64url');
  
  const sigBuffer = Buffer.from(signature);
  const expBuffer = Buffer.from(expectedSig);
  if (sigBuffer.length !== expBuffer.length) return null;
  if (!crypto.timingSafeEqual(sigBuffer, expBuffer)) return null;
  
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Token expirado
    }
    return payload;
  } catch {
    return null;
  }
}

// Middleware: Autenticação de Usuário (Admin, Atendente, Técnico) via Bearer JWT (Clerk + Legado)
export async function authenticateUser(request, reply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Acesso não autorizado: Token Bearer ausente' });
  }

  const token = authHeader.split(' ')[1];

  // 1. Verificação prioritária via Token de Sessão Clerk
  if (process.env.CLERK_SECRET_KEY) {
    try {
      const { verifyClerkSessionToken, getClerkUserDetails, syncClerkUserWithEasyCell } = await import('../lib/clerk.js');
      const clerkClaims = await verifyClerkSessionToken(token);
      if (clerkClaims && clerkClaims.sub) {
        const clerkDetails = await getClerkUserDetails(clerkClaims.sub);
        if (clerkDetails) {
          const syncedUser = await syncClerkUserWithEasyCell(clerkDetails);
          if (syncedUser) {
            request.user = syncedUser;
            return;
          }
        }
      }
    } catch (clerkErr) {
      request.log?.warn?.({ clerkErr }, 'Aviso: Falha na verificação de token Clerk, avaliando fallback local');
    }
  }

  // 2. Fallback resiliente: Validação do JWT nativo EasyCell
  const jwtSecret = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
  const payload = verifyJwt(token, jwtSecret);
  if (!payload) {
    return reply.status(401).send({ error: 'Sessão inválida ou expirada. Faça login novamente.' });
  }

  request.user = payload;
}

// Middleware: Autorização RBAC por Cargo (ex: ['admin', 'atendente'])
export function requireRole(allowedRoles = []) {
  return async function (request, reply) {
    if (!request.user) {
      return reply.status(401).send({ error: 'Usuário não autenticado' });
    }
    if (!allowedRoles.includes(request.user.cargo)) {
      return reply.status(403).send({
        error: `Acesso proibido. Cargo '${request.user.cargo}' não tem permissão para este recurso.`,
        requiredRoles: allowedRoles
      });
    }
  };
}

// Middleware: Autenticação de API Key para chamadas M2M (sem fallback hardcoded)
export async function authenticateApiKey(request, reply) {
  const apiKey = process.env.EASYCELL_API_KEY;
  if (!apiKey) {
    request.log.error('Configuração crítica ausente: EASYCELL_API_KEY não configurada');
    return reply.status(500).send({ error: 'Configuração de segurança incompleta no servidor' });
  }

  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Token Bearer não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  const tokenBuf = Buffer.from(token);
  const keyBuf = Buffer.from(apiKey);

  if (tokenBuf.length !== keyBuf.length || !crypto.timingSafeEqual(tokenBuf, keyBuf)) {
    return reply.status(403).send({ error: 'Token Bearer inválido ou não autorizado' });
  }
}

// Middleware: Validação de Assinatura Webhook SofIA (timing-safe, sem fallback)
export async function validateWebhookSecret(request, reply) {
  const webhookSecret = process.env.SOFIA_WEBHOOK_SECRET;
  if (!webhookSecret) {
    request.log.error('Configuração crítica ausente: SOFIA_WEBHOOK_SECRET não configurado');
    return reply.status(500).send({ error: 'Configuração de webhook incompleta no servidor' });
  }

  const incomingSecret = request.headers['x-webhook-secret'];
  if (!incomingSecret) {
    return reply.status(401).send({ error: 'Assinatura X-Webhook-Secret ausente' });
  }

  const incBuf = Buffer.from(incomingSecret);
  const secBuf = Buffer.from(webhookSecret);

  if (incBuf.length !== secBuf.length || !crypto.timingSafeEqual(incBuf, secBuf)) {
    return reply.status(403).send({ error: 'Assinatura X-Webhook-Secret inválida' });
  }
}
