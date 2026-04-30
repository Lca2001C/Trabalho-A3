import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Loader2, ChevronDown, History, Heart, DollarSign } from 'lucide-react';
import api from '../../services/api';

const LIMIT = 20;

export default function AdminDonationsView() {
  const [doacoes, setDoacoes]   = useState([]);
  const [meta, setMeta]         = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading]   = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch]     = useState('');
  const [page, setPage]         = useState(1);
  const searchTimeout           = useRef(null);

  const fetchPage = useCallback((pg, q, append = false) => {
    const setL = append ? setLoadingMore : setLoading;
    setL(true);
    const params = new URLSearchParams({ page: pg, limit: LIMIT });
    if (q.trim()) params.set('search', q.trim());

    api.get(`/api/admin/donations?${params}`)
      .then(res => {
        setMeta(res.data.meta);
        setDoacoes(prev => append ? [...prev, ...res.data.data] : res.data.data);
      })
      .catch(() => {})
      .finally(() => setL(false));
  }, []);

  useEffect(() => {
    fetchPage(page, search, false);
  }, [page]); // eslint-disable-line

  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      fetchPage(1, val, false);
    }, 350);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/api/admin/donations/${id}/status`, { status: newStatus });
      setDoacoes(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
    } catch (err) {
      alert('Erro ao atualizar status');
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPage(nextPage, search, true);
  };

  const hasMore = page < meta.totalPages;
  const showing = doacoes.length;

  return (
    <div className="animate-in fade-in duration-500">
      
      {/* Header com Busca */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-[20px] font-medium" style={{ color: 'var(--text-primary)' }}>Histórico de Doações</h2>
          {!loading && (
            <p className="text-[12px] mt-1" style={{ color: 'var(--text-secondary)' }}>
              Exibindo <span className="font-bold">{showing}</span> de {meta.total} registros na plataforma.
            </p>
          )}
        </div>

        <div className="relative group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 transition-colors" 
                  style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Doador, ONG ou item..."
            className="pl-10 pr-4 py-2.5 rounded-xl text-[13px] transition-all w-full md:w-72 border"
            style={{ 
              backgroundColor: 'var(--bg-primary)', 
              borderColor: 'var(--border)',
              color: 'var(--text-primary)'
            }}
          />
        </div>
      </div>

      {/* Tabela de Doações */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                {['Data', 'Doador', 'Tipo', 'Valor/Itens', 'Destinatário', 'Status', 'Ações'].map(h => (
                  <th key={h} className="px-6 py-4 text-[11px] uppercase font-bold tracking-wider" 
                      style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {loading
                ? Array(8).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(5).fill(0).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
                : doacoes.map(d => (
                  <tr key={d.id} className="hover:bg-[var(--bg-secondary)] transition-colors group">
                    <td className="px-6 py-4 text-[13px]" style={{ color: 'var(--text-primary)' }}>
                      <div className="flex items-center gap-2">
                        <History size={14} className="opacity-40" />
                        {d.data}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>{d.doador}</td>
                    <td className="px-6 py-4">
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-bold uppercase"
                            style={{ 
                              backgroundColor: d.tipo === 'financeira' ? 'var(--green-light)' : 'var(--bg-tertiary)',
                              color: d.tipo === 'financeira' ? 'var(--green-text)' : 'var(--text-secondary)'
                            }}>
                        {d.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                      <div className="flex items-center gap-1.5">
                        {d.tipo === 'financeira' ? <DollarSign size={14} className="text-emerald-500" /> : <Heart size={14} className="text-pink-500" />}
                        {d.valorItens}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px]" style={{ color: 'var(--text-secondary)' }}>{d.destinatario}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase"
                            style={{ 
                              backgroundColor: d.status === 'aprovada' ? 'var(--green-light)' : d.status === 'pendente' ? 'var(--bg-tertiary)' : '#fee2e2',
                              color: d.status === 'aprovada' ? 'var(--green-text)' : d.status === 'pendente' ? 'var(--text-secondary)' : '#b91c1c'
                            }}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {d.status === 'pendente' && (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(d.id, 'aprovada')}
                            className="px-3 py-1 rounded-md bg-emerald-500 text-white text-[11px] font-bold hover:bg-emerald-600 transition-colors"
                          >
                            Aprovar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              }
              {!loading && doacoes.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <div className="text-4xl mb-3 opacity-20">📂</div>
                    <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>Nenhuma doação encontrada.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginação */}
      {!loading && hasMore && (
        <div className="mt-8 flex flex-col items-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="group flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-bold transition-all border shadow-sm hover:scale-[1.02] active:scale-[0.98]"
            style={{ 
              backgroundColor: 'var(--bg-primary)', 
              borderColor: 'var(--border)',
              color: 'var(--text-primary)'
            }}
          >
            {loadingMore
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <><ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" /> Carregar mais registros</>
            }
          </button>
          <p className="text-[11px] mt-4 uppercase font-bold tracking-widest opacity-40" style={{ color: 'var(--text-muted)' }}>
            Página {page} de {meta.totalPages}
          </p>
        </div>
      )}
    </div>
  );
}
