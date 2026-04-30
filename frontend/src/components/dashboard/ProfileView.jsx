import React, { useState } from 'react';
import { User, Mail, Shield, Camera, Save, CheckCircle } from 'lucide-react';
import api from '../../services/api';

export default function ProfileView({ usuario, onUpdate }) {
  const [nome, setNome] = useState(usuario?.nome || '');
  const [editando, setEditando] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSave = async () => {
    try {
      setFeedback({ type: 'info', msg: 'Salvando...' });
      await api.put('/api/auth/profile', { nome });
      await onUpdate(); // Atualiza o contexto global do usuário
      setFeedback({ type: 'success', msg: 'Perfil atualizado com sucesso!' });
      setEditando(false);
    } catch (err) {
      setFeedback({ type: 'error', msg: 'Erro ao atualizar perfil.' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto pt-6">
      <h2 className="text-xl font-medium mb-6" style={{ color: 'var(--text-primary)' }}>
        Seu Perfil
      </h2>

      {/* Card Principal */}
      <div className="card-base p-8 flex flex-col items-center">
        {/* Avatar Grande */}
        <div className="relative group mb-6">
          <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-emerald-100"
               style={{ background: 'linear-gradient(135deg, var(--green-primary), var(--green-dark))' }}>
            {usuario?.nome?.charAt(0).toUpperCase()}
          </div>
          <button className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-white border border-slate-200 text-slate-500 shadow-sm hover:text-emerald-600 transition-colors">
            <Camera size={16} />
          </button>
        </div>

        {/* Info do Usuário */}
        <div className="w-full space-y-4">
          <div className="flex flex-col">
            <label className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
              Nome Completo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={16} />
              <input 
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={!editando}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border transition-all"
                style={{ 
                  backgroundColor: editando ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                  borderColor: editando ? 'var(--green-primary)' : 'var(--border)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
              E-mail (Não editável)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={16} />
              <input 
                type="text"
                value={usuario?.email}
                disabled
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border opacity-60"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
              Nível de Acesso
            </label>
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--green-light)] text-[var(--green-text)] border border-[var(--green-dark)] border-opacity-10">
              <Shield size={16} />
              <span className="text-sm font-medium">{usuario?.role === 'USER' ? 'Doador' : usuario?.role}</span>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="mt-8 flex gap-3 w-full">
          {!editando ? (
            <button 
              onClick={() => setEditando(true)}
              className="flex-1 py-2.5 rounded-xl border font-medium transition-all hover:bg-slate-50"
              style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              Editar Informações
            </button>
          ) : (
            <>
              <button 
                onClick={() => { setEditando(false); setNome(usuario?.nome); }}
                className="flex-1 py-2.5 rounded-xl border font-medium transition-all"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl bg-[var(--green-primary)] text-white font-medium flex items-center justify-center gap-2"
              >
                <Save size={16} />
                Salvar Alterações
              </button>
            </>
          )}
        </div>

        {feedback && (
          <div className={`mt-4 text-sm flex items-center gap-2 ${feedback.type === 'success' ? 'text-emerald-600' : 'text-slate-500'}`}>
            {feedback.type === 'success' && <CheckCircle size={16} />}
            {feedback.msg}
          </div>
        )}
      </div>
    </div>
  );
}
