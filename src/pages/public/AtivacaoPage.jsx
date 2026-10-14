import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Lock,
  Mail,
  Phone,
  MapPin,
  User,
  FileText,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  Zap,
  Store
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AtivacaoPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { updateUser, setUser } = useAuth();

  // Estados de carregamento e validação do token
  const [carregandoToken, setCarregandoToken] = useState(true);
  const [conviteValido, setConviteValido] = useState(false);
  const [erroToken, setErroToken] = useState('');
  const [dadosConvite, setDadosConvite] = useState(null);

  // Formulário do Cliente
  const [nomeResponsavel, setNomeResponsavel] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Dados Fiscais & Endereço
  const [cnpjOuCpf, setCnpjOuCpf] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [nomeUnidade, setNomeUnidade] = useState('');
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [uf, setUf] = useState('');
  const [buscandoCep, setBuscandoCep] = useState(false);

  // Estados de submissão
  const [enviando, setEnviando] = useState(false);
  const [erroEnvio, setErroEnvio] = useState('');
  const [sucesso, setSucesso] = useState(false);

  // 1. Valida o token ao carregar a página
  useEffect(() => {
    async function validarConvite() {
      if (!token) {
        setErroToken('Token de ativação ausente na URL.');
        setCarregandoToken(false);
        return;
      }

      try {
        const res = await fetch(`/api/v1/onboarding/${token}`);
        const data = await res.json();

        if (res.ok && data.valido) {
          setConviteValido(true);
          setDadosConvite(data.invite);
          if (data.invite.emailResponsavel) setEmail(data.invite.emailResponsavel);
          if (data.invite.telefone) setTelefone(data.invite.telefone);
          if (data.invite.nomeEmpresa) {
            setRazaoSocial(data.invite.nomeEmpresa);
            setNomeUnidade(`${data.invite.nomeEmpresa} (Matriz)`);
          }
        } else {
          setErroToken(data.error || 'Convite inválido ou expirado.');
        }
      } catch (err) {
        setErroToken('Falha ao comunicar com o servidor de validação.');
      } finally {
        setCarregandoToken(false);
      }
    }

    validarConvite();
  }, [token]);

  // 2. Busca automática de CEP
  const handleBuscarCep = async (e) => {
    const valorCep = e.target.value.replace(/\D/g, '');
    setCep(valorCep);

    if (valorCep.length === 8) {
      setBuscandoCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${valorCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setLogradouro(data.logradouro || '');
          setBairro(data.bairro || '');
          setCidade(data.localidade || '');
          setUf(data.uf || '');
        }
      } catch (e) {
        // silencioso
      } finally {
        setBuscandoCep(false);
      }
    }
  };

  // 3. Submissão do cadastro completo
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErroEnvio('');

    if (senha !== confirmarSenha) {
      setErroEnvio('A confirmação de senha não confere com a senha digitada.');
      return;
    }

    if (senha.length < 6) {
      setErroEnvio('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    setEnviando(true);

    const payload = {
      nomeResponsavel,
      email,
      senha,
      telefone,
      cnpjOuCpf,
      razaoSocial: razaoSocial || dadosConvite?.nomeEmpresa,
      nomeUnidade: nomeUnidade || `${dadosConvite?.nomeEmpresa} (Matriz)`,
      endereco: {
        cep,
        logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        uf
      }
    };

    try {
      const res = await fetch(`/api/v1/onboarding/${token}/completar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.sucesso) {
        setSucesso(true);

        // Armazena credenciais e sessão ativa
        if (data.token) {
          localStorage.setItem('easycell_token', data.token);
          localStorage.setItem('easycell_auth_token', data.token);
          sessionStorage.setItem('easycell_token', data.token);
        }
        if (data.user) {
          localStorage.setItem('easycell_user', JSON.stringify(data.user));
          if (updateUser) updateUser(data.user);
          else if (setUser) setUser(data.user);
        }

        // Redireciona diretamente para o painel operacional da loja (/system)
        setTimeout(() => {
          navigate('/system');
        }, 1800);
      } else {
        setErroEnvio(data.error || 'Falha ao concluir o cadastro.');
      }
    } catch (err) {
      setErroEnvio('Erro na comunicação com a API. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  // Estado de carregamento inicial
  if (carregandoToken) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-medium">Validando seu link de ativação...</p>
      </div>
    );
  }

  // Estado de erro no link / convite inválido ou expirado
  if (!conviteValido) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900/90 border border-red-500/30 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-xl space-y-6">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center mx-auto text-red-400">
            <AlertCircle className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-black text-white">Link Indisponível</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {erroToken || 'Este link de ativação expirou ou não é mais válido.'}
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Link
              to="/admin"
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
            >
              Ir para o Login do Sistema
            </Link>
            <p className="text-[11px] text-slate-500">
              Dúvidas? Entre em contato com o suporte ou com seu administrador para solicitar um novo link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-2xl w-full mx-auto relative z-10 space-y-6">
        {/* Top Header com Marca */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Primeiro Acesso EasyCell SaaS</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Ativação da sua Assistência Técnica
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Defina sua senha e preencha as informações para liberar o acesso ao sistema da sua loja.
          </p>
        </div>

        {/* Card Principal de Onboarding */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Badge da Empresa Pré-Cadastrada */}
          <div className="mb-8 p-4 bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                  Empresa Habilitada
                </span>
                <span className="text-sm font-bold text-white">
                  {dadosConvite?.nomeEmpresa}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-black uppercase tracking-wider">
                Plano {dadosConvite?.plano || 'PRO'}
              </span>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Pronto para Ativação
              </span>
            </div>
          </div>

          {sucesso ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-white">Conta Ativada com Sucesso!</h2>
              <p className="text-sm text-slate-400">
                Preparando seu painel de ordens de serviço e estoque...
              </p>
              <div className="flex items-center justify-center gap-2 text-cyan-400 text-xs font-mono">
                <Zap className="w-4 h-4 animate-spin" />
                <span>Entrando no sistema automaticamente...</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {erroEnvio && (
                <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{erroEnvio}</span>
                </div>
              )}

              {/* SEÇÃO 1: DADOS DO GESTOR E ACESSO */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <User className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    1. Dados do Responsável & Senha de Acesso
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nome do Responsável / Gestor *
                    </label>
                    <input
                      type="text"
                      required
                      value={nomeResponsavel}
                      onChange={(e) => setNomeResponsavel(e.target.value)}
                      placeholder="Ex: Carlos Eduardo"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      WhatsApp para Alertas *
                    </label>
                    <input
                      type="text"
                      required
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      placeholder="(21) 99999-9999"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    E-mail Oficial (Login de Acesso) *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="gestor@empresa.com.br"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Defina sua Senha de Acesso *
                    </label>
                    <div className="relative">
                      <input
                        type={mostrarSenha ? 'text' : 'password'}
                        required
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setMostrarSenha(!mostrarSenha)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Confirmar Senha *
                    </label>
                    <input
                      type={mostrarSenha ? 'text' : 'password'}
                      required
                      value={confirmarSenha}
                      onChange={(e) => setConfirmarSenha(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>

              {/* SEÇÃO 2: DADOS FISCAIS & CADASTRAIS */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    2. Dados Cadastrais da Empresa
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      CNPJ ou CPF do Titular *
                    </label>
                    <input
                      type="text"
                      required
                      value={cnpjOuCpf}
                      onChange={(e) => setCnpjOuCpf(e.target.value)}
                      placeholder="00.000.000/0001-00 ou CPF"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nome Fantasia / Razão Social
                    </label>
                    <input
                      type="text"
                      value={razaoSocial}
                      onChange={(e) => setRazaoSocial(e.target.value)}
                      placeholder="Nome oficial da assistência"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>
              </div>

              {/* SEÇÃO 3: ENDEREÇO DA ASSISTÊNCIA */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    3. Endereço da Unidade Principal (Matriz)
                  </h3>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>CEP</span>
                      {buscandoCep && <span className="text-[10px] text-cyan-400 animate-pulse">Buscando...</span>}
                    </label>
                    <input
                      type="text"
                      value={cep}
                      onChange={handleBuscarCep}
                      maxLength={9}
                      placeholder="00000-000"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Rua / Logradouro
                    </label>
                    <input
                      type="text"
                      value={logradouro}
                      onChange={(e) => setLogradouro(e.target.value)}
                      placeholder="Av. Principal, Rua do Comércio"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Número
                    </label>
                    <input
                      type="text"
                      value={numero}
                      onChange={(e) => setNumero(e.target.value)}
                      placeholder="123"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Bairro
                    </label>
                    <input
                      type="text"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                      placeholder="Centro"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Cidade / UF
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={cidade}
                        onChange={(e) => setCidade(e.target.value)}
                        placeholder="São Paulo"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                      />
                      <input
                        type="text"
                        value={uf}
                        maxLength={2}
                        onChange={(e) => setUf(e.target.value.toUpperCase())}
                        placeholder="SP"
                        className="w-12 bg-slate-950 border border-slate-800 rounded-xl px-2 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono text-center uppercase"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTÃO DE CONCLUSÃO */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm transition-all shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  {enviando ? (
                    <>
                      <Zap className="w-4 h-4 animate-spin" />
                      <span>Ativando Conta e Gerando Acesso...</span>
                    </>
                  ) : (
                    <>
                      <span>Concluir Cadastro e Iniciar Acesso</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Ambiente criptografado com Scrypt KDF e isolamento de banco Multi-Tenant</span>
                </div>
              </div>
            </form>
          )}
        </div>

        <div className="text-center">
          <Link to="/admin" className="text-xs text-slate-500 hover:text-cyan-400 transition-colors">
            Já possui login e senha cadastrados? Acesse a tela de login aqui
          </Link>
        </div>
      </div>
    </div>
  );
}
