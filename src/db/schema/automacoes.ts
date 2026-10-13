import { pgTable, uuid, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { ordensServico } from './ordens';

// Tabela de Logs e Mensagens de WhatsApp (Auditoria e Idempotência)
export const whatsappLogs = pgTable('whatsapp_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: text('tenant_id').default('ten_easycell_matriz').notNull(),
  lojaId: text('loja_id').default('loj_matriz_centro'),
  ordemId: uuid('ordem_id').references(() => ordensServico.id),
  destinatario: text('destinatario').notNull(),
  direcao: text('direcao').notNull(), // 'outbound' (disparo) ou 'inbound' (resposta do cliente)
  mensagemId: text('mensagem_id'), // ID único do WhatsApp/SofIA para rastreamento
  idempotencyKey: text('idempotency_key').unique(), // Chave de descarte para envios/recebimentos duplicados
  tipoEvento: text('tipo_evento').notNull(), // 'os_entrada', 'orcamento', 'aprovacao_chat', 'pronto_retirada', etc.
  conteudo: text('conteudo').notNull(),
  statusEnvio: text('status_envio').default('enviado').notNull(), // 'enviado', 'entregue', 'lido', 'falha'
  erroDetalhe: text('erro_detalhe'),
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
});

// Tabela de Templates de Mensagens com Variáveis Dinâmicas
export const whatsappTemplates = pgTable('whatsapp_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  gatilhoStatus: text('gatilho_status').notNull().unique(), // 'entrada', 'orcamento_pendente', 'pronto_retirada', etc.
  titulo: text('titulo').notNull(),
  conteudo: text('conteudo').notNull(), // Suporta {cliente}, {numero_os}, {aparelho}, {valor_total}, {link_tracking}
  ativo: boolean('ativo').default(true).notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
});

// Tabela de Configurações da Loja, Termos Jurídicos e Gateway
export const lojaConfiguracoes = pgTable('loja_configuracoes', {
  id: uuid('id').defaultRandom().primaryKey(),
  razaoSocial: text('razao_social').default('EasyCell Assistência Técnica Especializada Ltda'),
  nomeFantasia: text('nome_fantasia').default('EasyCell'),
  cnpj: text('cnpj').default('12.345.678/0001-90'),
  telefone: text('telefone').default('11999999999'),
  endereco: text('endereco').default('Av. Paulista, 1000 - São Paulo, SP'),
  logoUrl: text('logo_url'),
  termosGarantia: text('termos_garantia').default(
    'Garantia legal de 90 (noventa) dias para peças substituídas e serviços executados conforme Art. 26 do CDC. A garantia não cobre danos decorrentes de contato com líquidos, quedas, choques mecânicos ou violação por terceiros.'
  ),
  garantiaDiasPadrao: integer('garantia_dias_padrao').default(90).notNull(),
  gatewayStatus: text('gateway_status').default('conectado').notNull(),
  gatewaySessao: text('gateway_sessao').default('sofia_principal').notNull(),
  webhookUrl: text('webhook_url').default('https://api.easycell.vibedocode.pro/api/v1/whatsapp/webhook'),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
});
