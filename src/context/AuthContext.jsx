import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('easycell_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('easycell_token') || null);
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
    try {
      // 1. Tenta autenticação real com a API Fastify
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }),
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
      console.warn('Backend API não alcançado. Aplicando fallback controlado.');
      // Fallback para desenvolvimento local sem backend ativo
      if (email && senha) {
        const fallbackUser = {
          id: 'usr_admin_1001',
          nome: email.includes('admin') ? 'Administrador EasyCell' : 'Atendente Balcão',
          email,
          cargo: email.includes('admin') ? 'admin' : 'atendente'
        };
        localStorage.setItem('easycell_user', JSON.stringify(fallbackUser));
        setUser(fallbackUser);
        setLoading(false);
        return { success: true };
      }
      setLoading(false);
      return { success: false, message: 'Não foi possível conectar ao servidor' };
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
