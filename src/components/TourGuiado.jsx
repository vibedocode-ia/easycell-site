import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  X, 
  HelpCircle, 
  PlusCircle, 
  Kanban, 
  Store, 
  Users, 
  Bot, 
  Package, 
  DollarSign, 
  CreditCard, 
  Trash2, 
  Compass
} from 'lucide-react';
import { easyCellStore } from '../lib/store';

const TOUR_STORAGE_KEY = 'easycell_tour_completed';

export const TOUR_STEPS = [
  {
    target: 'center',
    title: 'Bem-vindo ao EasyCell! 📱',
    badge: 'Início',
    icon: Compass,
    content: 'Preparamos este guia rápido interativo para você dominar as principais ferramentas do seu sistema de gestão para assistência técnica de smartphones em menos de 2 minutos.',
    dica: 'Você pode rever este tutorial a qualquer momento pelo botão no topo ou no menu lateral.'
  },
  {
    target: '[data-tour="nova-os"]',
    title: 'Nova O.S. Blindada (Balcão)',
    badge: 'Agilidade',
    icon: PlusCircle,
    content: 'Abra ordens de serviço completas em 90 segundos: checklist de entrada com 11 itens, registro fotográfico em 4 ângulos, senha em padrão de desenho 3x3 ou PIN numérico e laudo pericial de entrada com QR Code.',
    dica: 'Reduz contestações de clientes em 98% ao registrar avarias prévias de carcaça e tela.'
  },
  {
    target: '[data-tour="ordens-kanban"]',
    title: 'Ordens & Kanban de Bancada',
    badge: 'Fluxo Visual',
    icon: Kanban,
    content: 'Acompanhe visualmente cada aparelho em tempo real entre as fases da assistência: Em Análise, Orçamento Pendente, Na Bancada, Pronto p/ Retirada e Finalizado.',
    dica: 'Arraste os cards entre as colunas para atualizar o status e acionar notificações automáticas.'
  },
  {
    target: '[data-tour="filiais-lojas"]',
    title: 'Filiais & Lojas (Multi-loja)',
    badge: 'Expansão',
    icon: Store,
    content: 'Gerencie sua loja matriz e todas as suas filiais em um único sistema, com estoques independentes e relatórios unificados. Alterne de loja pelo seletor no topo da tela.',
    dica: 'Cada loja possui seu próprio endereço, WhatsApp de atendimento e equipe técnica.'
  },
  {
    target: '[data-tour="tecnicos-comissoes"]',
    title: 'Técnicos & Comissões',
    badge: 'Equipe',
    icon: Users,
    content: 'Cadastre seus técnicos de bancada, atribua responsáveis para cada ordem de serviço e automatize o cálculo de comissões por produtividade e reparos entregues.',
    dica: 'Elimine planilhas manuais no fechamento de comissões do final do mês.'
  },
  {
    target: '[data-tour="automacoes-whatsapp"]',
    title: 'Automações WhatsApp (SofIA)',
    badge: 'SofIA IA',
    icon: Bot,
    content: 'Disparo de mensagens automáticas no WhatsApp do cliente quando o aparelho dá entrada, quando o orçamento fica pronto e quando está finalizado para retirada, com link de aprovação com 1 clique.',
    dica: 'Clientes aprovam orçamentos 3x mais rápido direto pelo smartphone.'
  },
  {
    target: '[data-tour="estoque-triplo"]',
    title: 'Estoque Triplo Integrado',
    badge: 'Inventário',
    icon: Package,
    content: 'Controle inteligente de 3 vias: Peças de reposição (com alertas de estoque mínimo), Serviços/Mão de Obra e Aparelhos Seminovos rastreados pelo número de IMEI.',
    dica: 'O abate de peças do estoque é automático ao vincular itens na Ordem de Serviço.'
  },
  {
    target: '[data-tour="frente-caixa"]',
    title: 'Frente de Caixa (PDV)',
    badge: 'Financeiro',
    icon: DollarSign,
    content: 'Controle de abertura de turno, sangrias, suprimentos e fechamento diário de caixa. Todas as quitações de O.S. entram automaticamente no fluxo financeiro.',
    dica: 'Conferência facilitada de entradas em Dinheiro, Cartão e PIX.'
  },
  {
    target: '[data-tour="minha-assinatura"]',
    title: 'Minha Assinatura & Suporte',
    badge: 'Plano SaaS',
    icon: CreditCard,
    content: 'Gerencie seu plano EasyCell, faça upgrade instantâneo sem perda de dados e acione nossa central de chamados técnicos com SLA garantido direto no painel.',
    dica: 'Suporte dedicado via chat e histórico completo de atendimentos.'
  },
  {
    target: 'center',
    title: 'Tudo Pronto para Começar! 🚀',
    badge: 'Conclusão',
    icon: Sparkles,
    content: 'Você já conhece todo o sistema! O painel contém alguns dados de exemplo (marcados com DEMO) para você testar. Quando quiser, você pode apagá-los e iniciar o seu balcão com o sistema 100% limpo.',
    dica: 'Deseja começar com o sistema limpo agora ou manter os dados de demonstração?'
  }
];

export default function TourGuiado() {
  const [ativo, setAtivo] = useState(false);
  const [passoAtual, setPassoAtual] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const tooltipRef = useRef(null);

  // Escuta evento customizado para reabrir o tour a qualquer momento
  useEffect(() => {
    const handleAbrir = () => {
      setPassoAtual(0);
      setAtivo(true);
    };

    window.addEventListener('easycell_open_tour', handleAbrir);

    // Disparo automático na primeira vez
    const tourJaVisto = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!tourJaVisto) {
      const timer = setTimeout(() => {
        setPassoAtual(0);
        setAtivo(true);
      }, 700);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('easycell_open_tour', handleAbrir);
      };
    }

    return () => {
      window.removeEventListener('easycell_open_tour', handleAbrir);
    };
  }, []);

  // Monitora dados demonstrativos
  useEffect(() => {
    const checarDemo = () => setIsDemo(easyCellStore.isDemoActive());
    checarDemo();
    window.addEventListener('easycell_store_updated', checarDemo);
    window.addEventListener('easycell_demo_cleared', checarDemo);
    return () => {
      window.removeEventListener('easycell_store_updated', checarDemo);
      window.removeEventListener('easycell_demo_cleared', checarDemo);
    };
  }, []);

  // Calcula posição do elemento alvo
  useEffect(() => {
    if (!ativo) return;

    const passo = TOUR_STEPS[passoAtual];
    if (passo.target === 'center') {
      setTargetRect(null);
      return;
    }

    const elemento = document.querySelector(passo.target);
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const rect = elemento.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }

    const handleResize = () => {
      if (passo.target !== 'center') {
        const el = document.querySelector(passo.target);
        if (el) setTargetRect(el.getBoundingClientRect());
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [ativo, passoAtual]);

  // Teclas de atalho (Esc para fechar, setas para navegar)
  useEffect(() => {
    if (!ativo) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') fecharTour();
      if (e.key === 'ArrowRight' && passoAtual < TOUR_STEPS.length - 1) proximo();
      if (e.key === 'ArrowLeft' && passoAtual > 0) anterior();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [ativo, passoAtual]);

  const fecharTour = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setAtivo(false);
  };

  const proximo = () => {
    if (passoAtual < TOUR_STEPS.length - 1) {
      setPassoAtual(prev => prev + 1);
    } else {
      fecharTour();
    }
  };

  const anterior = () => {
    if (passoAtual > 0) {
      setPassoAtual(prev => prev - 1);
    }
  };

  const limparDemoEConcluir = () => {
    easyCellStore.clearDemoData();
    fecharTour();
  };

  if (!ativo) return null;

  const passo = TOUR_STEPS[passoAtual];
  const StepIcon = passo.icon || Compass;
  const isLast = passoAtual === TOUR_STEPS.length - 1;
  const progressPercent = ((passoAtual + 1) / TOUR_STEPS.length) * 100;

  // Posição calculada para o tooltip
  let tooltipStyle = {};
  if (targetRect) {
    const isDesktop = window.innerWidth >= 768;
    if (isDesktop) {
      // Posiciona à direita da Sidebar
      tooltipStyle = {
        top: Math.max(20, Math.min(window.innerHeight - 380, targetRect.top - 20)),
        left: targetRect.right + 20,
      };
    } else {
      // No mobile, posiciona centralizado inferior
      tooltipStyle = {
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
      };
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-auto">
      {/* Backdrop Escuro com corte do Spotlight */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-all duration-300" 
        onClick={fecharTour}
      />

      {/* Caixa de Realce / Spotlight ao redor do elemento ativo */}
      {targetRect && (
        <div
          className="absolute rounded-2xl pointer-events-none transition-all duration-300 ring-4 ring-cyan-400 shadow-2xl shadow-cyan-500/50 animate-pulse"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      )}

      {/* Card do Tutorial (Tooltip ou Modal Central) */}
      <div
        ref={tooltipRef}
        style={targetRect ? tooltipStyle : {}}
        className={`fixed z-50 w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 shadow-2xl shadow-cyan-950/60 transition-all duration-300 animate-in fade-in zoom-in-95 ${
          !targetRect ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''
        }`}
      >
        {/* Cabeçalho do Card */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 shadow-inner">
              <StepIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800/60">
                  {passo.badge}
                </span>
                <span className="text-[11px] font-mono text-slate-400 font-semibold">
                  Passo {passoAtual + 1} de {TOUR_STEPS.length}
                </span>
              </div>
              <h3 className="text-base font-black text-white mt-0.5">
                {passo.title}
              </h3>
            </div>
          </div>
          <button
            onClick={fecharTour}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            title="Fechar Tutorial (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Barra de Progresso */}
        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mb-4 border border-slate-800">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Conteúdo Explicativo */}
        <p className="text-xs text-slate-300 leading-relaxed mb-3">
          {passo.content}
        </p>

        {/* Dica do Especialista */}
        {passo.dica && (
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-cyan-300/90 flex items-start gap-2 mb-5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span><strong>Dica:</strong> {passo.dica}</span>
          </div>
        )}

        {/* Botões de Navegação */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={fecharTour}
            className="text-xs font-semibold text-slate-400 hover:text-white px-2 py-1.5 cursor-pointer"
          >
            Pular Tour
          </button>

          <div className="flex items-center gap-2">
            {passoAtual > 0 && (
              <button
                type="button"
                onClick={anterior}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar</span>
              </button>
            )}

            <button
              type="button"
              onClick={proximo}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black transition shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>{isLast ? 'Concluir' : 'Próximo'}</span>
              {isLast ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Opção Especial no Último Passo: Limpar Dados de Exemplo Imediatamente */}
        {isLast && isDemo && (
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Quer iniciar sem os dados de teste?
            </span>
            <button
              type="button"
              onClick={limparDemoEConcluir}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 text-[11px] font-bold transition cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Limpar Dados Demo Agora</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
