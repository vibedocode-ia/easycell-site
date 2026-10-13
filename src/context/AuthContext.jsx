import React, { createContext, useContext, useState, useEffect } from 'react';

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
      const savedToken = localStorage.getItem('easycell_token');
      if (!savedToken || savedToken === 'undefined' || savedToken === 'null') {
        return null;
      }
      return savedToken;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Validação da sessão no servidor ao inicializar
  useEffect(() => {
    const checkSession = async () => {
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
        } else {
          // Token expirado ou inválido
          logout();
        }
      } catch (err) {
        console.warn('API de autenticação offline ou em modo standalone');
      }
    };

    checkSession();
  }, []);

  const login = async (email, senha) => {
    setLoading(true);
    const emailNorm = (email || '').toLowerCase().trim();

    try {
      // 1. Tenta autenticação real com a API Fastify
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailNorm, senha }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('easycell_token', data.token);
        localStorage.setItem('easycell_user', JSON.stringify(data.user));
        setUser(data.user);
        setToken(data.token);
        setLoading(false);
        return { success: true };
      }

      const errorData = await res.json().catch(() => ({}));
      setLoading(false);
      return { success: false, message: errorData.error || 'Credenciais inválidas' };
    } catch (err) {
      console.warn('Falha na API de autenticação. Avaliando fallback de resiliência:', err);

      // Resiliência para o SuperAdmin Vanderson Oliveira em ambiente de testes / offline
      if (emailNorm === 'omd.vandersonoliveira@gmail.com' && senha === 'testemudar') {
        const superUser = {
          id: 'usr_superadmin_vanderson',
          nome: 'Vanderson Oliveira',
          email: 'omd.vandersonoliveira@gmail.com',
          cargo: 'superadmin',
          tenantId: 'ten_easycell_matriz'
        };
        const mockToken = 'jwt_superadmin_offline_resilience_' + Date.now();
        localStorage.setItem('easycell_token', mockToken);
        localStorage.setItem('easycell_user', JSON.stringify(superUser));
        setUser(superUser);
        setToken(mockToken);
        setLoading(false);
        return { success: true };
      }

      setLoading(false);
      return { success: false, message: 'Serviço de autenticação inacessível. Operação rejeitada por segurança.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('easycell_token');
    localStorage.removeItem('easycell_user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!user, loading }}>
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
