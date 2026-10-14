import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Gift, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Zap, Users } from 'lucide-react';

export default function ReferralLandingPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [referrerName, setReferrerName] = useState('Uma Assistência Parceira');

  useEffect(() => {
    if (slug) {
      // Formata nome amigável a partir do slug
      const formatted = slug
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      setReferrerName(formatted);

      // Registra clique no motor de indicação viral
      fetch('/api/v1/referrals/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug }),
      }).catch(() => {});
    }
  }, [slug]);

  const handleStartTrial = () => {
    navigate(`/checkout/plan_pro?cycle=mensal&ref=${slug}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center font-bold text-slate-950 shadow-md shadow-cyan-500/20">
              EC
            </div>
            <span className="font-bold text-base text-white">EasyCell SaaS</span>
          </Link>
          <button
            onClick={handleStartTrial}
            className="px-4 py-1.5 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-md shadow-cyan-500/20"
          >
            Ativar Convite
          </button>
        </div>
      </header>

      {/* Main Hero */}
      <main className="max-w-4xl mx-auto px-4 py-16 text-center flex-1 flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-cyan-300 text-xs font-bold mb-8 shadow-lg shadow-cyan-500/10 animate-bounce">
          <Gift className="w-4 h-4 text-cyan-400" /> CONVITE VIP EXCLUSIVO
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-6">
          Você foi convidado por <br />
          <span className="text-cyan-400 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {referrerName}
          </span>
        </h1>

        <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          Experimente o EasyCell com <strong>7 dias de acesso total gratuito no plano PRO</strong>. A plataforma que elimina prejuízos com laudos periciais criptografados, checklist compulsório e automação WhatsApp.
        </p>

        {/* Card de Benefícios Exclusivos */}
        <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-10 text-left shadow-2xl">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            O que você ganha com este convite:
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span className="text-slate-300">7 Dias Grátis no Plano PRO (Sem compromisso)</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span className="text-slate-300">Laudos Periciais com Hash SHA-256</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span className="text-slate-300">Robô de WhatsApp SofIA Conectado</span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span className="text-slate-300">Controle Multi-lojas e Filiais</span>
            </div>
          </div>
        </div>

        {/* CTA Principal */}
        <button
          onClick={handleStartTrial}
          className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-base rounded-2xl transition shadow-xl shadow-cyan-500/25 flex items-center gap-3 transform hover:scale-105 duration-200"
        >
          <span>Aceitar Convite e Começar Grátis</span>
          <ArrowRight className="w-5 h-5" />
        </button>

        <p className="text-xs text-slate-500 mt-4 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Sem cobrança imediata • Cancele quando quiser no painel
        </p>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>© 2026 EasyCell SaaS • Programa de Indicação Viral</p>
      </footer>
    </div>
  );
}
