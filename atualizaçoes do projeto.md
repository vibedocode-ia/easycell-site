### V1.03.01 (2026-10-14) - Atualização de credenciais oficiais do SuperAdmin e sincronização bidirecional PostgreSQL/Vault
- **Release:** Atualização de credenciais oficiais do SuperAdmin e sincronização bidirecional PostgreSQL/Vault

---

### V1.03.00 (2026-10-13) - Fase 4: Ativação Completa do SaaS EasyCell (Stripe, Planos, Dunning, Viral, CRM e SDR)
- **Release:** Fase 4: Ativação Completa do SaaS EasyCell (Stripe, Planos, Dunning, Viral, CRM e SDR)
- **Stripe Core & Checkout:** Integração com SDK do Stripe, checkout dinâmico (`/checkout/:planId`) com suporte a Cartão de Crédito, PIX e Boleto, trial de 7 dias no plano PRO e webhook Fastify com validação de assinatura HMAC e buffer raw-body.
- **Dunning & Grace Period (7 Dias):** Motor de inadimplência suave com tolerância de 7 dias para regularização, registro auditável de tentativas em `dunning_logs`, bloqueio não-destrutivo com `BlockOverlay` e desbloqueio imediato na quitação de fatura.
- **Motor de Indicação Viral:** Captura de parceiros via `/r/:slug`, tracking dinâmico e regras de bonificação (3 trials = 1 mês grátis; 1 conversão paga = 1 mês grátis) com aplicação de desconto na próxima fatura.
- **CRM Comercial & Funil Kanban:** Painel executivo `/admin/saas/crm` para gestão do pipeline de leads com lead scoring, filtros por temperatura (frio, morno, quente) e drawer de notas e histórico.
- **SofIA SDR & WhatsApp:** Campanhas de prospecção com taxa de envio controlada anti-banimento (1 msg/s), templates parametrizados (`{{nome}}`, `{{empresa}}`) e métricas de conversão.
- **Central de Suporte & SLA:** Chamados com isolamento estrito por inquilino (`/system/suporte`), painel centralizador para o Super Admin (`/admin/saas/suporte`), cálculo de SLA por prioridade e thread estilo chat.
- **Gestão de Assinatura:** Página do assinante (`/system/assinatura`) com upgrade pro-rata sem interrupção de serviço, histórico de consumo e link para o Stripe Customer Portal.
- **Suíte de Testes E2E & Hardening:** Teste ponta a ponta `test_saas_fase4.js` com 100% de aprovação nos 7 fluxos críticos, zero regressões em fases anteriores e build de produção validado.

---

### V1.02.04 (2026-10-13) - Console Executivo SaasAdminLayout, Redirecionamento Direto do SuperAdmin e Higienização do Portal de Login
- **Release:** Console Executivo SaasAdminLayout, Redirecionamento Direto do SuperAdmin e Higienização do Portal de Login
- **SaasAdminLayout:** Criação do layout executivo dedicado para o Super Admin SaaS (`/admin/saas`), separando a interface administrativa de plataforma B2B da visão operacional de bancada/assistência técnica de conserto.
- **Redirecionamento Inteligente por Cargo:** Usuário com cargo `superadmin` é direcionado diretamente para o painel de controle SaaS (`/admin/saas`) ao fazer login.
- **Alternância Bidirecional SaaS ↔ Bancada:**
  - No SaaS: botão em destaque no Top Header e na Sidebar para acessar o sistema com "Visão do Cliente / Bancada" (`/system`).
  - Na Bancada: botão destacado no cabeçalho e card na sidebar permitindo retornar ao "Super Admin SaaS" com 1 clique.
- **Higienização do Login:** Removido o botão de teste de preenchimento rápido de credenciais na tela `/admin`.

---

### V1.02.03 (2026-10-13) - Unificação de JWT Secret no Middleware de Autenticação e Persistência de Vault em Disco
- **Release:** Unificação de JWT Secret no Middleware de Autenticação e Persistência de Vault em Disco
- **Correção da Troca de Senha:** Adicionado fallback unificado `DEFAULT_JWT_SECRET` em `middleware/auth.js` (`signJwt`, `verifyJwt` e `authenticateUser`), erradicando o erro 500 "Erro de configuração do servidor de autenticação" quando `JWT_SECRET` não estiver presente nas envs do Coolify.
- **Persistência de Vault em Disco:** Criada rotina de persistência do hash do SuperAdmin em `storage/superadmin_vault.json` para que as novas senhas definidas pelo Vanderson persistam automaticamente mesmo após restarts de container.
- **Suíte de Testes:** Inclusão de testes automatizados E2E em `server/test_remediation.js` cobrindo a rota `PUT /api/v1/auth/senha` com Scrypt KDF.

---

### V1.02.02 (2026-10-13) - Área do Usuário / Perfil, Troca de Senha Segura, Edição de Tenants SaaS e Purga Definitiva de Cache Zumbi
- **Release:** Área do Usuário / Perfil, Troca de Senha Segura, Edição de Tenants SaaS e Purga Definitiva de Cache Zumbi
- **Perfil & Troca de Senha:** Implementação da tela `/system/perfil` para qualquer usuário e superadmin, com alteração de senha segura (Scrypt KDF com salt 16 bytes), atualização de dados de contato e link direto no rodapé da Sidebar do sistema.
- **Edição de Empresas Clientes (SaaS):** Inclusão de botão e modal de edição completa de inquilinos na tela Super Admin (`/admin/saas`) e endpoint `PUT /api/v1/saas/tenants/:id` permitindo alterar nome, CNPJ, responsável, telefone, plano, mensalidade e limites.
- **Purga de Cache Zumbi & Chunk Recovery:** Nginx configurado com cabeçalho W3C `Clear-Site-Data: "cache"` para sanar navegadores travados em tela branca, e bloco `@chunk_recovery` que retorna script com reload forçado automático em vez de 404 quando um chunk antigo é requisitado.

---

### V1.02.01 (2026-10-13) - Blindagem Anti-Cache, ErrorBoundary Auto-Recovery e Provisionamento do SuperAdmin
- **Release:** Blindagem Anti-Cache, ErrorBoundary Auto-Recovery e Provisionamento do SuperAdmin
- **Auto-Recovery & Anti-Cache:** Inclusão de ErrorBoundary com captura de falhas de renderização, script inline de detecção e purga de cache de assets legados no `index.html`, desregistro de Service Workers antigos e headers `always` com `expires -1` no Nginx.
- **Resiliência de Storage:** Proteção de todos os `JSON.parse` de `localStorage` em `AuthContext.jsx`, `store.js` e `StoreSelector.jsx` para erradicar crashes em inicialização.
- **SuperAdmin Vanderson Oliveira:** Provisionamento do SuperAdmin oficial (`omd.vandersonoliveira@gmail.com`) com Scrypt KDF salt de 16 bytes e botão de preenchimento rápido em `LoginPage.jsx`.

---

### V1.02.00 (2026-10-13) - Fase 3: Multi-tenant B2B SaaS, Isolamento Estrito de Tenants, Super Admin e Gestão de Filiais
- **Release:** Fase 3: Multi-tenant B2B SaaS, Isolamento Estrito de Tenants, Super Admin e Gestão de Filiais
- **Multi-tenancy:** Schema com tabelas `tenants` (Starter, Pro, Enterprise) e `lojas`. Todas as entidades vinculadas a `tenantId` e `lojaId`.
- **Isolamento de Segurança:** Middleware `extractTenantContext` com bloqueio 403 para spoofing cross-tenant e suporte a superadmin.
- **Remediação WhatsApp:** Webhook SofIA blindado com mapeamento estrito telefone → cliente → O.S. única do tenant, erradicando aprovação em massa e rejeitando remetentes desconhecidos.
- **Laudo Pericial & Secrets:** Remoção de secrets em texto claro na UI, remoção de hash fake com `Math.random()`, integração com API PDFKit `/api/v1/laudos/generate-pdf`.
- **Healthcheck & Gestão:** Probe real no PostgreSQL (`SELECT 1`), painel Super Admin (`/admin/saas`), gestão de lojas e seletor global multi-filial no topo do sistema.

---

### V1.01.04 (2026-10-13) - Sanitização de credenciais na LoginPage, eliminação de estado default admin123 e resolução de versão dinâmica no backend
- **Release:** Sanitização de credenciais na LoginPage, eliminação de estado default admin123 e resolução de versão dinâmica no backend

---

### V1.01.03 (2026-10-13) - Sanatização Zero-Trust (Hermes Rodada 8): KDF Scrypt, Fail-Closed Estrito, RBAC em Laudos, npm test e Suíte de Testes Oficial
- **Release:** Sanatização Zero-Trust (Hermes Rodada 8): KDF Scrypt, Fail-Closed Estrito, RBAC em Laudos, npm test e Suíte de Testes Oficial

---

### V1.01.02 (2026-10-13) - Remediação Completa da Auditoria Hermes: Purge do .env, Backend Fastify no Docker, PDF Binário com SHA-256 e Idempotência Persistente
- **Release:** Remediação Completa da Auditoria Hermes: Purge do .env, Backend Fastify no Docker, PDF Binário com SHA-256 e Idempotência Persistente

---

### V1.01.01 (2026-10-12) - Fase 2 Completa: Automações de WhatsApp, Laudos em PDF A4 com SHA-256, Gestão de Técnicos e API Dedicada
- **Release:** Fase 2 Completa: Automações de WhatsApp, Laudos em PDF A4 com SHA-256, Gestão de Técnicos e API Dedicada

---

### V1.01.00 (2026-10-12) - Início da Fase 2: Módulo de Integrações (WhatsApp Bot, Relatórios Avançados e Multi-lojas)
- **Release:** Início da Fase 2: Módulo de Integrações (WhatsApp Bot, Relatórios Avançados e Multi-lojas)

---

# 📜 Atualizações do Projeto EasyCell

> Norma de Versionamento VibeDoCode: `V[MAJOR].[MINOR].[PATCH]`  
> Responsável: Vanderson Oliveira - VibeDoCode

---

### V1.00.02 (2026-10-12) - Restauração do Hero Cinematográfico & Blindagem Anti-Cache
- **Release:** Restauração do Hero Cinematográfico & Blindagem Anti-Cache
- **Hero:** Restauração completa do layout cinematográfico com background de vídeo responsivo (16:9 desktop e 9:16 vertical mobile), fallback para imagem da bancada futurista e formulário centralizado com efeito confetti.
- **Cache Control:** Configuração estrita de `Cache-Control: no-store, no-cache, must-revalidate` no Nginx e meta tags HTTP-Equiv no `index.html` para erradicar travamentos em tela branca por cache de chunks antigos no cliente.
- **Versionamento:** Implementação oficial do padrão de versionamento VibeDoCode e exibição da versão na UI.

---

### V1.00.01 (2026-10-12) - Suporte a Roteamento SPA no Nginx de Produção
- **Release:** Suporte a Roteamento SPA no Nginx de Produção
- **Infraestrutura:** Inclusão de `nginx.conf` com diretiva `try_files $uri $uri/ /index.html;` no container Docker para permitir atualização direta (F5) em rotas profundas (`/admin`, `/system/*`).

---

### V1.00.00 (2026-10-12) - Versão Base do MVP EasyCell
- **Release:** Versão Base do MVP EasyCell
- **Aplicação:** Implementação completa das 12 tasks do MVP com Drizzle ORM, PostgreSQL 16 (6 tabelas ativas), SPA routing, Login, Dashboard de balcão, Nova O.S. blindada com laudo de 4 fotos e senha 3x3, Kanban operacional, bancada técnica com baixa de peças e frente de caixa diário.
