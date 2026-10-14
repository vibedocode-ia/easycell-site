import React, { useState, useEffect } from 'react';
import { Bot, MessageSquare, Send, CheckCircle2, AlertCircle, Play, Pause, Sparkles, RefreshCw } from 'lucide-react';

export default function SaasSdrPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [disparando, setDisparando] = useState(false);
  const [disparoFeedback, setDisparoFeedback] = useState(null);

  const fetchCampaigns = async () => {
    const token = localStorage.getItem('easycell_auth_token') || sessionStorage.getItem('easycell_auth_token');
    try {
      const res = await fetch('/api/v1/saas/sdr/campaigns', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.campaigns) setCampaigns(data.campaigns);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleDisparar = async (id) => {
    setDisparando(true);
    setDisparoFeedback(null);
    const token = localStorage.getItem('easycell_auth_token') || sessionStorage.getItem('easycell_auth_token');

    try {
      const res = await fetch(`/api/v1/saas/sdr/campaigns/${id}/send`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDisparoFeedback(data);
    } catch (err) {
      console.error(err);
    } finally {
      setDisparando(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Bot className="w-6 h-6 text-cyan-400" />
          SofIA SDR • Prospecção Automatizada via WhatsApp
        </h1>
        <p className="text-sm text-slate-400">
          Inteligência Artificial comercial para abordagem ativa de assistências com proteção contra bloqueios.
        </p>
      </div>

      {/* Status da Conexão */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">Número Comercial Ativo:</span>
              <span className="text-xs font-mono text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                +55 (11) 99999-0000
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Sessão Baileys Exclusiva • Gateway SofIA Conectado</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs text-emerald-400 font-bold uppercase">Online & Operante</span>
        </div>
      </div>

      {disparoFeedback && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="font-bold">Campanha disparada para a fila!</div>
            <div>
              {disparoFeedback.filaEnviados} mensagens em envio sequencial • {disparoFeedback.rateLimit}
            </div>
          </div>
        </div>
      )}

      {/* Grid de Campanhas */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Campanhas Ativas</h2>

        <div className="grid grid-cols-1 gap-4">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white">{c.nome}</h3>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                    Tipo: {c.tipo}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-cyan-950 border border-cyan-800 text-cyan-400 uppercase">
                    {c.status}
                  </span>
                  <button
                    onClick={() => handleDisparar(c.id)}
                    disabled={disparando}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                  >
                    {disparando ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Disparar Campanha</span>
                  </button>
                </div>
              </div>

              {/* Template */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">
                  Template de Mensagem (com Variáveis Dinâmicas):
                </div>
                <p className="text-xs text-slate-300 font-mono leading-relaxed">{c.template}</p>
              </div>

              {/* Métricas da Campanha */}
              <div className="grid grid-cols-3 gap-4 text-center pt-2">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-xl font-bold text-white">{c.totalEnviados}</div>
                  <div className="text-[10px] text-slate-400">Mensagens Enviadas</div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-xl font-bold text-cyan-400">{c.totalRespostas}</div>
                  <div className="text-[10px] text-slate-400">Respostas Recebidas (30.5%)</div>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-xl font-bold text-emerald-400">{c.totalConversoes}</div>
                  <div className="text-[10px] text-slate-400">Assinaturas Convertidas</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
