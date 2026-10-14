import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CreditCard, QrCode, FileText, CheckCircle2, ArrowLeft, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export default function CheckoutPage() {
  const { planId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const billingCycle = searchParams.get('cycle') || 'mensal';
  const referralSlug = searchParams.get('ref') || '';

  // Configuração do plano
  const planDetails = {
    plan_starter: { nome: 'Starter', mensal: 97, anual: 78, trial: 0, lojas: 1 },
    plan_pro: { nome: 'PRO', mensal: 197, anual: 158, trial: 7, lojas: 3 },
    plan_enterprise: { nome: 'Enterprise', mensal: 397, anual: 318, trial: 7, lojas: 10 },
  };

  const selectedPlan = planDetails[planId] || planDetails.plan_pro;
  const preco = billingCycle === 'anual' ? selectedPlan.anual : selectedPlan.mensal;
  const isTrial = selectedPlan.trial > 0;

  // Estado do Formulário
  const [formData, setFormData] = useState({
    companyName: '',
    cnpj: '',
    email: '',
    whatsapp: '',
    senha: '',
    termoAceito: true,
  });

  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' | 'pix' | 'boleto'
  const [loading, setLoading] = useState(false);
  const [successState, setSuccessState] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.companyName || !formData.email || !formData.whatsapp || !formData.senha) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/v1/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: planId || 'plan_pro',
          companyName: formData.companyName,
          email: formData.email,
          whatsapp: formData.whatsapp,
          cnpj: formData.cnpj,
          senha: formData.senha,
          referralSlug,
          billingCycle,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao processar assinatura');
      }

      setSuccessState({
        tenantId: data.tenantId,
        isTrial: data.isTrial,
        checkoutUrl: data.checkoutUrl,
      });

      // Redirecionamento após 2.5s para tela de login ou direto pro sistema
      setTimeout(() => {
        navigate('/admin');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Falha na comunicação com o servidor de pagamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/precos" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-4 h-4" /> Voltar aos Planos
          </Link>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-3 py-1 rounded-full">
            <ShieldCheck className="w-4 h-4" /> Checkout 100% Criptografado TLS 1.3
          </div>
        </div>
      </header>

      {/* Conteúdo Central */}
      <main className="max-w-6xl mx-auto px-4 py-10 w-full flex-1">
        {successState ? (
          <div className="max-w-md mx-auto bg-slate-900 border border-emerald-500/40 rounded-3xl p-8 text-center shadow-2xl shadow-emerald-500/10">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Conta Criada com Sucesso!</h2>
            <p className="text-sm text-slate-300 mb-6">
              {successState.isTrial
                ? 'Seus 7 dias de avaliação gratuita no plano PRO foram ativados. Você será redirecionado para o login...'
                : 'Sua assinatura foi confirmada! Redirecionando para o sistema...'}
            </p>
            <div className="flex justify-center items-center gap-2 text-xs text-cyan-400">
              <Loader2 className="w-4 h-4 animate-spin" /> Carregando sua bancada...
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Lado Esquerdo: Formulário */}
            <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
              {referralSlug && (
                <div className="mb-6 p-3.5 bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-800/80 rounded-xl text-xs flex items-center gap-2 text-cyan-300">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>
                    Indicação detectada: <strong>{referralSlug}</strong>. Benefício de bônus ativado para você!
                  </span>
                </div>
              )}

              <h2 className="text-xl font-bold text-white mb-1">Dados da sua Assistência Técnica</h2>
              <p className="text-xs text-slate-400 mb-6">Cadastre os dados para criação automática do seu ambiente.</p>

              {error && (
                <div className="mb-6 p-3.5 bg-rose-950/40 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nome da Empresa / Assistência *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: SmartLab Assistência Especializada"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">E-mail Comercial *</label>
                    <input
                      type="email"
                      required
                      placeholder="admin@smartlab.com.br"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">WhatsApp de Contato *</label>
                    <input
                      type="text"
                      required
                      placeholder="(11) 99999-9999"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">CNPJ ou CPF (Opcional)</label>
                    <input
                      type="text"
                      placeholder="00.000.000/0001-00"
                      value={formData.cnpj}
                      onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Criar Senha de Acesso *</label>
                    <input
                      type="password"
                      required
                      placeholder="Mínimo 8 caracteres"
                      value={formData.senha}
                      onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>
                </div>

                {/* Forma de Pagamento */}
                <div className="pt-4 border-t border-slate-800">
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Forma de Pagamento</label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-xs font-semibold ${
                        paymentMethod === 'card'
                          ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      <span>Cartão</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pix')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-xs font-semibold ${
                        paymentMethod === 'pix'
                          ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <QrCode className="w-5 h-5" />
                      <span>PIX</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('boleto')}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-xs font-semibold ${
                        paymentMethod === 'boleto'
                          ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <FileText className="w-5 h-5" />
                      <span>Boleto</span>
                    </button>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Cartão processado via Stripe Segura</span>
                        <span className="text-emerald-400 font-semibold">Criptografia Ponta a Ponta</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Número do Cartão •••• •••• •••• ••••"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="MM/AA"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="CVC"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'pix' && (
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                      <p className="text-xs text-slate-300 mb-1">Chave PIX e QR Code serão gerados imediatamente.</p>
                      <p className="text-[11px] text-slate-500">Confirmação automática em poucos segundos.</p>
                    </div>
                  )}

                  {paymentMethod === 'boleto' && (
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center">
                      <p className="text-xs text-slate-300 mb-1">Boleto com vencimento em 3 dias úteis.</p>
                      <p className="text-[11px] text-slate-500">Liberação do ambiente após compensação bancária.</p>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.termoAceito}
                      onChange={(e) => setFormData({ ...formData, termoAceito: e.target.checked })}
                      className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
                    />
                    <span>Concordo com os Termos de Uso e Política de Privacidade do SaaS EasyCell</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || !formData.termoAceito}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 transition shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Criando sua bancada...</span>
                    </>
                  ) : (
                    <span>{isTrial ? 'Começar Meu Teste Grátis de 7 Dias' : 'Concluir Assinatura'}</span>
                  )}
                </button>
              </form>
            </div>

            {/* Lado Direito: Resumo do Pedido */}
            <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl sticky top-24">
              <h3 className="text-base font-bold text-white mb-4">Resumo do Plano</h3>

              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 mb-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-white text-base">Plano {selectedPlan.nome}</h4>
                    <p className="text-xs text-slate-400">Ciclo {billingCycle === 'anual' ? 'Anual' : 'Mensal'}</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                    {selectedPlan.lojas} {selectedPlan.lojas === 1 ? 'Loja' : 'Lojas'}
                  </span>
                </div>

                <div className="text-2xl font-extrabold text-white mt-3">
                  R$ {preco} <span className="text-xs font-normal text-slate-400">/mês</span>
                </div>
              </div>

              {/* Box de Condições de Pagamento */}
              <div className="space-y-3 text-xs border-b border-slate-800 pb-5 mb-5">
                <div className="flex justify-between text-slate-300">
                  <span>Valor do plano:</span>
                  <span>R$ {preco},00</span>
                </div>
                {isTrial && (
                  <div className="flex justify-between text-cyan-400 font-medium">
                    <span>Desconto Período Trial (7 dias):</span>
                    <span>- R$ {preco},00</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-300">
                  <span>Taxa de instalação / Setup:</span>
                  <span className="text-emerald-400 font-semibold">GRÁTIS</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline mb-6">
                <span className="text-sm font-bold text-white">Total devido hoje:</span>
                <span className="text-2xl font-extrabold text-emerald-400">
                  {isTrial ? 'R$ 0,00' : `R$ ${preco},00`}
                </span>
              </div>

              {isTrial && (
                <div className="p-3 bg-cyan-950/40 border border-cyan-800/60 rounded-xl text-xs text-cyan-300 flex items-start gap-2">
                  <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    Sua primeira fatura será cobrada em exatamente 7 dias. Você pode cancelar a qualquer momento sem nenhuma taxa.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>Ambiente seguro • EasyCell SaaS • Transações autenticadas</p>
      </footer>
    </div>
  );
}
