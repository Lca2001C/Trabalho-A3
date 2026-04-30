import React, { useState, useEffect, useCallback } from 'react';
import { Search, ShieldCheck, ShieldOff, Loader2, User, Building2, UserCog, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import Swal from 'sweetalert2';

export default function AdminUsersView() {
  const [tab, setTab]         = useState('Todos');
  const [search, setSearch]   = useState('');
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  const tabs = ['Todos', 'Doadores', 'ONGs', 'Administradores'];

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (tab !== 'Todos') params.set('role', tab);
    if (search.trim())   params.set('search', search.trim());

    api.get(`/api/admin/users?${params}`)
      .then(res => setUsers(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab, search]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const handlePromote = async (user) => {
    const confirm = await Swal.fire({
      title: 'Promover Usuário?',
      text: `Deseja dar privilégios de Administrador para "${user.nome}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'var(--green-primary)',
      confirmButtonText: 'Sim, promover!'
    });

    if (confirm.isConfirmed) {
      setActionId(user.id);
      try {
        await api.post(`/api/admin/users/${user.id}/promote`);
        fetchUsers();
        Swal.fire('Promovido!', 'Usuário agora é Administrador.', 'success');
      } catch (e) {
        Swal.fire('Erro', e.response?.data?.erro ?? 'Erro ao promover.', 'error');
      } finally {
        setActionId(null);
      }
    }
  };

  const handleDemote = async (user) => {
    const confirm = await Swal.fire({
      title: 'Revogar Privilégios?',
      text: `Remover acesso Admin de "${user.nome}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Sim, revogar!'
    });

    if (confirm.isConfirmed) {
      setActionId(user.id);
      try {
        await api.delete(`/api/admin/users/${user.id}/promote`);
        fetchUsers();
        Swal.fire('Revogado', 'Privilégios removidos com sucesso.', 'info');
      } catch (e) {
        Swal.fire('Erro', e.response?.data?.erro ?? 'Erro ao revogar.', 'error');
      } finally {
        setActionId(null);
      }
    }
  };

  const getRoleBadge = (tipo) => {
    const styles = {
      Administrador: { bg: 'var(--amber-light)', color: 'var(--amber-text)', icon: <UserCog size={12} /> },
      ONG: { bg: 'var(--green-light)', color: 'var(--green-text)', icon: <Building2 size={12} /> },
      Doador: { bg: 'var(--bg-tertiary)', color: 'var(--text-secondary)', icon: <User size={12} /> }
    };
    const s = styles[tipo] || styles.Doador;
    return (
      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider w-fit"
            style={{ backgroundColor: s.bg, color: s.color }}>
        {s.icon} {tipo}
      </span>
    );
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h2 className="text-[20px] font-medium" style={{ color: 'var(--text-primary)' }}>Gerenciar Usuários</h2>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Nome ou e-mail..."
            className="pl-10 pr-4 py-2.5 rounded-xl text-[13px] border w-full md:w-64 transition-all"
            style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      <div className="flex gap-4 p-1 rounded-xl mb-8 w-fit" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-lg text-[12px] font-medium transition-all"
            style={{ 
              backgroundColor: tab === t ? 'var(--bg-primary)' : 'transparent',
              color: tab === t ? 'var(--green-primary)' : 'var(--text-secondary)',
              boxShadow: tab === t ? 'var(--shadow-card)' : 'none'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                {['Usuário', 'E-mail', 'Tipo de Conta', 'Status', 'Ações'].map(h => (
                  <th key={h} className="px-6 py-4 text-[11px] uppercase font-bold tracking-wider" 
                      style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(5).fill(0).map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
                             style={{ background: 'linear-gradient(135deg, var(--green-primary), var(--green-dark))' }}>
                          {user.nome.charAt(0)}
                        </div>
                        <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{user.nome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px]" style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                    <td className="px-6 py-4">{getRoleBadge(user.tipo)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-[13px] font-medium" 
                           style={{ color: user.status === 'Ativo' ? 'var(--green-primary)' : 'var(--text-muted)' }}>
                        <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Ativo' ? 'bg-[var(--green-primary)]' : 'bg-[var(--text-muted)] opacity-50'}`} />
                        {user.status}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {actionId === user.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400 ml-auto" />
                      ) : user.tipo === 'Administrador' ? (
                        <button onClick={() => handleDemote(user)}
                                className="p-2 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-all ml-auto block"
                                title="Revogar Admin">
                          <ShieldOff size={16} />
                        </button>
                      ) : (
                        <button onClick={() => handlePromote(user)}
                                className="p-2 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all ml-auto block"
                                title="Promover a Admin">
                          <ShieldCheck size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <AlertCircle size={40} className="mx-auto mb-3 opacity-20" />
                    <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>Nenhum usuário encontrado.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
