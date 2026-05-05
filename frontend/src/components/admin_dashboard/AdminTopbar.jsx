import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, Bell, Home, Menu } from 'lucide-react';

export default function AdminTopbar({ usuario, onToggleMenu }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between py-4 md:py-6 px-4 md:px-8 bg-transparent">
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleMenu}
          className="md:hidden p-2 rounded-xl border transition-all"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-[18px] md:text-[22px] font-bold md:font-medium leading-tight flex items-center gap-2"
              style={{ color: 'var(--text-primary)' }}>
            Painel Admin ⚙️
          </h1>
          <p className="text-[11px] md:text-[13px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            Gerenciamento Geral
          </p>
        </div>
      </div>

      <div className="flex items-center gap-5">
        
        {/* Botão Home */}
        <a 
          href="/"
          className="w-[34px] h-[34px] rounded-full flex items-center justify-center border transition-all duration-300 hover:bg-[var(--bg-tertiary)]"
          title="Ir para Página Inicial"
          style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            borderColor: 'var(--border)',
            color: 'var(--text-secondary)'
          }}
        >
          <Home size={16} />
        </a>

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
        <button className="hidden sm:flex w-[34px] h-[34px] rounded-full items-center justify-center border transition-all"
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
