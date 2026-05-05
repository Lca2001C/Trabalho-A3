import React, { useState, useEffect } from 'react';
import { User, Pencil, X, Loader2, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function OngProfileView() {
  const { user, refreshUser } = useAuth();
  const [editMode, setEditMode]     = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback]     = useState(null);

  // Formulário com dados do AuthContext como valor inicial
  const [form, setForm] = useState({
    nome:                 '',
    telefone:             '',
    endereco:             '',
    descricaoInstituicao: '',
    necessidadesUrgentes: '',
  });

  // Popula formulário quando o usuário estiver carregado
  useEffect(() => {
    if (user) {
      setForm({
        nome:                 user.nome                 ?? '',
        telefone:             user.telefone             ?? '',
        endereco:             user.endereco             ?? '',
        descricaoInstituicao: user.descricaoInstituicao ?? '',
        necessidadesUrgentes: user.necessidadesUrgentes ?? '',
      });
    }
  }, [user]);

  const flash = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put('/api/auth/profile', form);
      await refreshUser(); // atualiza AuthContext com os dados novos
      flash('success', 'Perfil atualizado com sucesso!');
      setEditMode(false);
    } catch (err) {
      flash('error', err.response?.data?.erro ?? 'Erro ao salvar. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Restaura form com dados atuais do AuthContext
    setForm({
      nome:                 user?.nome                 ?? '',
      telefone:             user?.telefone             ?? '',
      endereco:             user?.endereco             ?? '',
      descricaoInstituicao: user?.descricaoInstituicao ?? '',
      necessidadesUrgentes: user?.necessidadesUrgentes ?? '',
    });
    setEditMode(false);
    setFeedback(null);
  };

  const field = (key) => ({
    value:    form[key],
    onChange: e => setForm(f => ({ ...f, [key]: e.target.value })),
    disabled: !editMode || submitting,
    className: `w-full h-[48px] px-4 rounded-xl text-[14px] font-medium transition-all outline-none border ${
      editMode
        ? 'focus:ring-2 focus:ring-green-500'
        : 'border-transparent cursor-default'
    }`,
    style: { 
      backgroundColor: editMode ? 'var(--bg-tertiary)' : 'var(--bg-secondary)', 
      borderColor: editMode ? 'var(--border)' : 'transparent',
      color: 'var(--text-primary)'
    }
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-3xl">
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>Perfil da ONG 🏢</h2>
          <p className="text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>Mantenha os dados da sua instituição sempre atualizados</p>
        </div>
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="h-[46px] px-6 rounded-xl text-[14px] font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:scale-[1.03] active:scale-[0.98] flex items-center gap-2"
            style={{ backgroundColor: 'var(--green-primary)' }}
          >
            <Pencil size={18} /> Editar Perfil
          </button>
        ) : (
          <button
            onClick={handleCancel}
            className="h-[46px] px-6 rounded-xl text-[14px] font-bold transition-all hover:bg-[rgba(0,0,0,0.05)] flex items-center gap-2"
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
          >
            <X size={18} /> Cancelar
          </button>
        )}
      </div>

      <div className="card-base p-8">
        <form onSubmit={handleSave} className="space-y-8">
          {/* Feedback banner */}
          {feedback && (
            <div className={`flex items-center gap-2 p-4 rounded-xl text-[14px] font-bold border animate-in slide-in-from-top-2 ${
              feedback.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {feedback.type === 'success'
                ? <CheckCircle2 size={18} className="shrink-0" />
                : <AlertCircle size={18} className="shrink-0" />
              }
              {feedback.message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Informações Básicas */}
            <div className="space-y-6">
              <h3 className="text-[12px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Dados Principais</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>Nome da Instituição</label>
                  <input type="text" {...field('nome')} placeholder="Nome completo" />
                </div>
                
                <div>
                  <label className="block text-[13px] font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>Telefone de Contato</label>
                  <input type="text" {...field('telefone')} placeholder="(00) 00000-0000" />
                </div>

                <div>
                  <label className="block text-[13px] font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>Endereço Completo</label>
                  <input type="text" {...field('endereco')} placeholder="Rua, Número, Bairro, Cidade" />
                </div>
              </div>
            </div>

            {/* Informações de Registro (Read Only) */}
            <div className="space-y-6">
              <h3 className="text-[12px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Registro e Acesso</h3>
              
              <div className="p-6 rounded-2xl border flex flex-col gap-5" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>CNPJ da Instituição</span>
                  <span className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>{user?.cnpj || 'Não informado'}</span>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>E-mail Administrativo</span>
                  <span className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>{user?.email || 'Não informado'}</span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Status da Conta</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-[14px] font-bold text-green-600">Ativa e Verificada</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 pt-2">
            <h3 className="text-[12px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Sobre a Instituição</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-[13px] font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>Missão e Descrição</label>
                <textarea
                  rows={4}
                  placeholder={editMode ? 'Conte um pouco sobre o trabalho da sua ONG...' : 'Sem descrição.'}
                  {...field('descricaoInstituicao')}
                  className={`${field('descricaoInstituicao').className} h-auto py-3 resize-none`}
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>Necessidades mais Críticas</label>
                <textarea
                  rows={4}
                  placeholder={editMode ? 'Quais itens sua instituição mais precisa hoje?' : 'Não informado.'}
                  {...field('necessidadesUrgentes')}
                  className={`${field('necessidadesUrgentes').className} h-auto py-3 resize-none`}
                />
              </div>
            </div>
          </div>

          {/* Botão Salvar */}
          {editMode && (
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="h-[52px] px-10 rounded-xl text-[15px] font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] disabled:opacity-50 flex items-center justify-center gap-3"
                style={{ backgroundColor: 'var(--green-primary)' }}
              >
                {submitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                {submitting ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
