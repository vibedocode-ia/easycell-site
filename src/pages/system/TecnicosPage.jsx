import React, { useState } from 'react';
import { 
  Users, 
  DollarSign, 
  Plus, 
  Wrench, 
  CheckCircle2, 
  Clock, 
  Percent, 
  ShieldCheck, 
  Search,
  Filter,
  Check,
  X,
  CreditCard
} from 'lucide-react';

export default function TecnicosPage() {
  const [tecnicos, setTecnicos] = useState([
    {
      id: 'tec_1',
      nome: 'Carlos Alexandre Silva',
      especialidade: 'Hardware & Micro-soldagem de Placas',
      telefone: '11 98765-4321',
      percentualComissao: 35,
      ativo: true,
      totalOsMes: 18,
      totalComissaoMes: 245000
    },
    {
      id: 'tec_2',
      nome: 'Mariana Duarte Souza',
      especialidade: 'Telas OLED & Recuperação de FaceID',
      telefone: '11 97654-3210',
      percentualComissao: 30,
      ativo: true,
      totalOsMes: 24,
      totalComissaoMes: 312000
    },
    {
      id: 'tec_3',
      nome: 'Felipe Santos Oliveira',
      especialidade: 'Baterias, Carcaças & Periféricos',
      telefone: '11 96543-2109',
      percentualComissao: 25,
      ativo: true,
      totalOsMes: 15,
      totalComissaoMes: 165000
    }
  ]);

  const [extrato, setExtrato] = useState([
    {
      id: 'com_1',
      numeroOs: 1001,
      tecnicoNome: 'Carlos Alexandre Silva',
      aparelho: 'iPhone 13 Pro',
      valorMaoDeObra: 15000,
      percentualAplicado: 35,
      valorComissao: 5250,
      status: 'pendente',
      data: 'Hoje, 14:10'
    },
    {
      id: 'com_2',
      numeroOs: 1002,
      tecnicoNome: 'Mariana Duarte Souza',
      aparelho: 'Galaxy S22 Ultra',
      valorMaoDeObra: 22000,
      percentualAplicado: 30,
      valorComissao: 6600,
      status: 'pago',
      data: 'Ontem, 16:30'
    },
    {
      id: 'com_3',
      numeroOs: 998,
      tecnicoNome: 'Felipe Santos Oliveira',
      aparelho: 'Xiaomi Redmi Note 11',
      valorMaoDeObra: 12000,
      percentualAplicado: 25,
      valorComissao: 3000,
      status: 'pago',
      data: '10/10/2026'
    }
  ]);

  const [modalNovoTecnico, setModalNovoTecnico] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novaEspec, setNovaEspec] = useState('Hardware & Telas');
  const [novoTelefone, setNovoTelefone] = useState('');
  const [novoPercentual, setNovoPercentual] = useState('30');

  const handleCadastrarTecnico = (e) => {
    e.preventDefault();
    if (!novoNome) return;

    const novo = {
      id: `tec_${Date.now()}`,
      nome: novoNome,
      especialidade: novaEspec,
      telefone: novoTelefone || '(11) 90000-0000',
      percentualComissao: Number(novoPercentual) || 30,
      ativo: true,
      totalOsMes: 0,
      totalComissaoMes: 0
    };

    setTecnicos((prev) => [...prev, novo]);
    setModalNovoTecnico(false);
    setNovoNome('');
    setNovoTelefone('');
    setNovoPercentual('30');
  };

  const handleQuitarComissao = (id) => {
    setExtrato((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'pago' } : c))
    );
  };

  const totalComissoesPagas = extrato
    .filter((e) => e.status === 'pago')
    .reduce((acc, curr) => acc + curr.valorComissao, 0);

  const totalComissoesPendentes = extrato
    .filter((e) => e.status === 'pendente')
    .reduce((acc, curr) => acc + curr.valorComissao, 0);

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              Gestão de Técnicos & Comissões
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-mono font-normal">
                Fase 2
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Controle de bancada, regras de comissionamento sobre serviços e extrato transparente de repasses
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalNovoTecnico(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Técnico</span>
        </button>
      </div>

      {/* Cards de Resumo Financeiro */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Comissões a Pagar</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black font-mono text-amber-400">
            {(totalComissoesPendentes / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">Aguardando repasse de fechamento</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Comissões Já Pagas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black font-mono text-emerald-400">
            {(totalComissoesPagas / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">Total quitado no período</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Técnicos Ativos</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-2xl font-black font-mono text-white">
            {tecnicos.filter((t) => t.ativo).length}
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">Profissionais em bancada</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>Comissão Média</span>
            <Percent className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-2xl font-black font-mono text-cyan-400">
            30%
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">Sobre o valor da mão de obra</span>
        </div>
      </div>

      {/* Tabela de Técnicos Cadastrados */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Wrench className="w-4 h-4 text-cyan-400" />
          Equipe de Bancada & Parâmetros de Comissão
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-800">
              <tr>
                <th className="pb-3">Técnico</th>
                <th className="pb-3">Especialidade</th>
                <th className="pb-3">Contato</th>
                <th className="pb-3">Comissão (%)</th>
                <th className="pb-3">O.S. Mês</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {tecnicos.map((tec) => (
                <tr key={tec.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 font-bold text-white flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold font-mono text-xs">
                      {tec.nome[0]}
                    </div>
                    {tec.nome}
                  </td>
                  <td className="py-3.5 text-slate-400">{tec.especialidade}</td>
                  <td className="py-3.5 text-slate-400 font-mono">{tec.telefone}</td>
                  <td className="py-3.5 font-mono font-bold text-emerald-400">
                    {tec.percentualComissao}%
                  </td>
                  <td className="py-3.5 font-mono text-slate-300">{tec.totalOsMes} aparelhos</td>
                  <td className="py-3.5 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Ativo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Extrato Analítico de Comissões por O.S. */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            Extrato de Comissões por Serviço Finalizado
          </h2>
          <span className="text-xs text-slate-400 font-mono">Apuração por O.S.</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-800">
              <tr>
                <th className="pb-3">O.S. #</th>
                <th className="pb-3">Aparelho</th>
                <th className="pb-3">Técnico</th>
                <th className="pb-3">Mão de Obra</th>
                <th className="pb-3">Comissão Devida</th>
                <th className="pb-3">Data</th>
                <th className="pb-3 text-right">Ação / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {extrato.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3.5 font-bold text-white">#{item.numeroOs}</td>
                  <td className="py-3.5 text-slate-300 font-sans">{item.aparelho}</td>
                  <td className="py-3.5 text-slate-400 font-sans">{item.tecnicoNome}</td>
                  <td className="py-3.5 text-slate-300">
                    {(item.valorMaoDeObra / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="py-3.5 font-bold text-emerald-400">
                    {(item.valorComissao / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}{' '}
                    <span className="text-[10px] text-slate-500 font-normal">({item.percentualAplicado}%)</span>
                  </td>
                  <td className="py-3.5 text-slate-500 text-[11px]">{item.data}</td>
                  <td className="py-3.5 text-right">
                    {item.status === 'pendente' ? (
                      <button
                        onClick={() => handleQuitarComissao(item.id)}
                        className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 ml-auto"
                      >
                        <Check className="w-3 h-3" />
                        Dar Baixa (Pagar)
                      </button>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Pago
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo Técnico */}
      {modalNovoTecnico && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                Cadastrar Novo Técnico
              </h3>
              <button
                onClick={() => setModalNovoTecnico(false)}
                className="text-slate-500 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCadastrarTecnico} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Lucas Henrique Oliveira"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Especialidade Principal</label>
                <input
                  type="text"
                  placeholder="Ex: Micro-soldagem, Placas e Telas"
                  value={novaEspec}
                  onChange={(e) => setNovaEspec(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">WhatsApp</label>
                  <input
                    type="text"
                    placeholder="(11) 99999-9999"
                    value={novoTelefone}
                    onChange={(e) => setNovoTelefone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Comissão (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={novoPercentual}
                    onChange={(e) => setNovoPercentual(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-emerald-400 focus:outline-none focus:border-cyan-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalNovoTecnico(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs transition"
                >
                  Salvar Técnico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
