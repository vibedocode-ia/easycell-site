import './env.js';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { db } from '../../src/db/index.js';
import { usuarios } from '../../src/db/schema/auth.js';
import { eq } from 'drizzle-orm';
import { buscarUserVault, salvarUserVault } from '../routes/auth.js';

let clerkClientInstance = null;

export function getClerkClient() {
  if (!clerkClientInstance && process.env.CLERK_SECRET_KEY) {
    clerkClientInstance = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  }
  return clerkClientInstance;
}

// Cache em memória para claims de usuários do Clerk (TTL: 60s)
const userCache = new Map();
const CACHE_TTL_MS = 60 * 1000;

export async function verifyClerkSessionToken(token) {
  if (!process.env.CLERK_SECRET_KEY || !token) return null;

  try {
    const claims = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    return claims;
  } catch (err) {
    return null;
  }
}

export async function getClerkUserDetails(clerkUserId) {
  const cached = userCache.get(clerkUserId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const clerk = getClerkClient();
  if (!clerk) return null;

  try {
    const user = await clerk.users.getUser(clerkUserId);
    if (!user) return null;

    const primaryEmail = user.emailAddresses?.find(
      (e) => e.id === user.primaryEmailAddressId
    )?.emailAddress || user.emailAddresses?.[0]?.emailAddress || '';

    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || primaryEmail.split('@')[0];
    const phone = user.phoneNumbers?.[0]?.phoneNumber || '';

    const userData = {
      clerkId: user.id,
      email: primaryEmail.toLowerCase().trim(),
      nome: fullName,
      telefone: phone,
      imageUrl: user.imageUrl,
    };

    userCache.set(clerkUserId, { timestamp: Date.now(), data: userData });
    return userData;
  } catch (err) {
    console.warn('[Clerk] Falha ao consultar detalhes do usuário no Clerk:', err.message);
    return null;
  }
}

export async function syncClerkUserWithEasyCell(clerkUser) {
  if (!clerkUser || !clerkUser.email) return null;

  const emailNorm = clerkUser.email.toLowerCase().trim();

  // 1. SuperAdmin Oficial Vanderson Oliveira
  if (emailNorm === 'omd.vandersonoliveira@gmail.com') {
    return {
      id: 'usr_superadmin_vanderson',
      clerkId: clerkUser.clerkId,
      nome: 'Vanderson Oliveira',
      email: 'omd.vandersonoliveira@gmail.com',
      cargo: 'superadmin',
      tenantId: 'ten_easycell_matriz',
      lojaId: 'loja_matriz_principal',
      telefone: clerkUser.telefone || '(21) 99975-7549',
    };
  }

  // 2. Busca no banco de dados PostgreSQL
  let localUser = null;
  try {
    const userList = await db.select().from(usuarios).where(eq(usuarios.email, emailNorm)).limit(1);
    if (userList.length > 0) {
      localUser = userList[0];
    }
  } catch (dbErr) {
    console.warn('[EasyCell Auth] Banco offline ao buscar usuário, consultando cofre:', dbErr.message);
  }

  // 3. Fallback no cofre local se banco inacessível
  if (!localUser) {
    localUser = buscarUserVault(emailNorm);
  }

  // 4. Se o usuário já existe na base, retorna com roles e tenant mapeados
  if (localUser) {
    return {
      id: localUser.id,
      clerkId: clerkUser.clerkId,
      nome: localUser.nome || clerkUser.nome,
      email: localUser.email,
      cargo: localUser.cargo || 'atendente',
      tenantId: localUser.tenantId || `ten_${clerkUser.clerkId.slice(-8)}`,
      lojaId: localUser.lojaId || 'loja_principal',
      telefone: localUser.telefone || clerkUser.telefone || '',
    };
  }

  // 5. Se for um usuário novo cadastrado diretamente via Clerk: Auto-provisionamento
  const novoTenantId = `ten_loja_${clerkUser.clerkId.replace('user_', '').slice(0, 8)}`;
  const novoUserId = `usr_${clerkUser.clerkId.replace('user_', '').slice(0, 8)}`;

  const provisioned = {
    id: novoUserId,
    clerkId: clerkUser.clerkId,
    nome: clerkUser.nome,
    email: emailNorm,
    cargo: 'admin', // Primeiro usuário da organização assume perfil gestor/admin da loja
    tenantId: novoTenantId,
    lojaId: 'loja_principal',
    telefone: clerkUser.telefone || '',
    criadoEm: new Date().toISOString(),
  };

  // Salva no cofre resiliente
  try {
    salvarUserVault(provisioned);
  } catch (e) {}

  // Tenta persistir no Postgres
  try {
    await db.insert(usuarios).values({
      tenantId: provisioned.tenantId,
      lojaId: provisioned.lojaId,
      nome: provisioned.nome,
      email: provisioned.email,
      senhaHash: 'clerk_federated_auth',
      cargo: provisioned.cargo,
    }).catch(() => {});
  } catch (e) {}

  return provisioned;
}
