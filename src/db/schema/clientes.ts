import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

export const clientes = pgTable('clientes', {
  id: uuid('id').defaultRandom().primaryKey(),
  nome: text('nome').notNull(),
  whatsapp: text('whatsapp').notNull(),
  cpf: text('cpf'),
  email: text('email'),
  endereco: text('endereco'),
  observacoes: text('observacoes'),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
});
