import React, { useState, useEffect } from 'react';
import { HelpCircle, MessageSquare, Clock, CheckCircle2, AlertCircle, Send, User } from 'lucide-react';

export default function SaasSupportPage() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    const token = localStorage.getItem('easycell_auth_token') || sessionStorage.getItem('easycell_auth_token');
    try {
      const res = await fetch('/api/v1/saas/support/tickets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.tickets) {
        setTickets(data.tickets);
        if (data.tickets.length > 0 && !selectedTicket) {
          handleSelectTicket(data.tickets[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSelectTicket = async (ticket) => {
    setSelectedTicket(ticket);
    const token = localStorage.getItem('easycell_auth_token') || sessionStorage.getItem('easycell_auth_token');
    try {
      const res = await fetch(`/api/v1/support/tickets/${ticket.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.messages) setMessages(data.messages);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    const token = localStorage.getItem('easycell_auth_token') || sessionStorage.getItem('easycell_auth_token');
    try {
      const res = await fetch(`/api/v1/support/tickets/${selectedTicket.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conteudo: replyText,
          autorNome: 'Suporte EasyCell (SuperAdmin)',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, data.message]);
        setReplyText('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-cyan-400" />
          Central de Suporte & Atendimento ao Cliente
        </h1>
        <p className="text-sm text-slate-400">
          Gerenciamento centralizado de chamados de todas as assistências técnicas com controle de SLA.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* Lista de Chamados */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
            Fila de Tickets ({tickets.length})
          </div>

          <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
            {tickets.map((t) => (
              <div
                key={t.id}
                onClick={() => handleSelectTicket(t)}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  selectedTicket?.id === t.id
                    ? 'bg-slate-800/90 border-cyan-500 shadow-md shadow-cyan-500/5'
                    : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white line-clamp-1">{t.assunto}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
                    #{t.numero}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">{t.descricao}</p>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 capitalize">{t.categoria}</span>
                  <span className="inline-flex items-center gap-1 text-emerald-400">
                    <Clock className="w-3 h-3" /> SLA Dentro do Prazo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detalhe e Chat do Chamado */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          {selectedTicket ? (
            <>
              {/* Topo do Ticket */}
              <div className="border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span>{selectedTicket.assunto}</span>
                    <span className="text-xs text-slate-500 font-mono font-normal">#{selectedTicket.numero}</span>
                  </h3>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[11px] font-bold uppercase">
                    {selectedTicket.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{selectedTicket.descricao}</p>
              </div>

              {/* Thread de Mensagens */}
              <div className="flex-1 space-y-3 overflow-y-auto mb-4 pr-1 max-h-[360px]">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.autorTipo === 'admin' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs ${
                        m.autorTipo === 'admin'
                          ? 'bg-cyan-500 text-slate-950 font-medium rounded-tr-none'
                          : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      <div className="text-[10px] opacity-75 font-bold mb-1">{m.autorNome}</div>
                      <div>{m.conteudo}</div>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1">
                      {new Date(m.criadoEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>

              {/* Caixa de Resposta */}
              <form onSubmit={handleSendReply} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Digite sua resposta para o cliente..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition shadow-lg shadow-cyan-500/20"
                >
                  <Send className="w-3.5 h-3.5" /> Enviar
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm">
              <MessageSquare className="w-10 h-10 mb-2 opacity-50" />
              Selecione um chamado ao lado para visualizar a conversa.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
