import { pgTable, uuid, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { usuarios } from './auth';
import { ordensServico } from './ordens';

// Tabela de Perfil Técnico e Taxa de Comissionamento
export const tecnicos = pgTable('tecnicos', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: text('tenant_id').default('ten_easycell_matriz').notNull(),
  lojaId: text('loja_id').default('loj_matriz_centro'),
  usuarioId: uuid('usuario_id').references(() => usuarios.id),
  nome: text('nome').notNull(),
  especialidade: text('especialidade').default('Hardware & Placas').notNull(),
  telefone: text('telefone'),
  percentualComissao: integer('percentual_comissao').default(30).notNull(), // Ex: 30 = 30% sobre mão de obra
  ativo: boolean('ativo').default(true).notNull(),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
});

// Tabela de Extrato de Comissões por O.S. Finalizada
export const comissoesExtrato = pgTable('comissoes_extrato', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: text('tenant_id').default('ten_easycell_matriz').notNull(),
  lojaId: text('loja_id').default('loj_matriz_centro'),
  ordemId: uuid('ordem_id').references(() => ordensServico.id).notNull(),
  tecnicoId: uuid('tecnico_id').references(() => tecnicos.id).notNull(),
  valorMaoDeObra: integer('valor_mao_de_obra').notNull(), // Em centavos
  percentualAplicado: integer('percentual_aplicado').notNull(), // Percentual no momento da conclusão
  valorComissao: integer('valor_comissao').notNull(), // Em centavos (calculado)
  statusPagamento: text('status_pagamento').default('pendente').notNull(), // 'pendente' ou 'pago'
  dataQuitacao: timestamp('data_quitacao'),
  responsavelQuitacao: text('responsavel_quitacao'),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
});
