import React, { useState, useEffect } from 'react';
import { Users, Plus, Phone, MessageSquare, Flame, Snowflake, Sparkles, X, ChevronRight, CheckCircle2, ArrowRight } from 'lucide-react';

export default function SaasCrmPage() {
  const [pipelineCounts, setPipelineCounts] = useState({});
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    nome: '',
    whatsapp: '',
    email: '',
    nomeEmpresa: '',
    cidade: '',
    estagio: 'novo',
    temperatura: 'quente',
  });

  const stages = [
    { key: 'novo', label: 'Novos Leads', color: 'border-blue-500' },
    { key: 'contatado', label: 'Contatados', color: 'border-cyan-500' },
    { key: 'qualificado', label: 'Qualificados', color: 'border-indigo-500' },
    { key: 'demo_agendada', label: 'Demo / Trial', color: 'border-purple-500' },
    { key: 'convertido', label: 'Clientes Pagos', color: 'border-emerald-500' },
  ];

  const fetchCrmData = async () => {
    const token = localStorage.getItem('easycell_auth_token') || sessionStorage.getItem('easycell_auth_token');
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [pipeRes, leadsRes] = await Promise.all([
        fetch('/api/v1/saas/crm/pipeline', { headers }).then((r) => r.json()),
        fetch('/api/v1/saas/crm/leads', { headers }).then((r) => r.json()),
      ]);

      if (pipeRes.pipeline) setPipelineCounts(pipeRes.pipeline);
      if (leadsRes.leads) setLeads(leadsRes.leads);
    } catch (err) {
      console.error('Erro ao buscar CRM:', err);
    }
  };

  useEffect(() => {
    fetchCrmData();
  }, []);

  const handleMoveStage = async (leadId, nextStage) => {
    const token = localStorage.getItem('easycell_auth_token') || sessionStorage.getItem('easycell_auth_token');
    try {
      await fetch(`/api/v1/saas/crm/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estagio: nextStage }),
      });

      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, estagio: nextStage } : l))
      );
      if (selectedLead && selectedLead.id === leadId) {
        setSelectedLead((prev) => ({ ...prev, estagio: nextStage }));
      }
    } catch (err) {
      console.error('Erro ao mover lead:', err);
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('easycell_auth_token') || sessionStorage.getItem('easycell_auth_token');

    try {
      const res = await fetch('/api/v1/saas/crm/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newLeadForm),
      });

      if (res.ok) {
        setModalOpen(false);
        setNewLeadForm({
          nome: '',
          whatsapp: '',
          email: '',
          nomeEmpresa: '',
          cidade: '',
          estagio: 'novo',
          temperatura: 'quente',
        });
        fetchCrmData();
      }
    } catch (err) {
      console.error('Erro ao criar lead:', err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            CRM & Pipeline de Vendas
          </h1>
          <p className="text-sm text-slate-400">
            Funil de prospecção e conversão de novas assistências técnicas para o EasyCell SaaS.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition"
        >
          <Plus className="w-4 h-4" /> Novo Lead
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {stages.map((st) => {
          const colLeads = leads.filter((l) => l.estagio === st.key);
          return (
            <div
              key={st.key}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col min-h-[500px]"
            >
              <div className={`flex items-center justify-between pb-3 mb-3 border-b-2 ${st.color}`}>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
                  {st.label}
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                  {colLeads.length}
                </span>
              </div>

              {/* Lista de Cards */}
              <div className="space-y-3 flex-1">
                {colLeads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="p-3.5 bg-slate-950 border border-slate-800/80 hover:border-cyan-500/60 rounded-xl cursor-pointer transition shadow-sm hover:shadow-cyan-500/5 group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white group-hover:text-cyan-400 transition">
                        {lead.nomeEmpresa || lead.nome}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          lead.temperatura === 'quente'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : lead.temperatura === 'morno'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {lead.temperatura === 'quente' ? (
                          <Flame className="w-2.5 h-2.5" />
                        ) : (
                          <Snowflake className="w-2.5 h-2.5" />
                        )}
                        {lead.temperatura}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mb-2">
                      <Phone className="w-3 h-3 text-slate-500" />
                      {lead.whatsapp}
                    </div>

                    {lead.ultimaNota && (
                      <p className="text-[11px] text-slate-400 line-clamp-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/40">
                        {lead.ultimaNota}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
                      <span>Score: {lead.score}/100</span>
                      <span className="text-cyan-400 flex items-center gap-0.5 font-semibold">
                        Ver detalhes <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer Lateral com Detalhes do Lead */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 sm:p-8 flex flex-col justify-between overflow-y-auto shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedLead.nomeEmpresa || selectedLead.nome}</h3>
                  <p className="text-xs text-slate-400">{selectedLead.cidade || 'Localização não informada'}</p>
                </div>
                <button onClick={() => setSelectedLead(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Informações de Contato */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Responsável:</span>
                  <span className="font-semibold text-white">{selectedLead.nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">WhatsApp:</span>
                  <span className="font-semibold text-cyan-400">{selectedLead.whatsapp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">E-mail:</span>
                  <span className="font-semibold text-white">{selectedLead.email || 'Não informado'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Origem:</span>
                  <span className="font-semibold text-white uppercase">{selectedLead.origem}</span>
                </div>
              </div>

              {/* Transição de Estágio */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Mover Estágio no Pipeline</label>
                <div className="grid grid-cols-2 gap-2">
                  {stages.map((st) => (
                    <button
                      key={st.key}
                      onClick={() => handleMoveStage(selectedLead.id, st.key)}
                      className={`p-2 rounded-xl text-xs font-semibold transition border ${
                        selectedLead.estagio === st.key
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="space-y-2">
                <a
                  href={`https://wa.me/55${selectedLead.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-600/20"
                >
                  <MessageSquare className="w-4 h-4" /> Conversar no WhatsApp
                </a>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-500 text-center">
              Criado em: {new Date(selectedLead.criadoEm).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação de Lead */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" /> Cadastrar Lead Comercial
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nome do Contato *</label>
                <input
                  type="text"
                  required
                  value={newLeadForm.nome}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, nome: e.target.value })}
                  placeholder="Ex: João Silva"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nome da Empresa / Assistência</label>
                <input
                  type="text"
                  value={newLeadForm.nomeEmpresa}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, nomeEmpresa: e.target.value })}
                  placeholder="Ex: MasterCell Assistência"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">WhatsApp *</label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.whatsapp}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, whatsapp: e.target.value })}
                    placeholder="11999998888"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Cidade / UF</label>
                  <input
                    type="text"
                    value={newLeadForm.cidade}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, cidade: e.target.value })}
                    placeholder="Ex: Campinas - SP"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
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
                  Cadastrar Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
