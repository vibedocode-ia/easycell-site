import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Smartphone, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  MessageSquare, 
  Download, 
  Camera,
  Check,
  X,
  Wrench,
  ThumbsUp
} from 'lucide-react';
import { getOrdens, updateOrdemStatus } from '../../lib/store';

export default function TrackingPage() {
  const { hash } = useParams();
  const [ordem, setOrdem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aprovadoFeedback, setAprovadoFeedback] = useState(false);
  const [selectedFoto, setSelectedFoto] = useState(null);
  const [modalConfirmAprovacao, setModalConfirmAprovacao] = useState(false);

  useEffect(() => {
    // Busca a O.S. pelo hash de tracking ou ID
    const todas = getOrdens();
    const encontrada = todas.find(
      (o) => o.hashTracking === hash || o.id === hash || `tr_${o.numeroOs}` === hash
    );

    if (encontrada) {
      setOrdem(encontrada);
    } else {
      // Fallback para a primeira O.S. (demo) caso o hash seja de teste
      setOrdem(todas[0] || null);
    }
    setLoading(false);
  }, [hash]);

  const handleAprovarOrcamento = () => {
    if (!ordem) return;
    updateOrdemStatus(ordem.id, 'aprovado_reparo');
    setOrdem((prev) => ({
      ...prev,
      status: 'aprovado_reparo',
      aprovacaoCanal: 'web_link',
      aprovadoEm: new Date().toISOString()
    }));
    setModalConfirmAprovacao(false);
    setAprovadoFeedback(true);
  };

  const statusEtapas = [
    { key: 'entrada', label: 'Recebido & Triagem', desc: 'Aparelho sob custódia e laudo realizado' },
    { key: 'orcamento_pendente', label: 'Orçamento Pronto', desc: 'Aguardando validação do cliente' },
    { key: 'aprovado_reparo', label: 'Em Reparo / Bancada', desc: 'Técnico executando o serviço' },
    { key: 'pronto_retirada', label: 'Pronto p/ Retirada', desc: 'Finalizado e testado na bancada' },
    { key: 'entregue_pago', label: 'Entregue & Garantia', desc: 'Aparelho retirado pelo cliente' }
  ];

  const getStatusIndex = (st) => {
    const idx = statusEtapas.findIndex((e) => e.key === st);
    return idx >= 0 ? idx : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm">Localizando ordem de serviço...</p>
        </div>
      </div>
    );
  }

  if (!ordem) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Ordem de Serviço Não Encontrada</h2>
          <p className="text-sm text-slate-400 mb-6">
            O código informado não corresponde a nenhum aparelho cadastrado ou o link expirou.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-medium transition"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  const currentIdx = getStatusIndex(ordem.status);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center">
      {/* Top Header */}
      <header className="w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 py-4 px-6 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
              EC
            </div>
            <div>
              <span className="font-bold text-white tracking-tight">EasyCell</span>
              <span className="text-xs text-emerald-400 ml-2 font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                Laudo Blindado
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Ordem de Serviço</span>
            <span className="text-sm font-mono font-bold text-white">#{ordem.numeroOs}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-3xl p-4 sm:p-6 space-y-6">
        {/* Banner do Aparelho */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>{ordem.aparelhoMarca}</span>
                <span>•</span>
                <span>Cor: {ordem.aparelhoCor || 'Padrão'}</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                {ordem.aparelhoModelo}
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-1">
                IMEI: {ordem.aparelhoImei || 'Rastreado no Sistema'}
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl px-4 py-3 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <span className="text-xs text-slate-400 block">Blindagem Digital</span>
                <span className="text-xs font-semibold text-emerald-400">
                  Laudo Pericial Ativo
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Linha do Tempo / Timeline */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            Progresso do Reparo
          </h2>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {statusEtapas.map((etapa, idx) => {
              const isPast = idx < currentIdx;
              const isCurrent = idx === currentIdx;

              return (
                <div key={etapa.key} className="relative flex items-start gap-3">
                  <div
                    className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                      isPast
                        ? 'bg-emerald-500 text-slate-950 ring-4 ring-slate-900'
                        : isCurrent
                        ? 'bg-emerald-400 text-slate-950 ring-4 ring-emerald-500/20 animate-pulse'
                        : 'bg-slate-800 text-slate-500 ring-4 ring-slate-900'
                    }`}
                  >
                    {isPast ? <Check className="w-3 h-3" /> : idx + 1}
                  </div>
                  <div>
                    <span
                      className={`text-sm font-bold block ${
                        isCurrent ? 'text-emerald-400' : isPast ? 'text-white' : 'text-slate-500'
                      }`}
                    >
                      {etapa.label}
                    </span>
                    <span className="text-xs text-slate-400">{etapa.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card de Orçamento com Discriminação Transparente */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              Detalhamento do Orçamento
            </h2>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
              Garantia Legal 90 Dias
            </span>
          </div>

          <div className="space-y-2 divide-y divide-slate-800/60">
            <div className="flex justify-between items-center py-2 text-sm">
              <span className="text-slate-400 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-slate-500" /> Peças de Reposição
              </span>
              <span className="font-mono font-medium text-white">
                {(ordem.valorPecas / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 text-sm">
              <span className="text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-500" /> Mão de Obra Especializada
              </span>
              <span className="font-mono font-medium text-white">
                {(ordem.valorMaoDeObra / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div className="flex justify-between items-center pt-3 text-base font-bold">
              <span className="text-white">Total do Serviço</span>
              <span className="text-xl font-mono text-emerald-400">
                {(ordem.valorTotal / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>

          {/* Botões de Ação de Aprovação */}
          {ordem.status === 'orcamento_pendente' && !aprovadoFeedback ? (
            <div className="pt-4 space-y-3">
              <button
                onClick={() => setModalConfirmAprovacao(true)}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 text-base transition-all transform active:scale-95"
              >
                <ThumbsUp className="w-5 h-5" />
                Aprovar Orçamento Agora
              </button>
              <a
                href={`https://wa.me/5511999999999?text=Ol%C3%A1%2C%20tenho%20d%C3%BAvidas%20sobre%20o%20or%C3%A7amento%20da%20minha%20OS%20%23${ordem.numeroOs}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 text-slate-300 font-medium rounded-xl flex items-center justify-center gap-2 text-sm transition"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                Tenho Dúvidas / Falar no WhatsApp
              </a>
            </div>
          ) : (
            <div className="pt-2">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-3 text-emerald-400 text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Orçamento aprovado! Aparelho em bancada com garantia de serviço.</span>
              </div>
            </div>
          )}
        </div>

        {/* Galeria de Fotos do Laudo de Entrada (Compulsório) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              Laudo Fotográfico de Entrada
            </h2>
            <span className="text-xs text-slate-500 font-mono">4 Fotos Compulsórias</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { key: 'frenteUrl', label: 'Frontal' },
              { key: 'traseiraUrl', label: 'Traseira' },
              { key: 'lateraisUrl', label: 'Laterais' },
              { key: 'conectorUrl', label: 'Conector' }
            ].map((slot) => {
              const url = ordem.laudoFotos?.[slot.key];
              return (
                <div
                  key={slot.key}
                  onClick={() => url && setSelectedFoto(url)}
                  className="group relative aspect-square bg-slate-950 rounded-xl border border-slate-800 overflow-hidden cursor-pointer hover:border-emerald-500/50 transition"
                >
                  {url ? (
                    <img src={url} alt={slot.label} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-1">
                      <Camera className="w-5 h-5" />
                      <span className="text-[10px]">{slot.label}</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent p-2 text-center">
                    <span className="text-[11px] font-semibold text-slate-300">{slot.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Checklist Funcional de Entrada */}
        {ordem.checklistEntrada && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Checklist Funcional Inicial
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              {Object.entries(ordem.checklistEntrada).map(([chave, status]) => (
                <div
                  key={chave}
                  className={`flex items-center justify-between p-2.5 rounded-lg border ${
                    status
                      ? 'bg-slate-950/40 border-slate-800 text-slate-300'
                      : 'bg-rose-500/5 border-rose-500/20 text-rose-300'
                  }`}
                >
                  <span className="capitalize">{chave.replace(/([A-Z])/g, ' $1')}</span>
                  {status ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <X className="w-4 h-4 text-rose-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Download do Laudo Pericial Oficial em PDF */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">Laudo Pericial Oficial (PDF)</span>
              <span className="text-xs text-slate-400 font-mono">
                Autenticidade SHA-256 • Termos de Garantia Art. 26 CDC
              </span>
            </div>
          </div>

          <a
            href={ordem.laudoPdfUrl || `https://easycell.vibedocode.pro/docs/laudos/laudo-os-${ordem.numeroOs}.pdf`}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            Baixar Laudo em PDF
          </a>
        </div>
      </main>

      {/* Modal Lightbox de Foto */}
      {selectedFoto && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedFoto(null)}
        >
          <div className="relative max-w-2xl max-h-[90vh]">
            <img src={selectedFoto} alt="Zoom" className="max-w-full max-h-[85vh] rounded-xl object-contain shadow-2xl" />
            <button
              onClick={() => setSelectedFoto(null)}
              className="absolute top-2 right-2 p-2 bg-slate-900/80 rounded-full text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Aprovação */}
      {modalConfirmAprovacao && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ThumbsUp className="w-4 h-4 text-emerald-400" />
                Confirmar Início do Reparo
              </h3>
              <button
                onClick={() => setModalConfirmAprovacao(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                Ao confirmar, você autoriza formalmente a execução dos serviços e substituição das peças para o seu{' '}
                <strong className="text-white">{ordem.aparelhoModelo}</strong>.
              </p>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400 font-medium">Valor Total Aprovado:</span>
                <span className="text-base font-mono font-bold text-emerald-400">
                  {((ordem.valorTotal || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                ✓ Garantia legal de 90 dias conforme Art. 26 do CDC.<br />
                ✓ Registro imediato para a bancada técnica iniciar o serviço.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalConfirmAprovacao(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAprovarOrcamento}
                className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20"
              >
                Confirmar Reparo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Simples */}
      <footer className="w-full py-6 text-center text-xs text-slate-600 border-t border-slate-900 mt-auto">
        EasyCell — Gestão Blindada de Assistência Técnica & VibeDoCode Evolution
      </footer>
    </div>
  );
}
