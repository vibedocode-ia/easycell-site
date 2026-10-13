// Middleware de Resolução de Contexto Multi-Tenant para Fastify
export async function extractTenantContext(request, reply) {
  // 1. Se autenticado, obtém do token JWT
  const userTenant = request.user?.tenantId;
  const userLoja = request.user?.lojaId;
  const isSuperAdmin = request.user?.cargo === 'superadmin';

  // 2. Extrai cabeçalhos fornecidos pelo cliente/aplicação
  const headerTenant = request.headers['x-tenant-id'];
  const headerLoja = request.headers['x-loja-id'];

  // 3. Resolução com controle de isolamento
  let resolvedTenant = userTenant || headerTenant || 'ten_easycell_matriz';
  let resolvedLoja = headerLoja || userLoja || 'loj_matriz_centro';

  // Super Admin pode navegar em qualquer tenant via header
  if (isSuperAdmin && headerTenant) {
    resolvedTenant = headerTenant;
  } else if (userTenant && headerTenant && headerTenant !== userTenant) {
    // Tentativa de violação cross-tenant por usuário comum: BLOQUEIO IMEDIATO
    return reply.status(403).send({
      error: 'Violação de isolamento multi-tenant: Acesso negado a dados de outro inquilino.',
      code: 'CROSS_TENANT_VIOLATION'
    });
  }

  // 4. Injeta contexto normalizado na requisição
  request.tenantId = resolvedTenant;
  request.lojaId = resolvedLoja;
}
