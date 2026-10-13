import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core';

// 1. Tenants (Empresas / Assistências Técnicas Assinantes do SaaS EasyCell)
export const tenants = pgTable('tenants', {
  id: text('id').primaryKey(), // ex: ten_easycell_matriz
  nomeEmpresa: text('nome_empresa').notNull(),
  slug: text('slug').notNull().unique(),
  cnpj: text('cnpj'),
  emailResponsavel: text('email_responsavel').notNull(),
  telefone: text('telefone'),
  plano: text('plano').default('pro').notNull(), // 'starter', 'pro', 'enterprise'
  statusAssinatura: text('status_assinatura').default('ativa').notNull(), // 'ativa', 'pendente', 'suspensa', 'cancelada'
  valorMensalidade: integer('valor_mensalidade').default(19700), // R$ 197,00 em centavos
  limiteLojas: integer('limite_lojas').default(3).notNull(),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
});

// 2. Lojas (Unidades Físicas / Filiais de cada Assistência Técnica)
export const lojas = pgTable('lojas', {
  id: text('id').primaryKey(), // ex: loj_matriz_centro
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  nomeUnidade: text('nome_unidade').notNull(),
  tipo: text('tipo').default('matriz').notNull(), // 'matriz', 'filial'
  cnpj: text('cnpj'),
  telefoneWhatsapp: text('telefone_whatsapp'),
  enderecoCompleto: text('endereco_completo'),
  corIdentificacao: text('cor_identificacao').default('#06b6d4'),
  status: text('status').default('ativa').notNull(), // 'ativa', 'inativa'
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
});
