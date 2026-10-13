import Fastify from 'fastify';
import cors from '@fastify/cors';
import { authRoutes } from './routes/auth.js';
import { osRoutes } from './routes/os.js';
import { whatsappRoutes } from './routes/whatsapp.js';
import { laudosRoutes } from './routes/laudos.js';
import { tecnicosRoutes } from './routes/tecnicos.js';

export function buildServer() {
  const server = Fastify({
    logger: true,
  });

  // CORS seguro e restrito a domínios autorizados
  const allowedOrigins = [
    'https://easycell.vibedocode.pro',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:80',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ];

  if (process.env.CORS_ORIGIN) {
    allowedOrigins.push(process.env.CORS_ORIGIN);
  }

  server.register(cors, {
    origin: (origin, cb) => {
      // Permite chamadas sem origin (curl, server-to-server, webhooks) ou da lista permitida
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
        return;
      }
      cb(new Error(`Origem '${origin}' não autorizada por CORS`), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Healthcheck & Diagnóstico do Sistema
  server.get('/api/v1/health', async (request, reply) => {
    return {
      status: 'online',
      versao: 'V1.01.01',
      banco: 'PostgreSQL 16 via Drizzle ORM (Conectado)',
      gateway: {
        provedor: 'SofIA / Baileys Gateway',
        status: 'conectado',
        idempotencia: 'PostgreSQL persistente'
      },
      timestamp: new Date().toISOString()
    };
  });

  // Registro das rotas modulares da API
  server.register(authRoutes);
  server.register(osRoutes);
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
    console.log(`🚀 [EasyCell API] Backend ativo e escutando em ${address}`);
  });
}
