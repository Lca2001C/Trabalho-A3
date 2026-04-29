// ============================================================================
// ConectaBem — Contexto de Autenticação
// ============================================================================
// Gerencia o estado global do usuário logado. Fornece:
//   • user       → dados do usuário logado (ou null)
//   • loading    → true enquanto verifica o token salvo ao carregar a página
//   • login()    → autentica, salva token no localStorage e atualiza o estado
//   • register() → cadastra, salva token no localStorage e atualiza o estado
//   • logout()   → limpa localStorage e reseta o estado
// ============================================================================

import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

// ─── Provider ───────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Verifica token salvo ao montar o componente ──
  // Se o usuário já tem um token válido no localStorage, busca seus dados
  // na rota /me e restaura a sessão automaticamente (sem precisar logar de novo).
  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('@ConectaBem:token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/api/auth/me');
        setUser(response.data);
      } catch {
        // Token inválido ou expirado — limpa tudo
        localStorage.removeItem('@ConectaBem:token');
        localStorage.removeItem('@ConectaBem:user');
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  // ── Login ──
  // Chama a API, salva o token e busca dados completos do usuário via /me
  async function login(email, senha) {
    const response = await api.post('/api/auth/login', { email, senha });
    const { token, nome, pontos, role, status } = response.data;

    // Persiste token no localStorage (o interceptor do axios já o usa)
    localStorage.setItem('@ConectaBem:token', token);
    localStorage.setItem('@ConectaBem:user', JSON.stringify({ nome, pontos, role, status }));

    // Busca dados completos do usuário via /me para ter o objeto completo
    const meResponse = await api.get('/api/auth/me');
    setUser(meResponse.data);

    return response.data;
  }

  // ── Refresh User ──
  // Busca dados atualizados do usuário sem precisar de reload na página
  async function refreshUser() {
    try {
      const response = await api.get('/api/auth/me');
      setUser(response.data);
      return response.data;
    } catch {
      // Silencia o erro — o interceptor já cuida de 401
      return null;
    }
  }

  // ── Registro ──
  // Cadastra e já faz login automático (a API retorna o token)
  async function register(nome, email, senha, tipo = 'doador') {
    const response = await api.post('/api/auth/register', { nome, email, senha, tipo });
    const { token, usuario } = response.data;

    localStorage.setItem('@ConectaBem:token', token);
    localStorage.setItem('@ConectaBem:user', JSON.stringify(usuario));

    setUser(usuario);

    return response.data;
  }

  // ── Logout ──
  function logout(e) {
    if (e && e.preventDefault) e.preventDefault();
    localStorage.removeItem('@ConectaBem:token');
    localStorage.removeItem('@ConectaBem:user');
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
    window.location.replace('/login');
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook customizado ───────────────────────────────────────────────────────
// Uso nos componentes: const { user, login, logout } = useAuth();
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um <AuthProvider>.');
  }

  return context;
}
