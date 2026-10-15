import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Compass,
  LayoutDashboard,
  Minimize2,
  Maximize2,
  ExternalLink,
  Eye
} from 'lucide-react';
import { easyCellStore } from '../lib/store';

const TOUR_STORAGE_KEY = 'easycell_tour_completed';

export const TOUR_STEPS = [
  {
    target: '[data-tour="dashboard"]',
    route: '/system',
    title: 'Visão Geral do Balcão & Bancada 📊',
    badge: 'Dashboard',
    icon: LayoutDashboard,
    content: 'Aqui é o centro de comando da sua assistência. Você acompanha o volume de ordens de serviço hoje, aparelhos em reparo na bancada, itens prontos para retirada e o faturamento total acumulado no caixa.',
    dica: 'Observe as métricas principais no topo e a tabela de ordens recentes logo abaixo.'
  },
  {
    target: '[data-tour="nova-os"]',
    route: '/system/os/nova',
    title: 'Nova O.S. Blindada (Balcão) 📝',
    badge: 'Entrada Ágil',
    icon: PlusCircle,
    content: 'Tela para abertura de Ordem de Serviço em 90 segundos: checklist de entrada com 11 itens, registro fotográfico em 4 ângulos, padrão de pontos 3x3 para senha do aparelho e emissão de laudo de entrada com QR Code.',
    dica: 'O cliente pode assinar digitalmente e receber o laudo de entrada direto no WhatsApp.'
  },
  {
    target: '[data-tour="ordens-kanban"]',
    route: '/system/os',
    title: 'Quadro Kanban Operacional 📋',
    badge: 'Bancada',
    icon: Kanban,
    content: 'O fluxo visual de reparos: você e sua equipe técnica podem arrastar os aparelhos entre as colunas "Em Análise", "Orçamento Pendente", "Na Bancada", "Pronto p/ Retirada" e "Finalizado".',
    dica: 'Arraste os cards para atualizar o status e acionar avisos em tempo real.'
  },
  {
    target: '[data-tour="filiais-lojas"]',
    route: '/system/lojas',
    title: 'Filiais & Lojas (Multi-unidade) 🏢',
    badge: 'Multi-loja',
    icon: Store,
    content: 'Cadastre sua matriz e filiais com CNPJ, endereço completo e WhatsApp comercial próprios. Você pode alternar entre lojas usando o seletor no topo da tela.',
    dica: 'Permite controlar estoques e atendimentos de cada unidade de forma isolada ou integrada.'
  },
  {
    target: '[data-tour="tecnicos-comissoes"]',
    route: '/system/tecnicos',
    title: 'Técnicos & Comissões 👥',
    badge: 'Equipe',
    icon: Users,
    content: 'Cadastre sua equipe técnica, defina o percentual de comissão sobre a mão de obra de cada técnico e acompanhe relatórios de serviços concluídos sem planilhas manuais.',
    dica: 'O cálculo de comissões é gerado automaticamente na quitação de cada O.S.'
  },
  {
    target: '[data-tour="automacoes-whatsapp"]',
    route: '/system/automacoes',
    title: 'Automações WhatsApp (SofIA) 🤖',
    badge: 'SofIA IA',
    icon: Bot,
    content: 'Configure mensagens automáticas de entrada de aparelho, aviso de orçamento pronto e aviso de retirada direto no WhatsApp do cliente com link de aprovação com 1 clique.',
    dica: 'Elimina cobranças manuais e acelera a aprovação de orçamentos em 3x.'
  },
  {
    target: '[data-tour="estoque-triplo"]',
    route: '/system/estoque',
    title: 'Estoque Triplo Integrado 📦',
    badge: 'Inventário',
    icon: Package,
    content: 'Gestão em 3 modalidades: Peças de Reposição (com alerta de estoque baixo), Serviços/Mão de Obra e Aparelhos Seminovos com controle rastreado por IMEI.',
    dica: 'Quando uma peça é inserida em uma O.S., a baixa no estoque é realizada instantaneamente.'
  },
  {
    target: '[data-tour="frente-caixa"]',
    route: '/system/caixa',
    title: 'Frente de Caixa (PDV) 💵',
    badge: 'Financeiro',
    icon: DollarSign,
    content: 'Controle completo de caixa: abertura de turno, sangrias de segurança, suprimentos e fechamento diário com conferência de recebimentos em Dinheiro, Cartão e PIX.',
    dica: 'Toda O.S. quitada gera automaticamente um lançamento de entrada no caixa.'
  },
  {
    target: '[data-tour="minha-assinatura"]',
    route: '/system/assinatura',
    title: 'Minha Assinatura & Suporte 💳',
    badge: 'Plano SaaS',
    icon: CreditCard,
    content: 'Gerencie seu plano de assinatura EasyCell, realize upgrades instantâneos sem perda de dados e acesse a central de chamados com suporte técnico especializado.',
    dica: 'Acesse também o menu "Suporte Técnico" para tirar dúvidas diretamente com nosso time.'
  },
  {
    target: '[data-tour="dashboard"]',
    route: '/system',
    title: 'Tudo Pronto para Começar! 🚀',
    badge: 'Conclusão',
    icon: Sparkles,
    content: 'Você já conheceu todas as áreas da plataforma! O painel possui dados demonstrativos para você explorar à vontade. Quando desejar começar com a base zerada, clique em "Limpar Dados Demo".',
    dica: 'Para rever este tutorial quando quiser, basta clicar no botão "Tutorial do Sistema" no topo ou na barra lateral.'
  }
];

export default function TourGuiado() {
  const navigate = useNavigate();
  const location = useLocation();

  const [ativo, setAtivo] = useState(false);
  const [minimizado, setMinimizado] = useState(false);
  const [passoAtual, setPassoAtual] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [isDemo, setIsDemo] = useState(false);

  // Escuta evento customizado para reabrir o tour a qualquer momento
  useEffect(() => {
    const handleAbrir = () => {
      setPassoAtual(0);
      setMinimizado(false);
      setAtivo(true);
      navigate(TOUR_STEPS[0].route);
    };

    window.addEventListener('easycell_open_tour', handleAbrir);

    // Disparo automático suave na primeira vez
    const tourJaVisto = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!tourJaVisto) {
      const timer = setTimeout(() => {
        setPassoAtual(0);
        setMinimizado(false);
        setAtivo(true);
        navigate(TOUR_STEPS[0].route);
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

  // Calcula posição do elemento alvo na barra lateral para o realce sutil
  useEffect(() => {
    if (!ativo) return;

    const passo = TOUR_STEPS[passoAtual];
    if (!passo?.target) {
      setTargetRect(null);
      return;
    }

    const elemento = document.querySelector(passo.target);
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setTargetRect(elemento.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }

    const handleResize = () => {
      const el = document.querySelector(passo.target);
      if (el) setTargetRect(el.getBoundingClientRect());
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [ativo, passoAtual, location.pathname]);

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

  const irParaPasso = (novoIndice) => {
    setPassoAtual(novoIndice);
    const passo = TOUR_STEPS[novoIndice];
    if (passo?.route && location.pathname !== passo.route) {
      navigate(passo.route);
    }
  };

  const proximo = () => {
    if (passoAtual < TOUR_STEPS.length - 1) {
      irParaPasso(passoAtual + 1);
    } else {
      fecharTour();
    }
  };

  const anterior = () => {
    if (passoAtual > 0) {
      irParaPasso(passoAtual - 1);
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

  // Se o guia estiver minimizado, exibe badge compacto no canto inferior direito
  if (minimizado) {
    return (
      <div 
        onClick={() => setMinimizado(false)}
        className="fixed bottom-22 right-3 sm:bottom-6 sm:right-6 z-50 flex items-center gap-3 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-slate-900/95 border border-cyan-500/60 shadow-2xl shadow-cyan-950/80 hover:border-cyan-400 cursor-pointer transition-all active:scale-95 group animate-in fade-in"
      >
        <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
          <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform" />
        </div>
        <div>
          <div className="text-xs font-black text-white flex items-center gap-1.5">
            <span>Guia: {passo.badge}</span>
            <span className="text-[10px] text-cyan-400 font-mono">({passoAtual + 1}/{TOUR_STEPS.length})</span>
          </div>
          <div className="text-[10px] text-slate-400">Clique para expandir tutorial</div>
        </div>
        <Maximize2 className="w-4 h-4 text-cyan-400 ml-2 group-hover:scale-110 transition-transform" />
      </div>
    );
  }

  return (
    <>
      {/* Realce Dinâmico sutil ao redor do item de menu correspondente na barra lateral */}
      {targetRect && (
        <div
          className="fixed pointer-events-none z-40 transition-all duration-300 ring-2 ring-cyan-400 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] animate-pulse hidden md:block"
          style={{
            top: targetRect.top - 2,
            left: targetRect.left - 2,
            width: targetRect.width + 4,
            height: targetRect.height + 4,
          }}
        >
          <div className="absolute -right-1 -top-2 bg-cyan-400 text-slate-950 text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full shadow">
            Ativo
          </div>
        </div>
      )}

      {/* Card Flutuante: Docked no Canto Inferior Direito no Desktop e acima da Bottom Nav no Mobile */}
      <div
        className="fixed bottom-22 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 z-50 w-auto sm:w-full sm:max-w-[390px] bg-slate-900/95 border border-cyan-500/50 rounded-3xl p-4 sm:p-5 shadow-2xl shadow-cyan-950/80 backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
      >
        {/* Cabeçalho do Card */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 shadow-inner">
              <StepIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800/60">
                  {passo.badge}
                </span>
                <span className="text-[11px] font-mono text-slate-400 font-semibold">
                  Passo {passoAtual + 1} de {TOUR_STEPS.length}
                </span>
              </div>
              <h3 className="text-sm font-black text-white mt-0.5 leading-snug">
                {passo.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setMinimizado(true)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Minimizar Guia"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={fecharTour}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              title="Fechar Tutorial (Esc)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Barra de Progresso */}
        <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mb-3 border border-slate-800">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Conteúdo Explicativo da Tela em Exibição */}
        <p className="text-xs text-slate-300 leading-relaxed mb-3">
          {passo.content}
        </p>

        {/* Dica Operacional */}
        {passo.dica && (
          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-cyan-300/90 flex items-start gap-2 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span><strong>Dica:</strong> {passo.dica}</span>
          </div>
        )}

        {/* Botões de Navegação */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={fecharTour}
            className="text-[11px] font-semibold text-slate-400 hover:text-white px-1.5 py-1 cursor-pointer"
          >
            Pular Tour
          </button>

          <div className="flex items-center gap-2">
            {passoAtual > 0 && (
              <button
                type="button"
                onClick={anterior}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Voltar</span>
              </button>
            )}

            <button
              type="button"
              onClick={proximo}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-black transition shadow-lg shadow-cyan-500/20 flex items-center gap-1 cursor-pointer active:scale-95"
            >
              <span>{isLast ? 'Concluir' : 'Próximo'}</span>
              {isLast ? <Check className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Opção Especial no Último Passo: Limpar Dados de Exemplo Imediatamente */}
        {isLast && isDemo && (
          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[10px] text-slate-400">
              Iniciar com sistema zerado?
            </span>
            <button
              type="button"
              onClick={limparDemoEConcluir}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/40 text-[10px] font-bold transition cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Limpar Dados Demo</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
