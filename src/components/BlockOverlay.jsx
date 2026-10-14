import React, { useState } from 'react';
import { AlertTriangle, ShieldAlert, CreditCard, MessageSquare, QrCode, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

export default function BlockOverlay({ status, gracePeriodFim, valorPendenteCentavos = 19700, onQuitado }) {
  const [modalQuitacao, setModalQuitacao] = useState(false);
  const [metodo, setMetodo] = useState('pix');
  const [simulandoPagamento, setSimulandoPagamento] = useState(false);
  const [pagoComSucesso, setPagoComSucesso] = useState(false);

  // Se a assinatura está ativa ou trialing, não renderiza bloqueio
  if (!status || status === 'active' || status === 'trialing') {
    return null;
  }

  // 1. Banner Amarelo / Laranja de Grace Period (D1 a D5)
  if (status === 'past_due' && !modalQuitacao) {
    return (
      <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-slate-950 px-4 py-2.5 text-xs font-bold flex items-center justify-between sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-slate-950" />
          <span>
            Atenção: A última cobrança da sua assinatura falhou. Você possui 7 dias de tolerância com acesso normal garantido.
          </span>
        </div>
        <button
          onClick={() => setModalQuitacao(true)}
          className="px-3 py-1 bg-slate-950 hover:bg-slate-900 text-amber-300 rounded-lg text-xs font-extrabold transition shadow-sm whitespace-nowrap ml-4"
        >
          Regularizar Fatura
        </button>
      </div>
    );
  }

  // 2. Banner Vermelho de Grace Period Final (D6 a D7)
  if (status === 'grace_period' && !modalQuitacao) {
    return (
      <div className="bg-gradient-to-r from-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between sticky top-0 z-50 shadow-md animate-pulse">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 shrink-0" />
          <span>
            Último aviso: Sua conta será temporariamente suspensa em menos de 24 horas por pendência financeira.
          </span>
        </div>
        <button
          onClick={() => setModalQuitacao(true)}
          className="px-3.5 py-1 bg-white hover:bg-slate-100 text-rose-700 rounded-lg text-xs font-extrabold transition shadow-sm whitespace-nowrap ml-4"
        >
          Evitar Suspensão
        </button>
      </div>
    );
  }

  // 3. Bloqueio Suave Efetivo (Status = 'suspended' ou Quitação Aberta)
  const handleSimularQuitacao = () => {
    setSimulandoPagamento(true);
    setTimeout(() => {
      setSimulandoPagamento(false);
      setPagoComSucesso(true);
      setTimeout(() => {
        if (onQuitado) onQuitado();
        setModalQuitacao(false);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto mb-5 shadow-lg">
          <ShieldAlert className="w-9 h-9" />
        </div>

        <h2 className="text-2xl font-extrabold text-white mb-2">Acesso Temporariamente Suspenso</h2>
        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          Seus dados, laudos fotográficos e histórico de ordens de serviço continuam <strong>100% seguros e preservados</strong>. Para restabelecer o acesso total imediato, basta quitar a mensalidade pendente.
        </p>

        {pagoComSucesso ? (
          <div className="p-5 bg-emerald-950/50 border border-emerald-500/40 rounded-2xl text-emerald-300 text-sm space-y-2 mb-6">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400 animate-bounce" />
            <div className="font-bold">Pagamento Confirmado pelo Stripe!</div>
            <div className="text-xs text-slate-400">Desbloqueando sua bancada em instantes...</div>
          </div>
        ) : (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 mb-6 text-left space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Fatura em Aberto:</span>
              <span className="font-bold text-white text-base">
                R$ {(valorPendenteCentavos / 100).toFixed(2)}
              </span>
            </div>

            {/* Abas de Pagamento Rápido */}
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setMetodo('pix')}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition ${
                  metodo === 'pix'
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <QrCode className="w-4 h-4" /> PIX Instantâneo
              </button>
              <button
                type="button"
                onClick={() => setMetodo('card')}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition ${
                  metodo === 'card'
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <CreditCard className="w-4 h-4" /> Cartão de Crédito
              </button>
            </div>

            {metodo === 'pix' && (
              <div className="p-3 bg-slate-900/60 rounded-xl text-center text-xs text-slate-300 space-y-2">
                <div className="font-mono text-[10px] break-all bg-slate-950 p-2 rounded border border-slate-800 text-cyan-300">
                  00020126580014br.gov.bcb.pix0136easycell-fatura-quitacao-instantanea
                </div>
                <p className="text-[11px] text-slate-400">Escaneie o QR Code ou copie o código Pix acima.</p>
              </div>
            )}

            <button
              onClick={handleSimularQuitacao}
              disabled={simulandoPagamento}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm rounded-xl transition shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
            >
              {simulandoPagamento ? (
                <span>Confirmando com o Gateway...</span>
              ) : (
                <>
                  <span>Quitar Pendência e Liberar Acesso</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
          <a
            href="https://wa.me/5511999990000?text=Preciso%20de%20ajuda%20com%20minha%20fatura%20do%20EasyCell"
            target="_blank"
            rel="noreferrer"
            className="hover:text-cyan-400 flex items-center gap-1.5 transition"
          >
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            Falar com Suporte no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
