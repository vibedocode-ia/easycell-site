import { db, client } from './index.js';
import { sql } from 'drizzle-orm';

export async function initSaasDatabase() {
  console.log('🔄 [DB Migration] Verificando e criando tabelas SaaS Fase 4...');

  try {
    // 1. billing_plans
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "billing_plans" (
        "id" text PRIMARY KEY,
        "nome" text NOT NULL,
        "slug" text NOT NULL UNIQUE,
        "descricao" text,
        "preco_mensal_centavos" integer NOT NULL,
        "preco_anual_centavos" integer,
        "stripe_price_id_mensal" text,
        "stripe_price_id_anual" text,
        "stripe_product_id" text,
        "limite_lojas" integer DEFAULT 1 NOT NULL,
        "limite_usuarios" integer DEFAULT 3 NOT NULL,
        "limite_os_mensal" integer DEFAULT 100,
        "limite_whatsapp_mensal" integer DEFAULT 500,
        "features" jsonb NOT NULL,
        "trial_dias" integer DEFAULT 7 NOT NULL,
        "ativo" boolean DEFAULT true NOT NULL,
        "ordem" integer DEFAULT 0 NOT NULL,
        "destaque" boolean DEFAULT false NOT NULL,
        "criado_em" timestamp DEFAULT now() NOT NULL,
        "atualizado_em" timestamp DEFAULT now() NOT NULL
      );
    `);

    // 2. subscriptions
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "subscriptions" (
        "id" text PRIMARY KEY,
        "tenant_id" text NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
        "plan_id" text NOT NULL REFERENCES "billing_plans"("id"),
        "stripe_customer_id" text,
        "stripe_subscription_id" text,
        "status" text DEFAULT 'trialing' NOT NULL,
        "ciclo" text DEFAULT 'mensal' NOT NULL,
        "trial_inicio" timestamp,
        "trial_fim" timestamp,
        "periodo_atual_inicio" timestamp,
        "periodo_atual_fim" timestamp,
        "proxima_cobranca" timestamp,
        "grace_period_inicio" timestamp,
        "grace_period_fim" timestamp,
        "tentativas_cobranca" integer DEFAULT 0 NOT NULL,
        "cancelado_em" timestamp,
        "motivo_cancelamento" text,
        "cancelamento_efetivo" timestamp,
        "creditos_pendentes" integer DEFAULT 0 NOT NULL,
        "criado_em" timestamp DEFAULT now() NOT NULL,
        "atualizado_em" timestamp DEFAULT now() NOT NULL
      );
    `);

    // 3. invoices
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "invoices" (
        "id" text PRIMARY KEY,
        "tenant_id" text NOT NULL REFERENCES "tenants"("id"),
        "subscription_id" text REFERENCES "subscriptions"("id"),
        "stripe_invoice_id" text,
        "stripe_payment_intent_id" text,
        "numero" serial NOT NULL,
        "status" text DEFAULT 'pending' NOT NULL,
        "valor_bruto_centavos" integer NOT NULL,
        "desconto_centavos" integer DEFAULT 0 NOT NULL,
        "valor_liquido_centavos" integer NOT NULL,
        "metodo_pagamento" text,
        "descricao" text NOT NULL,
        "referencia_mes" text,
        "boleto_url" text,
        "boleto_codigo_barras" text,
        "boleto_vencimento" timestamp,
        "pix_qr_code" text,
        "pix_copia_cola" text,
        "pix_expiracao" timestamp,
        "pago_em" timestamp,
        "vencimento_em" timestamp,
        "criado_em" timestamp DEFAULT now() NOT NULL,
        "atualizado_em" timestamp DEFAULT now() NOT NULL
      );
    `);

    // 4. referrals
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "referrals" (
        "id" text PRIMARY KEY,
        "referrer_tenant_id" text NOT NULL REFERENCES "tenants"("id"),
        "referrer_slug" text NOT NULL,
        "referred_email" text,
        "referred_tenant_id" text REFERENCES "tenants"("id"),
        "referred_nome" text,
        "referred_whatsapp" text,
        "status" text DEFAULT 'pending' NOT NULL,
        "ip_origem" text,
        "utm_source" text,
        "utm_medium" text,
        "utm_campaign" text,
        "credito_gerado" boolean DEFAULT false NOT NULL,
        "credito_meses" integer DEFAULT 0 NOT NULL,
        "credito_aplicado_em" timestamp,
        "criado_em" timestamp DEFAULT now() NOT NULL,
        "convertido_em" timestamp
      );
    `);

    // 5. referral_credits
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "referral_credits" (
        "id" text PRIMARY KEY,
        "tenant_id" text NOT NULL REFERENCES "tenants"("id"),
        "subscription_id" text REFERENCES "subscriptions"("id"),
        "tipo" text NOT NULL,
        "meses_creditados" integer DEFAULT 1 NOT NULL,
        "referral_ids" jsonb NOT NULL,
        "aplicado_na_fatura" text REFERENCES "invoices"("id"),
        "criado_em" timestamp DEFAULT now() NOT NULL
      );
    `);

    // 6. crm_leads
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "crm_leads" (
        "id" text PRIMARY KEY,
        "nome" text NOT NULL,
        "email" text,
        "whatsapp" text NOT NULL,
        "nome_empresa" text,
        "cidade" text,
        "estagio" text DEFAULT 'novo' NOT NULL,
        "origem" text DEFAULT 'organico' NOT NULL,
        "referral_id" text REFERENCES "referrals"("id"),
        "responsavel_id" uuid,
        "ultima_nota" text,
        "total_interacoes" integer DEFAULT 0 NOT NULL,
        "convertido_tenant_id" text REFERENCES "tenants"("id"),
        "convertido_em" timestamp,
        "motivo_perda" text,
        "score" integer DEFAULT 0 NOT NULL,
        "temperatura" text DEFAULT 'frio' NOT NULL,
        "criado_em" timestamp DEFAULT now() NOT NULL,
        "atualizado_em" timestamp DEFAULT now() NOT NULL
      );
    `);

    // 7. crm_interactions
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "crm_interactions" (
        "id" text PRIMARY KEY,
        "lead_id" text NOT NULL REFERENCES "crm_leads"("id") ON DELETE CASCADE,
        "tipo" text NOT NULL,
        "canal" text,
        "conteudo" text NOT NULL,
        "autor_nome" text NOT NULL,
        "autor_tipo" text DEFAULT 'humano' NOT NULL,
        "criado_em" timestamp DEFAULT now() NOT NULL
      );
    `);

    // 8. support_tickets
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "support_tickets" (
        "id" text PRIMARY KEY,
        "tenant_id" text REFERENCES "tenants"("id"),
        "numero" serial NOT NULL,
        "assunto" text NOT NULL,
        "descricao" text NOT NULL,
        "categoria" text DEFAULT 'geral' NOT NULL,
        "prioridade" text DEFAULT 'media' NOT NULL,
        "status" text DEFAULT 'aberto' NOT NULL,
        "atribuido_para" text,
        "sla_resposta_ate" timestamp,
        "sla_resolucao_ate" timestamp,
        "primeira_resposta_em" timestamp,
        "resolvido_em" timestamp,
        "satisfacao_nota" integer,
        "satisfacao_comentario" text,
        "criado_em" timestamp DEFAULT now() NOT NULL,
        "atualizado_em" timestamp DEFAULT now() NOT NULL
      );
    `);

    // 9. support_messages
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "support_messages" (
        "id" text PRIMARY KEY,
        "ticket_id" text NOT NULL REFERENCES "support_tickets"("id") ON DELETE CASCADE,
        "autor_nome" text NOT NULL,
        "autor_tipo" text DEFAULT 'cliente' NOT NULL,
        "conteudo" text NOT NULL,
        "anexo_url" text,
        "criado_em" timestamp DEFAULT now() NOT NULL
      );
    `);

    // 10. dunning_logs
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "dunning_logs" (
        "id" text PRIMARY KEY,
        "tenant_id" text NOT NULL REFERENCES "tenants"("id"),
        "subscription_id" text NOT NULL REFERENCES "subscriptions"("id"),
        "invoice_id" text REFERENCES "invoices"("id"),
        "evento" text NOT NULL,
        "tentativa_numero" integer DEFAULT 1 NOT NULL,
        "stripe_event_id" text,
        "notificacao_enviada" boolean DEFAULT false NOT NULL,
        "canal_notificacao" text,
        "detalhes" text,
        "criado_em" timestamp DEFAULT now() NOT NULL
      );
    `);

    // 11. sofia_sdr_campaigns
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "sofia_sdr_campaigns" (
        "id" text PRIMARY KEY,
        "nome" text NOT NULL,
        "descricao" text,
        "tipo" text DEFAULT 'prospeccao' NOT NULL,
        "mensagem_template" text NOT NULL,
        "filtro_estagio" jsonb,
        "filtro_temperatura" jsonb,
        "total_enviados" integer DEFAULT 0 NOT NULL,
        "total_respostas" integer DEFAULT 0 NOT NULL,
        "total_conversoes" integer DEFAULT 0 NOT NULL,
        "status" text DEFAULT 'rascunho' NOT NULL,
        "whatsapp_numero" text,
        "criado_em" timestamp DEFAULT now() NOT NULL,
        "atualizado_em" timestamp DEFAULT now() NOT NULL
      );
    `);

    // 12. saas_notifications
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "saas_notifications" (
        "id" text PRIMARY KEY,
        "tenant_id" text REFERENCES "tenants"("id"),
        "tipo" text NOT NULL,
        "titulo" text NOT NULL,
        "mensagem" text NOT NULL,
        "canal" text DEFAULT 'in_app' NOT NULL,
        "lida" boolean DEFAULT false NOT NULL,
        "lida_em" timestamp,
        "acao_url" text,
        "criado_em" timestamp DEFAULT now() NOT NULL
      );
    `);

    // Seed dos 3 Planos Padrão (Starter, PRO, Enterprise)
    await db.execute(sql`
      INSERT INTO "billing_plans" (
        "id", "nome", "slug", "descricao", "preco_mensal_centavos", "preco_anual_centavos",
        "stripe_price_id_mensal", "stripe_product_id", "limite_lojas", "limite_usuarios",
        "limite_os_mensal", "limite_whatsapp_mensal", "features", "trial_dias", "ativo", "ordem", "destaque"
      ) VALUES
      (
        'plan_starter',
        'Starter',
        'starter',
        'Ideal para assistências individuais e pequenos laboratórios técnicos',
        9700,
        97000,
        'price_starter_monthly',
        'prod_starter',
        1,
        2,
        80,
        300,
        '{"whatsappAutomation": true, "laudoPericial": true, "sofiaSDR": false, "relatoriosAvancados": false, "apiAccess": false, "suportePrioritario": false, "backupDiario": true, "multiLoja": false, "crmLeads": false, "customBranding": false}'::jsonb,
        0,
        true,
        1,
        false
      ),
      (
        'plan_pro',
        'PRO',
        'pro',
        'Para assistências em crescimento que buscam escala e automação com SofIA',
        19700,
        197000,
        'price_pro_monthly',
        'prod_pro',
        3,
        6,
        300,
        1500,
        '{"whatsappAutomation": true, "laudoPericial": true, "sofiaSDR": true, "relatoriosAvancados": true, "apiAccess": false, "suportePrioritario": true, "backupDiario": true, "multiLoja": true, "crmLeads": true, "customBranding": false}'::jsonb,
        7,
        true,
        2,
        true
      ),
      (
        'plan_enterprise',
        'Enterprise',
        'enterprise',
        'Redes de franquias, grandes laboratórios e centros de reparo avançados',
        39700,
        397000,
        'price_enterprise_monthly',
        'prod_enterprise',
        10,
        25,
        null,
        5000,
        '{"whatsappAutomation": true, "laudoPericial": true, "sofiaSDR": true, "relatoriosAvancados": true, "apiAccess": true, "suportePrioritario": true, "backupDiario": true, "multiLoja": true, "crmLeads": true, "customBranding": true}'::jsonb,
        7,
        true,
        3,
        false
      )
      ON CONFLICT ("id") DO UPDATE SET
        "nome" = EXCLUDED."nome",
        "preco_mensal_centavos" = EXCLUDED."preco_mensal_centavos",
        "preco_anual_centavos" = EXCLUDED."preco_anual_centavos",
        "features" = EXCLUDED."features",
        "destaque" = EXCLUDED."destaque",
        "trial_dias" = EXCLUDED."trial_dias";
    `);

    console.log('✅ [DB Migration] Tabelas SaaS Fase 4 e Planos Padrão sincronizados com sucesso!');
    return true;
  } catch (error) {
    console.error('⚠️ [DB Migration Warning]:', error);
    return false;
  }
}

if (process.argv[1]?.endsWith('init_saas.js')) {
  initSaasDatabase().then(() => {
    process.exit(0);
  });
}
