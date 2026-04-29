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
        <h2 className="text-xl font-bold text-gray-800">Dashboard 💚</h2>
        <button 
          onClick={() => setShowWithdrawModal(true)}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors shadow-sm"
        >
          <DollarSign className="w-5 h-5" /> Sacar
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-6 rounded-2xl border border-green-100">
          <p className="text-sm text-gray-600 mb-2">Total recebido (financeiro)</p>
          {loading ? <Sk className="h-8 w-3/4" /> : <h3 className="text-2xl font-bold text-gray-900">{stats?.totalDinheiro}</h3>}
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-600 mb-2">Doações recebidas</p>
          {loading ? <Sk className="h-8 w-1/2" /> : <h3 className="text-2xl font-bold text-gray-900">{stats?.totalDoacoes}</h3>}
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-600 mb-2">Doadores únicos</p>
          {loading ? <Sk className="h-8 w-1/2" /> : <h3 className="text-2xl font-bold text-gray-900">{stats?.doadores}</h3>}
        </div>
      </div>

      {/* Chart placeholder + lista recente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras estático — substituir por Recharts quando backend tiver dados mensais */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Doações financeiras <span className="font-normal text-gray-500">(Últimos 6 meses)</span>
          </h3>
          <div className="h-48 flex items-end justify-between gap-2 pt-4">
            {[20, 45, 65, 40, 75, 85].map((height, i) => (
              <div key={i} className="w-1/6 flex flex-col items-center gap-2">
                <div className="w-8 bg-green-500 rounded-t-sm transition-all duration-500 hover:bg-green-600"
                  style={{ height: `${height}%` }} />
                <span className="text-xs text-gray-500">{['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Doações recentes */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Transações recentes</h3>
          <div className="space-y-4 flex-grow">
            {loading
              ? Array(3).fill(0).map((_, i) => <Sk key={i} className="h-10 w-full" />)
              : recentDonations.length === 0
                ? <p className="text-sm text-gray-400 text-center py-4">Nenhuma doação recebida.</p>
                : recentDonations.map(d => (
                  <div key={d.id} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <div className="flex flex-col">
                      <span className={`font-medium ${d.isSaque ? 'text-red-600' : 'text-green-600'}`}>{d.amount}</span>
                      <span className="text-xs text-gray-500">{d.name}</span>
                    </div>
                    <span className="text-xs text-gray-400">{d.date}</span>
                  </div>
                ))
            }
          </div>
          <button
            className="text-green-600 text-sm font-medium self-end mt-4 hover:underline"
            onClick={() => setActiveTab('doacoes')}
          >
            Ver todas
          </button>
        </div>
      </div>

      {/* Modal de Saque PIX */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl relative animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Saque via PIX</h3>
            <p className="text-sm text-gray-500 mb-6">Transfira o saldo disponível para sua conta.</p>
            
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6">
              <p className="text-sm text-green-800 font-medium">Saldo Disponível</p>
              <p className="text-3xl font-bold text-green-700 mt-1">R$ {rawBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Chave</label>
                <select 
                  value={withdrawData.type}
                  onChange={(e) => setWithdrawData({ ...withdrawData, type: e.target.value, key: '' })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white"
                >
                  <option value="CPF">CPF</option>
                  <option value="CNPJ">CNPJ</option>
                  <option value="Telefone">Telefone Celular</option>
                  <option value="E-mail">E-mail</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Chave PIX</label>
                <input 
                  type={withdrawData.type === 'E-mail' ? 'email' : 'text'}
                  value={withdrawData.key}
                  onChange={(e) => setWithdrawData({ ...withdrawData, key: handleMask(e.target.value, withdrawData.type) })}
                  placeholder={`Digite seu ${withdrawData.type}`}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Valor a Sacar (R$)</label>
                <input 
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={rawBalance}
                  value={withdrawData.amount}
                  onChange={(e) => setWithdrawData({ ...withdrawData, amount: e.target.value })}
                  placeholder={`Mínimo R$ 0,01. Máximo R$ ${rawBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={withdrawing || rawBalance <= 0}
                  className="flex-1 flex justify-center items-center py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
                >
                  {withdrawing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Solicitar Saque'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
