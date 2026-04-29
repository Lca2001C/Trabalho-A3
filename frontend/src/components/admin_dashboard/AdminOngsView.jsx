import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Check, X, Loader2 } from 'lucide-react';
import { Card, Badge } from './SharedComponents';
import api from '../../services/api';

// Mapeia status do banco → aba do frontend
const STATUS_TAB_MAP = {
  PENDING: 'Pendentes',
  APPROVED: 'Aprovadas',
  REJECTED: 'Reprovadas',
};

export default function AdminOngsView({ selectedONG, setSelectedONG }) {
  const [ongStatusTab, setOngStatusTab] = useState('Pendentes');
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // id da ONG em ação
  const [error, setError] = useState(null);

  const tabs = ['Pendentes', 'Aprovadas', 'Reprovadas'];

  // Busca lista completa de ONGs
  const fetchInstitutions = useCallback(() => {
    setLoading(true);
    api.get('/api/admin/institutions')
      .then(res => setInstitutions(res.data))
      .catch(() => setError('Não foi possível carregar as ONGs.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchInstitutions(); }, [fetchInstitutions]);

  // Filtro pela aba ativa (usando o mapa de status)
  const filteredOngs = institutions.filter(
    ong => STATUS_TAB_MAP[ong.status] === ongStatusTab
  );

  // Aprovação
  const handleApprove = async (ong, e) => {
    e?.stopPropagation();
    setActionLoading(ong.id);
    try {
      const res = await api.post(`/api/admin/institutions/${ong.id}/approve`);
      // O backend já devolve a lista atualizada
      if (res.data.institutions) setInstitutions(res.data.institutions);
      else fetchInstitutions();
      if (selectedONG?.id === ong.id) setSelectedONG(null);
    } catch {
      alert('Erro ao aprovar ONG. Tente novamente.');
    } finally {
      setActionLoading(null);
    }
  };

  // Reprovação
  const handleReject = async (ong, e) => {
    e?.stopPropagation();
    const reason = prompt('Informe o motivo da reprovação (opcional):') ?? '';
    setActionLoading(ong.id);
    try {
      const res = await api.post(`/api/admin/institutions/${ong.id}/reject`, { reason });
      if (res.data.institutions) setInstitutions(res.data.institutions);
      else fetchInstitutions();
      if (selectedONG?.id === ong.id) setSelectedONG(null);
    } catch {
      alert('Erro ao reprovar ONG. Tente novamente.');
    } finally {
      setActionLoading(null);
    }
  };

  // ── Tela de Detalhe ──────────────────────────────────────────────────────
  if (selectedONG) {
    const ong = institutions.find(i => i.id === selectedONG.id) ?? selectedONG;
    const statusTab = STATUS_TAB_MAP[ong.status] ?? ong.status;

    return (
      <Card className="h-full min-h-[500px]">
        <div className="flex items-center space-x-3 mb-6">
          <button onClick={() => setSelectedONG(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-800">Detalhes da ONG</h2>
        </div>

        <div className="flex justify-between items-start mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{ong.nome}</h1>
          <Badge type={ong.status === 'APPROVED' ? 'success' : ong.status === 'REJECTED' ? 'danger' : 'warning'}>
            {statusTab}
          </Badge>
        </div>

        <div className="flex space-x-6 border-b border-gray-200 mb-6">
          <button className="pb-3 text-sm font-medium text-green-600 border-b-2 border-green-600">Informações</button>
          <button className="pb-3 text-sm font-medium text-gray-500 hover:text-gray-700">Documentos</button>
          <button className="pb-3 text-sm font-medium text-gray-500 hover:text-gray-700">Histórico</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-6">
          {[
            ['ID', `#${ong.id}`],
            ['Nome', ong.nome],
            ['CNPJ', ong.cnpj ?? '—'],
            ['E-mail', ong.email],
            ['Telefone', ong.telefone ?? '—'],
            ['Endereço', ong.endereco ?? '—'],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-sm text-gray-500 mb-1">{label}</p>
              <p className="text-sm font-medium text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {ong.descricaoInstituicao && (
          <div>
            <p className="text-sm text-gray-500 mb-2">Descrição</p>
            <p className="text-sm text-gray-800 leading-relaxed">{ong.descricaoInstituicao}</p>
          </div>
        )}

        {ong.status === 'PENDING' && (
          <div className="mt-10 flex gap-4">
            <button
              onClick={(e) => handleApprove(ong, e)}
              disabled={actionLoading === ong.id}
              className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center disabled:opacity-60"
            >
              {actionLoading === ong.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5 mr-2" /> Aprovar ONG</>}
            </button>
            <button
              onClick={(e) => handleReject(ong, e)}
              disabled={actionLoading === ong.id}
              className="flex-1 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center justify-center disabled:opacity-60"
            >
              {actionLoading === ong.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <><X className="w-5 h-5 mr-2" /> Reprovar ONG</>}
            </button>
          </div>
        )}
      </Card>
    );
  }

  // ── Tela de Lista ────────────────────────────────────────────────────────
  return (
    <Card className="h-full min-h-[500px]">
      <h2 className="text-xl font-bold text-gray-800 mb-6">ONGs</h2>

      <div className="flex space-x-6 border-b border-gray-200 mb-6">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setOngStatusTab(tab)}
            className={`pb-3 text-sm font-medium transition-colors ${
              ongStatusTab === tab
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {loading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse h-20 bg-gray-100 rounded-lg" />
          ))}
        </div>
      ) : filteredOngs.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          Nenhuma ONG encontrada nesta categoria.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOngs.map((ong) => (
            <div
              key={ong.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white"
              onClick={() => setSelectedONG(ong)}
            >
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-gray-500 shrink-0">
                  {ong.nome?.[0] ?? '?'}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{ong.nome}</h4>
                  <p className="text-xs text-gray-500 mt-1">CNPJ: {ong.cnpj ?? '—'}</p>
                  <p className="text-xs text-gray-500">{ong.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end" onClick={e => e.stopPropagation()}>
                {actionLoading === ong.id
                  ? <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  : (
                    <>
                      {ong.status === 'PENDING' && (
                        <>
                          <button
                            onClick={(e) => handleApprove(ong, e)}
                            className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                          >
                            Aprovar
                          </button>
                          <button
                            onClick={(e) => handleReject(ong, e)}
                            className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                          >
                            Reprovar
                          </button>
                        </>
                      )}
                      {ong.status === 'APPROVED' && (
                        <button
                          onClick={(e) => handleReject(ong, e)}
                          className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                        >
                          Revogar Aprovação
                        </button>
                      )}
                      {ong.status === 'REJECTED' && (
                        <button
                          onClick={(e) => handleApprove(ong, e)}
                          className="px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                        >
                          Reavaliar (Aprovar)
                        </button>
                      )}
                    </>
                  )
                }
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
