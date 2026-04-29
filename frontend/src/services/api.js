// ============================================================================
// ConectaBem — Configuração do Axios (HTTP Client)
// ============================================================================
// Instância centralizada do Axios com:
//   • baseURL extraída de VITE_API_URL (variável de ambiente)
//   • Interceptor de requisição que injeta o token JWT automaticamente
//   • Interceptor de resposta que trata erros 401 (token expirado)
// ============================================================================

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Interceptor de Requisição ──────────────────────────────────────────────
// Antes de cada requisição, busca o token no localStorage e o injeta no header.
// Dessa forma, nenhum componente precisa se preocupar em enviar o token manualmente.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@ConectaBem:token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Interceptor de Resposta ────────────────────────────────────────────────
// Se a API retornar 401 (token inválido/expirado), limpa o localStorage e
// redireciona para a tela de login. Evita que o usuário fique em tela "travada".
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('@ConectaBem:token');
      localStorage.removeItem('@ConectaBem:user');

      // Redireciona para login apenas se não estiver já na tela de login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
