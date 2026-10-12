import Fastify from 'fastify';
import cors from '@fastify/cors';
import { whatsappRoutes } from './routes/whatsapp.js';
import { laudosRoutes } from './routes/laudos.js';
import { tecnicosRoutes } from './routes/tecnicos.js';

export function buildServer() {
  const server = Fastify({
    logger: true,
  });

  // Habilita CORS para o frontend do EasyCell
  server.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  // Healthcheck & Diagnóstico do Sistema
  server.get('/api/v1/health', async (request, reply) => {
    return {
      status: 'online',
      versao: 'V1.01.00',
      modulo: 'Fase 2 - Integrações, Escala & Automações',
      gateway: {
        provedor: 'SofIA / Baileys Gateway',
        status: 'conectado',
        modo: 'sessao_unica_isolada',
        idempotencia: 'ativa'
      },
      timestamp: new Date().toISOString()
    };
  });

  // Registro das rotas da Fase 2
  server.register(whatsappRoutes);
  server.register(laudosRoutes);
  server.register(tecnicosRoutes);

  return server;
}

// Inicialização autônoma se executado diretamente
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3001;
  const server = buildServer();
  server.listen({ port: Number(PORT), host: '0.0.0.0' }, (err, address) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
    console.log(`🚀 [EasyCell API] Fase 2 rodando com sucesso em ${address}`);
  });
}
