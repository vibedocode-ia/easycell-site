import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Plus, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Layers
} from 'lucide-react';
import { VERSION } from '../../lib/version';

export default function LojasPage() {
  const [lojasList, setLojasList] = useState([
    {
      id: 'loj_matriz_centro',
      tenantId: 'ten_easycell_matriz',
      nomeUnidade: 'Matriz — Centro Lab',
      tipo: 'matriz',
      cnpj: '12.345.678/0001-90',
      telefoneWhatsapp: '(11) 99876-5432',
      enderecoCompleto: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
      corIdentificacao: '#06b6d4',
      status: 'ativa',
      totalTecnicos: 3,
      totalOsAtivas: 18
    },
    {
      id: 'loj_filial_shopping',
      tenantId: 'ten_easycell_matriz',
      nomeUnidade: 'Filial — Shopping Morumbi',
      tipo: 'filial',
      cnpj: '12.345.678/0002-71',
      telefoneWhatsapp: '(11) 98765-4321',
      enderecoCompleto: 'Av. Roque Petroni Jr, 1089 - Piso Térreo, São Paulo - SP',
      corIdentificacao: '#3b82f6',
      status: 'ativa',
      totalTecnicos: 2,
      totalOsAtivas: 12
    }
  ]);

  const [limiteMaximo, setLimiteMaximo] = useState(3);
  const [planoNome, setPlanoNome] = useState('Pro');
  const [modalNovaLoja, setModalNovaLoja] = useState(false);
  const [lojaAtivaId, setLojaAtivaId] = useState(() => localStorage.getItem('easycell_active_loja') || 'loj_matriz_centro');
  const [carregando, setCarregando] = useState(false);
  const [erroLimite, setErroLimite] = useState('');

  const [formLoja, setFormLoja] = useState({
    nomeUnidade: '',
    tipo: 'filial',
    cnpj: '',
    telefoneWhatsapp: '',
    enderecoCompleto: '',
    corIdentificacao: '#06b6d4'
  });

  // Carregar lojas do backend
  useEffect(() => {
    const fetchLojas = async () => {
      const token = localStorage.getItem('easycell_token');
      try {
        const res = await fetch('/api/v1/lojas', {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.lojas && data.lojas.length > 0) {
            setLojasList(data.lojas);
          }
        }
      } catch (err) {
        // standalone
      }
    };
    fetchLojas();
  }, []);

  const handleSelecionarAtiva = (lojaId) => {
    setLojaAtivaId(lojaId);
    localStorage.setItem('easycell_active_loja', lojaId);
    // Dispara evento para o Topbar atualizar
    window.dispatchEvent(new Event('loja-alterada'));
  };

  const handleCriarLoja = async (e) => {
    e.preventDefault();
    setErroLimite('');

    if (lojasList.length >= limiteMaximo) {
      setErroLimite(`Limite de filiais do seu plano ${planoNome} atingido (${lojasList.length}/${limiteMaximo}). Faça upgrade para o Plano Enterprise.`);
      return;
    }

    setCarregando(true);
    const token = localStorage.getItem('easycell_token');

    try {
      const res = await fetch('/api/v1/lojas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(formLoja)
      });

      if (res.ok) {
        const data = await res.json();
        setLojasList(prev => [...prev, data.loja]);
      } else {
        const errData = await res.json().catch(() => ({}));
        if (errData.code === 'PLAN_STORE_LIMIT_EXCEEDED') {
          setErroLimite(errData.error);
          setCarregando(false);
          return;
        }
        // Fallback local
        const localNova = {
          ...formLoja,
          id: `loj_${Date.now()}`,
          status: 'ativa',
          totalTecnicos: 0,
          totalOsAtivas: 0
        };
        setLojasList(prev => [...prev, localNova]);
      }
      setModalNovaLoja(false);
      setFormLoja({
        nomeUnidade: '',
        tipo: 'filial',
        cnpj: '',
        telefoneWhatsapp: '',
        enderecoCompleto: '',
        corIdentificacao: '#06b6d4'
      });
    } catch (err) {
      const localNova = {
        ...formLoja,
        id: `loj_${Date.now()}`,
        status: 'ativa',
        totalTecnicos: 0,
        totalOsAtivas: 0
      };
      setLojasList(prev => [...prev, localNova]);
      setModalNovaLoja(false);
    } finally {
      setCarregando(false);
    }
  };

  const percentualUso = Math.min(100, Math.round((lojasList.length / limiteMaximo) * 100));

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5 font-mono">
              <Store className="w-3 h-3" /> Multi-Unidades
            </span>
            <span className="text-xs text-slate-500 font-mono">v{VERSION}</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            Gestão de Lojas & Filiais
          </h1>
          <p className="text-xs text-slate-400">
            Cadastre filiais, configure telefones de atendimento e alterne o ponto de operação em tempo real
          </p>
        </div>

        <button
          onClick={() => setModalNovaLoja(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-500/20 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Filial</span>
        </button>
      </div>

      {/* Card de Consumo do Plano SaaS */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                Plano {planoNome} Ativo
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  Ativo
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Você está utilizando <strong className="text-white">{lojasList.length}</strong> de <strong className="text-cyan-400">{limiteMaximo} filiais</strong> permitidas no seu plano.
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-mono font-bold text-slate-300">
              {percentualUso}% utilizado
            </span>
          </div>
        </div>

        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-500" 
            style={{ width: `${percentualUso}%` }}
          />
        </div>
      </div>

      {/* Grid de Lojas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lojasList.map((loja) => {
          const isAtiva = loja.id === lojaAtivaId;

          return (
            <div 
              key={loja.id}
              className={`bg-slate-900/80 border rounded-2xl p-6 space-y-5 transition-all relative flex flex-col justify-between ${
                isAtiva 
                  ? 'border-cyan-500/80 shadow-xl shadow-cyan-500/10 bg-slate-900' 
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase font-mono border ${
                    loja.tipo === 'matriz'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  }`}>
                    {loja.tipo}
                  </span>

                  {isAtiva && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      <CheckCircle2 className="w-3 h-3" /> Unidade Ativa
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <span 
                    className="w-3 h-3 rounded-full shrink-0" 
                    style={{ backgroundColor: loja.corIdentificacao || '#06b6d4' }} 
                  />
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {loja.nomeUnidade}
                  </h3>
                </div>

                <div className="space-y-2 mt-4 text-xs text-slate-400">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <span>{loja.enderecoCompleto || 'Endereço não cadastrado'}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                    <span className="font-mono text-slate-300">{loja.telefoneWhatsapp || 'Sem WhatsApp'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  <span className="font-mono text-cyan-400 font-bold">{loja.totalOsAtivas || 0}</span> O.S. ativas
                </div>

                {!isAtiva ? (
                  <button
                    onClick={() => handleSelecionarAtiva(loja.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Ativar no Balcão
                  </button>
                ) : (
                  <span className="text-[11px] font-bold text-cyan-400">
                    Operando agora
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de Nova Filial */}
      {modalNovaLoja && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-white">Cadastrar Nova Filial</h3>
              </div>
              <button
                onClick={() => setModalNovaLoja(false)}
                className="text-slate-400 hover:text-white text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {erroLimite && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{erroLimite}</span>
              </div>
            )}

            <form onSubmit={handleCriarLoja} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome da Filial / Unidade</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Filial Barra Shopping"
                  value={formLoja.nomeUnidade}
                  onChange={(e) => setFormLoja({ ...formLoja, nomeUnidade: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tipo</label>
                  <select
                    value={formLoja.tipo}
                    onChange={(e) => setFormLoja({ ...formLoja, tipo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="filial">Filial</option>
                    <option value="matriz">Matriz</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cor do Crachá</label>
                  <input
                    type="color"
                    value={formLoja.corIdentificacao}
                    onChange={(e) => setFormLoja({ ...formLoja, corIdentificacao: e.target.value })}
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">WhatsApp de Balcão da Filial</label>
                <input
                  type="text"
                  placeholder="(11) 99999-9999"
                  value={formLoja.telefoneWhatsapp}
                  onChange={(e) => setFormLoja({ ...formLoja, telefoneWhatsapp: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Endereço Completo</label>
                <input
                  type="text"
                  placeholder="Av. das Américas, 5000 - Barra da Tijuca, RJ"
                  value={formLoja.enderecoCompleto}
                  onChange={(e) => setFormLoja({ ...formLoja, enderecoCompleto: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalNovaLoja(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={carregando}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50"
                >
                  {carregando ? 'Salvando...' : 'Cadastrar Filial'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
