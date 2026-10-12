CREATE TYPE "public"."user_role" AS ENUM('admin', 'atendente', 'tecnico');--> statement-breakpoint
CREATE TYPE "public"."os_status" AS ENUM('entrada', 'orcamento_pendente', 'aprovado_reparo', 'pronto_retirada', 'entregue_pago');--> statement-breakpoint
CREATE TYPE "public"."senha_tipo" AS ENUM('padrao_pontos', 'pin_numerico', 'alfanumerica', 'sem_senha');--> statement-breakpoint
CREATE TYPE "public"."estoque_tipo" AS ENUM('peca_reposicao', 'servico', 'aparelho_usado', 'vitrine_novo', 'acessorio');--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"email" text NOT NULL,
	"senha_hash" text NOT NULL,
	"cargo" "user_role" DEFAULT 'atendente' NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "clientes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" text NOT NULL,
	"whatsapp" text NOT NULL,
	"cpf" text,
	"email" text,
	"endereco" text,
	"observacoes" text,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ordens_servico" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"numero_os" integer NOT NULL,
	"cliente_id" uuid NOT NULL,
	"tecnico_id" uuid,
	"aparelho_marca" text NOT NULL,
	"aparelho_modelo" text NOT NULL,
	"aparelho_cor" text,
	"aparelho_imei" text,
	"aparelho_serial" text,
	"senha_tipo" "senha_tipo" DEFAULT 'padrao_pontos' NOT NULL,
	"senha_valor" text,
	"defeito_relatado" text NOT NULL,
	"diagnostico_tecnico" text,
	"laudo_conclusao" text,
	"laudo_fotos" jsonb NOT NULL,
	"checklist_entrada" jsonb NOT NULL,
	"status" "os_status" DEFAULT 'entrada' NOT NULL,
	"termo_assinado" boolean DEFAULT false NOT NULL,
	"assinatura_url" text,
	"valor_pecas" integer DEFAULT 0 NOT NULL,
	"valor_mao_de_obra" integer DEFAULT 0 NOT NULL,
	"valor_desconto" integer DEFAULT 0 NOT NULL,
	"valor_total" integer DEFAULT 0 NOT NULL,
	"valor_adiantamento" integer DEFAULT 0 NOT NULL,
	"forma_pagamento" text,
	"data_pagamento" timestamp,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ordens_servico_numero_os_unique" UNIQUE("numero_os")
);
--> statement-breakpoint
CREATE TABLE "caixa_movimentacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ordem_id" uuid,
	"tipo" text NOT NULL,
	"descricao" text NOT NULL,
	"valor" integer NOT NULL,
	"metodo_pagamento" text NOT NULL,
	"operador_nome" text NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "estoque_itens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"codigo" text,
	"nome" text NOT NULL,
	"tipo" "estoque_tipo" DEFAULT 'peca_reposicao' NOT NULL,
	"imei" text,
	"marca_compativel" text,
	"modelo_compativel" text,
	"quantidade" integer DEFAULT 1 NOT NULL,
	"quantidade_minima" integer DEFAULT 2 NOT NULL,
	"preco_custo" integer DEFAULT 0 NOT NULL,
	"preco_venda" integer DEFAULT 0 NOT NULL,
	"localizacao" text,
	"criado_em" timestamp DEFAULT now() NOT NULL,
	"atualizado_em" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "estoque_itens_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "os_itens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ordem_id" uuid NOT NULL,
	"item_id" uuid,
	"descricao" text NOT NULL,
	"quantidade" integer DEFAULT 1 NOT NULL,
	"valor_unitario" integer NOT NULL,
	"valor_total" integer NOT NULL,
	"garantia_dias" integer DEFAULT 90 NOT NULL,
	"criado_em" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_tecnico_id_usuarios_id_fk" FOREIGN KEY ("tecnico_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "caixa_movimentacoes" ADD CONSTRAINT "caixa_movimentacoes_ordem_id_ordens_servico_id_fk" FOREIGN KEY ("ordem_id") REFERENCES "public"."ordens_servico"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "os_itens" ADD CONSTRAINT "os_itens_ordem_id_ordens_servico_id_fk" FOREIGN KEY ("ordem_id") REFERENCES "public"."ordens_servico"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "os_itens" ADD CONSTRAINT "os_itens_item_id_estoque_itens_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."estoque_itens"("id") ON DELETE no action ON UPDATE no action;