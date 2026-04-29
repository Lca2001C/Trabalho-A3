import React, { useState, useEffect } from 'react';
import { HeartHandshake, QrCode, CreditCard, Receipt, CircleDollarSign, Search, Loader2 } from 'lucide-react';
import api from '../../services/api';

export default function OngDonationsView() {
  const [donationFilter, setDonationFilter] = useState('Todos');
  const [donationSearch, setDonationSearch] = useState('');
  const [donationsList, setDonationsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/donations/institution/received')
      .then(res => setDonationsList(res.data.doacoes || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredDonations = donationsList.filter(donation => {
    // Esconder saques (valores negativos)
    if (donation.tipo === 'financeira' && (donation.valor || 0) < 0) return false;

    // Filtros de busca e abas
    const matchesFilter = donationFilter === 'Todos' || donation.tipo === donationFilter.toLowerCase();
    const donorName = donation.user?.nome || 'Anônimo';
    const matchesSearch = donorName.toLowerCase().includes(donationSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalAmount = filteredDonations.reduce((acc, curr) => curr.tipo === 'financeira' ? acc + (curr.valor || 0) : acc, 0);
  const pixCount = donationsList.filter(d => d.tipo === 'financeira' && (d.valor || 0) > 0).length;
  const itemCount = donationsList.filter(d => d.tipo === 'item').length;

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const getMethodIcon = (method) => {
    switch(method) {
      case 'PIX': return <QrCode className="w-5 h-5 text-teal-600" />;
      case 'Cartão de Crédito': return <CreditCard className="w-5 h-5 text-blue-600" />;
      case 'Boleto': return <Receipt className="w-5 h-5 text-orange-600" />;
      default: return <CircleDollarSign className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-green-600" /> Doações Recebidas
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-600 text-white p-5 rounded-2xl shadow-sm">
          <p className="text-sm text-green-100 mb-1">Total Filtrado (Financeiro)</p>
          <h3 className="text-2xl font-bold">{loading ? '...' : formatCurrency(totalAmount)}</h3>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center">
            <CircleDollarSign className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Financeiras</p>
            <h3 className="text-lg font-bold text-gray-800">{loading ? '...' : pixCount} doações</h3>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
            <Receipt className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Itens / Diversos</p>
            <h3 className="text-lg font-bold text-gray-800">{loading ? '...' : itemCount} doações</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex bg-gray-50 p-1 rounded-xl w-full md:w-auto">
            {['Todos', 'Financeira', 'Item'].map((tab) => (
              <button 
                key={tab} 
                onClick={() => setDonationFilter(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex-1 md:flex-none ${
                  donationFilter === tab 
                    ? 'bg-white text-green-700 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Buscar doador..." 
              value={donationSearch}
              onChange={(e) => setDonationSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Doador</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Método</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto text-green-600" /></td>
                </tr>
              ) : filteredDonations.length > 0 ? (
                filteredDonations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 font-medium text-gray-800">{donation.user?.nome || 'Anônimo'}</td>
                    <td className="py-4 px-4 font-semibold text-gray-900">
                      {donation.tipo === 'financeira' ? formatCurrency(donation.valor) : donation.item}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {donation.tipo === 'financeira' ? getMethodIcon('PIX') : <Receipt className="w-5 h-5 text-gray-400" />}
                        <span className="text-sm text-gray-600 capitalize">{donation.tipo}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-500">{new Date(donation.criadoEm).toLocaleDateString('pt-BR')}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        donation.status === 'entregue' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {donation.status === 'entregue' ? 'Concluído' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">Nenhuma doação encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
