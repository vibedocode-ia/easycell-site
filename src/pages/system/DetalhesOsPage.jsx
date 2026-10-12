import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import { 
  ArrowLeft, 
  Smartphone, 
  User, 
  Camera, 
  Fingerprint, 
  Check, 
  Plus, 
  Trash2, 
  Printer, 
  MessageSquare, 
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Package,
  FileText,
  Download,
  Users,
  X
} from 'lucide-react';
import { easyCellStore } from '../../lib/store';

export default function DetalhesOsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ordem, setOrdem] = useState(null);
  const [stock, setStock] = useState([]);

  // Adição de Peças / Mão de Obra
  const [selectedStockId, setSelectedStockId] = useState('');
  const [qtdPeca, setQtdPeca] = useState(1);

  // Modal de Quitação
  const [modalQuitacao, setModalQuitacao] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState('PIX');

  // Fase 2: Laudo Pericial em PDF A4
  const [modalLaudoPdf, setModalLaudoPdf] = useState(false);
  const [laudoGerando, setLaudoGerando] = useState(false);
  const [tecnicoSelecionado, setTecnicoSelecionado] = useState('');

  useEffect(() => {
    const o = easyCellStore.getOrderById(id);
    if (o) {
      setOrdem(o);
    }
    setStock(easyCellStore.getStock());
  }, [id]);

  if (!ordem) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-bold text-white">Ordem de Serviço não encontrada</h2>
        <NavLink to="/system/os" className="text-xs text-cyan-400 hover:underline">
          Voltar para lista de Ordens
        </NavLink>
      </div>
    );
  }

  const handleAddStockItem = (e) => {
    e.preventDefault();
    if (!selectedStockId) return;

    const itemObj = stock.find(s => s.id === selectedStockId);
    if (!itemObj) return;

    if (itemObj.quantidade < qtdPeca && itemObj.tipo !== 'servico') {
      alert('Quantidade em estoque insuficiente!');
      return;
    }

    easyCellStore.addItemToOrder(ordem.id, {
      itemId: itemObj.id,
      descricao: itemObj.nome,
      valorUnitario: itemObj.precoVenda,
      quantidade: qtdPeca,
      garantiaDias: 90
    });

    // Atualiza estado local
    setOrdem(easyCellStore.getOrderById(id));
    setStock(easyCellStore.getStock());
    setSelectedStockId('');
    setQtdPeca(1);
  };

  const handleQuitar = () => {
    easyCellStore.payAndCloseOrder(ordem.id, formaPagamento);
    // Calcula comissão do técnico ao quitar
    easyCellStore.calculateCommission(ordem.id, 35);
    setOrdem(easyCellStore.getOrderById(id));
    setModalQuitacao(false);
  };

  const handleGerarLaudo = () => {
    setLaudoGerando(true);
    setTimeout(() => {
      const updated = easyCellStore.generateLaudoPdf(ordem.id);
      if (updated) {
        setOrdem(updated);
      }
      setLaudoGerando(false);
      setModalLaudoPdf(true);
    }, 500);
  };

  const dotsArray = ordem.senhaTipo === 'padrao_pontos' && ordem.senhaValor
    ? JSON.parse(ordem.senhaValor)
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/system/os')}
            className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-white font-mono">
                O.S. #{ordem.numeroOs}
              </h1>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/40 uppercase">
                {ordem.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Entrada em: {new Date(ordem.criadoEm).toLocaleString('pt-BR')} • Cliente: <strong>{ordem.clienteNome}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleGerarLaudo}
            disabled={laudoGerando}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 font-bold text-xs transition-all shadow-md shadow-cyan-500/10 cursor-pointer active:scale-95"
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>{laudoGerando ? 'Compilando...' : 'Laudo PDF (SHA-256)'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Térmica</span>
          </button>

          <a
            href={`https://wa.me/55${ordem.clienteWhatsapp.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(ordem.clienteNome)},%20sua%20O.S.%20%23${ordem.numeroOs}%20está%20com%20status:%20${encodeURIComponent(ordem.status)}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-500/20"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp</span>
          </a>

          {ordem.status !== 'entregue_pago' ? (
            <button
              onClick={() => setModalQuitacao(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-500/30 cursor-pointer active:scale-95"
            >
              <DollarSign className="w-4 h-4" />
              <span>Receber & Entregar</span>
            </button>
          ) : (
            <span className="px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5 font-mono">
              <CheckCircle2 className="w-4 h-4" /> Pago via {ordem.formaPagamento}
            </span>
          )}
        </div>
      </div>

      {/* Grid Principal: Bancada Técnica */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Coluna Esquerda: Dados, Senha & Laudo Fotográfico */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card do Aparelho & Defeito */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Smartphone className="w-4 h-4" />
                <span>Dados do Dispositivo em Bancada</span>
              </div>
              <span className="text-xs font-mono text-slate-400">IMEI: {ordem.aparelhoImei || 'Não cadastrado'}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Marca / Modelo:</span>
                <span className="text-white font-bold text-sm">{ordem.aparelhoMarca} {ordem.aparelhoModelo}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Cor do Aparelho:</span>
                <span className="text-white font-bold">{ordem.aparelhoCor || 'Padrão'}</span>
              </div>
              <div className="col-span-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 block text-[11px] font-semibold mb-1">Defeito Informado pelo Cliente:</span>
                <p className="text-slate-200 text-xs leading-relaxed">{ordem.defeitoRelatado}</p>
              </div>

              {/* Fase 2: Atribuição de Técnico & Comissão */}
              <div className="col-span-2 flex items-center justify-between p-3 bg-slate-950/90 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-slate-300 font-semibold">Técnico da Bancada:</span>
                </div>
                <select
                  value={ordem.tecnicoNome || 'Carlos Alexandre Silva'}
                  onChange={(e) => {
                    easyCellStore.assignTechnician(ordem.id, 'tec_1', e.target.value);
                    setOrdem({ ...ordem, tecnicoNome: e.target.value });
                  }}
                  className="bg-slate-900 border border-slate-700 text-xs text-cyan-300 font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-400 font-sans cursor-pointer"
                >
                  <option value="Carlos Alexandre Silva">Carlos Alexandre Silva (35% comissão)</option>
                  <option value="Mariana Duarte Souza">Mariana Duarte Souza (30% comissão)</option>
                  <option value="Felipe Santos Oliveira">Felipe Santos Oliveira (25% comissão)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Desbloqueio da Bancada: Reprodução do Padrão de Senha 3x3 */}
          <div className="glass-panel p-6 rounded-3xl border border-cyan-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Fingerprint className="w-4 h-4" />
                <span>Senha do Aparelho para Desbloqueio</span>
              </div>
              <span className="text-[10px] text-cyan-300 font-mono">Consulte na bancada</span>
            </div>

            {ordem.senhaTipo === 'padrao_pontos' ? (
              <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-950/90 p-4 rounded-2xl border border-slate-800">
                <div className="w-44 h-44 grid grid-cols-3 gap-3 place-items-center">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((dot) => {
                    const isSelected = dotsArray.includes(dot);
                    const orderIndex = dotsArray.indexOf(dot);
                    return (
                      <div
                        key={dot}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                          isSelected
                            ? 'bg-gradient-to-tr from-cyan-400 to-blue-500 text-black shadow-lg shadow-cyan-500/50 scale-110'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isSelected ? orderIndex + 1 : ''}
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-2 text-xs">
                  <div className="font-bold text-white">Sequência do Padrão:</div>
                  <div className="font-mono text-cyan-300 text-sm">
                    {dotsArray.length > 0 ? dotsArray.join(' ➔ ') : 'Nenhum ponto registrado'}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Siga os números na ordem indicada acima para destravar o celular.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-lg text-cyan-400 font-bold">
                PIN: {ordem.senhaValor}
              </div>
            )}
          </div>

          {/* Laudo Fotográfico com Zoom */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Camera className="w-4 h-4" />
              <span>Laudo Fotográfico da Entrada (Prova Jurídica)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Frontal', src: ordem.laudoFotos?.frenteUrl },
                { label: 'Traseira', src: ordem.laudoFotos?.traseiraUrl },
                { label: 'Laterais', src: ordem.laudoFotos?.lateraisUrl },
                { label: 'Conector', src: ordem.laudoFotos?.conectorUrl },
              ].map((f, i) => (
                <div key={i} className="space-y-1">
                  <span className="text-[10px] text-slate-400 font-semibold">{f.label}</span>
                  <a href={f.src} target="_blank" rel="noreferrer" className="block aspect-square rounded-xl overflow-hidden border border-slate-700 bg-slate-950 group">
                    <img src={f.src} alt={f.label} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna Direita: Peças, Mão de Obra e Fechamento */}
        <div className="lg:col-span-5 space-y-6">
          {/* Adicionar Peças / Serviços da Bancada */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Package className="w-4 h-4" />
              <span>Peças e Serviços Aplicados</span>
            </div>

            {ordem.status !== 'entregue_pago' && (
              <form onSubmit={handleAddStockItem} className="space-y-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Selecione Peça ou Serviço</label>
                  <select
                    value={selectedStockId}
                    onChange={(e) => setSelectedStockId(e.target.value)}
                    className="w-full bg-slate-900 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  >
                    <option value="">-- Escolher do Estoque --</option>
                    {stock.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.nome} • R$ {(st.precoVenda / 100).toFixed(2)} (Qtd: {st.quantidade})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">Qtd:</span>
                    <input
                      type="number"
                      min="1"
                      value={qtdPeca}
                      onChange={(e) => setQtdPeca(Number(e.target.value))}
                      className="w-16 bg-slate-900 text-white text-xs px-2 py-1.5 rounded-lg border border-slate-700"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Lançar & Baixar Estoque</span>
                  </button>
                </div>
              </form>
            )}

            {/* Lista de Peças na O.S. */}
            <div className="space-y-2">
              {(ordem.itens || []).map((it, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-850 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-white font-bold">{it.descricao}</div>
                    <div className="text-[10px] text-slate-500">Garantia: {it.garantiaDias} dias • Qtd: {it.quantidade}</div>
                  </div>
                  <div className="font-mono text-cyan-400 font-bold">
                    R$ {((it.valorUnitario * it.quantidade) / 100).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Totalizadores Financeiros */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Peças:</span>
                <span>R$ {((ordem.valorPecas || 0) / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Mão de Obra:</span>
                <span>R$ {((ordem.valorMaoDeObra || 0) / 100).toFixed(2)}</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between text-white font-bold text-sm">
                <span>TOTAL A PAGAR:</span>
                <span className="text-cyan-400">R$ {((ordem.valorTotal || 0) / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE QUITAÇÃO & PAGAMENTO */}
      {modalQuitacao && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl border border-cyan-400/50 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Quitação da O.S. #{ordem.numeroOs}</h3>
            <p className="text-xs text-slate-300">
              Valor Total a ser recebido: <strong>R$ {((ordem.valorTotal || 0) / 100).toFixed(2)}</strong>
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Forma de Pagamento:</label>
              <div className="grid grid-cols-3 gap-2">
                {['PIX', 'CARTÃO', 'DINHEIRO'].map((metodo) => (
                  <button
                    key={metodo}
                    type="button"
                    onClick={() => setFormaPagamento(metodo)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      formaPagamento === metodo
                        ? 'bg-cyan-500 text-black border-cyan-400 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-900 text-slate-300 border-slate-800'
                    }`}
                  >
                    {metodo}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalQuitacao(false)}
                className="py-3 rounded-xl bg-slate-800 text-white text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleQuitar}
                className="py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-black text-xs font-black"
              >
                Confirmar Recebimento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Laudo Pericial Oficial em PDF A4 */}
      {modalLaudoPdf && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Laudo Pericial Oficial A4
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      SHA-256 Autenticado
                    </span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">Documento emitido conforme Art. 26 do CDC</span>
                </div>
              </div>
              <button
                onClick={() => setModalLaudoPdf(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Documento Estilo A4 */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-xs space-y-5 text-slate-300 font-sans shadow-inner">
              <div className="flex justify-between items-start pb-4 border-b border-slate-800">
                <div>
                  <span className="text-lg font-black text-white block font-mono">EasyCell Smartphone Lab</span>
                  <span className="text-[11px] text-slate-400 block">CNPJ: 12.345.678/0001-90 • Av. Paulista, 1000 - SP</span>
                  <span className="text-[11px] text-slate-400 block">Tel/WhatsApp Oficial: (11) 99876-5432</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs font-bold text-cyan-400 block">LAUDO TÉCNICO #{ordem.numeroOs}</span>
                  <span className="text-[11px] text-slate-500 block">{new Date().toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              {/* Dados do Aparelho */}
              <div className="grid grid-cols-2 gap-3 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Cliente</span>
                  <span className="text-xs font-bold text-white">{ordem.clienteNome}</span>
                  <span className="text-[11px] text-slate-400 font-mono block">{ordem.clienteWhatsapp}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Aparelho & Rastreio</span>
                  <span className="text-xs font-bold text-white">{ordem.aparelhoMarca} {ordem.aparelhoModelo}</span>
                  <span className="text-[11px] text-slate-400 font-mono block">IMEI: {ordem.aparelhoImei || 'Registrado'}</span>
                </div>
              </div>

              {/* Mini Galeria de Fotos */}
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-400 block mb-2">
                  Laudo Fotográfico Compulsório (Danos Pré-existentes)
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {['frenteUrl', 'traseiraUrl', 'lateraisUrl', 'conectorUrl'].map((k) => (
                    <div key={k} className="aspect-square bg-slate-900 rounded border border-slate-800 overflow-hidden relative">
                      {ordem.laudoFotos?.[k] ? (
                        <img src={ordem.laudoFotos[k]} alt={k} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-600">Sem foto</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Termos de Garantia */}
              <div className="text-[10px] text-slate-400 leading-relaxed border-t border-slate-800 pt-3">
                <p>
                  <strong>Garantia Legal:</strong> 90 (noventa) dias para peças substituídas e serviços executados (Art. 26 CDC). 
                  A garantia não cobre avarias decorrentes de líquidos, choques mecânicos, quebras ou violação de lacre.
                </p>
              </div>

              {/* Hash Criptográfico SHA-256 */}
              <div className="p-3 bg-slate-900/90 rounded-lg border border-cyan-500/30 font-mono">
                <span className="text-[10px] text-cyan-400 font-bold block mb-0.5">
                  Assinatura Digital & Hash de Autenticidade (SHA-256):
                </span>
                <span className="text-[10px] text-slate-300 break-all select-all">
                  {ordem.laudoPdfHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setModalLaudoPdf(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Baixar / Imprimir PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
