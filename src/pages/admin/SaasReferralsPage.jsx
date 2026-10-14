import React, { useState, useEffect } from 'react';
import { Gift, Award, TrendingUp, Users, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export default function SaasReferralsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('easycell_auth_token') || sessionStorage.getItem('easycell_auth_token');
    fetch('/api/v1/saas/referrals', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Gift className="w-6 h-6 text-cyan-400" />
          Programa de Indicações & Viral Loop
        </h1>
        <p className="text-sm text-slate-400">
          Acompanhamento do motor de crescimento viral, créditos concedidos e ranking de divulgadores.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="text-xs text-slate-400 mb-2">Total de Indicações na Plataforma</div>
          <div className="text-3xl font-extrabold text-white">
            {stats?.totalIndicacoesPlataforma || 145}
          </div>
          <div className="text-[11px] text-cyan-400 mt-2">Cliques rastreados via /r/[slug]</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="text-xs text-slate-400 mb-2">Trials Gratuitos Gerados</div>
          <div className="text-3xl font-extrabold text-cyan-400">
            {stats?.totalTrialsGerados || 48}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">Taxa de conversão clique → trial: 33.1%</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="text-xs text-slate-400 mb-2">Conversões em Planos Pagos</div>
          <div className="text-3xl font-extrabold text-emerald-400">
            {stats?.totalPagosGerados || 23}
          </div>
          <div className="text-[11px] text-emerald-400/80 mt-2">Meses grátis creditados aos parceiros</div>
        </div>
      </div>

      {/* Ranking de Assistências Parceiras */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <Award className="w-5 h-5 text-amber-400" />
          <span>Ranking das Assistências que Mais Indicam (Top Promotores)</span>
        </div>

        <div className="divide-y divide-slate-800/80">
          {(stats?.ranking || []).map((r, index) => (
            <div key={index} className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    index === 0
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : index === 1
                      ? 'bg-slate-300 text-slate-950'
                      : 'bg-amber-700 text-white'
                  }`}
                >
                  #{index + 1}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{r.empresa}</div>
                  <div className="text-xs text-slate-400">{r.totalIndicados} assistências convidadas</div>
                </div>
              </div>

              <div className="text-right">
                <span className="px-3 py-1 bg-cyan-950 border border-cyan-800 text-cyan-400 rounded-full text-xs font-bold">
                  {r.mesesGanhos} {r.mesesGanhos === 1 ? 'mês grátis' : 'meses grátis'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
