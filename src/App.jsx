import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Smartphone, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Zap, 
  TrendingUp, 
  Camera, 
  Fingerprint,
  Sliders,
  Check,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import AOS from 'aos';
import 'aos/dist/aos.css';

export default function App() {
  const [atendimentos, setAtendimentos] = useState(130);
  const [ticketMedio, setTicketMedio] = useState(250);
  const [prejuizoEvitado, setPrejuizoEvitado] = useState(0);
  const [selectedDots, setSelectedDots] = useState([1, 2, 5, 8, 9]);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 850,
      easing: 'ease-out-cubic',
      once: true,
      offset: 50,
    });
  }, []);

  useEffect(() => {
    const calculo = Math.round(atendimentos * (ticketMedio * 0.18) + (atendimentos * 15));
    setPrejuizoEvitado(calculo);
  }, [atendimentos, ticketMedio]);

  const triggerConfetti = (e) => {
    e.preventDefault();
    if (!whatsappNumber) return;
    setIsSubmitted(true);
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#3b82f6', '#10b981']
    });
  };

  const toggleDot = (id) => {
    if (selectedDots.includes(id)) {
      setSelectedDots(selectedDots.filter(d => d !== id));
    } else {
      setSelectedDots([...selectedDots, id]);
    }
  };

  return (
    <div className="min-h-screen bg-[#030611] text-slate-100 relative overflow-hidden font-sans selection:bg-cyan-500 selection:text-black">
      {/* Ambient Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[650px] bg-gradient-to-b from-cyan-500/25 via-blue-600/10 to-transparent blur-[160px] pointer-events-none animate-pulse-glow" />
      <div className="absolute top-[900px] -left-64 w-[500px] h-[500px] bg-indigo-600/15 blur-[150px] pointer-events-none" />
      <div className="absolute top-[1600px] -right-64 w-[500px] h-[500px] bg-emerald-500/15 blur-[150px] pointer-events-none" />

      {/* Futuristic Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_80%,transparent_100%)] pointer-events-none" />

      {/* Top Banner Alert */}
      <div className="bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 border-b border-cyan-500/20 py-2.5 px-4 text-center text-xs font-medium text-cyan-300 flex items-center justify-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        <span>Vagas de Fundadores: <strong>Apenas 50 lojas</strong> terão 50% de desconto vitalício.</span>
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-slate-800/80 bg-[#030611]/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 border border-cyan-300/40 relative">
              <Smartphone className="w-6 h-6 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#030611]" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1 font-mono">
                Easy<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 glow-text-cyan">Cell</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 -mt-1">Smart OS Bancada</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-300">
            <a href="#diferenciais" className="hover:text-cyan-400 transition-colors">O Que Muda</a>
            <a href="#demonstracao" className="hover:text-cyan-400 transition-colors">Bancada Interativa</a>
            <a href="#calculadora" className="hover:text-cyan-400 transition-colors">Simulador de Economia</a>
            <a href="#comparativo" className="hover:text-cyan-400 transition-colors">Antes vs Depois</a>
          </nav>

          <a 
            href="#vip"
            className="relative group px-6 py-2.5 rounded-full text-sm font-bold overflow-hidden transition-all duration-300 shadow-lg shadow-cyan-500/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 group-hover:from-cyan-400 group-hover:to-blue-500 transition-all" />
            <span className="relative text-slate-950 flex items-center gap-2">
              Acesso VIP Antecipado
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </a>
        </div>
      </header>

      {/* HERO SECTION DE ALTO IMPACTO COM LAYOUT PANORÂMICO E VÍDEO CENTRAL DOMINANTE */}
      <section className="relative pt-16 pb-24 px-6 max-w-7xl mx-auto text-center">
        {/* Tagline e Título Centralizado */}
        <div className="max-w-4xl mx-auto space-y-6" data-aos="fade-up">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-cyan-500/40 bg-cyan-950/40 text-cyan-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-inner">
            <Flame className="w-4 h-4 text-cyan-400 animate-bounce" />
            <span>O Novo Padrão para Assistência de Smartphone</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white tracking-tight leading-[1.08]">
            Sua bancada veloz.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-300 glow-text-cyan">
              Seu balcão 100% blindado.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
            Elimine para sempre o cliente que jura que o celular não tinha riscos ou que a câmera funcionava antes. <strong>Checklist fotográfico</strong> na entrada, <strong>senha de padrão na tela</strong> e <strong>rastreio automático no WhatsApp</strong>.
          </p>

          {/* Formulário VIP Centralizado */}
          <div id="vip" className="pt-2 max-w-xl mx-auto">
            {!isSubmitted ? (
              <form onSubmit={triggerConfetti} className="p-2.5 rounded-2xl glass-panel border border-cyan-500/50 shadow-2xl flex flex-col sm:flex-row gap-2 relative group hover:border-cyan-400 transition-all">
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="Seu WhatsApp com DDD (Ex: 21 99999-9999)"
                  className="flex-1 bg-slate-950/80 text-white placeholder-slate-500 px-5 py-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 border border-slate-700/60 font-medium"
                />
                <button
                  type="submit"
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm transition-all shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2 whitespace-nowrap active:scale-95 cursor-pointer"
                >
                  Garantir Vaga VIP
                  <Zap className="w-4 h-4 fill-slate-950" />
                </button>
              </form>
            ) : (
              <div className="p-6 rounded-2xl glass-panel border border-emerald-500/60 bg-emerald-950/30 text-emerald-300 text-center space-y-2 animate-fade-in">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
                <h4 className="font-bold text-lg text-white">Inscrição VIP Confirmada!</h4>
                <p className="text-xs text-slate-300">Número registrado ({whatsappNumber}). Você terá condição de fundador vitalícia no lançamento.</p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-5 mt-4 text-xs font-medium text-slate-400">
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-cyan-400 font-bold" /> Sem fidelidade</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-cyan-400 font-bold" /> 50% OFF vitalício</span>
              <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-cyan-400 font-bold" /> Acesso prioritário</span>
            </div>
          </div>
        </div>

        {/* VÍDEO DO CELULAR ABRINDO - VISÃO PANORÂMICA E SEM POLUIÇÃO NA FRENTE */}
        <div className="mt-16 max-w-5xl mx-auto relative" data-aos="zoom-in" data-aos-delay="150">
          {/* Glow Traseiro */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/30 via-blue-600/25 to-purple-600/20 blur-[100px] rounded-3xl -z-10" />

          {/* Container do Vídeo */}
          <div className="glass-panel rounded-3xl border border-cyan-400/50 p-2.5 sm:p-4 shadow-2xl relative overflow-hidden group">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto max-h-[580px] object-cover rounded-2xl shadow-2xl mx-auto"
            >
              <source src="/hero-video.mp4" type="video/mp4" />
              {/* Fallback de imagem caso o navegador bloqueie vídeo */}
              <img src="/images/hero-bancada-futurista.png" alt="EasyCell Bancada Técnica" className="w-full h-auto rounded-2xl" />
            </video>
          </div>
        </div>
      </section>

      {/* SEÇÃO DA BANCADA INTERATIVA: SENHA DE DESENHO & BOT DE WHATSAPP */}
      <section id="demonstracao" className="py-24 px-6 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-16" data-aos="fade-up">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Demonstração Prática</span>
          <h2 className="text-3xl sm:text-5xl font-black text-white mt-2">Os dois maiores pesadelos resolvidos em segundos</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Aparelho Interativo - Senha de Padrão */}
          <div className="lg:col-span-6 p-8 rounded-3xl glass-panel border border-cyan-500/40 relative overflow-hidden group shadow-2xl" data-aos="fade-right">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Adeus Papelzinho Perdido</span>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2 mt-1">
                  <Fingerprint className="w-6 h-6 text-cyan-400" />
                  Padrão de Senha no Sistema
                </h3>
              </div>
              <span className="px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-xs text-cyan-300 font-semibold">Toque nos pontos</span>
            </div>

            <div className="w-72 h-72 mx-auto bg-slate-950/90 rounded-3xl border border-slate-800 p-6 flex flex-col justify-between shadow-2xl relative">
              <div className="grid grid-cols-3 gap-6 my-auto place-items-center">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((dot) => {
                  const isSelected = selectedDots.includes(dot);
                  return (
                    <button
                      key={dot}
                      onClick={() => toggleDot(dot)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-tr from-cyan-400 to-blue-500 text-black shadow-lg shadow-cyan-500/50 scale-110 font-bold'
                          : 'bg-slate-800/90 hover:bg-slate-700 text-slate-400'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full ${isSelected ? 'bg-black' : 'bg-slate-500'}`} />
                    </button>
                  );
                })}
              </div>
              <p className="text-center text-xs text-slate-400 font-mono mt-2">Salvo na O.S. com hash criptográfico.</p>
            </div>
          </div>

          {/* Notificação Simulada no WhatsApp */}
          <div className="lg:col-span-6 space-y-4" data-aos="fade-left">
            <div className="p-8 rounded-3xl glass-panel border border-emerald-500/40 bg-[#071511]/70 relative shadow-2xl">
              <div className="flex items-center gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/20">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    WhatsApp Bot Automático
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  </h4>
                  <p className="text-xs text-slate-400">O cliente se informa sozinho sem ligar pra loja</p>
                </div>
              </div>

              <div className="space-y-3.5 font-mono text-xs">
                <div className="bg-emerald-950/60 border border-emerald-800/50 p-4 rounded-2xl text-emerald-200 shadow-sm">
                  <p className="font-bold text-emerald-400 mb-1.5 flex items-center justify-between">
                    <span>🛠️ EasyCell • O.S. #2491 Atualizada</span>
                    <span className="text-[10px] text-emerald-500/80 font-normal">14:32</span>
                  </p>
                  <p className="leading-relaxed">Olá, Carlos! Seu iPhone 13 Pro já entrou na bancada técnica. Laudo fotográfico gerado com 4 fotos registradas antes da abertura.</p>
                </div>
                <div className="bg-emerald-950/40 border border-emerald-800/40 p-4 rounded-2xl text-emerald-200/90 shadow-sm">
                  <p className="font-bold text-emerald-400 mb-1.5 flex items-center justify-between">
                    <span>✅ Aparelho Pronto para Retirada!</span>
                    <span className="text-[10px] text-emerald-500/80 font-normal">16:15</span>
                  </p>
                  <p className="leading-relaxed">Serviço concluído com sucesso e testes de bancada validados. Pode retirar no balcão quando quiser.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALCULADORA DE ECONOMIA REAL */}
      <section id="calculadora" className="py-24 px-6 border-y border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16" data-aos="fade-up">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Calculadora de Retorno</span>
            <h2 className="text-3xl sm:text-5xl font-black text-white mt-2">Quanto dinheiro você deixa de perder?</h2>
            <p className="text-slate-400 mt-3 text-sm leading-relaxed">Estudo empírico baseado em mais de 100 assistências: evite arcar com telas e câmeras de defeitos pré-existentes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center glass-panel p-8 sm:p-12 rounded-3xl border border-cyan-500/30" data-aos="zoom-in">
            <div className="md:col-span-7 space-y-8">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    Aparelhos atendidos por mês:
                  </label>
                  <span className="text-2xl font-black text-cyan-400 font-mono">{atendimentos} O.S.</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="700"
                  step="10"
                  value={atendimentos}
                  onChange={(e) => setAtendimentos(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    Ticket médio por reparo:
                  </label>
                  <span className="text-2xl font-black text-cyan-400 font-mono">R$ {ticketMedio}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="25"
                  value={ticketMedio}
                  onChange={(e) => setTicketMedio(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>

            <div className="md:col-span-5 bg-gradient-to-br from-cyan-950/80 via-slate-900 to-blue-950/60 p-8 rounded-2xl border border-cyan-500/40 text-center relative overflow-hidden shadow-2xl">
              <div className="text-xs font-bold uppercase text-cyan-300 tracking-wider mb-2">Economia Estimada / Mês</div>
              <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300 font-mono my-2">
                R$ {prejuizoEvitado.toLocaleString('pt-BR')}
              </div>
              <p className="text-xs text-slate-400 mt-4 leading-relaxed font-medium">
                Protegendo contra alegações de defeitos antigos e horas jogadas fora no WhatsApp respondendo status.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ANTES VS DEPOIS COM VISUAL FORTE */}
      <section id="comparativo" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16" data-aos="fade-up">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">A Realidade Sem Filtro</span>
          <h2 className="text-3xl sm:text-5xl font-black text-white mt-2">Sua rotina hoje vs. Com EasyCell</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Modo Caos */}
          <div className="p-8 rounded-3xl glass-panel border border-rose-500/40 bg-rose-950/15 space-y-6 shadow-2xl" data-aos="fade-up" data-aos-delay="100">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white">Sem o EasyCell (Modo Caos)</h3>
            </div>
            <ul className="space-y-4 text-sm text-slate-300 font-medium">
              <li className="flex items-start gap-3"><span className="text-rose-400 font-bold text-base">✕</span> Cliente volta exigindo uma tela nova porque alega que a mancha apareceu depois do seu reparo.</li>
              <li className="flex items-start gap-3"><span className="text-rose-400 font-bold text-base">✕</span> Papel de O.S. rasgado com desenho de senha rabiscado que ninguém consegue destravar.</li>
              <li className="flex items-start gap-3"><span className="text-rose-400 font-bold text-base">✕</span> Balcão lotado de gente perguntando se o aparelho tá pronto enquanto o técnico tenta trabalhar.</li>
              <li className="flex items-start gap-3"><span className="text-rose-400 font-bold text-base">✕</span> Estoque de peças misturado com vitrine e ninguém acha a bateria que acabou de chegar.</li>
            </ul>
          </div>

          {/* Modo Blindado */}
          <div className="p-8 rounded-3xl glass-panel border border-cyan-500/50 bg-cyan-950/25 space-y-6 shadow-2xl relative" data-aos="fade-up" data-aos-delay="200">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/25">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-white">Com o EasyCell (Modo Blindado)</h3>
            </div>
            <ul className="space-y-4 text-sm text-slate-200 font-medium">
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" /> Checklist fotográfico dos 4 lados e termo assinado digitalmente no balcão antes de abrir o celular.</li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" /> Senha de pontos desenhada na tela e salva instantaneamente no perfil da O.S.</li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" /> Disparo automático em cada etapa pelo WhatsApp da própria loja.</li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" /> Controle triplo: peças de reposição separadas de vitrine e aparelhos por IMEI.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto glass-panel p-12 sm:p-16 rounded-3xl border border-cyan-500/40 text-center relative overflow-hidden shadow-2xl" data-aos="zoom-in">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/25 blur-[120px] pointer-events-none" />
          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Blinde sua assistência técnica hoje mesmo.
          </h2>
          <p className="text-slate-300 text-base max-w-xl mx-auto mt-4 mb-8 leading-relaxed">
            Os 50 primeiros cadastrados na lista de espera terão 50% de desconto vitalício e canal direto com o time de engenharia.
          </p>
          <a
            href="#vip"
            className="inline-flex items-center gap-2.5 px-10 py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-base shadow-xl shadow-cyan-500/30 active:scale-95 transition-all cursor-pointer"
          >
            Quero Garantir Minha Vaga VIP
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="border-t border-slate-900 py-12 px-6 text-center text-xs text-slate-500 font-mono">
        <p>© 2026 EasyCell • Uma tecnologia VibeDoCode. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
