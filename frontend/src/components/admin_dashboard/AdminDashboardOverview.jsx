import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import api from '../../services/api';
import { StatsCard } from '../dashboard/NewUIComponents';
import { TrendingUp, Users, Building2, Heart } from 'lucide-react';

const COLORS = ['#16a34a', '#86efac'];

// Skeleton simples enquanto carrega
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

export default function AdminDashboardOverview({ setActiveTab }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/api/admin/stats')
      .then(res => setStats(res.data))
      .catch(() => setError('Não foi possível carregar as estatísticas.'))
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500 text-sm font-medium">
        {error}
      </div>
    );
  }

  const kpis = stats?.kpis ?? {};
  const chartData = stats?.chartData ?? [];
  const pieData = stats?.pieData ?? [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h2 className="text-[20px] font-medium" style={{ color: 'var(--text-primary)' }}>Dashboard Administrativo</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          label="Total Financeiro" 
          value={kpis.totalDoado ?? '—'} 
          icon={<TrendingUp size={20} />}
          isPoints={true}
        />
        <StatsCard 
          label="Total de Doações" 
          value={kpis.totalDoacoes ?? '—'} 
          icon={<Heart size={20} />}
          isPoints={true}
        />
        <StatsCard 
          label="ONGs Parceiras" 
          value={kpis.ongsCadastradas ?? '—'} 
          icon={<Building2 size={20} />}
          isPoints={true}
        />
        <StatsCard 
          label="Usuários Ativos" 
          value={kpis.usuariosCadastrados ?? '—'} 
          icon={<Users size={20} />}
          isPoints={true}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card-base p-6 lg:col-span-2">
          <h3 className="text-[15px] font-medium mb-6" style={{ color: 'var(--text-primary)' }}>Doações (Últimos 6 meses)</h3>
          <div className="h-64 w-full">
            {loading ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dx={-10} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-primary)', 
                      borderRadius: '12px', 
                      border: '0.5px solid var(--border)',
                      boxShadow: 'var(--shadow-card)' 
                    }} 
                  />
                  <Line type="monotone" dataKey="value" stroke="var(--green-primary)" strokeWidth={3}
                    dot={{ r: 4, fill: 'var(--green-primary)', strokeWidth: 2, stroke: 'var(--bg-primary)' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card-base p-6">
          <h3 className="text-[15px] font-medium mb-6" style={{ color: 'var(--text-primary)' }}>Doações por tipo</h3>
          <div className="h-64 w-full flex flex-col items-center justify-center relative">
            {loading ? <Skeleton className="h-full w-full" /> : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80}
                      paddingAngle={5} dataKey="value">
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `${v}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 mt-4 w-full">
                  {pieData.map((entry, i) => (
                    <div key={i} className="flex items-center justify-between text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                        {entry.name}
                      </div>
                      <span style={{ color: 'var(--text-primary)' }}>{entry.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Últimas Doações — agora via API */}
      <LatestDonationsTable setActiveTab={setActiveTab} loading={loading} />
    </div>
  );
}

function LatestDonationsTable({ setActiveTab, loading }) {
  const [doacoes, setDoacoes] = useState([]);
  const [fetchingDoacoes, setFetchingDoacoes] = useState(true);

  useEffect(() => {
    api.get('/api/admin/donations?limit=5')
      .then(res => setDoacoes(res.data.data || []))
      .catch(() => {})
      .finally(() => setFetchingDoacoes(false));
  }, []);

  return (
    <div className="card-base p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>Últimas Doações</h3>
        <button onClick={() => setActiveTab('doacoes')} 
                className="text-[12px] font-medium hover:underline"
                style={{ color: 'var(--green-primary)' }}>
          Ver todas
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              {['Data', 'Doador', 'Tipo', 'Valor/Itens', 'Destinatário'].map(h => (
                <th key={h} className="pb-3 text-[11px] uppercase font-bold tracking-wider" 
                    style={{ color: 'var(--text-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(fetchingDoacoes || loading)
              ? Array(5).fill(0).map((_, i) => (
                <tr key={i} className="border-b" style={{ borderColor: 'var(--border)' }}>
                  {Array(5).fill(0).map((_, j) => (
                    <td key={j} className="py-4"><Skeleton className="h-4 w-full" /></td>
                  ))}
                </tr>
              ))
              : doacoes.map(d => (
                <tr key={d.id} className="border-b last:border-0 hover:bg-[var(--bg-secondary)] transition-colors" 
                    style={{ borderColor: 'var(--border)' }}>
                  <td className="py-4 text-[13px]" style={{ color: 'var(--text-primary)' }}>{d.data}</td>
                  <td className="py-4 text-[13px]" style={{ color: 'var(--text-primary)' }}>{d.doador}</td>
                  <td className="py-4 text-[13px]" style={{ color: 'var(--text-primary)' }}>{d.tipo}</td>
                  <td className="py-4 text-[13px]" style={{ color: 'var(--text-primary)' }}>{d.valorItens}</td>
                  <td className="py-4 text-[13px]" style={{ color: 'var(--text-primary)' }}>{d.destinatario}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
