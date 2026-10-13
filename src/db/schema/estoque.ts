import { pgTable, uuid, text, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { ordensServico } from './ordens';

export const estoqueTipoEnum = pgEnum('estoque_tipo', [
  'peca_reposicao', // Telas, baterias, conectores
  'servico',        // Mão de obra tabelada
  'aparelho_usado', // Aparelho rastreado por IMEI
  'vitrine_novo',   // Aparelho novo
  'acessorio'       // Capas, películas, cabos
]);

export const estoqueItens = pgTable('estoque_itens', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: text('tenant_id').default('ten_easycell_matriz').notNull(),
  lojaId: text('loja_id').default('loj_matriz_centro'),
  codigo: text('codigo').unique(),
  nome: text('nome').notNull(),
  tipo: estoqueTipoEnum('tipo').default('peca_reposicao').notNull(),
  imei: text('imei'), // Obrigatório para aparelhos de vitrine / usados
  marcaCompativel: text('marca_compativel'),
  modeloCompativel: text('modelo_compativel'),
  
  quantidade: integer('quantidade').default(1).notNull(),
  quantidadeMinima: integer('quantidade_minima').default(2).notNull(),
  
  precoCusto: integer('preco_custo').default(0).notNull(), // Em centavos
  precoVenda: integer('preco_venda').default(0).notNull(), // Em centavos
  
  localizacao: text('localizacao'), // Gaveta / Bancada / Vitrine
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
});

// Itens consumidos / aplicados em cada Ordem de Serviço
export const osItens = pgTable('os_itens', {
  id: uuid('id').defaultRandom().primaryKey(),
  ordemId: uuid('ordem_id').references(() => ordensServico.id, { onDelete: 'cascade' }).notNull(),
  itemId: uuid('item_id').references(() => estoqueItens.id),
  descricao: text('descricao').notNull(),
  quantidade: integer('quantidade').default(1).notNull(),
  valorUnitario: integer('valor_unitario').notNull(), // Centavos
  valorTotal: integer('valor_total').notNull(),
  garantiaDias: integer('garantia_dias').default(90).notNull(),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
});

// Movimentações financeiras de caixa do dia
export const caixaMovimentacoes = pgTable('caixa_movimentacoes', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: text('tenant_id').default('ten_easycell_matriz').notNull(),
  lojaId: text('loja_id').default('loj_matriz_centro'),
  ordemId: uuid('ordem_id').references(() => ordensServico.id),
  tipo: text('tipo').notNull(), // 'entrada_os', 'adiantamento_os', 'venda_avulsa', 'sangria'
  descricao: text('descricao').notNull(),
  valor: integer('valor').notNull(), // Centavos
  metodoPagamento: text('metodo_pagamento').notNull(), // 'dinheiro', 'pix', 'cartao_credito', 'cartao_debito'
  operadorNome: text('operador_nome').notNull(),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
});
