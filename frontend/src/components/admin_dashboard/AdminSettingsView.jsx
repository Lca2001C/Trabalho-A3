import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from './SharedComponents';
import api from '../../services/api';

export default function AdminSettingsView() {
  const [admins, setAdmins]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [newEmail, setNewEmail]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [feedback, setFeedback]     = useState(null); // { type, message }

  const flash = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchAdmins = useCallback(() => {
    setLoading(true);
    // 'Administradores' é a chave esperada pelo roleMap no adminController.js
    api.get('/api/admin/users', { params: { role: 'Administradores' } })
      .then(res => setAdmins(res.data))
      .catch(() => flash('error', 'Erro ao carregar administradores.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  // ── Adicionar admin: busca o usuário pelo e-mail e promove ──
  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setSubmitting(true);
    try {
      // 1. Busca o usuário pelo e-mail
      const res = await api.get(`/api/admin/users?search=${encodeURIComponent(newEmail.trim())}`);
      const user = res.data.find(u => u.email.toLowerCase() === newEmail.trim().toLowerCase());
      if (!user) {
        flash('error', 'Nenhum usuário encontrado com esse e-mail.');
        return;
      }
      if (user.tipo === 'Administrador') {
        flash('error', 'Este usuário já é administrador.');
        return;
      }
      // 2. Promove
      await api.post(`/api/admin/users/${user.id}/promote`);
      flash('success', `${user.nome} agora é administrador!`);
      setNewEmail('');
      fetchAdmins();
    } catch (err) {
      flash('error', err.response?.data?.erro ?? 'Erro ao adicionar administrador.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Remover admin ──
  const handleRemoveAdmin = async (admin) => {
    if (!confirm(`Remover privilégio admin de "${admin.nome}"?`)) return;
    setRemovingId(admin.id);
    try {
      await api.delete(`/api/admin/users/${admin.id}/promote`);
      flash('success', `${admin.nome} removido da lista de administradores.`);
      fetchAdmins();
    } catch (err) {
      flash('error', err.response?.data?.erro ?? 'Erro ao remover administrador.');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Configurações do Sistema</h2>

      <Card className="max-w-3xl">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Administradores do Sistema</h3>
        <p className="text-sm text-gray-500 mb-6">
          Informe o e-mail de um usuário cadastrado para promovê-lo a administrador. A alteração é persistida imediatamente no banco de dados.
        </p>

        {/* Feedback banner */}
        {feedback && (
          <div className={`flex items-center gap-2 p-3 rounded-lg mb-6 text-sm font-medium border ${
            feedback.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {feedback.type === 'success'
              ? <CheckCircle2 className="w-4 h-4 shrink-0" />
              : <AlertCircle   className="w-4 h-4 shrink-0" />
            }
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleAddAdmin} className="flex gap-4 mb-8">
          <input
            type="email"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            placeholder="Digite o e-mail do novo administrador..."
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 focus:bg-white transition-colors"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-green-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Adicionar'}
          </button>
        </form>

        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-sm font-medium text-gray-500">Nome</th>
                <th className="px-5 py-3 text-sm font-medium text-gray-500">E-mail de Acesso</th>
                <th className="px-5 py-3 text-sm font-medium text-gray-500 text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(2).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td colSpan="3" className="px-5 py-4">
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : admins.length > 0 ? (
                admins.map(admin => (
                  <tr key={admin.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-800 font-medium">{admin.nome}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{admin.email}</td>
                    <td className="px-5 py-4 text-sm text-right">
                      {removingId === admin.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400 ml-auto" />
                      ) : (
                        <button
                          onClick={() => handleRemoveAdmin(admin)}
                          className="text-red-500 hover:text-red-700 font-medium text-sm flex items-center justify-end w-full"
                        >
                          <Trash2 className="w-4 h-4 mr-1" /> Remover
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-5 py-8 text-center text-sm text-gray-500">
                    Nenhum administrador cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
