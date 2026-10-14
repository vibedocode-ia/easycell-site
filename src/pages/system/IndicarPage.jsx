import React, { useState, useEffect } from 'react';
import { Gift, Copy, Check, MessageSquare, Sparkles, Users, Award, ExternalLink } from 'lucide-react';

export default function IndicarPage() {
  const [linkData, setLinkData] = useState(null);
  const [stats, setStats] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('easycell_auth_token') || sessionStorage.getItem('easycell_auth_token');
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch('/api/v1/referrals/link', { headers }).then((r) => r.json()),
      fetch('/api/v1/referrals/stats', { headers }).then((r) => r.json()),
    ])
      .then(([lData, sData]) => {
        setLinkData(lData);
        setStats(sData);
      })
      .catch((err) => console.error(err));
  }, []);

  const referralUrl = linkData?.referralUrl || 'https://easycell.vibedocode.pro/r/easycell-matriz';

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `Opa parceiro de bancada! Estou usando o EasyCell para gerenciar minhas ordens de serviço e laudos fotográficos com blindagem jurídica. Consegui um link VIP com 7 DIAS GRÁTIS no plano PRO para você testar: ${referralUrl}`
  )}`;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Gift className="w-6 h-6 text-cyan-400" />
          Programa Indique e Ganhe Meses Grátis
        </h1>
        <p className="text-sm text-slate-400">
          Compartilhe o EasyCell com outras assistências e zere a sua fatura mensal!
        </p>
      </div>

      {/* Hero Box com Link de Indicação */}
      <div className="bg-gradient-to-br from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 mb-2">
              <Sparkles className="w-4 h-4" /> SEU LINK EXCLUSIVO DE PARCEIRO
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Convide amigos e ganhe créditos na fatura</h2>
          </div>
          <span className="px-3.5 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-bold">
            Crédito aplicado automaticamente
          </span>
        </div>

        {/* Input Copiável */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-full flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm font-mono text-cyan-300 truncate">
            {referralUrl}
          </div>
          <button
            onClick={handleCopy}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-500/20 whitespace-nowrap"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado para o Clipboard!' : 'Copiar Link'}</span>
          </button>
          <a
            href={shareWhatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20 whitespace-nowrap"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Compartilhar no WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Regras e Progresso */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Regra 1: 3 Trials = 1 Mês */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 font-bold">
            3x
          </div>
          <h3 className="text-base font-bold text-white">3 Amigos no Trial = 1 Mês Grátis</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            A cada 3 assistências que iniciarem o período de avaliação gratuita de 7 dias através do seu link, você ganha 1 mês grátis creditado na sua próxima fatura.
          </p>

          <div className="pt-2">
            <div className="flex justify-between text-xs text-slate-300 mb-2 font-medium">
              <span>Progresso para o próximo mês grátis:</span>
              <span className="text-cyan-400 font-bold">{stats?.progressoTrial || '2/3'} indicados</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden p-0.5 border border-slate-800">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: '66%' }}></div>
            </div>
          </div>
        </div>

        {/* Regra 2: 1 Pago = 1 Mês Instantâneo */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 font-bold">
            1x
          </div>
          <h3 className="text-base font-bold text-white">1 Amigo Assinante = 1 Mês Imediato</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Se qualquer amigo que você indicou efetivar o pagamento de um plano (Starter, PRO ou Enterprise), você ganha 1 mês grátis instantaneamente!
          </p>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-bold">Saldo de Crédito Atual:</div>
              <div className="text-xl font-extrabold text-emerald-400">
                {stats?.mesesGratisAcumulados || 1} Mês Grátis
              </div>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Desconto de R$ 197,00 na próxima fatura
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
