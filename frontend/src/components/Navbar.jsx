// ============================================================================
// ConectaBem — Header Premium (Navbar)
// ============================================================================

import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LogOut, 
  Star, 
  LayoutDashboard, 
  Gift, 
  HeartHandshake, 
  User as UserIcon,
  Bell
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  // Verifica se o link está ativo para dar destaque
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full transition-all duration-300 border-b"
         style={{
           background: 'rgba(255, 255, 255, 0.8)',
           backdropFilter: 'blur(12px)',
           WebkitBackdropFilter: 'blur(12px)',
           borderColor: 'rgba(226, 232, 240, 0.8)',
         }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* ── Esquerda: Logo ── */}
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-3 group no-underline">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-indigo-200"
                   style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}>
                <HeartHandshake className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-black tracking-tight hidden md:block"
                    style={{ 
                      background: 'linear-gradient(to right, #1e293b, #475569)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                ConectaBem
              </span>
            </Link>

            {/* ── Centro: Links de Navegação (Destaque para as páginas) ── */}
            <div className="hidden lg:flex items-center gap-1">
              <NavLink to="/dashboard" active={isActive('/dashboard')} icon={<LayoutDashboard size={18}/>} label="Início" />
              <NavLink to="/marketplace" active={isActive('/marketplace')} icon={<Gift size={18}/>} label="Recompensas" />
              <NavLink to="/minhas-doacoes" active={isActive('/minhas-doacoes')} icon={<Star size={18}/>} label="Minhas Doações" />
            </div>
          </div>

          {/* ── Direita: Ações e Perfil ── */}
          <div className="flex items-center gap-4">
            
            {/* Notificações (Simulado) */}
            <button className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors hidden sm:block">
              <Bell size={20} />
            </button>

            {/* Badge de Pontos Premium */}
            <div className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-2xl shadow-sm border transition-all hover:shadow-md"
                 style={{ 
                   background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                   borderColor: '#fde68a' 
                 }}>
              <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center shadow-inner">
                <Star className="text-white fill-current w-4 h-4" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">Pontos</span>
                <span className="text-sm font-black text-amber-900">
                  {user?.pontos ?? 0}
                </span>
              </div>
            </div>

            {/* Perfil e Logout */}
            <div className="flex items-center gap-2 pl-2 border-l ml-2 border-slate-200">
              <div className="flex items-center gap-3 p-1 rounded-2xl hover:bg-slate-50 transition-colors group cursor-pointer">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105"
                     style={{ background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)' }}>
                  {user?.nome ? user.nome.charAt(0).toUpperCase() : <UserIcon size={20}/>}
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Bem-vindo</span>
                  <span className="text-sm font-bold text-slate-700 -mt-0.5">
                    {user?.nome?.split(' ')[0] || 'Usuário'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="ml-2 p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 border border-transparent transition-all duration-200 group"
                title="Sair"
              >
                <LogOut size={20} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

/**
 * Sub-componente para links da navegação com estilo consistente
 */
function NavLink({ to, active, icon, label }) {
  return (
    <Link 
      to={to} 
      className={`
        flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 no-underline
        ${active 
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
          : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'}
      `}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
