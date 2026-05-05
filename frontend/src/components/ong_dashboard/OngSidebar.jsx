import React from 'react';
import { 
  LayoutDashboard, 
  HeartHandshake, 
  CircleDollarSign, 
  Package, 
  ClipboardList, 
  FileText, 
  User, 
  LogOut,
  Leaf
} from 'lucide-react';

export default function OngSidebar({ onLogout, currentView, onViewChange }) {
  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={15} />, label: 'Dashboard' },
    { id: 'doacoes', icon: <HeartHandshake size={15} />, label: 'Doações recebidas' },
    { id: 'financeiro', icon: <CircleDollarSign size={15} />, label: 'Financeiro' },
    { id: 'itens', icon: <Package size={15} />, label: 'Itens recebidos' },
    { id: 'solicitacoes', icon: <ClipboardList size={15} />, label: 'Solicitações' },
    { id: 'comprovantes', icon: <FileText size={15} />, label: 'Comprovantes' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen hidden md:flex flex-col z-40 transition-all duration-300"
           style={{ 
             width: '210px', 
             backgroundColor: 'var(--bg-sidebar)', 
             borderRight: '0.5px solid var(--border)' 
           }}>
      
      {/* Logo Section */}
      <div className="p-6 mb-2 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
             style={{ backgroundColor: 'var(--green-primary)' }}>
          <Leaf size={18} className="text-white" />
        </div>
        <span className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>
          ConectaBem
        </span>
      </div>

      {/* Navigation */}
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

        {/* Bottom Section */}
        <div className="mt-auto mb-6">
          <div className="mx-4 mb-2" style={{ borderTop: '0.5px solid var(--border)' }} />
          
          <button onClick={() => onViewChange('perfil')}
                  className="flex items-center gap-[10px] py-[9px] px-[18px] w-full transition-all duration-150 group"
                  style={{ 
                    color: currentView === 'perfil' ? 'var(--green-dark)' : 'var(--text-secondary)',
                    backgroundColor: currentView === 'perfil' ? 'var(--green-light)' : 'transparent',
                    borderLeft: currentView === 'perfil' ? '2.5px solid var(--green-primary)' : '2.5px solid transparent',
                    fontSize: '13px' 
                  }}>
            <span style={{ opacity: currentView === 'perfil' ? 1 : 0.6 }} className="group-hover:opacity-100"><User size={15} /></span>
            Perfil
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
