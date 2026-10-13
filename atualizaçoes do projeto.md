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
