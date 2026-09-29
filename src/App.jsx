import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Smartphone, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Zap, 
  TrendingUp, 
  Camera, 
  Fingerprint,
  ChevronRight,
  Star,
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [atendimentos, setAtendimentos] = useState(120);
  const [ticketMedio, setTicketMedio] = useState(240);
  const [prejuizoEvitado, setPrejuizoEvitado] = useState(0);
  const [patternDots, setPatternDots] = useState([1, 2, 5, 8, 9]);
  const [selectedDots, setSelectedDots] = useState([]);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('com_easycell');

  useEffect(() => {
    // Estimativa de 8% de disputas/prejuízos com clientes em assistências convencionais
    const calculo = Math.round(atendimentos * (ticketMedio * 0.18) + (atendimentos * 15));
    setPrejuizoEvitado(calculo);
  }, [atendimentos, ticketMedio]);

  const triggerConfetti = (e) => {
    e.preventDefault();
    if (!whatsappNumber) return;
    setIsSubmitted(true);
    confetti({
      particleCount: 100,
      spread: 70,
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
    <div className="min-h-screen bg-[#040711] text-slate-100 relative overflow-hidden font-sans">
      {/* Luzes e Efeitos de Fundo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-cyan-500/20 via-blue-600/10 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-[800px] -left-48 w-96 h-96 bg-blue-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute top-[1400px] -right-48 w-96 h-96 bg-emerald-500/15 blur-[120px] pointer-events-none" />

      {/* Grid de Fundo */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-slate-800/80 bg-[#040711]/70">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-cyan-400/30">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1">
                Easy<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Cell</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 -mt-1">Smart OS Bancada</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#diferenciais" className="hover:text-cyan-400 transition">Diferenciais</a>
            <a href="#calculadora" className="hover:text-cyan-400 transition">Simulador de Economia</a>
            <a href="#comparativo" className="hover:text-cyan-400 transition">Antes vs Depois</a>
          </nav>

          <a 
            href="#vip"
            className="relative group px-6 py-2.5 rounded-full text-sm font-bold overflow-hidden transition-all duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 group-hover:from-cyan-400 group-hover:to-blue-500 transition-all" />
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur opacity-30 group-hover:opacity-75 transition duration-300" />
            <span className="relative text-slate-950 flex items-center gap-2">
              Acesso VIP Antecipado
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 text-cyan-300 text-xs font-semibold uppercase tracking-wider backdrop-blur-md shadow-inner">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin-slow" />
            <span>O 1º Sistema Blindado para Assistência Técnica</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
            Sua bancada em paz.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400">
              Seu balcão 100% blindado.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto font-normal">
            Acabou o estresse de cliente jurando que a câmera funcionava ou cobrando no WhatsApp a cada 10 minutos. Checklist fotográfico na entrada, senha de padrão na tela e rastreio automático via WhatsApp.
          </p>

          {/* VIP Waitlist Box */}
          <div id="vip" className="pt-4 max-w-lg mx-auto">
            {!isSubmitted ? (
              <form onSubmit={triggerConfetti} className="p-2 rounded-2xl cyber-card border border-cyan-500/40 shadow-2xl flex flex-col sm:flex-row gap-2 relative">
                <input
                  type="text"
                  required
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="Seu WhatsApp com DDD (Ex: 21 99999-9999)"
                  className="flex-1 bg-slate-900/90 text-white placeholder-slate-500 px-5 py-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 border border-slate-700/60"
                />
                <button
                  type="submit"
                  className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 whitespace-nowrap active:scale-95"
                >
                  Entrar na Lista VIP
                  <Zap className="w-4 h-4 fill-slate-950" />
                </button>
              </form>
            ) : (
              <div className="p-6 rounded-2xl cyber-card border border-emerald-500/50 bg-emerald-950/20 text-emerald-300 text-center space-y-2 animate-fade-in">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
                <h4 className="font-bold text-lg text-white">Você está na Lista de Fundadores!</h4>
                <p className="text-xs text-slate-300">Salvamos seu número ({whatsappNumber}). Você terá prioridade e 50% de desconto vitalício no lançamento.</p>
              </div>
            )}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-slate-400">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Sem fidelidade</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Condição de Fundador</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Suporte prioritário</span>
            </div>
          </div>
        </div>

        {/* Interactive Device Showcase / Hero Component */}
        <div className="mt-16 max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Aparelho Interativo - Senha de Padrão */}
          <div className="lg:col-span-6 p-8 rounded-3xl cyber-card border border-cyan-500/30 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Demonstração Interativa</span>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-cyan-400" />
                  Padrão de Senha em 1 Toque
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-[11px] text-cyan-300">Toque nos pontos</span>
            </div>

            <div className="w-64 h-64 mx-auto bg-slate-950/90 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between shadow-2xl relative">
              <div className="grid grid-cols-3 gap-6 my-auto place-items-center">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((dot) => {
                  const isSelected = selectedDots.includes(dot) || patternDots.includes(dot);
                  return (
                    <button
                      key={dot}
                      onClick={() => toggleDot(dot)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isSelected
                          ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/50 scale-110 font-bold'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-black' : 'bg-slate-500'}`} />
                    </button>
                  );
                })}
              </div>
              <p className="text-center text-[11px] text-slate-500 mt-2">Sem papelzinho perdido. Registrado na O.S. com hash criptográfico.</p>
            </div>
          </div>

          {/* Notificação Simulada no WhatsApp */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-3xl cyber-card border border-emerald-500/30 bg-[#091512]/60 relative shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    WhatsApp Automático
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </h4>
                  <p className="text-xs text-slate-400">Zero ligações ansiosas no seu balcão</p>
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="bg-emerald-950/50 border border-emerald-800/40 p-3.5 rounded-xl text-emerald-200">
                  <p className="font-bold text-emerald-400 mb-1">🛠️ EasyCell • O.S. #2491 Atualizada</p>
                  <p>Olá, Gabriel! Seu iPhone 13 Pro já entrou na bancada técnica. Laudo fotográfico gerado com 4 fotos registradas.</p>
                  <span className="text-[10px] text-emerald-500/70 block mt-2">Enviado automaticamente às 14:32</span>
                </div>
                <div className="bg-emerald-950/30 border border-emerald-800/30 p-3.5 rounded-xl text-emerald-200/90">
                  <p className="font-bold text-emerald-400 mb-1">✅ Aparelho Pronto para Retirada!</p>
                  <p>Serviço concluído com sucesso e testes de bancada validados. Pode retirar no balcão.</p>
                  <span className="text-[10px] text-emerald-500/70 block mt-2">Enviado automaticamente às 16:15</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculadora Interativa de Prejuízo Evitado */}
      <section id="calculadora" className="py-20 px-6 border-y border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Simulador de Retorno</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Quanto dinheiro você deixa de perder?</h2>
            <p className="text-slate-400 mt-3 text-sm">Calcule a economia real da sua loja ao evitar retrabalho, peças trocadas por engano e reclamações infundadas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center cyber-card p-8 sm:p-12 rounded-3xl border border-cyan-500/30">
            <div className="md:col-span-7 space-y-8">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    Aparelhos atendidos por mês:
                  </label>
                  <span className="text-xl font-bold text-cyan-400 font-mono">{atendimentos} O.S.</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="600"
                  step="10"
                  value={atendimentos}
                  onChange={(e) => setAtendimentos(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    Ticket médio por reparo:
                  </label>
                  <span className="text-xl font-bold text-cyan-400 font-mono">R$ {ticketMedio}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="900"
                  step="20"
                  value={ticketMedio}
                  onChange={(e) => setTicketMedio(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>

            <div className="md:col-span-5 bg-gradient-to-br from-cyan-950/60 via-slate-900 to-blue-950/40 p-8 rounded-2xl border border-cyan-500/40 text-center relative overflow-hidden shadow-2xl">
              <div className="text-xs font-semibold uppercase text-cyan-300 tracking-wider mb-2">Economia Estimada / Mês</div>
              <div className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300 font-mono my-2">
                R$ {prejuizoEvitado.toLocaleString('pt-BR')}
              </div>
              <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                Protegendo contra alegações falsas de clientes, perdas de peças e horas perdidas respondendo mensagens de status no WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparativo Antes vs Depois */}
      <section id="comparativo" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">A Realidade da Sua Loja</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Sua rotina hoje vs. Com EasyCell</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Modo Caos */}
          <div className="p-8 rounded-3xl cyber-card border border-rose-500/30 bg-rose-950/10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">Sem o EasyCell (Modo Caos)</h3>
            </div>
            <ul className="space-y-4 text-sm text-slate-300">
              <li className="flex items-start gap-3"><span className="text-rose-400 font-bold">✕</span> Cliente volta furioso dizendo que a câmera traseira parou depois que você trocou o conector de carga.</li>
              <li className="flex items-start gap-3"><span className="text-rose-400 font-bold">✕</span> Papel de O.S. rasgado com o desenho de senha rabiscado que ninguém consegue decifrar.</li>
              <li className="flex items-start gap-3"><span className="text-rose-400 font-bold">✕</span> Atendente passa metade do dia respondendo mensagens: "Meu celular já tá pronto?"</li>
              <li className="flex items-start gap-3"><span className="text-rose-400 font-bold">✕</span> Estoque de peças misturado com vitrine e ninguém sabe onde foi parar a tela do A54.</li>
            </ul>
          </div>

          {/* Modo Blindado */}
          <div className="p-8 rounded-3xl cyber-card border border-cyan-500/50 bg-cyan-950/20 space-y-6 shadow-2xl relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-white">Com o EasyCell (Modo Blindado)</h3>
            </div>
            <ul className="space-y-4 text-sm text-slate-200">
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" /> Checklist fotográfico dos 4 lados e termo assinado digitalmente no balcão na hora de entrar.</li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" /> Senha de pontos desenhada na tela e salva instantaneamente no perfil da O.S.</li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" /> Disparo automático em cada etapa pelo WhatsApp da própria loja.</li>
              <li className="flex items-start gap-3"><CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" /> Controle triplo: peças de reposição separadas de vitrine e aparelhos por IMEI.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3 Pilares Principais */}
      <section id="diferenciais" className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Tecnologia Especializada</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Feito para quem vive a bancada</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="cyber-card p-8 rounded-3xl border border-slate-800 hover:border-cyan-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-6">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Laudo Fotográfico com Validade</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Fotos com data, hora e marca d'água automática. O cliente assina no vidro do aparelho antes do técnico abrir o primeiro parafuso.
            </p>
          </div>

          <div className="cyber-card p-8 rounded-3xl border border-slate-800 hover:border-blue-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 mb-6">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Estoque Triplo Especializado</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Separe peças de reparo (telas originais vs. incell), acessórios de vitrine com caixa rápido e aparelhos seminovos rastreados por IMEI.
            </p>
          </div>

          <div className="cyber-card p-8 rounded-3xl border border-slate-800 hover:border-emerald-500/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">WhatsApp Bot de Rastreio</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              O cliente consulta o status da O.S. digitando apenas o número ou CPF direto no WhatsApp, sem tomar tempo dos seus funcionários.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-6 relative">
        <div className="max-w-4xl mx-auto cyber-card p-12 sm:p-16 rounded-3xl border border-cyan-500/40 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/20 blur-[100px] pointer-events-none" />
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Seja uma das primeiras assistências blindadas do Brasil.
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto mt-4 mb-8">
            Os 50 primeiros lojistas cadastrados na lista de espera terão desconto vitalício de 50% e acesso direto ao canal de desenvolvedores.
          </p>
          <a
            href="#vip"
            className="inline-flex items-center gap-2 px-10 py-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-base shadow-xl shadow-cyan-500/25 active:scale-95 transition-all"
          >
            Quero Blindar Minha Assistência
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="border-t border-slate-900 py-10 px-6 text-center text-xs text-slate-500">
        <p>© 2026 EasyCell • Uma tecnologia VibeDoCode. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
