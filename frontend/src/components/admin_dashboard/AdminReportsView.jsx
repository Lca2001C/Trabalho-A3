import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Zap
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import api from '../../services/api';
import { StatsCard } from '../dashboard/NewUIComponents';

const COLORS = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

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

const SK = ({ className = '' }) => <div className={`animate-pulse rounded-xl bg-[var(--bg-tertiary)] ${className}`} />;

export default function AdminReportsView() {
  const [tab, setTab]             = useState('Visão Geral');
  const [periodoIdx, setPeriodoIdx] = useState(0);
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);

  const sidebarItems = [
    { id: 'Visão Geral', icon: <BarChart3 size={16} /> },
    { id: 'Financeiro',  icon: <Zap size={16} /> },
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
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500 pb-10">
      
      {/* Sidebar de tipos de Relatório */}
      <div className="w-full lg:w-60 shrink-0">
        <h3 className="text-[12px] uppercase font-bold tracking-widest mb-4 opacity-40 px-2" style={{ color: 'var(--text-muted)' }}>
          Tipos de Relatório
        </h3>
        <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className="flex items-center gap-3 px-4 py-3 text-[13px] font-medium rounded-xl transition-all whitespace-nowrap"
              style={{ 
                backgroundColor: tab === item.id ? 'var(--green-light)' : 'transparent',
                color: tab === item.id ? 'var(--green-primary)' : 'var(--text-secondary)'
              }}
            >
              {item.icon} {item.id}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col gap-8">
        
        {/* Header de Filtros */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[var(--bg-primary)] p-6 rounded-[20px] border"
             style={{ borderColor: 'var(--border)' }}>
          <div>
            <h2 className="text-[18px] font-medium" style={{ color: 'var(--text-primary)' }}>{tab}</h2>
            <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>Métricas detalhadas do período.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none min-w-[160px]">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
              <select
                value={periodoIdx}
                onChange={e => setPeriodoIdx(Number(e.target.value))}
                className="w-full pl-9 pr-4 py-2.5 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-[12px] font-medium outline-none appearance-none cursor-pointer"
                style={{ color: 'var(--text-primary)' }}
              >
                {PERIODOS.map((p, i) => <option key={i} value={i}>{p.label}</option>)}
              </select>
            </div>
            
            <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[12px] font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-100">
              <Download size={14} /> Exportar PDF
            </button>
          </div>
        </div>

        {/* Visão de Dados */}
        <div className="flex flex-col gap-8">
          
          {/* KPIs Principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard label="Arrecadação Total" value={kpis.totalFinanceiro || 'R$ 0,00'} icon={<TrendingUp size={18} />} isPoints={false} />
            <StatsCard label="Doações Concluídas" value={kpis.totalDoacoes || '0'} icon={<Zap size={18} />} isPoints={true} />
            <StatsCard label="Ticket Médio" value={kpis.ticketMedio || 'R$ 0,00'} icon={<PieChartIcon size={18} />} isPoints={false} />
          </div>

          {/* Gráficos de Alta Fidelidade */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Gráfico de Área (Evolução) */}
            <div className="card-base p-6 xl:col-span-2">
              <h3 className="text-[15px] font-medium mb-8" style={{ color: 'var(--text-primary)' }}>Evolução Mensal de Doações</h3>
              <div className="h-[300px] w-full">
                {loading ? <SK className="h-full w-full" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="var(--green-primary)" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="var(--green-primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--bg-primary)', 
                          borderRadius: '12px', 
                          border: '0.5px solid var(--border)',
                          boxShadow: 'var(--shadow-card)',
                          fontSize: '12px'
                        }} 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        name="Doações" 
                        stroke="var(--green-primary)" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorArea)" 
                        activeDot={{ r: 5, strokeWidth: 0, fill: 'var(--green-primary)' }} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Gráfico de Pizza (Distribuição) */}
            <div className="card-base p-6">
              <h3 className="text-[15px] font-medium mb-8" style={{ color: 'var(--text-primary)' }}>Distribuição</h3>
              <div className="h-[240px] w-full relative">
                {loading ? <SK className="h-full w-full" /> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} cornerRadius={4} />)}
                      </Pie>
                      <Tooltip formatter={v => `${v}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="mt-6 flex flex-col gap-3">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                    </div>
                    <span className="text-[12px] font-bold" style={{ color: 'var(--text-primary)' }}>{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
