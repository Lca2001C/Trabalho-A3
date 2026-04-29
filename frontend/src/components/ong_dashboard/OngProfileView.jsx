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
    className: `w-full rounded-lg border px-3 py-2 text-sm text-gray-800 transition-colors outline-none ${
      editMode
        ? 'border-gray-300 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500'
        : 'border-transparent bg-gray-50 cursor-default'
    }`,
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-2xl">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Perfil da ONG</h2>
          </div>
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 text-sm text-green-600 font-medium hover:text-green-700 transition-colors"
            >
              <Pencil className="w-4 h-4" /> Editar perfil
            </button>
          ) : (
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-sm text-gray-500 font-medium hover:text-gray-700 transition-colors"
            >
              <X className="w-4 h-4" /> Cancelar
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Feedback banner */}
          {feedback && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm font-medium border ${
              feedback.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}>
              {feedback.type === 'success'
                ? <CheckCircle2 className="w-4 h-4 shrink-0" />
                : <AlertCircle  className="w-4 h-4 shrink-0" />
              }
              {feedback.message}
            </div>
          )}

          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Informações da ONG
          </h3>

          <div className="space-y-4">
            {/* Campos que permitem edição */}
            {[
              { label: 'Nome da ONG',    key: 'nome',     type: 'text'  },
              { label: 'Telefone',       key: 'telefone', type: 'text'  },
              { label: 'Endereço',       key: 'endereco', type: 'text'  },
            ].map(({ label, key, type }) => (
              <div key={key} className="grid grid-cols-3 items-center gap-4 py-2 border-b border-gray-50">
                <label className="text-sm text-gray-500">{label}</label>
                <div className="col-span-2">
                  <input type={type} {...field(key)} placeholder={editMode ? label : '—'} />
                </div>
              </div>
            ))}

            {/* CNPJ — somente leitura */}
            <div className="grid grid-cols-3 items-center gap-4 py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">CNPJ</span>
              <span className="text-sm font-medium text-gray-800 col-span-2">
                {user?.cnpj ?? '—'}
              </span>
            </div>

            {/* E-mail — somente leitura */}
            <div className="grid grid-cols-3 items-center gap-4 py-2 border-b border-gray-50">
              <span className="text-sm text-gray-500">E-mail</span>
              <span className="text-sm font-medium text-gray-800 col-span-2">
                {user?.email ?? '—'}
              </span>
            </div>

            {/* Descrição */}
            <div className="py-2 border-b border-gray-50">
              <label className="text-sm text-gray-500 block mb-2">Descrição da ONG</label>
              <textarea
                rows={3}
                placeholder={editMode ? 'Descreva a missão e objetivos da sua ONG...' : '—'}
                {...field('descricaoInstituicao')}
              />
            </div>

            {/* Necessidades urgentes */}
            <div className="py-2">
              <label className="text-sm text-gray-500 block mb-2">Necessidades urgentes</label>
              <textarea
                rows={2}
                placeholder={editMode ? 'Ex: Roupas de inverno, alimentos não perecíveis...' : '—'}
                {...field('necessidadesUrgentes')}
              />
            </div>
          </div>

          {/* Botão Salvar — só aparece em modo edição */}
          {editMode && (
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-8 rounded-lg transition-colors disabled:opacity-60"
              >
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                  : <><Save className="w-4 h-4" /> Salvar alterações</>
                }
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
