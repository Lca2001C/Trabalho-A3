import React from 'react';
import { 
  LayoutDashboard, 
  HeartHandshake, 
  Building2, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  ShieldCheck
} from 'lucide-react';

export default function AdminSidebar({ onLogout, currentView, onViewChange }) {
  
  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={15} />, label: 'Dashboard' },
    { id: 'doacoes', icon: <HeartHandshake size={15} />, label: 'Gestão de Doações' },
    { id: 'ongs', icon: <Building2 size={15} />, label: 'ONGs Parceiras' },
    { id: 'usuarios', icon: <Users size={15} />, label: 'Usuários' },
    { id: 'relatorios', icon: <FileText size={15} />, label: 'Relatórios' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen hidden md:flex flex-col z-40 transition-all duration-300"
           style={{ 
             width: '210px', 
             backgroundColor: 'var(--bg-sidebar)', 
             borderRight: '0.5px solid var(--border)' 
           }}>
      
      <div className="p-6 mb-2 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
             style={{ backgroundColor: 'var(--green-primary)' }}>
          <ShieldCheck size={18} className="text-white" />
        </div>
        <span className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Admin Panel
        </span>
      </div>

      <nav className="flex-1 px-0 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className="flex items-center gap-[10px] py-[9px] px-[18px] w-full transition-all duration-150 group relative"
              style={{
                backgroundColor: active ? 'var(--green-light)' : 'transparent',
                color: active ? 'var(--green-dark)' : 'var(--text-secondary)',
                fontWeight: active ? 500 : 400,
                fontSize: '13px',
                borderLeft: active ? '2.5px solid var(--green-primary)' : '2.5px solid transparent'
              }}
            >
              <span style={{ opacity: active ? 1 : 0.6 }} className="transition-opacity group-hover:opacity-100">
                {item.icon}
              </span>
              {item.label}
              {!active && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" 
                     style={{ backgroundColor: 'var(--bg-secondary)', zIndex: -1 }} />
              )}
            </button>
          );
        })}

        <div className="mt-auto mb-6">
          <div className="mx-4 mb-2" style={{ borderTop: '0.5px solid var(--border)' }} />
          
          <button onClick={() => onViewChange('configuracoes')}
                  className="flex items-center gap-[10px] py-[9px] px-[18px] w-full transition-all duration-150 group"
                  style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            <span className="opacity-60 group-hover:opacity-100"><Settings size={15} /></span>
            Configurações
          </button>

          <button onClick={onLogout}
                  className="flex items-center gap-[10px] py-[9px] px-[18px] w-full transition-all duration-150 group"
                  style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            <span className="opacity-60 group-hover:opacity-100 text-red-400"><LogOut size={15} /></span>
            Sair
          </button>
        </div>
      </nav>
    </aside>
  );
}
