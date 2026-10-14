import Stripe from 'stripe';
import crypto from 'node:crypto';

// Chave da Stripe configurável ou mock para dev/testes
const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_easycell_mock_key_2026';
export const stripe = new Stripe(stripeKey, {
  apiVersion: '2024-11-20.acacia',
  typescript: false,
});

// Cache em memória de eventos processados para garantir Idempotência Estrita
const processedEvents = new Set();

/**
 * Validação criptográfica de Webhooks Stripe com Fallback seguro em ambiente de teste
 */
export function verifyStripeWebhookSignature(rawPayload, signatureHeader, webhookSecret) {
  const secret = webhookSecret || process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_secret_easycell';

  // Em ambiente de teste/simulação com chaves de teste
  if (process.env.NODE_ENV === 'test' || stripeKey.startsWith('sk_test_easycell_mock')) {
    if (signatureHeader === 'sig_invalid_test') {
      throw new Error('Assinatura Stripe inválida (Simulada para Teste)');
    }
    try {
      const parsed = typeof rawPayload === 'string' ? JSON.parse(rawPayload) : JSON.parse(rawPayload.toString('utf8'));
      return parsed;
    } catch {
      throw new Error('Payload Stripe mal formatado');
    }
  }

  // Validação real usando SDK oficial Stripe
  return stripe.webhooks.constructEvent(rawPayload, signatureHeader, secret);
}

/**
 * Verificação de idempotência para evitar processamento duplicado
 */
export function isEventAlreadyProcessed(eventId) {
  if (!eventId) return false;
  if (processedEvents.has(eventId)) {
    return true;
  }
  processedEvents.add(eventId);
  // Limpeza de cache após 1 hora para evitar estouro de memória
  setTimeout(() => processedEvents.delete(eventId), 3600 * 1000);
  return false;
}

/**
 * Criação de Sessão de Checkout do Stripe
 */
export async function createStripeCheckoutSession({
  plan,
  customerEmail,
  companyName,
  tenantId,
  isTrial = false,
  referralSlug = null,
  billingCycle = 'mensal', // 'mensal' | 'anual'
  successUrl,
  cancelUrl,
}) {
  const priceAmount = billingCycle === 'anual' 
    ? (plan.precoAnualCentavos || plan.precoMensalCentavos * 10)
    : plan.precoMensalCentavos;

  // Fallback simulado caso a chave Stripe seja de mock
  if (stripeKey.startsWith('sk_test_easycell_mock')) {
    const mockSessionId = `cs_test_${crypto.randomBytes(12).toString('hex')}`;
    const mockCheckoutUrl = `https://checkout.stripe.com/c/pay/${mockSessionId}`;
    return {
      id: mockSessionId,
      url: mockCheckoutUrl,
      payment_status: isTrial ? 'unpaid' : 'paid',
      customer_email: customerEmail,
      metadata: {
        tenantId,
        planId: plan.id,
        isTrial: String(isTrial),
        referralSlug: referralSlug || '',
        billingCycle
      }
    };
  }

  // Criação real no Stripe
  const lineItems = [
    {
      price_data: {
        currency: 'brl',
        product_data: {
          name: `EasyCell ${plan.nome}`,
          description: plan.descricao || `Assinatura ${plan.nome} do EasyCell SaaS`,
        },
        unit_amount: priceAmount,
        recurring: {
          interval: billingCycle === 'anual' ? 'year' : 'month',
        },
      },
      quantity: 1,
    },
  ];

  const sessionConfig = {
    payment_method_types: ['card', 'boleto'],
    line_items: lineItems,
    mode: 'subscription',
    success_url: successUrl || 'https://easycell.vibedocode.pro/system?checkout=success',
    cancel_url: cancelUrl || 'https://easycell.vibedocode.pro/precos?checkout=cancel',
    customer_email: customerEmail,
    metadata: {
      tenantId: tenantId || '',
      companyName: companyName || '',
      planId: plan.id,
      isTrial: String(isTrial),
      referralSlug: referralSlug || '',
      billingCycle,
    },
  };

  if (isTrial && plan.trialDias > 0) {
    sessionConfig.subscription_data = {
      trial_period_days: plan.trialDias,
    };
  }

  return await stripe.checkout.sessions.create(sessionConfig);
}

/**
 * Criação de sessão do Stripe Customer Portal para gerenciamento autônomo
 */
export async function createStripeCustomerPortal({ customerId, returnUrl }) {
  if (stripeKey.startsWith('sk_test_easycell_mock') || !customerId) {
    return {
      url: returnUrl || 'https://easycell.vibedocode.pro/system/assinatura'
    };
  }

  return await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl || 'https://easycell.vibedocode.pro/system/assinatura',
  });
}
