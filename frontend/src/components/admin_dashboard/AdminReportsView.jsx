import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, HeartHandshake, Users, Building2, LayoutDashboard,
  Download, TrendingUp, TrendingDown, Loader2
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Card } from './SharedComponents';
import api from '../../services/api';

const COLORS = ['#16a34a', '#86efac'];

const PERIODOS = [
  { label: 'Últimos 6 meses', months: 6 },
  { label: 'Últimos 30 dias', days: 30 },
  { label: 'Este ano',        year: 'current' },
  { label: 'Ano passado',     year: 'last' },
];

function buildDateRange(preset) {
  const to = new Date();
  let from = new Date();
  if (preset.months)           { from.setMonth(from.getMonth() - preset.months); }
  else if (preset.days)        { from.setDate(from.getDate() - preset.days); }
  else if (preset.year === 'current') { from = new Date(to.getFullYear(), 0, 1); }
  else if (preset.year === 'last')    {
    from = new Date(to.getFullYear() - 1, 0, 1);
    to.setFullYear(to.getFullYear() - 1, 11, 31);
  }
  return {
    from: from.toISOString().slice(0, 10),
    to:   to.toISOString().slice(0, 10),
  };
}

const SK = ({ className = '' }) => <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />;

export default function AdminReportsView() {
  const [tab, setTab]             = useState('Visão Geral');
  const [periodoIdx, setPeriodoIdx] = useState(0);
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);

  const sidebarItems = [
    { id: 'Visão Geral', icon: FileText },
    { id: 'Financeiro',  icon: FileText },
  ];

  const fetchReport = useCallback(() => {
    setLoading(true);
    const range = buildDateRange(PERIODOS[periodoIdx]);
    api.get(`/api/admin/reports?from=${range.from}&to=${range.to}`)
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [periodoIdx]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const kpis = data?.kpis ?? {};
  const chartData = data?.chartData ?? [];
  const pieData   = data?.pieData   ?? [];

  return (
    <div className="flex flex-col md:flex-row gap-8 h-full">
      {/* Sidebar de tipos */}
      <div className="w-full md:w-56 space-y-2 shrink-0">
        <h3 className="text-lg font-bold text-gray-800 mb-6 px-1">Tipos de Relatório</h3>
        {sidebarItems.map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`w-full flex items-center px-4 py-3 text-sm rounded-xl transition-all ${
              tab === item.id
                ? 'font-semibold bg-green-600 text-white shadow-sm'
                : 'font-medium text-gray-600 hover:bg-white hover:text-green-600 hover:shadow-sm'
            }`}
          >
            <item.icon className="w-4 h-4 mr-3" /> {item.id}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 space-y-6">
        {/* Header + filtros */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Relatório: {tab}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Métricas de {tab.toLowerCase()} no período selecionado.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <select
              value={periodoIdx}
              onChange={e => setPeriodoIdx(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
            >
              {PERIODOS.map((p, i) => <option key={i} value={i}>{p.label}</option>)}
            </select>
            <button className="flex items-center justify-center px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap">
              <Download className="w-4 h-4 mr-2" /> Exportar PDF
            </button>
          </div>
        </div>

        {tab === 'Visão Geral' ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Arrecadação Total',      key: 'totalFinanceiro', accent: 'border-t-green-500',  trending: 'up' },
                { label: 'Doações Concluídas',     key: 'totalDoacoes',    accent: 'border-t-emerald-500', trending: 'up' },
                { label: 'Ticket Médio',           key: 'ticketMedio',     accent: 'border-t-purple-500',  trending: 'down' },
              ].map(({ label, key, accent, trending }) => (
                <Card key={key} className={`border-t-4 ${accent}`}>
                  <p className="text-sm text-gray-500 font-medium">{label}</p>
                  {loading
                    ? <SK className="h-9 mt-2 w-3/4" />
                    : <p className="text-3xl font-bold text-gray-900 mt-2">{kpis[key] ?? '—'}</p>
                  }
                  <div className={`mt-3 flex items-center text-xs font-medium w-fit px-2 py-1 rounded-md ${
                    trending === 'up' ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'
                  }`}>
                    {trending === 'up'
                      ? <TrendingUp   className="w-3 h-3 mr-1" />
                      : <TrendingDown className="w-3 h-3 mr-1" />
                    }
                    {loading ? '...' : 'No período'}
                  </div>
                </Card>
              ))}
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-8">
              {/* Evolução AreaChart */}
              <Card className="xl:col-span-2">
                <h3 className="font-bold text-gray-800 mb-6">Evolução de Doações (qtd/mês)</h3>
                <div className="h-72 w-full">
                  {loading ? <SK className="h-full w-full" /> : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#16a34a" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                        <Area type="monotone" dataKey="value" name="Doações" stroke="#16a34a" strokeWidth={3} fillOpacity={1} fill="url(#colorArea)" activeDot={{ r: 6, strokeWidth: 0 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Card>

              {/* PieChart */}
              <Card>
                <h3 className="font-bold text-gray-800 mb-6">Origem das Doações</h3>
                <div className="h-64 w-full relative">
                  {loading ? <SK className="h-full w-full" /> : (
                    <>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={5} dataKey="value">
                            {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={v => `${v}%`} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex justify-center gap-6 mt-2">
                        {pieData.map((d, i) => (
                          <div key={i} className="flex items-center text-sm text-gray-600 font-medium">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ background: COLORS[i % COLORS.length] }} />
                            {d.name} ({d.value}%)
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </Card>

              {/* Novos usuários no período */}
              <Card>
                <h3 className="font-bold text-gray-800 mb-6">Novos Doadores no Período</h3>
                <div className="flex items-center justify-center h-40">
                  {loading
                    ? <SK className="h-16 w-32" />
                    : (
                      <div className="text-center">
                        <p className="text-5xl font-extrabold text-green-600">{kpis.totalUsuarios ?? 0}</p>
                        <p className="text-sm text-gray-500 mt-2">novos usuários cadastrados</p>
                      </div>
                    )
                  }
                </div>
              </Card>
            </div>
          </>
        ) : tab === 'Financeiro' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-t-4 border-t-green-600">
               <p className="text-sm text-gray-500 font-medium">Arrecadação Total</p>
               <p className="text-3xl font-bold text-gray-900 mt-2">{kpis.totalFinanceiro || 'R$ 0,00'}</p>
            </Card>
            <Card>
              <h3 className="font-bold text-gray-800 mb-6">Distribuição por Categoria</h3>
              <div className="h-64 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center h-96 text-gray-500">
            <FileText className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-700">Tela de "{tab}"</p>
            <p className="text-sm">Dados detalhados para esta visualização serão carregados aqui.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
