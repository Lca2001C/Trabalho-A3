import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from './SharedComponents';
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

  // Fetch inicial e ao mudar de página sem append
  useEffect(() => {
    fetchPage(page, search, false);
  }, [page]); // eslint-disable-line

  // Busca com debounce — reset página
  const handleSearch = (val) => {
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      fetchPage(1, val, false);
    }, 350);
  };

  // "Carregar mais" — appenda próxima página
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPage(nextPage, search, true);
  };

  const hasMore = page < meta.totalPages;
  const showing = doacoes.length;

  return (
    <Card className="h-full min-h-[500px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Histórico de Doações</h2>
          {!loading && (
            <p className="text-sm text-gray-500 mt-1">
              Exibindo {showing} de {meta.total} registros
            </p>
          )}
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Buscar doação..."
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-64"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              {['Data', 'Doador', 'Tipo', 'Valor/Itens', 'Destinatário'].map(h => (
                <th key={h} className="pb-3 text-sm font-medium text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array(LIMIT).fill(0).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {Array(5).fill(0).map((_, j) => (
                    <td key={j} className="py-4">
                      <div className="animate-pulse h-4 bg-gray-200 rounded" />
                    </td>
                  ))}
                </tr>
              ))
              : doacoes.map(d => (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-4 text-sm text-gray-800">{d.data}</td>
                  <td className="py-4 text-sm text-gray-800">{d.doador}</td>
                  <td className="py-4 text-sm text-gray-800">{d.tipo}</td>
                  <td className="py-4 text-sm text-gray-800">{d.valorItens}</td>
                  <td className="py-4 text-sm text-gray-800">{d.destinatario}</td>
                </tr>
              ))
            }
            {!loading && doacoes.length === 0 && (
              <tr>
                <td colSpan="5" className="py-8 text-center text-gray-500 text-sm">
                  Nenhuma doação encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Botão "Carregar mais" com paginação real */}
      {!loading && hasMore && (
        <div className="mt-6 flex flex-col items-center gap-2">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="text-green-600 text-sm font-medium hover:underline px-4 py-2 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {loadingMore
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Carregando...</>
              : `Carregar mais (${meta.total - showing} restantes)`
            }
          </button>
          <p className="text-xs text-gray-400">
            Página {page} de {meta.totalPages}
          </p>
        </div>
      )}
    </Card>
  );
}
