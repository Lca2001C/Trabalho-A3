import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { Loader2, DollarSign } from 'lucide-react';

const Sk = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

export default function OngDashboardOverview({ setActiveTab }) {
  const [stats, setStats] = useState(null);
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Saque State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawData, setWithdrawData] = useState({ type: 'CPF', key: '', amount: '' });
  const [withdrawing, setWithdrawing] = useState(false);
  const [rawBalance, setRawBalance] = useState(0);

  const fetchDashboard = () => {
    setLoading(true);
    api.get('/api/donations/institution/received')
      .then(donRes => {
        const { doacoes, totalDinheiro } = donRes.data;

        // Últimas 3 transações financeiras
        const financeiras = doacoes
          .filter(d => d.tipo === 'financeira')
          .slice(0, 3)
          .map(d => {
            const isSaque = d.valor < 0;
            return {
              id: d.id,
              name: isSaque ? 'Saque (Você)' : (d.user?.nome ?? 'Anônimo'),
              amount: isSaque ? `- R$ ${Math.abs(d.valor).toLocaleString('pt-BR', {minimumFractionDigits:2})}` : `+ R$ ${(d.valor || 0).toLocaleString('pt-BR', {minimumFractionDigits:2})}`,
              isSaque,
              date: new Date(d.criadoEm).toLocaleDateString('pt-BR'),
            };
          });

        const doadores = new Set(doacoes.map(d => d.userId)).size;

        const calculatedTotal = doacoes
          .filter(d => d.tipo === 'financeira')
          .reduce((acc, curr) => acc + (curr.valor || 0), 0);

        setRawBalance(calculatedTotal);
        setStats({
          totalDinheiro: `R$ ${calculatedTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          totalDoacoes: doacoes.length,
          doadores,
        });
        setRecentDonations(financeiras);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleMask = (value, type) => {
    if (type === 'E-mail') return value;
    let v = value.replace(/\D/g, '');
    if (type === 'CPF') return v.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').substring(0, 14);
    if (type === 'CNPJ') return v.replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d{1,2})$/, '$1-$2').substring(0, 18);
    if (type === 'Telefone') return v.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2').substring(0, 15);
    return value;
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (withdrawData.type === 'E-mail' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(withdrawData.key)) {
      return Swal.fire('Erro', 'Formato de e-mail inválido', 'error');
    }

    const amountToWithdraw = parseFloat(withdrawData.amount);
    if (isNaN(amountToWithdraw) || amountToWithdraw <= 0 || amountToWithdraw > rawBalance) {
      return Swal.fire('Erro', 'Valor inválido ou superior ao saldo disponível.', 'error');
    }

    setWithdrawing(true);
    try {
      await api.post('/api/finance/withdraw', { 
        pixKey: withdrawData.key, 
        pixType: withdrawData.type,
        amount: amountToWithdraw
      });
      setShowWithdrawModal(false);
      setWithdrawData({ type: 'CPF', key: '', amount: '' });
      Swal.fire('Sucesso!', `Saque de R$ ${amountToWithdraw.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} solicitado com sucesso.`, 'success');
      fetchDashboard();
    } catch (err) {
      Swal.fire('Erro', err.response?.data?.erro || 'Erro ao solicitar saque.', 'error');
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[20px] font-bold" style={{ color: 'var(--text-primary)' }}>Visão Geral 📊</h2>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-base p-6 flex flex-col gap-1" style={{ backgroundColor: 'var(--green-light)', borderColor: 'var(--green-primary)', borderWidth: '1px' }}>
          <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--green-dark)' }}>Saldo em Conta</p>
          {loading ? <Sk className="h-8 w-3/4" /> : <h3 className="text-[28px] font-bold" style={{ color: 'var(--green-text)' }}>{stats?.totalDinheiro}</h3>}
        </div>
        <div className="card-base p-6 flex flex-col gap-1">
          <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Total Doações</p>
          {loading ? <Sk className="h-8 w-1/2" /> : <h3 className="text-[28px] font-bold" style={{ color: 'var(--text-primary)' }}>{stats?.totalDoacoes}</h3>}
        </div>
        <div className="card-base p-6 flex flex-col gap-1">
          <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Doadores Únicos</p>
          {loading ? <Sk className="h-8 w-1/2" /> : <h3 className="text-[28px] font-bold" style={{ color: 'var(--text-primary)' }}>{stats?.doadores}</h3>}
        </div>
      </div>

      {/* Chart placeholder + lista recente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras estático */}
        <div className="card-base p-6">
          <h3 className="text-[15px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Volume de Arrecadação <span className="font-normal text-[13px]" style={{ color: 'var(--text-secondary)' }}>(6 meses)</span>
          </h3>
          <div className="h-48 flex items-end justify-between gap-3 pt-4 px-2">
            {[20, 45, 65, 40, 75, 85].map((height, i) => (
              <div key={i} className="w-full flex flex-col items-center gap-3">
                <div className="w-full max-w-[32px] rounded-t-md transition-all duration-300 hover:opacity-80"
                  style={{ height: `${height}%`, backgroundColor: 'var(--green-primary)' }} />
                <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Doações recentes */}
        <div className="card-base p-6 flex flex-col">
          <h3 className="text-[15px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Transações Recentes</h3>
          <div className="space-y-1 flex-grow">
            {loading
              ? Array(3).fill(0).map((_, i) => <Sk key={i} className="h-12 w-full mb-2" />)
              : recentDonations.length === 0
                ? <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>Nenhuma transação financeira registrada.</p>
                : recentDonations.map(d => (
                  <div key={d.id} className="flex justify-between items-center py-3 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[14px] font-bold" style={{ color: d.isSaque ? 'var(--coral-text)' : 'var(--green-text)' }}>
                        {d.amount}
                      </span>
                      <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{d.date}</span>
                  </div>
                ))
            }
          </div>
          <button
            className="text-[13px] font-bold mt-4 self-end transition-opacity hover:opacity-70"
            style={{ color: 'var(--green-primary)' }}
            onClick={() => setActiveTab('doacoes')}
          >
            Ver extrato completo →
          </button>
        </div>
      </div>


      {/* Modal de Saque PIX */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="card-base w-full max-w-md p-8 shadow-2xl relative animate-in zoom-in-95 duration-200" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <h3 className="text-[20px] font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Solicitar Saque 🏦</h3>
            <p className="text-[14px] font-medium mb-6" style={{ color: 'var(--text-secondary)' }}>Transfira o saldo disponível para sua conta PIX.</p>
            
            <div className="p-5 mb-6 flex flex-col gap-1 rounded-2xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
              <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Saldo Disponível</p>
              <p className="text-[32px] font-bold" style={{ color: 'var(--green-primary)' }}>R$ {rawBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-5">
              <div>
                <label className="block text-[13px] font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>Tipo de Chave</label>
                <select 
                  value={withdrawData.type}
                  onChange={(e) => setWithdrawData({ ...withdrawData, type: e.target.value, key: '' })}
                  className="w-full h-[48px] px-4 rounded-xl text-[14px] font-medium focus:ring-2 focus:ring-green-500 outline-none border transition-all"
                  style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  <option value="CPF">CPF</option>
                  <option value="CNPJ">CNPJ</option>
                  <option value="Telefone">Telefone Celular</option>
                  <option value="E-mail">E-mail</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>Chave PIX</label>
                <input 
                  type={withdrawData.type === 'E-mail' ? 'email' : 'text'}
                  value={withdrawData.key}
                  onChange={(e) => setWithdrawData({ ...withdrawData, key: handleMask(e.target.value, withdrawData.type) })}
                  placeholder={`Digite seu ${withdrawData.type}`}
                  required
                  className="w-full h-[48px] px-4 rounded-xl text-[14px] font-medium focus:ring-2 focus:ring-green-500 outline-none border transition-all"
                  style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>Valor a Sacar (R$)</label>
                <input 
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={rawBalance}
                  value={withdrawData.amount}
                  onChange={(e) => setWithdrawData({ ...withdrawData, amount: e.target.value })}
                  placeholder="0,00"
                  required
                  className="w-full h-[48px] px-4 rounded-xl text-[14px] font-bold focus:ring-2 focus:ring-green-500 outline-none border transition-all"
                  style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--green-primary)' }}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 h-[50px] rounded-xl text-[14px] font-bold transition-all hover:bg-[rgba(0,0,0,0.05)]"
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={withdrawing || rawBalance <= 0}
                  className="flex-1 h-[50px] flex justify-center items-center rounded-xl text-[14px] font-bold text-white shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:scale-100"
                  style={{ backgroundColor: 'var(--green-primary)' }}
                >
                  {withdrawing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Saque'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
