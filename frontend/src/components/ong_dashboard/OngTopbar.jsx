import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, DollarSign } from 'lucide-react';

export default function OngTopbar({ usuario, onWithdraw, onProfileClick }) {
  const { theme, toggleTheme } = useTheme();

  const getIniciais = (nome) => {
    if (!nome) return '??';
    const partes = nome.split(' ');
    if (partes.length > 1) return (partes[0][0] + partes[1][0]).toUpperCase();
    return partes[0].substring(0, 2).toUpperCase();
  };

  return (
    <header className="flex items-center justify-between py-6 px-8 bg-transparent">
      {/* Saudação / Título */}
      <div className="flex flex-col">
        <h1 className="text-[24px] font-bold leading-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          Instituição: {usuario?.nome || 'ONG'} 🏢
        </h1>
        <p className="text-[14px] font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>
          Painel Administrativo da ONG
        </p>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-5">
        
        {/* Toggle Tema */}
        <button 
          onClick={toggleTheme}
          className="w-[38px] h-[38px] rounded-full flex items-center justify-center border transition-all duration-300"
          style={{ 
            backgroundColor: 'var(--bg-secondary)', 
            borderColor: 'var(--border)' 
          }}
        >
          {theme === 'light' ? <Moon size={18} className="text-slate-600" /> : <Sun size={18} className="text-amber-400" />}
        </button>

        {/* Botão Sacar */}
        <button
          onClick={onWithdraw}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-bold text-white transition-transform hover:scale-[1.03] active:scale-[0.98] shadow-md shadow-emerald-200"
          style={{ backgroundColor: 'var(--green-primary)' }}
        >
          <DollarSign size={18} strokeWidth={3} />
          Solicitar Saque
        </button>

        {/* Avatar e Perfil */}
        <div 
          onClick={onProfileClick}
          className="flex items-center gap-3 pl-4 border-l ml-2 cursor-pointer group"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-[var(--bg-secondary)] transition-colors">
            <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-[13px] font-bold transition-transform group-hover:scale-105"
                 style={{ 
                   backgroundColor: 'var(--green-light)', 
                   color: 'var(--green-text)'
                 }}>
              {getIniciais(usuario?.nome)}
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Perfil ONG</span>
              <span className="text-[14px] font-bold -mt-0.5" style={{ color: 'var(--text-primary)' }}>
                {usuario?.nome?.split(' ')[0] || 'Gestor'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
