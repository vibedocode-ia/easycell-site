import React, { useState } from 'react';
import { 
  Settings, 
  Store, 
  Scale, 
  Key, 
  Save, 
  Copy, 
  Check, 
  ShieldCheck, 
  HelpCircle,
  FileText,
  Upload,
  Globe
} from 'lucide-react';

export default function ConfiguracoesPage() {
  const [copiedKey, setCopiedKey] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  const [formData, setFormData] = useState({
    razaoSocial: 'EasyCell Assistência Técnica Especializada Ltda',
    nomeFantasia: 'EasyCell Smartphone Lab',
    cnpj: '12.345.678/0001-90',
    telefone: '(11) 99876-5432',
    endereco: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
    logoUrl: '',
    garantiaDiasPadrao: '90',
    termoGarantiaTexto: `Garantia legal de 90 (noventa) dias para peças substituídas e serviços executados, nos termos do Art. 26 do Código de Defesa do Consumidor. A garantia cobre exclusivamente o componente reparado e não abrange danos causados por quedas posteriores, oxidação/contato com líquidos, choque elétrico ou intervenção técnica não autorizada por terceiros.`,
    termoAbandonoTexto: `Em conformidade com os artigos 1.275 e 1.276 do Código Civil Brasileiro, os aparelhos reparados ou com orçamento recusado não retirados pelo cliente no prazo de 90 (noventa) dias após notificação expressa via WhatsApp/SMS serão considerados abandonados para fins de custeio de armazenagem e descarte ecologicamente correto.`,
    apiKeyMasked: '••••••••••••••••••••••••••••••••'
  });

  const handleCopyKey = () => {
    navigator.clipboard.writeText('Bearer configurado_em_variavel_de_ambiente');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
              Configurações Gerais & Jurídicas
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono font-normal">
                Fase 2
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Personalização da loja, cláusulas legais dos laudos periciais e chaves de integração da API
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 active:scale-95"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Alterações</span>
        </button>
      </div>

      {savedFeedback && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Configurações atualizadas com sucesso! Os próximos laudos e recibos já utilizarão esses dados.</span>
        </div>
      )}

      {/* Formulário Principal */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Bloco 1: Dados da Loja */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Store className="w-4 h-4 text-cyan-400" />
            Identificação da Assistência Técnica (Cabeçalho do Laudo)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Razão Social</label>
              <input
                type="text"
                value={formData.razaoSocial}
                onChange={(e) => setFormData({ ...formData, razaoSocial: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Nome Fantasia</label>
              <input
                type="text"
                value={formData.nomeFantasia}
                onChange={(e) => setFormData({ ...formData, nomeFantasia: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">CNPJ</label>
              <input
                type="text"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">WhatsApp / Telefone Oficial</label>
              <input
                type="text"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1">Endereço Completo</label>
              <input
                type="text"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Bloco 2: Termos Jurídicos e Blindagem */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              Termos Jurídicos & Blindagem Documental
            </h2>
            <span className="text-xs text-slate-400 font-mono">Impresso no Laudo e Recibo</span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Cláusula de Garantia Legal (Art. 26 CDC)
                </label>
                <span className="text-[11px] text-emerald-400 font-mono">Padrão: 90 dias</span>
              </div>
              <textarea
                rows={3}
                value={formData.termoGarantiaTexto}
                onChange={(e) => setFormData({ ...formData, termoGarantiaTexto: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 leading-relaxed focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Política de Aparelhos Não Retirados (Art. 1.275 Código Civil)
              </label>
              <textarea
                rows={3}
                value={formData.termoAbandonoTexto}
                onChange={(e) => setFormData({ ...formData, termoAbandonoTexto: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 leading-relaxed focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Bloco 3: API & Integração com SofIA */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            Parâmetros de Integração da API & SofIA
          </h2>

          <div className="space-y-3 font-mono text-xs">
            <div>
              <label className="text-[11px] font-sans text-slate-400 block mb-1">URL Base da API Backend</label>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-cyan-400 flex items-center justify-between">
                <span>https://easycell.vibedocode.pro</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Online
                </span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-sans text-slate-400 block mb-1">Chave de API do EasyCell (Bearer Token)</label>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 flex items-center justify-between">
                <span>••••••••••••••••••••••••••••••••</span>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] flex items-center gap-1 transition"
                >
                  {copiedKey ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedKey ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-sans text-slate-400 block mb-1">Webhook Inbound Cadastrado no SofIA</label>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-400">
                https://easycell.vibedocode.pro/api/v1/whatsapp/webhook
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
