// ============================================================================
// ConectaBem — Componente Navbar
// ============================================================================
// Barra de navegação fixa no topo da área logada.
// Exibe: logo, nome do usuário, badge de pontos e botão de logout.
// Design: clean, light, com backdrop-blur para transparência sutil.
// ============================================================================

import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl border-b"
         style={{
           background: 'rgba(255, 255, 255, 0.85)',
           borderColor: '#e2e8f0',
         }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* ── Logo + Nome ── */}
          <Link to="/dashboard" className="flex items-center gap-3 no-underline">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
              <span className="text-lg leading-none">🤝</span>
            </div>
            <span className="text-lg font-bold hidden sm:block"
                  style={{ color: '#0f172a' }}>
              ConectaBem
            </span>
          </Link>

          {/* ── Ações do Usuário ── */}
          <div className="flex items-center gap-3 sm:gap-4">

            {/* Badge de Pontos */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                 style={{ background: '#fef3c7', border: '1px solid #fde68a' }}>
              <span className="text-sm">⭐</span>
              <span className="text-sm font-bold" style={{ color: '#92400e' }}>
                {user?.pontos ?? 0}
              </span>
              <span className="text-xs font-medium hidden sm:inline" style={{ color: '#b45309' }}>
                pts
              </span>
            </div>

            {/* Nome do Usuário (desktop) */}
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                   style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
                {user?.nome?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <span className="text-sm font-medium" style={{ color: '#334155' }}>
                {user?.nome?.split(' ')[0] || 'Usuário'}
              </span>
            </div>

            {/* Botão Sair */}
            <button
              onClick={handleLogout}
              title="Sair da conta"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer border"
              style={{
                color: '#64748b',
                background: 'transparent',
                borderColor: '#e2e8f0',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#fef2f2';
                e.currentTarget.style.borderColor = '#fecaca';
                e.currentTarget.style.color = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.color = '#64748b';
              }}
            >
              {/* Ícone de logout (SVG inline, sem dependência) */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
