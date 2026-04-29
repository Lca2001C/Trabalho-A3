import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Card } from './SharedComponents';
import api from '../../services/api';

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
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Dashboard Administrativo</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total doado (Financeiro)', key: 'totalDoado' },
          { label: 'Total de doações', key: 'totalDoacoes' },
          { label: 'ONGs cadastradas', key: 'ongsCadastradas' },
          { label: 'Usuários cadastrados', key: 'usuariosCadastrados' },
        ].map(({ label, key }) => (
          <Card key={key}>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            {loading
              ? <Skeleton className="h-8 mt-2 w-3/4" />
              : <p className="text-2xl font-bold text-gray-900 mt-2">{kpis[key] ?? '—'}</p>
            }
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-gray-800 mb-4">Doações (Últimos 6 meses)</h3>
          <div className="h-64 w-full">
            {loading ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={3}
                    dot={{ r: 4, fill: '#16a34a', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-800 mb-4">Doações por tipo</h3>
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
                <div className="flex justify-center gap-4 mt-2 w-full">
                  {pieData.map((entry, i) => (
                    <div key={i} className="flex items-center text-xs text-gray-600">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ background: COLORS[i % COLORS.length] }} />
                      {entry.name} ({entry.value}%)
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>
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
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-gray-800">Últimas Doações</h3>
        <button onClick={() => setActiveTab('doacoes')} className="text-green-600 text-sm font-medium hover:underline">
          Ver todas
        </button>
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
            {(fetchingDoacoes || loading)
              ? Array(5).fill(0).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {Array(5).fill(0).map((_, j) => (
                    <td key={j} className="py-4"><Skeleton className="h-4 w-full" /></td>
                  ))}
                </tr>
              ))
              : doacoes.map(d => (
                <tr key={d.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-4 text-sm text-gray-800">{d.data}</td>
                  <td className="py-4 text-sm text-gray-800">{d.doador}</td>
                  <td className="py-4 text-sm text-gray-800">{d.tipo}</td>
                  <td className="py-4 text-sm text-gray-800">{d.valorItens}</td>
                  <td className="py-4 text-sm text-gray-800">{d.destinatario}</td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </Card>
  );
}
