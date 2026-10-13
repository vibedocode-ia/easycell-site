import crypto from 'node:crypto';

// Funções de JWT seguras baseadas em RFC 7519 e node:crypto nativo
export function signJwt(payload, secret, expiresInSeconds = 86400) {
  if (!secret) {
    throw new Error('JWT_SECRET não configurado no servidor');
  }
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

export function verifyJwt(token, secret) {
  if (!token || !secret) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  
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

// Middleware: Autenticação de Usuário (Admin, Atendente, Técnico) via Bearer JWT
export async function authenticateUser(request, reply) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    request.log.error('Configuração crítica ausente: JWT_SECRET não configurado');
    return reply.status(500).send({ error: 'Erro de configuração do servidor de autenticação' });
  }

  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Acesso não autorizado: Token Bearer ausente' });
  }

  const token = authHeader.split(' ')[1];
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
