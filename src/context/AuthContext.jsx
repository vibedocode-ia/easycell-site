import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser, useAuth as useClerkAuth, useClerk } from '@clerk/react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('easycell_user');
      if (!saved || saved === 'undefined' || saved === 'null' || saved === '[object Object]') {
        return null;
      }
      return JSON.parse(saved);
    } catch (e) {
      console.warn('[EasyCell Auth] Sessão local corrompida. Higienizando.');
      try { localStorage.removeItem('easycell_user'); } catch {}
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      const savedToken = localStorage.getItem('easycell_token') || localStorage.getItem('easycell_auth_token');
      if (!savedToken || savedToken === 'undefined' || savedToken === 'null') {
        return null;
      }
      return savedToken;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // Integração com Hooks Oficiais do Clerk
  const { isLoaded: isClerkLoaded, isSignedIn: isClerkSignedIn, user: clerkUser } = useUser();
  const { getToken: getClerkToken } = useClerkAuth();
  const { signOut: clerkSignOut } = useClerk();

  // Sincronização automática do usuário autenticado no Clerk com o backend EasyCell
  useEffect(() => {
    if (!isClerkLoaded) return;

    if (isClerkSignedIn && clerkUser) {
      const syncWithBackend = async () => {
        setLoading(true);
        try {
          const sessionToken = await getClerkToken();
          if (!sessionToken) {
            setLoading(false);
            return;
          }

          // Salva token da sessão Clerk no storage local para compatibilidade de rotas
          localStorage.setItem('easycell_token', sessionToken);
          localStorage.setItem('easycell_auth_token', sessionToken);
          setToken(sessionToken);

          // Consulta o backend EasyCell para resolver tenant, loja e cargo associados
          const res = await fetch('/api/v1/auth/me', {
            headers: { Authorization: `Bearer ${sessionToken}` }
          });

          if (res.ok) {
            const data = await res.json();
            if (data.user) {
              setUser(data.user);
              localStorage.setItem('easycell_user', JSON.stringify(data.user));
            }
          } else {
            // Em caso de API em inicialização, constrói perfil inicial via dados do Clerk
            const primaryEmail = clerkUser.primaryEmailAddress?.emailAddress?.toLowerCase().trim() || '';
            const fallbackUser = {
              id: clerkUser.id,
              clerkId: clerkUser.id,
              email: primaryEmail,
              nome: clerkUser.fullName || clerkUser.firstName || primaryEmail.split('@')[0],
              cargo: primaryEmail === 'omd.vandersonoliveira@gmail.com' ? 'superadmin' : 'admin',
              tenantId: primaryEmail === 'omd.vandersonoliveira@gmail.com' ? 'ten_easycell_matriz' : `ten_loja_${clerkUser.id.slice(-8)}`,
              lojaId: 'loja_principal',
              telefone: clerkUser.primaryPhoneNumber?.phoneNumber || ''
            };
            setUser(fallbackUser);
            localStorage.setItem('easycell_user', JSON.stringify(fallbackUser));
          }
        } catch (err) {
          console.warn('[EasyCell Auth] Falha ao sincronizar sessão Clerk com backend:', err);
        } finally {
          setLoading(false);
        }
      };

      syncWithBackend();
    }
  }, [isClerkLoaded, isClerkSignedIn, clerkUser, getClerkToken]);

  // Validação da sessão legada no servidor ao inicializar (caso não esteja usando Clerk)
  useEffect(() => {
    if (isClerkSignedIn) return; // Se está no Clerk, o efeito acima gerencia

    const checkLegacySession = async () => {
      const savedToken = localStorage.getItem('easycell_token');
      if (!savedToken) return;

      try {
        const res = await fetch('/api/v1/auth/me', {
          headers: { Authorization: `Bearer ${savedToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          localStorage.setItem('easycell_user', JSON.stringify(data.user));
        } else if (res.status === 401 || res.status === 403) {
          logout();
        }
      } catch (err) {
        console.warn('API de autenticação offline ou em modo standalone');
      }
    };

    checkLegacySession();
  }, [isClerkSignedIn]);

  // Login tradicional / de bancada (fallback de alta resiliência)
  const login = async (email, senha) => {
    setLoading(true);
    const emailNorm = (email || '').toLowerCase().trim();

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailNorm, senha }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('easycell_token', data.token);
        localStorage.setItem('easycell_auth_token', data.token);
        localStorage.setItem('easycell_user', JSON.stringify(data.user));
        setUser(data.user);
        setToken(data.token);
        setLoading(false);
        return { success: true, user: data.user };
      }

      const errorData = await res.json().catch(() => ({}));
      setLoading(false);
      return { success: false, message: errorData.error || 'Credenciais inválidas' };
    } catch (err) {
      console.warn('Falha na API de autenticação. Avaliando fallback de resiliência:', err);

      // Resiliência para o SuperAdmin Vanderson Oliveira em ambiente offline
      if (emailNorm === 'omd.vandersonoliveira@gmail.com' && senha === 'EC@Entrar2026') {
        const superUser = {
          id: 'usr_superadmin_vanderson',
          nome: 'Vanderson Oliveira',
          email: 'omd.vandersonoliveira@gmail.com',
          cargo: 'superadmin',
          tenantId: 'ten_easycell_matriz',
          lojaId: 'loja_matriz_principal'
        };
        const mockToken = 'jwt_superadmin_offline_resilience_' + Date.now();
        localStorage.setItem('easycell_token', mockToken);
        localStorage.setItem('easycell_auth_token', mockToken);
        localStorage.setItem('easycell_user', JSON.stringify(superUser));
        setUser(superUser);
        setToken(mockToken);
        setLoading(false);
        return { success: true, user: superUser };
      }

      setLoading(false);
      return { success: false, message: 'Serviço de autenticação inacessível. Operação rejeitada por segurança.' };
    }
  };

  const updateUser = (userData) => {
    setUser((prev) => {
      const updated = { ...prev, ...userData };
      localStorage.setItem('easycell_user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = useCallback(async () => {
    try {
      if (isClerkSignedIn) {
        await clerkSignOut();
      }
    } catch (e) {
      console.warn('Erro ao finalizar sessão Clerk:', e);
    }
    localStorage.removeItem('easycell_token');
    localStorage.removeItem('easycell_auth_token');
    localStorage.removeItem('easycell_user');
    setUser(null);
    setToken(null);
  }, [isClerkSignedIn, clerkSignOut]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      updateUser, 
      setUser, 
      isAuthenticated: !!user || !!isClerkSignedIn, 
      loading: loading || (!isClerkLoaded && !user),
      isClerkSignedIn,
      clerkUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
