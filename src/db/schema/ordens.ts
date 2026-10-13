import { pgTable, uuid, text, timestamp, integer, boolean, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { clientes } from './clientes';
import { usuarios } from './auth';

export const osStatusEnum = pgEnum('os_status', [
  'entrada',           // 1. Recebido / Em Análise
  'orcamento_pendente',// 2. Orçamento Pendente
  'aprovado_reparo',   // 3. Aprovado / Em Reparo
  'pronto_retirada',   // 4. Pronto para Retirada
  'entregue_pago'      // 5. Entregue & Pago
]);

export const senhaTipoEnum = pgEnum('senha_tipo', [
  'padrao_pontos',     // Padrão 3x3 desenhado na tela
  'pin_numerico',      // Código numérico
  'alfanumerica',      // Texto/combinação
  'sem_senha'          // Cliente não forneceu ou sem senha
]);

export const ordensServico = pgTable('ordens_servico', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: text('tenant_id').default('ten_easycell_matriz').notNull(),
  lojaId: text('loja_id').default('loj_matriz_centro'),
  numeroOs: integer('numero_os').notNull().unique(), // Serial sequencial de balcão (#1001)
  clienteId: uuid('cliente_id').references(() => clientes.id).notNull(),
  tecnicoId: uuid('tecnico_id').references(() => usuarios.id),
  
  // Identificação do Aparelho
  aparelhoMarca: text('aparelho_marca').notNull(),
  aparelhoModelo: text('aparelho_modelo').notNull(),
  aparelhoCor: text('aparelho_cor'),
  aparelhoImei: text('aparelho_imei'),
  aparelhoSerial: text('aparelho_serial'),
  
  // Senha do Aparelho
  senhaTipo: senhaTipoEnum('senha_tipo').default('padrao_pontos').notNull(),
  senhaValor: text('senha_valor'), // Array de pontos serializado (ex: "[1,2,5,8,9]") ou PIN
  
  // Defeito & Diagnóstico
  defeitoRelatado: text('defeito_relatado').notNull(),
  diagnosticoTecnico: text('diagnostico_tecnico'),
  laudoConclusao: text('laudo_conclusao'),
  
  // Laudo Fotográfico Compulsório (4 Fotos: Frente, Traseira, Laterais, Conector)
  laudoFotos: jsonb('laudo_fotos').$type<{
    frenteUrl?: string;
    traseiraUrl?: string;
    lateraisUrl?: string;
    conectorUrl?: string;
    fotosExtras?: string[];
  }>().notNull(),
  
  // Checklist de Entrada (Hardware)
  checklistEntrada: jsonb('checklist_entrada').$type<{
    telaLigando: boolean;
    touchOk: boolean;
    cameraFrontal: boolean;
    cameraTraseira: boolean;
    conectorCarga: boolean;
    altoFalante: boolean;
    microfone: boolean;
    wifiBluetooth: boolean;
    biometriaFaceId: boolean;
    botoesFisicos: boolean;
    carcacaAvariada: boolean;
  }>().notNull(),
  
  // Status & Termos
  status: osStatusEnum('status').default('entrada').notNull(),
  termoAssinado: boolean('termo_assinado').default(false).notNull(),
  assinaturaUrl: text('assinatura_url'),
  
  // Fase 2: Tracking Seguro & Laudo Pericial em PDF
  hashTracking: text('hash_tracking'), // Token alfanumérico público/seguro para /track/:hash
  laudoPdfUrl: text('laudo_pdf_url'), // Link direto para o PDF gerado
  laudoPdfHash: text('laudo_pdf_hash'), // Hash criptográfico SHA-256 do documento pericial
  
  // Fase 2: Aprovação Interativa e WhatsApp
  aprovacaoCanal: text('aprovacao_canal'), // 'whatsapp_chat', 'web_link', 'balcao_manual'
  aprovadoEm: timestamp('aprovado_em'),
  duvidasRegistradas: boolean('duvidas_registradas').default(false).notNull(),
  
  // Financeiro
  valorPecas: integer('valor_pecas').default(0).notNull(), // Centavos
  valorMaoDeObra: integer('valor_mao_de_obra').default(0).notNull(), // Centavos
  valorDesconto: integer('valor_desconto').default(0).notNull(),
  valorTotal: integer('valor_total').default(0).notNull(), // Centavos
  valorAdiantamento: integer('valor_adiantamento').default(0).notNull(),
  
  // Fase 2: Comissões de Bancada
  comissaoValor: integer('comissao_valor').default(0).notNull(), // Centavos calculados
  comissaoPaga: boolean('comissao_paga').default(false).notNull(),
  
  // Pagamento no Balcão
  formaPagamento: text('forma_pagamento'), // Dinheiro, PIX, Cartão
  dataPagamento: timestamp('data_pagamento'),
  
  criadoEm: timestamp('criado_em').defaultNow().notNull(),
  atualizadoEm: timestamp('atualizado_em').defaultNow().notNull(),
});
