import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Loader2, UserPlus, ShieldCheck, Mail, Info } from 'lucide-react';
import api from '../../services/api';
import Swal from 'sweetalert2';

export default function AdminSettingsView() {
  const [admins, setAdmins]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [newEmail, setNewEmail]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const fetchAdmins = useCallback(() => {
    setLoading(true);
    api.get('/api/admin/users', { params: { role: 'Administradores' } })
      .then(res => setAdmins(res.data))
      .catch(() => Swal.fire('Erro', 'Não foi possível carregar os administradores.', 'error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAdmins(); }, [fetchAdmins]);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    
    setSubmitting(true);
    try {
      const res = await api.get(`/api/admin/users?search=${encodeURIComponent(newEmail.trim())}`);
      const user = res.data.find(u => u.email.toLowerCase() === newEmail.trim().toLowerCase());
      
      if (!user) {
        Swal.fire('Não encontrado', 'Nenhum usuário com este e-mail foi localizado.', 'warning');
        return;
      }
      
      if (user.tipo === 'Administrador') {
        Swal.fire('Atenção', 'Este usuário já possui privilégios administrativos.', 'info');
        return;
      }

      await api.post(`/api/admin/users/${user.id}/promote`);
      Swal.fire('Sucesso!', `${user.nome} agora é um administrador do sistema.`, 'success');
      setNewEmail('');
      fetchAdmins();
    } catch (err) {
      Swal.fire('Erro', 'Não foi possível adicionar o administrador.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveAdmin = async (admin) => {
    const confirm = await Swal.fire({
      title: 'Remover Acesso?',
      text: `Deseja remover os privilégios de "${admin.nome}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Sim, remover!'
    });

    if (confirm.isConfirmed) {
      setRemovingId(admin.id);
      try {
        await api.delete(`/api/admin/users/${admin.id}/promote`);
        Swal.fire('Removido', 'Privilégios revogados com sucesso.', 'success');
        fetchAdmins();
      } catch (err) {
        Swal.fire('Erro', 'Não foi possível remover o administrador.', 'error');
      } finally {
        setRemovingId(null);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 pb-20">
      <div className="mb-10">
        <h2 className="text-[20px] font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Configurações do Sistema</h2>
        <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>Gerencie permissões e acessos administrativos da plataforma.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* Card: Adicionar Admin */}
        <div className="card-base p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--green-light)', color: 'var(--green-primary)' }}>
              <UserPlus size={20} />
            </div>
            <h3 className="text-[16px] font-medium" style={{ color: 'var(--text-primary)' }}>Novo Administrador</h3>
          </div>

          <p className="text-[13px] mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Informe o e-mail de um usuário cadastrado para promovê-lo. O usuário passará a ter acesso total ao painel de controle.
          </p>

          <form onSubmit={handleAddAdmin} className="flex gap-3">
            <div className="relative flex-1">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
              <input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-[13px] border transition-all"
                style={{ 
                  backgroundColor: 'var(--bg-secondary)', 
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)'
                }}
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-slate-900 text-white text-[13px] font-bold hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-60 shadow-lg shadow-slate-100"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Promover'}
            </button>
          </form>
        </div>

        {/* Card: Lista de Admins */}
        <div className="card-base p-0 overflow-hidden">
          <div className="p-6 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3">
              <ShieldCheck size={20} style={{ color: 'var(--green-primary)' }} />
              <h3 className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>Administradores Ativos</h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <th className="px-6 py-4 text-[11px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>Nome</th>
                  <th className="px-6 py-4 text-[11px] uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>E-mail</th>
                  <th className="px-6 py-4 text-[11px] uppercase font-bold tracking-wider text-right" style={{ color: 'var(--text-muted)' }}>Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {loading ? (
                  Array(2).fill(0).map((_, i) => (
                    <tr key={i}><td colSpan="3" className="px-6 py-10"><div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" /></td></tr>
                  ))
                ) : admins.map(admin => (
                  <tr key={admin.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--bg-tertiary)] text-[12px] font-bold" style={{ color: 'var(--text-primary)' }}>
                          {admin.nome.charAt(0)}
                        </div>
                        <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{admin.nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px]" style={{ color: 'var(--text-secondary)' }}>{admin.email}</td>
                    <td className="px-6 py-4 text-right">
                      {removingId === admin.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400 ml-auto" />
                      ) : (
                        <button
                          onClick={() => handleRemoveAdmin(admin)}
                          className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all ml-auto block"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-5 flex items-center gap-3" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <Info size={16} className="opacity-40" />
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
              Administradores têm permissão para aprovar ONGs, gerenciar doações e visualizar relatórios financeiros sensíveis.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
