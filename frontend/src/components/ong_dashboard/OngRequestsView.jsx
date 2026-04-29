import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Package, X, Loader2 } from 'lucide-react';
import api from '../../services/api';

const URGENCY_STYLE = {
  Alta: 'text-red-600',
  Média: 'text-amber-600',
  Baixa: 'text-green-600',
};

export default function OngRequestsView() {
  const [requestsList, setRequestsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({ name: '', qty: '', urgency: 'Média' });
  const [error, setError] = useState('');

  // Busca solicitações da ONG logada
  useEffect(() => {
    api.get('/api/requests')
      .then(res => setRequestsList(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!newRequest.name || !newRequest.qty) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/api/requests', {
        name: newRequest.name,
        qty: newRequest.qty,
        urgency: newRequest.urgency,
      });

      // Adiciona a nova solicitação ao topo da lista sem refetch
      setRequestsList(prev => [res.data, ...prev]);
      setIsModalOpen(false);
      setNewRequest({ name: '', qty: '', urgency: 'Média' });
    } catch (err) {
      setError(err.response?.data?.erro ?? 'Erro ao criar solicitação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-gray-500" /> Solicitações de Itens
          </h2>
          <p className="text-sm text-gray-500 mt-1">Solicite itens que sua ONG precisa</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nova solicitação
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {loading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-xl" />
            ))}
          </div>
        ) : requestsList.length === 0 ? (
          <p className="text-center text-gray-500 py-4">Nenhuma solicitação criada ainda.</p>
        ) : (
          <div className="space-y-4">
            {requestsList.map(req => (
              <div key={req.id} className="flex items-center justify-between p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{req.name}</h4>
                    <div className="flex gap-3 mt-1">
                      <span className="text-xs text-gray-500">Quantidade: {req.qty}</span>
                      <span className="text-xs text-gray-500">
                        Urgência: <span className={`font-medium ${URGENCY_STYLE[req.urgency] ?? 'text-gray-700'}`}>{req.urgency}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm text-gray-400">{req.date}</span>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    req.status === 'Atendido' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {req.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Criar Nova Solicitação</h3>
              <button onClick={() => { setIsModalOpen(false); setError(''); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Item</label>
                <input
                  type="text" required
                  placeholder="Ex: Fraldas P, Arroz, etc."
                  value={newRequest.name}
                  onChange={e => setNewRequest({ ...newRequest, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                <input
                  type="text" required
                  placeholder="Ex: 50 pacotes"
                  value={newRequest.qty}
                  onChange={e => setNewRequest({ ...newRequest, qty: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgência</label>
                <select
                  value={newRequest.urgency}
                  onChange={e => setNewRequest({ ...newRequest, urgency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-white"
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setError(''); }}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar Solicitação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
