import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, Plus } from 'lucide-react';

export default function Topbar({ usuario, onNewDonation, onProfileClick }) {
  const { theme, toggleTheme } = useTheme();

  const getIniciais = (nome) => {
    if (!nome) return '??';
    const partes = nome.split(' ');
    if (partes.length > 1) return (partes[0][0] + partes[1][0]).toUpperCase();
    return partes[0].substring(0, 2).toUpperCase();
  };

  return (
    <header className="flex items-center justify-between py-6 px-8 bg-transparent">
      {/* Saudação */}
      <div>
        <h1 className="text-[22px] font-medium leading-tight flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}>
          Olá, {usuario?.nome?.split(' ')[0] || 'Usuário'} 👋
        </h1>
        <p className="text-[13px] mt-1" style={{ color: 'var(--text-secondary)' }}>
          Pronto para transformar vidas através das suas doações?
        </p>
      </div>

      {/* Ações */}
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

        {/* Botão Nova Doação */}
        <button
          onClick={onNewDonation}
          className="flex items-center gap-2 px-4 py-[9px] rounded-lg text-[13px] font-medium text-white transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-sm shadow-emerald-200"
          style={{ backgroundColor: 'var(--green-primary)' }}
        >
          <Plus size={16} strokeWidth={3} />
          Nova Doação
        </button>

        {/* Avatar e Perfil */}
        <div 
          onClick={onProfileClick}
          className="flex items-center gap-2 pl-2 border-l ml-2 border-slate-200 cursor-pointer group"
        >
          <div className="flex items-center gap-3 p-1 rounded-2xl hover:bg-[var(--bg-secondary)] transition-colors group">
            <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center border text-[12px] font-medium transition-transform group-hover:scale-105"
                 style={{ 
                   backgroundColor: 'var(--green-light)', 
                   borderColor: 'var(--green-dark)',
                   color: 'var(--green-text)'
                 }}>
              {getIniciais(usuario?.nome)}
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Meu Perfil</span>
              <span className="text-sm font-bold text-[var(--text-primary)] -mt-0.5">
                {usuario?.nome?.split(' ')[0] || 'Usuário'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
