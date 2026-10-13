import fs from 'node:fs';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { db } from '../src/db/index.js';
import { sql } from 'drizzle-orm';
import { authRoutes } from './routes/auth.js';
import { osRoutes } from './routes/os.js';
import { whatsappRoutes } from './routes/whatsapp.js';
import { laudosRoutes } from './routes/laudos.js';
import { tecnicosRoutes } from './routes/tecnicos.js';
import { tenantsRoutes } from './routes/tenants.js';

const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

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
    'http://127.0.0.1:80',
  ];

  if (process.env.CORS_ORIGIN) {
    allowedOrigins.push(process.env.CORS_ORIGIN);
  }

  server.register(cors, {
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
        return;
      }
      cb(new Error(`Origem '${origin}' não autorizada por CORS`), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Healthcheck & Diagnóstico Real do Sistema (Probe Ativo no PostgreSQL)
  server.get('/api/v1/health', async (request, reply) => {
    let dbStatus = 'PostgreSQL 16 via Drizzle ORM (Ativo)';
    let dbOk = true;

    try {
      await db.execute(sql`SELECT 1`);
    } catch (err) {
      dbStatus = 'PostgreSQL Inacessível / Offline';
      dbOk = false;
    }

    const payload = {
      status: dbOk ? 'online' : 'degraded',
      versao: `V${pkg.version}`,
      banco: dbStatus,
      gateway: {
        provedor: 'SofIA / Baileys Gateway',
        status: process.env.SOFIA_WEBHOOK_SECRET ? 'conectado' : 'pendente_configuracao',
        idempotencia: 'PostgreSQL persistente'
      },
      timestamp: new Date().toISOString()
    };

    return reply.status(dbOk ? 200 : 503).send(payload);
  });

  // Registro das rotas modulares da API
  server.register(authRoutes);
  server.register(osRoutes);
  server.register(whatsappRoutes);
  server.register(laudosRoutes);
  server.register(tecnicosRoutes);
  server.register(tenantsRoutes);

  return server;
}

// Inicialização autônoma se executado diretamente
if (process.env.NODE_ENV !== 'test') {
  // O Fastify escuta explicitamente na porta interna 3001 para que o Nginx ocupe a porta 80 pública
  const API_PORT = process.env.API_PORT || 3001;
  const server = buildServer();
  server.listen({ port: Number(API_PORT), host: '0.0.0.0' }, (err, address) => {
    if (err) {
      server.log.error(err);
      process.exit(1);
    }
    console.log(`🚀 [EasyCell API] Backend ativo e escutando na porta interna ${address}`);
  });
}
