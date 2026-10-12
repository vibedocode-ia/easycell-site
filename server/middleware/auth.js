// Middleware de Autenticação e Validação de Webhook
const API_SECRET = process.env.EASYCELL_API_KEY || 'easycell-secret-key-2026';
const WEBHOOK_SECRET = process.env.SOFIA_WEBHOOK_SECRET || 'sofia-easycell-wh-secret-2026';

export async function authenticateApiKey(request, reply) {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Token Bearer não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  if (token !== API_SECRET) {
    return reply.status(403).send({ error: 'Token Bearer inválido ou não autorizado' });
  }
}

export async function validateWebhookSecret(request, reply) {
  const incomingSecret = request.headers['x-webhook-secret'];
  if (!incomingSecret || incomingSecret !== WEBHOOK_SECRET) {
    return reply.status(401).send({ error: 'Assinatura X-Webhook-Secret inválida ou ausente' });
  }
}
