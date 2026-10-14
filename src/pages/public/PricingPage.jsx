import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, X, Shield, Zap, Sparkles, HelpCircle, ArrowRight, Star, Clock, Gift } from 'lucide-react';

export default function PricingPage() {
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState('mensal'); // 'mensal' | 'anual'

  const plans = [
    {
      id: 'plan_starter',
      nome: 'Starter',
      descricao: 'Para assistências individuais e pequenos laboratórios de bancada.',
      precoMensal: 97,
      precoAnual: 78, // por mês no anual
      trialDias: 0,
      destaque: false,
      badge: null,
      limites: {
        lojas: '1 Loja',
        usuarios: '2 Usuários simultâneos',
        os: 'Até 80 O.S./mês',
        whatsapp: '300 disparos WhatsApp/mês',
      },
      features: [
        { name: 'Gestão Completa de O.S. (Entrada à Saída)', included: true },
        { name: 'Checklist Fotográfico Compulsório (4 Fotos)', included: true },
        { name: 'Termo de Entrada e Saída em PDF', included: true },
        { name: 'Controle de Estoque e Caixa', included: true },
        { name: 'Notificações Automáticas no WhatsApp', included: true },
        { name: 'Laudo Pericial Criptografado com SHA-256', included: false },
        { name: 'SofIA SDR (Prospecção Inteligente)', included: false },
        { name: 'Multi-lojas e Filiais Integradas', included: false },
        { name: 'CRM de Clientes & Pipeline Comercial', included: false },
        { name: 'Suporte Prioritário VIP', included: false },
      ],
    },
    {
      id: 'plan_pro',
      nome: 'PRO',
      descricao: 'O motor definitivo para assistências que buscam escala, blindagem jurídica e automação.',
      precoMensal: 197,
      precoAnual: 158, // por mês no anual
      trialDias: 7,
      destaque: true,
      badge: 'MAIS ESCOLHIDO • 7 DIAS GRÁTIS',
      limites: {
        lojas: 'Até 3 Lojas/Filiais',
        usuarios: '6 Usuários simultâneos',
        os: '300 O.S./mês',
        whatsapp: '1.500 disparos WhatsApp/mês',
      },
      features: [
        { name: 'Gestão Completa de O.S. (Entrada à Saída)', included: true },
        { name: 'Checklist Fotográfico Compulsório (4 Fotos)', included: true },
        { name: 'Termo de Entrada e Saída em PDF', included: true },
        { name: 'Controle de Estoque e Caixa', included: true },
        { name: 'Notificações Automáticas no WhatsApp', included: true },
        { name: 'Laudo Pericial Criptografado com SHA-256', included: true },
        { name: 'SofIA SDR (Prospecção Inteligente)', included: true },
        { name: 'Multi-lojas e Filiais Integradas', included: true },
        { name: 'CRM de Clientes & Pipeline Comercial', included: true },
        { name: 'Suporte Prioritário VIP', included: true },
      ],
    },
    {
      id: 'plan_enterprise',
      nome: 'Enterprise',
      descricao: 'Para redes de franquias, grandes assistências e operações com múltiplos laboratórios.',
      precoMensal: 397,
      precoAnual: 318, // por mês no anual
      trialDias: 7,
      destaque: false,
      badge: 'ALTA ESCALA',
      limites: {
        lojas: 'Até 10 Lojas/Filiais',
        usuarios: '25 Usuários simultâneos',
        os: 'O.S. Ilimitadas',
        whatsapp: '5.000 disparos WhatsApp/mês',
      },
      features: [
        { name: 'Gestão Completa de O.S. (Entrada à Saída)', included: true },
        { name: 'Checklist Fotográfico Compulsório (4 Fotos)', included: true },
        { name: 'Termo de Entrada e Saída em PDF', included: true },
        { name: 'Controle de Estoque e Caixa', included: true },
        { name: 'Notificações Automáticas no WhatsApp', included: true },
        { name: 'Laudo Pericial Criptografado com SHA-256', included: true },
        { name: 'SofIA SDR (Prospecção Inteligente)', included: true },
        { name: 'Multi-lojas e Filiais Integradas', included: true },
        { name: 'CRM de Clientes & Pipeline Comercial', included: true },
        { name: 'Custom Branding & API Dedicada', included: true },
      ],
    },
  ];

  const faqs = [
    {
      q: 'Como funciona o teste gratuito de 7 dias?',
      a: 'Você tem acesso irrestrito a todas as funcionalidades do plano PRO por 7 dias. Não cobramos nada no momento do cadastro. Se não gostar, você pode cancelar com 1 clique antes do 7º dia sem nenhum débito.',
    },
    {
      q: 'Quais são as formas de pagamento aceitas?',
      a: 'Processamos pagamentos com a segurança global do Stripe. Aceitamos PIX com confirmação instantânea, Boleto Bancário e Cartões de Crédito (Visa, Mastercard, Elo, Hipercard, Amex).',
    },
    {
      q: 'Como funciona o programa Indique e Ganhe?',
      a: 'Todo cliente do EasyCell possui um link exclusivo (/r/[slug]). A cada 3 assistências que você indicar e que iniciarem o trial gratuito, você ganha 1 mês grátis! E se o seu indicado assinar um plano pago, você ganha outro mês grátis creditado na hora na sua próxima fatura.',
    },
    {
      q: 'Se eu atrasar o pagamento, perco meus dados e O.S.?',
      a: 'Nunca! Se o pagamento falhar, você tem 7 dias de tolerância com aviso amigável no topo do sistema. Mesmo se suspenso, seus laudos, clientes e histórico ficam 100% seguros e são reativados no instante em que a pendência for quitada.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-500/20">
              EC
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              EasyCell <span className="text-cyan-400 font-semibold text-xs ml-1 px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800">SaaS</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-sm font-medium text-slate-300 hover:text-white transition">
              Entrar
            </Link>
            <button
              onClick={() => navigate('/checkout/plan_pro?cycle=mensal')}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-md shadow-cyan-500/20"
            >
              Testar 7 Dias Grátis
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-12 px-4 sm:px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800 text-cyan-400 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" /> Planos Transparentes • Sem Fidelidade • Cancele Quando Quiser
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
          Acelere sua Assistência Técnica com o <span className="text-cyan-400">EasyCell SaaS</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
          Escolha o plano perfeito para a sua operação. Todos os planos incluem suporte humanizado, atualizações contínuas e segurança de nível bancário.
        </p>

        {/* Toggle Mensal / Anual */}
        <div className="inline-flex items-center bg-slate-900 p-1.5 rounded-xl border border-slate-800 shadow-inner">
          <button
            onClick={() => setBillingCycle('mensal')}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition ${
              billingCycle === 'mensal'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Faturamento Mensal
          </button>
          <button
            onClick={() => setBillingCycle('anual')}
            className={`px-5 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition ${
              billingCycle === 'anual'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Faturamento Anual</span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Economize 20%
            </span>
          </button>
        </div>
      </section>

      {/* Grid de Planos */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((p) => {
            const preco = billingCycle === 'anual' ? p.precoAnual : p.precoMensal;
            return (
              <div
                key={p.id}
                className={`relative flex flex-col justify-between rounded-2xl p-7 transition-all duration-300 ${
                  p.destaque
                    ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500 shadow-2xl shadow-cyan-500/10 scale-105 z-10'
                    : 'bg-slate-900/80 border border-slate-800 hover:border-slate-700'
                }`}
              >
                {p.destaque && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 text-xs font-extrabold uppercase tracking-wider shadow-lg">
                    {p.badge}
                  </div>
                )}

                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{p.nome}</h3>
                  <p className="text-sm text-slate-400 min-h-[40px] mb-6">{p.descricao}</p>

                  <div className="mb-6 pb-6 border-b border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-slate-400 text-sm font-medium">R$</span>
                      <span className="text-4xl font-extrabold text-white tracking-tight">{preco}</span>
                      <span className="text-slate-400 text-sm font-medium">/mês</span>
                    </div>
                    {billingCycle === 'anual' && (
                      <p className="text-xs text-emerald-400 mt-1 font-medium">
                        Cobrado anualmente (R$ {preco * 12}/ano)
                      </p>
                    )}
                  </div>

                  {/* Limites Rápidos */}
                  <div className="space-y-2 mb-6 text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Lojas:</span>
                      <span className="font-semibold text-white">{p.limites.lojas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Equipe:</span>
                      <span className="font-semibold text-white">{p.limites.usuarios}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Volume de O.S.:</span>
                      <span className="font-semibold text-white">{p.limites.os}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Disparos WhatsApp:</span>
                      <span className="font-semibold text-white">{p.limites.whatsapp}</span>
                    </div>
                  </div>

                  {/* Lista de Features */}
                  <div className="space-y-3 mb-8">
                    <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Recursos inclusos:</p>
                    {p.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-sm">
                        {f.included ? (
                          <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                        )}
                        <span className={f.included ? 'text-slate-200' : 'text-slate-500'}>
                          {f.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <div>
                  <button
                    onClick={() => navigate(`/checkout/${p.id}?cycle=${billingCycle}`)}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg ${
                      p.destaque
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-cyan-500/25'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    <span>{p.trialDias > 0 ? 'Começar 7 Dias Grátis' : 'Assinar Agora'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-[11px] text-center text-slate-500 mt-2.5">
                    {p.trialDias > 0 ? 'Sem cobrança hoje • Cancele a qualquer momento' : 'Acesso imediato • Ativação instantânea'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Selo Viral & Indicação */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-20">
        <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-800/60 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
              <Gift className="w-4 h-4" /> Programa Viral Indique e Ganhe
            </div>
            <h3 className="text-2xl font-bold text-white">Sua mensalidade pode sair 100% de graça!</h3>
            <p className="text-sm text-slate-300 max-w-xl">
              Indique 3 colegas de bancada para testar o EasyCell e ganhe 1 mês grátis. Se o seu indicado assinar, você ganha mais 1 mês na hora!
            </p>
          </div>
          <button
            onClick={() => navigate('/checkout/plan_pro?cycle=mensal')}
            className="px-6 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-xl transition whitespace-nowrap shadow-lg shadow-cyan-500/20"
          >
            Quero Me Cadastrar e Indicar
          </button>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-24">
        <h2 className="text-3xl font-extrabold text-center text-white mb-3">Dúvidas Frequentes</h2>
        <p className="text-sm text-center text-slate-400 mb-12">Tudo o que você precisa saber antes de começar.</p>

        <div className="space-y-4">
          {faqs.map((f, i) => (
            <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                {f.q}
              </h4>
              <p className="text-sm text-slate-300 pl-6 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <p>© 2026 EasyCell SaaS • Plataforma Operacional & Comercial para Assistências Técnicas.</p>
        <p className="mt-1">Pagamentos processados com segurança pelo Stripe • Criptografia TLS 1.3</p>
      </footer>
    </div>
  );
}
