import React, { useState, useEffect } from 'react';
import { CircleDollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../../services/api';

const Sk = ({ className = '' }) => <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;

export default function OngFinanceView() {
  const [financeTab, setFinanceTab] = useState('visao_geral');
  const [kpis, setKpis]             = useState(null);
  const [movimentacoes, setMov]     = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    api.get('/api/donations/institution/finance')
      .then(res => {
        setKpis(res.data.kpis);
        setMov(res.data.movimentacoes);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <CircleDollarSign className="w-5 h-5 text-gray-500" /> Financeiro
        </h2>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {[['visao_geral', 'Visão geral'], ['movimentacoes', 'Movimentações']].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFinanceTab(id)}
              className={`pb-3 px-4 text-sm font-medium whitespace-nowrap transition-colors ${
                financeTab === id
                  ? 'border-b-2 border-green-500 text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {financeTab === 'visao_geral' ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-in slide-in-from-left-4">
              {[
                { label: 'Total recebido',  key: 'totalRecebido', accent: 'text-green-600' },
                { label: 'Doações recebidas', key: 'totalDoacoes', accent: 'text-gray-800' },
                { label: 'Ticket médio',    key: 'ticketMedio',   accent: 'text-gray-800' },
              ].map(({ label, key, accent }) => (
                <div key={key} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  {loading
                    ? <Sk className="h-7 w-3/4 mt-1" />
                    : <h3 className={`text-lg font-bold ${accent}`}>{kpis?.[key] ?? '—'}</h3>
                  }
                </div>
              ))}
            </div>

            {/* Últimas movimentações (top 3) */}
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Últimas movimentações</h3>
            <div className="space-y-3">
              {loading
                ? Array(3).fill(0).map((_, i) => <Sk key={i} className="h-12 w-full" />)
                : movimentacoes.length === 0
                  ? <p className="text-sm text-gray-400 text-center py-4">Nenhuma movimentação financeira ainda.</p>
                  : movimentacoes.slice(0, 3).map(mov => (
                    <MovRow key={mov.id} mov={mov} />
                  ))
              }
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setFinanceTab('movimentacoes')} className="text-green-600 text-sm font-medium hover:underline">
                Ver todas as movimentações
              </button>
            </div>
          </>
        ) : (
          <div className="animate-in slide-in-from-right-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Histórico completo de movimentações</h3>
            <div className="space-y-2 border border-gray-100 rounded-xl overflow-hidden">
              {loading
                ? Array(5).fill(0).map((_, i) => <Sk key={i} className="h-16 w-full" />)
                : movimentacoes.length === 0
                  ? <p className="text-sm text-gray-400 text-center py-8">Nenhuma movimentação encontrada.</p>
                  : movimentacoes.map(mov => (
                    <div key={mov.id} className="flex justify-between items-center p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${mov.isIncome ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {mov.isIncome ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-800 block">{mov.type}</span>
                          <span className="text-xs text-gray-500 block mt-0.5">{mov.date}</span>
                        </div>
                      </div>
                      <span className={`font-bold ${mov.isIncome ? 'text-green-600' : 'text-red-500'}`}>
                        {mov.amount}
                      </span>
                    </div>
                  ))
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MovRow({ mov }) {
  return (
    <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${mov.isIncome ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {mov.isIncome ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
        </div>
        <span className="text-sm font-medium text-gray-700">{mov.type}</span>
      </div>
      <div className="flex items-center gap-6">
        <span className={`text-sm font-medium ${mov.isIncome ? 'text-green-600' : 'text-red-500'}`}>
          {mov.amount}
        </span>
        <span className="text-xs text-gray-400 w-20 text-right">{mov.date}</span>
      </div>
    </div>
  );
}
