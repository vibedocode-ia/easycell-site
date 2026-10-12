import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  Fingerprint, 
  Check, 
  Smartphone, 
  User, 
  Phone, 
  FileText, 
  DollarSign, 
  ShieldCheck, 
  Upload, 
  X,
  AlertTriangle,
  Printer,
  MessageSquare
} from 'lucide-react';
import { easyCellStore } from '../../lib/store';

export default function NovaOsPage() {
  const navigate = useNavigate();

  // Dados do Cliente
  const [clienteNome, setClienteNome] = useState('');
  const [clienteWhatsapp, setClienteWhatsapp] = useState('');
  const [clienteCpf, setClienteCpf] = useState('');

  // Dados do Smartphone
  const [aparelhoMarca, setAparelhoMarca] = useState('Apple');
  const [aparelhoModelo, setAparelhoModelo] = useState('');
  const [aparelhoCor, setAparelhoCor] = useState('');
  const [aparelhoImei, setAparelhoImei] = useState('');
  const [defeitoRelatado, setDefeitoRelatado] = useState('');

  // Senha do Aparelho
  const [senhaTipo, setSenhaTipo] = useState('padrao_pontos'); // 'padrao_pontos' | 'pin_numerico'
  const [selectedDots, setSelectedDots] = useState([]);
  const [pinValor, setPinValor] = useState('');

  // Checklist de Hardware
  const [checklist, setChecklist] = useState({
    telaLigando: true,
    touchOk: true,
    cameraFrontal: true,
    cameraTraseira: true,
    conectorCarga: true,
    altoFalante: true,
    microfone: true,
    wifiBluetooth: true,
    biometriaFaceId: true,
    botoesFisicos: true,
    carcacaAvariada: false,
  });

  // Laudo Fotográfico Obrigatório (4 Fotos)
  const [fotos, setFotos] = useState({
    frenteUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
    traseiraUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=80',
    lateraisUrl: 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=600&auto=format&fit=crop&q=80',
    conectorUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80',
  });

  // Financeiro Inicial
  const [valorMaoDeObra, setValorMaoDeObra] = useState(120);
  const [valorAdiantamento, setValorAdiantamento] = useState(0);

  // Modal de Conclusão / Comprovante
  const [modalConcluido, setModalConcluido] = useState(null);

  const toggleChecklist = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleDot = (id) => {
    if (selectedDots.includes(id)) {
      setSelectedDots(selectedDots.filter(d => d !== id));
    } else {
      setSelectedDots([...selectedDots, id]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const novaOs = easyCellStore.createOrder({
      clienteNome,
      clienteWhatsapp,
      clienteCpf,
      aparelhoMarca,
      aparelhoModelo,
      aparelhoCor,
      aparelhoImei,
      senhaTipo,
      senhaValor: senhaTipo === 'padrao_pontos' ? JSON.stringify(selectedDots) : pinValor,
      defeitoRelatado,
      laudoFotos: fotos,
      checklistEntrada: checklist,
      valorMaoDeObra: valorMaoDeObra * 100,
      valorPecas: 0,
      valorAdiantamento: valorAdiantamento * 100,
      termoAssinado: true,
    });

    setModalConcluido(novaOs);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-[10px] font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Blindagem Jurídica de Balcão</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Abertura de O.S. Blindada (Meta: &lt; 90s)</h1>
          <p className="text-xs text-slate-400 mt-0.5">Cadastre o cliente, registre o laudo de 4 fotos e salve a senha em padrão 3x3.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bloco 1: Cliente e Aparelho */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dados do Cliente */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <User className="w-4 h-4" />
              <span>1. Dados do Cliente</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nome Completo *</label>
              <input
                type="text"
                required
                value={clienteNome}
                onChange={(e) => setClienteNome(e.target.value)}
                placeholder="Ex: Carlos Eduardo Mendes"
                className="w-full bg-slate-950/90 text-white placeholder-slate-500 px-4 py-2.5 rounded-xl text-xs border border-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">WhatsApp *</label>
                <input
                  type="text"
                  required
                  value={clienteWhatsapp}
                  onChange={(e) => setClienteWhatsapp(e.target.value)}
                  placeholder="21 99999-9999"
                  className="w-full bg-slate-950/90 text-white placeholder-slate-500 px-4 py-2.5 rounded-xl text-xs border border-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">CPF (Opcional)</label>
                <input
                  type="text"
                  value={clienteCpf}
                  onChange={(e) => setClienteCpf(e.target.value)}
                  placeholder="000.000.000-00"
                  className="w-full bg-slate-950/90 text-white placeholder-slate-500 px-4 py-2.5 rounded-xl text-xs border border-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Dados do Smartphone */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Smartphone className="w-4 h-4" />
              <span>2. Aparelho em Atendimento</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Marca *</label>
                <select
                  value={aparelhoMarca}
                  onChange={(e) => setAparelhoMarca(e.target.value)}
                  className="w-full bg-slate-950/90 text-white px-3 py-2.5 rounded-xl text-xs border border-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-medium"
                >
                  <option value="Apple">Apple</option>
                  <option value="Samsung">Samsung</option>
                  <option value="Xiaomi">Xiaomi</option>
                  <option value="Motorola">Motorola</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Modelo *</label>
                <input
                  type="text"
                  required
                  value={aparelhoModelo}
                  onChange={(e) => setAparelhoModelo(e.target.value)}
                  placeholder="Ex: iPhone 13 Pro"
                  className="w-full bg-slate-950/90 text-white placeholder-slate-500 px-4 py-2.5 rounded-xl text-xs border border-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cor</label>
                <input
                  type="text"
                  value={aparelhoCor}
                  onChange={(e) => setAparelhoCor(e.target.value)}
                  placeholder="Ex: Grafite"
                  className="w-full bg-slate-950/90 text-white placeholder-slate-500 px-4 py-2.5 rounded-xl text-xs border border-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">IMEI / Serial</label>
                <input
                  type="text"
                  value={aparelhoImei}
                  onChange={(e) => setAparelhoImei(e.target.value)}
                  placeholder="15 dígitos (*#06#)"
                  className="w-full bg-slate-950/90 text-white placeholder-slate-500 px-4 py-2.5 rounded-xl text-xs border border-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Defeito Relatado pelo Cliente *</label>
              <textarea
                required
                rows={2}
                value={defeitoRelatado}
                onChange={(e) => setDefeitoRelatado(e.target.value)}
                placeholder="Ex: Não carrega no conector e display piscando após tombo"
                className="w-full bg-slate-950/90 text-white placeholder-slate-500 px-4 py-2 rounded-xl text-xs border border-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Bloco 2: Senha de Desenho 3x3 e Checklist Funcional */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Componente de Senha Padrão 3x3 */}
          <div className="md:col-span-5 glass-panel p-6 rounded-3xl border border-cyan-500/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Fingerprint className="w-4 h-4" />
                <span>3. Senha do Celular</span>
              </div>
              <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800 text-[10px]">
                <button
                  type="button"
                  onClick={() => setSenhaTipo('padrao_pontos')}
                  className={`px-2 py-1 rounded font-bold transition-all ${senhaTipo === 'padrao_pontos' ? 'bg-cyan-500 text-black' : 'text-slate-400'}`}
                >
                  Padrão 3x3
                </button>
                <button
                  type="button"
                  onClick={() => setSenhaTipo('pin_numerico')}
                  className={`px-2 py-1 rounded font-bold transition-all ${senhaTipo === 'pin_numerico' ? 'bg-cyan-500 text-black' : 'text-slate-400'}`}
                >
                  PIN / Texto
                </button>
              </div>
            </div>

            {senhaTipo === 'padrao_pontos' ? (
              <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800 text-center">
                <div className="w-52 h-52 mx-auto grid grid-cols-3 gap-4 place-items-center my-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((dot) => {
                    const isSelected = selectedDots.includes(dot);
                    return (
                      <button
                        type="button"
                        key={dot}
                        onClick={() => toggleDot(dot)}
                        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-gradient-to-tr from-cyan-400 to-blue-500 shadow-md shadow-cyan-500/50 scale-110' 
                            : 'bg-slate-800 hover:bg-slate-700'
                        }`}
                      >
                        <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-black' : 'bg-slate-500'}`} />
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 mt-2 font-mono">
                  <span>Sequência: [{selectedDots.join(' → ')}]</span>
                  <button
                    type="button"
                    onClick={() => setSelectedDots([])}
                    className="text-rose-400 hover:underline"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Código PIN ou Senha</label>
                <input
                  type="text"
                  value={pinValor}
                  onChange={(e) => setPinValor(e.target.value)}
                  placeholder="Ex: 2468 ou senha alfanumérica"
                  className="w-full bg-slate-950/90 text-white placeholder-slate-500 px-4 py-3 rounded-xl text-sm border border-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
                />
              </div>
            )}
          </div>

          {/* Checklist de Hardware */}
          <div className="md:col-span-7 glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Check className="w-4 h-4" />
                <span>4. Checklist Funcional de Entrada</span>
              </div>
              <span className="text-[10px] text-slate-400">Toque para alternar status</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              {[
                { key: 'telaLigando', label: 'Tela Ligando' },
                { key: 'touchOk', label: 'Touch Funcionando' },
                { key: 'cameraFrontal', label: 'Câmera Frontal' },
                { key: 'cameraTraseira', label: 'Câmera Traseira' },
                { key: 'conectorCarga', label: 'Conector Carga' },
                { key: 'altoFalante', label: 'Som / Áudio' },
                { key: 'microfone', label: 'Microfone' },
                { key: 'wifiBluetooth', label: 'Wi-Fi / BT' },
                { key: 'biometriaFaceId', label: 'Biometria / Face' },
                { key: 'botoesFisicos', label: 'Botões Físicos' },
                { key: 'carcacaAvariada', label: 'Carcaça Avariada' },
              ].map((item) => {
                const isOk = checklist[item.key];
                return (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => toggleChecklist(item.key)}
                    className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isOk
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                    }`}
                  >
                    <span className="font-semibold truncate">{item.label}</span>
                    <span className="text-[10px] font-bold font-mono">
                      {isOk ? 'OK' : 'DEFEITO'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bloco 3: Laudo Fotográfico Compulsório (4 Fotos) */}
        <div className="glass-panel p-6 rounded-3xl border border-cyan-500/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Camera className="w-4 h-4" />
              <span>5. Laudo Fotográfico de Entrada (Blindagem Contra Danos Prévios)</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 font-mono">
              <Check className="w-3.5 h-3.5" /> 4 fotos anexadas
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { key: 'frenteUrl', label: '1. Frontal / Display', src: fotos.frenteUrl },
              { key: 'traseiraUrl', label: '2. Tampa Traseira', src: fotos.traseiraUrl },
              { key: 'lateraisUrl', label: '3. Laterais / Quinas', src: fotos.lateraisUrl },
              { key: 'conectorUrl', label: '4. Conector / Fundo', src: fotos.conectorUrl },
            ].map((f) => (
              <div key={f.key} className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-300">{f.label}</span>
                <div className="relative aspect-square rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 group">
                  <img src={f.src} alt={f.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <span className="px-2 py-1 rounded bg-cyan-500 text-black text-[10px] font-bold">Ver Zoom</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bloco 4: Valores & Submissão */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-xs text-slate-400 font-semibold block">Mão de Obra Estimada</span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm font-bold text-slate-400">R$</span>
                <input
                  type="number"
                  value={valorMaoDeObra}
                  onChange={(e) => setValorMaoDeObra(Number(e.target.value))}
                  className="w-24 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-700 text-sm font-bold font-mono text-cyan-400"
                />
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-semibold block">Adiantamento Pago</span>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-sm font-bold text-slate-400">R$</span>
                <input
                  type="number"
                  value={valorAdiantamento}
                  onChange={(e) => setValorAdiantamento(Number(e.target.value))}
                  className="w-24 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-700 text-sm font-bold font-mono text-emerald-400"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm transition-all shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Emitir O.S. Blindada e Gerar Recibo</span>
          </button>
        </div>
      </form>

      {/* MODAL DE SUCESSO / RECIBO TÉRMICO */}
      {modalConcluido && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel max-w-lg w-full p-8 rounded-3xl border border-cyan-400/50 space-y-6 shadow-2xl relative">
            <button
              onClick={() => navigate('/system/os')}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">O.S. #{modalConcluido.numeroOs} Aberta com Sucesso!</h3>
              <p className="text-xs text-slate-300">
                Aparelho blindado com 4 fotos, checklist funcional e senha registrados no sistema.
              </p>
            </div>

            {/* Recibo Térmico Preview */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 font-mono text-xs space-y-2 text-slate-300">
              <div className="text-center border-b border-slate-800 pb-2">
                <div className="font-bold text-white text-sm">EASYCELL ASSISTÊNCIA TÉCNICA</div>
                <div className="text-[10px] text-slate-500">COMPROVANTE DE ENTRADA • O.S. #{modalConcluido.numeroOs}</div>
              </div>
              <div className="flex justify-between">
                <span>Cliente:</span>
                <span className="text-white font-bold">{modalConcluido.clienteNome}</span>
              </div>
              <div className="flex justify-between">
                <span>Aparelho:</span>
                <span className="text-white">{modalConcluido.aparelhoMarca} {modalConcluido.aparelhoModelo}</span>
              </div>
              <div className="flex justify-between">
                <span>IMEI:</span>
                <span>{modalConcluido.aparelhoImei || 'Não inf.'}</span>
              </div>
              <div className="flex justify-between">
                <span>Senha:</span>
                <span className="text-cyan-400 font-bold">{modalConcluido.senhaTipo === 'padrao_pontos' ? 'Padrão 3x3 Registrado' : modalConcluido.senhaValor}</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex justify-between text-cyan-300 font-bold">
                <span>Total Estimado:</span>
                <span>R$ {((modalConcluido.valorTotal || 0) / 100).toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Térmica</span>
              </button>
              <a
                href={`https://wa.me/55${modalConcluido.clienteWhatsapp.replace(/\D/g, '')}?text=Olá%20${encodeURIComponent(modalConcluido.clienteNome)},%20sua%20O.S.%20%23${modalConcluido.numeroOs}%20do%20${encodeURIComponent(modalConcluido.aparelhoModelo)}%20foi%20aberta%20com%20sucesso%20na%20EasyCell!`}
                target="_blank"
                rel="noreferrer"
                className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Enviar WhatsApp</span>
              </a>
            </div>

            <button
              onClick={() => navigate('/system/os')}
              className="w-full py-3 rounded-xl bg-cyan-500 text-black font-bold text-xs"
            >
              Ir para o Quadro de O.S. (Kanban)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
