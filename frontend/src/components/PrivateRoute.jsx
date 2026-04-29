// ============================================================================
// ConectaBem — Componente de Rota Protegida
// ============================================================================
// Wrapper que verifica autenticação antes de renderizar rotas internas.
// Usado no App.jsx para proteger Dashboard, NovaDoacao, etc.
//
// Comportamento:
//   • loading = true  → Exibe skeleton/loading screen
//   • user = null     → Redireciona para /login
//   • user = válido   → Renderiza <Outlet /> (rotas filhas)
// ============================================================================

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute() {
  const { user, loading } = useAuth();

  // ── Loading state: tela minimalista enquanto verifica o token ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
           style={{ background: '#f8fafc' }}>
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
               style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="text-sm font-medium" style={{ color: '#64748b' }}>
            Carregando...
          </p>
        </div>
      </div>
    );
  }

  // ── Sem autenticação → redireciona para login ──
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ── Autenticado → renderiza apenas rotas filhas (que possuem próprio layout) ──
  return <Outlet />;
}
