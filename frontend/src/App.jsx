// ============================================================================
// ConectaBem — App Principal (Roteamento)
// ============================================================================
// Define a estrutura de rotas da aplicação usando React Router DOM.
// Envolve tudo com o AuthProvider para que todas as telas tenham acesso
// ao estado do usuário logado via useAuth().
//
// Estrutura de rotas:
//   /login        → Público (redireciona para /dashboard se já logado)
//   /cadastro     → Público (redireciona para /dashboard se já logado)
//   /dashboard    → Protegido (PrivateRoute com Navbar + layout)
//   /nova-doacao  → Protegido (PrivateRoute com Navbar + layout)
//   *             → Redireciona para /login
// ============================================================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Componentes de rota
import PrivateRoute from './components/PrivateRoute';

// Páginas públicas
import Home from './pages/Home';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Páginas protegidas
import Dashboard from './pages/Dashboard';
import NovaDoacao from './pages/NovaDoacao';
import Marketplace from './pages/Marketplace';
import AdminDashboard from './pages/AdminDashboard';
import InstitutionDashboard from './pages/InstitutionDashboard';

// ─── Rota Pública ───────────────────────────────────────────────────────────
function RotaPublica({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'INSTITUTION') return <Navigate to="/ong/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

// ─── Rota Protegida por Role ────────────────────────────────────────────────
// Garante que apenas usuários com a role correta acessem a rota.
// Redireciona para /login se não autenticado, ou para /dashboard se role errada.
function RoleRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== allowedRole) return <Navigate to="/dashboard" replace />;
  return children;
}

// ─── App ────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas (login/cadastro) */}
          <Route path="/" element={
            <RotaPublica><Home /></RotaPublica>
          } />
          <Route path="/login" element={
            <RotaPublica><Login /></RotaPublica>
          } />
          <Route path="/cadastro" element={
            <RotaPublica><Cadastro /></RotaPublica>
          } />
          <Route path="/forgot-password" element={
            <RotaPublica><ForgotPassword /></RotaPublica>
          } />
          <Route path="/reset-password" element={
            <RotaPublica><ResetPassword /></RotaPublica>
          } />

          {/* Rotas protegidas por role — cada painel exige a role correta */}
          <Route path="/admin/dashboard" element={<RoleRoute allowedRole="ADMIN"><AdminDashboard /></RoleRoute>} />
          <Route path="/ong/dashboard" element={<RoleRoute allowedRole="INSTITUTION"><InstitutionDashboard /></RoleRoute>} />

          {/* Rotas protegidas do doador — envolvidas pelo PrivateRoute */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/nova-doacao" element={<NovaDoacao />} />
            <Route path="/marketplace" element={<Marketplace />} />
          </Route>

          {/* Rota padrão — redireciona para login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
