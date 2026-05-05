import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Package, X, Loader2 } from 'lucide-react';
import api from '../../services/api';

const URGENCY_STYLE = {
  Alta: 'var(--coral-text)',
  Média: 'var(--amber-text)',
  Baixa: 'var(--green-text)',
};

const URGENCY_BG = {
  Alta: 'var(--pink-light)',
  Média: 'var(--amber-light)',
  Baixa: 'var(--green-light)',
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

      setRequestsList(prev => [res.data, ...prev]);
      setIsModalOpen(false);
      setNewRequest({ name: '', qty: '', urgency: 'Média' });
    } catch (err) {
      setError(err.response?.data?.erro ?? 'Erro ao criar solicitação.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div>
          <h2 className="text-[22px] md:text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>Solicitações de Itens 📦</h2>
          <p className="text-[13px] md:text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>Gerencie o que sua instituição mais precisa no momento</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto h-[46px] px-6 rounded-xl text-[14px] font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-2"
          style={{ backgroundColor: 'var(--green-primary)' }}
        >
          <Plus size={18} strokeWidth={3} /> Nova Solicitação
        </button>
      </div>

      <div className="card-base p-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse h-16 bg-[var(--bg-tertiary)] rounded-xl" />
            ))}
          </div>
        ) : requestsList.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-[15px] font-medium" style={{ color: 'var(--text-muted)' }}>Sua ONG ainda não criou nenhuma solicitação de itens.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {requestsList.map(req => (
              <div key={req.id} className="flex items-center justify-between p-5 hover:bg-[var(--bg-secondary)] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                    <Package size={22} />
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold" style={{ color: 'var(--text-primary)' }}>{req.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[12px] font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                        Qtd: {req.qty}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider" 
                            style={{ backgroundColor: URGENCY_BG[req.urgency], color: URGENCY_STYLE[req.urgency] }}>
                        {req.urgency}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{req.date}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: req.status === 'Atendido' ? 'var(--green-primary)' : 'var(--amber-text)' }} />
                    <span className="text-[13px] font-bold" style={{ color: req.status === 'Atendido' ? 'var(--green-text)' : 'var(--amber-text)' }}>
                      {req.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in">
          <div className="card-base p-8 w-full max-w-md shadow-2xl relative" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[20px] font-bold" style={{ color: 'var(--text-primary)' }}>Nova Solicitação 📝</h3>
              <button onClick={() => { setIsModalOpen(false); setError(''); }} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="w-6 h-6" />
              </button>
            </div>

            {error && <p className="text-red-500 text-[13px] font-bold mb-4 p-3 bg-red-50 rounded-xl">{error}</p>}

            <form onSubmit={handleCreateRequest} className="space-y-5">
              <div>
                <label className="block text-[13px] font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>O que sua ONG precisa?</label>
                <input
                  type="text" required
                  placeholder="Ex: Fraldas P, Arroz, Cobertores..."
                  value={newRequest.name}
                  onChange={e => setNewRequest({ ...newRequest, name: e.target.value })}
                  className="w-full h-[48px] px-4 rounded-xl text-[14px] font-medium outline-none border transition-all focus:ring-2 focus:ring-green-500"
                  style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>Quantidade / Unidade</label>
                <input
                  type="text" required
                  placeholder="Ex: 50 pacotes, 100 unidades..."
                  value={newRequest.qty}
                  onChange={e => setNewRequest({ ...newRequest, qty: e.target.value })}
                  className="w-full h-[48px] px-4 rounded-xl text-[14px] font-medium outline-none border transition-all focus:ring-2 focus:ring-green-500"
                  style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>Nível de Urgência</label>
                <select
                  value={newRequest.urgency}
                  onChange={e => setNewRequest({ ...newRequest, urgency: e.target.value })}
                  className="w-full h-[48px] px-4 rounded-xl text-[14px] font-medium outline-none border transition-all focus:ring-2 focus:ring-green-500"
                  style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  <option value="Baixa">🟢 Baixa</option>
                  <option value="Média">🟡 Média</option>
                  <option value="Alta">🔴 Alta</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setError(''); }}
                  className="flex-1 h-[50px] rounded-xl text-[14px] font-bold transition-all hover:bg-[rgba(0,0,0,0.05)]"
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 h-[50px] flex items-center justify-center bg-[var(--green-primary)] text-white rounded-xl text-[14px] font-bold shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Publicar Solicitação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
