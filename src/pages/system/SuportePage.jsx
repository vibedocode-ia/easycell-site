import React, { useState, useEffect } from 'react';
import { HelpCircle, Plus, MessageSquare, Send, CheckCircle2, Clock, X, AlertCircle } from 'lucide-react';

export default function SuportePage() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    assunto: '',
    descricao: '',
    categoria: 'geral',
    prioridade: 'media',
  });

  const fetchTickets = async () => {
    const token = localStorage.getItem('easycell_auth_token') || sessionStorage.getItem('easycell_auth_token');
    try {
      const res = await fetch('/api/v1/support/tickets', {
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
          autorNome: 'Minha Assistência',
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

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('easycell_auth_token') || sessionStorage.getItem('easycell_auth_token');

    try {
      const res = await fetch('/api/v1/support/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTicketForm),
      });

      if (res.ok) {
        setModalOpen(false);
        setNewTicketForm({ assunto: '', descricao: '', categoria: 'geral', prioridade: 'media' });
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-cyan-400" />
            Central de Ajuda & Suporte Técnico
          </h1>
          <p className="text-sm text-slate-400">
            Abra chamados diretamente com a equipe de engenharia do EasyCell SaaS.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition"
        >
          <Plus className="w-4 h-4" /> Novo Chamado
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        {/* Lista de Chamados */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
            Meus Chamados ({tickets.length})
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
                  <span className="text-emerald-400 font-semibold uppercase">{t.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Thread do Chamado */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
          {selectedTicket ? (
            <>
              {/* Header do Ticket */}
              <div className="border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{selectedTicket.assunto}</span>
                    <span className="text-xs text-slate-500 font-mono">#{selectedTicket.numero}</span>
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-950 text-cyan-400 border border-cyan-800">
                    {selectedTicket.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300">{selectedTicket.descricao}</p>
              </div>

              {/* Mensagens */}
              <div className="flex-1 space-y-3 overflow-y-auto mb-4 pr-1 max-h-[350px]">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.autorTipo === 'cliente' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-3.5 text-xs ${
                        m.autorTipo === 'cliente'
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

              {/* Form de Resposta */}
              <form onSubmit={handleSendReply} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Responder ao suporte..."
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
              Selecione um chamado ao lado para ver as mensagens.
            </div>
          )}
        </div>
      </div>

      {/* Modal de Criação */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" /> Abrir Novo Chamado de Suporte
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Assunto do Chamado *</label>
                <input
                  type="text"
                  required
                  value={newTicketForm.assunto}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, assunto: e.target.value })}
                  placeholder="Ex: Dúvida sobre impressão de etiquetas"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Categoria</label>
                  <select
                    value={newTicketForm.categoria}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, categoria: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="geral">Geral</option>
                    <option value="cobranca">Faturamento & Cobrança</option>
                    <option value="bug">Reportar Erro / Bug</option>
                    <option value="integracao">Impressoras & WhatsApp</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Prioridade</label>
                  <select
                    value={newTicketForm.prioridade}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, prioridade: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="baixa">Baixa (até 48h)</option>
                    <option value="media">Média (até 24h)</option>
                    <option value="alta">Alta (até 6h)</option>
                    <option value="urgente">Urgente (até 2h)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Descrição Detalhada *</label>
                <textarea
                  rows={4}
                  required
                  value={newTicketForm.descricao}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, descricao: e.target.value })}
                  placeholder="Explique o que aconteceu ou como podemos te ajudar..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold"
                >
                  Enviar Chamado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
