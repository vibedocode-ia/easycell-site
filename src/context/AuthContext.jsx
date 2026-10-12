import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('easycell_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email, senha) => {
    // Autenticação local/mock com suporte a admin e operador do balcão
    if (email && senha) {
      const mockUser = {
        id: 'usr_admin_1001',
        nome: email.includes('admin') ? 'Administrador EasyCell' : 'Atendente Balcão',
        email: email,
        cargo: email.includes('admin') ? 'admin' : 'atendente'
      };
      localStorage.setItem('easycell_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return { success: true };
    }
    return { success: false, message: 'Informe e-mail e senha.' };
  };

  const logout = () => {
    localStorage.removeItem('easycell_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
