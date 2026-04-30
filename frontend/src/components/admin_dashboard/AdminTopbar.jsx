import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, Bell } from 'lucide-react';

export default function AdminTopbar({ usuario }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between py-6 px-8 bg-transparent">
      <div>
        <h1 className="text-[22px] font-medium leading-tight flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}>
          Painel de Controle ⚙️
        </h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>
          Gerencie a plataforma e acompanhe o impacto social.
        </p>
      </div>

      <div className="flex items-center gap-5">
        
        {/* Toggle Tema */}
        <button 
          onClick={toggleTheme}
          className="w-[34px] h-[34px] rounded-full flex items-center justify-center border transition-all duration-300"
          style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            borderColor: 'var(--border)' 
          }}
        >
          {theme === 'light' ? <Moon size={16} className="text-slate-600" /> : <Sun size={16} className="text-amber-400" />}
        </button>

        {/* Notificações Admin */}
        <button className="w-[34px] h-[34px] rounded-full flex items-center justify-center border transition-all"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
          <Bell size={16} style={{ color: 'var(--text-secondary)' }} />
        </button>

        {/* Admin Badge */}
        <div className="flex items-center gap-3 pl-5 border-l" style={{ borderColor: 'var(--border)' }}>
          <div className="text-right hidden sm:block">
            <p className="text-[12px] font-bold" style={{ color: 'var(--text-primary)' }}>{usuario?.nome}</p>
            <p className="text-[10px] uppercase font-bold" style={{ color: 'var(--green-primary)' }}>Master Admin</p>
          </div>
          <div className="w-[34px] h-[34px] rounded-xl flex items-center justify-center text-white font-bold"
               style={{ background: 'linear-gradient(135deg, var(--green-primary), var(--green-dark))' }}>
            {usuario?.nome?.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
