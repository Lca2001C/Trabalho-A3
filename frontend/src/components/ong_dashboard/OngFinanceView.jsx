import React, { useState, useEffect } from 'react';
import { CircleDollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../../services/api';

const Sk = ({ className = '' }) => <div className={`animate-pulse bg-[var(--bg-tertiary)] rounded-lg ${className}`} />;

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-2">
        <div>
          <h2 className="text-[22px] md:text-[24px] font-bold" style={{ color: 'var(--text-primary)' }}>Financeiro 💰</h2>
          <p className="text-[13px] md:text-[14px] font-medium" style={{ color: 'var(--text-secondary)' }}>Controle de entradas e saídas da sua instituição</p>
        </div>
      </div>

      <div className="card-base p-0 overflow-hidden">
        {/* Custom Tabs */}
        <div className="flex p-1.5 md:p-2 bg-[var(--bg-tertiary)] rounded-t-xl overflow-x-auto no-scrollbar" style={{ borderBottom: '1px solid var(--border)' }}>
          {[['visao_geral', 'Visão Geral'], ['movimentacoes', 'Histórico de Movimentações']].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFinanceTab(id)}
              className={`px-4 md:px-6 py-2 md:py-2.5 text-[12px] md:text-[13px] font-bold rounded-lg transition-all whitespace-nowrap flex-1 sm:flex-none ${
                financeTab === id
                  ? 'bg-[var(--bg-primary)] shadow-sm'
                  : 'opacity-50 hover:opacity-100'
              }`}
              style={{ color: financeTab === id ? 'var(--green-primary)' : 'var(--text-secondary)' }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-8">
          {financeTab === 'visao_geral' ? (
            <div className="animate-in slide-in-from-left-4 duration-300">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {[
                  { label: 'Total Recebido',  key: 'totalRecebido', accent: 'var(--green-text)', bg: 'var(--green-light)', borderColor: 'var(--green-primary)' },
                  { label: 'Doações Recebidas', key: 'totalDoacoes', accent: 'var(--text-primary)', bg: 'var(--bg-secondary)', borderColor: 'var(--border)' },
                  { label: 'Ticket Médio',    key: 'ticketMedio',   accent: 'var(--text-primary)', bg: 'var(--bg-secondary)', borderColor: 'var(--border)' },
                ].map(({ label, key, accent, bg, borderColor }) => (
                  <div key={key} className="p-6 rounded-2xl border" style={{ backgroundColor: bg, borderColor: borderColor }}>
                    <p className="text-[12px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                    {loading
                      ? <Sk className="h-8 w-3/4 mt-1" />
                      : <h3 className="text-[24px] font-bold" style={{ color: accent }}>{kpis?.[key] ?? '—'}</h3>
                    }
                  </div>
                ))}
              </div>

              {/* Últimas movimentações (top 5) */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[16px] font-bold" style={{ color: 'var(--text-primary)' }}>Movimentações Recentes</h3>
                <button onClick={() => setFinanceTab('movimentacoes')} className="text-[13px] font-bold transition-opacity hover:opacity-70" style={{ color: 'var(--green-primary)' }}>
                  Ver histórico completo →
                </button>
              </div>
              
              <div className="space-y-3">
                {loading
                  ? Array(3).fill(0).map((_, i) => <Sk key={i} className="h-14 w-full" />)
                  : movimentacoes.length === 0
                    ? <p className="text-[14px] text-center py-12" style={{ color: 'var(--text-muted)' }}>Nenhuma movimentação financeira registrada.</p>
                    : movimentacoes.slice(0, 5).map(mov => (
                      <MovRow key={mov.id} mov={mov} />
                    ))
                }
              </div>
            </div>
          ) : (
            <div className="animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-[16px] font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Histórico Completo</h3>
              <div className="divide-y rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                {loading
                  ? Array(5).fill(0).map((_, i) => <Sk key={i} className="h-16 w-full" />)
                  : movimentacoes.length === 0
                    ? <p className="text-[14px] text-center py-12" style={{ color: 'var(--text-muted)' }}>Nenhuma movimentação encontrada.</p>
                    : movimentacoes.map(mov => (
                      <div key={mov.id} className="flex justify-between items-center p-5 hover:bg-[var(--bg-secondary)] transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" 
                               style={{ backgroundColor: mov.isIncome ? 'var(--green-light)' : 'var(--pink-light)', color: mov.isIncome ? 'var(--green-primary)' : 'var(--coral-text)' }}>
                            {mov.isIncome ? <ArrowDownRight size={22} /> : <ArrowUpRight size={22} />}
                          </div>
                          <div>
                            <span className="text-[15px] font-bold block" style={{ color: 'var(--text-primary)' }}>{mov.type}</span>
                            <span className="text-[12px] font-bold uppercase tracking-widest block mt-0.5" style={{ color: 'var(--text-muted)' }}>{mov.date}</span>
                          </div>
                        </div>
                        <span className="text-[16px] font-bold" style={{ color: mov.isIncome ? 'var(--green-text)' : 'var(--coral-text)' }}>
                          {mov.isIncome ? '+' : '-'}{mov.amount}
                        </span>
                      </div>
                    ))
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MovRow({ mov }) {
  return (
    <div className="flex justify-between items-center p-4 hover:bg-[var(--bg-secondary)] rounded-2xl transition-all border" style={{ borderColor: 'var(--border)' }}>
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" 
             style={{ backgroundColor: mov.isIncome ? 'var(--green-light)' : 'var(--pink-light)', color: mov.isIncome ? 'var(--green-primary)' : 'var(--coral-text)' }}>
          {mov.isIncome ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
        </div>
        <div>
          <span className="text-[14px] font-bold block" style={{ color: 'var(--text-primary)' }}>{mov.type}</span>
          <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{mov.date}</span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <span className="text-[14px] font-bold" style={{ color: mov.isIncome ? 'var(--green-text)' : 'var(--coral-text)' }}>
          {mov.isIncome ? '+' : '-'}{mov.amount}
        </span>
      </div>
    </div>
  );
}
