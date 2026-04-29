import React, { useState, useEffect, useCallback } from 'react';
import { Search, MoreVertical, ShieldCheck, ShieldOff, Loader2 } from 'lucide-react';
import { Card } from './SharedComponents';
import api from '../../services/api';

const TIPO_STYLE = {
  Administrador: 'bg-purple-100 text-purple-700',
  ONG:           'bg-green-100 text-green-700',
  Doador:        'bg-gray-100 text-gray-700',
};
const STATUS_COLOR = { Ativo: 'text-green-600', Pendente: 'text-amber-500', Inativo: 'text-red-500' };

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
    const t = setTimeout(fetchUsers, 300); // debounce busca
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const handlePromote = async (user) => {
    setActionId(user.id);
    try {
      await api.post(`/api/admin/users/${user.id}/promote`);
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.erro ?? 'Erro ao promover usuário.');
    } finally {
      setActionId(null);
    }
  };

  const handleDemote = async (user) => {
    if (!confirm(`Remover privilégio admin de "${user.nome}"?`)) return;
    setActionId(user.id);
    try {
      await api.delete(`/api/admin/users/${user.id}/promote`);
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.erro ?? 'Erro ao revogar admin.');
    } finally {
      setActionId(null);
    }
  };

  return (
    <Card className="h-full min-h-[500px]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Gerenciar Usuários</h2>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar usuário..."
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-64"
          />
        </div>
      </div>

      <div className="flex space-x-6 border-b border-gray-200 mb-6">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-3 text-sm font-medium transition-colors ${
              tab === t ? 'text-green-600 border-b-2 border-green-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              {['Nome', 'E-mail', 'Tipo', 'Status', ''].map(h => (
                <th key={h} className="pb-3 text-sm font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {Array(5).fill(0).map((_, j) => (
                    <td key={j} className="py-4">
                      <div className="animate-pulse h-4 bg-gray-200 rounded w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.length > 0 ? (
              users.map(user => (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-4 text-sm font-medium text-gray-900">{user.nome}</td>
                  <td className="py-4 text-sm text-gray-500">{user.email}</td>
                  <td className="py-4 text-sm">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${TIPO_STYLE[user.tipo] ?? 'bg-gray-100 text-gray-700'}`}>
                      {user.tipo}
                    </span>
                  </td>
                  <td className="py-4 text-sm">
                    <span className={`font-medium ${STATUS_COLOR[user.status] ?? 'text-gray-500'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    {actionId === user.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-gray-400 ml-auto" />
                    ) : user.tipo === 'Administrador' ? (
                      <button
                        onClick={() => handleDemote(user)}
                        title="Revogar Admin"
                        className="text-red-400 hover:text-red-600 p-1 ml-auto flex"
                      >
                        <ShieldOff className="w-4 h-4" />
                      </button>
                    ) : user.tipo === 'Doador' ? (
                      <button
                        onClick={() => handlePromote(user)}
                        title="Promover a Admin"
                        className="text-gray-400 hover:text-purple-600 p-1 ml-auto flex"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                    ) : (
                      <button className="text-gray-300 p-1">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
