import React, { useState } from 'react';
import { 
  Bot, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Send, 
  Settings2, 
  RefreshCw, 
  Sparkles, 
  Smartphone,
  ShieldCheck,
  Radio,
  FileCode,
  ArrowDownLeft,
  ArrowUpRight,
  Sliders
} from 'lucide-react';

export default function AutomacoesPage() {
  const [gatewayStatus, setGatewayStatus] = useState('conectado');
  const [testNumber, setTestNumber] = useState('');
  const [testSentFeedback, setTestSentFeedback] = useState(false);
  const [gatilhos, setGatilhos] = useState([
    { id: 'gat_1', nome: 'Entrada de O.S. & Laudo', desc: 'Dispara link de tracking seguro e laudo fotográfico imediato', ativo: true },
    { id: 'gat_2', nome: 'Orçamento com Resposta Rápida', desc: 'Envia valores e processa resposta automática (1=Aprova / 2=Dúvidas)', ativo: true },
    { id: 'gat_3', nome: 'Aparelho Pronto para Retirada', desc: 'Avisa o cliente que os testes foram concluídos e o aparelho está pronto', ativo: true },
    { id: 'gat_4', nome: 'Lembrete de Retirada (48h)', desc: 'Reenvia notificação amigável caso não seja retirado em 2 dias', ativo: false },
  ]);

  const [selectedTemplateId, setSelectedTemplateId] = useState('gat_2');
  const [templates, setTemplates] = useState({
    gat_1: 'Olá, {cliente}! Sua Ordem de Serviço #{numero_os} ({aparelho}) foi registrada com sucesso na EasyCell. Acompanhe o laudo fotográfico pericial e status em tempo real pelo link: {link_tracking}',
    gat_2: 'EasyCell Informa: O diagnóstico do seu {aparelho} (O.S. #{numero_os}) está pronto!\n\nPeças: {valor_pecas}\nMão de Obra: {valor_servico}\nTotal: {valor_total}\n\n👉 Responda *1* para APROVAR o início do reparo imediato.\n👉 Responda *2* se tiver dúvidas com nosso técnico.',
    gat_3: 'Boas notícias, {cliente}! Seu {aparelho} (O.S. #{numero_os}) foi reparado e passou em todos os testes técnicos. Ele já está pronto para retirada no balcão da EasyCell. Esperamos você!',
    gat_4: 'Olá, {cliente}! Passando para lembrar que seu {aparelho} (O.S. #{numero_os}) está pronto e guardado com segurança em nosso balcão. Pode passar para retirar quando puder!'
  });

  const [logs] = useState([
    {
      id: 'log_01',
      direcao: 'inbound',
      remetente: '21 99876-5432',
      tipo: 'resposta_cliente',
      conteudo: '1',
      acao: 'Aprovou Orçamento O.S. #1001',
      horario: 'Há 12 minutos',
      status: 'processado'
    },
    {
      id: 'log_02',
      direcao: 'outbound',
      remetente: '21 99876-5432',
      tipo: 'orcamento',
      conteudo: 'EasyCell Informa: Orçamento da O.S. #1001 disponível! Responda 1 para APROVAR...',
      acao: 'Orçamento Enviado',
      horario: 'Há 15 minutos',
      status: 'lido'
    },
    {
      id: 'log_03',
      direcao: 'outbound',
      remetente: '11 98888-7777',
      tipo: 'os_entrada',
      conteudo: 'Olá Marina! Sua O.S. #1002 (Galaxy S22) foi registrada na EasyCell...',
      acao: 'Entrada com Link de Tracking',
      horario: 'Há 1 hora',
      status: 'entregue'
    }
  ]);

  const toggleGatilho = (id) => {
    setGatilhos((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ativo: !g.ativo } : g))
    );
  };

  const handleSendTest = (e) => {
    e.preventDefault();
    if (!testNumber) return;
    setTestSentFeedback(true);
    setTimeout(() => setTestSentFeedback(false), 3000);
  };

  const getPreviewText = () => {
    const raw = templates[selectedTemplateId] || '';
    return raw
      .replace('{cliente}', 'Carlos Eduardo')
      .replace('{numero_os}', '1001')
      .replace('{aparelho}', 'iPhone 13 Pro')
      .replace('{valor_pecas}', 'R$ 750,00')
      .replace('{valor_servico}', 'R$ 150,00')
      .replace('{valor_total}', 'R$ 900,00')
      .replace('{link_tracking}', 'https://easycell.vibedocode.pro/track/tr_1001');
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              Central de WhatsApp & Automações
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-normal">
                Fase 2
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Conexão com gateway SofIA (Baileys), disparos inteligentes e aprovação automática de orçamentos via chat
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Status do Gateway & Disparo de Teste */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Card do Gateway */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping absolute inset-0"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 relative"></div>
              </div>
              <div>
                <span className="text-sm font-bold text-white block">Gateway SofIA (Baileys) Operacional</span>
                <span className="text-xs text-slate-400 font-mono">Modo: Sessão Única Isolada • Latência: 38ms</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-medium flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Conectado
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
              <span className="text-[11px] text-slate-400 block">Sessão Registrada</span>
              <span className="text-xs font-mono font-bold text-slate-200">sofia_easycell_prod</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
              <span className="text-[11px] text-slate-400 block">Idempotência</span>
              <span className="text-xs font-mono font-bold text-emerald-400">Ativa (Zero Duplicação)</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60">
              <span className="text-[11px] text-slate-400 block">Taxa de Entrega</span>
              <span className="text-xs font-mono font-bold text-cyan-400">99.4% nas últimas 24h</span>
            </div>
          </div>
        </div>

        {/* Teste Rápido de Disparo */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
              <Send className="w-4 h-4 text-cyan-400" />
              Simulação de Disparo
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Envie uma notificação de teste diretamente para o seu WhatsApp para conferir a formatação.
            </p>

            <form onSubmit={handleSendTest} className="space-y-3">
              <input
                type="text"
                placeholder="(DDD) 99999-9999"
                value={testNumber}
                onChange={(e) => setTestNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                <Send className="w-3.5 h-3.5" />
                Disparar Mensagem de Teste
              </button>
            </form>
          </div>

          {testSentFeedback && (
            <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs text-center">
              Mensagem de teste despachada com sucesso!
            </div>
          )}
        </div>
      </div>

      {/* Seção 2: Gatilhos Automáticos & Editor de Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lista de Gatilhos Automáticos */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              Gatilhos de Notificação Automática
            </h2>
            <span className="text-xs text-slate-500 font-mono">Status Kanban</span>
          </div>

          <div className="space-y-3">
            {gatilhos.map((gat) => (
              <div
                key={gat.id}
                onClick={() => setSelectedTemplateId(gat.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedTemplateId === gat.id
                    ? 'bg-slate-800/80 border-cyan-500/50 shadow-md'
                    : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{gat.nome}</span>
                    {selectedTemplateId === gat.id && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                        Editando
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">{gat.desc}</p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleGatilho(gat.id);
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                    gat.ativo ? 'bg-emerald-500' : 'bg-slate-800'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      gat.ativo ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  ></div>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Editor de Template com Preview WhatsApp */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                Template Dinâmico
              </h2>
              <span className="text-[11px] text-slate-400">Variáveis suportadas</span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {['{cliente}', '{numero_os}', '{aparelho}', '{valor_total}', '{link_tracking}'].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setTemplates((prev) => ({
                      ...prev,
                      [selectedTemplateId]: (prev[selectedTemplateId] || '') + ` ${v}`
                    }));
                  }}
                  className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-cyan-300 transition"
                >
                  + {v}
                </button>
              ))}
            </div>

            <textarea
              rows={4}
              value={templates[selectedTemplateId] || ''}
              onChange={(e) =>
                setTemplates((prev) => ({ ...prev, [selectedTemplateId]: e.target.value }))
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans leading-relaxed"
            />
          </div>

          {/* WhatsApp Balão Mockup */}
          <div className="pt-2">
            <span className="text-[11px] font-bold text-slate-400 block mb-2">
              Prévia de Como o Cliente Recebe no WhatsApp:
            </span>
            <div className="bg-[#0b141a] border border-slate-800 rounded-xl p-4 relative">
              <div className="bg-[#005c4b] text-slate-100 rounded-2xl rounded-tr-none p-3.5 max-w-sm ml-auto text-xs space-y-2 shadow-lg leading-relaxed whitespace-pre-wrap">
                {getPreviewText()}
                <div className="text-[10px] text-emerald-200 text-right font-mono flex items-center justify-end gap-1">
                  <span>14:32</span>
                  <CheckCircle2 className="w-3 h-3 text-cyan-300 inline" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seção 3: Logs e Auditoria de Webhooks Inbound/Outbound */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            Auditoria em Tempo Real (Webhooks SofIA)
          </h2>
          <span className="text-xs text-slate-400 font-mono">Últimas Interações</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-800">
              <tr>
                <th className="pb-3">Fluxo</th>
                <th className="pb-3">Número / Cliente</th>
                <th className="pb-3">Evento / Conteúdo</th>
                <th className="pb-3">Ação do Sistema</th>
                <th className="pb-3">Horário</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3">
                    {log.direcao === 'inbound' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px]">
                        <ArrowDownLeft className="w-3 h-3" /> Inbound
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full text-[10px]">
                        <ArrowUpRight className="w-3 h-3" /> Outbound
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-slate-300">{log.remetente}</td>
                  <td className="py-3 text-slate-400 font-sans max-w-xs truncate">{log.conteudo}</td>
                  <td className="py-3 font-sans text-white font-medium">{log.acao}</td>
                  <td className="py-3 text-slate-500 text-[11px]">{log.horario}</td>
                  <td className="py-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
