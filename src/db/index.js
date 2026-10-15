import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:p0FcQ6wwx1OQ8ckwYxV8b2DJ0vKMiFsrz1gBA68RDli3Tg20OehppHsaWjqg7jOv@187.77.34.1:5433/easycell?sslmode=disable';

// Client configurado para ambientes Node/Server com fallback de produção resiliente
export const client = postgres(connectionString, { max: 10, idle_timeout: 10 });
export const db = drizzle(client, { schema });
