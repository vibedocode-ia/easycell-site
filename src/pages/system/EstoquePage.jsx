import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, AlertTriangle, ShieldCheck, Tag } from 'lucide-react';
import { easyCellStore } from '../../lib/store';

export default function EstoquePage() {
  const [stock, setStock] = useState([]);
  const [activeTab, setActiveTab] = useState('peca_reposicao');
  const [modalNovo, setModalNovo] = useState(false);

  // Novo item
  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [precoCusto, setPrecoCusto] = useState('');
  const [precoVenda, setPrecoVenda] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [imei, setImei] = useState('');

  useEffect(() => {
    setStock(easyCellStore.getStock());
  }, []);

  const handleCreate = (e) => {
    e.preventDefault();
    easyCellStore.addStockItem({
      codigo,
      nome,
      tipo: activeTab,
      imei: activeTab === 'aparelho_usado' ? imei : null,
      quantidade: Number(quantidade),
      quantidadeMinima: 2,
      precoCusto: Number(precoCusto) * 100,
      precoVenda: Number(precoVenda) * 100,
    });

    setStock(easyCellStore.getStock());
    setModalNovo(false);
    setNome('');
    setCodigo('');
    setPrecoCusto('');
    setPrecoVenda('');
    setImei('');
  };

  const filteredItems = stock.filter(item => {
    if (activeTab === 'peca_reposicao') return item.tipo === 'peca_reposicao';
    if (activeTab === 'servico') return item.tipo === 'servico';
    if (activeTab === 'aparelho_usado') return item.tipo === 'aparelho_usado' || item.tipo === 'vitrine_novo';
    return true;
  });

  const totalPecas = stock.filter(i => i.tipo === 'peca_reposicao').length;
  const totalServicos = stock.filter(i => i.tipo === 'servico').length;
  const totalAparelhos = stock.filter(i => i.tipo === 'aparelho_usado' || i.tipo === 'vitrine_novo').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Controle de Estoque Especializado
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">Tripla camada: Peças com baixa na O.S., Serviços tabelados e Aparelhos por IMEI.</p>
        </div>

        <button
          onClick={() => setModalNovo(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Item</span>
        </button>
      </div>

      {/* Cards Rápidos de Navegação & Filtro - 100% Clicáveis */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <button
          type="button"
          onClick={() => setActiveTab('peca_reposicao')}
          className={`glass-panel p-4 rounded-2xl border text-left transition-all cursor-pointer group shadow-lg select-none active:scale-95 ${
            activeTab === 'peca_reposicao'
              ? 'border-cyan-400 ring-2 ring-cyan-400/30 bg-cyan-950/20 scale-[1.01]'
              : 'border-slate-800 hover:border-cyan-500/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 group-hover:text-cyan-300">Peças de Reposição</span>
            <Package className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{totalPecas}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Telas, baterias e conectores</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('servico')}
          className={`glass-panel p-4 rounded-2xl border text-left transition-all cursor-pointer group shadow-lg select-none active:scale-95 ${
            activeTab === 'servico'
              ? 'border-blue-400 ring-2 ring-blue-400/30 bg-blue-950/20 scale-[1.01]'
              : 'border-slate-800 hover:border-blue-500/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 group-hover:text-blue-300">Tabela de Serviços</span>
            <Tag className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400 font-mono">{totalServicos}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Mão de obra tabelada</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('aparelho_usado')}
          className={`glass-panel p-4 rounded-2xl border text-left transition-all cursor-pointer group shadow-lg select-none active:scale-95 ${
            activeTab === 'aparelho_usado'
              ? 'border-emerald-400 ring-2 ring-emerald-400/30 bg-emerald-950/20 scale-[1.01]'
              : 'border-slate-800 hover:border-emerald-500/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 group-hover:text-emerald-300">Aparelhos / Seminovos</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{totalAparelhos}</div>
          <span className="text-[10px] text-slate-400 mt-1 block">Rastreados por IMEI</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-6 text-xs font-bold">
        {[
          { key: 'peca_reposicao', label: 'Peças de Reposição (Bancada)' },
          { key: 'servico', label: 'Tabela de Mão de Obra' },
          { key: 'aparelho_usado', label: 'Aparelhos / Seminovos por IMEI' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`pb-3 transition-colors relative ${
              activeTab === t.key ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.label}
            {activeTab === t.key && (
              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-cyan-400 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tabela de Itens */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Descrição do Item</th>
                {activeTab === 'aparelho_usado' && <th className="py-3 px-4">IMEI Rastreado</th>}
                <th className="py-3 px-4">Estoque Atual</th>
                <th className="py-3 px-4">Preço Custo</th>
                <th className="py-3 px-4">Preço Venda</th>
                <th className="py-3 px-4">Margem Bruta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredItems.map((item) => {
                const lucro = (item.precoVenda - item.precoCusto) / 100;
                const margemPct = item.precoVenda > 0 ? Math.round(((item.precoVenda - item.precoCusto) / item.precoVenda) * 100) : 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-900/40">
                    <td className="py-3.5 px-4 font-mono text-cyan-400 font-bold">{item.codigo || '—'}</td>
                    <td className="py-3.5 px-4 text-white font-bold">{item.nome}</td>
                    {activeTab === 'aparelho_usado' && (
                      <td className="py-3.5 px-4 font-mono text-slate-300">{item.imei || 'Não informado'}</td>
                    )}
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                        item.quantidade <= item.quantidadeMinima && item.tipo !== 'servico'
                          ? 'bg-rose-950 text-rose-400 border border-rose-500/30'
                          : 'text-slate-200'
                      }`}>
                        {item.quantidade} un
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">R$ {(item.precoCusto / 100).toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400 font-bold">R$ {(item.precoVenda / 100).toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      R$ {lucro.toFixed(2)} ({margemPct}%)
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cadastro */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <form onSubmit={handleCreate} className="glass-panel max-w-md w-full p-6 rounded-3xl border border-cyan-400/50 space-y-4">
            <h3 className="text-base font-bold text-white">Novo Item de Estoque</h3>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Nome / Descrição *</label>
              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Bateria iPhone 13 Pro Max"
                className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-xl border border-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Código Ref.</label>
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="BAT-013"
                  className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Quantidade</label>
                <input
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(e.target.value)}
                  className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 font-mono"
                />
              </div>
            </div>

            {activeTab === 'aparelho_usado' && (
              <div>
                <label className="block text-xs text-slate-300 mb-1">IMEI do Aparelho *</label>
                <input
                  type="text"
                  required
                  value={imei}
                  onChange={(e) => setImei(e.target.value)}
                  placeholder="354892019482711"
                  className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 font-mono"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Preço de Custo (R$)</label>
                <input
                  type="number"
                  value={precoCusto}
                  onChange={(e) => setPrecoCusto(e.target.value)}
                  placeholder="100.00"
                  className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">Preço de Venda (R$)</label>
                <input
                  type="number"
                  required
                  value={precoVenda}
                  onChange={(e) => setPrecoVenda(e.target.value)}
                  placeholder="220.00"
                  className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 font-mono text-emerald-400 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalNovo(false)}
                className="py-2.5 rounded-xl bg-slate-800 text-xs font-bold text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="py-2.5 rounded-xl bg-cyan-500 text-black text-xs font-bold"
              >
                Salvar Item
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
